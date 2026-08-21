---
name: capability-scout
description: Use at mission seams to proactively discover skills, tools, and plugins that could help the current task. Search is multi-angle and repeated, not one shot.
---

# Capability Scout

The Captain should not wait for the user to tell it a skill exists. At key
seams, scout for capabilities with several independent angles.

## When to scout

1. **Intake** — before the first plan is locked.
2. **Replan** — whenever the direction changes.
3. **Repeated rejection** — the current toolkit is clearly missing something.
4. **Before final review** — for validation/reporting tooling (e.g. formatters,
   exporters, checkers).

## How to scout

Run at least these channels, each with 2–3 queries derived from the current
task, not one generic query:

```text
1. skill_search      — local skills by task type, deliverable form, verification method
2. dev_tool_search   — unlockable tools (if available)
3. web_search        — existing DSH plugins/skills, standard tools, best practice checklists
4. list available commands/tools you already have, then re-check their schemas
```

Example for a software task:

```text
skill_search: "code review", "testing", "changelog"
dev_tool_search: "browser automation", "code execution"
web_search: "DSH plugin testing", "how to verify a code patch"
```

Example for a paper task:

```text
skill_search: "latex", "pandoc docx", "paper structure"
dev_tool_search: "document conversion", "citation"
web_search: "how to write a research paper style guide", "DSH plugin document export"
```

## Decide, don't hoard

For each discovered capability, decide in one line:

```text
name: <capability>
use-now: yes/no/install
why: <which task or seam it helps>
```

- Use it immediately only if it serves the current plan.
- Install it only if the benefit outweighs the risk; prefer read-only first.
- Put interesting but irrelevant capabilities in `maybe-later.md`.

## Record

Write the scouting result to `capabilities.md` so the final reviewer can see
that the Captain actively searched, and why it chose or rejected each item.
