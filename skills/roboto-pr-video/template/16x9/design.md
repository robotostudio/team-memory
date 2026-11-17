---
version: alpha
name: Roboto Studio — video
description: >
  Temporary video design system for Roboto Studio (owner: Jenil, 2026-11-16), the video-first companion
  to robotostudio.com/design.md and /design/motion.md. Taken from the approved PHP vulnerability video
  (youtu.be/cxACne9TxEM). Atoms are sacred: monochrome white + Tailwind zinc on a dark blurred ground,
  dark rounded glass, Geist 400 everywhere (500 = strong, nothing bold), Geist Mono only for labels and
  machine strings, red only for danger, green/red only for deltas. Composition is free. Works for any
  tool (HyperFrames, Remotion, Resolve, After Effects).
unit: the frame — 1920×1080 at 60 fps primary; 1080×1920 and 1080×1080 recompose the same atoms
principle: atoms are sacred · composition is free · show the change, don't describe it
default-mode: dark   # a light token set follows under `light`
profiles:
  youtube: "1920×1080, 60 fps. Talking videos. Ground = assets/wallpaper.png, rounded dark glass (the PHP video look)."
  social: "1080×1440 (3:4) for LinkedIn and feeds, or 1920×1080 (16:9) for YouTube, decks and embeds; 30 fps. PR, update and feature videos. Ground = marble, sharp solid cards, pixel → sans titles, typed wordmark. Dark or light per the product shown."

colors:
  ground: "#060606"            # base of the wallpaper; solid fallback ground
  ink: "#FAFAFA"               # text on dark
  muted: "#A1A1AA"             # zinc-400: secondary text and labels INSIDE glass / cards
  muted-on-ground: "#D4D4D8"   # zinc-300: secondary text and labels directly on the wallpaper (zinc-400 fails contrast on its light leak, 2.6:1)
  faint: "#71717A"             # zinc-500: tertiary text, code comments
  hairline: "#27272A"          # zinc-800: rules, borders
  surface: "#1A1B1D"           # card / glass base
  glass: "#1A1B1D8C"           # 55%: glass panels over the ground
  glass-solid: "#1A1B1DE6"     # 90%: glass that must stay legible over busy footage
  chip: "#1A1B1DCC"            # 80%: chips and pills
  ring: "#FFFFFF1A"            # 10%: inner 1px ring on glass
  top-edge: "#FFFFFF2E"        # 18%: bright top edge on glass
  inverse: "#FAFAFA"           # emphasis chip fill (inverted, still monochrome)
  inverse-ink: "#0B0C0E"       # text on the inverse fill
  danger: "#D6453D"            # critical, vulnerable, broken. Nothing else.
  delta-up: "#2E9E6B"          # added lines, pass, +numbers. Deltas and pass/fail only.
  delta-down: "#D6453D"        # removed lines, fail, −numbers. Deltas and pass/fail only.
  # — social profile (dark) —
  marble: ["#000000", "#000000", "#8F8F8F", "#000000", "#000000", "#000000", "#7A7A7A", "#000000"]   # Warp shader colour stops: black with silver smoke
  solid-card: "#000000"        # sharp title / content card on the marble
  solid-card-ring: "#FFFFFF1F" # 1.5px inner ring so the card reads where the marble is black
  flat-end: "#000000"          # end-card ground
  endcard-ground: "#030303"
  endcard-grid: "#FFFFFF14"    # 8%: vertical hairline grid on the end card
  endcard-stroke: "#FFFFFFA6"  # 65%: drawn strokes on the end card

light:                         # variant; same roles, site light page
  ground: "#FFFFFF"
  ground-glow: ["#F8F7F4", "#E7E5DF", "#D2D1CB", "#B0B3B6", "#9A9EA3"]   # site Scene light tones, for radial glows
  ink: "#09090B"               # zinc-950
  muted: "#71717A"             # zinc-500
  hairline: "#E4E4E7"          # zinc-200
  surface: "#F4F4F5"           # zinc-100
  glass: "#FFFFFF8C"           # 55%
  glass-solid: "#FFFFFFEB"
  chip: "#FFFFFFCC"
  ring: "#09090B14"
  inverse: "#09090B"
  inverse-ink: "#FAFAFA"
  # — social profile (light) —
  marble: ["#FFFFFF", "#F4F4F5", "#C8C8CC", "#9A9AA0"]   # white with soft grey bands
  solid-card: "#FFFFFF"
  solid-card-shadow: "0 30px 80px -30px #00000033, inset 0 0 0 1.5px #E4E4E7"
  field: "#F4F4F5"             # controls inside a card
  flat-end: "#FFFFFF"

typography:                    # px at 1920 wide; cqw = % of frame width (1cqw = 19.2px)
  display:     { fontFamily: "Geist", px: 120, cqw: 6.25, weight: 400, lineHeight: 1.02, tracking: "-0.035em" }
  number-hero: { fontFamily: "Geist", px: 132, cqw: 6.88, weight: 400, lineHeight: 0.95, tracking: "-0.04em", numeric: "tabular-nums" }
  title:       { fontFamily: "Geist", px: 78,  cqw: 4.06, weight: 400, lineHeight: 1.04, tracking: "-0.03em" }
  subtitle:    { fontFamily: "Geist", px: 32,  cqw: 1.67, weight: 400, lineHeight: 1.3,  tracking: "-0.01em", color: "{colors.muted-on-ground} on the ground, {colors.muted} in cards" }
  caption:     { fontFamily: "Geist", px: 39,  cqw: 2.03, weight: 500, lineHeight: 1.2,  tracking: "-0.015em" }
  body:        { fontFamily: "Geist", px: 30,  cqw: 1.56, weight: 400, lineHeight: 1.4,  tracking: "-0.01em" }
  chip:        { fontFamily: "Geist", px: 28,  cqw: 1.46, weight: 400, lineHeight: 1.0,  tracking: "-0.01em" }   # reading text floor for phones: 28px
  label:       { fontFamily: "Geist Mono", px: 22, cqw: 1.15, weight: 400, tracking: "0.16em", upper: true, color: "{colors.muted-on-ground} on the ground, {colors.muted} in cards" }
  code:        { fontFamily: "Geist Mono", px: 26, cqw: 1.35, weight: 400, lineHeight: 1.55 }
  number-unit: { fontFamily: "Geist Mono", px: 28, cqw: 1.46, weight: 400, color: "{colors.muted}" }
  # — social profile (1080 wide; cqw = % of 1080) —
  social-headline: { fontFamily: "Geist", px: 80, cqw: 7.4, weight: 400, lineHeight: 1.02, tracking: "-0.04em", align: "center" }
  social-title:    { fontFamily: "Geist", px: 68, cqw: 6.3, weight: 400, lineHeight: 1.02, tracking: "-0.04em" }
  social-body:     { fontFamily: "Geist", px: 30, cqw: 2.8, weight: 400, lineHeight: 1.3, tracking: "-0.015em" }
  pixel:           { fontFamily: "Geist Pixel Square", size: "exactly the size of the word it stands in for (the two faces share ascent, descent, cap and x-height)", tracking: "0", note: "transitional only: a word wears it for 0.2s as it arrives; never set static copy in it" }

spacing:
  frame-pad: "62px"            # outer margin of the stage (reference video)
  gutter: "120px"              # left text column for titles and explainers
  gap-sm: "15px"
  gap-md: "30px"
  radius-panel: "16px"         # the screen-recording panel
  radius-glass: "24px"         # glass cards and windows
  radius-card: "12px"          # solid cards inside a glass window
  radius-pill: "9999px"
  blur-glass: "33px"           # backdrop blur behind glass
  blur-swap: "≤ 6px"           # content-swap blur (site rule ≤ 4px at web scale)

components:
  stage:
    ground: "assets/wallpaper.png (dark blurred light leak), or the CSS fallback in the prose"
    description: "The default frame: the wallpaper ground with ONE thing on it: a screen recording in the panel, an explainer, a code surface, or a title. Never stack glass on glass inside one window."
  screen-panel:
    geometry: "1677×956 at (122, 62), radius {spacing.radius-panel}"
    shadow: "black, gblur 30px, 75% under the panel, offset 14px down"
    description: "Screen recordings and product UI. Cropped to the panel's aspect (drop the macOS menu bar). Fixed framing: no zooms or pans on the recording. Enters by rising 56px and fading in over 0.6s."
  webcam-squircle:
    geometry: "374×374 at (1496, 657): 50px from right and bottom; superellipse n=5"
    description: "Only when there's a presenter. Shows a 1080×1080 face crop. Moves between full frame and this slot with a 0.75s glide morph. Keep graphics clear of it (x > 1440, y > 620)."
  glass-card:
    backgroundColor: "{colors.glass} (or {colors.glass-solid} over footage)"
    backdrop: "blur {spacing.blur-glass}"
    border: "inset 1.5px {colors.ring}; inset top edge 1.5px {colors.top-edge}"
    shadow: "0 36px 90px -30px #00000099"
    rounded: "{spacing.radius-glass}"
    description: "Containers for explainer content: a product, a module, a before/after state."
  chip:
    height: "66px"
    padding: "0 27px 0 21px, icon gap 15px"
    backgroundColor: "{colors.chip} + backdrop blur {spacing.blur-glass}"
    border: "inset 1.5px #FFFFFF1F; top edge #FFFFFF33"
    typography: "{typography.chip}; icon or logo 30px, white"
    variants: "danger: ring {colors.danger}@40% + glow, a 12px {colors.danger} dot · inverse: {colors.inverse} fill, {colors.inverse-ink} text, for the one emphasis moment"
    description: "Keyword pills. They pop in on the word that says them, stacked in a column beside the subject."
  logo-chip:
    description: "A glass card or chip holding a product logo (simple-icons) and its name. Logos are ALWAYS monochrome white (black on light). Never brand colours."
  title-block:
    typography: "{typography.title} + optional {typography.subtitle} below (gap 30px)"
    position: "left column at x = {spacing.gutter}, upper third"
    description: "One idea per title, a few words, sentence case, ending with a period when it's a statement ('Monolithic.')."
  label:
    typography: "{typography.label}"
    description: "Eyebrows, metadata, file paths, repo names, versions. Never a sentence."
  code-surface:
    backgroundColor: "{colors.glass-solid}"
    rounded: "{spacing.radius-glass}"
    chrome: "40px title bar: neutral grey traffic lights (12px dots, 8px apart, #5A5B5D), file path in {typography.label}"
    typography: "{typography.code}"
    syntax: "monochrome: identifiers {colors.ink}, keywords {colors.ink} weight 500, strings #D4D4D8 (zinc-300), numbers #D4D4D8, comments {colors.faint}, punctuation {colors.muted}"
    diff: "added line: {colors.delta-up} at 12% fill + '+' gutter in {colors.delta-up} · removed: {colors.delta-down} at 12% + '−' gutter · unchanged lines {colors.faint}"
    description: "The code beat of a PR video. At most 12 lines per hunk, 2–3 hunks per video, changed lines highlighted. The only place green appears."
  caption:
    typography: "{typography.caption}"
    position: "centred, baseline ~ y 980 (bottom 10%)"
    description: "Only when there is a voice: the intro of a talking video. One phrase at a time, no box or pill behind it, no word-by-word colour. A video without a voice has NO captions: the beat text and the visuals tell the story."
  beat-text:
    typography: "{typography.label} (area · status) → {typography.title} (what changed, ≤ 6 words) → {typography.subtitle} (why it matters, one line)"
    position: "text column at x = {spacing.gutter}, vertically centred with the subject; label sits 24px above its title, never on its own"
    description: "How a voiceless video explains itself. Each beat has exactly one trio. It enters with or just before the visual and leaves with it. Hold it for at least 0.3s per word + 1s. Never repeat the same sentence elsewhere on screen."
  visual-diff:
    description: "A visible change shown IN PLACE on one element: real screen in the panel, or a faithful recreation. Hold the before state, mark the region that will change, change only that region with a graceful morph while the camera pushes in on it, hold the after state, pull back. Never cut to a separate 'after' card."
  poc:
    subject: "the client's REAL UI, recreated faithfully in its own theme: the real product, photo, names, prices and brand colour (e.g. a cart drawer with the product thumbnail, variant, unit price, stepper, line total, subtotal and checkout button). Never an abstract widget or a diagram."
    framings: "1 close-up: the UI zoomed in (1.1–1.4×, cropped by the card) while the behaviour happens · 2 why: the UI steps aside, still live, next to ONE supporting panel (e.g. a request log with live timers) · 3 after: the same script again, fixed, returning to the close-up"
    statement: "one mono tag (BEFORE / AFTER) and one sentence at a time (54px, ≤ 6 words), swapped with a 6px blur; no other labels"
    consequence: "show the bug in what the user cares about (totals, prices, availability), not only in the control: the number that is wrong turns red, the fixed one gets a green ring"
    description: "A tiny proof-of-concept for a change that is code work (race conditions, timeouts, loading, accessibility, data). It PERFORMS the behaviour on real-looking UI: the same short script runs as Before and After so the difference is visible within a second."
  timeline-track:
    typography: "{typography.label} for tick labels"
    description: "A thin track under a POC when time is the point (timeouts, slow responses, ordering). Progress runs on the sweep role (linear). Requests are small pills travelling along it; the failure moment is the only red."
  stat:
    typography: "{typography.number-hero} figure + {typography.number-unit} unit"
    description: "One number the speaker says (9.2 / 10, +38%, 17 files). It counts up over 0.9s on the glide curve; red only if the number means danger."
  marble-ground:
    shader: "Paper Shaders 'Warp' (shaders.paper.design), shape edge, colours {colors.marble}"
    params: "dark: proportion 0.5, softness 0.85, distortion 0.25, swirl 0.8, swirlIterations 10, shapeScale 0.1 · light: proportion 0.42, softness 1, distortion 0.3, swirl 0.9, swirlIterations 10, shapeScale 0.1"
    motion: "flows continuously at 0.8 shader-seconds per second; driven by the film clock, never wall-clock"
    grain: "static fine noise over it, overlay blend, 22% on dark / 12% on light"
    description: "The social ground. High contrast and always moving. NOT the mesh gradient (rejected: faded, low contrast, coarse grain). Text never sits on it; only solid cards and product footage do."
  solid-card:
    geometry: "3:4: a 900×900 square centred at (540, 720), or 900×1100 when it carries a POC · 16:9: a 1640×860 landscape card at (140, 110), beat text in a 560px left column, a vertical hairline at x 680, the visual on the right"
    backgroundColor: "{colors.solid-card}"
    border: "dark: inset 1.5px {colors.solid-card-ring} · light: {light.solid-card-shadow}"
    rounded: "0 (sharp, like everything on robotostudio.com; controls and tags inside it are sharp too)"
    in: "scales up from 18% to 100% in 0.5s on a long ease-out (power3.out); fully opaque from its first frame: no fade, no blur"
    out: "its content fades in 0.15s, then the card grows past the frame edges in 0.5s (power2.inOut) and becomes the next ground; no fade, no blur, no dissolve"
    description: "The one surface of a social video: titles, beat text and POCs all live on it. One card carries a whole beat: title → content → grows into the end card's ground."
  pixel-reveal:
    typography: "{typography.social-headline} with {typography.pixel} as the arriving state"
    motion: "words appear one at a time, 0.22s apart (0.4s pause between lines); each arrives in Geist Pixel Square and swaps to Geist 400 in ONE frame 0.2s later; settled words don't move"
    alignment: "the pixel twin sits on the sans word's own line box: same font-size, same baseline, same left edge. Never a different size or a centred overlay (the word then appears to slide or touch its neighbour), never a crossfade"
    description: "The title treatment. Two short lines, centred on the solid card. Hold the finished line 0.5s + 0.3s per word."
  typed-wordmark:
    motion: "the wordmark reveals a letter every 0.1s (R · O · B · O · T · O) with hard steps, then STUDIO 0.25s later"
    description: "How the wordmark arrives on the end card. The music's drum hit lands on the last letter."
  site-plate:
    description: "Product footage for social: the page screenshot or recording as a flat plate tilted in 3D over the marble (rotateY ≈ −14°, rotateX ≈ 4°), drifting slowly. To act on it, the camera pushes in until it fills the frame, then the page blurs heavily (≈ 24px) and darkens behind the real UI component, which stays sharp and at reading size."
  end-card:
    social: "flat {colors.flat-end} ground, no grid: the typed-wordmark (560px wide, centred) + one line + one mono label, drifting 2%, then fading over 0.5s. Entered by the last card growing to fill the frame (solid-card → out), never a cut and never a dissolve."
    ground: "{colors.endcard-ground} with a vertical hairline grid every 90px from x = 60 in {colors.endcard-grid}"
    content: "wordmark (roboto-wordmark-dark.svg) 480px wide, centred, its centre at y ≈ 500 · one line ({typography.body}, e.g. '20 shipped · 5 in review' or the version) 48px below · one meta label ({typography.label}: client or repo · date) 28px below that"
    entry: "never a cut: the last scene's subject glides (1.2s, glide curve) into the wordmark's position and dissolves into it while the ground darkens to the end-card ground UNDERNEATH it (the outgoing scene darkens its own ground; an overlay on top would hide the subject), the same way the webcam morphs into its squircle"
    description: "Simple and clean. No box, no frame around the content. The grid lines draw in top to bottom (staggered 30ms), the wordmark reveals left to right with a clip on the glide curve, the two lines rise in on the soft spring 0.12s apart, everything drifts 2% for the hold, then a 0.6s fade to black. 3.5–4.5s in total, never frozen. YouTube long-form keeps the 15s Outro 2 file."
---

# Roboto Studio — video

## Overview

This is how Roboto videos look and move. It comes from the PHP vulnerability video, the first one that went through every review round and shipped. Use it for YouTube videos and for PR videos (a pull request explained for users, teammates or social). It sits on top of the brand globals in [robotostudio.com/design.md](https://robotostudio.com/design.md) and the motion roles in [/design/motion.md](https://robotostudio.com/design/motion.md). Where video needs something different, this file says so.

The look in one line: **a dark, softly lit ground; one thing on it at a time; white type and dark glass; monochrome except where colour means something.**

- **Ground.** `assets/wallpaper.png`: near-black (#060606) with a soft diagonal light leak from the left edge to the top centre, and a glow in the top-right corner. Without the file, the CSS fallback is:
  ```css
  background:
    radial-gradient(60% 45% at 18% 32%, #646464d9, transparent 70%),
    radial-gradient(40% 30% at 42% 14%, #646464b3, transparent 70%),
    radial-gradient(22% 28% at 100% 0%, #5f5f5fbf, transparent 70%),
    #060606;
  ```
  Use radial gradients, not linear ones: full-frame linear gradients band under H.264.
- **Surfaces** are dark rounded glass. These are the site's Scene panels, scaled for video.
- **Type** is Geist 400 at large sizes with tight negative tracking. Hierarchy comes from size and grey, never weight.
- **Colour has jobs:**
  - Red #D6453D means danger: vulnerable, critical, broken.
  - Green #2E9E6B and red mean deltas and pass/fail, which in practice means diffs and test results.
  - Nothing else is coloured. **No Tide** (the site's Scene accent is not used in video), no pink, no third-party accent colours, no coloured logos.

## Do's and don'ts

**Do**
- Put one idea on screen at a time. With a voice, cue it to the word that says it: a chip pops on its keyword, a title rises on the sentence that introduces it. Without a voice, the beat text leads and the visual answers it.
- Keep every frame alive. Whole scenes drift (scale 1 → 1.03 across the scene), and the intro never sits still for more than a second.
  - **So text doesn't stutter while it drifts:** anything that drifts or zooms and contains live text (a code block, a POC, a table) gets its own layer (`will-change: transform` on the element that moves), and is moved with transforms only (`x`, `y`, `scale`), never `top`, `left`, `width` or `height`. Without the layer, small type re-snaps to the pixel grid every few frames and visibly jitters.
- Build things from parts and turn them into each other: modules fold into a block, a card grows into the next scene, a crack splits a logo. Prefer transformation to cutting.
- Use real logos for real products, in white.
- Keep text short. The voice carries the detail; the screen carries the noun, the number, the contrast.
- Leave the frame quiet when the speaker is the point.

**Don't**
- No captions without a voice. No caption that repeats a title. No pill or box behind captions.
- No "Example wording, for illustration." sentences. If a string is illustrative, put a mono `ILLUSTRATION` label in the card header.
- No fading to an empty ground between beats, and no elements arriving from arbitrary directions.
- No logo bug, chapter titles or lower thirds. The wordmark appears only on the end card.
- No mesh-gradient or shader grounds, and no framing the screen or webcam inside extra windows. These looked flat and were rejected.
- Don't put explainers or overlays on every point. Explainers go to the one to three ideas the video is about, overlays only where a number, a name or a list helps.
- No bold weights, title case, ALL-CAPS headlines, or text shadows.
- No whip pans, spins, 3D flips, glitch, light leaks, zoom blur, or whoosh-style transitions.
- No colour for decoration: no gradient text and no coloured glows except the danger red.

## The frame (1920×1080)

| Zone | Rule |
|---|---|
| Margins | 62px on every side; the text column starts at x = 120 |
| Screen panel | 1677×956 at (122, 62), radius 16, soft shadow; fixed framing |
| Webcam squircle | 374×374 at (1496, 657), only with a presenter; keep graphics out of x > 1440, y > 620 |
| Titles | Upper-left third, one or two lines |
| Captions | Bottom centre, one phrase |
| Overlay chips | A column beside the subject (on webcam, the wall area x 72–730, y 354–774), or the upper-left of the screen panel |

For 9:16 and 1:1, keep the atoms (colours, type, components, motion) and recompose. Stack the elements vertically and scale the type by width (the cqw values).

**Composition**
- The subject (a card, a POC, the screen) is big: 45–70% of the frame width. Small cards floating in an empty frame read as unfinished.
- Two layouts only:
  - **Centred subject**, with the beat text above it.
  - **Text column + subject:** the beat text at x = 120 on the left, the subject on the right, both centred on the same horizontal line.
- Within one sequence the subject keeps its position, so the eye stays put and the change is the only thing that moves.
- Nothing sits in the bottom 15% unless it's a caption under a voice.

## Showing a change

Every change in a PR or update video is one of two kinds. Pick the treatment by kind, not by habit.

**1. A visible change (UI, copy, layout, a price, a button).** Show it in place, with the visual-diff beat:

1. **Before**, 1.2–1.5s: the real screen (or a faithful recreation), with the beat text entering.
2. **Mark**, 0.35–0.5s: a line or a square draws on the region that will change (see the table below). Use red only if the before state is broken for the user.
   - **Lines only.** Nothing fades back and nothing is filled or tinted. There are two marks, both from `assets/brand/vendor/roboto-mark.js` (see the reference README), both 2px, solid and sharp, with fixed values so every highlight in a film matches:

     | Mark | What it does | Use it when |
     |---|---|---|
     | **Underline** (`RobotoMark.underline`) | A line draws under the text, exactly its width, 6px below it, left to right in 0.35s; it retracts in 0.25s. | The default. The subject is a word, a number, a label or one line of text. |
     | **Square** (`RobotoMark.box`) | Four lines draw a rectangle around the subject: two strokes leave the top-left corner together and meet at the bottom-right, 0.5s; it retracts the same way in 0.3s. 12px above and below, 16px left and right. | A line has nothing to sit under: a control (a stepper, a button, a toggle), an image, a block of several lines, a whole region. |

   - **One mark per sentence,** on the thing the sentence is about. Don't mark everything that changed.
   - **The square needs air:** if the padding would touch a neighbour, pass the free gap (`gapX`, `gapY`) and it shrinks to half of it. A side never crosses text. If there isn't room for a clean square, underline the key value inside it instead.
   - **Colour:** near-black on a light UI, near-white on a dark UI; red only for a broken before state, green only for the fixed after state.
   - **Never hand-build these:** the helper measures the element (for an underline, its text, not its container), lands on whole pixels and uses the same numbers every time. For a screenshot, pass the target as a box in the panel's pixels.
3. **Change**, 0.6–0.9s, glide curve. Only that region changes:
   - text crossfades with ≤ 6px blur;
   - numbers roll;
   - a strikethrough draws and the old value slides out;
   - a button morphs its fill, size and label;
   - the camera pushes in 1.08–1.15× on the region at the same time.
4. **After**, 1.5s+: the changed region holds, underlined in green if it is the fix. Hold.
5. **Pull back**, 0.8s, glide, into the next beat.

The viewer should see what changed without reading anything. A split before | after view is only for comparing two states that both matter; a divider sweeps across on the glide curve.

**2. Code work (race conditions, timeouts, loading, errors, accessibility, data).** Show it as a tiny POC: the client's real UI, recreated, performing the behaviour.

- **Real UI, not a diagram.** Recreate the actual screen in its own theme with the real product, photo, names, prices and brand colour. An abstract stepper or a boxes-and-arrows diagram reads as flat; a cart drawer with the client's product reads as true. Ask for a screenshot of the real screen and match it.
- **Three framings, one sentence each:**
  1. *Close-up:* the UI zoomed in while the bug happens ("Two quick clicks." → "Then it rolls back.").
  2. *Why:* the UI steps aside, still live, beside one supporting panel such as a request log with live timers ("The older request answered last.").
  3. *After:* the same script, fixed, returning to the close-up ("Newest change wins.").
- **Show the consequence.** Let the bug hit what the user cares about: the line total and subtotal drop with the quantity and turn red.

- **One component, one script, run twice:** labelled `BEFORE` and `AFTER` (mono labels), in the same place, the after run replacing the before run on the same card.
- **Script it as beats:** a cursor or event acts, the system responds, the result lands. The cursor follows the site's choreography (arcs, settles 100ms, presses to 0.8, releases on the pop spring).
- **Show time when time matters,** with a timeline track:
  - a slow cart refresh is a pill that arrives late and overwrites the newer change (before), then is ignored (after);
  - a store call that hangs spins forever (before), then times out at 8s and recovers (after);
  - a click flashes a skeleton (before), then keeps the page on screen with a thin progress bar (after).
- **The difference is visible within a second** of the after run starting. Red marks only the failure moment.
- **Keep it tiny:** 4–8s per POC, three parts at most, real strings from the PR where possible.
- **Reference:** `reference/` and `reference-16x9/` build exactly this for the cart race.
- **Tooling:** any tool works. [Stageshow](https://benji.org/stageshow) (React faux-UI demos driven by a beat script, `npx skills add benjitaylor/skills --skill stageshow`) is a good fit. Use our tokens for its look, and its `jumps` / `layout` checks to catch one-frame snaps and overflowing text before rendering. In HyperFrames, either build the POC as a composition with the same beat structure, or bring a recorded POC in as footage on the glass card.

A big number can support a beat (188 of 1,091 products) but never replaces the demonstration.

## Transitions

- **Between beats:** carry the subject over and transform it into the next one (a card resizes into the next card, a screen region becomes the next POC). If nothing carries over, glide-push: the outgoing beat moves 6–10% left and fades while the incoming one arrives from the right, overlapping by 0.3s. Never leave empty ground between beats.
- **Into the end card:** the last subject glides into the wordmark's position and dissolves into it while the ground darkens to the end-card ground beneath it (1.2s, glide curve). This works like the webcam ↔ squircle morph in talking videos: one continuous move, no cut.

## Motion

Use the site's roles, at video durations:

| Role | Curve | Video duration | Used for |
|---|---|---|---|
| enter | `cubic-bezier(.23,1,.32,1)` | 200–260ms, from scale .96 or a 16–24px rise, blur 4→0 | Text, cards appearing |
| exit | same curve, never ease-in | 140–160ms | Anything leaving; always quicker than its enter |
| glide | `cubic-bezier(.8,0,.2,1)` | 1.2–1.75s | Camera moves, scene-to-scene transforms, morphs, end-card strokes |
| move | `cubic-bezier(.8,0,.2,1)` | 300–520ms | Lines drawing in, small repositions |
| pop | spring 400 / 22 / 1 (~2% overshoot) | ~0.5s | Chips, logos, cards that land |
| soft | spring 170 / 24 / 1 | ~0.8s | Titles rising |
| drift | `cubic-bezier(.3,0,.7,1)` | the whole scene | Slow 3–4% push-in |

- Stagger related items by 0.05–0.4s, following the words.
- Exits come 0.15s before the next idea starts.
- Something that grows with the camera animates its real width/height, not `scale`, so logos stay sharp.
- Mode changes: a full-frame webcam shrinks into the squircle (or back) over 45 frames on the glide curve, while the stage appears underneath. After an intro, the squircle pops in (scale .82 → 1, 16 frames, enter curve).

## Sound

- **Voice:** −21 LUFS integrated in the mix. A human voice-over is the default. TTS for PR videos is calm and plain.
- **Music:** `just-in-time-lofi.mp3` (Video drive: `/Volumes/Video/music/`). Only one track, and no music under speech except the closing bed:
  - From the first word of the sign-off, the bed fades in over 2s at −18 dB under the voice.
  - It swells to full level on the end card: the track's drum hit at 17.96s lands 0.55s after the cut to the end card.
  - It fades out over 0.5s at the end.
- **Videos without a voice** may run the same track throughout:
  - The bed sits 5 dB under full level.
  - It swells over 0.6s into the drum hit (17.96s in the track). The hit lands as the last subject dissolves into the wordmark: start the track at 17.96 − (hit time).
  - It fades out with the picture.
  - Gain plus a −1.5 dB limiter brings it to −14 LUFS / ≤ −1 dBTP; measure the render.
  - Silent is also fine for autoplay feeds.
- **No sound effects.** No whooshes, risers or UI clicks.
- **Delivery:** −14 LUFS integrated, −1 dBTP, AAC 48 kHz.

## Edit rules

- **Keep all content.** Tighten pauses to about 0.3s and cut fillers (um, uh, "you know", stutters, false starts) only where the join sounds clean. Never cut real content to hit a length.
- **Structure for a talking video:**
  1. Intro (10–15s): one continuous motion graphic built from the opening lines, with small phrase captions.
  2. Body: alternate full-frame webcam (opinion, story) and stage (screen recording or explainer, with the squircle webcam).
  3. Sign-off on webcam.
  4. End card.
- **Structure for a PR video** (HyperFrames `pr-to-video` angles fit inside this):
  1. Hook: what users get, in one title or the first frame of the visual diff.
  2. Proof: the visual diff, or a POC for code work (see "Showing a change").
  3. Optional code beat: one or two hunks on the code surface, only when the code itself is the story.
  4. End card with version and repo/URL.
- **Structure for an update roundup** (many PRs for one client):
  1. An opening beat with the totals.
  2. The 4–6 changes that matter most to the client, 5–8s each, each one a visual diff or a POC.
  3. The end card with the totals.

  Fewer, demonstrated changes beat many listed ones.
- **For both:** lead with impact, never the diff. Don't present tests or refactors as features. Check that names, versions and "shipped vs in review" are true.
- **Captions:** only under a voice (the intro of a talking video). A video without a voice has no captions; see beat-text.
- **Export:**
  - MP4, H.264 High, 60 fps, AAC 48 kHz, faststart.
  - 1920×1080 at about 40 Mbps for YouTube, 16 Mbps minimum for social.
  - 3840×2160 needs 35–45 Mbps; at ~8 Mbps the dark gradient ground blocks.

## Light variant

Use light only when the content is light: a light product UI, docs, or a page that would look wrong on black. Swap in the `light` tokens:

- **Ground:** #FFFFFF, with soft radial glows from the light Scene tones (#F8F7F4 → #9A9EA3) in place of the wallpaper.
- **Glass:** white at 55%.
- **Text and hairlines:** zinc-950 text, zinc-500 muted, zinc-200 hairlines.
- **Logos and wordmark:** black, the `-light` files.
- **Unchanged:** red, the delta colours, type, motion and layout. The end card stays dark in both modes.

## Assets

- **Wallpaper:** `assets/wallpaper.png` (1920×1080), shipped with this file. Its source is the Figma wallpaper bpxl_wp002_02.
- **Wordmark (end card only):**
  - Dark: `https://robotostudio.com/brand/roboto-wordmark-dark.svg`
  - Light: `https://robotostudio.com/brand/roboto-wordmark-light.svg`
  - Never recolour it.
- **Fonts:** Geist and Geist Mono (Google Fonts, or the npm `geist` package).
- **Logos:** simple-icons (monochrome SVG). **Icons:** lucide, line style, 1.75px stroke at 20px.
- **Outro 2 (YouTube long-form only):** `/Volumes/Video/motion-graphics/Outro 2.mov`.
- **Reference for motion and pacing:** the PHP video, https://youtu.be/cxACne9TxEM.

## Social profile (PR, update and feature videos)

This look comes from the editor's TL;DR and F5 Aisle LinkedIn edits. It applies to PR, update and feature videos. YouTube talking videos keep the wallpaper-and-glass look above.

- **Format:** 1080×1440 (3:4) for feeds, or 1920×1080 (16:9) for YouTube, decks and embeds. 30 fps, 15–25s. The two cuts are the same beat with the same timings. In 3:4 the card is a square with the beat text above the visual; in 16:9 it is a landscape card that fills the frame, with the beat text in a left column and the visual on the right, and the headline goes up to 104px. Dark or light as a whole, chosen by the product shown. Never mixed.
- **Ground:** the marble (`marble-ground`). It moves the whole time, so nothing else needs to move to keep the frame alive.
- **Surfaces:** sharp solid cards (`solid-card`). No rounded glass, no blur-behind panels. Controls, tags and rings inside a card are sharp too. Real product UI is shown as it is.
- **Type:** Geist 400 with tight tracking (−0.04em on headlines) and 1.02 leading. Titles arrive with the `pixel-reveal`. Geist Pixel is only ever a 0.2s arriving state.
- **Text lives on cards,** never on the marble.
- **One card per beat:** the card scales in crisply, shows the title, then becomes the content (beat text plus the visual diff or POC), then grows to fill the frame.
- **End card:** `typed-wordmark` on a flat ground. The last card grows past the frame edges and becomes that ground.
- **Crisp, not soft:** cards and titles never fade or blur in or out. Scale and hard swaps only; blur is for content swaps inside a card.
- **Everything else is unchanged:** "Showing a change" (in-place diffs, tiny POCs), the colour rules, no captions without a voice, the music recipe and −14 LUFS.

What we do differently from those two edits, on purpose:
- Beats hand off through a shared object or a morph, not hard cuts (title → screen, last beat → wordmark).
- Loudness is −14 LUFS (TL;DR shipped at −25).

## Reference project

`reference/` (3:4) and `reference-16x9/` (the same beat at 1920×1080 on a landscape card) are HyperFrames projects built to the social profile. In each:
- `index.html`: the marble ground (clock-driven shader), the hand-off dim, the music, and a `theme` variable (dark / light).
- `compositions/cart-race.html`: the title card with the pixel reveal, then the cart race POC on the same card.
- `compositions/end-card.html`: the typed wordmark.
- `assets/brand/vendor/roboto-marble.js`: the marble as a drop-in script (`RobotoMarble.mount(el, theme).seek(seconds)`).

`renders/` has the dark and light MP4s. Copy patterns from these instead of re-deriving them.

## Changelog

- **alpha.6.5** (2026-11-17): alpha.6 with two fixes from the teammate renders, nothing else changed:
  - Drifting or zooming live text gets its own layer and transform-only motion, so code and POC text no longer stutter.
  - Highlights are lines only, from `roboto-mark.js` with fixed values: an underline for text, a drawn square where a line has nothing to sit under; one per sentence; no fades or fills.

- **alpha.6** (2026-11-17), the approved POC style:
  - POCs use the client's real UI, recreated, in three framings (close-up → why → after) with one sentence at a time and the consequence shown in the totals.
  - Both references rebuilt with the real cart drawer, 22.6s.

- **alpha.5** (2026-11-17), after frame-by-frame comparison with the editor's cuts:
  - The pixel word shares the sans word's size, baseline and left edge, and swaps in one frame.
  - Cards scale in with no fade and exit by growing to fill the frame.
  - The 16:9 cut uses a landscape card.

- **alpha.4** (2026-11-17), from the editor's TL;DR and F5 Aisle edits:
  - New social profile: 3:4 at 30 fps, marble ground (Paper Shaders Warp), sharp solid cards, pixel → sans titles (Geist Pixel Square, Geist 1.9.2), typed wordmark, site plate.
  - The reference is rebuilt in that profile, dark and light, in 3:4 and 16:9.
  - The YouTube profile is unchanged.
- **alpha.3** (2026-11-16), from building the reference:
  - Labels on the wallpaper use zinc-300 (#D4D4D8), because zinc-400 fails contrast on the light leak.
  - Labels are 22px and reading text 28px (phone legibility).
  - During the morph into the end card, the outgoing scene darkens its own ground under its subject, so the subject stays visible.
  - Recipe for the lofi bed in a voiceless video.

- **alpha.2** (2026-11-16), after the first PD Blowers update renders:
  - No captions without a voice; beat text tells the story instead.
  - New sections: "Showing a change" (visual diffs in place, tiny POCs for code work), composition rules, and transitions.
  - Simpler end card with a morph into it instead of a cut.
  - 4K bitrate.
- **alpha** (2026-11-16): first version, from the PHP video.
