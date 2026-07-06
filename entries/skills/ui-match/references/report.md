# findings.json + report build

The agent's only job for the report is to produce `findings.json`. `build_report.py` turns it into
the exact HTML design (pills, high-contrast FIGMA/LIVE SITE tags, side-by-side "built
differently", matched text list) — do not hand-write HTML.

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
- **img paths are relative to `/tmp/ui-match`** (the server root): always `"$SLUG/figma/..."` or
  `"$SLUG/site/..."`. `missing` uses the Figma crop; `extra` uses the site crop; `different` uses
  both.
- `desc` is a short one-liner (optional). `matched` is names only — no images (keeps it light).
- Any empty bucket can be omitted or `[]`; its pill and section auto-hide.

## Build + serve
```bash
python3 $SKILL_DIR/scripts/build_report.py /tmp/ui-match/$SLUG.findings.json --outdir /tmp/ui-match
python3 $SKILL_DIR/scripts/serve.py --outdir /tmp/ui-match --page $SLUG   # prints the URL
```
`build_report.py` writes `$SLUG.html` + `$SLUG.meta.json` and rebuilds `index.html` (a landing
page listing every page compared this session with its count pills). `serve.py` reuses the running
server if there is one, else starts a detached `http.server` on port 8787 (hops to the next free
port only if 8787 is taken by something that isn't ours).

## Sanity checks before handing over the URL
- `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:<port>/$SLUG.html` → 200.
- No broken images: every `src="…png"` in `$SLUG.html` returns 200.
- Optionally `agent-browser open` the URL + `screenshot --full` and read it to confirm layout.
