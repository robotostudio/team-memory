---
name: sanity-kb-setup
description: Set up, check and fix a Sanity Context Knowledge Base, connect coding agents to it over MCP, and guide building a visitor chat, a chatbot or an FAQ ask box, that answers from it. Use when the user wants a Knowledge Base or "KB" planned, created or built, its conflicts or issues reviewed or resolved, its content corrected or audited, or an agent such as Claude Code, Cursor or Codex connected to one, or visitors able to ask it questions through a chatbot or an FAQ ask box. Also use when they say "what did the build flag" or "pick the winners", or when setup is blocked by a missing Sanity project, login, organisation token or Knowledge Base slot.
compatibility: Needs a Node version supported by the project's installed Sanity packages, a Sanity project with the `sanity` package installed, and `npx sanity login`. Tested with Sanity 6.14.0, which requires Node >=22.12.
metadata:
  version: "1.3.0"
---

# Sanity Knowledge Base setup

Take a Sanity project to a Knowledge Base that agents can read and trust. You do the work with the Sanity CLI, the project's own files and the examples in `references/api.md`.

## Stages

Read only the file for the stage you are in.

| Stage | When | Read |
|---|---|---|
| 1. Plan | The project has no `kb-setup.md` | `references/plan.md`, then `references/type-roles-and-queries.md`. For a `turbo-start-sanity` repo, also `references/turbo-start-sanity.md` |
| 2. Create | The user said yes to the plan | `references/create.md` and `references/cli.md` |
| 3. Check | A build or rebuild just finished | `references/check.md` and `references/api.md` |
| 4. Resolve | The user replied with picks such as `1A 2B` | `references/resolve.md` and `references/api.md` |
| 5. Fix content | Issues are resolved and the documents still hold the losing claims | `references/fix-content.md` |
| 6. Connect | The user wants an agent to read the Knowledge Base | `references/connect-agents.md` |
| 7. Visitor chat | The user said yes to the visitor chat offer | `references/visitor-chat.md` |
| Blocked | A command fails, a result looks wrong, or something is missing | `references/blocked.md` |

Stages 2 to 5 are one flow. A finished build sends you straight to stage 3. The stops are the ones marked in the stage files, where a person has to say yes or pick.

Once the Knowledge Base is Clean, offer a visitor chat once, after stage 6 or in its place. `references/visitor-chat.md` has the wording and the conditions. Stage 7 writes application code, so it only starts on a yes.

## Where things stand

Check what exists before any stage.

- `kb-setup.md` in the project is the plan, called the sheet in these files. It records the Knowledge Base id once one exists.
- `npx sanity context list --organization <org-id>` shows the organisation's Knowledge Bases. `references/create.md` says when to reuse one.
- `npx sanity context imports list <kb-id>` shows which sources already imported. Add each source once.

Then name the state in these words.

| State | Means |
|---|---|
| Planned | `kb-setup.md` exists, nothing is created |
| Built | Sources imported and a build finished. Nobody has checked what it says |
| Reviewed | You compared the entries with the source claims, and the user has seen every disagreement, raised or silent |
| Clean | Reviewed, the picks are resolved, the content is corrected, and a rebuild raised nothing new |
| Connected | An agent reads it, and you confirmed the endpoint serves this Knowledge Base |

Connected doesn't require Clean. Some users keep conflicts on purpose, for a demo or to test a checking tool. If the project looks like that, for example a README that lists planted conflicts, ask before stage 4 or 5. If they keep the conflicts, stop at Reviewed and go to stage 6.

## How a Knowledge Base works

Sanity reads the sources, sorts the facts into topics, and writes one cited entry per topic. Where sources disagree it keeps one claim and may file an issue. Agents read the entries over MCP with `initial_context` and `knowledge_base_read`.

- **The purpose steers the build.** It decides which sources the build keeps, which subjects lead and how deep each entry goes.
- **A dataset source is one GROQ query over one dataset.** It starts with `*[`, reads published documents only, and matches between 1 and 5,000 documents.
- **File sources never re-sync.** To update one, delete the import and add the new file.
- **A silent settlement is a disagreement the build settled without filing an issue.** The issues list misses these, and results vary between builds of the same sources. Only reading the entries finds them.
- **Resolving changes the Knowledge Base, not the website.** The losing claim stays in the document until someone corrects it.

## Ground rules

- Name only types, fields and files you have read. A query that names a missing field fails silently and indexes nulls.
- A `0` or `[]` is a suspect zero. Run the checks in `references/blocked.md` before you act on it.
- Content comes from the user. Never seed, import, generate or reset content in a real project, and never offer to. Seed only a project the user calls a demo.
- Never write a token, key or password into a file or a chat message. They live in environment variables, and you never see one.
- A person decides every delete, resolution and dataset write. Delete only the Knowledge Base or import the user names. Resolve only the issues they picked. Write only the exact change list they approved, with every edit guarded by the revision you reviewed, and as drafts unless they ask to publish.
- The CLI's `context` commands and the `client.context` API are missing from Sanity's public docs. If one behaves differently from these files, say so and use the dashboard.
- If your own permission settings refuse a command, give the user the exact command to run. Leave other routes to the same write alone.
