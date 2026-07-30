---
name: figma-parity
description: Measure a page's mobile and tablet rendering against its Figma frames and close the gap. Use when a Linear ticket asks whether a page matches Figma at 393/840, or when the user reports typography or spacing drifting from the design at a breakpoint.
user-invocable: true
---

# Figma parity

Bring a page to **parity** with its Figma frames at mobile (393px) and tablet (840px).

Parity is decided by **measured** numbers on both sides: pixel values read out of Figma, pixel values read out of the rendered DOM. Two frames that look identical at a glance routinely differ by 2px of leading on every line, so the DOM is the instrument here — `getComputedStyle` and `getBoundingClientRect`, at each target width.

Desktop is **frozen**: it was signed off against its own frame, so it must render byte-identical before and after. Every change is scoped below `lg` (1024px), with an explicit `lg:` reset wherever today's desktop value differs from the value you are introducing.

## Step 1 — Set up

Takes one or both ticket IDs (`/figma-parity GC-265`, or `GC-222 GC-265`). With none, ask for one and stop.

Mobile and tablet are usually **two tickets** — one is the other's sub-issue, each with its own Figma frame. Given one, find the sibling: check the ticket's `parentId`, then list its children. Handle both on one branch — they share a renderer, so splitting them means fixing the same file twice. Confirm which ticket the PR should name.

Then run the `prep` skill for its Steps 1–3 only: fetch, branch, move to In Progress. Steps 2–6 here replace prep's generic exploration and plan.

Desktop is frozen by default. If the user says this page's desktop was never checked against Figma, treat all three widths as in scope and say so in the Step 4 report.

Done when: both ticket IDs, both Figma node IDs, and the live route are in hand.

## Step 2 — Read the spec out of Figma

Follow `references/figma-values.md` to pull each frame and decode it. Frame geometry alone yields most of the checklist; named styles fill the rest.

Done when: every row of the parity checklist below has a Figma number **for both breakpoints**. A row you could not source is reported as unknown, not guessed.

## Step 3 — Measure the built page

Follow `references/measuring.md` to build, serve, and read computed styles at 393, 840, and 1440.

Measure the frozen breakpoint now — that reading is the baseline Step 6 proves you did not disturb.

Done when: every checklist row has a rendered number at all three widths, **and** the page's stylesheet was confirmed to load. A stale server serves an unstyled page that returns 200 and yields plausible, uniformly wrong numbers — the reason that check is part of the criterion rather than a footnote.

## Step 4 — Report the drift

Give the user a table before touching code: metric, Figma value, rendered value, delta — for both breakpoints.

Alongside it, state:

- **Blast radius.** Which other routes render through the files you would change. One renderer commonly serves many pages, so a fix aimed at one page silently restyles its siblings.
- **Contradictions.** Where sibling frames disagree with each other. Frames drift apart as a design evolves; when they do, a value is page-specific and belongs behind a per-page flag rather than generalized. Surface the disagreement — resolving it is the designer's call.
- **Regressions you would introduce.** Any page currently correct that your change would move.

Done when: the user has the table and has chosen how to handle any contradiction.

## Step 5 — Fix

Apply the deltas, scoped below the frozen breakpoint. `references/fix-patterns.md` carries the traps that make a correct-looking edit render wrong.

Done when: every row of the table is applied, or deferred with a stated reason. A partial pass reads as finished once the obvious rows are green, which is how the 2px rows survive.

## Step 6 — Prove the numbers

Rebuild, re-serve, re-measure all three widths.

Done when: every checklist row matches Figma at 393 and 840; the frozen breakpoint is identical to the Step 3 baseline, value for value; and `pnpm typecheck && pnpm build && pnpm lint` pass.

## Step 7 — Close the loop

The checklist only proves the rows you thought to measure. Everything you did not think of — a heading that wraps to two lines where Figma has one, a button 6px too wide, a divider that vanished — survives a green table. Step 7 looks at the page.

Run this skill's engine, `engine/figma-parity-verify.js` — resolve it against this skill's base directory and pass the absolute path as `scriptPath`. It ships with the skill rather than in `.claude/workflows/`, so it is not invocable on its own.

It fans out one Sonnet agent per region × breakpoint, each screenshotting both the Figma node and the rendered region, then re-verifies every reported mismatch adversarially — a vision model comparing two images invents differences, and a false positive costs a wrong edit. A final Opus pass reads the surviving set as a whole and reports what no single-finding agent can see: frames that contradict each other, values that are page-specific rather than shared, and any currently-correct route the obvious fix would move.

Leave the server from Step 6 running and pass it in:

```
Workflow({ scriptPath: "<skill dir>/engine/figma-parity-verify.js", args: {
  baseUrl:  "http://localhost:3100",
  route:    "/terms",
  frozenAt: 1440,
  // resolve once in the project under test:
  //   node -e "console.log(require.resolve('playwright'))"
  playwrightPath: "<absolute path to playwright/index.mjs>",
  regions: [
    { name: "header",  selector: "article > header",
      nodes: { "393": "1948:107772", "840": "1948:107547" } },
    { name: "body",    selector: ".legal-prose",
      nodes: { "393": "1948:107794", "840": "1948:107569" } },
    { name: "cta",     selector: "#legal-cta",
      nodes: { "393": "1948:107905", "840": "1948:107680" } },
  ],
}})
```

Regions come from Step 2 — you already walked the frame tree, so you have the node IDs and can name the matching selectors. Three to five regions covers a page; a whole-page screenshot of a long document is too tall to compare and finds nothing.

Then loop: apply the confirmed mismatches — reading `synthesis` first, since it decides whether a fix is shared or belongs behind a per-page flag — rebuild, and re-run. Stop when it returns `clean: true` twice running, or when the only findings left are ones you have deliberately declined and reported.

If it returns `unstyledRegions`, the server went stale mid-run — rebuild, restart, re-run, and discard that round's findings entirely.

Done when: the workflow comes back clean, and the user has the Step 4 table with an after column plus anything the visual pass caught that the checklist missed.

## The parity checklist

Every row, at both breakpoints. Adapt the roles to the page; the categories are fixed.

**Box** — content inset from the viewport edge, column width, section top and bottom padding.

**Type**, for each distinct text role (page title, section heading, body, meta, link, button label) — font-size, line-height, font-weight, letter-spacing.

**Rhythm** — the gap between every adjacent block pair: title to body, heading to its first paragraph, paragraph to paragraph, section to section, last block to any trailing component.

**Components** — for each button, badge, or pill: font-size, line-height, padding, border-radius, and rendered height. Height is the tell that catches a wrong line-height when font-size and padding both look right.

**Colour** — only where a value looks off. Convert the token and compare hex; tokens frequently already match and the row costs nothing to confirm.
