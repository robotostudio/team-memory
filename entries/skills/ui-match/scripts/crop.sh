#!/usr/bin/env bash
# Image helpers for ui-match. Requires ImageMagick (magick).
#
#   crop.sh section <src.png> <out.png> <top> <height> [width]
#       Crop a horizontal band (full width unless [width] given) at y=top, h=height.
#
#   crop.sh chunks  <src.png> <outdir> <n> [viewwidth]
#       Slice src into n equal-height strips, resized to viewwidth (default 560) for viewing.
#       Prints, per chunk, the original y-offset it starts at (chunk i covers y = i*strip).
#
#   crop.sh scale   <src.png> <out.png> <width>
#       Downscale to <width> px wide (for previews / ticket attachments).
set -euo pipefail

cmd="${1:-}"; shift || true
case "$cmd" in
  section)
    src="$1"; out="$2"; top="$3"; h="$4"; w="${5:-}"
    if [ -z "$w" ]; then w=$(magick identify -format '%w' "$src"); fi
    magick "$src" -crop "${w}x${h}+0+${top}" +repage "$out"
    echo "$out"
    ;;
  chunks)
    src="$1"; outdir="$2"; n="$3"; vw="${4:-560}"
    mkdir -p "$outdir"
    W=$(magick identify -format '%w' "$src"); H=$(magick identify -format '%h' "$src")
    strip=$(( (H + n - 1) / n ))
    for i in $(seq 0 $((n-1))); do
      off=$(( i * strip ))
      magick "$src" -crop "${W}x${strip}+0+${off}" +repage -resize "${vw}x" "$outdir/chunk-${i}.png"
      echo "chunk-${i}.png starts at y=${off} (strip=${strip}, full W=${W} H=${H})"
    done
    ;;
  scale)
    src="$1"; out="$2"; w="$3"
    magick "$src" -resize "${w}x" "$out"; echo "$out"
    ;;
  *)
    echo "usage: crop.sh section|chunks|scale ..." >&2; exit 1 ;;
esac
