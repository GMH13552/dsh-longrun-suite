/**
 * dsh-mission-control — host half.
 *
 * Registers the model-facing mission tools into the host `tools` registry.
 * This is HOST-plane: once composed into a profile, every agent (on any
 * preset) can use mission tools. The preset is what supplies the Captain
 * persona and the protocol skills that tell the model HOW to use these tools.
 *
 * The implementation intentionally keeps the kernel small:
 *   - state lives in <workspace>/.mission/<missionId>/mission.json
 *   - task statuses are open / active / needs_review / accepted / rejected
 *   - every task carries its own acceptance + verificationPlan
 *   - no domain-specific workflow is hardcoded here
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, isAbsolute, resolve } from 'node:path'
import {
  createMission,
  appendGoal,
  addTasks,
  claimTask,
  updateTask,
  submitTask,
  reviewTask,
  replan,
  finalAudit,
  completeMission,
  checkMission,
  statusText,
} from './core.js'

export const name = 'dsh-mission-control'
export const inject = ['tools']

function cwdOf(exec) {
  return exec?.agent?.session?.header?.cwd ?? process.cwd()
}

function missionRoot(cwd) {
  return join(cwd, '.mission')
}

function latestFile(cwd) {
  return join(missionRoot(cwd), 'latest.json')
}

function missionDir(cwd, missionId) {
  return join(missionRoot(cwd), missionId)
}

function missionFile(cwd, missionId) {
  return join(missionDir(cwd, missionId), 'mission.json')
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf8')
}

function loadLatestMission(cwd) {
  const latest = latestFile(cwd)
  if (!existsSync(latest)) {
    throw new Error('No mission found in this workspace. Start one with mission_start.')
  }
  const { missionId } = readJson(latest)
  return loadMission(cwd, missionId)
}

function loadMission(cwd, missionId) {
  const file = missionFile(cwd, missionId)
  if (!existsSync(file)) {
    throw new Error(`Mission not found: ${missionId}`)
  }
  return readJson(file)
}

function saveMission(cwd, mission) {
  const file = missionFile(cwd, mission.id)
  writeJson(file, mission)
  writeJson(latestFile(cwd), { missionId: mission.id, updatedAt: Date.now() })
  return mission
}

function requireMissionId(args, cwd) {
  if (args.mission_id) return loadMission(cwd, args.mission_id)
  return loadLatestMission(cwd)
}

function textOutput(value) {
  return {
    schema: { type: 'string' },
    render: (_args, v) => [{ type: 'text', text: v }],
  }
}

function evidencePathExists(cwd, missionId, p) {
  if (!p || typeof p !== 'string') return false
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p)) return true // URL evidence is accepted as a reference
  const abs = isAbsolute(p) ? p : resolve(missionDir(cwd, missionId), p)
  return existsSync(abs)
}

function verifyFinalAuditEvidence(cwd, mission) {
  const audit = mission.finalAudit
  if (!audit) return audit
  const gaps = [...(audit.gaps || [])]
  for (const row of audit.mapping || []) {
    for (const p of row.evidencePaths || []) {
      if (!evidencePathExists(cwd, mission.id, p)) {
        gaps.push(`evidence path missing for criterion #${row.criterionIndex} task ${row.taskId}: ${p}`)
      }
    }
  }
  audit.gaps = [...new Set(gaps)]
  audit.passed = audit.gaps.length === 0
  return audit
}

export function apply(ctx) {
  // ── mission_start ─────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_start',
    description: 'Start a new mission in the current workspace. A mission is a durable long-running goal with success criteria; tasks are added later with mission_add_tasks.',
    parameters: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'The mission goal, stated precisely.' },
        success_criteria: { type: 'array', items: { type: 'string' }, description: 'Verifiable final success criteria. At least one is required.' },
        title: { type: 'string', description: 'Optional short mission title.' },
        mission_id: { type: 'string', description: 'Optional stable id (lowercase letters/digits/hyphens).' },
        budget: { type: 'object', description: 'Optional { maxRounds?: number, maxHours?: number }.' },
        termination_policy: { type: 'string', enum: ['success', 'budget-or-success'], description: 'How the mission may end. "success" (default) refuses completion unless every mapped task has outcome=success. "budget-or-success" allows a partial report after the budget is exhausted.' },
      },
      required: ['goal', 'success_criteria'],
      additionalProperties: false,
    },
    output: textOutput('mission_start result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      // The model-facing schema is snake_case; core.js is camelCase.
      // Map explicitly so no future schema edit can silently drop a field.
      const mission = createMission({
        goal: args.goal,
        successCriteria: args.success_criteria,
        title: args.title,
        budget: args.budget,
        missionId: args.mission_id,
        terminationPolicy: args.termination_policy,
      })
      saveMission(cwd, mission)
      return `Mission created: ${mission.id}\n\n${statusText(mission)}`
    },
  })

  // ── mission_status ────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_status',
    description: 'Show the current mission state: goals, success criteria, task lifecycle, reviews, and final audit status.',
    parameters: {
      type: 'object',
      properties: {
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission in this workspace.' },
      },
      additionalProperties: false,
    },
    output: textOutput('mission_status result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      return statusText(mission)
    },
  })

  // ── mission_append_goal ───────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_append_goal',
    description: 'Append a new goal or success criterion to an active mission. This is how the user can add new work mid-mission; the captain should replan afterward.',
    parameters: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'The new goal or success criterion to append.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['goal'],
      additionalProperties: false,
    },
    output: textOutput('mission_append_goal result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      appendGoal(mission, args.goal)
      saveMission(cwd, mission)
      return `Goal appended. Current success criteria:\n${mission.successCriteria.map((c, i) => `- [${i}] ${c}`).join('\n')}`
    },
  })

  // ── mission_add_tasks ─────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_add_tasks',
    description: 'Add one or more tasks to the mission. Each task carries its own acceptance criteria and verificationPlan. The DAG is live: tasks can be added at any time.',
    parameters: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Optional task id.' },
              title: { type: 'string', description: 'Task title.' },
              acceptance: { type: 'array', items: { type: 'string' }, description: 'Acceptance criteria that must be satisfied before review.' },
              dependencies: { type: 'array', items: { type: 'string' }, description: 'Task ids that must be accepted first.' },
              assignee: { type: 'string', description: 'Planned executor role (e.g. researcher / engineer / reviewer / final_reviewer). Default substantive work to a subagent; captain only for bookkeeping/synthesis.' },
              kind: { type: 'string', enum: ['research', 'engineering', 'review', 'deliverable-style', 'synthesis', 'bookkeeping', 'coordination'], description: 'Generic task kind. The plugin rejects captain assignee for research/engineering/review/deliverable-style.' },
              replaces: { type: 'string', description: 'Optional id of a rejected task this new task supersedes. The rejected task will be marked superseded and can no longer block completion.' },
              verificationPlan: {
                type: 'object',
                description: 'Domain-specific verification plan. Suggested fields: kind, requiredEvidence[], checkCommand, reviewerInstruction. The framework treats this as opaque data.',
              },
            },
            required: ['title', 'acceptance', 'kind'],
            additionalProperties: true,
          },
        },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['tasks'],
      additionalProperties: false,
    },
    output: textOutput('mission_add_tasks result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const ids = addTasks(mission, args.tasks)
      saveMission(cwd, mission)
      return `Added tasks: ${ids.join(', ')}\n\n${statusText(mission)}`
    },
  })

  // ── mission_update_task ───────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_update_task',
    description: 'Update a non-accepted task: rewire dependencies, replace acceptance criteria, or change its verificationPlan. Use this after a rejection to repoint dependent tasks to a replacement task.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Task id to update.' },
        title: { type: 'string', description: 'Optional new title.' },
        dependencies: { type: 'array', items: { type: 'string' }, description: 'Optional new dependency task ids.' },
        acceptance: { type: 'array', items: { type: 'string' }, description: 'Optional new acceptance criteria.' },
        verification_plan: { type: 'object', description: 'Optional new verificationPlan.' },
        kind: { type: 'string', enum: ['research', 'engineering', 'review', 'deliverable-style', 'synthesis', 'bookkeeping', 'coordination'], description: 'Optional new task kind.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['task_id'],
      additionalProperties: false,
    },
    output: textOutput('mission_update_task result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      updateTask(mission, args.task_id, {
        title: args.title,
        dependencies: args.dependencies,
        acceptance: args.acceptance,
        verificationPlan: args.verification_plan,
        kind: args.kind,
      })
      saveMission(cwd, mission)
      return `Updated ${args.task_id}\n\n${statusText(mission)}`
    },
  })

  // ── mission_claim ─────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_claim',
    description: 'Claim a task before working on it. Dependencies must already be accepted.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Task id.' },
        assignee: { type: 'string', description: 'Who is doing the work (defaults to "captain").' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['task_id'],
      additionalProperties: false,
    },
    output: textOutput('mission_claim result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      claimTask(mission, args.task_id, args.assignee)
      saveMission(cwd, mission)
      return `Claimed ${args.task_id}`
    },
  })

  // ── mission_submit ────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_submit',
    description: 'Submit evidence for an active task. Evidence is a list of paths (relative to .mission/<id>/ or absolute), URLs, or {path, kind, description} objects. After submit the task enters needs_review.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Task id.' },
        evidence: { type: 'array', description: 'Evidence paths / URLs / objects. Must be non-empty.' },
        result: { type: 'object', description: 'Optional structured result (metrics, summary, etc.).' },
        outcome: { type: 'string', description: 'What this task actually achieved: success, partial, failed, unknown, or any domain label. With terminationPolicy=success, completion requires outcome=success on every mapped task.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['task_id', 'evidence'],
      additionalProperties: false,
    },
    output: textOutput('mission_submit result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const { taskId, attemptId } = submitTask(mission, args.task_id, args.evidence, args.result, args.outcome)
      saveMission(cwd, mission)
      return `Submitted ${taskId} (attempt ${attemptId}). It now needs an independent review.`
    },
  })

  // ── mission_review ────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_review',
    description: 'Record an independent review verdict for a needs_review task. Self-review is rejected: reviewer must differ from the task assignee. A pass verdict also checks that every requiredEvidence declared in verificationPlan is present.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Task id.' },
        verdict: { type: 'string', enum: ['pass', 'reject'], description: 'pass or reject.' },
        reviewer: { type: 'string', description: 'Reviewer identity (should be a spawned subagent name/id, never the assignee).' },
        report_path: { type: 'string', description: 'Optional path to the review report.' },
        gap: { type: 'string', description: 'Required for reject: the precise gap that blocked acceptance.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['task_id', 'verdict', 'reviewer'],
      additionalProperties: false,
    },
    output: textOutput('mission_review result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      if (args.verdict === 'reject' && (!args.gap || String(args.gap).trim() === '')) {
        throw new Error('reject requires a precise gap describing what blocked acceptance')
      }
      reviewTask(mission, args.task_id, {
        verdict: args.verdict,
        reviewer: args.reviewer,
        reportPath: args.report_path,
        gap: args.gap,
      })
      saveMission(cwd, mission)
      // Let other host plugins (timer-scheduler) clean up stale reminders for
      // a task that has now settled (accepted or rejected).
      ctx.emit('mission/task-settled', {
        taskId: args.task_id,
        missionId: mission.id,
        verdict: args.verdict,
        sessionId: exec.agent.id,
        cwd,
      })
      if (args.verdict === 'reject') {
        return `Review recorded for ${args.task_id}: reject by ${args.reviewer}\nGap: ${args.gap}\n\nThis task is now blocked. You must replan and add a follow-up task with replaces=${args.task_id} before the mission can be completed. Do not stop here: generate a new direction, fix the gap, or broaden the approach.`
      }
      return `Review recorded for ${args.task_id}: pass by ${args.reviewer}`
    },
  })

  // ── mission_replan ────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_replan',
    description: 'Record a replan and return the current task summary. The captain is free to add/remove/reprioritize tasks, change dependencies, or redirect directions. This tool intentionally performs no magic; it only marks that a replan happened and shows state.',
    parameters: {
      type: 'object',
      properties: {
        note: { type: 'string', description: 'What changed and why.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      additionalProperties: false,
    },
    output: textOutput('mission_replan result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const summary = replan(mission, args.note)
      saveMission(cwd, mission)
      return `Replan recorded.\n\n${statusText(mission)}`
    },
  })

  // ── mission_final_audit ───────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_final_audit',
    description: 'Run the final audit. You must supply a mapping from each success_criteria index to an accepted task and its evidence paths. The audit fails if any criterion is unmapped, any mapped task is not accepted, or any evidence path does not exist.',
    parameters: {
      type: 'object',
      properties: {
        mapping: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              criterionIndex: { type: 'number', description: 'Index into mission.successCriteria.' },
              taskId: { type: 'string', description: 'Accepted task id.' },
              evidencePaths: { type: 'array', items: { type: 'string' }, description: 'Evidence paths that satisfy this criterion.' },
            },
            required: ['criterionIndex', 'taskId', 'evidencePaths'],
            additionalProperties: false,
          },
        },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['mapping'],
      additionalProperties: false,
    },
    output: textOutput('mission_final_audit result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      finalAudit(mission, args.mapping)
      verifyFinalAuditEvidence(cwd, mission)
      saveMission(cwd, mission)
      const audit = mission.finalAudit
      const lines = [
        `Final audit: ${audit.passed ? 'PASS' : 'BLOCKED'}`,
        ...(audit.gaps.length ? [`Gaps:\n${audit.gaps.map((g) => `- ${g}`).join('\n')}`] : []),
      ]
      return lines.join('\n')
    },
  })

  // ── mission_complete ──────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_complete',
    description: 'Mark the mission completed. Only allowed after mission_final_audit has passed.',
    parameters: {
      type: 'object',
      properties: {
        report_path: { type: 'string', description: 'Optional path to the final report artifact.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      additionalProperties: false,
    },
    output: textOutput('mission_complete result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      completeMission(mission, args.report_path)
      saveMission(cwd, mission)
      return `Mission ${mission.id} completed.\n\n${statusText(mission)}`
    },
  })

  // ── mission_check ─────────────────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_check',
    description: 'Run structural evidence checks on the current mission. Returns a pass/fail list. This is the meta-validator: it checks evidence honesty, not domain correctness.',
    parameters: {
      type: 'object',
      properties: {
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      additionalProperties: false,
    },
    output: textOutput('mission_check result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const result = checkMission(mission)
      if (result.ok) return `mission_check: PASS\n\n${statusText(mission)}`
      return `mission_check: FAIL\n${result.errors.map((e) => `- ${e}`).join('\n')}`
    },
  })
}
