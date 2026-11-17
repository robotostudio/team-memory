# Build: from the approved template to a film

## The project
`bash scripts/new-project.sh 16x9 PROJECT <slug>` copies `template/16x9` (or `3x4`) and turns the worked example into `compositions/<slug>.html`.

| File | You may change |
|---|---|
| `index.html` | nothing by hand; `scripts/retime.py` sets its times and the end card's two lines |
| `compositions/<slug>.html` | the title words and everything between the title and the exit |
| `compositions/end-card.html` | nothing (its lines come from `index.html`) |
| `assets/` | your captures and photos go here |
| `assets/brand/` | nothing: it's a link to `../../_shared/brand-<version>`, shared by every film in the folder (fonts, music, marble, `roboto-mark.js`, wordmarks) |
| `design.md` | nothing (HyperFrames reads it) |

## The middle composition
Open `compositions/<slug>.html`. It has three parts; keep the first and the last.
1. **Title (0–3.3s), keep.** `#cr-hook` holds two lines of words; each word is a `.cr-w` with a sans `.cr-s` and its pixel twin `.cr-p` (same text in both). Change the words and keep the reveal times array (one entry per word; add 0.22s steps for more words).
2. **The beats (from `O = 3.3` to `EXIT`), replace.** Reuse the helpers already in the script: `init()` (seek-safe start states), `say(n, t, prev)` (one sentence at a time, blur swap), the `#cr-tag-before` / `#cr-tag-after` tags, `click()` / `press()` (cursor press on the site's spring), and the rolling-number pattern (`qty()`, `.cr-money-col`). Delete the cart, log and cursor markup you don't use.
3. **Exit (`EXIT` → +0.55s), keep.** The body fades and the card scales to fill the frame (1.32 in 16:9, 1.36 in 3:4). Set `EXIT` to when your last beat has been held ~1.5s, then run `python3 scripts/retime.py PROJECT --exit <EXIT> --line "…" --meta "…"`.

The card is 1640×860 at (140, 110) in 16:9 and 900×1100 at (90, 170) in 3:4. Text column: tag at (64, 60), sentence at (64, 136), 54px Geist 400, −0.04em. The subject sits right of it (16:9) or below it (3:4) and stays in the same place through a beat, so the change is the only thing that moves.

## A screenshot beat (visible change)
```html
<div id="sc" style="position:absolute; left:560px; top:120px; width:1000px; height:620px; overflow:hidden; will-change:transform;">
  <img id="sc-before" src="assets/menu-before.png" style="position:absolute; inset:0; width:100%;" />
  <img id="sc-after"  src="assets/menu-after.png"  style="position:absolute; inset:0; width:100%;" />
</div>
```
```js
const sc = document.getElementById("sc");
init("#sc-after", { opacity: 0 });
tl.fromTo("#sc", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, T);      // arrives
tl.fromTo("#sc", { scale: 1 }, { scale: 1.03, duration: 4.5, ease: "none", immediateRender: false }, T); // scene drift
say(1, T + 0.2);                                                                                       // "Quick links took a column."
RobotoMark.box(tl, { in: sc, target: { x: 1, y: 2, w: 3, h: 4 }, at: T + 0.9, out: T + 2.2, on: "light" });   // a block: the old quick-links column
tl.to("#sc-after", { opacity: 1, duration: 0.6, ease: "power2.inOut" }, T + 2.4);                       // before → after in place
say(2, T + 2.5, 1);                                                                                    // "Now descriptions fit."
RobotoMark.underline(tl, { in: sc, target: { x: 1, y: 2, w: 3, h: 4 }, at: T + 3.2, on: "light", tone: "good" });
```
- Capture before and after with identical viewport, scroll and state so they register exactly.
- Show the whole screenshot in a flat, hard-edged panel. No gradient masks, faded edges or vignettes.
- **Box coordinates on a screenshot:** `capture.mjs --boxes` gives CSS px of the shot. Multiply by the display scale (panel width ÷ capture `--width`, e.g. 1000 ÷ 1440 = 0.694) to get the panel's px.

## A POC beat (behaviour)
Copy the cart race's structure: the real UI recreated as HTML in its own colours (`#cr-cart` is the model: real product photo, names, prices), a close-up at 1.3–1.4×, then it steps aside (scale ~0.72, still live) beside one supporting panel (a request log with live timers), then the same script fixed and back to the close-up. Numbers roll, they never jump. The consequence shows where the user cares (totals turn red, then hold green).

## Highlights
`assets/brand/vendor/roboto-mark.js` is loaded by `index.html`; read its header comment.
```js
const panel = document.getElementById("sc");
RobotoMark.underline(tl, { in: panel, target: el,  at, out, on: "light" });            // a word, a number, one line
RobotoMark.box(tl,       { in: panel, target: box, at, out, on: "light", tone: "bad" }); // a control, an image, a block
```
- `target` is an element (its text is measured for underlines) or a box `{x, y, w, h}` in the panel's px.
- `on` is the UI under the line (`light` for a white site), not the film's theme. `tone`: `bad` = red, `good` = green, default ink.
- One per sentence. Rows of inline items (filters, tabs, nav links, breadcrumbs) get an underline, never a square: the square's padding would cross the neighbours. Elsewhere, if a square would touch text, pass `gapX` / `gapY` (the free space) or underline instead. Check every mark in a snapshot.

## Motion rules that keep it smooth
- Animate `x`, `y`, `scale` and `opacity` only. `top`, `left`, `width` and `height` snap to pixels and stutter (HyperFrames' lint rejects them).
- Anything that drifts or zooms and contains live text (a POC, code, a table) gets `will-change: transform` on the element that moves.
- Use the site's curves: enter `expo.out` 0.2–0.5s, glide `power2.inOut` 0.8s, presses on `back.out(3)`. Exits are quicker than entrances.
- Every element that appears or disappears animates; nothing pops in one frame.
- Only deterministic code: no `Date.now()`, `Math.random()`, `requestAnimationFrame` or network fetches.

## Check and render (in PROJECT)
```bash
npx hyperframes check                       # 0 errors; read the warnings
npx hyperframes snapshot --at 4,6,9,12      # look at every beat's key moments
npx hyperframes render --fps 30 --quality delivery -o renders/<name>-dark.mp4
python3 <skill>/scripts/review.py renders/<name>-dark.mp4
npx hyperframes render --fps 30 --quality delivery --variables '{"theme":"light"}' -o renders/<name>-light.mp4
```
The 22px mono labels and the end card's meta line trigger `text_below_floor` warnings; those are by design.
