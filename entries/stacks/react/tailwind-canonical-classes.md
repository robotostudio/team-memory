---
description: Tailwind uses canonical scale classes only — never arbitrary values like h-[87px]
type: standard
author: hrithik
date: 2026-06-12
---
Always map to the nearest canonical class: `h-[87px]` -> `h-20`/`h-22`, `gap-[30px]` -> `gap-8`, `p-[17px]` -> `p-4`, `rounded-[9px]` -> `rounded-lg`, `text-[19px]` -> `text-lg`, `size-[52px]` -> `size-14`, `gap-[1px]` -> `gap-px`. If a value has no close canonical neighbour, question the design value before reaching for square brackets.
