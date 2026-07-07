# findings.json

`findings.json` is the structured record of the comparison — it drives the Linear ticket content
and makes a page re-runnable.

## Schema — `/tmp/ui-match/$SLUG.findings.json`
```json
{
  "page":    "Pricing",
  "slug":    "pricing",
  "figmaUrl":"https://www.figma.com/design/<fileKey>/...?node-id=<a>-<b>",
  "liveUrl": "https://site.com/pricing",
  "missing":  [ { "title": "Comparison table", "desc": "GC AI vs 7 competitors", "img": "pricing/figma/05-comparison.png" } ],
  "extra":    [ { "title": "Stats bar", "desc": "97.5% / 1,700+ / ...", "img": "pricing/site/04-stats.png" } ],
  "different":[ { "title": "Tools showcase", "desc": "Figma carousel · site text grid",
                  "figmaImg": "pricing/figma/03-tools.png", "siteImg": "pricing/site/03-features.png",
                  "figmaCaption": "Figma — carousel", "siteCaption": "Live site — grid" } ],
  "matched":  [ "Hero", "FAQ", "Footer" ]
}
```

Rules:
- **img paths are relative to `/tmp/ui-match`**: always `"$SLUG/figma/..."` or
  `"$SLUG/site/..."`. `missing` uses the Figma crop; `extra` uses the site crop; `different` uses
  both.
- `desc` is a short one-liner (optional). `matched` is names only — no images (keeps it light).
- Any empty bucket can be omitted or `[]`; its ticket section is skipped.
