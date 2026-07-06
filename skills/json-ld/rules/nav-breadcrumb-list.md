---
title: BreadcrumbList
impact: CRITICAL
impactDescription: displays breadcrumb trail in search results
tags: json-ld, schema, seo, breadcrumbs, navigation, serp
---

## BreadcrumbList

Add structured breadcrumb trails so Google displays your page hierarchy directly in search results.

### When to Use
- Any page with a logical hierarchy (e.g. Home > Category > Product)
- Dynamic routes where the URL path reflects content structure
- Place on individual pages, not in the root layout

### TypeScript Type

Import from `schema-dts`:

```ts
import { BreadcrumbList, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/[...slug]/page.tsx"
import { BreadcrumbList, WithContext } from 'schema-dts'

function buildBreadcrumbs(slug: string[]) {
  const baseUrl = 'https://www.acme.com'

  const items: { name: string; url?: string }[] = [
    { name: 'Home', url: baseUrl },
  ]

  let path = ''
  for (const segment of slug) {
    path += `/${segment}`
    items.push({
      name: segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `${baseUrl}${path}`,
    })
  }

  // Last item is the current page — omit the URL
  const lastItem = items[items.length - 1]
  delete lastItem.url

  return items
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const breadcrumbs = buildBreadcrumbs(slug)

  const jsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  }

  // Example output for /docs/getting-started:
  // Home (pos 1) > Docs (pos 2) > Getting Started (pos 3, no item URL)

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <nav aria-label="Breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, index) => (
            <li key={index}>
              {crumb.url ? (
                <a href={crumb.url}>{crumb.name}</a>
              ) : (
                <span aria-current="page">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| itemListElement | Yes | ListItem[] | Ordered array of breadcrumb items |
| ListItem.position | Yes | number | 1-based position in the trail |
| ListItem.name | Yes | string | Display label for the breadcrumb |
| ListItem.item | Conditional | string | URL of the breadcrumb — omit for the last (current) item |

### Common Mistakes
- Don't: Start `position` at 0 — positions must start at 1
- Don't: Include `item` URL on the last breadcrumb — omit it for the current page
- Do: Always include the homepage as position 1
- Don't: Use only two breadcrumbs — include every meaningful level of hierarchy
- Do: Keep breadcrumb names concise and match visible navigation text

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
