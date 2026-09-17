# Stage 2. Create

This stage adds a Knowledge Base to a real organisation. Plans cap how many an organisation can hold. The commands are in `cli.md`.

Show the user the organisation, the title and the sources, and wait for a clear yes before the first command.

## Steps

1. **List the organisation's Knowledge Bases.** This proves the login works. Reuse one only when its audience, purpose and sources match the plan, and follow "Resuming" below. A different audience or purpose justifies a new one over the same content. If the organisation is at its limit, open `blocked.md`. Never delete one to make room unless the user names it.
2. **Create it** with the title, and the purpose as its description. Write the returned id, which starts with `kb`, into `kb-setup.md`.
3. **Add the dataset source** from `kb-query.groq`, passed on one line as `cli.md` shows.
4. **Add each file source**, then the website source if there is one.
5. **Check the imports.** Done when every import is complete and the document count matches the plan.
6. **Build** with `npx sanity context build <kb-id> --watch`. A first build takes a few minutes.
7. **Tell the user the step the CLI can't do.** They create the MCP endpoint in the Context dashboard with this Knowledge Base as its only source. `connect-agents.md` has the steps, and it can wait until stage 6.

The state is now Built, which says nothing about whether the content is right. Go straight to stage 3.

Add no instructions by hand. An instruction overrides the sources, so one added now hides the conflicts the first build exists to find. Stage 4 creates them from the user's picks.

## Resuming an existing Knowledge Base

An existing import proves the content was imported once, not that it is current. Read the description and the imports, and compare them with `kb-setup.md` by project, dataset, query, website URLs and file versions.

- Add only the missing sources. Show any change to the purpose or the sources before you make it.
- Replace a changed file's import only after the user names that import for deletion.
- Refresh the dataset and website sources with `npx sanity context refresh <kb-id>`, then wait on the job with `npx sanity context jobs get <kb-id> <job-id> --watch`.
- Done when the imports and the refresh job succeeded and `pendingChanges` matches what changed. If content changed and it shows zeros, check publication and the query.

Then continue from step 5. Keep the existing instructions and record them in `kb-setup.md` when you review the result.
