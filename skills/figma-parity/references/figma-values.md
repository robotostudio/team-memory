# Reading values out of Figma

The Figma desktop app must be running with the file open. Tools are `mcp__figma-dev-mode__*`; load them with `ToolSearch` if deferred.

## Get the node IDs

Each ticket's description and attachments carry its frame URL:

```
https://www.figma.com/design/<fileKey>/<name>?node-id=1948-107545&m=dev
```

`node-id=1948-107545` → nodeId `1948:107545`. Mobile and tablet are separate frames on separate tickets.

## Pull geometry first

`get_metadata` on the frame returns the whole tree as `x`/`y`/`width`/`height`. This is the cheap, complete source — one call per frame covers nearly the entire checklist. Large frames persist to a file; slice them with python rather than re-requesting.

Decode it:

| Want | From |
| --- | --- |
| font-size of a text node | `height ÷ lines ÷ line-height` — a 26px-tall single-line node at 1.2 leading is 22px type |
| line count | compare `height` against the single-line height of its neighbours |
| gap between two blocks | `next.y − (prev.y + prev.height)` |
| content inset | child `x` within a full-width container |
| column width | child `width` |
| section padding | container `height` minus the span its children occupy |

Sibling y-gaps are exact and need no second call. A frame whose children sit at `x=80` in an 840-wide container has an 80px inset, whichever gutter the header uses.

## Confirm named styles

`get_design_context` on two or three representative nodes — the page title, one section heading, one body paragraph — returns the reference markup plus a line like:

```
Tablet/Headlines/H1: Font(family: "Aeonik", style: Medium, size: 48, weight: 500, lineHeight: 1, letterSpacing: 0)
```

That is the authority for family, weight, and letter-spacing, which geometry cannot give you. It also reveals inline weight changes — clause numbers set in Medium inside a Regular paragraph, for instance.

Do not call it on the whole frame; the response is truncated to metadata and you lose the style block.

## Watch for

- **Copy-pasted frames.** A frame whose body text belongs to a different page was duplicated and not updated. Its values are unreliable — say so rather than building to them.
- **Mislabelled frames.** Tickets sometimes note this themselves ("the desktop frame is mislabelled …").
- **Hidden nodes.** `hidden="true"` in the metadata — excluded from layout, so skip them.
- **A design system with tokens already in the codebase.** Check `globals.css` `@theme` before writing a value: `--text-h-mobile: 2.5rem` and `--leading-body: 1.4` may already be exactly the numbers the frame specifies. Using the token beats a raw value and satisfies the canonical-classes rule.
