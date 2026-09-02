---
name: lessons
description: Managed intra-mission experience log with cross-mission handoff. Subagents append lessons after tasks; Captain injects only relevant lessons into later dispatches; at mission end a mission-legacy is exported for the next mission.
---

# Lessons

Two layers of experience:

- `lessons.md` — intra-mission log shared by subagents of THIS mission.
- `mission-legacy.md` — cross-mission handoff produced at mission end.

## Intra-mission lessons

Every subagent, after submitting a task, must append at least one lesson
entry even if the task passed. The Captain says this in the dispatch prompt:

```text
完成后在 lessons.md 追加：
- 做了什么 / 关键结论
- 踩了什么坑 / 怎么绕过的
- 哪些文件、参数、数字不能碰
- 接手者第一件事该看什么
```

Entry format:

```markdown
## L-<n> [status] <short title>
- author: <role>
- task: <task id>
- applies-to: <which later tasks / conditions>
- evidence: <file paths>
- lesson: ...
- status: draft | confirmed | active | superseded | retired
```

Status rules:

```text
draft      just written by a worker
confirmed  reviewer confirmed it
active     usable for later dispatches
superseded  replaced by a newer lesson; keep the reason
retired    no longer applicable; keep the reason
```

## How later subagents receive lessons

Captain does NOT dump the whole log into every prompt. Before dispatch:

1. Select only `active` lessons whose `applies-to` matches the new task.
2. Paste those lessons into the subagent prompt as `## 前序经验（必读）`.
3. Add one line to the prompt: "这些经验只适用于 stated conditions；若与本任务证据冲突，以本任务证据为准并报告。"

## Path changes: compress, don't delete

When the mission changes direction:

- Mark old-path lessons `superseded` or `retired`, each with one-line reason.
- Add ONE compressed summary at the top:

```text
## Path summary
previous direction: ...
why abandoned: ...
what remains valid: ...
```

New workers read the path summary instead of the full old trail.

## Cross-mission legacy

At `mission_complete` time (before final audit), Captain writes
`mission-legacy.md`:

```markdown
# Mission legacy: <title>
- goal and deliverable
- durable results / reusable methods
- verified lessons worth carrying forward
- pitfalls likely to recur in similar missions
- what this mission did NOT solve
```

Store it next to the mission state or in the mission output. The next
mission's Captain MAY read it when `task-profile` generation detects the
same task family; it is never auto-injected and never overrides the new
mission's own evidence.


## Mission case cards (lightweight)

Optional but recommended for missions that might recur or whose structure is
likely to appear again. This is a **lightweight v1**: plain Markdown cards,
a folder, and grep/tag search. No index, no vector DB, no automatic
validation yet.

### When to write

At mission end, alongside `mission-legacy.md`, write:

```text
mission-cases/case-<mission-id>.md
```

Keep it under the mission output directory. It is a structured summary, not a
replacement for `lessons.md` or `mission-legacy.md`.

### Card template

```markdown
# Mission case: <title>
- mission_id: <id>
- date: <YYYY-MM-DD>
- domain: <short domain label>
- goal_structure: <one sentence about the shape of the goal>
- success_criteria: <what proved done>
- core_challenge: <the hard part>
- dependency_shape: series | branch | merge | feedback | layered | mixed
- key_decisions:
  - <decision 1> — because <reason>
  - <decision 2> — because <reason>
- transferable:
  - <what another similar mission could reuse>
- not_mechanical:
  - <what is tied to this mission's data/environment/constraints>
- pitfalls:
  - <what went wrong / what would have helped>
- evidence_anchors:
  - <file path / command / URL> — <what it proves>
- search_tags: [structure tag, data shape, objective type, domain keyword]
```

Rules:

- Keep a card short (roughly 50–150 lines). Do not paste long logs or full
  outputs.
- Distinguish **observed** (we saw/ran it) from **inferred** (we reasoned it).
- Redact private paths, credentials, host details, and unpublished results if
  the card may be read by other missions.
- Do not mark a direction as proven just because a mission completed; record
  the acceptance evidence separately.

### Retrieval (v1)

When a new mission's task-profile discovery suggests a similar structure,
search by tag instead of by domain keyword:

```bash
# list candidate cards
grep -ril "<structure tag OR domain tag>" mission-cases/ | head -20

# inspect the promising ones
sed -n '1,80p' mission-cases/case-<id>.md
```

Read at most 2–3 cards. Treat them as prior experience, not ground truth:

- check the evidence anchors;
- check whether the old mission's constraints/data still apply;
- if a card conflicts with the new mission's evidence, the new mission wins.

Do not auto-inject cards into subagent prompts. The Captain summarizes
relevant transferable points into the new `task-profile.md` or plan, and
marks them as `history` rather than proof.
