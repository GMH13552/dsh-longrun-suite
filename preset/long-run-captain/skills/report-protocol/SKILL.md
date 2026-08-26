---
name: report-protocol
description: Use before finishing a mission to decide and verify the right deliverable form. Domain-neutral: paper, code release, design doc, runbook, audit, analysis summary, or a combination — chosen from the goal, not assumed.
---

# Output Protocol

A mission does not automatically end in a paper. The Captain must decide the
deliverable form from the goal, and verify that form before completion.

## Step 0 — Decide the deliverable form

Look at the goal and the user's words. Pick the smallest form that makes the
claim verifiable and usable:

| If the goal is | Likely deliverable |
|---|---|
| A new claim, theorem, result, or study | short paper / report, with the claim + evidence |
| Build / fix / extend software | working code + tests + README/changelog + brief design notes |
| Data analysis or measurements | reproducible scripts + results + a short findings summary |
| Investigate / audit / review something | findings report mapped to evidence, not a paper |
| Operate / configure / migrate | runbook / checklist / decision memo + verification log |
| Explain / compare / advise | structured briefing or decision memo |
| User explicitly asks for a paper / Word / slides | that exact form, in that order |

Do not default to "paper". If the user did not ask for one and the goal is not
a research claim, a paper is usually the wrong artifact. If the form is
genuinely ambiguous, state the chosen form in the plan and make it a success
criterion; do not stop and ask unless the user's own words conflict.

## Step 1 — Define the form contract in the plan

During planning, record in `plan.md` (and in `task-profile.md` / a
referenced `deliverable-contract.md`):

```text
deliverable: code-release | report | paper | design-doc | runbook | audit | summary | other
files: <exact paths>
audience: <who reads/uses this>
voice/tone: <objective contest paper, tutorial, decision memo, technical doc, ...>
style exemplars: <which prior work/template to follow; what to borrow>
forbidden voice: <what must NOT appear, e.g. conversational 你/我/我们 in a formal paper>
export formats: <PDF + Word, Markdown, repo, xlsx, ...>
acceptance: <what "usable" means for this deliverable>
style review: <which review task/persona checks the style gate>
```

This contract becomes part of the mission's success criteria, so the final
audit checks the actual form and voice, not an assumed one.

## Step 1.5 — Plan a dedicated style/audience review

A text deliverable always needs an explicit `deliverable-style` task in the
DAG (`kind: deliverable-style`, `assignee: reviewer`). It must verify:

1. Is the form exactly what the contract says?
2. Does the voice/tone match the audience (formal contest paper, user-facing
   docs, internal memo, etc.)?
3. Are the style exemplars honored without importing their content?
4. Is the forbidden-voice list clean (no conversational “你/我/我们” in a
   formal paper, no unmarked opinion, no marketing tone)?
5. Are export formats produced and rendering correctly (fonts, tables,
   figures, links)?

This review runs **before** `subagent_final_reviewer`; it is not folded into
the technical pass.

## Step 2 — Common quality gates (form-independent)

Whatever the form:

1. **One through-line.** The deliverable has one main claim/change/answer;
   everything else supports it.
2. **Evidence mapping.** Every claim maps to an accepted task or artifact.
3. **No filler.** Remove irrelevant web content, failed-attempt logs from the
   body, and decorative text.
4. **Readable artifacts.** For text: clean structure, correct math (LaTeX if
   needed), working links. For code: it builds, tests pass, docs match
   behavior.
5. **Honest evidence level.** Distinguish proven / tested / measured /
   conjectured / cited.
6. **Export only what the contract asks.** Paper → PDF (+Word if requested);
   code → repository/tarball with CI evidence; runbook → markdown/PDF.

## Step 3 — Structure templates

**Paper / research report**

```text
摘要 → 引言 → 问题/背景 → 方法 → 结果与证据 → 讨论（含失败方向）→ 结论 → 附录
```

**Software release**

```text
README（what/why/how）→ design-notes（关键决策）→ tests/results → changelog
```

**Audit / investigation**

```text
scope → findings（每条映射证据）→ severity/impact → recommendations → verification log
```

**Runbook / decision memo**

```text
context → decision → steps → rollback/risks → verification checklist
```

These are starting points. The chosen form can mix several of them.

## Step 4 — Style/audience review and synthesis review

Before `mission_complete`:

1. Run the **deliverable-style review** from Step 1.5. It must pass.
2. Spawn `subagent_final_reviewer` with the deliverable contract and the actual
   artifact. It must answer:

   1. Is this the right form for the goal, or did the Captain default to a
      paper out of habit?
   2. Does the deliverable have one through-line and map every claim to
      accepted evidence?
   3. Is it complete and usable according to the contract?
   4. Is there filler, overclaim, or broken rendering/links/tests?
   5. Does the conclusion/README overclaim?
   6. Does the voice/tone/audience match the Deliverable Contract, or does it
      read like a model talking to the user rather than the intended audience
      (e.g. a contest submission)?
   7. Is the completion claim honest: fresh evidence + covered scope +
      residual risk? If any of the three is missing, reject as overclaim.

Only a pass on both the style review and the synthesis review allows
`mission_final_audit` to proceed.
