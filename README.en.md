# DSH LongRun Suite — long-running mission tooling for DeepSeek Harness

> This project explores how AI can run long-horizon research and project work. Deliverables are aimed to be as reliable as possible. It is under active development; please open an issue if you find problems — the author checks them regularly. If you find it useful, a star would be appreciated. Thank you!

> One repository for long-horizon autonomous work: mission control, the Long-Run Captain preset, a strictly reviewed LLM-as-a-Verifier, and a self-wake timer. Clone and install.

[中文 README](README.md)

## Problem

DSH's built-in `goal` / `todo` / `subagent` tools are great for short tasks, but long, hard missions fail in predictable ways:

1. **Plan once, then stop.** A rejected direction does not trigger a new plan or new tasks.
2. **Fail and halt.** Verification failures stop the run instead of fixing the gap and pivoting.
3. **Human wake-ups required.** Long experiments are not re-checked automatically.
4. **Weak completion criteria.** An empty task list is treated as "done" even when the real goal is unverified.
5. **Subagent overhead.** Durable continuable children are enumerated repeatedly, wasting memory and CPU.
6. **Single-point summary loss.** A central agent re-stating worker results drops conditions, numbers, and details.
7. **Primitive worker coordination.** Waiting/chatting leads to duplicated work, double writes, and unclear ownership.
8. **Lazy/downgraded work.** The model writes simplified replacements, ignores existing implementations, or silently replaces a standard method with a weaker one.
9. **Experience loss.** Cross-mission lessons are not searchable and old pitfalls repeat.
10. **Self-assessment inflation.** Producers review their own work without independent/no-memory evaluation.
11. **Unrecoverable long tasks/reminders.** Reminders are lost, fork cold-start fails, and stale reminders fire repeatedly.

This suite fixes that with file-backed mission state, a tiny generic task lifecycle, data-driven verification plans, independent review, forced replanning on rejection, Claim Pool/Lease, Blackboard artifact communication, WorkReceipts, no-memory blind review, LLM Wiki memory, method provenance cards, and timer-based self-wake — **without hardcoding any domain workflow**. Model upgrades, mathematical research, and software projects are all just different `verificationPlan` values.

## Components

| Component | Path | Purpose |
|---|---|---|
| **dsh-mission-control** | `packages/dsh-mission-control/` | mission state machine, `mission_*` tools, Claim Pool/Lease, Blackboard artifacts, Blind Review, LLM Wiki tools, meta-validator |
| **Long-Run Captain preset** | `preset/long-run-captain/` | full system-prompt edition: captain persona + protocol skills (web research, adaptive verification, Socratic self-audit, LLM verifier usage) |
| **Long-Run Captain Router preset** | `preset/long-run-router/` | same capabilities + router-standard minimal first-turn system, tuned for the DeepSeek V4 Flash family |
| **dsh-plugin-llm-verifier** | `packages/dsh-plugin-llm-verifier/` | LLM-as-a-Verifier based on the paper and the upstream DSH plugin, with stricter review and corrections: `verify_rollout` / `verify_select` / `verify_compare` / `verify_track` |
| **dsh-timer-scheduler-ui** | `packages/dsh-timer-scheduler-ui/` | `schedule_reminder` self-wake + header reminder menu |

## The two presets

The suite ships two Long-Run Captain presets with **the same mission capabilities**, differing only in first-turn system prompt shape:

| Preset | Path | System prompt | Models |
|---|---|---|---|
| **Long-Run Captain** | `preset/long-run-captain/` | Full Long-Run Captain persona / rules / skills injected into the always-on system prompt | Any model; heavier first turn |
| **Long-Run Captain Router** | `preset/long-run-router/` | Router-standard minimal first turn only (`You are a helpful software engineer assistant.`); role info is carried by the Role Card in dispatch prompts | **Tuned for DeepSeek V4 Flash** (`deepseek-v4-flash` / `deepseek-v4-flash-vision-exp`) to keep `We / Let's` collective planning |

Rules of thumb:

- For **DeepSeek V4 Flash family**, use **Long-Run Captain Router**: lighter first turn, full mission tools / subagents / timers, and role constraints travel via the Role Card in dispatch prompts.
- For **other models** or when you want the heavier full system prompt, use **Long-Run Captain**.
- Both presets require `dsh-mission-control` and share the same task lifecycle, review and replanning rules.

## DSH Store submission

This repository is a monorepo of three independent DSH plugins. Each plugin
must be submitted with an explicit package path:

| Plugin | Path | Entry ID | Version |
|---|---|---|---|
| dsh-mission-control | `packages/dsh-mission-control` | `dsh-mission-control` | 0.2.0 |
| llm-as-a-verifier | `packages/dsh-plugin-llm-verifier` | `llm-verifier` | 0.9.0 |
| timer-scheduler-ui | `packages/dsh-timer-scheduler-ui` | `timer-scheduler-ui` | 0.2.0 |

Every subpackage declares the exact DSH compatibility matrix in `package.json`.
See [`STORE_SUBMISSION.md`](STORE_SUBMISSION.md).

## Quick start

In a Long-Run Captain or Long-Run Captain Router session:

```text
Start a mission: build a CLI tool that recursively scans a directory of
Markdown files and generates an index.md with heading levels, relative paths,
and last-modified times.
termination_policy: success
budget: { maxRounds: 6, maxHours: 4 }
Success criteria:
- The CLI recursively scans a directory and writes index.md
- The index is organized by heading levels and includes relative paths + mtimes
- 3 test cases are provided and all pass
- A README explains installation and usage
- An independent reviewer verifies the index contents
```

Expected flow:

```text
mission_start
→ heavy early web research + wiki_search for prior experience
→ mission_add_tasks (acceptance + verificationPlan + capabilities)
→ workers claim by capability with mission_claim; long tasks mission_heartbeat; release when unable
→ method-card before non-trivial implementation; reuse first, no speculation
→ long experiments in background + schedule_reminder self-wake
→ workers exchange typed artifacts via mission_publish_artifact / mission_consume_artifacts
→ mission_submit + WorkReceipt, then independent reviewer
→ rejected tasks -> mission_replan + replaces -> new direction
→ verify_track monitors direction health
→ wiki_write for durable lessons; mission_blind_review + wiki_lint before final
→ mission_final_audit maps every success criterion to evidence
→ mission_complete
```

## Key mechanisms

- Only five task statuses: `open → active → needs_review → accepted / rejected`
- Rejections require a follow-up task via `replaces=...`; otherwise completion is refused
- Default `terminationPolicy=success`: tasks mapped to success criteria must have `outcome=success`
- `mission_check` validates evidence honesty, not domain correctness
- `socratic-self-audit` makes producers attack their own work before submission
- `verify_track` uses the reference implementation's strict calibration prompt and refuses to trust agent narration; pivot selection and rollout criteria also follow the reference implementation
- **WorkReceipt**: evidence files are SHA-256 hashed on submit; passing review writes an immutable work receipt
- **Swarm-style worker pool**: tasks can declare `capabilities`; workers claim only matching tasks; leases are extended by `mission_heartbeat`, released by `mission_release`, expired automatically, and blocked after repeated reclaims
- **Blackboard artifact communication**: `mission_publish_artifact` / `mission_consume_artifacts`; workers exchange typed artifacts instead of chatting
- **No-memory blind review**: `mission_blind_review` writes `blind_review.md` + `calibration_gap` and is a hard gate for substantive deliverable missions
- **LLM Wiki memory**: `wiki_write` / `wiki_search` / `wiki_lint` maintain a searchable `.memory/` across missions

## Overall structure

```text
Host / plugin layer
├── dsh-mission-control
│   ├── lib/core.js          # pure mission state machine (no DSH dependency)
│   ├── lib/index.js         # mission_* / wiki_* / artifact tools
│   ├── bin/mission_check.mjs
│   └── preset/              # Captain presets and protocol skills
├── dsh-timer-scheduler-ui    # reminders + auto-cancel + parent fallback
└── dsh-plugin-llm-verifier   # LLM-as-a-Verifier

Agent / preset layer
├── long-run-captain/         # full system-prompt edition
└── long-run-router/          # router-standard minimal edition (DeepSeek V4 Flash tuned)

Skills layer
├── mission-protocol          # decomposition, dispatch, reuse-first, tool map
├── task-profile              # Input/Decision/Output/Core Challenge/No-Lazy
├── plan-critique             # plan critique + A/B/C + module contracts
├── adaptive-verification     # minimum validation package
├── method-card               # method provenance / downgrade detector
├── wiki-memory               # LLM Wiki: ingest/query/lint
├── lessons                   # intra-mission lessons + mission-legacy + mission-cases
└── report-protocol / socratic-self-audit / etc.

Runtime data layer
├── .mission/<id>/mission.json   # mission/task/attempt/receipt/blindReview/artifacts
├── .memory/                     # cross-mission LLM Wiki, capability vocab, worker resumes
├── .mission-cases/              # lightweight case cards
└── timer-reminders.json         # persisted reminders
```

## References & inspiration

This project borrows mechanism-level designs from several public agent systems:

| Project | Borrowed idea | Our adaptation |
|---|---|---|
| **AutoResearch (EvoMap)** | workflow queue, claim pool, lease, receipts, blind review | mission queue + `mission_claim/heartbeat/release` + WorkReceipt + blind-review gate |
| **ZZBoard** | decentralized work board, artifacts, signed receipts | blackboard tools + `mission_publish/consume_artifacts` |
| **Clawix** | LLM Wiki memory, capability vocabulary, role workers | `.memory/` + `wiki_write/search/lint` + `_capabilities.md` + worker resumes |
| **Flock** | blackboard principle: artifacts instead of chat | typed artifact publish/consume |
| **unsorry** | repo-as-queue, claim substrate, expiry/reclaim | lease expiry reclaim + blocked after repeated reclaims |
| **CUMCM math-modeling Skill** | structure diagnosis, A/B/C candidates, minimum validation, innovation evidence | generic Input/Decision/Output + A/B/C + validation package |
| **Karpathy LLM Wiki** | ingest/query/lint wiki memory paradigm | wiki-memory skill + tools |

We adapt, not copy: DSH genericity is preserved and all domain content remains owned by mission/task data.

## Repository layout

```text
dsh-longrun-suite/
├── README.md                 # Chinese entry
├── README.en.md              # English
├── install.sh
├── packages/
│   ├── dsh-mission-control/
│   ├── dsh-plugin-llm-verifier/
│   └── dsh-timer-scheduler-ui/
└── preset/
    ├── long-run-captain/
    └── long-run-router/
```

## Install

Requirements: Node 20+, DSH 0.1.0-rc.8+, a configured LLM provider.

### Option A: one line (plugins only)

```bash
dsh plugin --profile web add github:GMH13552/dsh-longrun-suite
```

This installs all three plugins at once. Then install the presets (both, choose per session):

```bash
# A1: from a clone
git clone https://github.com/GMH13552/dsh-longrun-suite.git
cp -R dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/long-run-captain
cp -R dsh-longrun-suite/preset/long-run-router   ~/.dsh/.agent-presets/long-run-router

# A2: from the installed package
cp -R ~/.dsh/profiles/web/node_modules/dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/long-run-captain
cp -R ~/.dsh/profiles/web/node_modules/dsh-longrun-suite/preset/long-run-router   ~/.dsh/.agent-presets/long-run-router
```

### Option B: clone + one script (recommended; plugins and preset together)

```bash
git clone https://github.com/GMH13552/dsh-longrun-suite.git
cd dsh-longrun-suite
./install.sh            # installs into the web profile
# ./install.sh tui      # another profile
```

The script:

1. Adds the three plugins to your profile.
2. Copies both `long-run-captain` and `long-run-router` into `$DSH_HOME/.agent-presets/`.
3. Prints restart instructions.

Then restart DSH:

```bash
dsh web
```

and start a new session with **Long-Run Captain** (full system prompt) or **Long-Run Captain Router** (DeepSeek V4 Flash optimized minimal edition).

### Manual install

```bash
dsh plugin --profile web add ./packages/dsh-mission-control
dsh plugin --profile web add ./packages/dsh-plugin-llm-verifier
dsh plugin --profile web add ./packages/dsh-timer-scheduler-ui

mkdir -p "$HOME/.dsh/.agent-presets"
cp -R preset/long-run-captain "$HOME/.dsh/.agent-presets/long-run-captain"
cp -R preset/long-run-router   "$HOME/.dsh/.agent-presets/long-run-router"
```

> `dsh-plugin-llm-verifier` defaults to `provider: deepseek-official` and `model: deepseek-v4-flash-vision-exp`. Edit the `llm-verifier` row in your profile `cordis.patch.yml` if your routing differs, or edit `packages/dsh-plugin-llm-verifier/cordis.patch.yml` before installing.

## Known limits

- DSH streams do not expose logprobs, so the verifier approximates the paper's logit expectation with repeated sampling
- `schedule_reminder` currently wakes only live sessions; cold resume is a future direction
- Independent review is a procedural boundary, not a sandbox
- Claim Pool / Lease is file-based (mission.json + timestamps), not a service; expired leases are reclaimed automatically, and 3 reclaims block the task.
- Capability Matching is tag set matching with no built-in ontology; each workspace maintains `.memory/_capabilities.md`.
- Blackboard artifacts store metadata only; real artifact files remain on disk.
- `mission_blind_review` records external ratings and writes `blind_review.md`; it does not generate ratings itself.
- LLM Wiki is Markdown + grep, not a vector DB; `wiki_lint` is text-level only.
- `method-card` / `wiki_*` are mostly soft protocol; only blind review is a hard gate for substantive deliverable missions.

## Credits

- The verifier is based on the [LLM-as-a-Verifier](https://github.com/llm-as-a-verifier/llm-as-a-verifier) paper and [dsh-plugin-llm-verifier](https://github.com/uson1x/dsh-plugin-llm-verifier), with stricter review and corrections
- Self-wake timer based on [dsh-timer-scheduler](https://github.com/GMH13552/dsh-timer-scheduler)

## License

MIT
