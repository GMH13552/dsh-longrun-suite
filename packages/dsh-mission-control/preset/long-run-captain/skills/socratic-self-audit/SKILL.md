---
name: socratic-self-audit
description: Use before submitting any non-trivial task evidence. A domain-neutral structured self-questioning protocol that forces the producer to attack their own work before an independent reviewer does.
---

# Socratic Self-Audit

Before you call `mission_submit`, act as your own strongest adversary. Write a
`self-check.md` (or append to the task's notes) answering the following
questions for the specific claim/result you are about to submit.

This protocol is deliberately **domain-neutral**. It applies to code, designs,
research, writing, math, experiments, analysis, documentation, and any other
deliverable.

## The core questions

1. **What exactly am I claiming or delivering?** State it in one sentence,
   with all scope, conditions, and boundaries. If you cannot, it is not ready.
2. **What would disprove or invalidate it?** Construct the most direct
   failure mode, counterexample, contradiction, or test that would break it.
3. **Where is my weakest assumption?** Name the step that would break first.
   Is it hidden, silent, unjustified, or copied from an unverified source?
4. **Can I verify it a second way?** Re-derive, re-implement, re-run, or
   cross-check with an independent method, tool, or data source.
5. **Did I check the edges and the failure paths?** Boundary values, empty
   input, unusual configurations, race conditions, missing files, invalid
   data, extreme parameters.
6. **Does my evidence actually support my claim?** Look at the artifact
   paths: would a stranger, seeing only these files, reach the same
   conclusion?
7. **What did I trust without verifying?** List every source, dependency,
   tool output, or assumption you relied on and mark whether you checked it
   yourself.
8. **If I were the reviewer, what would I reject?** Write the rejection
   letter you deserve. Then fix what it names.

## Mapping to generic task types

- **Code / implementation**: Does it compile? Do tests pass? Are there edge
  cases not covered? Does the diff match the acceptance criteria?
- **Research / investigation**: Are the sources real and current? Is each
  claim mapped to a source? Would another investigator reproduce the same
  findings?
- **Design / architecture**: Does it meet the stated constraints? What breaks
  first under scale, failure, or misuse? Is there a simpler alternative?
- **Writing / report**: Does every conclusion trace to evidence? Are
  overclaims removed? Would a skeptical reader accept it?
- **Experiment / benchmark**: Is the baseline fair? Are seeds/configs
  recorded? Can someone else reproduce the run from the logs?

These are just examples. The core questions above are the real protocol; the
task-specific list is only a memory aid.

## Output format

```markdown
# Self-check: <task id>

## Claim / deliverable
...

## Most direct invalidation
...

## Weakest assumption
...

## Independent second check
...

## Edges and failure paths checked
...

## Evidence-to-claim mapping
- claim -> artifact path
...

## What a reviewer would reject
...
```

Then submit this as part of the evidence bundle. The independent reviewer may
still reject you — that is the point. Self-audit reduces the “obvious gap the
producer never noticed” class of failure across all task types.
