# ui-match

Figma to live-site component parity for a page. Point it at a page's Figma frame and its live URL;
it tells you which page-builder components are **missing on the site** (build these), **extra on
the site** (confirm intended), **built differently**, or **matched** — filed as one Linear ticket
for the page with inline screenshots.

Comparison is **existence-only** (is the component built?), not a pixel diff.

## Usage

Invoke `/ui-match` in Claude Code. It asks for:

1. the page's **Figma frame link**,
2. the **live page URL**,
3. a **Figma PNG export** of the frame (only used if Figma MCP capture is unavailable — see below).

It then captures both sides, classifies every component, and files a Linear ticket for the page.

Nothing is written into your project — all output lives under `/tmp/ui-match/`.

## Requirements

- [`agent-browser`](https://www.npmjs.com/package/agent-browser) — `npm i -g agent-browser && agent-browser install`
- ImageMagick (`magick`) — `brew install imagemagick`
- `curl` (preinstalled on macOS)
- **Figma**: the skill tries the Figma MCP first; it needs *edit* access to use MCP, so with only
  View access you export the frame as a PNG (`Cmd+Shift+E`) and the skill uses that.
- **Linear**: the Linear MCP connected (OAuth) — the ticket is the deliverable.

## How it works

1. **Live site** — `agent-browser` opens the URL, scrolls to hydrate lazy sections, screenshots the
   full page, reads real section boundaries from the DOM, and crops one image per section.
2. **Figma** — tries `get_screenshot` via the Figma MCP; otherwise segments the provided PNG export.
3. **Classify** — every component is bucketed: missing / extra / built-differently / matched,
   recorded in `findings.json`.
4. **Ticket** — one Linear ticket per page, created automatically: a Links section, a bulleted
   summary, and inline screenshots for each delta.

## Files

- `SKILL.md` — orchestration
- `references/` — capture, findings, and Linear procedures
- `scripts/` — `site_sections.js`, `crop.sh`
