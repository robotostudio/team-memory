# Stage 5. Fix content, refresh, rebuild

The documents still hold the losing claims, so the website shows them and the next build raises them again. This stage corrects the documents and brings the Knowledge Base up to date.

You know this project's schema, so prepare small, specific edits for it.

## Steps

1. **Find where each losing claim lives**, using the schema and `npx sanity documents query`, not a blind text search.
   - Start from the documents the issue cites, then ask which other types could state the same fact. A return window can sit in a policy, an FAQ answer, a homepage banner and a product field at once.
   - Project Portable Text with `pt::text(body)`. Formatting can split "28 " and "days" into separate spans that a string match misses.
   - Check other wordings, such as "28-day", "twenty-eight" or "four weeks".
   - Check booleans and numbers that carry the same fact, such as `dishwasherSafe: true` beside "dishwasher safe" in a description.
   - Check the file sources, and search the site's code for hardcoded copies.

   Done when every location is listed. Say where you looked, because finding nothing doesn't prove the claim is gone.
2. **Read each document before you plan its edit.** Note its `_rev` and the field's current value. Check whether `drafts.<id>` exists, which means someone has unpublished edits.
3. **Show the change list and get a yes.** Use one row per field, with the document, the field, the old value and the new value. If a document has a draft, show the draft's current value separately from the published value. Keep each edit as small as the fact allows. Changing `28` to `14` is safe. Rewriting a paragraph needs the user to read it. Ask whether they want drafts to review in Studio, the default and the right choice for a live site, or a direct publish.
4. **Write guarded edits**, each tied to the revision you reviewed. In order of preference:
   - a Sanity MCP server or other write tool you already have, if it supports revision checks,
   - the example in `api.md`, run with `dryRun: true` first,
   - the user edits in Studio from your change list.

   Whichever path you use, open `api.md` first and follow its draft rules. In draft mode, edit only the draft. For a direct publish, a draft that holds the losing claim needs its own approved correction.
5. **Handle what isn't a dataset field.** For a file source, put the file's correction, the import to delete and the new upload in the change list. Once the user approves them and names that import, correct the file, delete the old import and add the new file. For a claim hardcoded in the site's code, report the file and line.
6. **Verify.** The Knowledge Base reads published documents only, so wait until the user has published any drafts. Done when a query of the changed fields returns the new values.
7. **Refresh, then rebuild**, in that order. A build reuses the content from the last import, so a rebuild straight after an edit still sees the old text.
   ```
   npx sanity context refresh <kb-id>
   npx sanity context jobs get <kb-id> <job-id> --watch
   npx sanity context get <kb-id> --json
   npx sanity context build <kb-id> --watch
   ```
   After the refresh, `pendingChanges.changed` counts the documents you edited. A `0` means the edits aren't published or the query doesn't match those documents.
8. **Run stage 3 again**, entries included. Confirm each corrected fact in its entry. Dismiss stale issues that quote the old text. Print any new conflict as a choice.
9. **Record it** under "Resolutions" in `kb-setup.md`, with the picks, the documents corrected and the final counts.

## Clean

`state` is `ready`, open conflicts are 0, `pendingChanges` is all zeros, and every row of the stage 3 table shows the winning claim in its entry.
