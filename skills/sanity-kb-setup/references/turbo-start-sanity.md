# turbo-start-sanity baseline

Taken from `robotostudio/turbo-start-sanity` `apps/studio/schema.json`. Clients customise the starter, so check every type and field against the project's own schema before using this.

## Query

```groq
*[_type in ['faq', 'page', 'homePage', 'blogIndex', 'settings']]{
  _type,
  _type == 'faq' => {
    'question': title,
    'answer': pt::text(richText)
  },
  _type in ['page', 'homePage', 'blogIndex'] => {
    title,
    description,
    'blocks': pageBuilder[]{
      _type,
      badge,
      eyebrow,
      title,
      subtitle,
      'body': pt::text(richText),
      'cards': cards[]{ title, 'body': pt::text(richText) },
      caption
    }
  },
  _type == 'settings' => {
    siteTitle,
    siteDescription,
    contactEmail
  }
}
```

Add the client's own fact types, such as `product` or `policy`, as further branches.

## Types

| Type | Role | Kept | Left out |
|---|---|---|---|
| `faq` | Fact | `title` as question, `richText` as answer | none |
| `page` | Page content | `title`, `description`, block text | `slug`, `image`, SEO and OG fields |
| `homePage` | Page content | as `page` | as `page` |
| `blogIndex` | Page content | as `page` | as `page` |
| `settings` | Fact | `siteTitle`, `siteDescription`, `contactEmail` | logos, favicon, OG image, social links |
| `blog`, `author` | Editorial | excluded | |
| `navbar`, `footer`, `redirect` | Structural | excluded | |
| `assist.instruction.context`, `mux.videoAsset`, `media.folder`, `media.tag`, `sanity.fileAsset`, `sanity.imageAsset` | System | excluded | |

## Page-builder blocks

| Block | Text kept | Dropped |
|---|---|---|
| `hero` | `badge`, `title`, `richText` | `video`, `buttons` |
| `heroSplit` | `title`, `subtitle` | `buttons`, `image` |
| `cta` | `eyebrow`, `title`, `richText` | `buttons`, `usedByTeams` |
| `featureCardsIcon` | `eyebrow`, `title`, `richText`, cards' `title` and `richText` | icons |
| `richTextBlock` | `eyebrow`, `title`, `richText` | none |
| `videoFeature` | `eyebrow`, `title`, `richText`, `caption` | `video` |
| `faqAccordion` | `eyebrow`, `title`, `subtitle` | `categories[].faqs`, which reference `faq` documents already read directly |
| `socialGrid` | `eyebrow`, `title`, `subtitle` | `socials` |
| `showcaseGrid` | `title` | `description`, `items` |
| `logoCloud` | nothing | `logos` |
| `subscribeNewsletter` | `title` | `subTitle`, `helperText`, `testimonial` |

`showcaseGrid.description` is dropped because the projection has no `description` key at block level. Add it if a client uses the block for facts.

## Routes

| Route | Type |
|---|---|
| `/` | `homePage` |
| `/[...slug]` | `page` |
| `/blog` | `blogIndex` |
| `/blog/[slug]` | `blog` |

## Expected outline

A bare starter holds no policy or product types, so the outline will be thin, often just an FAQ topic and a homepage topic. Say so in the sheet. Most useful topics (services, how to buy, pricing, support, policies) need client-specific types, files, or written knowledge documents.
