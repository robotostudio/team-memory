---
name: roboto-style-guide
description: Roboto Studio style guide for anything handed to a client or the team, such as audits, reports, HTML pages, PDFs and claude.ai Artifacts. Use when building, restyling or fixing one in the Roboto look (black, white and zinc, Geist, hairline boxes), when a page should look like robotostudio.com, or when a styled page has broken lines, gaps or boxes. Ends with a visual check that repeats until the page is clean.
---

# Roboto style guide

Every report, HTML page, PDF or Artifact comes out in the Roboto Studio **style**: tokens, type, hairlines, bleed and quiet status, applied to whatever the page holds. The brand assets come live from robotostudio.com; the style itself is the CSS at the end of this file, the single source of truth for every colour, size and component.

## How to use it

- `/roboto-style-guide path/to/page.html` or `/roboto-style-guide <artifact link>` restyles an existing page, PDF or Artifact.
- "Make a report on … in Roboto style" builds a new one.
- Output: one self-contained `.html` (and an A4 `.pdf` when asked); an Artifact is republished to its own link.

## Steps

1. **Get the brand from robotostudio.com.**
   - Wordmark: fetch `https://robotostudio.com/`, take the header's `<svg … viewBox="0 0 182 18">…</svg>`, drop its `class` attributes, set `fill="currentColor"` on the root and add `class="wordmark"`.
   - R mark: `https://robotostudio.com/logo.svg` (a 1200×1200 black tile with a white R). Inline it; on the root `<svg>` tag only, drop `width`, `height` and `fill` and add `class="rs-mark" aria-hidden="true"`. Leave the `rect` and `path` untouched (the rect needs its own width and height); the CSS recolours both for dark mode.
   - Fonts: Geist and Geist Mono, loaded by the CSS below from Google Fonts.
   - The site's own stylesheets are not usable: they are Next.js chunks whose names change on every deploy, and Artifacts load stylesheets only from Google Fonts. The colours and sizes below were measured from the site; if the site visibly changes, compare its computed `body` background and text colour (light and dark) in headless Chrome and update the matching tokens.
   Done when the page has the live wordmark and R mark inlined and no `src`/`href` pointing at robotostudio.com assets.
2. **Restyle in place.** Keep the page's content, markup and scripts. Put the CSS below first in a `<style>`, then rewrite the page's own CSS to the **rules** and **element map**. A new page builds its frame from the element map's **Page frame** row; a PDF source has its content extracted first, then becomes a new page.
   **Collisions:** grep the page for every class the CSS below styles and override each one the page uses for something else.
   **Boxes:** any page class that sets blocks side by side (`grid-template-columns`, a wrapping `flex` row of cards, `gap` between columns) is replaced by `.cells`, so hairlines sit between the items; keep the page's class only for what `.cells` does not cover.
   A restyle keeps every fact the page states, repeats included. Page chrome that should not print (custom bars, sidebars, filter and copy buttons) gets `.no-print`; `nav` is hidden in print already.
   Done when the page's CSS holds zero hard-coded colours, fonts, radii or shadows, and every element passes every rule.
3. **Verify, then fix, until clean.** Nothing is published or handed over before this step passes.
   1. **Audit.** Open the local `.html` at 1300px in a browser that runs JS (`agent-browser open "file://$PWD/out.html"`, then `agent-browser eval` the script below). It returns `[]` when the structure is right; each string names a failure.
      ```js
      (async () => {
        await document.fonts.ready;
        const out = [], card = 'h2, h3, h4, p, ul, ol, .stat, .cap';
        if (!document.fonts.check('500 16px Geist')) out.push('fonts: Geist did not load');
        for (const el of document.querySelectorAll(':is(.section, .hero, .callout) > :is(.cells, .rows, .acc, .table):not(.bleed)'))
          out.push(`bleed: .${el.className} sits inside the gutter, so its lines miss the tracks; add .bleed`);
        for (const el of document.querySelectorAll('main *')) {
          if (!/grid|flex/.test(getComputedStyle(el).display) || el.closest('.cells, .rs-pair, svg')) continue;
          const kids = [...el.children].filter(k => k.offsetWidth && (k.matches(card) || k.querySelector(card)));
          const row = kids.filter(k => Math.abs(k.getBoundingClientRect().top - kids[0].getBoundingClientRect().top) < 2);
          if (row.length > 1) out.push(`boxes: <${el.tagName.toLowerCase()} class="${el.className}"> sets ${row.length} blocks side by side on gaps; use .cells`);
        }
        return out;
      })()
      ```
   2. **Look.** Screenshot at 1300px and inside a 390px iframe (headless Chrome clamps windows to ~500px), light and dark: set `data-theme` on `<html>` in a copy for each, since headless Chrome follows the system theme. For an Artifact, also shoot a copy with `:root{color-scheme:light}body{background:#fff;color:#000}` ahead of the page CSS: the viewer wraps pages in that skeleton. A `#fragment` loads blank unless the page sits in an iframe. Shoot the full page, and once more with every `<details>` and modal open. Open every screenshot and walk it section by section against the **Rules**: items floating on gaps instead of hairline boxes, a rule that stops short of a track, a double line, text touching a line, a fill outside the tracks, a colour that isn't status, all fail. Read the PDF whole (a `pages` range needs `pdftoppm`; without it, render pages with `pypdfium2` in a scratch venv).
   3. **Fix and repeat.** Fix every failure in the page itself, then re-run the audit and re-shoot. Repeat until a full pass finds nothing.
   Done when the audit returns `[]`, nothing scrolls sideways at 390px, both themes read clearly, every screenshot passes every rule, and every PDF heading shares a page with its content.
4. **Output.** The finished `.html` is self-contained apart from the Google Fonts `@import` (CSS and both SVGs inlined). Artifact: publish it; republishing an existing one needs a fresh `read` first. PDF:
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --no-pdf-header-footer --print-to-pdf=out.pdf "file://$PWD/out.html"
   ```
   The CSS prints it light, on A4, with every `<details>` and tab panel open.

## Rules

- **Tokens.** Every value comes from `:root`; inline SVG uses them too (`fill: var(--ink)`). Black, white and zinc carry the page; `--ok`, `--mid`, `--bad` mark status only (`--mid` covers half-states such as rework), and a coloured number also carries a word or symbol. Any other meaning a page coloured, like "a person acts", moves to `--ink`, weight, or a dashed line. Text uses `--ink`, `--ink-2` or `--muted`; `--faint` is for decoration.
- **Type.** Geist at 400 and 500, sentence case. Geist Mono, small, for labels, numbers, code and metadata.
- **Square.** Radius 0 everywhere.
- **Hairlines.** Structure is 1px `--line` rules; depth is the surface step `--bg` → `--panel` → `--recess`, flat.
- **Tracks.** Pages sit between two side lines bounding a 1400px column (`.page`). Horizontal rules run full width; fills and tints stay between the tracks. A component inside a page draws hairlines on its own edges.
- **Boxes.** Items set side by side (stats, findings, features, pros and cons) always sit in hairline cells (`.cells`), never on gaps.
- **Bleed.** Anything carrying its own lines (grid, list, table, tab row, accordion) runs out to the lines around it (`.bleed`), so lines meet lines; text sits one `--gutter` inside.
- **Quiet.** Each fact appears once; backgrounds flat and unornamented. Hover is a `--recess` tint or a 5% ink mix; selected is ink text plus a 2px ink underline (`border-bottom` or an `::after` bar), or an inverted fill.

## Element map

Use the class where one exists; otherwise build the recipe. `h1`, `details`, forms, checkboxes, `code`, `pre`, tables and `figure img` are already styled by element.

| Element | Class / recipe |
|---|---|
| Page frame | `.page`, `.rs-bar`, then `<main>` holding `header.hero`, `.callout(.bad)` and `section.section` + `.head`; `footer.foot` |
| Button | `.btn`, `.btn.primary` |
| Card grid, stats, any side-by-side columns | `.cells` with `.stat` + `.cap` (or an `h3` + text); a lone card is a `--panel` cell with a `--line` border |
| Ranked list | `.rows` |
| Table | `.table` wrapper; `.num(.ok/.mid/.bad)` on number cells |
| Accordion | `.acc` around `<details>` rows |
| Badge, tag | `.chip(.ok/.mid/.bad)` for status, `.tag` for category |
| Before / after | `.rs-pair` |
| Tabs, filters | a row of cells split by hairlines; panels use `role="tabpanel"` so every panel prints |
| Scrolling row (section nav, tabs) | `.rs-strip` > links or buttons: sticky, scrolls between the tracks with an edge fade, rule full width |
| Nav, menu, dropdown | hairline-divided rows, muted text, ink on hover/current; menus on `--panel` with a `--line` border |
| Modal, popover, tooltip | `--panel` box with a `--line` border; backdrop `var(--scrim)` |
| Chart | zinc series, one status colour on the value that matters, hairline gridlines, mono axis labels; below 600px it scrolls inside a `.bleed` block (`overflow-x: auto`, SVG `min-width`) so labels keep their size |
| Diagram (SVG) | boxes `--panel` fill + `--line-2` stroke, flows `--ink-2`, people/gates `--ink`; `svg rect` corners are already square; inside a `.bleed` block on `--panel` |
| Docs with sidebar | `div.rs-docs` > `nav.rs-side` (links; current gets `aria-current`) + `main` holding `<section>` bands. The column divider is `main`'s border, so it runs the full height; never draw it as the sidebar's border |
| Icon | 1.5px-stroke line icon in `currentColor`, ~16px |
| Image outside `figure` | 1px outline `color-mix(in srgb, var(--ink) 10%, transparent)`; a portrait phone capture gets `max-width: 20rem` |
| Brand | the live wordmark in `.rs-brand`; the live R mark as `svg.rs-mark` beside the client name |

## CSS

```css
/* Roboto Studio style: black, white and zinc, sharp corners, Geist + Geist Mono (mono for labels only),
   nothing heavier than 500. Status colour lives only in .chip and .num. Kit classes that would clash
   with common page class names carry an rs- prefix. Every text pairing meets WCAG AA 4.5:1. */
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap");

/* Each colour is light-dark(light, dark); color-scheme picks the side (system, or data-theme on <html>) */
:root {
  color-scheme: light dark;
  --bg: light-dark(oklch(.985 0 0), oklch(.191 0 0));
  --panel: light-dark(oklch(1 0 0), oklch(.226 0 0));
  --recess: light-dark(oklch(.967 .001 286.375), oklch(.269 0 0));
  --line: light-dark(oklch(.92 .004 286.32), oklch(.274 0 0));
  --line-2: light-dark(oklch(.871 .005 286.286), oklch(.375 0 0));
  --ink: light-dark(oklch(0 0 0), oklch(.985 0 0));
  --ink-2: light-dark(oklch(.37 .013 285.805), oklch(.871 .006 286.286));
  --muted: light-dark(oklch(.53 .014 285.938), oklch(.712 .013 286.067));   /* text: AA on bg, panel and recess */
  --faint: light-dark(oklch(.712 .013 286.067), oklch(.6 .014 285.938));    /* decoration only, never text */
  --ok: light-dark(oklch(.505 .135 150), oklch(.76 .16 150));
  --mid: light-dark(oklch(.52 .14 58), oklch(.769 .188 70.08));
  --bad: light-dark(oklch(.54 .21 27), oklch(.7 .19 25));
  --scrim: rgb(0 0 0 / .55);                                                  /* modal backdrop, both themes */
  --mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  /* Page grid: two fixed tracks bound a 1400px column; horizontal rules run the full width; content sits one gutter inside */
  --page: 87.5rem; --gutter: 1rem;
  --track: max(var(--gutter), calc((100% - var(--page)) / 2)); --inset: calc(var(--track) + var(--gutter));
}
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }

*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: 5.5rem; background: var(--bg); -webkit-text-size-adjust: 100%; }
/* body paints its own background: the Artifact viewer's skeleton sets body{background:#fff}, which would show through */
body { margin: 0; padding-bottom: 19px; background: var(--bg); color: var(--ink-2); font: 400 .9375rem/1.6 var(--sans); overflow-wrap: break-word;
  font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
h1, h2, h3, h4 { margin: 0; color: var(--ink); font-weight: 500; }
h1, .headline { font: 400 clamp(2rem, 3.4vw, 3rem)/1.15 var(--sans); letter-spacing: -.01em; text-wrap: balance; }
h3 { font-size: .9375rem; letter-spacing: -.011em; }
strong, b, th { font-weight: 500; }
p { margin: 0; text-wrap: pretty; }
a { color: var(--ink); text-decoration-color: var(--line-2); text-underline-offset: 3px; }
a:hover { text-decoration-color: currentColor; }
code { font: .8125rem/1.4 var(--mono); color: var(--ink); background: var(--recess); border: 1px solid var(--line); padding: 0 .3rem; overflow-wrap: anywhere; }
pre { margin: 0; padding: .75rem 1rem; background: var(--panel); border: 1px solid var(--line); color: var(--ink);
  font: .75rem/1.6 var(--mono); white-space: pre-wrap; overflow-wrap: anywhere; max-height: 35rem; overflow: auto; }
img { max-width: 100%; height: auto; }
svg rect { rx: 0; ry: 0; }
:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
[hidden] { display: none !important; }
/* Form controls: any page gets the studio look without a class */
button, input, select, textarea { font: inherit; color: inherit; }
input:not([type="checkbox"], [type="radio"], [type="range"]), select, textarea { min-height: 2.5rem; padding: .5rem .75rem;
  background: var(--panel); border: 1px solid var(--muted); border-radius: 0; color: var(--ink); }
input::placeholder, textarea::placeholder { color: var(--muted); }
:is(input, select, textarea):focus-visible { outline-offset: -1px; }
input[type="checkbox"], input[type="radio"], input[type="range"], progress { accent-color: var(--ink); }
label { font-size: .875rem; }
hr { border: 0; border-top: 1px solid var(--line); margin: 0; }
.small { font-size: .875rem; color: var(--muted); }
.label { font: 400 .6875rem/1.4 var(--mono); letter-spacing: .01em; color: var(--muted); }

/* ---------- Frame ---------- */
.page { counter-reset: sec; }
.page::after { content: ""; position: fixed; top: 0; bottom: 0; left: var(--track); right: var(--track);
  border-inline: 1px solid var(--line); pointer-events: none; z-index: 30; }

/* Top bar: a 10px rule band over a 56px bar; brand | section nav | meta */
.rs-bar { position: sticky; top: 0; z-index: 20; background: var(--bg); border-bottom: 1px solid var(--line); }
.rs-bar::before { content: ""; display: block; height: 10px; border-bottom: 1px solid var(--line); }
.rs-bar-in { display: grid; grid-template-columns: minmax(14rem, 1fr) minmax(0, auto) minmax(14rem, 1fr); grid-template-areas: "brand toc meta";   /* equal side columns keep the nav centred, however long it is */ height: 56px; padding-inline: var(--track); }
.rs-brand { grid-area: brand; justify-self: start; display: flex; align-items: center; padding: 0 var(--gutter); border-right: 1px solid var(--line); color: var(--ink); }
.wordmark { display: block; height: 1rem; width: auto; }
/* the nav scrolls; a fade on the trailing edge shows there is more, and only while there is */
.toc { grid-area: toc; display: flex; min-width: 0; overflow-x: auto; scrollbar-width: none;
  animation: rs-toc-fade linear both; animation-timeline: scroll(self inline); }
@keyframes rs-toc-fade { from { mask-image: linear-gradient(90deg, #000 85%, transparent); } to { mask-image: none; } }
.toc a { display: flex; align-items: center; padding: 0 1rem; font-size: .875rem; color: var(--muted); text-decoration: none; white-space: nowrap; border-left: 1px solid var(--line); }
.toc a:last-child { border-right: 1px solid var(--line); }
.toc a:hover { color: var(--ink); background: color-mix(in srgb, var(--ink) 5%, transparent); }
.toc a:focus-visible, .table :focus-visible { outline-offset: -2px; }
.rs-bar-meta { grid-area: meta; justify-self: end; display: block; min-width: 0; max-width: min(100%, 22rem); padding: 0 var(--gutter); border-left: 1px solid var(--line);
  font: 400 .75rem/56px var(--mono); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Masthead */
.hero { margin-top: 8px; padding: 3rem var(--inset); border-block: 1px solid var(--line); }
.hero > * + * { margin-top: 1.5rem; }
.rs-eyebrow { display: flex; align-items: center; gap: .75rem; font-size: 1rem; color: var(--ink); }
.rs-mark { flex: none; width: 2rem; height: 2rem; } .rs-mark rect { fill: var(--ink); } .rs-mark path { fill: var(--bg); }
.lead { max-width: 64ch; font-size: 1.125rem; line-height: 1.7; }

/* Sections: bands split by a doubled full-width rule, numbered 01, 02… (the number is not read aloud) */
.section, .callout, .foot { margin-top: 8px; padding: 3rem var(--inset); border-block: 1px solid var(--line); }
.section > * + * { margin-top: 1.5rem; }
.head > h2 { counter-increment: sec; font-size: 1.5rem; line-height: 1.2; letter-spacing: -.011em; text-wrap: balance; }
.head > h2::before { content: counter(sec, decimal-leading-zero) / ""; display: block; margin-bottom: .75rem; font: 400 .75rem/1 var(--mono); letter-spacing: .06em; color: var(--muted); }
.head > p { margin-top: .5rem; max-width: 72ch; font-size: .875rem; color: var(--muted); }

/* Bleed: a lined block runs out one --gutter to the lines around it and closes on its section's bottom rule.
   Works in any <section> or .hero whose side padding is var(--gutter) or var(--inset) (set --gutter per column) */
.bleed { margin-inline: calc(-1 * var(--gutter)); border-block: 1px solid var(--line); }
:is(section, .hero):has(> .bleed:last-child) { padding-bottom: 0; }
:is(section, .hero) > .bleed:last-child { border-bottom: 0; }
.hero > .bleed { margin-top: 3rem; }

/* ---------- Cells: every cell draws its left + top rule; the container clips the outer ones ---------- */
.cells { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); border-block: 1px solid var(--line); overflow: hidden; }
.cells > * { display: flex; flex-direction: column; align-items: flex-start; gap: .375rem; padding: 1rem var(--gutter); min-width: 0;
  border-left: 1px solid var(--line); border-top: 1px solid var(--line); margin: -1px 0 0 -1px; }
.cells > * > * { max-width: 100%; }
.stat { font: 500 1.5rem/1 var(--sans); letter-spacing: -.02em; color: var(--ink); }
.cap { font: 500 .875rem/1.3 var(--sans); }

/* ---------- Ranked rows ---------- */
/* :where() keeps the list-margin reset at zero specificity, so a section's 1.5rem rhythm still applies */
:where(.rows) { margin-block: 0; }
.rows { list-style: none; padding: 0; border-block: 1px solid var(--line); }
.rows > li { display: grid; grid-template-columns: minmax(1.5rem, auto) minmax(0, 1fr); gap: .25rem .5rem; padding: 1.25rem var(--gutter); }
.rows > li + li { border-top: 1px solid var(--line); }
.n { grid-row: span 3; font: 400 .8125rem/1.5rem var(--mono); color: var(--muted); }
.top { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem .625rem; font-size: 1rem; line-height: 1.5rem; color: var(--ink); }
.title { font-weight: 500; letter-spacing: -.011em; }
.end { margin-left: auto; display: flex; flex-wrap: wrap; align-items: center; gap: .375rem .625rem; min-width: 0; }
.why { max-width: 80ch; font-size: .875rem; color: var(--muted); }
.where { font-size: .8125rem; color: var(--muted); }
.cells:empty, .rows:empty { display: none; }

/* ---------- Status ---------- */
.chip { display: inline-flex; align-items: center; max-width: 100%; padding: 0 .4375rem; border: 1px solid var(--line); background: var(--panel);
  font: 400 .6875rem/1.125rem var(--mono); letter-spacing: .02em; color: var(--ink); }
.chip:is(.ok, .mid, .bad) { border-color: color-mix(in srgb, var(--rc) 45%, var(--line)); background: color-mix(in srgb, var(--rc) 10%, transparent); color: var(--rc); }
.ok { --rc: var(--ok); } .mid { --rc: var(--mid); } .bad { --rc: var(--bad); }
.tag { font: 400 .6875rem/1.125rem var(--mono); letter-spacing: .01em; color: var(--muted); }

/* ---------- Table ---------- */
.table { overflow-x: auto; border-block: 1px solid var(--line); }
table { width: 100%; border-collapse: collapse; font-size: .8125rem; }
th, td { padding: .625rem 1rem; text-align: start; vertical-align: top; border-top: 1px solid var(--line); }
th:first-child, td:first-child { padding-left: var(--gutter); }
thead th { border-top: 0; font: 400 .6875rem/1.4 var(--mono); letter-spacing: .01em; color: var(--muted); background: var(--recess); white-space: nowrap; }
.num { font-family: var(--mono); white-space: nowrap; text-align: end; }
.num:is(.ok, .mid, .bad) { color: var(--rc); }
.table table:has(th:nth-child(6)) { min-width: 760px; }

/* ---------- Details: any <details> is an accordion row; .acc groups them between rules ---------- */
.acc { border-block: 1px solid var(--line); }
.acc details + details { border-top: 1px solid var(--line); }
summary { display: flex; align-items: flex-start; gap: .625rem; padding: .875rem var(--gutter); min-height: 44px; cursor: pointer; list-style: none;
  color: var(--ink); font-size: .875rem; overflow-wrap: anywhere; user-select: none; }
summary::-webkit-details-marker { display: none; }
summary::after { content: ""; flex: none; margin-left: auto; margin-top: .45em; width: .4375rem; height: .4375rem; border-right: 1.5px solid var(--muted);
  border-bottom: 1.5px solid var(--muted); rotate: 45deg; translate: 0 -2px; }
details[open] > summary::after { rotate: 225deg; translate: 0 2px; }
summary:hover, details[open] { background: var(--recess); }
/* a bare <table> child stays a table; any other child is a padded grid wrapper */
details > :not(summary, table) { padding: 0 var(--gutter) 1.25rem; display: grid; gap: .75rem; }
details > :not(summary) > .table { margin-inline: calc(-1 * var(--gutter)); border-inline: 0; background: var(--bg); }
details > :not(summary) > .table:last-child { margin-bottom: -1.25rem; border-bottom: 0; }

/* ---------- Callout: a band like a section; its fill stays between the tracks, its rules run full width ---------- */
.callout { margin-inline: var(--track); padding: 2rem var(--gutter); display: grid; gap: .5rem;
  border-image: linear-gradient(var(--line), var(--line)) 1 0 / 1px 0 / 0 100vw; }
.callout .label { color: var(--ink-2); }
:is(.callout, .foot, details > :not(summary)) > * { min-width: 0; }   /* grid/flex items may shrink, so long words wrap */
.callout :is(h2, h3) { font-size: 1.125rem; }
.callout.bad { background: color-mix(in srgb, var(--bad) 8%, var(--bg)); }
.callout.bad :is(h2, h3) { color: var(--bad); }

/* ---------- Before / after, media, links ---------- */
.rs-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr)); gap: 1rem; }
.rs-pair > * { display: grid; gap: .5rem; align-content: start; min-width: 0; }
figure { margin: 0; display: grid; gap: .5rem; min-width: 0; }
figure img, td img { display: block; width: 100%; outline: 1px solid color-mix(in srgb, var(--ink) 10%, transparent); outline-offset: -1px; }
figcaption { font: 400 .6875rem/1.4 var(--mono); color: var(--muted); }
.more { display: inline-block; padding-block: .625rem; margin-block: -.625rem; font: 400 .8125rem/1.5 var(--mono); color: var(--ink); text-decoration: none; }
.more:hover { text-decoration: underline; text-decoration-color: currentColor; }
.more::after { content: " ↗"; color: var(--muted); }
.btn { display: inline-flex; align-items: center; gap: .5rem; padding: .75rem 1.5rem; border: 1px solid var(--muted); color: var(--ink); background: none;
  font: 400 1rem/1.5 var(--sans); text-decoration: none; cursor: pointer; transition: background-color .15s ease-out, border-color .15s ease-out; }
.btn:hover { border-color: var(--ink); }
.btn.primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.btn.primary:hover { background: color-mix(in srgb, var(--ink) 85%, var(--bg)); }

/* ---------- Docs layout: sidebar + content column. The divider is the content column's left border, so it
   always runs the full page height whatever the sidebar's length ---------- */
.rs-docs { display: grid; grid-template-columns: 16rem minmax(0, 1fr); margin-inline: var(--track); }
.rs-docs > main { --gutter: 2rem; min-width: 0; border-left: 1px solid var(--line); }
.rs-side { position: sticky; top: var(--side-top, 0px); align-self: start; max-height: calc(100vh - var(--side-top, 0px)); overflow-y: auto; padding-block: 1.5rem; font-size: .875rem; }
.page:has(.rs-bar) { --side-top: 67px; }
.rs-side a { position: relative; display: block; padding: .5rem var(--gutter); border-bottom: 1px solid var(--line); color: var(--muted); text-decoration: none; line-height: 1.4; }
.rs-side a:hover { color: var(--ink); background: color-mix(in srgb, var(--ink) 5%, transparent); }
.rs-side a:is([aria-current], .on) { color: var(--ink); background: var(--recess); }
.rs-side a:is([aria-current], .on)::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 2px; background: var(--ink); }

/* ---------- Strip: a sticky row of cells that scrolls between the tracks; its rule still runs full width ---------- */
.rs-strip { position: sticky; top: 0; z-index: 20; display: flex; overflow-x: auto; scrollbar-width: none; background: var(--bg); margin-inline: var(--track);
  border-bottom: 1px solid var(--line); border-image: linear-gradient(var(--line), var(--line)) 0 0 1 / 0 0 1px / 0 100vw; }
/* edge fade as an opaque overlay (a mask would also fade the row's own background and let the page show through);
   it pins to the right edge and fades out once the row is scrolled to its end */
.rs-strip::after { content: ""; position: sticky; right: 0; flex: none; width: 3rem; margin-left: -3rem; pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--bg)); animation: rs-strip-end linear both; animation-timeline: scroll(nearest inline); }
@keyframes rs-strip-end { 0%, 90% { opacity: 1; } 100% { opacity: 0; } }
.rs-strip > * { flex: none; padding: .875rem 1rem; border-right: 1px solid var(--line); font-size: .875rem; color: var(--muted); text-decoration: none; white-space: nowrap; }
.rs-strip > :first-child { border-left: 1px solid var(--line); }
.rs-strip > :hover { color: var(--ink); background: color-mix(in srgb, var(--ink) 5%, transparent); }

/* ---------- Footer ---------- */
.foot { padding-block: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .75rem; font: 400 .75rem var(--mono); color: var(--muted); }

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .rs-docs { grid-template-columns: minmax(0, 1fr); }
  .rs-docs > main { --gutter: 1rem; border-left: 0; }
  .rs-side { position: static; max-height: none; padding-block: 0; border-bottom: 1px solid var(--line); }
  .rs-bar-in { grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "brand meta" "toc toc"; grid-template-rows: 56px 44px; height: auto; }
  .rs-brand { border-right: 0; }
  .rs-bar-meta { line-height: 56px; }
  .toc { border-top: 1px solid var(--line); }
  .toc a:first-child { border-left: 0; }
  html { scroll-padding-top: 7.5rem; }
}
@media (max-width: 600px) {
  .section, .hero { padding-block: 2rem; }
  .rows > li { grid-template-columns: minmax(0, 1fr); }
  .n { grid-row: auto; }
  .end { margin-left: 0; flex-basis: 100%; }
  .head > p { font-size: 1rem; }
}
@media (max-height: 30rem) { .rs-bar { position: static; } }   /* 400% zoom: the bar must not cover the page */

/* ---------- Print / PDF: A4, always light, tracks painted on the body, every detail and tab panel shown ---------- */
@media print {
  :root:is(*, [data-theme]) { color-scheme: light; --bg: oklch(1 0 0); }
  @page { size: A4; margin: 12mm 0; }
  .rs-bar, .page::after, nav, .rs-side, .rs-strip, .no-print { display: none !important; }
  .rs-docs { grid-template-columns: minmax(0, 1fr); } .rs-docs > main { border-left: 0; }
  svg { max-height: 240mm; }
  figure img, td img { width: auto; max-width: 100%; max-height: 180mm; margin-inline: auto; }   /* tall captures stay on the page with their heading */
  body { background-image: linear-gradient(var(--line), var(--line)), linear-gradient(var(--line), var(--line));
    background-size: 1px 100%; background-position: var(--track) 0, calc(100% - var(--track)) 0; background-repeat: no-repeat; }
  details:not([open]) > :not(summary, table) { display: grid !important; }
  details:not([open]) > table { display: table !important; }
  details:not([open])::details-content { content-visibility: visible; block-size: auto; }
  [role="tabpanel"][hidden] { display: block !important; }
  summary::after { display: none; }
  .cells { grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); }
  .table { overflow: visible; }
  .head { break-inside: avoid; }
  .head, h2, h3, summary { break-after: avoid; }
  .rows > li, tr, figure, .cells > *, .callout, pre { break-inside: avoid; }
}
```
