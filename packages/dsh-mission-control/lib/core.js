/**
 * dsh-mission-control / core
 *
 * Pure mission logic. No DSH/Cordis imports, no filesystem access, no domain
 * assumptions. This is the "minimum kernel":
 *
 *   - four lifecycle statuses: open / active / needs_review / accepted / rejected
 *   - every task carries its own acceptance criteria + verificationPlan
 *   - a task can only become accepted through an independent review verdict
 *   - final completion requires an explicit success-criteria -> evidence mapping
 *
 * The framework does NOT know what a "good experiment", "valid proof", or
 * "clean code review" is. Those live in the task's verificationPlan and are
 * enforced by the captain + reviewer + optional checkCommand.
 */

export const TASK_STATUSES = ['open', 'active', 'needs_review', 'accepted', 'rejected']

/** Generic task kinds. The framework does not interpret these; it only uses
 * them to keep substantive work from being silently claimed by the Captain.
 * `synthesis`, `bookkeeping`, and `coordination` are Captain-allowed;
 * every other kind must be assigned to a role subagent. */
export const TASK_KINDS = ['research', 'engineering', 'review', 'deliverable-style', 'synthesis', 'bookkeeping', 'coordination']

export const MAX_CLAIM_ATTEMPTS = 3
export const DEFAULT_LEASE_SECONDS = 7200

export function isCaptainAllowedKind(kind) {
  return kind === 'synthesis' || kind === 'bookkeeping' || kind === 'coordination'
}

export function createMission({ goal, successCriteria = [], success_criteria = null, title, budget = {}, missionId, terminationPolicy = 'success' }) {
  if (!Array.isArray(successCriteria) || successCriteria.length === 0) {
    successCriteria = Array.isArray(success_criteria) ? success_criteria : []
  }
  if (typeof goal !== 'string' || goal.trim() === '') {
    throw new Error('mission_start requires a non-empty goal string')
  }
  if (!Array.isArray(successCriteria) || successCriteria.length === 0) {
    throw new Error('mission_start requires at least one success_criteria entry')
  }
  if (terminationPolicy !== 'success' && terminationPolicy !== 'budget-or-success') {
    throw new Error('terminationPolicy must be "success" or "budget-or-success"')
  }
  const id = missionId && /^[a-z0-9][a-z0-9-]*$/i.test(missionId)
    ? missionId
    : `mission-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    title: title || goal.slice(0, 80),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active',
    goals: [goal],
    successCriteria: successCriteria.map(String),
    terminationPolicy,
    budget: {
      maxRounds: Number.isFinite(budget.maxRounds) ? budget.maxRounds : undefined,
      maxHours: Number.isFinite(budget.maxHours) ? budget.maxHours : undefined,
    },
    currentRound: 0,
    tasks: {},
    registry: {},
    journal: [],
    finalAudit: null,
    completedAt: null,
    reportPath: null,
  }
}

export function appendGoal(mission, goal) {
  if (typeof goal !== 'string' || goal.trim() === '') {
    throw new Error('appendGoal requires a non-empty goal string')
  }
  mission.goals.push(goal)
  mission.updatedAt = Date.now()
  journal(mission, 'goal-appended', goal)
  return mission
}

export function addTask(mission, task) {
  if (!task || typeof task.title !== 'string' || task.title.trim() === '') {
    throw new Error('each task requires a title')
  }
  if (!Array.isArray(task.acceptance) || task.acceptance.length === 0) {
    throw new Error(`task "${task.title}" requires at least one acceptance criterion`)
  }
  const verificationPlan = task.verificationPlan || {}
  if (!verificationPlan || typeof verificationPlan !== 'object') {
    throw new Error(`task "${task.title}" verificationPlan must be an object`)
  }
  const requiredEvidence = verificationPlan.requiredEvidence
  if (requiredEvidence !== undefined && !Array.isArray(requiredEvidence)) {
    throw new Error(`task "${task.title}" verificationPlan.requiredEvidence must be an array`)
  }
  const id = task.id && /^[a-z0-9][a-z0-9-]*$/i.test(task.id)
    ? task.id
    : nextTaskId(mission)
  if (mission.tasks[id]) {
    throw new Error(`task id already exists: ${id}`)
  }
  if (task.replaces !== undefined) {
    const old = mission.tasks[task.replaces]
    if (!old) throw new Error(`replaces references unknown task: ${task.replaces}`)
    if (old.status !== 'rejected') {
      throw new Error(`replaces target ${task.replaces} is ${old.status}; only rejected tasks can be superseded`)
    }
    old.supersededBy = id
    old.updatedAt = Date.now()
  }
  if (task.assignee !== undefined && task.assignee !== null) {
    if (typeof task.assignee !== 'string' || task.assignee.trim() === '') {
      throw new Error(`task "${task.title}" assignee must be a non-empty string when provided`)
    }
  }
  if (typeof task.kind !== 'string' || !TASK_KINDS.includes(task.kind)) {
    throw new Error(`task "${task.title}" requires kind, one of: ${TASK_KINDS.join(', ')}`)
  }
  if (task.assignee && task.assignee === 'captain' && !isCaptainAllowedKind(task.kind)) {
    throw new Error(`task "${task.title}" kind "${task.kind}" cannot be assigned to captain; use a role subagent`)
  }
  mission.tasks[id] = {
    id,
    title: String(task.title).trim(),
    status: 'open',
    kind: task.kind || null,
    assignee: task.assignee ? String(task.assignee).trim() : null,
    dependencies: Array.isArray(task.dependencies) ? task.dependencies.map(String) : [],
    capabilities: Array.isArray(task.capabilities) ? task.capabilities.map(String) : [],
    acceptance: task.acceptance.map(String),
    verificationPlan,
    attempts: [],
    review: null,
    replaces: task.replaces || null,
    claimedBy: null,
    claimedAt: null,
    leaseExpiresAt: null,
    claimAttempts: 0,
    leaseBlocked: false,
    blockedReason: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  mission.updatedAt = Date.now()
  journal(mission, 'task-added', id + (task.replaces ? ` replaces ${task.replaces}` : ''))
  return id
}

export function addTasks(mission, tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('mission_add_tasks requires a non-empty tasks array')
  }
  return tasks.map((task) => addTask(mission, task))
}

export function updateTask(mission, taskId, patch) {
  const task = requireTask(mission, taskId)
  if (task.status === 'accepted' || task.status === 'completed') {
    throw new Error(`task ${taskId} cannot be updated after acceptance`)
  }
  if (patch.title !== undefined) {
    if (typeof patch.title !== 'string' || patch.title.trim() === '') throw new Error('title must be a non-empty string')
    task.title = patch.title.trim()
  }
  if (patch.dependencies !== undefined) {
    if (!Array.isArray(patch.dependencies)) throw new Error('dependencies must be an array')
    for (const dep of patch.dependencies) {
      if (!mission.tasks[dep]) throw new Error(`dependency task not found: ${dep}`)
    }
    task.dependencies = patch.dependencies.map(String)
  }
  if (patch.acceptance !== undefined) {
    if (!Array.isArray(patch.acceptance) || patch.acceptance.length === 0) {
      throw new Error('acceptance must be a non-empty array')
    }
    task.acceptance = patch.acceptance.map(String)
  }
  if (patch.verificationPlan !== undefined) {
    if (!patch.verificationPlan || typeof patch.verificationPlan !== 'object') {
      throw new Error('verificationPlan must be an object')
    }
    task.verificationPlan = patch.verificationPlan
  }
  if (patch.kind !== undefined) {
    if (typeof patch.kind !== 'string' || !TASK_KINDS.includes(patch.kind)) {
      throw new Error(`kind must be one of: ${TASK_KINDS.join(', ')}`)
    }
    if (task.assignee === 'captain' && !isCaptainAllowedKind(patch.kind)) {
      throw new Error(`cannot change task ${taskId} to kind "${patch.kind}" while assigned to captain`)
    }
    task.kind = patch.kind
  }
  task.updatedAt = Date.now()
  mission.updatedAt = Date.now()
  journal(mission, 'task-updated', taskId)
  return task
}

export function reclaimExpiredLeases(mission) {
  const now = Date.now()
  const reclaimed = []
  for (const task of Object.values(mission.tasks)) {
    if (task.status !== 'active' || !task.claimedBy || !task.leaseExpiresAt) continue
    if (task.leaseExpiresAt > now) continue
    const lost = task.claimedBy
    task.claimedBy = null
    task.claimAttempts = Number(task.claimAttempts || 0) + 1
    task.leaseExpiresAt = null
    task.claimedAt = null
    if (task.claimAttempts >= MAX_CLAIM_ATTEMPTS) {
      task.leaseBlocked = true
      task.blockedReason = `reclaimed_${task.claimAttempts}_times_last_worker=${lost}`
      task.status = 'open'
      journal(mission, 'task-blocked', `${task.id} reason=${task.blockedReason}`)
    } else {
      task.status = 'open'
      journal(mission, 'task-reclaimed', `${task.id} lost_worker=${lost} attempts=${task.claimAttempts}`)
    }
    reclaimed.push(task.id)
  }
  return reclaimed
}

function capabilityGap(task, workerCapabilities) {
  const caps = Array.isArray(task.capabilities) ? task.capabilities : []
  if (caps.length === 0) return null
  const have = new Set(Array.isArray(workerCapabilities) ? workerCapabilities : [])
  const missing = caps.filter((c) => !have.has(c))
  return missing.length > 0 ? missing : null
}

export function claimTask(mission, taskId, assignee, options = {}) {
  const worker = options.worker || assignee || 'captain'
  const leaseSeconds = Number.isFinite(options.leaseSeconds) ? options.leaseSeconds : DEFAULT_LEASE_SECONDS
  reclaimExpiredLeases(mission)
  const task = requireTask(mission, taskId)
  if (task.leaseBlocked) {
    throw new Error(`task ${taskId} is lease-blocked: ${task.blockedReason || 'too many reclaims'}`)
  }
  if (task.status !== 'open') {
    throw new Error(`task ${taskId} cannot be claimed from status ${task.status}`)
  }
  const unsatisfied = unsatisfiedDependencies(mission, task)
  if (unsatisfied.length > 0) {
    throw new Error(`task ${taskId} dependencies not accepted: ${unsatisfied.join(', ')}`)
  }
  if (task.assignee && assignee && assignee !== task.assignee) {
    throw new Error(`task ${taskId} was planned for assignee "${task.assignee}", cannot claim as "${assignee}"`)
  }
  const finalAssignee = task.assignee || assignee || 'captain'
  if (task.kind && !isCaptainAllowedKind(task.kind) && finalAssignee === 'captain') {
    throw new Error(`task ${taskId} kind "${task.kind}" cannot be claimed by captain; use a role subagent`)
  }
  const gap = capabilityGap(task, options.capabilities)
  if (gap) {
    throw new Error(`task ${taskId} requires capabilities [${gap.join(', ')}]; worker lacks them`)
  }
  const now = Date.now()
  task.status = 'active'
  task.assignee = finalAssignee
  task.claimedBy = worker
  task.claimedAt = now
  task.leaseExpiresAt = now + leaseSeconds * 1000
  task.claimAttempts = Number(task.claimAttempts || 0) + 1
  task.updatedAt = now
  mission.updatedAt = now
  journal(mission, 'task-claimed', `${taskId} -> ${worker} lease=${leaseSeconds}s attempt=${task.claimAttempts}`)
  return task
}

export function heartbeatTask(mission, taskId, worker, leaseSeconds = DEFAULT_LEASE_SECONDS) {
  const task = requireTask(mission, taskId)
  if (task.status !== 'active') throw new Error(`task ${taskId} can only be heartbeated while active (current: ${task.status})`)
  if (task.claimedBy !== worker) throw new Error(`task ${taskId} claim lost: holder is ${task.claimedBy}`)
  const now = Date.now()
  task.leaseExpiresAt = now + leaseSeconds * 1000
  task.updatedAt = now
  mission.updatedAt = now
  journal(mission, 'task-heartbeat', `${taskId} worker=${worker}`)
  return task
}

export function releaseTask(mission, taskId, worker) {
  const task = requireTask(mission, taskId)
  if (task.status !== 'active') throw new Error(`task ${taskId} can only be released while active (current: ${task.status})`)
  if (task.claimedBy !== worker) throw new Error(`task ${taskId} claim lost: holder is ${task.claimedBy}`)
  task.status = 'open'
  task.claimedBy = null
  task.leaseExpiresAt = null
  task.claimedAt = null
  task.updatedAt = Date.now()
  mission.updatedAt = Date.now()
  journal(mission, 'task-released', `${taskId} worker=${worker}`)
  return task
}


export function submitTask(mission, taskId, evidence, result, outcome) {
  const task = requireTask(mission, taskId)
  if (task.status !== 'active') {
    throw new Error(`task ${taskId} can only submit from status active (current: ${task.status})`)
  }
  const evidenceList = normalizeEvidence(evidence)
  if (evidenceList.length === 0) {
    throw new Error(`task ${taskId} submit requires at least one evidence entry`)
  }
  if (outcome !== undefined && typeof outcome !== 'string') {
    throw new Error('outcome must be a string (e.g. success, partial, failed, unknown)')
  }
  const attemptId = `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  task.attempts.push({
    attemptId,
    at: Date.now(),
    assignee: task.assignee,
    evidence: evidenceList,
    result: result ?? null,
    outcome: outcome ?? null,
  })
  task.status = 'needs_review'
  task.updatedAt = Date.now()
  mission.updatedAt = Date.now()
  journal(mission, 'task-submitted', `${taskId} attempt ${attemptId}`)
  return { taskId, attemptId }
}

export function reviewTask(mission, taskId, { verdict, reviewer, reportPath, gap }) {
  const task = requireTask(mission, taskId)
  if (task.status !== 'needs_review') {
    throw new Error(`task ${taskId} can only be reviewed from status needs_review (current: ${task.status})`)
  }
  if (verdict !== 'pass' && verdict !== 'reject') {
    throw new Error('review verdict must be "pass" or "reject"')
  }
  if (typeof reviewer !== 'string' || reviewer.trim() === '') {
    throw new Error('review requires a reviewer name')
  }
  if (task.assignee && reviewer === task.assignee) {
    throw new Error('self-review is forbidden: reviewer must differ from the task assignee')
  }
  if (verdict === 'reject' && (!gap || String(gap).trim() === '')) {
    throw new Error('reject requires a precise gap describing what blocked acceptance')
  }
  const latestAttempt = task.attempts[task.attempts.length - 1]
  if (!latestAttempt) {
    throw new Error(`task ${taskId} has no attempt to review`)
  }
  if (verdict === 'pass') {
    const missing = missingRequiredEvidence(task, latestAttempt)
    if (missing.length > 0) {
      throw new Error(`task ${taskId} cannot pass: missing required evidence: ${missing.join(', ')}`)
    }
  }
  task.review = {
    reviewer,
    verdict,
    reportPath: reportPath || null,
    gap: gap || null,
    at: Date.now(),
  }
  if (verdict === 'pass') {
    task.outcome = latestAttempt.outcome
  }
  task.status = verdict === 'pass' ? 'accepted' : 'rejected'
  task.updatedAt = Date.now()
  mission.updatedAt = Date.now()
  mission.currentRound += 1
  journal(mission, 'task-reviewed', `${taskId} ${verdict} by ${reviewer}${gap ? ` gap=${gap}` : ''}`)
  return task
}

export function replan(mission, note) {
  if (note && typeof note !== 'string') {
    throw new Error('replan note must be a string')
  }
  mission.currentRound += 1
  mission.updatedAt = Date.now()
  journal(mission, 'replan', note || 'no note')
  return summarizeTasks(mission)
}

export function finalAudit(mission, mapping) {
  if (!Array.isArray(mapping) || mapping.length === 0) {
    throw new Error('mission_final_audit requires a mapping array')
  }
  const criteriaCovered = new Set()
  const gaps = []
  const rows = []
  for (const item of mapping) {
    const criterionIndex = Number(item.criterionIndex)
    const taskId = String(item.taskId)
    const task = mission.tasks[taskId]
    if (!task) {
      gaps.push(`criterion #${criterionIndex}: task ${taskId} does not exist`)
      continue
    }
    if (task.status !== 'accepted') {
      gaps.push(`criterion #${criterionIndex}: task ${taskId} is ${task.status}, not accepted`)
      continue
    }
    const evidencePaths = Array.isArray(item.evidencePaths) ? item.evidencePaths.map(String) : []
    if (evidencePaths.length === 0) {
      gaps.push(`criterion #${criterionIndex}: task ${taskId} has no evidencePaths mapping`)
      continue
    }
    criteriaCovered.add(criterionIndex)
    rows.push({
      criterionIndex,
      taskId,
      evidencePaths,
      title: task.title,
    })
  }
  const missingCriteria = mission.successCriteria
    .map((_, i) => i)
    .filter((i) => !criteriaCovered.has(i))
  for (const i of missingCriteria) {
    gaps.push(`success_criteria[${i}] has no accepted task mapping`)
  }
  const passed = gaps.length === 0
  mission.finalAudit = {
    mapping: rows,
    passed,
    gaps,
    at: Date.now(),
  }
  mission.updatedAt = Date.now()
  journal(mission, 'final-audit', passed ? 'passed' : `blocked: ${gaps.join('; ')}`)
  return mission.finalAudit
}

export function completeMission(mission, reportPath) {
  if (!mission.finalAudit || !mission.finalAudit.passed) {
    throw new Error('cannot complete mission: final audit has not passed')
  }
  const unresolved = rejectedWithoutFollowUp(mission)
  if (unresolved.length > 0) {
    throw new Error(
      'cannot complete mission: rejected task(s) have no follow-up. ' +
      'Add a new task with `replaces` pointing at each rejected task (or an explicit decision/report task) before completion. ' +
      'Rejected: ' + unresolved.join(', '),
    )
  }
  const policy = mission.terminationPolicy || 'success'
  if (policy === 'success') {
    const notSuccess = (mission.finalAudit.mapping || [])
      .filter((row) => {
        const task = mission.tasks[row.taskId]
        return !task || task.outcome !== 'success'
      })
      .map((row) => `${row.taskId} (outcome=${mission.tasks[row.taskId]?.outcome ?? 'none'})`)
    if (notSuccess.length > 0) {
      throw new Error(
        'cannot complete mission: terminationPolicy is "success" but mapped task(s) do not have outcome=success. ' +
        'Replan and try new directions, or change terminationPolicy to "budget-or-success" and exhaust the budget. ' +
        'Not success: ' + notSuccess.join(', '),
      )
    }
  } else {
    // budget-or-success: allow only if every mapped task is success OR budget is exhausted.
    const allSuccess = (mission.finalAudit.mapping || []).every((row) => {
      const task = mission.tasks[row.taskId]
      return task && task.outcome === 'success'
    })
    if (!allSuccess && !budgetExhausted(mission)) {
      throw new Error(
        'cannot complete mission: not all mapped tasks are outcome=success and the budget is not exhausted. ' +
        'Continue replanning until success or until the budget limit is reached.',
      )
    }
  }
  mission.status = 'completed'
  mission.reportPath = reportPath || mission.reportPath || null
  mission.completedAt = Date.now()
  mission.updatedAt = Date.now()
  journal(mission, 'completed', mission.reportPath || 'no report path')
  return mission
}

/**
 * Structural checks. Returns { ok, errors }.
 * The checks deliberately verify ONLY evidence honesty:
 *   - accepted tasks must have review + evidence
 *   - passed reviews must include all requiredEvidence declared before work
 *   - final completion requires finalAudit.passed
 */
export function checkMission(mission) {
  const errors = []
  if (!mission || typeof mission !== 'object') {
    return { ok: false, errors: ['mission is not an object'] }
  }
  if (typeof mission.id !== 'string' || mission.id.length === 0) errors.push('mission.id missing')
  if (!Array.isArray(mission.successCriteria) || mission.successCriteria.length === 0) {
    errors.push('mission.successCriteria must be a non-empty array')
  }
  for (const task of Object.values(mission.tasks || {})) {
    if (!task) continue
    if (task.status === 'accepted') {
      if (!task.review || task.review.verdict !== 'pass') {
        errors.push(`task ${task.id} accepted but has no pass review`)
      }
      const last = task.attempts[task.attempts.length - 1]
      if (!last || last.evidence.length === 0) {
        errors.push(`task ${task.id} accepted but has no evidence`)
      }
      const missing = last ? missingRequiredEvidence(task, last) : task.verificationPlan?.requiredEvidence || []
      for (const m of missing) {
        errors.push(`task ${task.id} missing required evidence: ${m}`)
      }
    }
    if (task.review && task.review.verdict === 'pass' && task.status !== 'accepted') {
      errors.push(`task ${task.id} has pass review but status ${task.status}`)
    }
    if (task.status === 'rejected' && !task.supersededBy) {
      errors.push(`task ${task.id} is rejected and has no follow-up (add a replacing task with replaces=${task.id})`)
    }
  }
  if (mission.status === 'completed') {
    if (!mission.finalAudit || !mission.finalAudit.passed) {
      errors.push('mission completed but finalAudit did not pass')
    }
    const policy = mission.terminationPolicy || 'success'
    if (policy === 'success') {
      for (const row of mission.finalAudit?.mapping || []) {
        const task = mission.tasks[row.taskId]
        if (!task || task.outcome !== 'success') {
          errors.push(`completed mission with terminationPolicy=success has non-success mapped task ${row.taskId}`)
        }
      }
    } else if (policy === 'budget-or-success') {
      const allSuccess = (mission.finalAudit?.mapping || []).every((row) => {
        const task = mission.tasks[row.taskId]
        return task && task.outcome === 'success'
      })
      if (!allSuccess && !budgetExhausted(mission)) {
        errors.push('completed mission with budget-or-success has non-success mapped tasks but budget is not exhausted')
      }
    }
  }
  if (mission.finalAudit) {
    if (!Array.isArray(mission.finalAudit.mapping)) {
      errors.push('mission.finalAudit.mapping must be an array')
    } else {
      const covered = new Set(mission.finalAudit.mapping.map((row) => Number(row.criterionIndex)))
      mission.successCriteria.forEach((_, i) => {
        if (!covered.has(i)) errors.push(`final audit does not cover success_criteria[${i}]`)
      })
    }
  }
  return { ok: errors.length === 0, errors }
}

export function summarizeTasks(mission) {
  const counts = { open: 0, active: 0, needs_review: 0, accepted: 0, rejected: 0 }
  for (const task of Object.values(mission.tasks || {})) {
    if (counts[task.status] !== undefined) counts[task.status] += 1
  }
  return {
    id: mission.id,
    status: mission.status,
    round: mission.currentRound,
    counts,
    tasks: Object.values(mission.tasks || {}).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      assignee: t.assignee,
      dependencies: t.dependencies,
      replaces: t.replaces || null,
      supersededBy: t.supersededBy || null,
      acceptance: t.acceptance,
      review: t.review ? { verdict: t.review.verdict, reviewer: t.review.reviewer, gap: t.review.gap } : null,
    })),
  }
}

export function statusText(mission) {
  const s = summarizeTasks(mission)
  const lines = [
    `Mission ${s.id} [${s.status}] round=${s.round}`,
    `Goals: ${mission.goals.map((g, i) => `${i}: ${g}`).join(' | ')}`,
    `Success criteria: ${mission.successCriteria.map((c, i) => `${i}: ${c}`).join(' | ')}`,
    `Tasks: open=${s.counts.open} active=${s.counts.active} needs_review=${s.counts.needs_review} accepted=${s.counts.accepted} rejected=${s.counts.rejected}`,
  ]
  for (const t of s.tasks) {
    const review = t.review ? ` review=${t.review.verdict}(${t.review.reviewer})` : ''
    lines.push(`- ${t.id} [${t.status}] ${t.title}${t.assignee ? ` assignee=${t.assignee}` : ''}${review}`)
  }
  if (mission.finalAudit) {
    lines.push(`Final audit: ${mission.finalAudit.passed ? 'PASS' : 'BLOCKED'} gaps=${mission.finalAudit.gaps.join('; ') || 'none'}`)
  }
  return lines.join('\n')
}

// ── internal helpers ────────────────────────────────────────

function requireTask(mission, taskId) {
  const task = mission.tasks[taskId]
  if (!task) throw new Error(`task not found: ${taskId}`)
  return task
}

function unsatisfiedDependencies(mission, task) {
  return task.dependencies.filter((depId) => {
    const dep = mission.tasks[depId]
    return !dep || dep.status !== 'accepted'
  })
}

function normalizeEvidence(evidence) {
  if (!Array.isArray(evidence)) return []
  return evidence
    .map((e) => {
      if (typeof e === 'string') return { path: e, kind: null, description: null }
      if (e && typeof e === 'object' && typeof e.path === 'string') {
        return { path: e.path, kind: e.kind ?? null, description: e.description ?? null }
      }
      return null
    })
    .filter(Boolean)
}

function missingRequiredEvidence(task, attempt) {
  const required = task.verificationPlan?.requiredEvidence
  if (!Array.isArray(required) || required.length === 0) return []
  const present = new Set(attempt.evidence.map((e) => basename(e.path)))
  return required.filter((name) => !present.has(basename(name)))
}

function basename(p) {
  return String(p).split(/[\\/]/).pop()
}

function rejectedWithoutFollowUp(mission) {
  return Object.values(mission.tasks || {})
    .filter((t) => t && t.status === 'rejected' && !t.supersededBy)
    .map((t) => t.id)
}

function budgetExhausted(mission) {
  const maxRounds = mission.budget?.maxRounds
  if (!Number.isFinite(maxRounds)) return false
  return mission.currentRound >= maxRounds
}

function nextTaskId(mission) {
  let n = Object.keys(mission.tasks).length + 1
  while (mission.tasks[`t-${String(n).padStart(2, '0')}`]) n += 1
  return `t-${String(n).padStart(2, '0')}`
}

function journal(mission, event, detail) {
  mission.journal.push({ at: Date.now(), event, detail })
}
