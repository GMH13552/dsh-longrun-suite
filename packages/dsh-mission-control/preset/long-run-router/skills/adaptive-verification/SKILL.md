---
name: adaptive-verification
description: How to generate a domain-appropriate verification plan for each mission task. Use when adding tasks, reviewing evidence, or deciding what counts as "done" for a specific task.
---

# Adaptive Verification

The framework does not hardcode verification workflows. Instead, every task
declares its own `verificationPlan` before work begins. This skill is a
generator, not a fixed checklist.

## Decision procedure

For each task, ask:

1. What would convince an independent expert that this task is done?
2. What evidence can be produced without self-deception?
3. What can a reviewer independently re-run or re-derive?

Then choose the verification shape.

## Common shapes (not a closed set)

### Literature / research

```json
{
  "verificationKind": "literature",
  "requiredEvidence": ["survey.md", "sources.json"],
  "reviewerInstruction": "Verify every source URL exists, is current, and supports the claim."
}
```

### Benchmark / experiment

```json
{
  "verificationKind": "benchmark-experiment",
  "requiredEvidence": ["config.json", "metrics.json", "baseline.json", "run.log"],
  "checkCommand": "python verify_experiment.py --task t-04",
  "reviewerInstruction": "Re-run or inspect the run log; check seed parity; compare against baseline."
}
```

### Proof / math

```json
{
  "verificationKind": "math-proof",
  "requiredEvidence": ["statement.md", "derivation.md", "counterexample-search.log"],
  "reviewerInstruction": "Independently re-derive; only a concrete counterexample may reject a route."
}
```

### Code / software

```json
{
  "verificationKind": "code-review",
  "requiredEvidence": ["diff.patch", "tests.log", "coverage.json"],
  "checkCommand": "npm test && npm run lint",
  "reviewerInstruction": "Run the tests, inspect edge cases, verify the diff matches the acceptance criteria."
}
```

## Writing acceptance criteria

Good acceptance criteria are:

- **observable**: a reviewer can check them;
- **specific**: names the metric, command, artifact, or condition;
- **minimal**: the smallest set that proves the task.

Bad: "improve the model"
Good: "benchmark A improves by >=3% over baseline with the same seed; benchmark B does not regress; metrics.json and run.log are committed."

## Minimum validation package (default for non-trivial tasks)

Unless the task genuinely cannot support a layer, a task's `verificationPlan`
should cover at least these four layers:

1. **Internal correctness** — dimensions/units, bounds, feasibility, convergence,
   assertions, no data leakage, no future-feature usage.
2. **Primary / explanatory evidence** — correct split (holdout, rolling-origin,
   group-aware, or independent re-derivation); one main metric plus at least one
   complementary metric.
3. **Comparative evidence** — a meaningful baseline and, when an innovation is
   claimed, an ablation; identical seeds/split/budget across comparisons.
4. **Uncertainty / robustness evidence** — sensitivity to key parameters,
   weights, scenarios, or data perturbations; intervals/bootstrap; or an explicit
   recorded reason why not needed.

Also add the most likely **failure/edge scenario**: how the result could be
wrong, and what that would look like.

This is a floor, not a ceiling. If a layer cannot be satisfied, record why and
lower the claim strength instead of silently skipping it.

## Escalating when blocked

If a task is rejected, the captain should usually create a new verification
task or a research-surge task:

```json
{
  "verificationKind": "research-surge",
  "requiredEvidence": ["direction-report.md", "sources.json"],
  "reviewerInstruction": "Independently verify source validity and freshness; mark each proposed direction as plausible or not."
}
```

The verification plan is data, so it can be changed only by re-planning before
the next attempt — never after the fact to make a rejected task pass.

## Use LLM-as-a-Verifier as a reasoning signal

For hard tasks, use `verify_rollout` / `verify_select` / `verify_compare` /
`verify_track` (from `dsh-plugin-llm-verifier`) to generate and compare
candidate approaches before committing. Record verifier scores in the task
result, but never let a verifier score replace required evidence or an
independent review.

## Include a Socratic self-check

For proofs, designs, and experiments, add `self-check.md` to
`requiredEvidence` when appropriate. The assignee should load
`socratic-self-audit` before submission and answer:

- What would disprove this?
- What is the weakest assumption?
- How can this be derived/implemented a second way?
- What would the reviewer reject?

The self-check is not a substitute for independent review; it makes the
producer attack their own work first.
