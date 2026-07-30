# Measuring the rendered page

Computed styles from a headless browser. Screenshots confirm nothing numeric — a 2px leading error is invisible and is exactly what these tickets are about.

## Serve a fresh build

```bash
pnpm build
PORT=3100 pnpm start
```

Measure a production build, not `pnpm dev`. Pick a port you own — 3000 is often taken by another project, and `curl` will happily return 200 from *its* server.

### The stale-build trap

Rebuilding while a server is running replaces `.next`, and the running server keeps serving HTML that points at a CSS hash that no longer exists. The page loads, returns 200, and renders **completely unstyled** — every measurement comes back plausible-looking and uniformly wrong (all pages identical, `line-height: normal`, `textLeft: 8`).

So after every rebuild, kill by port and confirm the stylesheet resolves:

```bash
lsof -nP -iTCP:3100 -sTCP:LISTEN -t | xargs -r kill -9
sleep 2
PORT=3100 pnpm start &
sleep 8
CSS=$(curl -s http://localhost:3100/<route> | grep -oE '/_next/static/css/[^"]+\.css' | head -1)
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100$CSS"   # must be 200, and $CSS must be non-empty
```

If a sweep returns identical numbers for pages you know differ, suspect this before believing the data.

## Read computed styles

Playwright is present but not linked at the repo root; import it by path:

```js
const { chromium } = await import(
  "/Users/sameer/Code/work/gc-web/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs"
);

const browser = await chromium.launch();
const page = await browser.newPage();
const out = {};

for (const w of [393, 840, 1440]) {
  await page.setViewportSize({ width: w, height: 1200 });
  await page.goto("http://localhost:3100/<route>", { waitUntil: "domcontentloaded" });
  out[w] = await page.evaluate(() => {
    const n = (el, p) => Math.round(parseFloat(getComputedStyle(el)[p]) * 100) / 100;
    // Rendered gap between two blocks, after margin collapse — not the declared margin.
    const gap = (a, b) =>
      Math.round((b.getBoundingClientRect().top - a.getBoundingClientRect().bottom) * 100) / 100;

    const root = document.querySelector("<container selector>");
    const kids = [...root.children];
    const h2 = root.querySelector("h2");
    const after = kids[kids.indexOf(h2) + 1];

    return {
      inset: Math.round(root.getBoundingClientRect().left + parseFloat(getComputedStyle(root).paddingLeft)),
      colWidth: Math.round(root.getBoundingClientRect().width - parseFloat(getComputedStyle(root).paddingLeft) * 2),
      bodySize: n(after, "fontSize"),
      bodyLeading: n(after, "lineHeight"),
      h2Size: n(h2, "fontSize"),
      h2Weight: getComputedStyle(h2).fontWeight,
      h2Tracking: getComputedStyle(h2).letterSpacing,
      h2ToBody: gap(h2, after),
    };
  });
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
```

`waitUntil: "domcontentloaded"` — `networkidle` times out on pages with long-polling or embedded media.

Use `gap()` rather than reading `marginTop`, so the number reflects margin collapse and any `lg:` override actually in force.

Sweep sibling routes in the same run when a shared renderer is involved — that is how blast radius gets measured instead of assumed.

## Interpreting a surprise

When a measurement contradicts what the CSS says, walk the DOM before editing:

```js
[...root.children].slice(0, 6).forEach((el) => {
  const cs = getComputedStyle(el);
  console.log(el.tagName, cs.fontSize, cs.lineHeight, cs.marginTop, cs.marginBottom,
              JSON.stringify(el.textContent.slice(0, 30)));
});
```

Descend one level into any wrapper element. Content nested inside an authored `<div>` is the usual explanation for a rule that appears to have no effect.
