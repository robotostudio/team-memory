# Stage 1. Plan

Read the repo and write `kb-setup.md` and `kb-query.groq`. This stage changes nothing in Sanity.

## Preconditions

`blocked.md` has the fix for each one that fails.

1. `sanity.config.ts` or `sanity.cli.ts` exists, in the root or under `apps/studio`.
2. `npx sanity context --help` lists the `context` commands.
3. `npx sanity projects list` prints the user's projects.
4. No `kb-setup.md` exists. If one does, read it and continue from the state it records.

## Steps

1. **Gather inputs by reading them.**
   - Project id and dataset, from `sanity.cli.ts`, `sanity.config.ts` or the env example file.
   - Organisation id, from `npx sanity projects list` or the dashboard URL `sanity.io/@<org-id>/...`.
   - The schema. Prefer `schema.json` from `npx sanity schema extract`, otherwise the schema type files.
   - Published document counts per type, with `npx sanity documents query "{'n': count(*[_type == '<type>'])}"`. `cli.md` explains the quoting.
   - Front-end routes, which show the types that render as pages.
   - Repo files that state facts, such as terms, policies, pricing, care guides and specs. These become file sources.
   - The public site URL, if the site is deployed and open.

   Done when every input has a value, or "not found" plus where you looked.
2. **Verify the counts.** Each `0` is a suspect zero until the checks in `blocked.md` pass. If a real project's dataset is empty, stop and tell the user the content has to come from them.
3. **Give every document type one role** and decide what to include, using `type-roles-and-queries.md`.
4. **Write one GROQ query** with a projection per included type. Keep every field that states a fact, booleans and numbers included. A `turbo-start-sanity` repo has `apps/studio`, `packages/sanity-blocks`, or a `pageBuilder` with `hero`, `cta` and `faqAccordion` blocks. For those, start from `turbo-start-sanity.md`. Done when the query runs and matches the documents you mean to include.
5. **Write the purpose** in three lines that say who asks, what leads, and what is left out. Two audiences means two Knowledge Bases. "Leave out" makes the build drop that material, so list only what should never be indexed. Content you include so its claims get checked stays off that line. In testing, "Leave out: homepage promotions" stopped the build from checking a wrong promo claim.
6. **Predict the outline**, marking each topic core or peripheral. If the sources can only produce one or two topics, say so.
7. **List every disagreement you saw** while reading, in section 10 of the sheet, with both claims and where each lives. Stage 3 checks each one against the entries.
8. **Write `kb-setup.md`** from `assets/kb-setup-template.md`. Save the query alone to `kb-query.groq` with single-quoted strings. Where you couldn't find something, write "not found" and where you looked.
9. **Show the plan** in a few lines. Give the title, purpose, included types, document count, files, and the decisions a person should make.

Stop here. The state is Planned. Stage 2 starts when the user says to create the Knowledge Base.
