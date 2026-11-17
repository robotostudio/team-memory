# Story: what to show and what to say

## Pick the angle from the PR

| Angle | When | Shape |
|---|---|---|
| **Fix** | Something was broken or wrong | the symptom the user saw → why → the same thing fixed |
| **Feature** | Something new a user can do or see | what they get → it working → the result |
| **Tidy-up / changelog** | Several small changes (design fixes, copy, spacing) | one beat per change, 3–6s each, before → after in place |
| **Refactor** | Only for teammates, and only if the shape change is the point | why the old shape hurt → the new shape → what it enables |

Audience sets the depth. **Users / social:** lead with what they get, almost no code. **Teammates:** the same, plus the one code path or trade-off a reviewer needs. Never walk the diff file by file.

## Pick the changes
- Read `pr.json`, `diff.patch` and `comments.txt`. List every change, then keep the 1–4 that matter to this audience. Tests, lint, renames and dependency bumps are not beats.
- Sort each kept change:
  - **visible**: it shows on a page (UI, copy, layout, a price, a menu, a breadcrumb);
  - **behaviour**: it doesn't show in a still (a race, a timeout, loading, an error state, headers, schema, SEO, accessibility, performance).
- State: merged → "shipped" is allowed (merged to the production branch). If production can be reached, glance that it matches the after; if it's behind a login, don't block on it. Open or draft → say "in review" or describe the change without claiming release.

## Real screenshot or POC
Use whichever lands faster for a viewer on a phone. Ask: can they see the change itself within a second?
- **Visible change → real screenshot, in place, before → after.** Same crop, same position, so the only thing that moves is the change.
- **Behaviour → a tiny POC from the client's real UI**: the actual screen, recreated in its own theme with the real product, names, photos, prices and brand colour (the cart race in the template is the model). Three framings, one sentence each: close-up of the problem → why it happens (one supporting panel, e.g. a request log with timers) → the same script fixed. 4–8s, the difference visible within a second of the "after" starting, red only at the failure moment.
- **Both**, when the real page gives the place but the change needs explaining, or the "after" isn't live anywhere yet.
- Raw code is a last resort. If code must show: three to five lines, one value marked.

## Source gate (the UI this PR changed is shown real)
For every visual, take the first source that exists. Don't stall on a step that's blocked; move down the list.
1. **The PR's own screenshots.** Authors usually attach before/after pairs to the description; `pr-context.sh` downloads them to `capture/pr/shots/` with their alt text. They are real captures of exactly this change, taken as matching pairs. Use them when the pair matches (same view, same size) and is sharp at the size it will be shown.
2. **A fresh capture** with `capture.mjs`, when the PR has no usable pair or you need a state it doesn't show (a menu open, a hover, a wider view). Open PR: before from production, after from the preview deployment. Merged PR: production shows the *after*; the *before* now exists only in the PR's screenshots or by running the base commit locally.
3. **Behind a login** (`pr-context.sh` marks it `LOGIN`, `capture.mjs` exits with HTTP 401): use step 1. If you still need a fresh capture, ask the user for the Vercel project's "Protection Bypass for Automation" secret and pass `--vercel-bypass <secret>`.
4. **The branch run locally**, if there's nothing deployed.
5. **The design file** (the Figma frame the PR implements).
6. **Stop and ask.** Never rebuild the changed UI from the diff, the description or another video.

Before and after must match: same viewport, scroll, theme and state. Look at every image before planning with it. Recreation is only for what no screenshot can show, and even then it copies a real screen. The plan's source column names the file or URL each screen came from.

## Words
- Title: two short lines in sentence case, the change in plain words ("Tidier menus. / A cleaner footer.", "Slow refresh? / Newest change wins.").
- One mono tag (`BEFORE`, `AFTER`) and one short sentence on screen at a time, ≤ 6 words where possible, stating what the viewer should notice ("Quick links took a column." → "Now descriptions fit.").
- No captions, no narration text, no sentence that repeats the title, no "illustration" disclaimers.
- End card: `line` = what shipped or what changed ("8 design fixes shipped", "Case studies, by service"); `meta` = client or `owner/repo` · `#PR` or date.

## Highlights (lines only)
| Mark | Use it for |
|---|---|
| `RobotoMark.underline` (default) | a word, a number, a label, one line of text |
| `RobotoMark.box` (a square of four lines that draws in) | something a line can't sit under: a control, an image, a block of several lines, a region |

One mark per sentence, on the thing the sentence is about. A square's sides never cross text: **a row of inline items (filters, tabs, nav links, breadcrumbs) always gets an underline**, and anywhere else without clean room around the target, underline the key value instead. Red only for a broken before state, green only for the fixed after state.

## Length
~5s per visible change, 4–8s per POC, 3.3s title, 4.2s end card. One headline change: ~20s. A tidy-up of 4–6 changes: ~30s. Don't pad.

## Verify the proof (before Checkpoint 1)
- The PR, the branch and its state (open / merged / released) are right, and the wording matches.
- Every user-facing claim matches what the screens show.
- Every screen in the plan has a real source, or the plan says why it's recreated.
- Names, prices, numbers and dates come from the PR or the captures.
