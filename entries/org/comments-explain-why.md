---
description: Never write a comment explaining what the code already says — comment only what a reader cannot recover from the file
type: standard
author: anshroboto
date: 2026-07-21
---
Never write a comment that explains what the code already says — a paraphrase of the lines under it, a value visible in the diff (`// 4px to match Figma` belongs in the ticket), a section signpost, a restated signature, or an attribution of a change. Comment only what a reader cannot recover from the file: discovered external-system behaviour, a workaround with a link and a removal condition, a non-obvious invariant or ordering constraint. AI diffs narrate every block by default; hold them to the same bar.
