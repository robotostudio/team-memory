#!/usr/bin/env bash
# Start a PR video project from the approved template.
#   bash scripts/new-project.sh <16x9|3x4> <PROJECT_DIR> <slug>
#
# Layout (every film in one folder shares one copy of the brand assets):
#   ~/pr-videos/
#     _shared/brand-<version>/   fonts, lofi track, marble + mark scripts, grain, wordmarks (installed once per version)
#     <repo>-pr-<n>/
#       index.html, compositions/, design.md
#       assets/brand -> ../../_shared/brand-<version>   (a link, not a copy)
#       assets/       this film's own captures and photos only
#       capture/, renders/
#
# <slug> names the middle composition (e.g. mega-menu). The template's worked example
# (compositions/cart-race.html) is copied to compositions/<slug>.html and wired into index.html;
# keep its title and exit sections, replace its middle.
set -euo pipefail
ASPECT="${1:?16x9 or 3x4}"; DEST="${2:?project dir}"; SLUG="${3:?slug}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HERE/template/$ASPECT"
[ -d "$SRC" ] || { echo "unknown aspect: $ASPECT (16x9 or 3x4)"; exit 1; }
[ -e "$DEST" ] && { echo "$DEST already exists; pick a new folder"; exit 1; }

VERSION="$(cat "$HERE/brand/VERSION")"
PARENT="$(mkdir -p "$(dirname "$DEST")" && cd "$(dirname "$DEST")" && pwd)"
SHARED="$PARENT/_shared/brand-$VERSION"
if [ ! -f "$SHARED/VERSION" ]; then
  mkdir -p "$PARENT/_shared"
  cp -R "$HERE/brand" "$SHARED"
  echo "Installed shared brand assets: $SHARED"
fi

cp -R "$SRC" "$DEST"
rm -f "$DEST/assets/.keep"
ln -s "../../_shared/brand-$VERSION" "$DEST/assets/brand"
mkdir -p "$DEST/renders" "$DEST/capture"
NAME="$(basename "$DEST")"
cd "$DEST"
if [ "$SLUG" != "cart-race" ]; then
  mv compositions/cart-race.html "compositions/$SLUG.html"
  sed -i '' "s/cart-race/$SLUG/g" index.html "compositions/$SLUG.html"
fi
python3 - "$NAME" <<'EOF'
import json, sys
for f in ("meta.json", "package.json"):
    d = json.load(open(f)); d["name"] = sys.argv[1]
    if "id" in d: d["id"] = sys.argv[1]
    json.dump(d, open(f, "w"), indent=2)
EOF
echo "Created $DEST"
echo "  brand assets:       assets/brand -> $SHARED (shared by every film in $PARENT; don't edit)"
echo "  this film's images: assets/"
echo "  middle composition: compositions/$SLUG.html (from the cart-race example)"
echo "  then: python3 $HERE/scripts/retime.py $DEST --exit <seconds>"
echo "  to send the project to someone: (cd $PARENT && zip -r $NAME.zip $NAME)  # zip follows the link and includes the assets"
