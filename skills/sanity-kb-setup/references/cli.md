# Sanity CLI for Knowledge Bases

Found in `@sanity/cli` 8.11.0 under `sanity context`. `npx sanity context <command> --help` is the source of truth if a command here fails.

## Commands

| Task | Command |
|---|---|
| List Knowledge Bases | `npx sanity context list --organization <org-id> --json` |
| Create | `npx sanity context create --organization <org-id> --title "<title>" --description "<purpose>"` |
| Read state | `npx sanity context get <kb-id> --json` |
| Add dataset source | `npx sanity context imports create <kb-id> --sanity-project <project-id> --sanity-dataset <dataset> --query "<groq>"` |
| Add file | `npx sanity context imports create <kb-id> --file <path>` |
| Add website | `npx sanity context imports create <kb-id> --url <url>` |
| Add inline text | `npx sanity context imports create <kb-id> --text "<text>" --title "<title>"` |
| List sources | `npx sanity context imports list <kb-id> --json` |
| Remove a source | `npx sanity context imports delete <kb-id> <import-id>` |
| Build | `npx sanity context build <kb-id> --watch` |
| Refresh | `npx sanity context refresh <kb-id>` |
| Refresh schedule | `npx sanity context update <kb-id> --refresh-enabled --refresh-frequency weekly` |
| Job status | `npx sanity context jobs get <kb-id> <job-id> --watch` |
| Delete | `npx sanity context delete <kb-id>` |

Bash expands backticks and `$(...)` inside double quotes. Before you run a command, check that every value you put in it, whether a title, purpose, query, inline text, path or URL, holds neither, and no unescaped `"`. If one does, escape it for the user's shell or have the user enter the value in the dashboard.

`context get --json` returns `state`, `openIssueCount`, `instructionCount`, `lastChangedAt` for the last build, `pendingChanges`, `sourceUsage` and the refresh schedule.

The dataset import accepts `pt::text()` and conditional projections such as `_type == 'x' => { }`.

## Quoting on Windows

Three traps produce a misleading empty result or error.

| Trap | Symptom | Do |
|---|---|---|
| A command shim strips double quotes, so `_type == "product"` arrives as `_type == product` | `[]` or `0` | Use single quotes inside the query and wrap the argument in double quotes |
| The `.cmd` shims behind `npx` and `pnpm exec` cut an argument at the first newline | `Invalid GROQ filter ... Unexpected end of query` | Pass the query on one line |
| The CLI prints "Query returned no results" for a bare `0` | A true zero looks like a failure | Wrap counts in an object |

This form passed in Windows PowerShell 5.1, through `npx` and direct Node, and in bash:

```
npx sanity documents query "{'n': count(*[_type == 'product'])}"
```

To pass `kb-query.groq` on one line:

- bash: `--query "$(tr '\n' ' ' < kb-query.groq | tr -s ' ')"`
- PowerShell: `--query ((Get-Content -Raw kb-query.groq) -replace '\s+', ' ')`

If a command still misbehaves through a shim, call the CLI directly with `node node_modules/sanity/bin/sanity <command>`. That skips the shim, but Windows PowerShell 5.1 may still lose double quotes, so keep the single quotes. In the Lark and Kettle test the same double-quoted query returned `[]` through `pnpm exec` and four products through direct Node.

## Transient errors

`fetch failed` on an import or a refresh is a network error. Run `imports list` or `context get` first so a retry doesn't repeat work that went through, then retry once.

## What the CLI can't do

| Task | Use |
|---|---|
| Create an MCP endpoint | The Context dashboard. New endpoint, this Knowledge Base as the only source. Endpoints are organisation documents the client can read but not create |
| Read entries, list issues, resolve issues | `api.md`, or `scripts/kb-issues.mjs` to list issues |
| Add an instruction with custom wording | The dashboard. The client only lists them |

## Issue states

`scripts/kb-issues.mjs --status` takes `open`, `accepted` for resolved, or `rejected` for dismissed. Only `conflict` issues resolve. `update_required` suggestions and `gap` issues get applied in the dashboard or dismissed.

## Permissions

The CLI acts as the logged-in user and ignores tokens. A 403 usually means one of these is missing. Say which one, and skip the retry.

| Action | Needs |
|---|---|
| Create a Knowledge Base | Administrator or Developer on the organisation |
| Add a dataset source | Administrator or Developer on the project, plus unrestricted read on the dataset |
