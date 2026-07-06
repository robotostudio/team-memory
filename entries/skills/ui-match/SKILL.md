---
name: ui-match
description: Compares a page's Figma design against the live website and reports which components (page-builder blocks) are missing on the site, extra on the site, built differently, or matched — as a clickable HTML report with side-by-side screenshots, then optionally files one Linear ticket. Use when the user wants to check Figma-vs-live UI parity, find components that exist in Figma but are not built on the site (or vice-versa), "match Figma to the live site", audit design/build drift for a page, or invokes /ui-match.
---

# ui-match — Figma ↔ live-site component parity

Compare one page's Figma design (source of truth) against the live site and produce a
PM-friendly clickable report of **what's missing / extra / built-differently / matched**.
Nothing is written into the user's project — all output lives under `/tmp/ui-match/`.

`SKILL_DIR` = the absolute path of **this skill's own folder** (the directory containing this
SKILL.md). Resolve it at runtime from where you loaded this file — do not hardcode a path, so the
skill works wherever it is installed. Depends on: `agent-browser`, `magick` (ImageMagick),
`python3`, `curl`. Comparison is **existence-only** (is the component built?), not pixel diffing.

## 1. Gather inputs
Ask the user for (accept them in any order):
1. **Figma frame link** for the page (the `figma.com/design/…?node-id=…` URL).
2. **Live page URL**.
3. **Figma PNG export** of that frame — *only needed if MCP capture fails* (see step 3). Say they
   can export in Figma with `Cmd+Shift+E` or the right-panel Export → PNG. Auto-detect the newest
   PNG in `~/Downloads` and confirm it with them.

Derive `SLUG` (kebab-case, e.g. `pricing`) and `PAGE` (title, e.g. `Pricing`). Make dirs:
`/tmp/ui-match/$SLUG/figma` and `/tmp/ui-match/$SLUG/site`.

## 2. Capture the live site
Follow **[references/capture.md](references/capture.md)** → "Live site". In short: open the URL
with agent-browser, scroll through to hydrate lazy sections, take a `--full` screenshot, get the
real section boundaries via `agent-browser eval --stdin < $SKILL_DIR/scripts/site_sections.js`,
then crop each section (`scripts/crop.sh section …`) into `site/NN-<slug>.png`. Build an ordered
**site inventory** with a short label per section.

## 3. Get the Figma pixels
**Try MCP first** (zero-friction if edit access exists): `mcp__plugin_figma_figma__get_screenshot`
on the node from the Figma link. If it errors with an access/permission message, **fall back to
the user's PNG**. Then segment the full-page image into sections — procedure and boundary-finding
in **[references/capture.md](references/capture.md)** → "Figma". Crop into `figma/NN-<slug>.png`
and build an ordered **Figma inventory**.

## 4. Compare & classify (existence-only)
Align the two inventories by *what each component is* (not position). Put every component into
exactly one bucket:
- **missing** — in Figma, not on the site → build ticket (image = Figma crop).
- **extra** — on the site, not in Figma → confirm intended (image = site crop).
- **different** — on both but a different component/format → design decision (both crops).
- **matched** — present on both (name only, no image).

Write `/tmp/ui-match/$SLUG.findings.json`. Schema + rules: **[references/report.md](references/report.md)**.

## 5. Build & serve the report
```
python3 $SKILL_DIR/scripts/build_report.py /tmp/ui-match/$SLUG.findings.json --outdir /tmp/ui-match
python3 $SKILL_DIR/scripts/serve.py --outdir /tmp/ui-match --page $SLUG
```
`build_report.py` writes `$SLUG.html` + rebuilds `index.html`; `serve.py` prints the clickable
URL (reuses the running server, survives across turns). Give the user that URL. Optionally
screenshot it with agent-browser to confirm it rendered.

## 6. Offer the Linear ticket (terminal prompt — no in-page button)
Right after giving the URL, ask in the terminal: **"Create a Linear ticket for this page? (y/n)"**
If yes, follow **[references/linear.md](references/linear.md)** — one ticket per page: a Links
section (Figma + live), a bulleted Summary, then Missing / Extra / Built-differently each with
title + **inline** screenshot, and Matched as a one-line text list. Tickets use plain text (no
emoji dots, no `·` middots, no em dashes) — that styling stays in the HTML report only. Then:
- print the ticket URL in the terminal, and
- add `"ticketUrl"` + `"ticketKey"` to `/tmp/ui-match/$SLUG.findings.json` and **re-run**
  `build_report.py` so the report shows the 🎫 ticket banner.

If they decline, stop cleanly — the HTML report is the deliverable. (There is intentionally no
button on the page: a static report can't call Linear without a stored credential, so the trigger
lives in the terminal.)

## Rules
- **Never write into the user's repo/project.** Only `/tmp/ui-match/` and `~/.claude/…`.
- Keep it existence-only; don't over-report tiny visual diffs (note real format differences under
  "built differently" only).
- Re-runnable: re-running a page overwrites its crops + `$SLUG.html` and updates the index.
