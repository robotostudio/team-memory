#!/bin/bash
# land.sh check|push ROB-x: nora's landing, one ticket at a time, from $COMPANY_HOME/work/ROB-x.*.
#   check: puts ROB-x's saved patch on origin/main in nora's tree, refuses a file outside ROB-x's claim, a lint or type
#          escape, a lint/type config change, and a secret or host; then bun install and `bun run check` under the
#          machine-wide lock. Records the base, the tree and the result in work/ROB-x.checked.
#   gate:  `land.sh gate ROB-x <tree>`, at an engineer's tree save: check's refusals (claim, escape, config, secret,
#          churn) on the saved patch in the engineer's own tree, blamed at its HEAD. No install, no bun check.
#   push:  commits exactly the checked tree with work/ROB-x.msg and pushes it to main, only while origin/main is still
#          the checked base and no $COMPANY_HOME/hold exists (its first line says why). Releases the claim.
# The last line always starts "land ROB-x check:", "land ROB-x gate:" or "land ROB-x push:".
set -uo pipefail
# The whole script is one block that exits inside it: bash parses it before running a line, so an edit while it runs
# (nora's check waits up to 90 min) can't make it read on at its old offset in the new file (round 21).
{
SKILL=$(cd "$(dirname "$0")/.." && pwd)
H=${COMPANY_HOME:-$HOME/roboto/software-factory-company}
REPO=${COMPANY_REPO:-$HOME/roboto/software-factory}
T=$HOME/roboto/software-factory-nora
export PATH="$SKILL/scripts:$HOME/.bun/bin:$PATH"
CMD=${1:-}
X=${2:-}
[[ $X =~ ^ROB-[0-9]+$ ]] && case $CMD in check | push) ;; gate) [ -d "${3:-}" ] ;; *) false ;; esac ||
  { echo "usage: land.sh check|push ROB-<n>, or land.sh gate ROB-<n> <tree>"; exit 2; }
W=$H/work
P=$W/$X.patch
say() { echo "land $X $CMD: $*"; }
fail() { say "$*"; exit 1; }
SECRETS='postgres(ql)?://|neon\.tech|vercel\.app|robotostudio\.com|PRIVATE KEY|sk-(ant|proj)-|ghp_|github_pat_|xox[abp]-'
ESCAPES='oxlint-disable|eslint-disable|@ts-ignore|@ts-expect-error|\bas any\b|from "(\.\./)+(packages|apps)/'
CONFIG='^diff --git a/(oxlint\.config\.ts|\.oxfmtrc\.json|tools/boundaries\.ts|tsconfig[^ ]*\.json) '
overlaps() {
  case $1 in */) case $2 in "$1"*) return 0 ;; esac ;; esac
  case $2 in */) case $1 in "$2"*) return 0 ;; esac ;; esac
  [ "$1" = "$2" ]
}

if [ "$CMD" = check ] || [ "$CMD" = gate ]; then
  [ -s "$P" ] || fail "no patch at $P"
  [ -s "$W/$X.touch" ] || fail "no claim for $X"
  bad=""
  for f in $(awk '/^diff --git /{p=$4; sub(/^b\//,"",p); print p}' "$P"); do
    ok=""
    while read -r c; do [ -n "$c" ] && overlaps "$f" "$c" && ok=1; done < "$W/$X.touch"
    [ -n "$ok" ] || bad="$bad $f"
  done
  [ -z "$bad" ] || fail "outside $X's claim:$bad"
  hits=$(grep -E '^\+[^+]' "$P" | grep -nE "$ESCAPES" | head -5)
  [ -z "$hits" ] || fail "a lint or type escape: $hits"
  cfg=$(grep -E "$CONFIG" "$P")
  [ -z "$cfg" ] || fail "it changes the lint or type setup: $cfg"
  grep -E '^\+' "$P" | grep -qiE "$SECRETS" && fail "a secret or a host in the patch"
  if [ "$CMD" = gate ]; then
    # The engineer's tree already holds the patch on its own base.
    cd "$3" || exit 1
    BASE=$(git rev-parse HEAD)
  else
    [ -d "$T" ] || { git -C "$REPO" fetch -q origin && git -C "$REPO" worktree add -q --detach "$T" origin/main; } || fail "could not create $T"
    cd "$T" || exit 1
    git fetch -q origin || fail "fetch failed"
    git reset -q --hard origin/main && git clean -fdq || fail "could not reset $T"
    BASE=$(git rev-parse origin/main)
    git apply --3way --whitespace=nowarn "$P" > "$W/$X.apply.log" 2>&1 ||
      fail "CONFLICT on origin/main $(git rev-parse --short "$BASE"): $(grep -iE 'conflict|failed' "$W/$X.apply.log" | head -3 | tr '\n' ' ')"
  fi
  # Churn: the applied patch removes lines another ticket wrote on main in the last 7 days (ROB-4154 turned ROB-3994's jwtExp
  # from `payload` to `parts` a day later). It says why in a comment in that file, so the next ticket doesn't flip it
  # back, and in packages/core it also changes a test under packages/core/test/ that holds the new form.
  now=$(date +%s)
  churn=$(awk '/^diff --git /{f=$3; sub(/^a\//, "", f); h=0; next}
    /^@@ /{split($2, a, ","); o=substr(a[1], 2) + 0; h=1; next}
    h && /^-/{print f, o; o++; next} h && /^ /{o++}' <(git diff -U0 --no-color HEAD) |
    while read -r f n; do
      git blame -L "$n,$n" --porcelain "$BASE" -- "$f" 2>/dev/null |
        awk -v f="$f" -v x="$X" -v cut=$((now - 7 * 86400)) '$1 == "committer-time" {t = $2}
          $1 == "summary" {s = $2; sub(/:$/, "", s)} END { if (t >= cut && s ~ /^ROB-[0-9]+$/ && s != x) print f, s }'
    done | sort -u)
  bad=""
  while read -r f y; do
    [ -n "$f" ] || continue
    awk -v f="$f" '/^diff --git /{on = ($4 == "b/" f); next} on && /^\+[ \t]*(\/\/|\/\*|\*|#)/{c = 1} END { exit !c }' "$P" ||
      bad="$bad; $f rewrites $y's lines from the last 7 days with no comment there saying why"
    case $f in packages/core/*) grep -q '^diff --git a/packages/core/test/' "$P" ||
      bad="$bad; $f is core and rewrites $y's lines with no packages/core/test/ change holding the new form" ;; esac
  done <<< "$churn"
  [ -z "$bad" ] || fail "churn${bad}. Add them, or leave the earlier form alone"
  [ "$CMD" = gate ] && { say "pass: nora's check will refuse none of it (its bun check is yours: company check)"; exit 0; }
  # The tree to commit is taken before the check, so a file the check leaves behind fails the push instead of landing.
  git add -A
  TREE=$(git write-tree)
  git reset -q
  # Prose only: research notes and images can't change bun check's answer (oxfmt ignores research/**, and no lint, type
  # or test reads a .md), so they skip the install and the lock. 8 notes waited ~100 min behind code checks (round 22).
  if ! awk '/^diff --git /{p=$4; sub(/^b\//,"",p); print p}' "$P" | grep -qvE '^research/.*\.(md|png|jpe?g|gif|webp|txt)$'; then
    printf 'base=%s\ntree=%s\nexit=0\ncounts=prose only, no bun check\n' "$BASE" "$TREE" > "$W/$X.checked"
    say "green on $(git rev-parse --short "$BASE"): prose only (research notes and images), no bun check"
    exit 0
  fi
  bun install --frozen-lockfile > "$W/$X.install.log" 2>&1 || fail "bun install --frozen-lockfile failed: $W/$X.install.log"
  s=$SECONDS
  LOCK_PRIORITY=1 lock.sh bun run check 2>&1 | tee "$W/$X.check.log"
  rc=${PIPESTATUS[0]}
  counts=$(grep -E '[0-9]+ pass' "$W/$X.check.log" | tail -1)
  printf 'base=%s\ntree=%s\nexit=%s\ncounts=%s\n' "$BASE" "$TREE" "$rc" "$counts" > "$W/$X.checked"
  [ "$rc" = 0 ] || fail "RED, exit=$rc on $(git rev-parse --short "$BASE"): $counts (log: $W/$X.check.log)"
  say "green on $(git rev-parse --short "$BASE") in $((SECONDS - s)) s: $counts"
  exit 0
fi

# push
[ -s "$H/hold" ] && fail "on hold, nothing pushed: $(head -1 "$H/hold"). $X stays checked; run company done"
C=$W/$X.checked
[ -s "$C" ] || fail "not checked: run land.sh check $X"
BASE=$(sed -n 's/^base=//p' "$C")
TREE=$(sed -n 's/^tree=//p' "$C")
[ "$(sed -n 's/^exit=//p' "$C")" = 0 ] || fail "its check was red"
M=$W/$X.msg
[ -s "$M" ] || fail "no message at $M"
head -1 "$M" | grep -q "^$X: " || fail "the message's first line must start with \"$X: \""
grep -qiE 'co-authored-by|generated with|claude\.ai/code' "$M" && fail "attribution in the message"
grep -qE '__[A-Z]+__' "$M" && fail "a placeholder in the message"
cd "$T" || exit 1
git fetch -q origin || fail "fetch failed"
[ "$(git rev-parse origin/main)" = "$BASE" ] || fail "main moved to $(git rev-parse --short origin/main) since the check: run land.sh check $X again"
[ "$(git rev-parse HEAD)" = "$BASE" ] || fail "nora's tree is not on the checked base"
git add -A
[ "$(git write-tree)" = "$TREE" ] || { git reset -q; fail "the tree changed since the check: run land.sh check $X again"; }
git diff --cached | grep -E '^\+' | grep -qiE "$SECRETS" && { git reset -q; fail "a secret or a host in the diff"; }
git commit -q -F "$M" || fail "commit failed"
if ! git push -q origin HEAD:main; then git reset -q --soft HEAD^; fail "push refused: nothing landed"; fi
SHA=$(git rev-parse --short HEAD)
git fetch -q origin
echo "$SHA" > "$W/$X.landed"
company ding landed
# Research that lands goes to omar, who turns it into tickets (lena), decisions, or the human's questions.
notes=$(git diff --name-only HEAD^ HEAD -- research/ | tr '\n' ' ')
[ -z "$notes" ] || company wake omar "$X: research landed $SHA: ${notes% }. Triage it: every finding to lena as a ticket, to the human as a question, or dropped with why; the outcome as a comment on $X." >/dev/null 2>&1
# A member still on X keeps X's claim (kai on ROB-3981 while iris's note for it landed); X's last landing releases it.
on=$(grep -lx "$X" "$H"/state/*/TICKET 2>/dev/null | sed "s|^$H/state/||; s|/TICKET\$||" | grep -vx "${COMPANY_MEMBER:-nora}" | tr '\n' ' ')
if [ -n "$on" ]; then say "LANDED $SHA (origin/main is $(git rev-parse --short origin/main)); claim kept: ${on% } still on $X"; exit 0; fi
rm -f "$W/$X.touch"
say "LANDED $SHA (origin/main is $(git rev-parse --short origin/main)); claim released"
exit $?
}
