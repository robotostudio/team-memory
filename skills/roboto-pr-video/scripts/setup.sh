#!/usr/bin/env bash
# One-time setup for roboto-pr-video. Safe to re-run.
#   bash scripts/setup.sh
set -uo pipefail
CACHE="$HOME/.cache/roboto-pr-video"
ok() { printf '  ok    %s\n' "$1"; }
bad() { printf '  MISSING %s\n' "$1"; FAIL=1; }
FAIL=0

echo "Checking tools"
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] && ok "node $(node -v)" || bad "Node 20+ (brew install node)"
command -v ffmpeg >/dev/null && ok "ffmpeg" || bad "ffmpeg (brew install ffmpeg)"
command -v python3 >/dev/null && ok "python3" || bad "python3"
if command -v gh >/dev/null; then gh auth status >/dev/null 2>&1 && ok "gh (signed in)" || bad "gh sign-in (gh auth login)"; else bad "gh (brew install gh)"; fi
CHROME="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] && ok "Chrome" || bad "Chrome at $CHROME (or set CHROME_PATH)"

echo "Installing the capture dependency into $CACHE"
mkdir -p "$CACHE"
[ -f "$CACHE/package.json" ] || echo '{"name":"roboto-pr-video-cache","private":true}' > "$CACHE/package.json"
if [ -d "$CACHE/node_modules/playwright-core" ]; then ok "playwright-core"; else
  npm install --prefix "$CACHE" --no-audit --no-fund --loglevel=error playwright-core@1.48.2 && ok "playwright-core" || bad "playwright-core install"
fi

echo "Checking HyperFrames"
npx --yes hyperframes@0.9.56 doctor 2>&1 | tail -n 12

[ "$FAIL" = 0 ] && echo "Ready." || { echo "Fix the MISSING items above, then re-run."; exit 1; }
