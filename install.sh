#!/usr/bin/env bash
# DSH LongRun Suite one-command installer.
# Usage: ./install.sh [profile]   (default profile: web)
set -euo pipefail

PROFILE="${1:-web}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PRESET_SRC="$ROOT/preset/long-run-captain"
PRESET_DST="$DSH_HOME/.agent-presets/long-run-captain"

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

echo "==> installing preset into $PRESET_DST"
mkdir -p "$(dirname "$PRESET_DST")"
if [ -d "$PRESET_DST" ]; then
  cp -R "$PRESET_SRC/." "$PRESET_DST/"
else
  cp -R "$PRESET_SRC" "$PRESET_DST"
fi

echo ""
echo "Done. Next:"
echo "  1. restart DSH, e.g.:  dsh web"
echo "  2. create a new session and select the 'Long-Run Captain' preset"
echo "  3. check the llm-verifier row in $DSH_HOME/profiles/$PROFILE/cordis.patch.yml"
echo "     and adjust provider/model if your routing differs"
