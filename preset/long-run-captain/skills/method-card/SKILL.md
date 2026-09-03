---
name: method-card
description: Create a method provenance card before non-trivial implementation/research. Explicitly records existing vs verified-no-existing vs uncertain, standard methods, downgrades, and unsupported hypotheses. Use to make reuse-first and no-speculation auditable.
---

# Method Card

Before any non-trivial implementation/research, write `method-card.md` in the
mission workspace. It is the audit trail for:

- what was reused vs newly written;
- whether a standard method was silently downgraded;
- whether a guess is being treated as fact.

## When to use

- Before implementing a non-trivial module/algorithm/pipeline.
- When a task has multiple possible methods.
- When a reviewer needs to know why a simpler method was chosen.
- When you suspect there may be an existing implementation.

## Template

```markdown
# Method Card: <task/module>

## Problem class
- type: optimization | prediction | estimation | simulation | decision | classification | other
- data shape: ...
- constraints: ...
- success criteria: ...

## Standard / known approaches
| Approach | Source | Why applicable / not applicable |
|---|---|---|
| A | paper/URL/repo | ... |
| B | paper/URL/repo | ... |

## Classification per component
| Component | Status | Evidence |
|---|---|---|
| X | existing / verified-no-existing / uncertain | search terms, paths/URLs checked, why |
| Y | ... | ... |

Reuse decision:
- reused: <source + what adapted>
- self-implemented: <verified no existing evidence>
- uncertain: <hypothesis + verification plan>

## Method downgrade check
- Is there a known standard method that should be used?
  - gradient-based optimization, exact solver, Monte Carlo,
    uncertainty propagation, multi-objective solver, etc.
- Did we use a simpler substitute?
  - grid search, fixed scenarios, point estimates, single seed, weighted sum...
- If yes, why is the downgrade justified? (data/time/feasibility evidence)
- If not justified, say so honestly.

## Hypotheses / assumptions
- List every non-evidence-backed claim.
- Mark each as `hypothesis` or `assumption`.
- Give a verification plan for each.

## Sources
- Link/path + what was borrowed from each.
- Distinguish “observed in source” vs “our inference”.
```

## Hard rules

1. `verified-no-existing` is a factual claim: list actual search terms,
   paths/URLs/entries checked, and why they do not fit.
2. If a standard method exists and is applicable, reusing or adapting it is the
   default. A new implementation must explain what was missing.
3. Downgrades must be explicit and justified. If not justified, the reviewer
   should reject.
4. Guesswork is not evidence. Label it and plan verification.
5. Use `wiki_write` to store reusable method/downgrade knowledge in
   `.memory/methods/` and `.memory/pitfalls/`.
