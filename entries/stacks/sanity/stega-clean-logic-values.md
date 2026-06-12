---
description: stegaClean every Sanity value used in logic — never values rendered as text
type: standard
author: hrithik
date: 2026-06-12
---
Visual Editing's stega encoding embeds invisible characters in Sanity strings, silently corrupting comparisons, switch statements, URL construction, and dynamic class names. `stegaClean` every Sanity value used in logic (comparisons, URLs, classNames) — and never clean values rendered as text, or click-to-edit overlays break.
