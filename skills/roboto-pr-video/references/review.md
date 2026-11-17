# Review: check before showing anyone

Look at the snapshots and the render as the team would. Each item below is something a past render got wrong.

**The approved parts are untouched**
- [ ] Marble ground, grain, theme tokens and music are exactly the template's.
- [ ] Title: words arrive in Geist Pixel and swap to Geist 400 in place (same size and baseline, no slide).
- [ ] Card scales in crisply (no fade) and grows to fill the frame at EXIT; the end card types the wordmark; its two lines are right.
- [ ] Light render: same film, light tokens, readable everywhere.

**Story**
- [ ] No captions. One tag and one sentence at a time; nothing on screen repeats the title.
- [ ] Each visible change is shown in place, before → after, on real screens; each behaviour change is a POC of the real UI.
- [ ] Every screen of the PR's own UI is a capture (production / preview), not a recreation.
- [ ] Wording matches the PR's state (no "shipped" for open PRs); names, prices and dates are real.

**Highlights**
- [ ] Lines only: underlines and drawn squares from `RobotoMark`. No rings, plates, fills, glows, dimming or hand-drawn boxes.
- [ ] One per sentence, on the thing the sentence names. Not every change is marked.
- [ ] Every underline is exactly the width of its text; every square has even air and never crosses or touches text.
- [ ] Red only on a broken before, green only on the fixed after.

**Motion**
- [ ] Nothing stutters: text in drifting or zooming panels is on its own layer (`will-change: transform`), moved with transforms only.
- [ ] Nothing pops in or out in one frame; before → after in place has no double image.
- [ ] The card is never dead for long: `review.py` shows frozen ≤ 65% and no holds of 2.5s+.
- [ ] Screenshots sit in flat, hard-edged panels: no gradient masks or faded edges.

**Delivery**
- [ ] `npx hyperframes check`: 0 errors.
- [ ] `review.py`: OK (−14 LUFS ±1, true peak ≤ −1 dBTP, no snaps, no long holds).
- [ ] Dark and light MP4s in `renders/`, 1920×1080 or 1080×1440, 30 fps.
