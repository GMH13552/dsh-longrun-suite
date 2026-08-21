---
name: report-protocol
description: Use when producing the final mission report. A domain-neutral quality protocol: one coherent through-line, standard report structure, readable math/diagrams, clean export formats, and a synthesis review before submission.
---

# Report Protocol

A mission report is not a pile of task summaries. It must present ONE
coherent contribution and be readable by a skeptical outsider.

## 1. The through-line rule

The report opens with a single-sentence contribution statement. Every later
section exists to support that sentence. If a section does not support it,
delete the section or revise the through-line.

## 2. Standard structure (domain-neutral)

```text
1. 摘要 / Abstract        — the one-sentence claim + evidence summary
2. 引言 / Introduction    — why this matters, what exists, what is missing
3. 问题定义 / Problem     — precise definitions, scope, assumptions
4. 方法 / Approach        — the actual idea, with reasoning, not narration
5. 结果 / Results         — evidence mapped to each claim
6. 讨论 / Discussion      — what is proven, what is verified, what is open
7. 结论 / Conclusion      — the claim restated with its exact evidence level
8. 附录 / Appendix        — scripts, data, long derivations
```

For software projects the same skeleton maps to: motivation, design,
implementation, tests/results, limitations, conclusion.

## 3. Quality gates

- **No orphan content.** Anything copied from the web must support a claim
  and must have a source entry; irrelevant searches are evidence, not prose.
- **Readable formulas.** Use proper LaTeX math (`$...$`, `$$...$$`), compile
  the PDF, and check that no formula renders as raw text or broken markup.
- **No failure logs in the body.** Failed directions go in Discussion or
  Appendix only when they inform the through-line. Do not pad the body with
  "we tried X, it failed" lists.
- **Every claim carries an evidence level.** Theorem / verified computation /
  conjecture / citation. Never mix them.
- **The abstract is written last**, after the through-line is settled.
- **The conclusion does not overclaim.** It repeats the claim with the
  evidence level established in Results.

## 4. Export

Produce at least:

- a clean Markdown or LaTeX source;
- if formulas exist, a compiled PDF via `pdflatex` / `tectonic` / pandoc;
- a Word `.docx` via pandoc when the user asks:
  `pandoc report.md -o report.docx`;
- a Chinese version and an English version when the user asks, with the same
  structure and the same through-line.

## 5. Synthesis review

Before `mission_complete`, spawn `subagent_final_reviewer` with the report
and the mission record. It must answer:

1. Is there exactly one through-line, and does every section support it?
2. Does every claim map to accepted evidence?
3. Are the formulas correct and readable?
4. Is there any irrelevant content that should be removed?
5. Does the conclusion overclaim?

Only a pass allows `mission_final_audit` to proceed.
