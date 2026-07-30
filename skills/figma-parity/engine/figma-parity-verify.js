export const meta = {
  name: 'figma-parity-verify',
  description: 'Compare a built page against its Figma frames at mobile and tablet, region by region, and return the surviving mismatches',
  whenToUse: 'After applying a parity fix, to catch what the numeric checklist did not cover. Invoked by the figma-parity skill.',
  phases: [
    { title: 'Inspect', detail: 'one agent per region × breakpoint — screenshot both sides, measure, diff', model: 'sonnet' },
    { title: 'Confirm', detail: 'adversarial re-check of each reported mismatch', model: 'sonnet' },
    { title: 'Synthesize', detail: 'read the confirmed set as a whole — patterns, blast radius, regressions', model: 'opus' },
  ],
}

// args: {
//   baseUrl:  'http://localhost:3100'   — a server the caller already started
//   route:    '/terms'
//   frozenAt: 1440                      — width that must not have moved (0 to skip)
//   regions:  [{ name, selector, nodes: { '393': '1948:107772', '840': '1948:107547' } }]
// }
const { baseUrl, route, regions, frozenAt } = args
const BREAKPOINTS = ['393', '840']

const PLAYWRIGHT =
  '/Users/sameer/Code/work/gc-web/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs'

const FINDINGS = {
  type: 'object',
  properties: {
    region: { type: 'string' },
    breakpoint: { type: 'string' },
    stylesheetLoaded: {
      type: 'boolean',
      description: 'False if the page rendered unstyled — findings are then meaningless',
    },
    diffs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          element: { type: 'string', description: 'What it is, plus a CSS selector that reaches it' },
          property: { type: 'string', description: 'font-size, line-height, gap, padding, weight, colour, alignment, …' },
          figma: { type: 'string' },
          rendered: { type: 'string' },
          evidence: { type: 'string', enum: ['measured', 'visual'] },
          note: { type: 'string' },
        },
        required: ['element', 'property', 'figma', 'rendered', 'evidence'],
      },
    },
  },
  required: ['region', 'breakpoint', 'stylesheetLoaded', 'diffs'],
}

const VERDICT = {
  type: 'object',
  properties: {
    real: { type: 'boolean' },
    reason: { type: 'string' },
    fix: { type: 'string', description: 'Concrete change, or empty if not real' },
  },
  required: ['real', 'reason'],
}

const HOWTO = `
Figma tools are deferred — load them first:
  ToolSearch({ query: "select:mcp__figma-dev-mode__get_screenshot,mcp__figma-dev-mode__get_metadata,mcp__figma-dev-mode__get_design_context", max_results: 5 })

Screenshot the rendered region with playwright (imported by absolute path, it is not linked at the repo root):
  const { chromium } = await import("${PLAYWRIGHT}")
  const b = await chromium.launch(); const p = await b.newPage()
  await p.setViewportSize({ width: <bp>, height: 1200 })
  await p.goto("${baseUrl}${route}", { waitUntil: "domcontentloaded" })
  await p.locator("<selector>").screenshot({ path: "/tmp/region.png" })
Then Read that file to see it.

Guard against a stale server before trusting anything: the page must reference a
/_next/static/css/*.css that returns 200. An unstyled page still returns 200 and
yields plausible, uniformly wrong readings — report stylesheetLoaded:false and stop.
`

phase('Inspect')

const pairs = []
for (const region of regions) {
  for (const bp of BREAKPOINTS) {
    if (region.nodes && region.nodes[bp]) pairs.push({ region, bp })
  }
}

log(`${pairs.length} region×breakpoint pairs across ${regions.length} regions`)

const results = await pipeline(
  pairs,
  ({ region, bp }) =>
    agent(
      `Compare one region of a built page against its Figma frame. Report only genuine mismatches.

Region: "${region.name}"   selector: ${region.selector}
Breakpoint: ${bp}px        Figma node: ${region.nodes[bp]}
Page: ${baseUrl}${route}

1. get_screenshot on Figma node ${region.nodes[bp]}.
2. Screenshot the same region of the rendered page at ${bp}px wide.
3. Put them side by side and look: type size and weight, leading, letter-spacing,
   the gap between every adjacent block, padding, alignment, colour, corner radius,
   the rendered height of any button or pill.
4. For anything that looks off, confirm it numerically before reporting it — read
   getComputedStyle / getBoundingClientRect for that element, and get the Figma
   number from get_design_context or the node geometry. Report the two numbers.
5. Content differences (wording, length, line counts) are out of scope and are not
   mismatches. Only styling counts.

${HOWTO}

Return every mismatch with both numbers. An empty diffs array is the right answer
when the region matches — do not manufacture findings.`,
      { label: `inspect:${region.name}@${bp}`, phase: 'Inspect', schema: FINDINGS, model: 'sonnet' },
    ),
  // Stage callbacks receive (previousResult, originalItem) — `region`/`bp` live on
  // the item, not in the first stage's closure.
  (found, { region, bp }) => {
    if (!found || !found.stylesheetLoaded || !found.diffs.length) return found
    // Verify each mismatch independently — a vision model comparing two images
    // invents differences, and a false positive costs a wrong edit.
    return parallel(
      found.diffs.map((d) => () =>
        agent(
          `Try to REFUTE this reported Figma/code mismatch on ${baseUrl}${route} at ${found.breakpoint}px.

  element:  ${d.element}
  property: ${d.property}
  figma:    ${d.figma}
  rendered: ${d.rendered}

Re-measure the rendered value yourself, and re-read the Figma value from node
${region.nodes[bp]}.
Set real:false if the numbers actually agree, if the difference is sub-pixel or a
rounding artefact, if it is a content difference rather than a styling one, or if it
sits at a breakpoint outside ${found.breakpoint}px. Default to real:false when unsure.
When real:true, give the concrete fix.

${HOWTO}`,
          // Sonnet, not Opus: the rule set is fixed and the failure mode is skipping
          // the re-measurement rather than reasoning wrong about it — effort buys more
          // here than tier does.
          { label: `confirm:${d.property}`, phase: 'Confirm', schema: VERDICT, model: 'sonnet', effort: 'high' },
        ).then((v) => ({ ...d, region: found.region, breakpoint: found.breakpoint, verdict: v })),
      ),
    )
  },
)

const flat = results.flat().filter(Boolean)
const unstyled = flat.filter((r) => r.stylesheetLoaded === false)
const confirmed = flat.filter((r) => r.verdict && r.verdict.real)

if (unstyled.length) {
  log(`${unstyled.length} region(s) rendered unstyled — rebuild and restart the server, then re-run`)
}
log(`${confirmed.length} confirmed mismatch(es)`)

const frozen = !frozenAt
  ? null
  : await agent(
      `Confirm the frozen breakpoint did not move. Load ${baseUrl}${route} at ${frozenAt}px and
read computed styles for the page title, body text, headings, and any button: font-size,
line-height, letter-spacing, font-weight, and the gaps between adjacent blocks.

Report whether anything looks like it was disturbed by a change intended for narrower
widths — e.g. a value that now matches the mobile or tablet spec instead of its own.

${HOWTO}`,
      { label: `frozen@${frozenAt}`, phase: 'Confirm', model: 'sonnet', effort: 'medium' },
    )

// Per-finding agents each see one diff, so none of them can notice that the set forms
// a pattern — that two frames disagree, that a value is page-specific, that the obvious
// fix would regress a sibling route. That judgment is the whole point of this stage, and
// it is the one place in the workflow where reasoning depth pays for itself.
const synthesis = !confirmed.length
  ? null
  : await agent(
      `${confirmed.length} Figma/code mismatches on ${route} survived adversarial verification:

${JSON.stringify(confirmed.map((c) => ({ region: c.region, bp: c.breakpoint, element: c.element, property: c.property, figma: c.figma, rendered: c.rendered, fix: c.verdict.fix })), null, 1)}

Read them as a set, not one at a time, and answer:

1. Do any of these contradict each other across breakpoints or regions — the same
   property wanting different values? That usually means the frames themselves drifted
   apart, and the value is page-specific rather than global. Say which.
2. What is the blast radius? Find the file each fix would touch and check what else
   renders through it. Name any route that is currently correct and would be moved by
   the obvious fix.
3. Which fixes are one shared change, and which must be scoped per page?
4. Anything here that is not worth fixing — a sub-pixel artefact, or a Figma value that
   looks like a mistake in the frame rather than a spec?

Ground every claim by reading the actual source. Report what you verified, and flag
anything you could not.`,
      { label: 'synthesize', phase: 'Synthesize', model: 'opus' },
    )

return {
  route,
  confirmed,
  synthesis,
  unstyledRegions: unstyled.map((r) => `${r.region}@${r.breakpoint}`),
  frozenBreakpointReport: frozen,
  clean: confirmed.length === 0 && unstyled.length === 0,
}
