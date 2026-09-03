---
name: hard-task-flow
description: The model-facing step-by-step flow for hard/long-running missions. Use when a mission is complex, uncertain, long, or has multiple interdependent deliverables. Tells the Captain and workers which tools/skills to use at each seam, in order.
---

# Hard Task Flow

This is the canonical model-facing flow for hard/long-running missions. It is
domain-neutral: the same shape applies to research, software, experiments,
writing, and operations. It is a guide, not a hard-code: missions may skip a
step when it genuinely does not apply, but should not skip it silently.

## Important: this is a LOOP, not a straight line

The numbered stages below are the forward direction, but failures send you
backward. A hard task is a directed graph with cycles, not a pipeline.

```text
               ┌──────────────────────────────────────────────┐
               │                                              │
               ▼                                              │
 intake ──▶ profile ──▶ plan ──▶ claim/execute ──▶ verify ──▶ analyze ──▶ final
    │          │           │            │              │          │
    │          │           │            +── reject ────┘          │
    │          │           └── critic/plan reject ────────────────┘
    │          └── new findings / hypothesis changed ──────────────┘
    └── memory/wiki feeds FUTURE intake ────────────────────────────┘
```

Main backward edges:

- profile critic reject -> back to profile/plan.
- plan critic reject -> back to plan.
- worker lease expiry -> task reclaimed -> back to execute.
- review reject -> replan + `replaces` -> execute again.
- pilot `not_met` -> revise hypothesis or stop -> back to profile.
- blind review reject / `calibration_gap` high -> revision loop -> execute again.
- critic `needs_more_research` -> next research round -> back to research/plan.
- new findings -> replan -> back to plan/execute.
- cross-mission: `.memory`/wiki feeds future intake.

Use forward flow when things work; use backward arrows when a gate fails.
Do not pretend a rejection is the end.

## 0. Intake

1. Read the user's goal.
2. Immediately call `skill` for `mission-protocol` and `task-profile`.
3. Call `mission_start` with goal + success_criteria.
4. Run `wiki_search` for prior methods/pitfalls/mission cards.
5. Write `task-profile.md`.

## 1. Understand & profile

- Parallel `subagent_researcher`:
  - search web/literature/existing code;
  - search `.memory` via `wiki_search`;
  - identify standard methods and what already exists.
- Synthesize:
  - `Input / Decision / Output / Success`;
  - `Core Challenge`;
  - `No-Lazy list`;
  - `capabilities`;
  - `Deliverable Contract`.
- Spawn a critic to attack the profile; fix until pass.

## 2. Plan

Write `plan.md`:

- one through-line;
- task DAG with dependencies and kinds;
- per-task `acceptance` + `verificationPlan` + `capabilities`;
- **A/B/C candidate ladder** for substantive tasks;
- **module contracts** on cross-task edges;
- **method-card.md** before non-trivial implementation;
- risk/pre-mortem table.

Spawn `subagent_reviewer` as plan critic. Reject/revise until pass.

## 3. Claim & execute with worker pool

- `mission_add_tasks` with acceptance/verificationPlan/capabilities.
- Before claiming, call `mission_ready` to see the ready queue width and the
  tasks that can be claimed.
- If width >= 2 and tasks are independent, spawn multiple workers. Each worker
  loops:
  ```text
  mission_ready -> mission_claim -> work -> mission_submit/artifact -> repeat
  ```
- Workers claim matching tasks:
  ```text
  mission_claim(task_id, worker, capabilities, lease_seconds)
  ```
- Long tasks:
  ```text
  mission_heartbeat(task_id, worker)
  mission_release(task_id, worker)   # if cannot finish
  ```
- Worker death: lease expires -> task reclaimed; 3 reclaims -> blocked.
- Exchange typed data:
  ```text
  mission_publish_artifact(task_id, artifact_type, path)
  mission_consume_artifacts(artifact_type)
  ```

During execution:

- Reuse existing implementations/standard methods first.
- Only implement new when `verified-no-existing` evidence exists.
- No silent downgrade (grid search vs optimizer, fixed scenarios vs Monte Carlo, etc.).
- No unsupported speculation; label hypotheses and verify.
- Remote/long jobs: set one `schedule_reminder` and end turn; on wake check once.
- Use `wiki_write` after durable lessons/methods.

## 4. Verify & review

- Producer: `socratic-self-audit` before submit.
- `mission_submit` with evidence paths; WorkReceipt is generated.
- Independent `subagent_reviewer`:
  - check acceptance criteria,
  - check reuse/downgrade/speculation,
  - pass or reject with precise gap.
- Reject -> `mission_replan` + a new task with `replaces`.
- Hard choices: `verify_rollout` / `verify_select` / `verify_track`.

## Review tiers (do not over-review)

Tasks carry `scrutinyLevel`: `high`, `standard`, or `low`.

| Level | Typical tasks | Required |
|---|---|---|
| `high` | idea/profile, core algorithm/design, final deliverable | method-card + plan-critique + independent reviewer + blind review |
| `standard` | normal implementation/research/review | method-card if non-trivial + independent reviewer |
| `low` | docs, formatting, bookkeeping, small fixes, coordination | evidence + Captain/quick check, may reuse an existing reviewer |

- `high` tasks are the key logic: never skip the hard gates.
- `standard` tasks still need independent review, but do not need blind review.
- `low` tasks do not need plan-critique or blind review; a quick check by the
  Captain or a reused reviewer is enough.
- When spawning reviewers, prefer reusing a reviewer for low tasks and
  reserving fresh independent reviewers for `high`/`standard`.

## 5. Result analysis & iterate

- Read `findings`, review, notifications.
- Decide continue / stop / revise.
- If continue: next plan/code/run delta.
- If close: proceed.

## 6. Final gates

1. `mission_blind_review`:
   - submission_path,
   - self_rating,
   - avg_rating / n_reviews / decision / top_weaknesses,
   - calibration_gap.
2. If reject or gap large: add revision task.
3. `wiki_lint`.
4. `wiki_write` for durable memory.
5. `mission_final_audit`: map every success criterion to accepted task evidence.
6. `mission_check`.
7. `mission_complete`.

## 7. Memory

- Write `mission-legacy.md`.
- Write `mission-cases/case-<mission-id>.md`.
- Update `.memory/methods`, `.memory/pitfalls`, `.memory/decisions`, `.memory/missions`.
- Update worker resume in `.memory/workers/<worker-id>.md`.

---

## Anti-patterns

- Starting implementation before existing-work search.
- Skipping `method-card` for non-trivial work.
- Claiming without capabilities.
- Letting a worker sit in a long loop instead of heartbeat/reminder.
- Chatting through the Captain instead of using artifacts.
- Reviewing your own work.
- Finishing without blind review for a substantive deliverable.
