#!/bin/sh
# Build the foreman layout from the calling pane: caller top-left, worker top-right, terminal across the bottom.
# Saves {"worker":"<pane>","terminal":"<pane>","name":"<agent name>","tab":"<tab>"} to .foreman/panes.json and
# writes .foreman/env.sh (WORKER, TERM_PANE, W, SKILL_DIR, WORKER_PROMPT) for every later shell to source.
# The agent name is per tab because herdr agent names must be unique across the whole server.
set -eu
test "${HERDR_ENV:-}" = 1 || { echo "not inside herdr" >&2; exit 1; }
test -n "${HERDR_TAB_ID:-}" || { echo "HERDR_TAB_ID unset" >&2; exit 1; }
skill_dir=$(cd "$(dirname "$0")/.." && pwd)
test -s "$skill_dir/worker-prompt.md" || { echo "missing $skill_dir/worker-prompt.md" >&2; exit 1; }
alive() { herdr pane process-info --pane "$1" >/dev/null 2>&1; }
write_env() {
  cat > .foreman/env.sh <<EOS
WORKER=$1
TERM_PANE=$2
W=$3
SKILL_DIR='$skill_dir'
WORKER_PROMPT=\$(cat "\$SKILL_DIR/worker-prompt.md")
test -n "\$WORKER_PROMPT" || { echo "worker-prompt.md missing, stop" >&2; false; }
EOS
  cat .foreman/panes.json
}
if [ -f .foreman/panes.json ]; then
  w=$(jq -r .worker .foreman/panes.json); t=$(jq -r .terminal .foreman/panes.json); tab=$(jq -r .tab .foreman/panes.json)
  if [ "$tab" = "$HERDR_TAB_ID" ] && alive "$w" && alive "$t"; then write_env "$w" "$t" "$(jq -r .name .foreman/panes.json)"; exit 0; fi
  echo "stale .foreman/panes.json (other tab or closed panes), rebuilding" >&2
  if [ "$tab" = "$HERDR_TAB_ID" ]; then for p in "$w" "$t"; do alive "$p" && herdr pane close "$p" >/dev/null 2>&1 || true; done; fi
  rm -f .foreman/panes.json
fi
exclude=$(git rev-parse --git-path info/exclude)
# Close any pane created here if the script dies before panes.json records it.
created=""; done_ok=""
trap 'test -n "$done_ok" || for p in $created; do herdr pane close "$p" >/dev/null 2>&1 || true; done' EXIT
out=$(herdr pane split --current --direction down --ratio 0.7 --cwd "$PWD" --no-focus)
term=$(printf '%s' "$out" | jq -er .result.pane.pane_id); created="$term"
out=$(herdr pane split --current --direction right --ratio 0.5 --cwd "$PWD" --no-focus)
worker=$(printf '%s' "$out" | jq -er .result.pane.pane_id); created="$term $worker"
herdr pane rename "$term" terminal >/dev/null 2>&1 || true
herdr pane rename "$worker" worker >/dev/null 2>&1 || true
mkdir -p .foreman "$(dirname "$exclude")"
grep -qx '.foreman/' "$exclude" 2>/dev/null || echo '.foreman/' >> "$exclude"
name="worker-$(printf '%s' "$HERDR_TAB_ID" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9\n' '-')"
printf '{"worker":"%s","terminal":"%s","name":"%s","tab":"%s"}\n' "$worker" "$term" "$name" "$HERDR_TAB_ID" > .foreman/panes.json
done_ok=1
write_env "$worker" "$term" "$name"
