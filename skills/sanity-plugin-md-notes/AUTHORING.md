# Authoring `.help.md` content

Each opted-in schema can have one `<schemaName>.help.md` file. Basename **must** equal the schema's `name:` (case-sensitive). The file map (Vite glob / codegen) discovers it by filename.

**Skip creating the file if it already exists** — open it, ask the user what to add or change, then use the sections below as syntax reference only. Don't overwrite existing content unless the user asks you to.

## Frontmatter

Only one recognised field — everything else is ignored.

```md
---
lastUpdated: 2026-05-13
---

# Pages

Editor-facing markdown goes here.
```

| Field         | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| `lastUpdated` | ISO date shown in the footer. Quoting optional. Omit to hide it. |

## Markdown features

Standard GFM:

- `h1`–`h6` with hover-revealed `#` anchor links (click → updates URL hash, deep-linkable)
- `**bold**`, `_italic_`, `~~strike~~`
- Ordered / unordered / nested lists, task lists (`- [ ]` / `- [x]`)
- Tables with column alignment (`:--`, `:-:`, `--:`)
- Inline `code`, fenced ` ```code blocks ` (see below)
- Blockquotes, `---` horizontal rules, images, links
- External links auto-open in a new tab with `rel="noopener noreferrer"`

## Admonitions (GitHub blockquote syntax)

Five types. Each renders as a tinted `@sanity/ui` Card.

```md
> [!NOTE]
> Neutral context — no icon (intentionally low-key).

> [!TIP]
> Productivity shortcut.

> [!IMPORTANT]
> Required reading.

> [!WARNING]
> Look-fine-but-bite-later situations.

> [!CAUTION]
> Irreversible / data-loss risk.
```

## Code blocks

Inline `code` uses a pill background.

Fenced blocks support:

- **Language hint** (`ts`, `js`, `bash`, etc.) in the info string — for consumer tooling. Plugin does not bundle a highlighter.
- **`title="..."`** in the info string → connected file-label header above the block.
- **Copy button** in top-right (hover-revealed, "Copied!" feedback).
- **Two-axis scroll** — capped at ~22rem tall.

````md
```ts title="sanity.config.ts"
import { helpPlugin } from 'sanity-plugin-md-notes'
```
````

## Video embeds

Paste a Loom / YouTube / Vimeo / Wistia URL **on its own line** (becomes an autolink). Plugin replaces it with a 16:9 iframe.

Explicit `[click here](https://...)` syntax keeps acting as a regular link.

| Provider | URL shapes                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------ |
| Loom     | `loom.com/share/<id>`, `loom.com/embed/<id>`                                                     |
| YouTube  | `youtube.com/watch?v=<id>`, `youtu.be/<id>`, `youtube.com/embed/<id>`, `youtube.com/shorts/<id>` |
| Vimeo    | `vimeo.com/<id>`, `player.vimeo.com/video/<id>`                                                  |
| Wistia   | `*.wistia.com/medias/<id>`, `*.wistia.net/medias/<id>`, `fast.wistia.net/embed/iframe/<id>`      |

YouTube embeds use `youtube-nocookie.com` with `referrerPolicy="origin"` — works around Error 153 when embedded from arbitrary hosts. Prefer Loom for max reliability.

## In-Studio intent links

Link to another document or the "new doc" form for a schema using Sanity's structure-tool intent URLs. **Path-based, not querystring.**

```md
[Edit the Poster Resource Type](/structure/intent/edit/id=resourceType-poster;type=resourceType)

[Create a new Topic](/structure/intent/create/type=topic)
```

### Rules — all of these matter

- **Edit form:** `/structure/intent/edit/id=<docId>;type=<schemaType>`
- **Create form:** `/structure/intent/create/type=<schemaType>`
- **Params are semicolon-separated path segments.** `?id=...&type=...` (querystring) crashes the router with a misleading "intent params must be a string" error.
- **`/structure/` prefix is mandatory.** A bare `/intent/edit/...` URL routes through the studio-level tool picker, which can land in Presentation tool instead of Structure.
- **Clicking causes a full page reload** — normal browser navigation, not SPA. Reliable but no soft-nav.
- **Studio at `/studio`?** Prefix accordingly: `/studio/structure/intent/edit/...`.
- **Pane resolution still applies.** Even with correct URL, the intent has to resolve to a specific pane. Custom-filtered or non-standard panes may land the doc in a generic context, not the exact pane the studio normally builds.

## Filename conventions — critical

Registry keys by **filename basename** (the part before `.help.md`). Basename must equal the schema's `name:` **exactly**.

| Schema name      | Correct filename         | Wrong                                           |
| ---------------- | ------------------------ | ----------------------------------------------- |
| `page`           | `page.help.md`           | `Page.help.md`, `pages.help.md`                 |
| `resourceType`   | `resourceType.help.md`   | `resource-type.help.md`, `ResourceType.help.md` |
| `not-found-page` | `not-found-page.help.md` | `notFoundPage.help.md`                          |

## Example template

````md
---
lastUpdated: 2026-05-15
---

# {Schema Display Name}

> [!NOTE]
> One-sentence "what is this schema for" intro.

## When to use this

- Bullet of editor use case
- Another bullet

## Key fields

| Field | What it controls |
| ----- | ---------------- |
| ...   | ...              |

## Common patterns

```ts title="Example value"
{
  "field": "value"
}
```
````

## Related

- [Edit the homepage](/structure/intent/edit/id=homepage;type=page)
- [Create a new article](/structure/intent/create/type=article)

## Walkthrough

https://www.loom.com/share/<id>

```

```
