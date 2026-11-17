#!/usr/bin/env python3
"""Set the film's length from one number: when the middle hands off to the end card.

    python3 scripts/retime.py <PROJECT_DIR> --exit 18.4 [--line "…"] [--meta "…"]

--exit is the EXIT constant in the middle composition: the moment its card starts growing to fill the
frame. Everything in index.html follows from it, exactly as in the approved reference:
  end card starts at EXIT and runs 4.2s       total = EXIT + 4.2
  middle composition runs EXIT + 1.1          flat ground (#dim) switches on at EXIT + 0.6
  the music's drum hit lands at EXIT + 1.25 (the wordmark's last letter): the lofi track's strong hits
  are at 17.96s + 6k, so media-start = (first strong hit at or after that moment) − that moment,
  and the bed swells from 0.56 to 1.0 over the 0.6s before it.
--line / --meta set the end card's two lines. Re-run whenever EXIT changes.
"""
import argparse, json, re, subprocess, sys
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("project"); ap.add_argument("--exit", type=float, required=True)
ap.add_argument("--line"); ap.add_argument("--meta")
a = ap.parse_args()
root = Path(a.project); index = root / "index.html"
s = index.read_text()

E = round(a.exit, 2); total = round(E + 4.2, 2); mid = round(E + 1.1, 2); dim = round(E + 0.6, 2)
hit = round(E + 1.25, 2)
strong = 17.96
while strong < hit: strong += 6
media = round(strong - hit, 2)

track = root / "assets/brand/audio/just-in-time-lofi.mp3"
try:
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(track)],
                               capture_output=True, text=True).stdout)
    if media + total > dur: sys.exit(f"the film ({total}s from {media}s) runs past the end of the track ({dur:.1f}s): shorten it")
except ValueError:
    pass

def sub(pattern, repl, count=1):
    global s
    s, n = re.subn(pattern, repl, s, count=count, flags=re.S)
    if n == 0: sys.exit(f"retime: pattern not found: {pattern}")

sub(r'(<div id="root"[^>]*?data-duration=")[\d.]+', rf"\g<1>{total}")
sub(r'(data-composition-src="compositions/(?!end-card)[^"]+\.html"\s+data-start="0"\s+data-duration=")[\d.]+', rf"\g<1>{mid}")
sub(r'(data-composition-src="compositions/end-card\.html"[^>]*?data-start=")[\d.]+', rf"\g<1>{E}")
sub(r'(<audio\s+id="music".*?data-duration=")[\d.]+', rf"\g<1>{total}")
sub(r'(<audio\s+id="music".*?data-media-start=")[\d.]+', rf"\g<1>{media}")
lane = ('{&quot;version&quot;:1,&quot;lanes&quot;:[{&quot;target&quot;:&quot;volume&quot;,&quot;points&quot;:['
        f'{{&quot;t&quot;:0,&quot;v&quot;:0.56}},{{&quot;t&quot;:{round(hit - 0.6, 2)},&quot;v&quot;:0.56}},'
        f'{{&quot;t&quot;:{hit},&quot;v&quot;:1}}]}}]}}')
sub(r'data-automation="[^"]*"', f'data-automation="{lane}"')
sub(r'\{ t: [\d.]+, duration: [\d.]+, ease: "none", onUpdate: \(\) => marble\.seek', f'{{ t: {total}, duration: {total}, ease: "none", onUpdate: () => marble.seek')
sub(r'(tl\.fromTo\("#dim", \{ opacity: 0 \}, \{ opacity: 1, duration: 0\.01, ease: "none" \}, )[\d.]+', rf"\g<1>{dim}")
if a.line is not None or a.meta is not None:
    m = re.search(r"data-variable-values='([^']*)'", s)
    vals = json.loads(m.group(1)) if m else {}
    if a.line is not None: vals["line"] = a.line
    if a.meta is not None: vals["meta"] = a.meta
    attr = "data-variable-values='" + json.dumps(vals, ensure_ascii=False).replace("'", "&#39;") + "'"
    if m: s = s.replace(m.group(0), attr)
    else: sub(r'(data-composition-src="compositions/end-card\.html")', rf"\g<1>\n        {attr}")
index.write_text(s)
print(f"EXIT {E}s  total {total}s  middle 0–{mid}s  end card {E}–{total}s  dim {dim}s  hit {hit}s  media-start {media}s")
