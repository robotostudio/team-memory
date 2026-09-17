# Stage 4. Resolve

Resolving creates a standing instruction, the same as the dashboard's Resolve button. The instruction overrides the sources from then on, so resolve only what the user picked.

The CLI has no command for this. Write a throwaway script from the calls in `api.md`, run it from the project folder, and delete it.

## Steps

1. **Split the picks.** Picks on raised conflicts get resolved here. Picks on silent settlements have no issue, so they go straight to stage 5.
2. **Map each raised pick.** **A** is `keep_existing`, so the current claim wins. **B** is `accept_new`, so the other source's claim wins.
3. **Read each issue back and print the claim that will win** before the call. It must match the user's pick. Issue ids and their order change between builds, so list the issues fresh and never resolve by list position from an earlier run.
4. **Resolve**, then read the issue again. Done when its `status` is `accepted`.
5. **Dismiss** the stale issues and obsolete suggestions the user agreed to close.
6. **Show a table** of fact, winner, and keep or accept.
7. **Go to stage 5.** Until the content is fixed, the website still shows the losing claims.

If the user would rather click, the dashboard does the same under **Issues**. They pick the claim and press **Resolve**. Continue at stage 5.

## Special cases

| Case | Do |
|---|---|
| Neither claim is right | Leave the issue open. Correct the documents in stage 5 and rebuild. An instruction in the user's own words is written in the dashboard under Instructions |
| A wrong pick | `issues.reopen` clears the resolution and deletes its instruction |
| A suggestion or a gap | Only `conflict` issues resolve. `update_required` and `gap` issues get applied in the dashboard or dismissed |
| Two open issues state the same fact | Resolve the one with the later `_createdAt`. Tell the user about the other and dismiss it once they agree. Resolving both creates duplicate instructions |
| A rebuild raises a conflict the user already resolved | The source still holds the losing claim, or the rebuild ran without a refresh. Don't resolve it a second time, because that adds a duplicate instruction. Go to stage 5 |
