# Disposable Profile Evidence: dsh-plugin-llm-verifier

Status: procedure documented; attach real install/start/uninstall output when a disposable profile run is performed.

## Install

```bash
dsh plugin --profile store-test add ./packages/dsh-plugin-llm-verifier
```

## Start / smoke

```bash
dsh --profile store-test headless "load plugin and reply OK"
```

## Uninstall / cleanup

```bash
rm -rf ~/.dsh/profiles/store-test
```
