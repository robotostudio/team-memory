---
description: Explicit GROQ projections with _key/_type; spread only inside block; array::compact on dereferenced arrays
type: standard
author: hrithik
date: 2026-06-12
---
Project GROQ fields explicitly — include `_key` and `_type` on every block and nested array item, and fetch only fields the consuming component uses. The spread (`...`) is allowed only inside the `_type == "block"` condition: top-level spreads over-fetch whole documents, and hand-projecting Portable Text internals breaks typegen. Always wrap dereferenced reference arrays (`[]->{...}`) in `array::compact()` — deleted or unpublished documents yield null entries otherwise, and compact() also removes null from the generated type.
