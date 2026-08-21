---
name: llm-verifier-protocol
description: Use when deep reasoning, candidate selection, or progress monitoring is needed in a mission. Describes how to use LLM-as-a-Verifier style verify_* tools (from dsh-plugin-llm-verifier) inside the mission loop.
---

# LLM-as-a-Verifier Protocol

`dsh-plugin-llm-verifier` adds fine-grained LLM scoring tools to DSH:

- `verify_rollout(task, n?)` — run several independent attempts in parallel, grade them, return the best.
- `verify_select(task, candidates[])` — pick the best from candidates you already have.
- `verify_compare(task, candidate_a, candidate_b)` — compare two candidates.
- `verify_track(task, trajectory[])` — score how much progress a step-by-step attempt has made.

These are **not** a replacement for the independent reviewer or for real
evidence gates. They are a reasoning aid and an early-warning signal.

## When to use it

### 1. Early direction selection

When a task has multiple plausible approaches, do not just pick one by feel:

```text
verify_rollout(
  task="Propose 3 different proof strategies for X; for each, give the core idea and the most likely blocker",
  n=3
)
```

Use the winner as the first direction, but keep the others in `registry.json`
as alternatives.

### 2. Comparing candidate solutions

Before submitting a task, if you have several candidate implementations,
proofs, designs, or reports:

```text
verify_select(
  task="Which candidate best satisfies the acceptance criteria?",
  candidates=[...]
)
```

Record the verifier score in the task result. The independent reviewer still
must pass the task.

### 3. Early progress tracking / direction check

For long multi-step tasks, periodically call:

```text
verify_track(
  task="<the original sub-task>",
  trajectory=["step 1: ...", "step 2: ...", "..."]
)
```

If the score is not increasing after a few steps, treat that as a weak signal
that the direction may be wrong. Do **not** immediately abandon based on a
single score; combine it with the independent reviewer and your own analysis.

### 4. Deep reasoning on hard problems

For hard problems (proofs, subtle bugs, open research questions), use the
verifier as a “second opinion” on intermediate claims:

- Generate 3–5 candidate reasoning chains with `verify_rollout`.
- Use `verify_compare` to pit the strongest chain against an alternative.
- Use `verify_track` on the winning chain to see where progress stalls.

This gives you a fine-grained signal before spending a full review cycle.

## How it fits the mission

```text
mission_add_tasks
  → claim task
  → deep reasoning with verify_* (optional but encouraged on hard tasks)
  → mission_submit with real evidence + self-check.md
  → independent reviewer via subagent_reviewer / mission_review
  → mission_replan if rejected
```

The LLM verifier can make the Captain’s reasoning deeper and catch weak
directions earlier, but it never replaces the structural evidence gate.
