# dsh-mission-control

A minimal, data-driven long-running mission controller for
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).

It is **not** a workflow engine with hardcoded domain steps. It provides:

- a tiny task lifecycle: `open → active → needs_review → accepted / rejected`
- per-task `verificationPlan` data (benchmark, proof, code-review, literature, custom — anything)
- independent review enforcement: self-review is rejected
- role-kind enforcement: tasks must carry a generic `kind` (`research`,
  `engineering`, `review`, `deliverable-style`, `synthesis`,
  `bookkeeping`, `coordination`); the controller rejects `captain` for
  substantive kinds at add/claim time
- structural evidence gates via `mission_check`
- free replanning: tasks can be added, removed, rewired, or new goals appended at any time
- **autonomous continuation**: a rejected task must be superseded by a follow-up task (`replaces=...`) before completion; this prevents “fail once then stop”
- `mission_update_task` to rewire dependencies after a rejection
- `outcome` on submitted tasks + `terminationPolicy` on missions: by default completion requires every mapped task to be `outcome=success`; partial reports are only allowed after budget exhaustion with `budget-or-success`
- a `socratic-self-audit` skill that forces producers to attack their own work before independent review (domain-neutral)
- an `llm-verifier-protocol` skill for integrating LLM-as-a-Verifier tools (`verify_rollout` / `verify_select` / `verify_compare` / `verify_track`) into deep reasoning and direction monitoring
- strict final audit: completion requires every success criterion mapped to accepted evidence

## Components

| Path | Purpose |
|---|---|
| `lib/core.js` | Pure mission logic (no DSH imports, unit-testable) |
| `lib/index.js` | Host plugin registering `mission_*` tools |
| `bin/mission_check.mjs` | CLI meta-validator |
| `preset/long-run-captain/` | Agent preset with Captain persona + protocol skills |

## Install

Recommended: install via the DSH LongRun Suite installer at the repository
root, which adds this plugin, the llm-verifier fork, the timer scheduler, and
the preset together.

### 1. Host plugin (mission tools)

```sh
cd path/to/dsh-longrun-suite
dsh plugin --profile web add ./packages/dsh-mission-control
```

### 2. Preset

```sh
mkdir -p ~/.dsh/.agent-presets
cp -R path/to/dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/long-run-captain
```

Then restart DSH and start a new session with **Long-Run Captain**.

### 3. Optional: LLM-as-a-Verifier

Install the locally patched fork from the suite:

```sh
dsh plugin --profile web add ./packages/dsh-plugin-llm-verifier
```

The fork ships a `cordis.patch.yml` with provider/model defaults; edit the
profile `cordis.patch.yml` if your routing differs. The `verify_*` tools then
become available to the Captain.

## Usage

In a session:

1. `mission_start` with a goal and success criteria.
2. Write the Deliverable Contract, do early web research, then
   `mission_add_tasks` with per-task `kind`, `assignee`, and `verificationPlan`.
3. `mission_claim` → work → `mission_submit` with evidence → spawn an independent reviewer → `mission_review`.
4. On rejection: read the gap, `mission_replan`, add a replacement task with `replaces=<rejected id>`, use `mission_update_task` to rewire dependents, and continue. Do not stop after one failure.
5. Before submitting non-trivial work, load `socratic-self-audit` and include `self-check.md`.
6. When you believe the mission is done: `mission_final_audit`, `mission_check`, optional `subagent_final_reviewer`, then `mission_complete`.

## CLI

```sh
node bin/mission_check.mjs <path-to-mission.json>
node bin/mission_check.mjs <path-to-mission.json> --final
```

The validator refuses:

- accepted tasks without a pass review or evidence;
- pass reviews that are missing `verificationPlan.requiredEvidence`;
- rejected tasks without a follow-up (`supersededBy`);
- completed missions without a passed final audit;
- missing final report files.

## Development

```sh
node --test test/core.test.mjs
```

## Design principle

> Hardcode the meta-rules: no self-certification, evidence is required, and
> completion must map every success criterion to accepted evidence.
> Do not hardcode domain workflows: verification plans, task types, and
> replanning decisions are data owned by the Captain.
