---
name: task-profile
description: The core living artifact of a mission. Generate several candidate profiles in parallel, synthesize one authoritative task-profile.md, update it at seams, and run profile re-check rounds before final review.
---

# Task Profile

`task-profile.md` is the mission's living understanding:

- what this task really is;
- who the deliverable is for and what "good" means;
- the standard approaches, constraints, and known failure modes;
- what is still unknown.

It is not a fixed template. Its content is free-form; only three
invariants are enforced:

1. it exists;
2. it answers deliverable / audience / success standard;
3. every subagent and reviewer reads it before working.

## Phase A — Generate the initial profile (parallel + synthesize)

Do not write one profile from the Captain's own prior. Instead:

1. Captain writes a rough `profile-seed.md` from the user prompt.
2. Spawn 3–5 `subagent_researcher` in parallel. Each gets the seed and a
   different angle:
   - audience / evaluator / success standard;
   - standard workflow and methods for this task type;
   - exemplars and their structure/style;
   - constraints, pitfalls, failure modes;
   - tools, skills, and verification methods.
   Each candidate may use purpose-bounded web search.
3. Rank candidates. By default spawn `subagent_reviewer` to rank them — it is
   cheaper and more reliable for qualitative documents. Use `verify_select` /
   `verify_compare` only when there are at most 2–3 candidates and the
   verifier grading config is light (low reasoning effort, few repetitions,
   short candidates). Do not run `verify_select` on 5 large documents with
   the expensive DeepSeek grading profile; it can take 30+ minutes and abort.
4. Captain synthesizes the strongest parts into ONE authoritative
   `task-profile.md`. Keep the candidates in `profile-candidates/`.
5. Spawn an independent critic. It attacks the profile: is it the right
   interpretation? Does it miss the audience or success standard? Is the
   standard approach actually applicable? Fix until pass.

## Phase B — Living updates

Update `task-profile.md` at these seams:

- after significant web findings;
- after a rejected task or repeated stall;
- when the user adds or changes a goal;
- when a new direction is chosen.

Every update appends a changelog entry:

```text
## Changelog
- [date] changed: ...  why: ...  affects: tasks t-xx / methods / deliverable
```

When a direction changes, do NOT delete the old profile content blindly.
Mark it:

```text
[superseded: replaced by ...]
[retired: no longer applicable because ...]
```

Then replan tasks affected by the change.

## Phase C — Profile re-check rounds (before final review)

Before `mission_final_audit`, run at least one profile round:

1. Spawn 2–3 independent `subagent_researcher` WITH web access. They each
   independently produce a fresh `task-profile-candidate.md` for the SAME
   original goal, using everything now known.
2. Compare each candidate against the current `task-profile.md`. Classify
   every difference:

```text
conflict     candidate says current understanding is wrong
complement   candidate adds a missing angle, method, risk, or requirement
noise        stylistic or irrelevant difference
```

3. Handle:

- `conflict` → investigate the conflicting claim. If valid, update the
  profile, replan affected tasks, and run the round again.
- `complement` → merge the useful part into the profile. If it changes the
  plan, add/update tasks, then run the round again.
- `noise` → ignore, but record one line in the changelog.

4. Stop when one full round produces no substantive conflict/complement, or
   when the budget says stop and the differences are documented as residual
   risks.

Only after a stable profile round may the final report and final audit run.
