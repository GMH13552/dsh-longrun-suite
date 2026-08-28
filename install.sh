#!/usr/bin/env bash
# DSH LongRun Suite one-command installer.
# Usage: ./install.sh [profile]   (default profile: web)
set -euo pipefail

PROFILE="${1:-web}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PRESETS_DIR="$DSH_HOME/.agent-presets"

if ! command -v dsh >/dev/null 2>&1; then
  echo "ERROR: dsh not found on PATH. Install DeepSeek Harness first." >&2
  exit 1
fi

echo "==> dsh $(dsh --version 2>/dev/null || true)"
echo "==> profile: $PROFILE"
echo "==> installing plugins from $ROOT"

dsh plugin --profile "$PROFILE" add "$ROOT/packages/dsh-mission-control"
dsh plugin --profile "$PROFILE" add "$ROOT/packages/dsh-plugin-llm-verifier"
dsh plugin --profile "$PROFILE" add "$ROOT/packages/dsh-timer-scheduler-ui"

echo "==> installing presets into $PRESETS_DIR"
mkdir -p "$PRESETS_DIR"
for name in long-run-captain long-run-router; do
  src="$ROOT/preset/$name"
  dst="$PRESETS_DIR/$name"
  if [ -d "$dst" ]; then
    cp -R "$src/." "$dst/"
  else
    cp -R "$src" "$dst"
  fi
done

echo ""
echo "Done. Next:"
echo "  1. restart DSH, e.g.:  dsh web"
echo "  2. create a new session and select:"
echo "       'Long-Run Captain'         -> full system-prompt edition (any model)"
echo "       'Long-Run Captain Router'  -> router-standard minimal first turn, tuned for DeepSeek V4 Flash"
echo "  3. check the llm-verifier row in $DSH_HOME/profiles/$PROFILE/cordis.patch.yml"
echo "     and adjust provider/model if your routing differs"
