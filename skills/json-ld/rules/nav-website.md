---
title: WebSite
impact: CRITICAL
impactDescription: enables sitelinks search box in Google results
tags: json-ld, schema, seo, website, search, sitelinks
---

## WebSite

Declare your site's identity and search endpoint so Google can display a sitelinks search box directly in search results.

### When to Use
- Every website — place once in the root layout
- Pair with `Organization` schema in the same layout
- Only include one `WebSite` schema per site

### TypeScript Type

Import from `schema-dts`:

```ts
import { WebSite, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/layout.tsx"
import { Organization, WebSite, WithContext } from 'schema-dts'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationJsonLd: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acme Corporation',
    url: 'https://www.acme.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.acme.com/images/logo.png',
      width: '600',
      height: '60',
    },
  }

  const websiteJsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Acme Corporation',
    url: 'https://www.acme.com',
    description:
      'Developer tools that help teams ship software faster.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://www.acme.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Name of the website |
| url | Yes | string | Homepage URL |
| description | Recommended | string | Short site description |
| potentialAction | Recommended | SearchAction | Enables the sitelinks search box in Google results |
| potentialAction.target | Yes (if SearchAction) | EntryPoint | Must include `urlTemplate` with `{search_term_string}` placeholder |
| potentialAction.query-input | Yes (if SearchAction) | string | Must be `'required name=search_term_string'` |

### Common Mistakes
- Don't: Omit `potentialAction` — without it you won't get the sitelinks search box in Google results
- Do: Include `SearchAction` with a working search URL that matches your site's actual search endpoint
- Don't: Place `WebSite` schema on every page via individual page components — add it once in the root layout
- Do: Pair `WebSite` and `Organization` schemas together in the same root layout
- Don't: Forget the `{search_term_string}` placeholder in `urlTemplate` — Google replaces it with the user's query

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
