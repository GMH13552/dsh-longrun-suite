---
name: web-research-protocol
description: Use when a mission needs heavy web research — early exploration, uncertain direction, repeated blocks, or before final conclusions. Describes multi-angle search, primary-source fetching, and source logging.
---

# Web Research Protocol

The Captain is expected to use the web aggressively when it matters:

- at the start of a mission, before committing to a plan;
- when a direction is uncertain;
- after 2+ consecutive task rejections;
- before writing final conclusions that depend on outside facts.

## Rules

1. **Search from multiple angles.** Do not settle on the first result. Run
   2–4 searches with different phrasings (e.g. method name, task name,
   recent SOTA, known pitfalls, alternative approaches).
2. **Fetch primary sources for load-bearing claims.** A search summary is not
   evidence. For anything you rely on, fetch the paper, docs, GitHub issue,
   or official page.
3. **Log sources.** Record every source as evidence:
   - URL
   - access date
   - which claim it supports
   - verdict by an independent literature reviewer when the claim matters
4. **Do not launder guesses through search.** A source you did not actually
   read is not evidence.
5. **Use `research-surge` on hard blocks.** When the current direction is
   blocked, do not just try harder. Spawn 3–5 researcher agents in parallel,
   each with a different angle, then have an independent reviewer verify their
   source lists before replanning.

## Example source log

```json
[
  {
    "url": "https://arxiv.org/abs/...",
    "accessed": "2026-08-19",
    "claim": "Method X improves benchmark A by 4%",
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
