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

It is not a fixed template. Its content is free-form; only four
invariants are enforced:

1. it exists;
2. it answers deliverable / audience / success standard;
3. it contains a **Deliverable Contract**: form, audience, voice/tone,
   style exemplars, forbidden voice, export formats;
4. every subagent and reviewer reads it (and the contract) before working.

## Deliverable Contract

Every task-profile must state what the mission is producing and for whom.
This is the contract that gets pasted into every subagent prompt and checked
by the plan critic, the style reviewer, and the final reviewer. It is
domain-neutral — the fields apply to papers, code releases, runbooks,
briefings, audits, and operations work alike.

```text
form:                paper | code-release | design-doc | runbook | audit | briefing | summary | other
files:               exact paths / formats the user will receive
audience:            who reads/uses this (contest judges, developers, operators, executives, the user)
voice/tone:          objective contest-paper; tutorial; decision memo; technical doc; personal briefing
style exemplars:     which prior works/templates to follow, and which parts to borrow (structure, voice, formatting)
forbidden voice:     what must NOT appear (e.g. "你/我/我们" conversational phrasing in a formal paper,
                     unlabeled opinion, marketing tone, first-person as the model speaking)
export formats:      PDF + Word, Markdown, repository, xlsx, etc.
style review task:   which review task/persona accepts the style gate
```

This contract answers three questions the Captain must never guess at the
end:

- What is the deliverable?
- Who is it for and what does “good” look like to them?
- What voice/style is required, and what is explicitly forbidden?

If the goal is not a paper, the contract says so and the plan must produce
the smaller/right artifact.

## Three-layer split (do not overload the profile)

```text
task-profile.md        quality contract: intent, audience, success bar,
                       core challenge, no-lazy list, deliverable form
                       NO formulas, NO pseudocode, NO implementation details

domain-playbook.md     standard methods for this task family:
                       algorithm families, exemplars, references,
                       applicable vs not applicable
                       high-level method guidance, not project implementation

plan.md + tasks        actual project solution: model equations,
                       decision variables, pseudocode, task specs,
                       verificationPlan, evidence paths
```

Task-profile is about **what the mission owes and where it may not cut
corners**, not about solving the problem for the workers.

## Assumptions register

The profile must include an assumptions register, inspired by keel's Probe
step. Every load-bearing assumption gets:

```markdown
### Assumptions
- A1 [High] <assumption>
  verification: <command / source / test>
  status: unverified | verified | rejected
  verified-by: <subagent or evidence path>
```

Rules:

- Every `[High]` assumption must be resolved before the tasks that depend on
  it start.
- An assumption treated as fact without verification is a plan failure.
- When a high-risk assumption is rejected, update task-profile.md and replan
  anything built on it.

## Forbidden moves

Borrowed from the community's "Forbidden moves" lists. The profile must
contain an explicit forbidden-moves section (generic, not domain-specific):

```text
- Do not silently drop a reviewer gap; every non-PASS output must be consumed
  by a follow-up task or a documented decision.
- Do not mark completion without fresh evidence + covered scope + residual
  risk.
- Do not rewrite the task to something easier and call it the original task.
- Do not claim a fact/result without a traceable source or runnable evidence.
- Do not let a plan/task proceed while a High assumption is unverified.
- Do not hide a simplification as "we do it this way" without a reasoned
  change record.
```

These are checked by plan-critique and final review.

## Core Challenge & No-Lazy list

Every authoritative profile MUST include:

```markdown
### Core Challenge
What single hardest part truly defines "we solved this task"? 
If the deliverable does not address this, it is not the original task.

### Reasonable simplification (allowed)
- Must be justified;
- Must be documented in the plan/report;
- Must not remove the Core Challenge.

### Lazy shortcut (forbidden)
- Replacing "model/optimization" with "try a few values";
- Skipping the hardest module and calling the simplified version "done";
- Simplifying constraints until the result no longer answers the original;
- Using "time is short" as an unrecorded reason instead of a documented
  downgrade.

### Minimal evidence for the Core Challenge
What must be proven/verified before anyone may say the core challenge is done?
```

The critic MUST attack these items specifically.

## Phase A — Generate the initial profile (parallel + synthesize)

Do not write one profile from the Captain's own prior. Instead:

1. Captain writes a rough `profile-seed.md` from the user prompt.
2. Spawn 3–5 `subagent_researcher` in parallel. Each gets the seed and a
   different angle:
   - audience / evaluator / success standard;
   - standard workflow and methods for this task type;
   - exemplars and their structure/style (what does a good one look like,
     and what voice/format conventions apply);
   - deliverable contract: form, target reader, tone, forbidden voice,
     export formats;
   - constraints, pitfalls, failure modes;
   - tools, skills, and verification methods;
   - how this deliverable will be judged/reviewed (evaluation criteria).
   At least one candidate must focus on: **what is the Core Challenge, what
   would a lazy version look like, and what evidence proves the core is
   done**. At least one candidate must focus on the **Deliverable Contract**.
   Each candidate may use purpose-bounded web search.
3. Rank candidates. By default spawn `subagent_reviewer` to rank them — it is
   cheaper and more reliable for qualitative documents. Use `verify_select` /
   `verify_compare` only when there are at most 2–3 candidates and the
   verifier grading config is light (low reasoning effort, few repetitions,
   short candidates). Do not run `verify_select` on 5 large documents with
   the expensive DeepSeek grading profile; it can take 30+ minutes and abort.
4. Captain synthesizes the strongest parts into ONE authoritative
   `task-profile.md`, including the Core Challenge and No-Lazy list. Keep the
   candidates in `profile-candidates/`.
5. Spawn an independent critic. It attacks the profile: is it the right
   interpretation? Does it miss the audience or success standard? Does the
   Core Challenge match the original goal, or did the plan redefine the task
   to something easier? Is the standard approach actually applicable? Fix
   until pass.

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
   original goal, using everything now known. Each must also re-answer:
   "Is the current Core Challenge still the right one? Is anything currently
   treated as a reasonable simplification actually a lazy shortcut?
   Is the Deliverable Contract (form / audience / voice / style exemplars /
   forbidden voice) still right, or did the mission drift into a different
   artifact?"
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
