---
name: explore-refine-rhythm
description: Use at mission seams (start, stuck, before review) to run the expand-refine rhythm: cast a wide net of parallel candidate directions, rank and narrow, then run the winner; if it stalls, cast wide again. Domain-neutral.
---

# Explore–Refine Rhythm

The Captain should not move in one direction forever, nor switch randomly.
Use a breathing rhythm:

```text
广撒网 EXPAND  → 精细化 REFINE  → 广撒网 EXPAND  → ...
```

## When to run a wave

- after intake, before locking the plan;
- whenever the current direction is rejected or stuck;
- before a major review / cutoff;
- when new information invalidates the current assumptions.

## EXPAND — cast a wide net

1. Spawn 3–5 independent subagents in parallel, each with a **different
   angle** or constraint. Do not give most of them the current favored
   approach.
2. Angles depend on the task type:
   - research: different methods, unrelated fields, adversarial viewpoints;
   - engineering: different architectures, simplest possible vs most robust;
   - analysis: different hypotheses, different data cuts.
3. Each returns: candidate direction, expected outcome, evidence needed,
   and the most likely failure.

## REFINE — narrow, don't drift

1. If `verify_select` / `verify_compare` is available, rank the candidates;
   otherwise spawn `subagent_reviewer` to rank them by checkable criteria.
2. Keep 1–2 strongest directions as tasks. The losers go to `maybe-later.md`,
   not into the plan.
3. Write precise acceptance criteria for the winner BEFORE dispatching work.
4. Run the winner. Do not blend all candidates into one vague direction.

## Stop and re-expand

Expand again when:

- the winner is rejected with a precise gap;
- `verify_track` shows progress stalled over several steps;
- two different refinements lead to the same wall;
- the mission goal or evidence changes.

Do not re-expand just because the winner is slow. One rejected direction is
not a failure of the rhythm; it is the trigger for the next wave.

## Captain's role in the rhythm

The Captain coordinates the waves:

- writes each expand prompt and ensures the angles differ;
- runs the ranking/refine step;
- writes the winner's task spec;
- never does the candidate work itself.
