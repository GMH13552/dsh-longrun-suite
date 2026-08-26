# Disposable Profile Evidence: dsh-plugin-llm-verifier

Status: procedure documented; attach real install/start/uninstall output when a disposable profile run is performed.

## Install

```bash
dsh profile create store-test
dsh plugin --profile store-test add ./packages/dsh-plugin-llm-verifier
```

## Start / smoke

```bash
dsh profile run store-test --headless --once "load plugin and reply OK"
```

## Uninstall / cleanup

```bash
dsh profile delete store-test
```
