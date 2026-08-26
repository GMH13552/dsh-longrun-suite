import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createMission,
  addTasks,
  claimTask,
  updateTask,
  submitTask,
  reviewTask,
  replan,
  finalAudit,
  completeMission,
  checkMission,
} from '../lib/core.js'

function makeMission() {
  const m = createMission({
    goal: 'Improve the model',
    successCriteria: ['benchmark A improves', 'benchmark B does not regress'],
  })
  addTasks(m, [
    {
      id: 't-01',
      title: 'Baseline reproduction',
      kind: 'engineering',
      acceptance: ['baseline.json exists'],
      verificationPlan: {
        kind: 'benchmark',
        requiredEvidence: ['baseline.json', 'run.log'],
      },
    },
    {
      id: 't-02',
      title: 'New method experiment',
      kind: 'engineering',
      acceptance: ['metrics.json exists'],
      dependencies: ['t-01'],
      verificationPlan: {
        kind: 'benchmark-experiment',
        requiredEvidence: ['metrics.json', 'config.json', 'run.log'],
      },
    },
  ])
  return m
}

test('mission lifecycle requires independent review', () => {
  const m = makeMission()

  claimTask(m, 't-01', 'engineer')
  submitTask(m, 't-01', ['baseline.json', 'run.log'], { baseline: 0.5 }, 'success')

  assert.throws(
    () => reviewTask(m, 't-01', { verdict: 'pass', reviewer: 'engineer' }),
    /self-review is forbidden/,
  )

  reviewTask(m, 't-01', { verdict: 'pass', reviewer: 'reviewer' })
  assert.equal(m.tasks['t-01'].status, 'accepted')

  // dependency gate satisfied: t-01 is accepted
  claimTask(m, 't-02', 'engineer')
  submitTask(m, 't-02', ['metrics.json', 'config.json', 'run.log'], { metricA: 0.53 }, 'success')
  reviewTask(m, 't-02', { verdict: 'pass', reviewer: 'reviewer' })
  assert.equal(m.tasks['t-02'].status, 'accepted')

  // final audit requires mapping every criterion
  const audit = finalAudit(m, [
    { criterionIndex: 0, taskId: 't-02', evidencePaths: ['metrics.json'] },
    { criterionIndex: 1, taskId: 't-01', evidencePaths: ['baseline.json'] },
  ])
  assert.equal(audit.passed, true)

  completeMission(m, 'report.md')
  const check = checkMission(m)
  assert.equal(check.ok, true, JSON.stringify(check.errors))
})

test('reject requires a gap and replan can add tasks', () => {
  const m = makeMission()
  claimTask(m, 't-01', 'engineer')
  submitTask(m, 't-01', ['baseline.json', 'run.log'])

  assert.throws(
    () => reviewTask(m, 't-01', { verdict: 'reject', reviewer: 'reviewer' }),
    /requires a precise gap/,
  )

  reviewTask(m, 't-01', { verdict: 'reject', reviewer: 'reviewer', gap: 'no seed recorded' })
  assert.equal(m.tasks['t-01'].status, 'rejected')

  replan(m, 'add seed reproduction task')
  addTasks(m, [
    { id: 't-03', title: 'Seed fix', kind: 'engineering', acceptance: ['seed recorded'], verificationPlan: {} },
  ])
  assert.ok(m.tasks['t-03'])
})

test('rejected task without follow-up blocks completion', () => {
  const m = makeMission()
  // Accept the two mapped tasks.
  claimTask(m, 't-01', 'engineer')
  submitTask(m, 't-01', ['baseline.json', 'run.log'], null, 'success')
  reviewTask(m, 't-01', { verdict: 'pass', reviewer: 'reviewer' })
  claimTask(m, 't-02', 'engineer')
  submitTask(m, 't-02', ['metrics.json', 'config.json', 'run.log'], null, 'success')
  reviewTask(m, 't-02', { verdict: 'pass', reviewer: 'reviewer' })
  finalAudit(m, [
    { criterionIndex: 0, taskId: 't-02', evidencePaths: ['metrics.json'] },
    { criterionIndex: 1, taskId: 't-01', evidencePaths: ['baseline.json'] },
  ])
  assert.equal(m.finalAudit.passed, true)

  // Add an extra direction that gets rejected and never followed up.
  addTasks(m, [
    { id: 't-03', title: 'Dead end', kind: 'engineering', acceptance: ['x'], verificationPlan: {} },
  ])
  claimTask(m, 't-03', 'engineer')
  submitTask(m, 't-03', ['dead.log'])
  reviewTask(m, 't-03', { verdict: 'reject', reviewer: 'reviewer', gap: 'false premise' })
  assert.equal(m.tasks['t-03'].status, 'rejected')

  assert.throws(() => completeMission(m, 'report.md'), /no follow-up/)
})

test('rejected task with replaces is allowed to complete', () => {
  const m = makeMission()
  claimTask(m, 't-01', 'engineer')
  submitTask(m, 't-01', ['baseline.json', 'run.log'])
  reviewTask(m, 't-01', { verdict: 'reject', reviewer: 'reviewer', gap: 'no seed recorded' })

  // Add a follow-up task that supersedes the rejected one, then finish it.
  addTasks(m, [
    { id: 't-03', title: 'Seed reproduction v2', kind: 'engineering', acceptance: ['seed recorded'], verificationPlan: {}, replaces: 't-01' },
  ])
  assert.equal(m.tasks['t-01'].supersededBy, 't-03')
  claimTask(m, 't-03', 'engineer')
  submitTask(m, 't-03', ['seed.txt'], null, 'success')
  reviewTask(m, 't-03', { verdict: 'pass', reviewer: 'reviewer' })

  // t-02 originally depended on the rejected t-01; rewire it to the replacement.
  updateTask(m, 't-02', { dependencies: ['t-03'] })

  // t-02 also accepted so the original success criteria can be mapped.
  claimTask(m, 't-02', 'engineer')
  submitTask(m, 't-02', ['metrics.json', 'config.json', 'run.log'], null, 'success')
  reviewTask(m, 't-02', { verdict: 'pass', reviewer: 'reviewer' })
  finalAudit(m, [
    { criterionIndex: 0, taskId: 't-02', evidencePaths: ['metrics.json'] },
    { criterionIndex: 1, taskId: 't-03', evidencePaths: ['seed.txt'] },
  ])
  completeMission(m, 'report.md')
  assert.equal(m.status, 'completed')
})

test('checkMission rejects accepted task missing required evidence', () => {
  const m = makeMission()
  claimTask(m, 't-01', 'engineer')
  submitTask(m, 't-01', ['baseline.json']) // missing run.log
  assert.throws(
    () => reviewTask(m, 't-01', { verdict: 'pass', reviewer: 'reviewer' }),
    /missing required evidence/,
  )
  const check = checkMission(m)
  assert.equal(check.ok, true) // still open/needs_review, not an inconsistent accepted state
})

test('planned assignee is enforced at claim time', () => {
  const m = createMission({ goal: 'g', successCriteria: ['c'] })
  addTasks(m, [
    { id: 't-01', title: 'Do work', kind: 'research', assignee: 'researcher', acceptance: ['a'], verificationPlan: {} },
  ])
  assert.equal(m.tasks['t-01'].assignee, 'researcher')
  assert.throws(() => claimTask(m, 't-01', 'captain'), /planned for assignee/)
  claimTask(m, 't-01', 'researcher')
  assert.equal(m.tasks['t-01'].assignee, 'researcher')
})

test('createMission tolerates snake_case success_criteria as defensive fallback', () => {
  const m = createMission({
    goal: 'g',
    success_criteria: ['criterion one'],
    missionId: 'regression-mission',
    terminationPolicy: 'budget-or-success',
  })
  assert.deepEqual(m.successCriteria, ['criterion one'])
  assert.equal(m.id, 'regression-mission')
  assert.equal(m.terminationPolicy, 'budget-or-success')
})

test('captain cannot be assigned substantive task kinds', () => {
  const m = createMission({ goal: 'g', successCriteria: ['c'] })
  assert.throws(
    () => addTasks(m, [
      { id: 't-core', title: 'Derive the model', kind: 'research', assignee: 'captain', acceptance: ['model.md'], verificationPlan: {} },
    ]),
    /cannot be assigned to captain/,
  )

  addTasks(m, [
    { id: 't-core2', title: 'Derive the model v2', kind: 'research', acceptance: ['model.md'], verificationPlan: {} },
  ])
  assert.throws(() => claimTask(m, 't-core2', 'captain'), /cannot be claimed by captain/)
  claimTask(m, 't-core2', 'researcher')
  assert.equal(m.tasks['t-core2'].assignee, 'researcher')
})

test('captain may claim synthesis/bookkeeping/coordination tasks', () => {
  const m = createMission({ goal: 'g', successCriteria: ['c'] })
  addTasks(m, [
    { id: 't-syn', title: 'Synthesize report', kind: 'synthesis', assignee: 'captain', acceptance: ['report.md'], verificationPlan: {} },
  ])
  claimTask(m, 't-syn', 'captain')
  assert.equal(m.tasks['t-syn'].assignee, 'captain')
})

test('task kind is required', () => {
  const m = createMission({ goal: 'g', successCriteria: ['c'] })
  assert.throws(
    () => addTasks(m, [{ id: 't-no-kind', title: 'No kind', acceptance: ['a'], verificationPlan: {} }]),
    /requires kind/,
  )
})
