---
name: plan-critique
description: Use BEFORE executing any mission plan. A domain-neutral pre-mortem protocol: the Captain drafts a plan, then an independent critic subagent attacks it before any worker starts.
---

# Plan Critique

The Captain is not allowed to turn a goal directly into tasks and start
dispatching. First produce a plan, then have it attacked by an independent
critic, then fix the plan. This protocol is domain-neutral: it applies to
research, software projects, analysis, writing, and any long mission.

## Step 1 — Draft the plan in a file

Write `plan.md` in the mission working directory. It must contain:

1. **One-sentence through-line.** What single contribution/outcome this
   mission is trying to produce.
2. **Deliverable contract.** Use `report-protocol` Steps 0–1: form, files,
   audience, voice/tone, style exemplars, forbidden voice, export formats,
   acceptance, and the `deliverable-style` review task. Do not default to a
   paper.
3. **Goal decomposition.** The sub-goals and how their union covers the
   original goal (coverage check).
4. **Task DAG sketch.** Task ids, dependencies, assignee roles, and `kind`
   (`research` / `engineering` / `review` / `deliverable-style` /
   `synthesis` / `bookkeeping`). Default every substantive task to a
   subagent role; "captain" is valid only for
   bookkeeping / synthesis / coordination. These assignees and kinds must be
   passed to `mission_add_tasks` (the plugin rejects captain for substantive
   kinds at add/claim time). A text deliverable must include a
   `deliverable-style` review task.
5. **Per-task acceptance criteria and verificationPlan** (at least draft).
6. **Risk / pre-mortem table.** For each task:
   - the most likely way it fails;
   - what evidence would reveal that failure early;
   - the fallback or alternate direction if it fails.
7. **Deliverable skeleton.** For the chosen form, the sections/files and
   which tasks/evidence will fill each. Planned before execution, not
   assembled at the end.
8. **Novelty / originality check.** What the mission will do differently
   from existing work, and how it will verify that this is actually new.

## Step 2 — Independent critique

Spawn `subagent_reviewer` (or a one-shot critic) with ONLY:

- the original goal;
- the plan.md draft;
- the instruction: "Attack this plan. Find what will go wrong, what is
  missing, where the through-line is weak, and whether the success criteria
  are checkable. Output pass or reject with precise gaps."

Rules for the critic:

- It must not be the Captain.
- It must propose at least one failure mode the Captain did not list.
- It must check coverage: do the tasks cover the goal, not just the easy
  parts?
- It must check that substantive tasks are delegated to subagent roles and
  not silently kept by the Captain (check `kind` + assignee; the plugin now
  rejects captain for research/engineering/review/deliverable-style).
- It must check that the Deliverable Contract exists: form, audience,
  voice/tone, style exemplars, forbidden voice, export formats.
- It must check that a `deliverable-style` review task is in the DAG for any
  text/report deliverable.
- It must check the Core Challenge from task-profile.md is preserved: no
  lazy shortcut may replace the hard part with "try a few values", omit the
  hardest module, or over-simplify constraints until the result no longer
  answers the original task.
- It must check the Forbidden Moves from task-profile.md are not present:
  no silently dropped reviewer gap, no completion without fresh evidence +
  covered scope + residual risk, no unverified High assumption driving tasks.
- It must check that the plan is not confusing the three layers:
  task-profile (quality contract) / domain-playbook (method families,
  references) / plan+tasks (actual equations, pseudocode, evidence).
- It must check that the deliverable form fits the goal and that the
  skeleton can actually be filled by the planned evidence.

## Step 3 — Revise and lock

- If the critic rejects, fix `plan.md` and re-review. One rejected plan is
  normal; do not start execution until the critic passes.
- When it passes, add the plan review as a task with evidence
  (`plan.md`, critic report), or store the critic report in the mission
  artifacts.
- Only then start dispatching workers.

## The pre-mortem questions every plan must answer

1. What is the single sentence this mission will be able to claim at the end?
2. What is the most embarrassing way this could fail?
3. Which task is most likely to be rejected by the final reviewer, and why?
4. If the primary direction dies at 50% progress, what is direction B?
5. Does the final report have a real through-line, or is it a pile of task
   summaries?
