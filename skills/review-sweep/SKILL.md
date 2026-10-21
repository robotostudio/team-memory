---
name: review-sweep
description: Adversarially review what this session built and file the surviving findings as a review pile.
user-invocable: true
disable-model-invocation: true
---

# Review sweep

`/review-sweep [base-ref]`

Review the work this session built, **refute** every finding, and file what survives as a
**pile**: a parent issue plus one sub-issue per defect, shaped so
[`/review-crunch`](../review-crunch/SKILL.md) can run the fix loop against it.

Run this in the session that wrote the code, while its context is **hot**. A finding
written from a cold read cites lines that have already moved — the crunch's triage phase
exists to pay that debt, and every batch of the #64 pile still found drift
(`:575`→`:589`, `:629`→`:642`, `:141-154`→`:159-172`) filed by a session that had the
code in front of it.

You are the **filer**. Fixing is the crunch's job, with one exception in Step 6 — a
clean-context adjudicator catches what an author rationalises, and both piles bear that
out: across ten disagreements the refuting side was right every time, and the tenth was
against a design the adjudicator had posted to the ticket as binding. Authorship is what
predicts the error, not seniority, which is why Step 6 spawns a skeptic on your own fix.

## Step 1 — Fix the scope

Establish the base ref: the argument if given, otherwise the merge-base with the branch
this work stacks onto. Then enumerate the diff — `git diff --stat <base>...HEAD` — and
group the changed files by subsystem.

Land any uncommitted work first. A diff that moves while the sweep runs produces
findings against code that no longer exists.

**Done when:** you can name the base SHA, every changed file, and which subsystems the
change touches; `git status` shows no tracked changes.

## Step 2 — Choose the dimensions

Reviewers fan out by **dimension** — one agent per way *this* diff can fail, not one per
file. A file-per-agent split finds typos; a dimension finds the bug that spans three
files.

Derive them from the diff. These recur, and each has earned its place by finding
something no other lens did:

- **concurrency and lifecycle** — state read across an await, a flag with no session
  identity, teardown racing a callback
- **wire and protocol correctness** — both directions, including the half nobody
  exercises yet
- **error and shutdown paths** — what happens when the answer never comes
- **cross-platform regression** — the other shell still ships on this code
- **test honesty** — a guard whose deletion leaves the suite green
- **resource ownership** — handles, locks, subprocesses, and who closes them

**Done when:** every changed subsystem falls under at least two dimensions, and each
dimension names a failure mode this diff could plausibly have.

## Step 3 — Run the sweep

One workflow: finders fan out by dimension, and each finding is **refuted** by two
skeptics as soon as its dimension returns.

```js
const results = await pipeline(
  DIMENSIONS,
  d => agent(findPrompt(d), { label: `find:${d.key}`, phase: 'Find', schema: FINDINGS, model: 'opus' }),
  found => parallel((found?.findings ?? []).map(f => () =>
    parallel([1, 2].map(i => () =>
      agent(refutePrompt(f, i), { label: `refute:${f.key}:${i}`, phase: 'Refute', schema: VERDICT, model: 'opus' })))
      .then(async vs => {
        // Retry the seats that came back empty — an agent death or a
        // schema-invalid answer is a missing verdict, not a vote.
        const retried = await parallel(vs.map((v, i) => () =>
          v ? Promise.resolve(v)
            : agent(refutePrompt(f, i + 1), { label: `refute:${f.key}:${i + 1}:retry`, phase: 'Refute', schema: VERDICT, model: 'opus' })))
        const live = retried.filter(Boolean)
        return {
          ...f,
          // A finding survives only when BOTH seats answered and neither refuted.
          // `[].every(…)` is `true`, so filtering first would let a finding both
          // skeptics failed to answer sail through as unrefuted.
          survives: live.length === 2 && live.every(v => !v.refuted),
          unjudged: 2 - live.length,
        }
      }))),
)
```

A finding with `unjudged > 0` is **neither survived nor refuted** — nobody looked at it.
Set those aside and judge them yourself; count them separately in the parent, because
folding them into either number overstates the rigour of the funnel it publishes.

**Finders** cite `file:line` and quote the code. A finding states a defect and the
concrete input that triggers it; "this looks fragile" is not a finding.

**Skeptics** open with the code, never the finder's summary, and hold that the finding is
wrong until the code says otherwise. Each reports `refuted` plus its reasoning. **Either
skeptic refuting kills the finding** — a false ticket costs the crunch a whole cluster,
and the killed ones still get counted in the parent, so nothing is silently lost.

Both roles are **read-only in the working tree**, and this is enforced rather than
requested. Interpolate the `READ_ONLY` block verbatim from
[`../review-crunch/engine/review-fix-loop.js`](../review-crunch/engine/review-fix-loop.js)
into every finder and skeptic prompt, alongside the guardrails at the foot of this file.

Prose alone does not hold: four of eight reviewers wrote to the tree in the #64 crunch —
one edited a production file in a cluster it did not own, another left a scratch test the
runner collected and counted as passing — and one of them did so in a later batch *after*
being told a fingerprint would catch it.

So fingerprint the tree around the fan-out, the way the crunch does. Take
`git status --porcelain` plus a sha256 of every file under the reviewed subsystems before
the workflow starts and again after it returns, expanding any directory with
`find -type f` rather than skipping it — a scratch test dropped into a test directory is
the likeliest violation, and skipping directories once made that check blind to its own
headline case. If the fingerprint moved, an agent wrote to the tree: the findings judged
a different diff than you reviewed, so re-run rather than file.

`opus` for finders and skeptics. `sonnet` only for mechanical stages.

**Done when:** the workflow returns; you have the surviving findings, the refuted count,
the unjudged count, and each survivor's reproduction; the post-run fingerprint matches
the pre-run one; and `git status --porcelain` shows nothing an agent left behind.

## Step 4 — Merge and classify

Expect heavy duplication — the #42 pile ran 61 raw findings through refutation, 10 were
refuted, and the surviving 51 merged to 23 distinct defects: 16 of those 51 described one
`terminationHandler` bug from different angles. Merge by
**defect**, not by wording: two findings are one when the same edit fixes both.

Then give each survivor:

- a **class** — `data-safety`, `test-honesty`, `correctness`, `robustness`, or `cleanup`
- a **cluster** — the file whose owner will fix it, named in kebab-case
  (`core-dictation-machine`). The cluster is the contract with `/review-crunch`: it
  derives one fix-loop agent per cluster, so two findings that need one coherent edit
  must share a cluster, and a cluster must never span two files that could be edited
  independently.
- a **severity** — `HIGH` when a user loses data or the app wedges, `MEDIUM` for a defect
  with a bounded blast radius, `LOW` for the rest

You do this alone, and it is the step where a self-review quietly disposes of its own
worst news: a `HIGH` reclassified to `cleanup` gets scheduled last or never, because the
crunch orders batches by class. So record the disposition of **every** raw survivor in
the parent — filed as #N, or merged into #N — and leave the reclassification visible
rather than only its result.

**Done when:** no two findings describe the same defect; every finding carries exactly
one class, one cluster, and one severity; and every raw survivor appears in the parent's
disposition list.

## Step 5 — File the pile

**The parent issue** records the sweep itself: what was reviewed and against which base,
the funnel (raw → refuted → distinct), and the sub-issues. Then the section that matters
most — **what the sweep did not cover**. Areas nobody looked at, and areas a reading
agent structurally cannot judge: the app never launched, performance never measured,
hardware paths never exercised. Write each as the next action it implies. This section
is the honest half of the artifact; without it the count of findings reads as a clean
bill of health.

**Each sub-issue** carries this anatomy. Nothing parses it — the crunch hands the issue
body to an agent and transcribes clusters by hand — so a deviation fails silently rather
than loudly, which is the reason to keep the shape exact:

```markdown
**MEDIUM** — `packages/core/src/dictation/machine.ts:629`

Class: `test-honesty` · Cluster: `core-dictation-machine`

## What is wrong
[the quoted code, then what is wrong with it]

## Failure scenario
[concrete inputs or interleaving → the wrong outcome, as reproduced]

## Why it matters
[the user-visible consequence, or why the gap is load-bearing]

## Suggested fix
[the shape of the fix — the crunch weighs this, it does not obey it]
```

Title it after the defect and its consequence, so the list reads as a set of problems.
File each as a sub-issue of the parent with the `code-review` label.

**Done when:** the parent exists with its did-not-cover section, every distinct finding
is a sub-issue carrying `Class:` and `Cluster:`, and every cluster named appears in at
least one ticket.

## Step 6 — Fix data-safety, hot

Fix only the `data-safety` class here: anything that can lose user data, corrupt a
persisted file, or block the next session's work. Everything else waits for the crunch.

This step hands the highest-severity class back to the author of the code, which is the
one thing this skill's own premise says to distrust. So it borrows the crunch's guards
rather than running bare — every one of them earned its place on this class of work:

- **Back up first** if the fix touches config, history, or user-data paths —
  `scripts/backup-macos-userdata.sh`.
- **Commit to the branch this work is on**, not to the base branch.
- **Explicit pathspecs, never `git commit -a`** — it sweeps files you did not mean to
  ship.
- **Mutate the fix**: revert exactly the behavioural change, run the suite, confirm
  something fails. A change nothing pins is either a missing test or a limit no test
  bundle can reach — add the test, or state the limit in both the commit and the ticket.
- **Run the full bar** before the commit: `pnpm fmt:check && pnpm lint && pnpm typecheck
  && pnpm test`. Never `bun test`.
- **Spawn one skeptic on the fix itself**, with the same refute framing as Step 3. You
  wrote the code and you wrote the fix; the whole reason this pile exists is that an
  author rationalises.

Per fix, in one turn: commit, comment the SHA and the evidence on its ticket, close it.
The same turn — a hot fix landed without its ticket is how six of the first pile's
findings reached the crunch already fixed, and the crunch paid a triage phase to discover
it.

**Done when:** no `data-safety` ticket is open, each closed one names the commit that
fixed it and its mutation verdict, and the bar passed on the tree you are handing over.

## Step 7 — Hand off

Comment on the parent with the pile in `docs/GIT_CONVENTIONS.md` issue-reference format,
noting which are already closed. State the base SHA the findings were written against, so
the crunch's triage knows what drift to expect.

**Done when:** the parent lists every sub-issue with its state, and the remaining pile is
ready for `/review-crunch <parent#>`.

---

## Guardrails for every agent the sweep spawns

- Read-only in the working tree; reproduce in a `git worktree` scratch copy and remove it.
- Local evidence only — pushing, filing, and closing are the session owner's.
- `SOTTO_USER_DATA_DIR` to a fresh temp dir for anything touching core.
- Native modules stay as they are; an exit 137 or `NODE_MODULE_VERSION` error is a report,
  not a repair job.
- `pnpm test` for the suite, never `bun test`.
- Self-terminating foreground load for CPU contention (`timeout 30 yes >/dev/null`).
- Quote code with `file:line`.
- GitHub bodies are one paragraph per line, never hard-wrapped.
