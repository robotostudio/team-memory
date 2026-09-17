# Stage 3. Check

Run this after every build. It moves the Knowledge Base from Built to Reviewed. That takes three kinds of evidence, because each one misleads when read alone.

| Evidence | Tells you | Misses |
|---|---|---|
| The source claims, from section 10 of the sheet and your own reading | Disagreements in the material you inspected | Claims you didn't inspect, and which claim is correct |
| The entries the build wrote | Which claim the Knowledge Base kept | Whether anyone was told |
| The issues list | Which disagreements the build raised | Every silent settlement |

In testing, a build kept "we ship to the US" from an FAQ against a delivery policy that said UK and Ireland only, and listed a wrong £30 offer as a live promotion. It raised no issue for either. Only the entries showed it.

## Steps

1. **Read the state** with `npx sanity context get <kb-id> --json`. Note `state`, `openIssueCount`, `instructionCount`, `lastChangedAt` and `pendingChanges`.
2. **Read every entry.** `api.md` shows `entries.list()` and `entries.get({ path })`, which work before any MCP endpoint exists. If an endpoint is already connected to you, `initial_context` and `knowledge_base_read` return the same text.
3. **List the open issues** with `node <skill-folder>/scripts/kb-issues.mjs <kb-id> --status open --json`, run from the project folder. `openIssueCount` can be lower than the list, because it leaves out some suggestions.
4. **Build the comparison**, one row per disagreement from section 10 plus any you spot in the entries.

   | Fact | Source claims | The entry says | Issue raised? |
   |---|---|---|---|
   | Countries delivered to | Policy: UK and Ireland. FAQ: also the US | "UK, Ireland and the US" | No |

   A "No" in the last column is a silent settlement. Those matter most. If the entry kept the wrong claim, agents are giving wrong answers now.
5. **Check each open issue against the current documents.** A build leaves issues from earlier builds open, so an issue can quote text that has since changed. Mark those stale.
6. **Compare the outline with the plan's** and note missing topics. Note any claim in an entry that no source makes. In testing, a build added a Friday dispatch rule that appeared nowhere in the content.
7. **Append the table and the counts** to `kb-setup.md` under "Build results".
8. **Print the choices**, then stop and wait.

Done when every row of section 10 has an entry value and a yes or no for the issue.

## The choice format

Use plain text, never an interactive widget. Plain text works in every agent, and the user can answer in one line.

```
Raised by the build

1. Free UK delivery threshold
   A. Over £50   ← the delivery policy says this
   B. Over £75   (from the FAQ)

Settled silently by the build, no issue raised

2. Countries delivered to. The entry currently says "UK, Ireland and the US".
   A. UK and Ireland only   ← the delivery policy says this
   B. Also the US           (from the FAQ)

Reply with your picks, for example: 1A 2A. Skip any you're unsure of.
```

- For a raised conflict, **A** is the issue's `currentClaim`, which is what the Knowledge Base says now. **B** is its `alternativeClaim`.
- A silent settlement has no issue to resolve. Its pick decides which documents stage 5 corrects. Tell the user that.
- Mark the side the authoritative source supports, such as a policy, the legal terms or a spec sheet. Don't pick for the user.
- Shorten long claims to the fact that differs. Keep the numbers exact.
- Two issues can state the same fact, sometimes with the sides swapped. Say so, so the answers agree.
- List suggestions, gaps and stale issues last, under their own headings. Those get applied or dismissed, not resolved.

## After the choices

| The user | Do |
|---|---|
| Picks winners | Go to stage 4 |
| Wants the conflicts kept, for a demo or a test | Record that in `kb-setup.md`. The state is Reviewed. Go to stage 6 if they want an agent connected, and resolve or fix nothing |
| Has nothing to pick, because the build and your comparison both came back empty | Say both checks were empty. A build can still hide something neither caught |

Report every known disagreement before you move on, even when the issues list is empty.
