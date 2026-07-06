# Report template

Two shapes: (1) the body of each **inline comment** anchored to a line, and (2) the **summary body** posted at the top of the review. Write all of them to `/tmp/pr-<N>-bodies.txt` (summary first, then one inline body per finding, split by `===SPLIT===`) after Phase 6 (consolidation), run through `/humanizer` (Phase 7), then post as one review via `gh api … /reviews` (Phase 8, only on explicit approval).

---

## Inline comment body (one per finding, anchored to its line)

Lead with the severity label so it survives without the bucket header. No `file:line` inside the body — the comment is already on the line. Keep it to the issue, why it matters, and the concrete fix.

```markdown
**High:** [what's wrong in one clause]. [Why it matters / the before-vs-after.] [Concrete fix, with a short snippet only if the fix isn't obvious from prose.]
```

When two findings land on the same line, stack them in one comment:

```markdown
**High:** [primary issue + fix].

**Low (same element):** [secondary note + fix].
```

## Summary body (top of the review)

```markdown
## Review: [PR title / feature]

[One-sentence overall read, e.g. "Solid PR. Core fix is correct and the JSON-LD is XSS-safe via `safeJsonLdStringify`."] No ship blockers. Inline notes are on the specific lines; summary here.

**Ticket coverage (SB-424)** [omit this whole section when no ticket is linked]
- ✅ [requirement] — `apps/web/src/file.ts:42`[, verified in browser]
- ⚠️ [requirement] — partial: [what's missing]
- ❌ [requirement] — not addressed in this diff
- ➕ Out of scope: [diff changes with no basis in the ticket, raised as a question]

**Runtime check:** [criteria walked with headed agent-browser + pass/fail, or one line on why verification wasn't possible (docs-only / no dev script / missing env)]

**High**
- [One line each. End with "See inline." for items that also have a line comment.]

**Medium**
- [One line each.]
- [Items NOT in the diff (e.g. a referenced-but-unchanged file) live ONLY here — they can't be anchored.]

**Low:** [comma-separated nits]. [Any context note, e.g. a deprecation caveat.]

**Verified and dismissed:** [false positives an agent raised that you checked and rejected, so they don't resurface in re-review.]

**Already correct:** [3–6 positives surfaced by the agents.]

**Fix order:** blockers + highs in this PR; mediums as a follow-up commit; lows as a follow-up ticket.
```

---

## Numbering rules

- Inline comments aren't numbered — each lives on its own line. If the summary's "Fix order" needs to reference items, name them (e.g. "the focus-ring and single-open items first"), don't rely on numbers.
- Low items stay as a comma-separated list in the summary.

## File:line citation rules

- Inline comment bodies omit `file:line` — the comment is already on the line. Cite a path only when pointing at a DIFFERENT file (e.g. "the Radix trigger it replaces, `components/ui/accordion.tsx:38`").
- In the summary body, backtick paths: `apps/web/src/components/foo.tsx:42`. Multi-line range `foo.ts:42-58`. Whole-file finding: omit `:line`.

## Code snippet rules

- Include a code snippet ONLY when (a) the offending line is short (one expression) AND (b) the fix is non-obvious without seeing the current code.
- For longer snippets, link via file:line and describe the fix in prose.
- Always use proper fenced code blocks with language tag (` ```ts ` not ` ``` `).

## What goes where

| Bucket | Examples |
|---|---|
| **Ship blocker** | Migration will fail at runtime; deactivated users receive emails; data correctness bug (`timestamp` vs `timestamptz`); slug fallback writes `drafts.<id>` to DB; auto-commit triggered without approval |
| **High** | User-visible UX flicker; wrong query invalidation scope; missing index that's a future scan; missing `.limit()`; `console.*` instead of structured logger; missing rate limit on mutation route |
| **Medium** | Linear scan vs Map cache shape; manual `useMemo` under React Compiler; copy-paste mutation hooks; missing `React.cache()` dedup; non-`.strict()` Zod schemas; path-param not UUID-validated; optimistic-id race not guarded; non-atomic engagement insert |
| **Low** | Arbitrary Tailwind value; missing aria-live; missing focus-visible ring parity; ternary chain that should be a helper; native `uuid` vs `text` column type; fragile test mocks |

## "What's already correct" — when to include

Always include this section. Even a PR with 20 findings has 5+ things done right. Surfacing them:
- Prevents the review reading as a hit-piece.
- Confirms to the author that the reviewer actually understood the work, not just pattern-matched on negatives.
- Anchors the changes you DO want (the patterns to keep).

Source the positives from the agents' own reports — most will surface them at the bottom of their findings.

## Tone

- Senior engineer giving direct, technical feedback. Not chatbot-y. Not promotional. No fluff.
- "Add `eq(users.isActive, true)` to the `and(...)`." — yes.
- "It would be wonderful if you could consider adding..." — no.
- No "Great PR!" openers, no "Let me know if..." closers, no AI attribution.

## Post-humanizer audit

Before posting, scan the humanized draft for:

| AI tell | Replace with |
|---|---|
| Em dash for parenthetical (—) | comma, period, or parens |
| "comprehensive", "ensure", "robust", "leverage", "seamless" | the actual concrete word |
| Rule of three ("X, Y, and Z" filler) | one or two specifics |
| "It's not just X, it's Y" | "Y." |
| Curly quotes ("..." 'X') | straight quotes ("..." 'X') |
| Vague attributions ("Experts note...") | cite the agent or the file |
| "I hope this helps", "Let me know if you need..." | delete |

File:line refs, code snippets, severity labels, and tables stay as-is — those are reference material, not prose.
