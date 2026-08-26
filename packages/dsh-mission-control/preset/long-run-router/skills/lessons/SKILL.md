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
