# Opt-in patterns — per schema

After Phase 1 wiring, **no help surface appears anywhere** until a schema is wrapped with `withHelp()`. The patterns below stack — pick whichever surfaces the user wants on that schema.

**Every pattern has a skip condition.** If grep shows the helper already in place for this schema, skip and move on.

## A. Required for every help-enabled schema — `withHelp()`

**Skip if:** the schema's `defineType({...})` is already wrapped with `withHelp(...)` (grep `withHelp(` in the schema file).

Otherwise, wrap the schema definition. Without this, a `.help.md` file is ignored.

```ts
// schemaTypes/page.ts
import { defineType } from 'sanity'
import { withHelp } from 'sanity-plugin-md-notes'

export default withHelp(
  defineType({
    name: 'page',
    type: 'document',
    fields: [
      /* ... */
    ],
  }),
)
```

Patch rules when editing existing schema files:

- **Import line already present?** Extend, don't duplicate.
- **`export default defineType({...})`** → change to `export default withHelp(defineType({...}))`.
- **Named export instead of default?** Same wrap: `export const page = withHelp(defineType({...}))`.

This alone gives the user the **Help inspector** (book icon, document toolbar). The Help **view tab** comes free if `withHelpDefaultDocumentNode()` was wired in Phase 1.

## B. Help view tab on regular documents — already done in Phase 1

`withHelpDefaultDocumentNode()` from Phase 1 automatically appends a "Help" tab to every `withHelp`-wrapped document. **No per-schema code.** Skip this pattern; it's not actionable per-schema.

## C. Help view tab on singletons — `helpDocument` or `helpView`

**Skip the whole pattern if:** the schema isn't a singleton. Check by grepping the structure resolver for `S.document().schemaType('<name>')` — if absent, the doc uses `documentTypeList`/`documentTypeListItem` and gets the Help tab from (B) automatically.

**Skip if:** the singleton's structure entry already uses `helpDocument(` or `helpView(` for this schema name.

Otherwise pick one helper:

### C1. `helpDocument` — one-shot, simplest

Use when the singleton needs no extra builder methods.

```ts
import { helpDocument } from 'sanity-plugin-md-notes'

S.listItem()
  .title('404 Page')
  .child(
    helpDocument(S, {
      schemaType: 'not-found-page',
      documentId: 'not-found-page-en',
      title: 'English 404 Page',
    }),
  )
```

### C2. `helpView` — composable, when you need other builder calls

Returns a one-element array; spread into `.views([...])`. Empty array when help isn't active — no explicit guard needed.

```ts
import { helpView } from 'sanity-plugin-md-notes'

S.listItem()
  .title('404 Page')
  .child(
    S.document()
      .schemaType('not-found-page')
      .documentId('not-found-page-en')
      .title('English 404 Page')
      .initialValueTemplates([S.initialValueTemplateItem('not-found-page-en')])
      .views([S.view.form(), ...helpView(S, { schemaType: 'not-found-page' })]),
  )
```

Use C2 whenever the user chains `.initialValueTemplates()`, `.id()`, `.views([...customView, ...])`, etc. — anything beyond the basic doc. Use C1 only when none of those apply.

## D. Help item in the list-pane kebab menu — `helpMenuItems`

**Skip the whole pattern if:** the user didn't ask for a kebab Help item. This is optional — the inspector + view tab cover the common cases already. Ask if unsure.

**Skip if:** grep finds `helpMenuItems(` already referencing this schema name.

`.menuItems([...])` on a `documentTypeList` **replaces Sanity's auto-built sort options**, so `helpMenuItems` has two forms depending on whether to keep them.

### D1. Preserve default sorts (recommended) — pass `context`

```ts
import { helpMenuItems } from 'sanity-plugin-md-notes'
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('page').child(
        S.documentTypeList('page').menuItems(helpMenuItems(S, { schemaType: 'page', context })),
      ),
    ])
```

`helpMenuItems(S, {schemaType, context})` returns `[helpItem, ...schemaDefaultOrderings]` — the kebab still shows the auto-derived sorts.

### D2. Custom orderings — omit `context`, spread

```ts
S.documentTypeList('page').menuItems([
  ...helpMenuItems(S, { schemaType: 'page' }),
  S.orderingMenuItem({
    name: 'recent',
    title: 'Recent',
    by: [
      /* ... */
    ],
  }),
])
```

If the resolver already calls `.menuItems(...)` with custom orderings for this schema, **edit it to spread `helpMenuItems` in** rather than wrapping the whole call.

## Decision flowchart (after skip checks)

```
Regular document?
└─ withHelp() → done (inspector + Help tab from Phase 1)

Singleton (S.document())?
├─ Needs other builder methods? → helpView (C2)
└─ No? → helpDocument (C1)

Wants kebab Help on list view?
├─ Keep Sanity's auto sorts? → helpMenuItems with context (D1)
└─ Has custom orderings? → helpMenuItems without context, spread (D2)
```

## Gotcha — last-clicked checkmark (Sanity v5 only)

v5 marks the last-activated `S.menuItem` with a permanent checkmark. With Help alone in the menu it sticks forever. Mitigation: ensure sort items are alongside (D1 does this automatically; D2 only if the user adds them).
