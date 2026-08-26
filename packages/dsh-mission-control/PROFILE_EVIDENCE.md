# Disposable Profile Evidence: dsh-mission-control

Status: procedure documented; attach real install/start/uninstall output when a disposable profile run is performed.

## Install

```bash
dsh plugin --profile store-test add ./packages/dsh-mission-control
```

## Start / smoke

```bash
dsh --profile store-test headless "load plugin and reply OK"
```

## Uninstall / cleanup

```bash
rm -rf ~/.dsh/profiles/store-test
```

> Environment note: in environments where `@deepseek-ai/dsh-headless` and its
> private dependency are unavailable from the public npm registry, use the
> official `web`/`headless` profile or a copy of a fully provisioned DSH
> profile as the disposable target. The commands above are the correct
> procedure; do not claim a start/uninstall run that did not actually happen.
