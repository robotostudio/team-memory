#!/usr/bin/env python3
"""Measure a render against what the team has signed off on. Read the WARN lines; look at the film too.

    python3 scripts/review.py <video.mp4> [--card x,y,w,h]

Inside the card (the marble always moves, so it is left out):
  frozen     share of frames where nothing on the card changes. Approved films sit around 40–60%;
             the one that felt like a slideshow was 74%. WARN above 65%.
  long holds stretches of 2.5s or more with nothing moving on the card (title and end card excluded).
  snaps      one-frame jumps: a big change with still frames either side (an element popping in or out).
Audio: integrated loudness −14 LUFS ±1 and true peak ≤ −1 dBTP.
"""
import argparse, re, subprocess, sys

ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--card")
a = ap.parse_args()
probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height,r_frame_rate",
                        "-of", "csv=p=0", a.video], capture_output=True, text=True).stdout.strip().split(",")
W, H = int(probe[0]), int(probe[1]); num, den = map(int, probe[2].split("/")); fps = num / den
CARDS = {(1920, 1080): (140, 110, 1640, 860), (1080, 1440): (90, 170, 900, 1100)}
cx, cy, cw, ch = map(int, a.card.split(",")) if a.card else CARDS.get((W, H), (0, 0, W, H))
SW, SH = cw // 4, ch // 4
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.video, "-vf", f"crop={cw}:{ch}:{cx}:{cy},scale={SW}:{SH},format=gray",
                      "-f", "rawvideo", "-"], capture_output=True).stdout
n = SW * SH; N = len(raw) // n
frames = [raw[i * n:(i + 1) * n:3] for i in range(N)]
d = [0.0] + [sum(abs(p - q) for p, q in zip(frames[i - 1], frames[i])) / len(frames[i]) for i in range(1, N)]

warn = []
frozen = sum(1 for x in d if x < 0.05) / N
print(f"{a.video}: {W}×{H} {fps:g} fps, {N / fps:.1f}s")
print(f"  frozen card   {frozen:.0%} of frames")
if frozen > 0.65: warn.append(f"the card is frozen {frozen:.0%} of the time (approved films ~40–60%): add the drift, a push-in or staggered entrances")
title_end, end_start = 3.3, N / fps - 4.2
holds, start = [], None
for i in range(1, N + 1):
    still = i < N and d[i] < 0.05
    if still and start is None: start = i
    if not still and start is not None:
        t0, t1 = start / fps, i / fps
        if t1 - t0 >= 2.5 and t0 > title_end and t1 < end_start: holds.append((round(t0, 2), round(t1, 2)))
        start = None
print(f"  long holds    {holds or 'none'}")
for h in holds: warn.append(f"nothing moves on the card from {h[0]}s to {h[1]}s")
snaps = [round(i / fps, 2) for i in range(2, N - 2) if d[i] > 6 and d[i] > 4 * max(d[i - 1], d[i + 1], 0.3)]
print(f"  one-frame snaps {snaps or 'none'}")
for t in snaps: warn.append(f"one-frame jump at {t}s: animate it in or out")

lu = subprocess.run(["ffmpeg", "-nostats", "-i", a.video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = re.findall(r"I:\s+(-?[\d.]+) LUFS", lu); P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lu)
if I:
    i, p = float(I[-1]), float(P[-1]) if P else 0.0
    print(f"  loudness      {i} LUFS, true peak {p} dBTP")
    if not -15 <= i <= -13: warn.append(f"loudness {i} LUFS (target −14 ±1): re-time or check the music's data-volume")
    if p > -1: warn.append(f"true peak {p} dBTP (limit −1)")
else:
    warn.append("no audio track")
for w in warn: print("WARN", w)
print("OK" if not warn else f"{len(warn)} warning(s)")
