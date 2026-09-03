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
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
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
  heartbeatTask,
  releaseTask,
  DEFAULT_LEASE_SECONDS,
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

function evidenceSha256(cwd, missionId, p) {
  if (!p || typeof p !== 'string') return null
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p)) return null
  const abs = isAbsolute(p) ? p : resolve(missionDir(cwd, missionId), p)
  if (!existsSync(abs)) return null
  try {
    return createHash('sha256').update(readFileSync(abs)).digest('hex')
  } catch {
    return null
  }
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
    description: 'Claim a task before working on it. Dependencies must already be accepted. Supports worker lease, capability matching, heartbeat, and release via mission_heartbeat / mission_release.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Task id.' },
        assignee: { type: 'string', description: 'Who is doing the work (defaults to "captain").' },
        worker: { type: 'string', description: 'Optional worker id; defaults to assignee. Used for lease ownership.' },
        capabilities: { type: 'array', items: { type: 'string' }, description: 'Worker capabilities; must cover task.capabilities when set.' },
        lease_seconds: { type: 'number', description: 'Lease duration in seconds; default 7200.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to the latest mission.' },
      },
      required: ['task_id'],
      additionalProperties: false,
    },
    output: textOutput('mission_claim result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const leaseSeconds = Number.isFinite(args.lease_seconds) ? args.lease_seconds : DEFAULT_LEASE_SECONDS
      const task = claimTask(mission, args.task_id, args.assignee, {
        worker: args.worker,
        capabilities: args.capabilities,
        leaseSeconds,
      })
      saveMission(cwd, mission)
      return `Claimed ${args.task_id} by ${task.claimedBy}; lease expires ${new Date(task.leaseExpiresAt).toISOString()}; attempts=${task.claimAttempts}`
    },
  })

// ── mission_heartbeat / mission_release ────────────────────────────────
  ctx.tools.register({
    name: 'mission_heartbeat',
    description: 'Extend a claimed task lease. Use for long-running work so the lease does not expire and the task is reclaimed by another worker.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Claimed task id.' },
        worker: { type: 'string', description: 'Owner id used at claim time.' },
        lease_seconds: { type: 'number', description: 'New lease duration in seconds; default 7200.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to latest.' },
      },
      required: ['task_id', 'worker'],
      additionalProperties: false,
    },
    output: textOutput('mission_heartbeat result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const leaseSeconds = Number.isFinite(args.lease_seconds) ? args.lease_seconds : DEFAULT_LEASE_SECONDS
      const task = heartbeatTask(mission, args.task_id, args.worker, leaseSeconds)
      saveMission(cwd, mission)
      return `Heartbeated ${args.task_id}; new lease expires ${new Date(task.leaseExpiresAt).toISOString()}`
    },
  })

  ctx.tools.register({
    name: 'mission_release',
    description: 'Release a claimed task back to open, clearing the lease so another worker can claim it. Use when you cannot finish.',
    parameters: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'Claimed task id.' },
        worker: { type: 'string', description: 'Owner id used at claim time.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to latest.' },
      },
      required: ['task_id', 'worker'],
      additionalProperties: false,
    },
    output: textOutput('mission_release result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      releaseTask(mission, args.task_id, args.worker)
      saveMission(cwd, mission)
      return `Released ${args.task_id} back to open`
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
      const submittedTask = mission.tasks.find((t) => t.id === taskId)
      const latestAttempt = submittedTask?.attempts?.find((a) => a.attemptId === attemptId)
      if (latestAttempt) {
        latestAttempt.receipt = {
          attemptId,
          at: latestAttempt.at,
          evidenceHashes: (latestAttempt.evidence || []).map((e) => {
            const p = typeof e === 'string' ? e : (e && typeof e === 'object' ? e.path : '')
            return { path: p || null, sha256: p ? evidenceSha256(cwd, mission.id, p) : null }
          }).filter((x) => x.sha256),
        }
      }
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
      const reviewedTask = mission.tasks.find((t) => t.id === args.task_id)
      if (args.verdict === 'pass' && reviewedTask) {
        const latestAttempt = reviewedTask.attempts[reviewedTask.attempts.length - 1]
        reviewedTask.workReceipt = {
          taskId: args.task_id,
          attemptId: latestAttempt?.attemptId || null,
          reviewer: args.reviewer,
          verdict: 'pass',
          at: Date.now(),
          evidenceHashes: latestAttempt?.receipt?.evidenceHashes || [],
        }
      }
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

// ── blind review toolchain ─────────────────────────────────────────────
  ctx.tools.register({
    name: 'mission_blind_review',
    description: 'Record a no-memory blind review of a deliverable. Supply the submission path, the pre-recorded self rating, external avg_rating/n_reviews/decision/top_weaknesses. Writes blind_review.md at the workspace root and stores calibration_gap on the mission.',
    parameters: {
      type: 'object',
      properties: {
        submission_path: { type: 'string', description: 'Path to the dehydrated submission/deliverable the blind reviewer saw.' },
        self_rating: { type: 'number', description: 'Producer/Captain claimed rating 1-10, recorded before blind review.' },
        avg_rating: { type: 'number', description: 'Average external blind-review rating 1-10.' },
        n_reviews: { type: 'integer', description: 'Number of independent external reviews.' },
        decision: { type: 'string', enum: ['accept', 'borderline', 'reject'], description: 'External decision.' },
        top_weaknesses: { type: 'array', items: { type: 'string' }, description: 'Top weaknesses from the blind review.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to latest.' },
      },
      required: ['submission_path', 'avg_rating', 'n_reviews', 'decision'],
      additionalProperties: false,
    },
    output: textOutput('mission_blind_review result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const mission = requireMissionId(args, cwd)
      const selfRating = Number.isFinite(args.self_rating) ? args.self_rating : null
      const avg = Number(args.avg_rating)
      if (!Number.isFinite(avg) || avg < 1 || avg > 10) throw new Error('avg_rating must be 1-10')
      const n = Math.max(1, Math.floor(Number(args.n_reviews) || 1))
      const gap = selfRating !== null ? Number((selfRating - avg).toFixed(1)) : null
      const report = `# Blind Review\n\n- submission: ${args.submission_path}\n- avg_rating: ${avg}\n- n_reviews: ${n}\n- decision: ${args.decision}\n- self_claimed_rating: ${selfRating === null ? 'none' : selfRating}\n- calibration_gap: ${gap === null ? 'none' : gap}\n- top_weaknesses:\n${(args.top_weaknesses || []).map((w) => `  - ${w}`).join('\n')}\n`
      const file = join(cwd, 'blind_review.md')
      writeFileSync(file, report, 'utf8')
      mission.blindReview = {
        submissionPath: args.submission_path,
        avgRating: avg,
        nReviews: n,
        decision: args.decision,
        selfRating,
        calibrationGap: gap,
        topWeaknesses: args.top_weaknesses || [],
        at: Date.now(),
      }
      saveMission(cwd, mission)
      return `Blind review recorded.\navg_rating=${avg} n_reviews=${n} decision=${args.decision} calibration_gap=${gap === null ? 'none' : gap}\n${report}`
    },
  })

  // ── LLM Wiki tools (lightweight, file-based) ───────────────────────────
  function memoryRoot(cwd) {
    return join(cwd, '.memory')
  }

  function ensureMemory(cwd) {
    const root = memoryRoot(cwd)
    for (const dir of ['', 'methods', 'pitfalls', 'decisions', 'missions', 'workers']) {
      mkdirSync(join(root, dir), { recursive: true })
    }
  }

  function slugify(title) {
    return String(title).trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'page'
  }

  function listMdFiles(dir, out = []) {
    if (!existsSync(dir)) return out
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      const st = statSync(full)
      if (st.isDirectory()) listMdFiles(full, out)
      else if (name.endsWith('.md')) out.push(full)
    }
    return out
  }

  ctx.tools.register({
    name: 'wiki_write',
    description: 'Create or update a page in .memory/. Before writing, scan/search existing pages to avoid duplication and find [[slug]] targets. One page = one coherent topic. Add a summary, domain:<x> tag, and cross-links.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Page title.' },
        summary: { type: 'string', description: 'One-line summary shown in index.' },
        content: { type: 'string', description: 'Markdown body with [[slug]] cross-links.' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags; include one domain:<x> when non-daily.' },
        category: { type: 'string', enum: ['methods', 'pitfalls', 'decisions', 'missions', 'workers', '_capabilities'], description: 'Optional category. _capabilities writes root .memory/_capabilities.md; workers writes .memory/workers/. Defaults to methods.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to latest.' },
      },
      required: ['title', 'content', 'summary'],
      additionalProperties: false,
    },
    output: textOutput('wiki_write result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      ensureMemory(cwd)
      const slug = slugify(args.title)
      const category = args.category && ['methods','pitfalls','decisions','missions','workers'].includes(args.category) ? args.category : 'methods'
      const file = category === '_capabilities'
        ? join(memoryRoot(cwd), '_capabilities.md')
        : join(memoryRoot(cwd), category, `${slug}.md`)
      const tags = (args.tags || []).map(String)
      const body = `# ${args.title}\n\n- summary: ${args.summary}\n- tags: ${tags.join(', ')}\n\n${args.content}\n`
      writeFileSync(file, body, 'utf8')
      return `Wrote wiki page ${file}`
    },
  })

  ctx.tools.register({
    name: 'wiki_search',
    description: 'Search .memory/ by free text or domain tag. Returns matching page paths and first lines. Use before writing to avoid duplicates and find cross-links.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text query.' },
        domain: { type: 'string', description: 'Optional domain:<x> filter.' },
        limit: { type: 'integer', description: 'Max results, default 10.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to latest.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    output: textOutput('wiki_search result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const root = memoryRoot(cwd)
      if (!existsSync(root)) return 'No .memory directory yet.'
      const q = String(args.query).toLowerCase()
      const domain = args.domain ? String(args.domain).toLowerCase() : null
      const limit = Math.max(1, Math.min(30, Number(args.limit) || 10))
      const results = []
      for (const file of listMdFiles(root)) {
        const text = readFileSync(file, 'utf8')
        if (q && !text.toLowerCase().includes(q)) continue
        if (domain && !text.toLowerCase().includes(domain.toLowerCase())) continue
        const first = text.split('\n').slice(0, 8).join(' | ').slice(0, 200)
        results.push({ path: file, preview: first })
        if (results.length >= limit) break
      }
      return results.length ? results.map((r) => `${r.path}\n  ${r.preview}`).join('\n') : 'No matching wiki pages.'
    },
  })

  ctx.tools.register({
    name: 'wiki_lint',
    description: 'Scan .memory/ for maintenance issues: missing summaries, broken [[slug]] links, orphan pages. Returns findings only; no auto-fix.',
    parameters: {
      type: 'object',
      properties: {
        maxResults: { type: 'integer', description: 'Default 20, max 100.' },
        mission_id: { type: 'string', description: 'Optional mission id. Defaults to latest.' },
      },
      additionalProperties: false,
    },
    output: textOutput('wiki_lint result'),
    async execute(args, exec) {
      const cwd = cwdOf(exec)
      const root = memoryRoot(cwd)
      if (!existsSync(root)) return 'No .memory directory yet.'
      const files = listMdFiles(root)
      const max = Math.max(1, Math.min(100, Number(args.maxResults) || 20))
      const findings = []
      const capsFile = join(root, '_capabilities.md')
      if (!existsSync(capsFile)) findings.push('missing-capability-vocabulary: .memory/_capabilities.md')
      for (const file of files.filter((f) => f.includes('/workers/'))) {
        const text = readFileSync(file, 'utf8')
        if (!/capabilities:/i.test(text)) findings.push(`missing-worker-capabilities: ${file}`)
      }
      const slugs = new Set(files.map((f) => f.replace(root + '/', '')))
      for (const file of files) {
        const text = readFileSync(file, 'utf8')
        if (!/summary:/i.test(text)) findings.push(`missing-summary: ${file}`)
        const links = [...text.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1].replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-'))
        for (const slug of links) {
          const exists = files.some((f) => f === `${root}/${slug}.md` || f.endsWith(`/${slug}.md`))
          if (!exists) findings.push(`broken-link: ${file} -> [[${slug}]]`)
        }
        if (findings.length >= max) break
      }
      return findings.length ? findings.slice(0, max).join('\n') : 'wiki_lint: clean'
    },
  })
}
