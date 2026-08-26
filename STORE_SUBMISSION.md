# DSH STORE Submission / Standardization

This repository is a **monorepo of three independent DSH plugins**. Each
plugin must be submitted with an explicit package path so the fixed-Commit
store check can identify a single plugin candidate.

## Plugin paths

| Plugin | Package path | Entry ID | Version |
|---|---|---|---|
| Mission Control | `packages/dsh-mission-control` | `dsh-mission-control` | 0.2.0 |
| LLM-as-a-Verifier | `packages/dsh-plugin-llm-verifier` | `llm-verifier` | 0.9.0 |
| Timer Scheduler UI | `packages/dsh-timer-scheduler-ui` | `timer-scheduler-ui` | 0.2.0 |

Explicit submission URLs:

```text
https://github.com/GMH13552/dsh-longrun-suite/tree/main/packages/dsh-mission-control
https://github.com/GMH13552/dsh-longrun-suite/tree/main/packages/dsh-plugin-llm-verifier
https://github.com/GMH13552/dsh-longrun-suite/tree/main/packages/dsh-timer-scheduler-ui
```

## Compatibility

All three packages declare the same compatibility matrix in their
`package.json`.

```json
"dsh": {
  "compatibility": {
    "dshReleases": {
      "0.1.0-rc.8": "compatible",
      "0.1.1-rc.1": "compatible",
      "0.1.1-rc.2": "compatible"
    },
    "dsh": ">=0.1.0-rc.8 <0.2.0",
    "node": ">=20"
  }
}
```

## Entry IDs / protected packages

The entry IDs are plugin-owned and additive:

- `dsh-mission-control`
- `llm-verifier`
- `timer-scheduler-ui`

The repo does not replace, shadow, or impersonate any `@deepseek-ai/*`
official DSH component.

## One-time Profile evidence plan

For each plugin, a disposable DSH profile should be used to record
install / start / uninstall evidence:

```bash
# Create a disposable profile and add the plugin package
dsh plugin --profile store-test add ./packages/dsh-mission-control

# Start the profile once (headless one-shot), then clean up
dsh --profile store-test headless "Reply OK"
rm -rf ~/.dsh/profiles/store-test
```

The same procedure applies to the other two packages, substituting the
package path. Evidence files with concrete outputs should be added to each
package directory when a real disposable-profile run is performed.
