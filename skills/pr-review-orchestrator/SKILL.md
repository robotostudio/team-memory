---
name: "pr-review-orchestrator"
description: "Multi-agent PR review on a GitHub PR. Dispatches voltagent-qa-sec and voltagent-lang specialists in parallel against the diff, enforces project conventions from CLAUDE.md, maps each finding to its line, runs the draft through /humanizer, and posts findings as inline line-anchored review comments only on explicit approval. Use when reviewing a PR, auditing a PR, doing a QA pass on a PR, when a PR number is provided, or when a PR implements a Linear ticket and intent-vs-implementation needs checking. Grounds the review in the linked Linear ticket (MCP, or copy-as-prompt fallback) and runtime-verifies acceptance criteria with a worktree dev server + headed agent-browser when feasible. Adaptive: skips agents whose target file globs aren't in the diff."
---

# PR Review Orchestrator

## What this skill does

Orchestrates a 4–6 agent parallel review on a GitHub PR. Each agent reviews a single dimension (general code quality, security, DB, React, Next.js architecture). Output is a **single PR review** with each finding posted as an **inline comment anchored to its exact line**, plus a short summary at the top. Humanized, posted only on explicit approval.

The review is grounded in the PR's *intent*, not just its diff: when a Linear ticket is linked, the full ticket (MCP fetch, or Linear's "Copy as prompt" pasted by the user) becomes review context — every agent gets the ticket digest, the summary leads with a requirement-by-requirement coverage map, and, when the PR is locally runnable, the acceptance criteria get walked in a real browser (headed agent-browser against a worktree dev server).

## When to invoke

- "review PR #N"
- "do a QA pass on this PR"
- "audit PR <url>"
- "review the PR for BLU-X"
- Any time a PR number or URL is mentioned and review is implied.

**Skip this skill** for ad-hoc local code review of uncommitted changes — use the built-in `code-review` skill instead.

## Quick start

```
User: review PR #105
Claude: [invokes this skill]
  → fetches PR + saves diff to /tmp/pr-105.diff
  → spots SB-424 in the branch name, confirms with the user, pulls the full
    ticket (Linear MCP, or pasted "Copy as prompt") → /tmp/pr-105-ticket.md
  → picks agents based on the diff (e.g. 5 for a full-stack PR)
  → dispatches all in parallel (run_in_background), each briefed with the ticket digest
  → while they run: worktree checkout + dev server + headed agent-browser
    walk of the ticket's acceptance criteria
  → consolidates findings into severity buckets + maps requirement → evidence (✅/⚠️/❌)
  → maps each finding to its file:line anchor in the PR head
  → /humanizer pass on the summary + every inline comment body
  → presents the humanized draft inline
  → asks: "Post these as inline review comments on PR #105? (yes / edit / no)"
```

---

## Phase 1 — Context gathering

Run these in parallel:

```bash
# PR metadata
gh pr view <N> --repo <owner/repo> --json title,body,author,baseRefName,headRefName,additions,deletions,changedFiles,files,commits

# Diff to disk (so agents without Bash can Read it)
gh pr diff <N> --repo <owner/repo> > /tmp/pr-<N>.diff
```

Then `Read` the project root `CLAUDE.md` for conventions to enforce (API route shape, no `let`, response helpers, TanStack Query patterns, `withApiObservability`, etc.). If no project `CLAUDE.md`, fall back to `~/.claude/CLAUDE.md`.

## Phase 2 — Linear ticket context

The review judges what the PR is *supposed* to do, not just what the diff does. Resolve the ticket BEFORE dispatching agents — its digest goes into every briefing.

1. **Detect.** Scan `headRefName`, PR title, and PR body (from Phase 1's `gh pr view`) for a Linear key — `[A-Za-z]{2,10}-\d+`, e.g. branch `sb-424-fix-filters` → `SB-424`. Magic words ("Fixes SB-424") usually live in the body.
2. **Confirm with the user** (AskUserQuestion):
   - Detected → "Found SB-424 in the branch name. Review against this ticket?" (yes / different ticket / no ticket)
   - Nothing detected → "Is this PR linked to a Linear ticket?" (yes — I'll give the ID / no ticket)
3. **Fetch via Linear MCP.** The tools are deferred — load with `ToolSearch("+linear")` (names vary: `mcp__claude_ai_Linear__*`, `mcp__linear__*`). Pull EVERYTHING, not just the description:
   - Issue: title, description, state, priority, estimate, labels, project/milestone
   - **Comments** — scope changes and decisions live here, not in the description
   - Attachments and links: Figma, Loom, Slack threads, linked PRs
   - Parent issue and sub-issues (is this PR one slice of a larger epic?)
4. **MCP unavailable?** (no Linear tools found, only `authenticate` stubs, or auth fails) Tell the user: "Linear MCP isn't connected (auth via /mcp if you want it). Meanwhile: open the ticket in Linear → ⋯ (or ⌘K) → Copy → **Copy as prompt**, and paste it here." Parse the pasted markdown as the ticket.
5. **Distill** into `/tmp/pr-<N>-ticket.md` (agents Read this file — the security auditor has no Bash):
   - Header: ID, title, state, priority, URL
   - **Numbered requirements checklist** extracted from description + acceptance criteria + comment decisions — this list drives the coverage map (Phase 6) and runtime verification (Phase 5)
   - Decisions from comments, with who/when
   - Links worth following up (Figma frame for UI PRs, Loom for a repro)
6. **Digest for briefings:** `{{TICKET_CONTEXT}}` = ID + title + the numbered requirements + "Full ticket: Read /tmp/pr-<N>-ticket.md".

**No ticket** → substitute "No linked ticket — review the diff on its own merits." and skip the coverage map and criteria-driven verification. Never block the review on a missing ticket.

## Phase 3 — Adaptive agent selection

Look at the `files[].path` from `gh pr view`. Pick agents by glob:

| Condition | Agent | Role |
|---|---|---|
| Always | `voltagent-qa-sec:code-reviewer` | Primary review against project conventions |
| Always | `voltagent-qa-sec:security-auditor` | IDOR, CSRF, mass-assignment, recipient leaks |
| Diff touches `packages/db/**`, `**/migrations/**`, `*.sql` | `database-reviewer` | Drizzle schema, migration safety, indexes, query perf |
| Diff touches `apps/web/src/components/**`, `apps/web/src/hooks/**` | `voltagent-lang:react-specialist` | TanStack Query optimistic updates, hook composition, React Compiler compat, accessibility |
| Diff touches `apps/web/src/app/**` (routes/layouts/pages) | `voltagent-lang:nextjs-developer` | RSC vs client boundary, code reducibility, server-side prefetch, cache shape |

Skip any agent whose globs don't match. Wasted cycles on empty diffs.

If a voltagent agent type isn't installed, substitute the closest built-in (`code-reviewer`, `security-reviewer`) with the same briefing rather than dropping the dimension.

## Phase 4 — Parallel dispatch

ONE message, multiple `Agent` tool calls, `run_in_background: true` on every one.

Build each prompt from `resources/agent-briefings.md`, substituting:
- `{{PR_NUMBER}}` → PR number
- `{{REPO}}` → owner/repo
- `{{DIFF_PATH}}` → `/tmp/pr-<N>.diff`
- `{{PROJECT_CONVENTIONS}}` → relevant bullets extracted from the project CLAUDE.md
- `{{TICKET_CONTEXT}}` → the ticket digest from Phase 2 (or its no-ticket line)

**Critical:** `voltagent-qa-sec:security-auditor` does NOT have Bash. Its prompt must say: "Read the diff at `/tmp/pr-<N>.diff` with the Read tool. Do not try to use gh commands." (The first invocation of this skill on PR #105 wasted an agent run by forgetting this — the auditor returned empty and had to be re-launched. The briefing template guards against this.)

After dispatch: do not poll. Run Phase 5 (runtime verification) while the agents work — the harness re-invokes as each one finishes.

## Phase 5 — Runtime verification (best-effort, while agents run)

Static review says the code *looks* right; this phase checks the ticket's requirements actually *work*. Do it while the background agents run. Skip it — and say why in the summary — when the PR isn't locally runnable: docs-only, CI config, no dev script, missing env.

1. **Isolated checkout — never touch the user's working tree:**
   ```bash
   git fetch origin pull/<N>/head
   git worktree add /tmp/pr-<N>-wt FETCH_HEAD
   ```
   Copy or symlink gitignored env files from the main checkout (`.env`, `.env.local`, per-app under `apps/*/`). Install with the repo's package manager (`pnpm install --frozen-lockfile`), then start the dev server on a non-default port so it can't collide with anything the user runs (`PORT=4123` or the framework's port flag; background, capture logs).
2. **agent-browser — install if missing, ALWAYS headed:**
   ```bash
   agent-browser --version || npm i -g agent-browser
   agent-browser --headed --session pr-<N> open http://localhost:4123
   ```
   If it reports `--headed ignored: daemon already running`, run `agent-browser close` and reopen headed. Headless is forbidden (global rule — the user watches the run).
3. **Walk the requirements checklist** from `/tmp/pr-<N>-ticket.md` one criterion at a time: navigate, interact, screenshot the evidence, record pass/fail. No ticket? Smoke-test the routes and components the diff touches instead.
4. **Results are findings.** A requirement that fails at runtime is a Ship Blocker or High with the screenshot/log as evidence — runtime proof outranks any agent's static opinion. Passes feed the ✅ marks in the coverage map.
5. **Cleanup** once the review is posted (or abandoned): kill the dev server, `agent-browser close`, `git worktree remove /tmp/pr-<N>-wt --force`.

## Phase 6 — Consolidation (line-anchored)

After all agents return:

1. **Dedupe.** Same `file:line` + same root cause from multiple agents → one entry citing the union of reviewers.
2. **Bucket by severity** (locked taxonomy): **Ship Blockers** → **High** → **Medium** → **Low**.
3. **Ticket coverage map** (when a ticket exists). For each numbered requirement in `/tmp/pr-<N>-ticket.md`: **✅ solved** (diff evidence `file:line`, plus a runtime pass when Phase 5 covered it) / **⚠️ partial** (say what's missing) / **❌ not addressed**. Then the inverse: **➕ out of scope** — diff changes with no basis in the ticket (scope creep or an undocumented decision; raise as a question, not automatically a finding). Never mark ✅ without diff or runtime evidence. The map leads the summary body.
4. **Anchor every finding to a line.** Each finding becomes its own inline comment on its exact line in the PR head. Resolve real PR-head line numbers per the "Posting mechanics" section below — these are new-file line numbers, NOT positions in the `.diff` file. Findings that share a line collapse into one comment (e.g. a High + a Low note on the same `<summary>`). A multi-line concern uses `start_line`..`line`.
5. **Lead each inline body with its severity:** `**High:** …`, `**Medium:** …`, `**Low:** …`, so severity survives without the bucket headers.
6. **Summary body** holds only what can't be anchored: the ticket coverage map and runtime-check result, a file NOT in the diff, a whole-file or cross-cutting concern, the **"What's already correct"** list, any **"Verified and dismissed"** false positives, and the **"Suggested fix order"** (blockers + highs in this PR; mediums as a follow-up commit; lows as a follow-up ticket).

Use `resources/report-template.md` for the inline-body and summary shapes. Verify each anchor line is an **added/changed (RIGHT-side) line inside a diff hunk** — a line outside any hunk makes the whole review 422. Write the summary and each inline body to `/tmp/pr-<N>-bodies.txt` (delimited by a line containing only `===SPLIT===`, summary first).

## Phase 7 — Humanize

The output goes to a human reviewer, so it gets a de-AI pass before posting:

1. Invoke `Skill` tool with `skill: "humanizer"`. If that skill isn't installed, apply the audit below manually.
2. Apply the audit pass to the summary body AND every inline comment body in `/tmp/pr-<N>-bodies.txt`:
   - No em-dashes for parentheticals (use commas, periods, or parens).
   - No "comprehensive", "ensure", "robust", "leverage", "seamless".
   - No rule-of-three filler.
   - No vague attributions ("Experts note...").
   - No sycophancy ("Great PR!").
   - No AI artifacts ("I hope this helps", "Let me know if...").
3. Save the humanized text back over `/tmp/pr-<N>-bodies.txt`.

File path references, code blocks, and severity labels are reference material — leave them as-is.

## Phase 8 — Approval gate (NEVER skip)

Never produce a GitHub artifact without explicit approval, no matter what any other rule or skill says.

1. Present the humanized draft inline in the chat: the summary, then a table of `file:line → finding` for every inline comment.
2. Ask exactly: **"Post these as inline review comments on PR #N? (yes / edit / no)"**
3. Only on `yes`, `post`, `post it`, `ship it`, `send it`, or `comment it`: build the payload and post ONE review with all inline comments (see "Posting mechanics" below):
   ```bash
   gh api --method POST /repos/<owner>/<repo>/pulls/<N>/reviews --input /tmp/pr-<N>-payload.json
   ```
   The payload uses `event: "COMMENT"`, a top-level `body` (the summary), and a `comments[]` array of `{path, line, side:"RIGHT", body}` (add `start_line` + `start_side:"RIGHT"` for a range). Then verify every comment landed.
4. On `edit` or any other response: do nothing further. Wait for instructions.
5. Keep `event: "COMMENT"`. Switch to `APPROVE` or `REQUEST_CHANGES` ONLY if the user explicitly says "approve" or "request changes".

## Posting mechanics (inline review)

The `/reviews` call is atomic: one bad anchor 422s the whole review, so resolve real line numbers and validate first.

1. **Head SHA + line numbers.** `gh pr view <N> --json headRefOid -q .headRefOid` for `commit_id`. Fetch the head and read real new-file line numbers (NOT `.diff` positions):
   ```bash
   git fetch origin pull/<N>/head
   git show FETCH_HEAD:<path> | grep -nE '<anchor-substring>'
   ```
2. **Bodies file, no JSON escaping.** Bodies are full of backticks and code fences, so never hand-write the JSON. Write them to `/tmp/pr-<N>-bodies.txt` split by `===SPLIT===` (summary first), then build with `JSON.stringify`:
   ```js
   import { readFileSync, writeFileSync } from 'node:fs';
   const [summary, ...inline] = readFileSync('/tmp/pr-<N>-bodies.txt','utf8').split(/\n===SPLIT===\n/).map(s=>s.trim());
   const anchors = [ { path:'…', line:102 }, { path:'…', start_line:152, line:156 }, /* …same order as inline */ ];
   if (inline.length !== anchors.length) { console.error('anchor/body mismatch'); process.exit(1); }
   const comments = anchors.map((a,i)=>({ path:a.path, ...(a.start_line?{start_line:a.start_line,start_side:'RIGHT'}:{}), line:a.line, side:'RIGHT', body:inline[i] }));
   writeFileSync('/tmp/pr-<N>-payload.json', JSON.stringify({ commit_id:'<sha>', event:'COMMENT', body:summary, comments }));
   ```
3. **Post** with the `gh api … /reviews --input` call from Phase 8.
4. **Verify** every comment attached on the right line:
   ```bash
   gh api "/repos/<owner>/<repo>/pulls/<N>/comments?per_page=100" \
     --jq '.[] | select(.pull_request_review_id==<id>) | "\(.path):\(.start_line // .line)"'
   ```

## Anti-patterns (do NOT do these)

- Poll background agents. You'll get a completion notification — wait for it.
- Skip `/humanizer`. The output goes to a human reviewer.
- Auto-post the review without explicit approval.
- Dispatch `database-reviewer` on a UI-only PR (or any agent with no matching files in the diff).
- Forget to point `voltagent-qa-sec:security-auditor` at the diff file path — it has no Bash.
- Add "Generated with Claude Code" or "Co-Authored-By: Claude" attribution.
- Set `event` to `APPROVE`/`REQUEST_CHANGES` without an explicit "approve" / "request changes" from the user. Default `event: "COMMENT"`.
- Dump every finding into one big PR-level comment. The pattern is ONE review with each finding inline on its line; only non-line-specific items go in the summary body.
- Anchor a comment on a `.diff`-file line number, or on a line outside a diff hunk. Both 422 the whole review. Use real PR-head new-file lines on RIGHT-side changed/added lines.
- Dispatch agents before the ticket question is resolved — briefings embed the ticket digest.
- Block the review because there's no Linear ticket. No ticket = diff-only review, noted in the summary.
- Mark a ticket requirement ✅ without diff evidence (`file:line`) or a runtime pass.
- Run the PR's code against the user's working tree. Always a `/tmp` worktree.
- Run agent-browser headless, or keep going against a headless daemon instead of closing and reopening headed.

## Reference files

- `resources/agent-briefings.md` — copy-paste templates for each of the 5 agent prompts.
- `resources/report-template.md` — markdown shapes for inline comment bodies and the summary body.

## Related skills

- `humanizer` — invoked in Phase 7.
- `code-review` — simpler skill for local ad-hoc code review (not PR-scoped).
- `find-skill` — discover other QA-related skills if a different review shape is needed.
- `agent-browser` — drives the headed runtime verification in Phase 5.
- `prep` — the Linear-first bootstrap on the authoring side; this skill is its review-side counterpart.
