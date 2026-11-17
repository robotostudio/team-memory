---
name: roboto-pr-video
description: Makes a Roboto Studio PR video, a pull request explained in ~15–40s for users, teammates or social, in HyperFrames, in the team's approved look (marble ground, pixel → sans titles, one sharp card, real screenshots and tiny POCs, line highlights, typed wordmark end card, lofi bed). It reads the PR, captures the real before and after screens, plans the beats for approval, builds from the approved template, checks and renders dark and light. Use when someone gives a GitHub PR URL (or several) and asks for a video, a PR video, an update video, a changelog or "a video like the PD Blowers / Topcon ones". Use it instead of HyperFrames' pr-to-video.
---

# Roboto PR video

You turn a pull request into a short HyperFrames film that looks like the approved reference (`examples/reference-16x9-dark.mp4`). The look, the title treatment, the end card and the music are fixed; your job is the story in the middle: which changes, which screens, which sentences, and how each change is shown. Paths are relative to this skill's folder. `PROJECT` is the new film's folder.

## Principles (each one came from team feedback)
- **Don't restyle the approved parts.** Keep `index.html` (marble, theme tokens, hand-off, music), the title treatment and card in/out in the middle composition, and `end-card.html` (only its two lines change). Replace only the middle. Rules: [design.md](design.md).
- **No captions.** There is no voice. The story is told by one mono tag (`BEFORE` / `AFTER`) and one short sentence at a time, plus the visuals.
- **Show the change, don't describe it.** A visible change (UI, copy, layout, a price) is shown in place on the real screen, before → after. Code work (a race, a timeout, headers, schema, performance) becomes a tiny POC built from the client's real UI: close-up of the problem → why → the same script fixed.
- **Real beats recreated.** The UI this PR changed is shown from real images: the PR's own before/after screenshots first, else fresh captures (production / preview deployment), never rebuilt from the diff or a description. Recreate only what a screenshot can't show. Pick per change whichever lands faster. See [references/story.md](references/story.md).
- **Highlights are lines only.** `RobotoMark.underline` for a word, number or line of text; `RobotoMark.box` (a square of four lines that draws in) where a line has nothing to sit under. One per sentence. Never fade, dim, fill, glow or hand-draw a box. See `examples/highlights-lines.mp4`.
- **Smooth, never janky.** Whole scenes drift slowly; anything with live text that drifts or zooms gets `will-change: transform` and moves with `x` / `y` / `scale` only. No gradient masks or faded edges on screenshots.
- **Truthful.** Never say "shipped" for an open or draft PR. Don't present tests or refactors as features. Names, numbers and dates come from the PR.
- **Ask when unsure; don't guess.** If a source is missing (no preview, no production URL), stop and ask.

## Workflow
Make a checklist of these steps and work through it in order.

1. **Setup (once per machine):** `bash scripts/setup.sh`. Docker is not needed. If the `/hyperframes` skill is installed, load it for framework rules; where it disagrees with this skill on look or story, this skill wins.
2. **Brief.** You need: the PR URL(s), the audience (users / teammates / social), the aspect (16:9 by default, for Slack, YouTube and decks; 3:4 for LinkedIn and feeds) and where the project goes (default `~/pr-videos/<repo>-pr-<n>`). Ask only for what wasn't given.
3. **Read the PR.** `bash scripts/pr-context.sh <PR URL> PROJECT/capture/pr` prints the state, branches, production and preview URLs and the biggest files; read `pr.json`, `diff.patch` and `comments.txt` in that folder. List every change and sort it: **visible** (shows on a page) or **behaviour** (a POC). Keep the 1–4 changes this audience cares about.
4. **Gather the real screens** (source ladder in [references/story.md](references/story.md)). Start with the PR's own screenshots that `pr-context.sh` downloaded to `capture/pr/shots/` (listed with their alt text in `shots.tsv`); use a pair when before and after match and are sharp. Capture fresh with `node scripts/capture.mjs` only for what they don't cover (see its header: `--click` to reach a state, `--boxes` for highlight positions). If a URL is behind a Vercel login, don't stall: use the PR's screenshots, or ask for a bypass secret. Look at every image. Nothing usable? Run the branch locally; else the design file; else **stop and ask**.
5. **Plan → Checkpoint 1: stop and wait for approval.** Show:
   - the title words (two short lines) and the end card's two lines (`line`: what shipped; `meta`: repo or client · date);
   - a beat table: # | tag | sentence | what's shown | source (URL or file) | real or recreated | highlight (underline / square / none) | seconds;
   - the aspect and total length. Flag any row that recreates this PR's own UI. Apply changes and re-show if asked.
6. **Build.** Follow [references/build.md](references/build.md):
   - `bash scripts/new-project.sh <16x9|3x4> PROJECT <slug>` (copies the template, wires `compositions/<slug>.html`);
   - copy the captures into `PROJECT/assets/`; write the beats into the middle composition, keeping its title and exit sections; set the title words;
   - `python3 scripts/retime.py PROJECT --exit <EXIT> --line "…" --meta "…"` whenever EXIT changes.
7. **Check.** In `PROJECT`: `npx hyperframes check` (0 errors), then `npx hyperframes snapshot --at <every beat's key moments>` and look at every frame against [references/review.md](references/review.md). Fix and repeat.
8. **Render dark and review.** `npx hyperframes render --fps 30 --quality delivery -o renders/<name>-dark.mp4`, then `python3 scripts/review.py renders/<name>-dark.mp4` and fix every WARN. **Checkpoint 2: stop and wait.** Give the user the path and the beat list.
9. **Deliver.** After approval, render light (`--variables '{"theme":"light"}' -o renders/<name>-light.mp4`), run `review.py` on it, and hand over both paths with a one-line summary for Slack.

## Files
- [design.md](design.md): the video design system (tokens, type, motion, sound, "Showing a change"). Also copied into each project, where HyperFrames reads it.
- `brand/`: the shared brand assets (fonts, lofi track, marble and mark scripts, grain, wordmarks). `new-project.sh` installs them once per version into `<projects folder>/_shared/brand-<version>/` and links each project's `assets/brand` to it, so films don't duplicate them. A project's own `assets/` holds only its captures and photos.
- `template/16x9`, `template/3x4`: the approved reference projects. `compositions/cart-race.html` is the worked example of a POC beat; `assets/brand/vendor/roboto-mark.js` is the highlight helper; `assets/brand/vendor/roboto-marble.js` the ground.
- `scripts/`: `setup.sh`, `pr-context.sh`, `capture.mjs`, `new-project.sh`, `retime.py`, `review.py` (each explains itself in its header).
- `examples/`: the approved reference render and the highlight demo. Match their pace and finish.
- [references/story.md](references/story.md) (what to show and say), [references/build.md](references/build.md) (how to build it), [references/review.md](references/review.md) (what to check before showing anyone).
