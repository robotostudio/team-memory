#!/bin/sh
# lock.sh <command...>: run a command under the machine-wide check lock, the one .foreman/lock.sh takes too, so no two
# checks run at once (mkdir is atomic on macOS; no flock here). Waits up to 90 minutes and never fails on contention;
# a lock older than 2 hours is stale. The holder's pid is inside the lock, and only the holder releases it.
set -u
# The whole script is one block that exits inside it: bash parses it before running a line, so an edit while it runs
# (nora's check waits up to 90 min) can't make it read on at its old offset in the new file (round 21).
{
# LOCK_PRIORITY=1 (nora's landing check) goes before every waiter without it: it registers in $LOCK.next, and they
# don't take the lock while it waits (ROB-4321's check waited 20 min behind engineers' checks, 2026-09-28).
# CHECK_LOCK and LOCK_POLL are for tests only.
LOCK=${CHECK_LOCK:-/tmp/software-factory-check.lock}
NEXT=$LOCK.next
POLL=${LOCK_POLL:-10}
PRIO=${LOCK_PRIORITY:-}
# A priority waiter other than us, still alive.
ahead() { N=$(cat "$NEXT" 2>/dev/null); [ -n "$N" ] && [ "$N" != "$$" ] && kill -0 "$N" 2>/dev/null; }
[ -n "$PRIO" ] && { echo $$ > "$NEXT"; trap '[ "$(cat "$NEXT" 2>/dev/null)" = "$$" ] && rm -f "$NEXT"' EXIT INT TERM; }
# The lock's age in seconds; 0 once it is gone, so a release between the test and the stat can't abort sh.
age() { echo $(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || date +%s) )); }
i=0
until { [ -n "$PRIO" ] || ! ahead; } && mkdir "$LOCK" 2>/dev/null; do
  if [ -d "$LOCK" ] && [ "$(age)" -gt 7200 ]; then rm -rf "$LOCK" 2>/dev/null; continue; fi
  # A holder that died without its trap (SIGKILL) leaves the lock behind: sweep it once its pid is gone.
  P=$(cat "$LOCK/pid" 2>/dev/null); if [ -n "$P" ] && ! kill -0 "$P" 2>/dev/null; then rm -rf "$LOCK" 2>/dev/null; continue; fi
  # A taker killed between its mkdir and its pid write leaves an empty lock: sweep it after a minute.
  if [ -z "$P" ] && [ "$(age)" -gt 60 ]; then rmdir "$LOCK" 2>/dev/null && continue; fi
  i=$((i+1)); [ "$i" -gt 540 ] && { echo "lock.sh: gave up waiting for $LOCK" >&2; exit 75; }
  [ "$i" = 1 ] && echo "lock.sh: waiting for another check to finish" >&2
  sleep "$POLL"
done
echo $$ > "$LOCK/pid"
[ -n "$PRIO" ] && [ "$(cat "$NEXT" 2>/dev/null)" = "$$" ] && rm -f "$NEXT"
release() { [ "$(cat "$LOCK/pid" 2>/dev/null)" = "$$" ] && rm -rf "$LOCK"; }
trap release EXIT INT TERM
"$@"
exit $?
}
