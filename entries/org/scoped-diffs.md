---
description: Diffs contain the change and nothing else — no drive-by edits, no out-of-scope review
type: standard
author: hrithik
date: 2026-06-12
---
A PR touches only what its ticket requires: no passing fixes to unrelated code, animations, or config — if you spot something, file it, don't smuggle it. Reviews respect the same boundary: vendored or bootstrapped files that aren't part of the change don't get flagged.
