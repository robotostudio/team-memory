---
description: Wrap all dummy/generated placeholder content in ¤ (U+00A4) so it
  can be found and stripped before launch
type: standard
author: jonoroboto
date: 2026-07-06
---
# Dummy content sentinel: ¤

When filling missing client content with lorem ipsum or generated placeholder text, wrap it with `¤` (U+00A4, CURRENCY SIGN) at both the start and the end:

```
¤Lorem ipsum dolor sit amet, consectetur adipiscing elit.¤
```

**Why ¤:**

- It's in Latin-1, so every font on every device renders it — no tofu boxes.
- It effectively never appears in real client copy (real content uses $, €, £), so searching for it gives zero false positives.
- It's typeable and searchable by non-technical editors, no copy-pasting exotic unicode.

**How to apply:**

- Always mark **both** ends, never just one, so cleanup sweeps can trust the count (an odd number of `¤` in a document means a marker was hand-deleted).
- Applies to every field type — titles, body text, alt text, meta descriptions.
- Before launch, sweep for leftovers, e.g. in Sanity: `*[pt::text(body) match "*¤*" || title match "*¤*"]`, or `grep -r "¤"` over exported content.
- To machine-strip a marked block: regex `¤[^¤]*¤`.
