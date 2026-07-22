# Capture & segmentation

Both sides end up as one clean PNG per component under `/tmp/ui-match/$SLUG/{site,figma}/`.
`$SKILL_DIR` = this skill's own folder (the directory containing `SKILL.md`); resolve at runtime, never hardcode.

## Live site (agent-browser)

Load the agent-browser core skill if unfamiliar: `agent-browser skills get core`.

```bash
agent-browser open "$LIVE_URL"
agent-browser wait --load networkidle
# Hydrate lazy/below-the-fold sections (they render blank in a cold full-page shot):
for i in $(seq 1 14); do agent-browser scroll down 800 >/dev/null; agent-browser wait 400 >/dev/null; done
agent-browser eval "window.scrollTo(0,0)"; agent-browser wait 800
agent-browser screenshot --full /tmp/ui-match/$SLUG/site/00-fullpage.png
```

Get the **real section boundaries** from the DOM (robust; no eyeballing):

```bash
agent-browser eval --stdin < $SKILL_DIR/scripts/site_sections.js
# -> JSON: [{ "i":0, "top":138, "height":1345, "label":"Your in-house team's..." }, ...]
```

Note the full-page PNG width == the page's CSS pixel width (DPR 1), so `top`/`height` map 1:1 to
the screenshot. Crop each section:

```bash
# for each section i: name it NN-<slug-from-label>, crop full width at its top/height
$SKILL_DIR/scripts/crop.sh section /tmp/ui-match/$SLUG/site/00-fullpage.png \
    /tmp/ui-match/$SLUG/site/01-hero.png <top> <height>
```

If `site_sections.js` returns too few/coarse sections (some sites wrap everything in one div), it
already descends through single-child wrappers; if still coarse, fall back to visual chunking like
the Figma path below. Build the **site inventory**: an ordered list of `NN-slug → short label`.

## Figma

### Try MCP first (only works with edit access)
```
mcp__plugin_figma_figma__get_screenshot(fileKey, nodeId, maxDimension: 2000)
```
Extract `fileKey` + `nodeId` from the Figma link (`…/design/<fileKey>/…?node-id=<a>-<b>` →
nodeId `a:b`). If this returns an image, use it as the full-page reference. If it errors with
"don't have edit access" (the common case on a View seat), fall back to the PNG.

### Fallback: user's PNG export
Copy it in and downscale a preview to view the whole page at once:
```bash
cp "$FIGMA_PNG" /tmp/ui-match/$SLUG/figma/00-fullpage.png
$SKILL_DIR/scripts/crop.sh scale /tmp/ui-match/$SLUG/figma/00-fullpage.png /tmp/preview.png 720
# Read /tmp/preview.png to see all sections top->bottom
```

### Find precise boundaries, then crop
A Figma frame is one tall image with no DOM, so boundaries are found visually. Slice into chunks,
read them, and note where each section starts (the helper prints each chunk's original y-offset):
```bash
$SKILL_DIR/scripts/crop.sh chunks /tmp/ui-match/$SLUG/figma/00-fullpage.png /tmp/fig-chunks 5 560
# reads: "chunk-0.png starts at y=0 ...", "chunk-1.png starts at y=2026 ...", etc.
```
Read each `chunk-i.png`; a section's absolute y = its chunk's start-y + (its offset within the
chunk × chunk_strip / view_height). Then crop each section full-width:
```bash
$SKILL_DIR/scripts/crop.sh section /tmp/ui-match/$SLUG/figma/00-fullpage.png \
    /tmp/ui-match/$SLUG/figma/02-three-reasons.png <top> <height>
```
Verify the two or three most important crops by reading them back (especially the ones that will
become "missing"/"extra" findings). Build the **Figma inventory** the same way.

## Naming
Use `NN-<kebab-label>.png` where `NN` is the in-page order. Labels are descriptive of what the
component *is* (`hero`, `stats`, `blog-highlights`) — derived from the heading or visible content,
so the skill stays repo-agnostic (no dependency on any block catalog).
