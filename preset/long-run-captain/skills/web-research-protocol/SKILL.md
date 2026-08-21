---
name: web-research-protocol
description: Use when a mission needs heavy web research — early exploration, uncertain direction, repeated blocks, or before final conclusions. Describes multi-angle search, primary-source fetching, and source logging.
---

# Web Research Protocol

The Captain is expected to use the web aggressively when it matters:

- at the start of a mission, before committing to a plan;
- when a direction is uncertain;
- after 2+ consecutive task rejections;
- before final review / cutoff — search how experienced people evaluate and
  structure this kind of deliverable;
- before writing conclusions that depend on outside facts.

Every search burst starts with a purpose card from `purpose-bounded-search`:
what I may borrow (style, structure, methods, facts) and what I may not
(content, conclusions, direction).

## Rules

1. **Search from multiple angles.** Do not settle on the first result. Run
   2–4 searches with different phrasings (e.g. method name, task name,
   recent SOTA, known pitfalls, alternative approaches, "how to evaluate X").
2. **Fetch primary sources for load-bearing claims.** A search summary is not
   evidence. For anything you rely on, fetch the paper, docs, GitHub issue,
   or official page.
3. **Log sources with purpose.** Record every source as evidence:
   - URL
   - access date
   - which claim it supports
   - purpose: style / structure / method / fact / evaluation
   - verdict by an independent literature reviewer when the claim matters
4. **Do not launder guesses through search.** A source you did not actually
   read is not evidence.
5. **Drift guard.** If a source suggests changing the mission direction or
   content, do not apply it. Save it to `maybe-later.md`.
6. **Use `research-surge` on hard blocks.** When the current direction is
   blocked, do not just try harder. Spawn 3–5 researcher agents in parallel,
   each with a different angle, then have an independent reviewer verify their
   source lists before replanning.
7. **Experience summary at final review.** Before the final reviewer runs,
   produce `lessons.md`: how similar work is evaluated, common failure modes,
   and which of our decisions the lessons support or challenge.

## Example source log

```json
[
  {
    "url": "https://arxiv.org/abs/...",
    "accessed": "2026-08-19",
    "claim": "Method X improves benchmark A by 4%",
    "purpose": "method",
    "verified": false,
    "verifier": null
  }
]
```

## Boundaries

- Web evidence supports a direction, but final acceptance still requires local
  artifacts (logs, metrics, derivations, code) unless the task's
  verificationPlan explicitly accepts web evidence.
- Never present an unverified source as fact in the final report.
