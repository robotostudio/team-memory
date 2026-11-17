# Roboto video reference (HyperFrames)

Built to `design.md` alpha.6, social profile, **16:9 cut: 1920×1080**, 30 fps, 22.6s, dark and light. The beat is identical to `../reference` (3:4); the card is a 1640×860 landscape card that fills the frame, with the beat text in a left column and the POC on the right (wordmark centred at 960,540). Copy the patterns; don't re-derive them.

| File | What it shows |
|---|---|
| `index.html` | The marble ground, the hand-off dim, the lofi bed, and the `theme` variable (dark / light) with its colour tokens |
| `compositions/cart-race.html` | Title card with the pixel → sans word reveal, then the cart-race POC on the same sharp card |
| `compositions/end-card.html` | The typed wordmark end card |
| `assets/brand/vendor/roboto-marble.js` | The marble as a drop-in script (source: `roboto-marble.src.js`) |

## What happens (22.6s)

- **0–3.3s, title.** The landscape card scales up on the marble. Words arrive in Geist Pixel Square and swap to Geist 400 in place: "Slow refresh? / Newest change wins."
- **3.3–7.5s, close-up.** The storefront's real cart drawer, zoomed in: the CCS-5 product photo, variant, unit price, stepper, line total, subtotal and checkout button, in the site's own light UI. "Two quick clicks." takes the quantity 1 → 2 → 3 and the totals follow ($980.77 → $2,942.31). Then it rolls back to 2 on its own, with the ring and both totals in red: "Then it rolls back."
- **7.5–12.1s, why.** The cart steps aside, still live, and a request log appears. Two requests race with live timers: the second answers in 0.2s, the first in 1.4s and overwrites it. "The older request answered last."
- **12.1–18.4s, after.** The same race. The stale answer is struck through and ignored; the cart holds 3 with a green ring and returns to the close-up: "Newest change wins."
- **18.4–22.6s, end card.** The card grows to fill the frame and becomes the flat ground; the wordmark types on.
- **Music:** the lofi bed swells into a drum hit on the wordmark's last letter (19.65s; measured 19.71s).

The POC borrows from two Motion Reference videos: the extreme close-up and one-sentence-at-a-time from Granola's "Agent Brief", and the statement beside one live UI with timing shown as a counter from AgentMail's "Agent Calendar". **Realism rule:** the POC's subject is the client's real UI recreated faithfully (real product, real prices, the site's own colours), never an abstract widget. `assets/brand/product-ccs5.jpg` is the client's product photo. `../reference` is the same beat in 3:4.

## Commands

```bash
npx hyperframes check
npx hyperframes render --fps 30 --quality delivery -o renders/roboto-reference-16x9-dark.mp4
npx hyperframes render --fps 30 --quality delivery --variables '{"theme":"light"}' -o renders/roboto-reference-16x9-light.mp4
```

## Reusing the parts

- **Marble:** load `assets/brand/vendor/roboto-marble.js`, then `const m = RobotoMarble.mount(el, "dark" | "light")` and call `m.seek(seconds)` from the root timeline (see `index.html`). It has no clock of its own, so renders are frame-exact. The stock Paper Shaders runtime uses wall-clock timers, which HyperFrames' lint rejects.
- **End card:** set its two lines on the host with `data-variable-values='{"line":"v2.4.0 shipped","meta":"owner/repo · 17 Nov 2026"}'`. The scene before it grows its card to fill the frame in the first 0.55s; the root switches `#dim` on behind it.
- **Mark (the highlights):** `assets/brand/vendor/roboto-mark.js` is loaded by `index.html`. Lines only: nothing fades and nothing is filled. `RobotoMark.underline(tl, { in, target, at, out, on, tone })` draws a line under a word, a number or one line of text, exactly its width. `RobotoMark.box(tl, { in, target, at, out, on, tone })` draws a square of four lines around something a line can't sit under (a control, an image, a block). For a screenshot, pass the target as a box in the panel's pixels. The header comment in the file lists every option. The reference film itself doesn't use it.
- **Theme:** every colour is a CSS variable in `index.html`. Light mode swaps the variables and the marble colours.

## Measured on the renders

- `hyperframes check` passes (lint, runtime, layout, contrast, audio).
- No one-frame jumps and no frozen stretches of 0.75s or more.
- −14.3 LUFS integrated, −1.1 dBTP.

## Credits

- Geist, Geist Mono, Geist Pixel: OFL (`assets/brand/fonts/LICENSE.TXT`), from the `geist` npm package 1.9.2.
- Warp shader: Paper Shaders, Apache-2.0 (`assets/brand/vendor/PAPER-SHADERS-LICENSE.txt`).
- Wordmark: `robotostudio.com/brand/roboto-wordmark-{dark,light}.svg`.
