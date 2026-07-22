# Vite branch — install checklist

Use this when the studio has `vite.config.{ts,js}` or a `vite:` key in `sanity.cli.{ts,js}`. Applies to standalone Sanity Studios and any Vite-based host app.

**Every step has a skip condition.** Re-running on an already-configured studio? Check each gate first.

## 1. Register the Vite plugin (auto-detects GitHub repo)

**Skip if:** grep for `sanityHelpVite()` returns a hit in `vite.config.*` or `sanity.cli.*`.

Otherwise, edit `vite.config.ts` (preferred) **or** the `vite` field in `sanity.cli.ts` — pick the file that already exists; don't create a new `vite.config.ts` if the project uses `sanity.cli.ts`.

**`vite.config.ts`:**

```ts
import { defineConfig } from 'vite'
import { sanityHelpVite } from 'sanity-plugin-md-notes/vite'

export default defineConfig({
  plugins: [sanityHelpVite()],
})
```

**`sanity.cli.ts` (alternative):**

```ts
import { sanityHelpVite } from 'sanity-plugin-md-notes/vite'

export default defineCliConfig({
  // ...existing fields
  vite: (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), sanityHelpVite()],
  }),
})
```

Skip this step entirely if the user doesn't want the GitHub footer — they can pass `githubRepo: 'owner/repo'` literally in step 3 instead.

## 2. Ensure `import.meta.glob` types resolve

**Skip if:** `tsconfig.json` has no `compilerOptions.types` array (TS auto-includes Vite types), OR `compilerOptions.types` already includes `"vite/client"`.

Otherwise, add it:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client" /* ...existing entries */],
  },
}
```

Symptom of this being wrong: `Property 'glob' does not exist on type 'ImportMeta'`.

## 3. Wire `helpPlugin` + `withHelpDefaultDocumentNode` in `sanity.config.ts`

**Skip the whole step if:** grep finds both `helpPlugin(` and `withHelpDefaultDocumentNode` inside `sanity.config.*`. Sub-parts can be skipped independently — see below.

Target shape:

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { helpPlugin, withHelpDefaultDocumentNode } from 'sanity-plugin-md-notes'
import gitRepo from 'sanity-plugin-md-notes/git-repo'

const helpFiles = import.meta.glob('./schemaTypes/**/*.help.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export default defineConfig({
  // ...existing config
  plugins: [
    helpPlugin({ files: helpFiles, githubRepo: gitRepo }),
    structureTool({
      structure, // existing resolver
      defaultDocumentNode: withHelpDefaultDocumentNode(),
    }),
  ],
})
```

**Sub-step skip rules** when patching an existing config:

- **Import line already present?** Don't re-add. If only one of `helpPlugin` / `withHelpDefaultDocumentNode` is imported, extend that import rather than adding a second line.
- **`helpFiles` glob already declared?** Reuse it. Don't shadow with a second `const helpFiles`.
- **`structureTool({...})` already in `plugins`?** Inject `defaultDocumentNode: withHelpDefaultDocumentNode()` into the existing call. If `defaultDocumentNode` is already passed, **compose** instead of replacing:

  ```ts
  defaultDocumentNode: withHelpDefaultDocumentNode((S, context) =>
    /* their existing resolver body */
  )
  ```

- **`helpPlugin(...)` already in `plugins`?** Don't re-register. If it's there but missing `githubRepo` and the user wants the footer, edit the existing call.

**Adjust the glob path** to wherever the user's schemas live. Common locations:

- Standalone studios: `./schemaTypes/**/*.help.md`
- Next.js hosts (running through Vite for dev only): `./sanity/schemas/**/*.help.md` or `./src/sanity/schemaTypes/**/*.help.md`

**`githubRepo` options** (pick one):

- `gitRepo` from `sanity-plugin-md-notes/git-repo` (recommended; auto-detected by the Vite plugin from `.git/config`).
- Literal: `githubRepo: 'owner/repo'`.
- From package.json: `githubRepo: pkg.repository`.
- Omit to hide the footer link.

## Verify (only if anything in this file changed)

Run static checks yourself; advise the user on runtime steps.

**You run:**

- Typecheck if available (`pnpm typecheck`, `tsc --noEmit`, etc.) — should pass.
- grep `sanity.config.*` to confirm `helpPlugin(` and `withHelpDefaultDocumentNode` are present exactly once.

**Tell the user:**

- "Restart your dev server and clear `node_modules/.vite/` (Vite caches pre-bundled deps and won't pick up the new plugin without this)."
- "Schemas without `withHelp()` show no change yet — Help surfaces appear after Phase 2."
