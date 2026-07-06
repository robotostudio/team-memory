---
name: sanity-plugin-md-notes
description: Wire up the `sanity-plugin-md-notes` plugin in a Sanity Studio — bundler-specific install, schema opt-in via `withHelp`, singleton/list helpers, and `.help.md` authoring. Idempotent — also use to add help to an additional schema in a studio where the plugin is already wired. Triggered by `sanity-plugin-md-notes`, `.help.md`, `helpPlugin`, `withHelp`, `withHelpDefaultDocumentNode`, `helpDocument`, `helpView`, `helpMenuItems`, "add editor help to <schema>", or authoring admonitions / video embeds / intent links in a help file.
---

# sanity-plugin-md-notes

**Idempotent.** Use for first-time integration **or** to add help to one more schema in an already-wired studio. Every step has an explicit **skip condition** — check before doing.

## Workflow — Phase 0 first, then 1→3 with skips

### Phase 0 — detect what's already done

**Skip Phase 0 if** you already ran it earlier in this conversation and the checklist results are still in your context — the only thing to re-confirm is which schema the user wants to add help to next, then jump straight to the phase that applies. Re-running grep on an unchanged codebase is wasted work.

Otherwise (first invocation in this conversation): ask the user which schema(s) they want to add help to (e.g. `author`). Then scan the codebase once and fill in this checklist:

| Check                                    | How                                                                                                                                     | If true → skip                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Plugin installed                         | `sanity-plugin-md-notes` in `package.json` deps                                                                                         | Phase 1.1                                                                  |
| Bundler wiring done                      | Vite: `sanityHelpVite()` in `vite.config*` or `sanity.cli*`. Webpack/Turbo: codegen script in `package.json` + loader in `next.config*` | Phase 1.2 (bundler-specific steps in VITE.md / WEBPACK.md)                 |
| `helpPlugin(...)` registered             | grep `helpPlugin(` in `sanity.config*`                                                                                                  | Phase 1.3 (plugin registration)                                            |
| `withHelpDefaultDocumentNode` wired      | grep `withHelpDefaultDocumentNode` in `sanity.config*`                                                                                  | Phase 1.3 (defaultDocumentNode) — but still verify `structureTool` uses it |
| Schema wrapped with `withHelp()`         | grep `withHelp(` in the target schema file                                                                                              | Phase 2.A (wrap step)                                                      |
| Schema is a singleton + has Help tab     | grep `helpDocument(` or `helpView(` referencing the schema name                                                                         | Phase 2.C                                                                  |
| Kebab Help item already on schema's list | grep `helpMenuItems(` referencing the schema name                                                                                       | Phase 2.D (only if user wanted kebab)                                      |
| `<schemaName>.help.md` already exists    | Check filesystem; basename must equal schema `name:` exactly                                                                            | Phase 3 (offer to edit instead)                                            |

Report the checklist back to the user before executing — they can correct any wrong assumptions.

### Phase 1 — install + wire up

**Skip entire phase if:** plugin installed AND bundler wiring done AND `helpPlugin(...)` registered AND `withHelpDefaultDocumentNode` wired. Phase 1 is per-studio — only runs first time, or if a previous install was partial.

Otherwise, **for the steps that didn't pass**, follow:

- **Bundler is Vite** (`vite.config.*` or `vite:` key in `sanity.cli.*`) → [VITE.md](VITE.md)
- **Bundler is Webpack or Turbopack** (`next.config.*`, Next.js host) → [WEBPACK.md](WEBPACK.md)

Each branch file is a checklist; each step has its own skip condition.

### Phase 2 — opt the target schema in (per schema)

**Skip entire phase if:** target schema is already wrapped with `withHelp()` AND any needed singleton/kebab helpers are already in place.

Otherwise, see [OPT-IN.md](OPT-IN.md) — pattern A (wrap) is mandatory; patterns C (singleton) and D (kebab) are optional and independently skippable.

### Phase 3 — author the markdown (per schema)

**Skip if `<schemaName>.help.md` already exists** — open it and ask the user what they want to add/change, then jump straight to [AUTHORING.md](AUTHORING.md) for syntax reference.

Otherwise, create the file at the right location next to the schema. See [AUTHORING.md](AUTHORING.md) for frontmatter, admonitions, video URLs, intent links, code-block titles.

## Verification

Run static checks yourself; **advise** the user on the runtime steps — don't restart their dev server, clear caches, or click around in their browser.

### Static checks you run

- **grep what you just wrote.** Confirm `helpPlugin(`, `withHelpDefaultDocumentNode`, `withHelp(<schemaName>`, `helpDocument(`/`helpView(`, `helpMenuItems(` are present where Phase 1/2 said they should be — and not duplicated.
- **File presence.** `<schemaName>.help.md` exists at the schema's directory with exact-case basename matching `name:`.
- **Typecheck if available.** If the consumer has `pnpm typecheck` / `tsc --noEmit` / equivalent, run it. Stop and fix if it fails.
- **Lint if available.** Same — run if present, fix failures.

### Advise the user to do (don't do these yourself)

Phrase as a checklist for the user. Examples:

- "Restart your dev server. If Vite, also run `rm -rf node_modules/.vite/` first."
- "Open a document of `<schema>` → expect a book icon in the top-right (inspector) and a 'Help' tab next to 'Editor'."
- If singleton: "Open the singleton → 'Help' tab should appear."
- If `helpMenuItems` added: "Open the list view kebab `…` → 'Help' entry should be present."
- If only a `.help.md` file was added to an already-opted-in schema: "HMR should pick it up; reload the inspector if not."

## Hard constraints — do not violate

- **Filename ↔ schema name casing must match exactly.** `Page.help.md` for `name: 'page'` will not register.
- **`withHelp()` is required.** A `.help.md` file alone does nothing.
- **Intent links need `/structure/` prefix and semicolon-separated params.** `/intent/edit/?id=X&type=Y` crashes the router. Correct: `/structure/intent/edit/id=X;type=Y`.
- **Singletons need `helpDocument` or `helpView`, never `S.document()` alone.** `S.document()` bypasses `defaultDocumentNode`.
- **`helpMenuItems` without `context` wipes default sorts.** Pass `context` from the resolver to preserve them.
- **Don't re-add what's already there.** If grep shows a function/import already present, skip — don't duplicate imports or re-register the plugin.

## Common pitfalls

- **`import.meta.glob` TS error** → add `"vite/client"` to `tsconfig.json` `compilerOptions.types`.
- **Help icon missing after edit** → for Vite: `rm -rf node_modules/.vite` + restart.
- **`require.context` empty under Next.js 16** → Turbopack doesn't implement it. Use the `codegen` CLI (WEBPACK.md).
- **Intent link lands in Presentation, not Structure** → URL missing `/structure/` prefix.
