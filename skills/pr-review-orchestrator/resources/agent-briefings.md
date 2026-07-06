# Agent briefing templates

Each template below is the **full prompt** to pass as the `prompt:` argument to the `Agent` tool. Substitute placeholders before dispatching:

- `{{PR_NUMBER}}` — the GitHub PR number (e.g. `105`)
- `{{REPO}}` — `owner/repo` (e.g. `robotostudio/slingshot-bio`)
- `{{DIFF_PATH}}` — path to the saved diff (e.g. `/tmp/pr-105.diff`)
- `{{REPO_ROOT}}` — local repo path (e.g. `~/work/slingshot-bio`)
- `{{PROJECT_CONVENTIONS}}` — a bulleted block extracted from the project's CLAUDE.md. See "Standard project-conventions block" at the end of this file.
- `{{TICKET_CONTEXT}}` — the Linear ticket digest built in Phase 2 (ID + title + numbered requirements + "Full ticket: Read /tmp/pr-<N>-ticket.md"). When no ticket: `No linked ticket — review the diff on its own merits.` See "Standard ticket-context block" at the end of this file.

All five templates use the **same severity rubric and report format**, defined once at the bottom.

---

## 1. voltagent-qa-sec:code-reviewer (always dispatch)

**Description:** Primary code review
**Subagent type:** `voltagent-qa-sec:code-reviewer`
**run_in_background:** true

```
Review PR #{{PR_NUMBER}} in {{REPO}}.

**How to fetch the diff:**
```bash
gh pr view {{PR_NUMBER}} --repo {{REPO}} --json files
gh pr diff {{PR_NUMBER}} --repo {{REPO}}
```

Or read it from `{{DIFF_PATH}}` (already saved).

The repo is at `{{REPO_ROOT}}` (currently on `main`). You can also check the codebase locally to compare against existing patterns.

**Project conventions you MUST verify against:**

{{PROJECT_CONVENTIONS}}

**Linked ticket (the intent this PR must satisfy):**

{{TICKET_CONTEXT}}

Flag any ticket requirement your dimension shows unmet, and any diff change with no basis in the ticket.

**Focus areas:**
- Do new API routes follow the project's auth + response-helper + observability pattern?
- Do new client hooks follow the existing TanStack Query / SWR / data-fetching pattern?
- Is variable declaration discipline maintained (no `let` if the project forbids it)?
- Are Zod schemas, response shapes, and error handling consistent with sibling files?
- Test coverage — for each new route/hook, is there a corresponding test file? Auth/validation/idempotency paths covered?

**Report format:**
{{REPORT_FORMAT}}

**Word cap:** 600. Apply confidence filtering: only report what you're confident about. Skip stylistic nits.
```

---

## 2. voltagent-qa-sec:security-auditor (always dispatch)

**Description:** Security audit
**Subagent type:** `voltagent-qa-sec:security-auditor`
**run_in_background:** true

**IMPORTANT:** This agent does NOT have Bash. The prompt MUST point it at `{{DIFF_PATH}}` directly. Do NOT ask it to run `gh` commands.

```
Conduct a security audit of PR #{{PR_NUMBER}} in {{REPO}}.

**THE FULL DIFF IS SAVED AT: `{{DIFF_PATH}}`**. Read it directly with the Read tool. You don't need git or gh — the diff has all the new/modified file contents.

Repo path for reference patterns: `{{REPO_ROOT}}`.

**Audit specifically for:**

1. **AuthZ (IDOR — CWE-639):** For every DELETE/PATCH-by-id route, verify the query includes BOTH `eq(table.id, id)` AND `eq(table.userId, auth.user.id)`. Otherwise any logged-in user can mutate other users' rows.

2. **Input validation / mass-assignment (CWE-915):** Zod schemas — do they `.strict()` or `.passthrough()`? If passthrough, can a request body field override the session user (e.g. `userId`)? Are path params format-validated (UUID/cuid)?

3. **Recipient / notification leaks:** Any query that fans out emails/notifications must filter deactivated users (`isActive`), soft-deleted users (`deletedAt IS NULL`), and unverified emails (`emailVerified=true`). Missing any of these is a privacy regression.

4. **Rate limiting (CWE-770):** Mutation routes without rate limits allow audit-log spam and resource exhaustion.

5. **Webhook auth:** HMAC/signature verification not regressed.

6. **Migration safety:** `ALTER TYPE ADD VALUE` inside transactions (PG <16 limitation), missing `CONCURRENTLY` on large-table index creation, FK cascade behaviour.

7. **CSRF:** Cookie-based session mutations — does the route require a Content-Type or custom header that browsers won't send cross-origin? Is SameSite=Lax or Strict?

8. **Audit log payload:** Are engagement/audit events sanitized? Could PII land in the log?

9. **External ID handling:** Sanity `drafts.<id>` prefix, draft state, etc.

**Project conventions for context:**

{{PROJECT_CONVENTIONS}}

**Linked ticket (the intent this PR must satisfy):**

{{TICKET_CONTEXT}}

Flag any ticket requirement your dimension shows unmet, and any diff change with no basis in the ticket.

**Report format:**
{{REPORT_FORMAT}}

Include CWE id where applicable. Only report findings specific to this diff. Skip generic OWASP advice.

**Word cap:** 500.
```

---

## 3. database-reviewer (dispatch if diff touches `packages/db/**`, `**/migrations/**`, or `*.sql`)

**Description:** Drizzle schema + migration review
**Subagent type:** `database-reviewer`
**run_in_background:** true

```
Review the database changes in PR #{{PR_NUMBER}} of {{REPO}}.

**Fetch the diff:**
```bash
gh pr diff {{PR_NUMBER}} --repo {{REPO}} -- 'packages/db/**' 'apps/web/src/lib/**'
```

Or read `{{DIFF_PATH}}` and filter mentally.

Repo path: `{{REPO_ROOT}}`.

**Stack context:**
- Postgres on Neon (serverless, neon-http driver at runtime; node-postgres in migrate script)
- Drizzle ORM
- The neon-http driver does NOT support `db.transaction()` — sequenced writes are used instead
- All existing timestamp columns use `timestamptz`, not `timestamp` (no timezone)

**Review checklist:**

1. **Migration file:**
   - `ALTER TYPE ... ADD VALUE` inside a transaction will fail on PG <16. Drizzle wraps each migration in a transaction by default. Flag if present.
   - Are CREATE TABLE statements idempotent (`IF NOT EXISTS`)?
   - Composite UNIQUE on `(user_id, entity_id)` for follow-style tables?
   - Index on the lookup column (e.g. `flashpoint_id` for fan-out queries)?
   - FK `ON DELETE` actions — does deleting a user cascade-delete dependent rows safely?
   - Are large-table index creations using `CONCURRENTLY` for zero-downtime?

2. **Schema:**
   - Every timestamp column must be `timestamptz`. `timestamp` without timezone is a data correctness bug.
   - Primary keys: `uuid` native type vs `text` storing UUIDs — 16 bytes vs 37 bytes matters at index scale.
   - Audit fields: `created_at`, `updated_at`, `created_by`?
   - Default values server-side via `defaultNow()`, not application-set?

3. **Query review:**
   - JOIN columns must be indexed.
   - `.limit()` on user-driven queries to prevent unbounded result sets (e.g. 500+ followed flashpoints exploding GROQ `in`-clauses).
   - `onConflictDoNothing().returning()` is non-atomic on neon-http — verify follow-up SELECT handles race conditions.

4. **Migration runner safety:**
   - If the PR switched drivers (e.g. `neon-http` ↔ `node-postgres`), verify the runtime client.ts hasn't accidentally switched too.
   - Verify structured logger (`@workspace/logger`) is still in use, not raw `console.*`.

**Project conventions:**

{{PROJECT_CONVENTIONS}}

**Linked ticket (the intent this PR must satisfy):**

{{TICKET_CONTEXT}}

Flag any ticket requirement your dimension shows unmet, and any diff change with no basis in the ticket.

**Report format:**
{{REPORT_FORMAT}}

**Word cap:** 400.
```

---

## 4. voltagent-lang:react-specialist (dispatch if diff touches `apps/web/src/components/**` or `apps/web/src/hooks/**`)

**Description:** React + hooks + optimistic updates review
**Subagent type:** `voltagent-lang:react-specialist`
**run_in_background:** true

```
Review the React/hooks/UI patterns in PR #{{PR_NUMBER}} of {{REPO}}.

**Fetch the diff:**
```bash
gh pr diff {{PR_NUMBER}} --repo {{REPO}} -- 'apps/web/src/components/**' 'apps/web/src/hooks/**' 'apps/web/src/app/**'
```

Or read `{{DIFF_PATH}}`.

Repo: `{{REPO_ROOT}}`.

**Stack:**
- Next.js 16 App Router, React 19, React Compiler is **on**
- TanStack Query v5 for client state
- All client state hooks live under `apps/web/src/hooks/queries/`. Keys come from `queryKeys` factory in `hooks/queries/keys.ts` (hierarchical)
- Optimistic mutation pattern (reference: `use-conversations.ts`, `use-auth-mutations.ts`): `cancelQueries` → snapshot in `onMutate` → rollback in `onError` → invalidate in `onSettled`

**Project conventions:**

{{PROJECT_CONVENTIONS}}

**Linked ticket (the intent this PR must satisfy):**

{{TICKET_CONTEXT}}

Flag any ticket requirement your dimension shows unmet, and any diff change with no basis in the ticket.

**What to assess:**

1. **Optimistic update correctness:**
   - `cancelQueries` called before snapshot? Without it, in-flight refetch clobbers the optimistic state.
   - `onError` correctly restores from the snapshot in context?
   - `onSettled` invalidates at the right granularity (not too broad, not too narrow)?
   - State hooks (e.g. `useFollowState(id)`) — do they derive from one shared cache entry, or trigger N queries for N list items?

2. **React Compiler compat:**
   - Manual `useMemo` / `useCallback` is **dead weight** under React Compiler — it's redundant and can actively interfere. Flag any new instances.

3. **Cache shape:**
   - Linear `Array.find()` per render across N items × M rows = O(N*M). Suggest deriving a `Map` once in the queryFn for O(1) lookups.

4. **Component design:**
   - Discriminated `target` / `variant` props well-typed?
   - Three-state visuals (neutral / active-rest / active-hover-destructive) implemented via CSS pseudo-classes (free) or JS state (re-renders)?
   - Hover affordance — does it work on touch devices (`@media (hover: none)`)?
   - Accessibility: `aria-pressed` for toggles? Focus ring (`focus-visible:ring-2`) on all variants? `aria-live` announcement on state change?

5. **Server vs. client boundary:**
   - Are client components marked `"use client"` only where needed?
   - Could initial state be hydrated from RSC instead of fetched client-side?

6. **Convention violations (grep the diff):**
   - `\blet\b` — forbidden per project rules.
   - `\[\d+px\]` or similar — arbitrary Tailwind values forbidden.
   - Raw `console.*` — use `@workspace/logger`.

**Report format:**
{{REPORT_FORMAT}}

Skip nits; focus on correctness, perf, conventions. **Word cap:** 500.
```

---

## 5. voltagent-lang:nextjs-developer (dispatch if diff touches `apps/web/src/app/**`)

**Description:** RSC vs client boundary + code reducibility audit
**Subagent type:** `voltagent-lang:nextjs-developer`
**run_in_background:** true

```
Audit PR #{{PR_NUMBER}} in {{REPO}} for **architecture quality**, **code reducibility**, and **RSC-vs-client boundary**.

**The full diff is at `{{DIFF_PATH}}`.** Read it with the Read tool. Repo: `{{REPO_ROOT}}`.

**Stack:**
- Next.js 16 App Router, React 19, React Compiler on
- TanStack Query v5
- Drizzle ORM, BetterAuth (`getServerSession` available in RSC / Server Actions)
- Server Components / Server Actions are the **default**; TanStack Query is the exception, only when client state truly needs caching/refetch/optimistic/mutation

**Project conventions:**

{{PROJECT_CONVENTIONS}}

**Linked ticket (the intent this PR must satisfy):**

{{TICKET_CONTEXT}}

Flag any ticket requirement your dimension shows unmet, and any diff change with no basis in the ticket.

**Questions you must answer for each finding:**

1. **Is each client-side fetch justified, or could it be RSC-served?**
   - If a list page is already a Server Component fetching primary data, could user-specific overlay data (favorites, follows, settings) be resolved server-side once and passed down to hydrate the TanStack Query cache?
   - This eliminates "Follow → flicker → Following" UX and removes one waterfall HTTP request per page load.
   - Pattern: TanStack Query supports `dehydrate` / `HydrationBoundary` with prefetched RSC data.

2. **Is the cache shape efficient?**
   - Linear `.find()` per button render across N items × M cache entries = O(N*M). Suggest `Map` or `Set` derived in queryFn or selector.

3. **Is anything over-engineered?**
   - Mutation hooks that are structurally identical copy-paste (e.g. `useFollowFlashpoint` / `useFollowTheme`) are candidates for a generic factory.
   - But: project rule says "don't extract trivial code". Flag only genuine duplication (10+ lines of cohesive logic, own error handling, own I/O).

4. **Server lib functions:**
   - Are they wrapped in `React.cache()` for request-scoped dedup? Two-line fix that prevents silent duplicate queries in future composition.

5. **Component reducibility:**
   - Could a variant prop branch collapse to a prop instead of a separate JSX branch?
   - Are 211-line components justified, or split-candidates?

6. **General reducibility:**
   - Unused imports.
   - Dead branches.
   - Redundant `useMemo`/`useCallback` (React Compiler is on — these are now usually harmful).
   - Defensive checks for impossible states (narrow the type at the boundary instead).

**Report format:**
{{REPORT_FORMAT}}

For each finding include:
- **Category** (RSC-boundary / reducibility / over-engineering / waterfall / cache-shape)
- **Current behavior + cost** (e.g. "fetches 100 rows on every page load = ~200ms TTFB extra HTTP round trip")
- **Proposed change** (concrete)
- **Why it matters** (UX / perf / maintenance / convention)

**Word cap:** 600. Skip stylistic nits.
```

---

## {{REPORT_FORMAT}} (substituted into every template)

```
For each finding:
- **Severity:** one of [SHIP BLOCKER / HIGH / MEDIUM / LOW]
- **File:line** (e.g. `apps/web/src/components/foo.tsx:42`)
- **Issue** (2–4 sentences: what's wrong and why)
- **Fix** (concrete: exact code change or 1-line description)

Group findings by severity. Add a brief "What's already correct" section at the end with passes you noticed.
```

---

## Severity rubric (use consistently across all agents)

- **SHIP BLOCKER** — Will fail at runtime, leak data, break prod, or violate the most important global rules (no auto-commit, no AI attribution, privacy regression).
- **HIGH** — Strongly recommend fixing before merge. User-visible bugs, security holes that need work to exploit but are real, performance regressions, project-convention violations that will compound.
- **MEDIUM** — Fix in this PR or follow-up commit on same branch. Reducibility wins, missing safety nets, defensive guards that should exist but don't.
- **LOW** — Follow-up ticket. Style nits, micro-perf, ergonomic improvements.

---

## Standard project-conventions block

When building `{{PROJECT_CONVENTIONS}}`, extract the relevant subset of these from the project CLAUDE.md. Below is a template from a Next.js + Drizzle + BetterAuth monorepo — adapt per project:

```
1. **API route shape**: Every authenticated route wraps the handler in `withApiObservability("route-name", handler)`. Inside, call `requireSession()` (returns discriminated union `{ ok: true, user } | { ok: false, reason }`), then `if (!auth.ok) return requireSessionResponse(auth)`. NEVER use raw `NextResponse.json({...}, { status })` for known error shapes — must use helpers from `@/lib/api/responses` (`unauthorized()`, `notFound()`, `badRequest(reason)`, `serverError(reason?)`). Wire shape is `{ ok: false, reason: string }`.

2. **Validation**: Zod `safeParse`, then map failures through `badRequest(...)`. Validation returns data; response mapping is a separate layer.

3. **TanStack Query**: Reach through `apps/web/src/hooks/queries/` only. Keys come from `queryKeys` factory in `keys.ts` (hierarchical). Mutations invalidate, never manually refetch. Optimistic updates: `onMutate` snapshot → `onError` rollback → `onSettled` invalidate. Never raw `fetch + useState + useEffect`. Never `swr`.

4. **Variable declarations**: NEVER use `let`. Default to `const` everywhere. Restructure with early returns, ternary, `?? / ||`, helpers, or array methods.

5. **Tailwind**: Always canonical classes. Never arbitrary values like `h-[87px]` — always `h-20` (etc.).

6. **Error handling**: Functions return typed discriminated unions, never throw for expected errors. Logger from `@workspace/logger`, never raw `console.*`.

7. **Auth helpers**: `requireSession()` discriminates `"unauthorized"` (401) vs `"error"` (500). Don't collapse them.

8. **Server Components are the default.** TanStack Query is the exception, only when client state needs caching/refetch/optimistic/mutation.
```

For projects with different conventions, replace this block accordingly. The bullets are what every agent will enforce in its review.

---

## Standard ticket-context block

Shape for `{{TICKET_CONTEXT}}` (built in Phase 2 of the skill):

```
SB-424 — Taxonomy and Resource Cleanup (In Review, High priority)
https://linear.app/<team>/issue/SB-424

Requirements this PR must satisfy:
1. Remove topics + primaryPurpose taxonomies from studio, queries, and web
2. Add applications + industries filters to /resources
3. Migrate existing appliesTo references purpose → application
4. [from comment, @pm, May 12] keep legacy URLs 301-redirecting

Full ticket (description, comments, links): Read /tmp/pr-299-ticket.md
```

Keep the digest under ~15 lines — agents Read the `/tmp` file when they need the full text. When no ticket exists, substitute exactly `No linked ticket — review the diff on its own merits.` and drop the flag-requirements line from the briefing.
