---
name: purpose-bounded-search
description: 'Use whenever web search could help a mission: uncertain/difficult points, planning, review, report style, or final decision. Keeps search anchored to a declared purpose so borrowed style or methods do not silently drift into borrowed content.'
---

# Purpose-Bounded Search

Web search is an instrument with a declared purpose. Before searching, write a
small **purpose card**; after searching, check every source against it. This is
what prevents "I searched for writing style and accidentally changed the whole
direction".

## When to search

Search at these seams, not continuously:

1. **Intake** — has this kind of task been done before? What are the known
   hard parts, acceptance standards, and deliverable forms?
2. **Uncertainty** — a fact, method, or definition is unclear; a claim needs a
   primary source.
3. **Difficulty / repeated rejection** — how have others solved this class of
   problem? What alternatives exist?
4. **Before final review / cutoff** — how do experienced people evaluate this
   kind of deliverable? What does a good example look like? What commonly
   goes wrong?
5. **Style / format only** — how is this kind of artifact usually written,
   structured, or presented?

## Purpose card

Write this before every search burst, in one short block:

```text
purpose:         <why am I searching; what decision it feeds>
borrow:          <what I may take: style, structure, methods, facts, examples>
forbidden:       <what I may NOT take: content, conclusions, direction>
stop-when:       <what evidence ends this search>
```

Examples:

- Paper style: `borrow: structure and prose style of classic papers in the field; forbidden: their content, problem choice, conclusions`.
- Final review: `borrow: evaluation checklists and common failure modes for this deliverable type; forbidden: changing the deliverable to match someone else's result`.
- Method search: `borrow: algorithms/techniques and their conditions; forbidden: importing their specific problem or claims`.

## Search execution

1. Run 2–4 queries from different angles, including at least one that targets
   the task type and one that targets "how to do/evaluate X well".
2. Prefer primary sources for load-bearing facts: papers, official docs,
   GitHub issues, manuals.
3. Record each source with: URL, access date, purpose, and what was taken.
4. If a source tempts you to change the mission direction, do NOT change it.
   Save the idea to a `maybe-later.md` and continue with the declared purpose.

## Drift guard

After each search burst, answer:

- Did every borrowed element match the declared `borrow` list?
- Did the mission goal or deliverable form change because of a source?
- Would the user recognize this as the same task they gave?

If the answer to the middle question is yes, revert the change and write it in
`maybe-later.md` as an alternative direction — then mention it in `plan.md`
only if the current direction dies.

## Experience summary

At the final-review / cutoff seam, produce a short `lessons.md`:

```text
- what experienced practitioners check for this kind of deliverable
- common failure modes seen in similar work
- which of our decisions these lessons support or challenge
- sources
```

The final reviewer reads `lessons.md` together with the deliverable, but the
lessons may not override the mission's own evidence.
