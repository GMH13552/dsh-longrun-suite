# DSH LongRun Suite — long-running mission tooling for DeepSeek Harness

> One repository for long-horizon autonomous work: mission control, the Long-Run Captain preset, a strict LLM-as-a-Verifier fork, and a self-wake timer. Clone and install.

[中文 README](README.md) · [Verifier audit notes](docs/llm-verifier-audit.en.md)

## Problem

DSH's built-in `goal` / `todo` / `subagent` tools are great for short tasks, but long, hard missions fail in predictable ways:

1. **Plan once, then stop.** A rejected direction does not trigger a new plan or new tasks.
2. **Fail and halt.** Verification failures stop the run instead of fixing the gap and pivoting.
3. **Human wake-ups required.** Long experiments are not re-checked automatically.
4. **Weak completion criteria.** An empty task list is treated as "done" even when the real goal is unverified.
5. **Subagent overhead.** Durable continuable children are enumerated repeatedly, wasting memory and CPU.

This suite fixes that with file-backed mission state, a tiny generic task lifecycle, data-driven verification plans, independent review, forced replanning on rejection, and timer-based self-wake — **without hardcoding any domain workflow**. Model upgrades, mathematical research, and software projects are all just different `verificationPlan` values.

## Components

| Component | Path | Purpose |
|---|---|---|
| **dsh-mission-control** | `packages/dsh-mission-control/` | mission state machine, `mission_*` tools, meta-validator |
| **Long-Run Captain preset** | `preset/long-run-captain/` | captain persona + protocol skills (web research, adaptive verification, Socratic self-audit, LLM verifier usage) |
| **dsh-plugin-llm-verifier** | `packages/dsh-plugin-llm-verifier/` | patched LLM-as-a-Verifier: `verify_rollout` / `verify_select` / `verify_compare` / `verify_track` |
| **dsh-timer-scheduler-ui** | `packages/dsh-timer-scheduler-ui/` | `schedule_reminder` self-wake + countdown panel |
| **Erdős–Straus example** | `examples/erdos-straus-mission/` | CPU-friendly math mission seed |

## One-command install

Requirements: Node 20+, DSH 0.1.0-rc.8+, a configured LLM provider.

```bash
git clone https://github.com/GMH13552/dsh-longrun-suite.git
cd dsh-longrun-suite
./install.sh            # installs into the web profile
# ./install.sh tui      # another profile
```

The script:

1. Adds the three plugins to your profile.
2. Copies `long-run-captain` into `$DSH_HOME/.agent-presets/`.
3. Prints restart instructions.

Then restart DSH:

```bash
dsh web
```

and start a new session with the **Long-Run Captain** preset.

## Manual install

```bash
dsh plugin --profile web add ./packages/dsh-mission-control
dsh plugin --profile web add ./packages/dsh-plugin-llm-verifier
dsh plugin --profile web add ./packages/dsh-timer-scheduler-ui

mkdir -p "$HOME/.dsh/.agent-presets"
cp -R preset/long-run-captain "$HOME/.dsh/.agent-presets/long-run-captain"
```

> `dsh-plugin-llm-verifier` defaults to `provider: deepseek-official` and `model: deepseek-v4-pro`. Edit the `llm-verifier` row in your profile `cordis.patch.yml` if your routing differs, or edit `packages/dsh-plugin-llm-verifier/cordis.patch.yml` before installing.

## Quick start

In a Long-Run Captain session:

```text
Start a mission: attempt to prove or disprove the Erdős–Straus conjecture.
termination_policy: success
budget: { maxRounds: 12, maxHours: 16 }
Success criteria:
- Provide a complete proof, or a strictly verified counterexample
- Verify n <= 2000 by brute force with script + results as evidence
- Complete a literature review with verifiable sources
- Try at least 2 different proof/construction directions, each with a precise blocker
```

Expected flow:

```text
mission_start
→ heavy early web research
→ mission_add_tasks (acceptance + verificationPlan per task)
→ researcher / engineer / reviewer agents
→ long experiments in background + schedule_reminder self-wake
→ rejected tasks -> mission_replan + replaces -> new direction
→ verify_track monitors direction health
→ mission_final_audit maps every success criterion to evidence
→ mission_complete
```

## Key mechanisms

- Only five task statuses: `open → active → needs_review → accepted / rejected`
- Rejections require a follow-up task via `replaces=...`; otherwise completion is refused
- Default `terminationPolicy=success`: tasks mapped to success criteria must have `outcome=success`
- `mission_check` validates evidence honesty, not domain correctness
- `socratic-self-audit` makes producers attack their own work before submission
- The patched `verify_track` uses the reference implementation's strict calibration prompt and refuses to trust agent narration

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
├── preset/
│   └── long-run-captain/
└── examples/
    └── erdos-straus-mission/
```

## Known limits

- DSH streams do not expose logprobs, so the verifier approximates the paper's logit expectation with repeated sampling
- `schedule_reminder` currently wakes only live sessions; cold resume is a future direction
- Independent review is a procedural boundary, not a sandbox

## Credits

- [LLM-as-a-Verifier](https://github.com/llm-as-a-verifier/llm-as-a-verifier) and its paper
- [dsh-plugin-llm-verifier](https://github.com/uson1x/dsh-plugin-llm-verifier) (this repo contains a locally patched fork)
- [dsh-timer-scheduler](https://github.com/GMH13552/dsh-timer-scheduler)

## License

MIT
