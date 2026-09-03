---
name: wiki-memory
description: Lightweight LLM Wiki for cross-mission memory. Maintain a small structured markdown wiki under .memory/ with ingest/query/lint operations, a _schema page, and [[slug]] cross-links. Use at mission seams to distill reusable methods, pitfalls, decisions, and mission summaries.
---

# Wiki Memory (LLM Wiki)

This is the Long-Run adaptation of the LLM Wiki pattern used by Clawix
(ingest / query / lint) and inspired by the Karpathy LLM Wiki idea. It is a
lightweight v1: plain Markdown files, a schema page, grep-based search, and a
lint checklist. No vector DB, no service, no heavy engine.

## Directory layout

```text
.memory/
├── _schema.md
├── methods/
├── pitfalls/
├── decisions/
└── missions/
```

One page = one coherent topic. Pages cross-link with `[[slug]]` markers.

## Schema template (`_schema.md`)

Copy this into `.memory/_schema.md`; the agent should read it before writing
and follow it literally.

```markdown
# Wiki Schema

This page describes how to organize this memory wiki. The agent reads it at
the start of every session and follows these conventions.

## Tag conventions

- `domain:<x>` — exactly one per page when using non-daily tags.
  Groups pages in the index (e.g. `domain:research`, `domain:engineering`).
- `daily:YYYY-MM-DD` — daily notes; exempt from the domain rule.
- Other free-form tags — searchable chips.

User-profile facts (name, timezone, role, preferences, workspace secrets)
belong in the mission/workspace files, not in wiki pages — keep them out so
the two stores do not drift.

## Scope

- **AMBIENT** — pages whose full content auto-loads into every session.
  Small cap; use only for current project state or things you must know
  without asking.
- **ARCHIVED** (default) — pages retrieved on demand via search/read.
  Use for methods, pitfalls, decisions, references.

## Linking

Reference other pages with `[[slug]]` markers inside content. Resolved links
become backlinks future-you can navigate.

## Page anatomy

Each page has:

- `title` — human-readable
- `slug` — derived from title, used in `[[slug]]` links
- `summary` — one-liner shown in the index (required)
- `content` — markdown body
- `tags` — one `domain:<x>` plus optional free tags
```

## `wiki_write` contract

Use this when ingesting something new. Write or update a page under
`.memory/`.

Before writing a new page:

1. Scan the index/summaries and call `wiki_search` whenever you are not sure
   — both to **avoid duplicating existing pages** and to **find related pages
   you should cross-link**.
2. Add a `summary` one-liner (required for index visibility).
3. Use `[[slug]]` markers in content to link related pages.
4. After writing, review search/candidate results and, when genuinely
   related, add the missing `[[slug]]` markers so the connection works in
   both directions.
5. Do **not** use this for user-profile facts, credentials, or environment
   secrets; those belong in mission/workspace files.
6. Mark a page `AMBIENT` only when it is current project state that should
   be loaded without asking. Default is `ARCHIVED`.

## `wiki_search` query contract

Use this when the index does not surface what you need, or when you remember
a phrase but not the page name.

```bash
# list page summaries/index
find .memory -name '*.md' | sort

# free-text search across the wiki
grep -ril "<query>" .memory | head -20

# scope by domain/tag
grep -ril "domain:research" .memory | head -20
```

Then read at most 2–3 relevant pages with `sed`/`read`, and treat them as
`history` — never as proof. If they conflict with current evidence, current
evidence wins.

## `wiki_lint` checks

Run at mission seams (mission end, before final review, or when memory has
grown). Findings only; no auto-fix.

| Check | What to look for |
|---|---|
| `orphans` | Pages with no incoming `[[slug]]` links, unless they are AMBIENT/daily |
| `missing-summaries` | Pages without a one-line summary |
| `stale-claims` | Pages older than ~6 months containing date-sensitive claims |
| `broken-links` | `[[slug]]` links whose target page does not exist |

Simple scan:

```bash
# broken links
grep -Rho '\[\[[^]]*\]\]' .memory | sort | uniq
# then check each slug has a matching file
```

Manual repair discipline:

- Prefer merge over duplicate: if two pages cover the same topic, merge and
  leave a redirect note.
- When a claim is superseded, edit the page in place and record the change,
  do not append a contradictory paragraph.
- If a page is no longer useful, mark it `[retired]` in the content rather
  than silently deleting evidence.

## When to use

- **Mission start**: run `wiki_search` for methods/pitfalls relevant to the
  new task; summarize useful points into `task-profile.md` as `history`.
- **Mission seams**: after significant findings, write/update pages.
- **Mission end**: distill lessons into `methods/`, `pitfalls/`,
  `decisions/`, and `missions/`, then run `wiki_lint`.
- **Before final audit**: check no stale/conflicting memory is being used as
  evidence.
