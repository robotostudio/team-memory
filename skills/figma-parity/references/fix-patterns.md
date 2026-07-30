# Applying the fix

## Keep desktop frozen

Scope every override below `lg`, and add an `lg:` reset wherever today's desktop value differs from the value you introduce:

```
mb-14 md:mb-16 lg:mb-12      /* mobile 56, tablet 64, desktop keeps its 48 */
gap-x-4 md:gap-x-6 lg:gap-x-8
text-h-mobile md:text-5xl lg:text-7xl tracking-normal lg:tracking-tight
```

For CSS blocks, wrap the whole thing so it simply does not exist at desktop:

```css
@media (width < 64rem) { … }
```

An `lg:` reset that restores a value which looks wrong beside its tablet counterpart — desktop with *less* space than tablet — is worth flagging to the user. It usually means the desktop frame was never measured. Preserve it as instructed and say so.

## Beating the typography plugin

`@tailwindcss/typography` emits low-specificity `:where()` rules inside `@layer utilities`. Unlayered CSS in `globals.css` beats all of it regardless of specificity, which is why the existing table styles sit unlayered. Put the parity rules there too.

Its `prose-*` modifiers cannot express a flat scale — every size and margin is em-relative to the prose root, so `prose-headings:*` utilities fight the plugin rather than replace it. State the values outright instead.

## Reset at any depth, set explicitly

Direct-child selectors miss content wrapped in an authored `<div>`, and MDX bodies routinely contain them. Reset broadly at zero specificity, then set narrowly:

```css
.doc :where(p, ul, ol, div, h2) {   /* :where() = 0 specificity, so every rule below wins */
  margin-block: 0;
  font-size: 1rem;
  line-height: var(--leading-body);
}
.doc > * + *,
.doc :is(p, ul, ol) + :is(p, ul, ol) { margin-top: 1rem; }
.doc > h2 { margin-top: 2.5rem; margin-bottom: 0.75rem; }
```

Without `:where()` on the reset you end up counting specificity between overlapping `:is()` lists, and a more-specific reset silently wins over the rule meant to override it.

## Margin collapse eats the smaller value

Adjacent siblings collapse to `max(bottom, top)`. A 12px heading margin-bottom against a 16px paragraph margin-top renders 16px — the value you wrote never appears. Let one side own the gap:

```css
.doc > h2 + :is(p, ul, ol, div) { margin-top: 0; }
```

Always confirm the fix with `gap()` from the measuring harness rather than re-reading the declaration.

## Selecting structural position

Some rhythms distinguish blocks by where they sit, not what they are — lead-in paragraphs before the first heading spaced differently from clauses under one. Both are plain `<p>` siblings:

```css
.doc > *:has(~ h2:first-of-type) + * { margin-top: 2.5rem; }
```

"Still has the first heading ahead of it" = the lead-in. This beats restructuring the content, which would mean editing every MDX file in the collection.

## Per-page values

When sibling frames disagree, the value is page-specific. Put it behind a config flag rather than generalizing one page's number across a shared renderer:

```ts
// LegalDocConfig
spaciousProse?: boolean;   // documented with *why* the frames differ
```

Then `cn("shared-classes", flag && "variant-classes")`. Default to the value the majority of verified frames use, and leave the odd one out opted in.

## Reaching for a token

The canonical-classes rule bites hardest here, because Figma hands you raw pixels. Before writing one, check `globals.css` `@theme` — the value is often already a token: `--text-h-mobile` is exactly 40px/1, `--leading-body` exactly 1.4, `--leading-heading` exactly 1.2. `leading-heading` satisfies the rule where `leading-[1.2]` violates it, and says more.

Comment *why* a value is what it is, especially a per-page flag or an `lg:` reset. Both look like redundancy to the next reader, who will otherwise "simplify" them back into a bug.
