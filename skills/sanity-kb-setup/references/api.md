# API examples

`@sanity/client` reads entries, lists issues and resolves them through `client.context`, which the CLI can't. These methods are missing from Sanity's public docs, so expect them to change. Every call below ran against a real Knowledge Base on 2026-09-17.

Write a short throwaway script from these examples, save it in the user's Sanity project folder, run it with `node`, and delete it.

## Get a client

This borrows the project's Sanity CLI, so it uses the `npx sanity login` session and needs no token.

```js
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const KB_ID = 'kb...'
const API_VERSION = 'v2026-08-25'

const fromProject = createRequire(join(process.cwd(), 'package.json'))
let cliCore
for (const pkg of ['@sanity/cli/package.json', 'sanity/package.json']) {
  try {
    const fromCli = createRequire(fromProject.resolve(pkg))
    cliCore = await import(pathToFileURL(fromCli.resolve('@sanity/cli-core')).href)
    break
  } catch {}
}
const { getGlobalCliClient, getProjectCliClient } = cliCore

const kb = await (await getGlobalCliClient({ apiVersion: API_VERSION, requireUser: true }))
  .context.knowledgeBases.get(KB_ID)

const client = await getGlobalCliClient({
  apiVersion: API_VERSION,
  requireUser: true,
  resource: { id: kb.publicId, type: 'knowledge-base' },
  context: { organizationId: kb.organizationId },
})
```

End the script by setting `process.exitCode`. On Windows, `process.exit()` after network calls can crash Node while sockets close.

## Read the entries

```js
const outline = await client.context.entries.list()
// [{ _id, path, title, tldr, status }], status is 'filled' once written

const entry = await client.context.entries.get({ path: 'delivery' })
// entry.body is Markdown, entry.citations lists its sources
```

This works before any MCP endpoint exists.

## List issues

`scripts/kb-issues.mjs <kb-id> --status open` makes this call and formats the result.

```js
const issues = await client.context.issues.list({ status: 'open' }) // 'open' | 'accepted' | 'rejected'
// issue._id, issue._createdAt, issue.status, and issue.content with:
// kind ('conflict' | 'update_required' | 'gap'), severity, claimKey,
// currentClaim, alternativeClaim, involvedScopes, scopePath, issue, suggestedFix
```

`accepted` means resolved. `rejected` means dismissed.

## Resolve, dismiss, reopen

```js
const issue = await client.context.issues.get({ issueId })
if (issue.content.kind !== 'conflict') throw new Error('only conflicts can be resolved')

// Print the winner and compare it with the user's pick before the call.
await client.context.issues.resolve({ issueId, resolution: 'keep_existing' }) // currentClaim wins, pick A
await client.context.issues.resolve({ issueId, resolution: 'accept_new' })    // alternativeClaim wins, pick B

await client.context.issues.dismiss({ issueId }) // close a stale issue, a suggestion or a gap
await client.context.issues.reopen({ issueId })  // undo a resolve, deletes the instruction it created
```

## Guarded edits

A guarded edit carries the revision you reviewed, so it can't overwrite a newer change. The example targets a published document. Run it for real only when the user approved a direct publish of that exact change.

```js
const data = await getProjectCliClient({
  apiVersion: 'v2025-08-15',
  projectId: '<project-id>',
  dataset: '<dataset>',
  requireUser: true,
  useCdn: false,
  perspective: 'raw', // so drafts.<id> is visible
})

const doc = await data.getDocument('faq-main') // note doc._rev and the field's current value
const draft = await data.getDocument('drafts.faq-main') // someone's unpublished edits, if not null

await data
  .transaction()
  .patch('faq-main', (p) =>
    p.ifRevisionId(doc._rev).set({ 'items[_key=="ret"].answer': 'You have 14 days from delivery...' }),
  )
  .commit({ dryRun: true }) // drop dryRun once the user has approved the change
```

- `ifRevisionId` fails the commit with a 409 if anyone edited the document after you read it. Nothing is written. Read it again and show the user the new value.
- `commit({ dryRun: true })` validates the whole transaction without writing.
- Address array items by `_key`, never by index.
- In draft mode, edit only the draft. Never patch the published document.

| Mode | Do |
|---|---|
| Draft, and no draft exists | Create `drafts.<id>` from the published document with `transaction.create(...)`, then patch the draft |
| Draft, and one exists | Patch the draft with its own `_rev`. Tell the user it holds other unpublished edits, and keep them |
| Approved direct publish, and a draft holds the losing claim | Put the draft's correction in the approved change list, and patch both documents in one transaction, each with its own reviewed revision. Keep the draft's unrelated edits |
| Direct publish where the draft's correction isn't approved | The user reconciles the draft in Studio first. Publishing that draft later would restore the losing claim |
