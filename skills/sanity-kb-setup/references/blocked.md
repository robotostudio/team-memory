# When something blocks you

Find the symptom, tell the user what it means in one sentence, and give them the exact step. Steps that need a browser login, a token or a plan belong to the user. Don't work around them.

## Setup

| Symptom | Means | Step |
|---|---|---|
| No `sanity.config.ts` or `sanity.cli.ts`, in the root or under `apps/studio` | No Sanity project here | If they have one elsewhere, work in that folder. If not, they run `npm create sanity@latest`, or `npx sanity@latest init` inside a Next.js app for an embedded Studio. They finish the schema and publish content before stage 1 |
| "You must be logged in", or a command asks for a login | No CLI session | The user runs `npx sanity login` and picks their provider in the browser. You can't do this for them. Afterwards `npx sanity projects list` prints their projects. Stages 1 to 5 use that login and need no token |
| `npx sanity context` doesn't exist | The `sanity` package is too old | Update it with the project's package manager, then check `npx sanity context --help`. If the commands are still missing, do stage 2 in the dashboard at `sanity.io/@<org-id>/context` from `kb-setup.md` |
| No Context app in the dashboard, or create returns "not enabled" | Knowledge Bases are an opt-in beta | In `sanity.io/manage`, an organisation admin turns on Context from the organisation's **Labs** page and Knowledge Bases from its **Apps** page. A user who isn't an admin asks the organisation's owner |
| No organisation id | It is in `npx sanity projects list` and in the dashboard URL `sanity.io/@<org-id>/...` | A project outside any organisation can't have a Knowledge Base. The user moves it into one from the project's settings in Manage |

## A suspect zero

A query returned `0` or `[]`. In testing, the same query returned nothing through one shell and four products through another. Check in this order.

1. **Quoting.** A shim may have stripped the quotes. Use the tested form or the direct Node fallback in `cli.md`.
2. **The target.** Confirm the project id and dataset against `sanity.cli.ts` and the Studio the user edits. Pass `--dataset <name>` if the project has several.
3. **The CLI's wording.** Wrap counts in an object, as `cli.md` shows.
4. **The type name.** If `count(*)` is above 0, the dataset has content and your filter is wrong. List the types with `"array::unique(*[]._type)"`.
5. **Drafts.** A Knowledge Base can't see content that exists only as drafts. The CLI query may hide drafts, so look with the `perspective: 'raw'` client from `api.md`, using `*[_id in path('drafts.**')]._id`.

The dataset is empty only after all five pass.

| Project | Step |
|---|---|
| Real | Stop. The Knowledge Base needs published content, and it comes from the user, through Studio or their own migration. Never seed, import or generate content here, and don't offer to |
| Demo, meaning the user calls it a demo or a test, usually with fictional content and a seed script in the repo | A seed script is fine. Ask before running it, because seed scripts often replace documents by id and wipe Studio edits. It usually needs a write token in `.env.local`, which the user creates under the **project's** API settings in Manage with Editor permission and pastes in themselves. When the script reads a token, give the user the command and let them run it. Never open `.env.local` |

## Creating

**"The organization's plan limit for knowledge bases is reached (2 of 2 used)", or "Organization is at its limit".** The cap counts every Knowledge Base in the organisation, across all its projects. List them with `npx sanity context list --organization <org-id>` and show the table. First check whether one matches the plan's audience, purpose and sources, because reuse needs no slot. Belonging to the same project alone is not a match. Otherwise the user chooses.

- **Delete one they name.** Deletion is permanent and removes its entries, issues and instructions. Before they choose, check which Knowledge Base each MCP endpoint reads, so a working connection survives. Never delete one on your own judgement, even an obvious test.
- **Upgrade the plan.** Sanity doesn't publish the numbers, so they check billing in Manage.
- **Use another organisation**, which has its own allowance. Client work usually belongs in the client's organisation.

| Symptom | Means | Step |
|---|---|---|
| 403 on create or on a dataset import | A missing role | `cli.md` lists the roles. Say which one is missing, and skip the retry |
| "Invalid GROQ filter ... Unexpected end of query" | A shim cut the query at a newline | Pass it on one line, as `cli.md` shows |
| The import fails on the query, or matches 0 documents | Usually quoting | Check the quoting, then that the query starts with `*[` and every field exists in the schema. Then try the sheet's fallback query and say which one worked. Above 5,000 matches needs a narrower filter |
| "fetch failed" on an import or a refresh | A network error | Run `imports list` or `context get` so a retry doesn't repeat work that went through, then retry once |

## Building and resolving

| Symptom | Means | Step |
|---|---|---|
| A rebuild raises conflicts the user already resolved | The documents still hold the losing claims, or the rebuild ran without a refresh | Do stage 5 in order, which is fix, publish, refresh, build. Leave the repeats unresolved |
| `pendingChanges` is all zeros after a refresh, though documents changed | The edits are drafts, or sit in documents the query doesn't match | Query the documents to check |
| Issues quote text that no longer exists | A build leaves earlier builds' issues open | Confirm the current value, then dismiss them once the user agrees |
| "Could not find the Sanity CLI in this folder", or `@sanity/cli-core` won't resolve | Wrong folder, or no install | Run from the Sanity project folder, where `node_modules/sanity` exists. Install first if `node_modules` is missing |
| `client.context` is undefined, or a method is missing | The Sanity packages are too old, or the API changed | Update `sanity`. Failing that, the dashboard has Entries for reading, and Issues for picking a claim and pressing **Resolve** |
| The build sits in `review` | Normal while issues are open | It reaches `ready` when none are left. Agents can read entries in both states |

## Fixing content

| Symptom | Means | Step |
|---|---|---|
| 409 on commit | Someone edited the document after you read it. The guard held and nothing was written | Read it again, show the user the new value, and redo that document's change list |
| 401 or 403 on commit | The logged-in user can't write to the dataset | They need Editor or higher on the project. Otherwise give them the change list to apply in Studio |
| The edits don't show on the website | They are drafts, or the site is cached | Publish. A cached site may then need a redeploy or a revalidation |
| You can't find the losing claim | It is worded differently, split across spans, carried by a boolean or number, or lives in a file or the code | `fix-content.md` step 1 lists where to look |

## Connecting

| Symptom | Means | Step |
|---|---|---|
| 401 | The token is missing, expired or mistyped, or the app can't see the variable | On Windows, `setx` reaches only apps started afterwards, so restart the app fully. For Cursor, see the `${env:...}` bug in `connect-agents.md` |
| 401 with "Not a member of this organization" | The token belongs to a different organisation, often left in the environment by an earlier project, or it isn't a valid token at all. A made-up token gets the same message | The user creates one in this organisation and stores it under its own variable name. `connect-agents.md` step 2 has the link |
| 403 with `contextGrantRequired`, or "No access to knowledge base '<id>'. Requires one of: sanity.knowledge-base.read" | A project token, or no Context Viewer. The second message names the Knowledge Base the endpoint serves, so the endpoint itself is right | The user creates a new token at organisation level, from the link in `connect-agents.md` step 2 |
| 404 | The organisation id or endpoint name in the URL is wrong | The name is the one chosen at creation, not the title |
| 400 or 406 | A header is missing | Send `Content-Type: application/json` and `Accept: application/json, text/event-stream` |
| Error -32005, or a 200 with `"isError": true` | The endpoint has no readable Knowledge Base. None is attached, or the first build hasn't finished | Read the body on every call. A 200 doesn't mean the tool call worked |
| Four tools instead of two | A dataset source is attached, so the endpoint runs in GROQ mode | The user removes the dataset source, or creates a new endpoint with the Knowledge Base only |
| Answers come from a different project | The URL points at another endpoint, often from an old `SANITY_CONTEXT_MCP_URL` | Write the URL out in full, and check the Knowledge Base id in `initial_context` against `kb-setup.md` |
| The agent answers without calling the tools | It isn't using the server | Name the server in the question, such as "use the `<kb-name>` tools". Check the agent lists it as connected. Some agents load MCP settings only at startup |

## Your own permissions refuse a command

Tell the user what you tried and why, and give them the exact command in a code block so they can run it or allow it. Leave other routes to the same write alone.
