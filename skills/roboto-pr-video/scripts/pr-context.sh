#!/usr/bin/env bash
# Pull everything the video needs to know about a PR into one folder.
#   bash scripts/pr-context.sh <PR URL> <OUT_DIR>
# Writes: pr.json (metadata, files, commits), diff.patch, comments.txt, previews.txt (preview deployment URLs),
# shots/ + shots.tsv (every image in the PR description and comments, downloaded with your gh login, with its alt text:
# authors usually attach before/after pairs, which are real captures of exactly this change),
# and prints a summary: state, branches, production and preview URLs (with whether they're reachable or behind a login).
set -euo pipefail
URL="${1:?PR URL}"; OUT="${2:?output folder}"
mkdir -p "$OUT"
REPO=$(printf '%s' "$URL" | sed -E 's#https://github.com/([^/]+/[^/]+)/pull/[0-9]+.*#\1#')

gh pr view "$URL" --json number,title,body,state,isDraft,mergedAt,baseRefName,headRefName,headRefOid,author,url,additions,deletions,changedFiles,files,commits,labels > "$OUT/pr.json"
gh pr diff "$URL" > "$OUT/diff.patch"
gh pr view "$URL" --json comments --jq '.comments[].body' > "$OUT/comments.txt" 2>/dev/null || : > "$OUT/comments.txt"

HEAD_SHA=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['headRefOid'])" "$OUT/pr.json")
{
  grep -oE 'https://[A-Za-z0-9._-]+\.(vercel\.app|netlify\.app|pages\.dev)[A-Za-z0-9._/?=&%-]*' "$OUT/comments.txt" || true
  # GitHub deployments for the head commit (Vercel, Netlify and others report here)
  for id in $(gh api "repos/$REPO/deployments?sha=$HEAD_SHA" --jq '.[].id' 2>/dev/null || true); do
    gh api "repos/$REPO/deployments/$id/statuses" --jq '.[] | select(.state=="success") | .environment_url // empty' 2>/dev/null || true
  done
} | grep -vE 'vercel\.com|/_vercel|\.(png|jpg|svg)$' | sed 's#/$##' | sort -u > "$OUT/previews.txt"

# the PR's own screenshots: markdown images and <img> tags in the description and comments
gh pr view "$URL" --json body --jq .body > "$OUT/body.md"
mkdir -p "$OUT/shots"; : > "$OUT/shots.tsv"
TOKEN=$(gh auth token 2>/dev/null || true)
python3 - "$OUT/body.md" "$OUT/comments.txt" <<'PY' > "$OUT/.images"
import re, sys
text = "".join(open(f).read() for f in sys.argv[1:])
seen = set()
for alt, url in re.findall(r'!\[([^\]]*)\]\((https?://[^)\s]+)\)', text) + [(re.search(r'alt="([^"]*)"', t).group(1) if 'alt="' in t else "", u) for t, u in re.findall(r'(<img[^>]*src="(https?://[^"]+)"[^>]*>)', text)]:
    if url not in seen and not re.search(r'badge|shields\.io|vercel\.com/button', url):
        seen.add(url); print(f"{alt.strip() or '-'}\t{url}")
PY
n=0
while IFS=$'\t' read -r alt url; do
  n=$((n + 1)); name=$(printf '%02d-%s' "$n" "$(printf '%s' "$alt" | tr 'A-Z' 'a-z' | tr -cs 'a-z0-9' '-' | cut -c1-48 | sed 's/-$//')")
  if curl -sfL ${TOKEN:+-H "Authorization: token $TOKEN"} -o "$OUT/shots/$name" "$url"; then
    case "$(file -b --mime-type "$OUT/shots/$name")" in
      image/png) ext=png;; image/jpeg) ext=jpg;; image/gif) ext=gif;; image/webp) ext=webp;; image/svg*) ext=svg;; video/mp4) ext=mp4;; video/quicktime) ext=mov;; *) ext=bin;;
    esac
    mv "$OUT/shots/$name" "$OUT/shots/$name.$ext"
    printf '%s\t%s\t%s\n' "shots/$name.$ext" "$alt" "$url" >> "$OUT/shots.tsv"
  fi
done < "$OUT/.images"
rm -f "$OUT/.images"

HOME_URL=$(gh repo view "$REPO" --json homepageUrl --jq .homepageUrl 2>/dev/null || true)
reach() { c=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 15 "$1" || echo 000); case "$c" in 2*|3*) echo "ok";; 401|403) echo "LOGIN ($c: Vercel protection; use the PR screenshots, or ask for a bypass secret)";; *) echo "unreachable ($c)";; esac; }
: > "$OUT/reach.txt"
for u in $HOME_URL $(cat "$OUT/previews.txt"); do printf '%s\t%s\n' "$u" "$(reach "$u")" >> "$OUT/reach.txt"; done
python3 - "$OUT/pr.json" "$OUT/reach.txt" "$HOME_URL" "$OUT/shots.tsv" <<'EOF'
import json, sys
pr = json.load(open(sys.argv[1]))
reach = dict(l.rstrip("\n").split("\t", 1) for l in open(sys.argv[2]) if "\t" in l)
shots = [l.rstrip("\n").split("\t") for l in open(sys.argv[4]) if l.strip()]
previews = [u for u in reach if u != sys.argv[3]]
state = "MERGED " + pr["mergedAt"][:10] if pr.get("mergedAt") else ("DRAFT" if pr.get("isDraft") else pr["state"])
print(f"#{pr['number']} {pr['title']}")
print(f"  state     {state}   ({pr['baseRefName']} <- {pr['headRefName']})")
print(f"  author    {pr['author']['login']}   +{pr['additions']} -{pr['deletions']} in {pr['changedFiles']} files, {len(pr['commits'])} commits")
home = sys.argv[3]
print(f"  homepage  {home + '   ' + reach.get(home, '') if home else '(none set: ask for the production URL)'}")
print("  previews  " + ("\n            ".join(f"{u}   {reach[u]}" for u in previews) if previews else "(none found)"))
print(f"  PR shots  {len(shots)} downloaded to shots/ (see shots.tsv)" if shots else "  PR shots  none in the description or comments")
for f, alt, _ in shots: print(f"            {f}   {alt}")
print("  files")
for f in sorted(pr["files"], key=lambda f: -(f["additions"] + f["deletions"]))[:25]:
    print(f"    +{f['additions']:<5} -{f['deletions']:<5} {f['path']}")
if len(pr["files"]) > 25: print(f"    … {len(pr['files']) - 25} more")
EOF
