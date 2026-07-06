---
title: Organization
impact: CRITICAL
impactDescription: enables Google Knowledge Panel for your brand
tags: json-ld, schema, seo, organization, knowledge-panel, brand
---

## Organization

Define your brand's identity for Google's Knowledge Panel, including logo, contact info, and social profiles.

### When to Use
- Every website that represents a company or organization
- Place in root layout so it appears on every page
- Pair with `WebSite` schema in the same layout

### TypeScript Type

Import from `schema-dts`:

```ts
import { Organization, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/layout.tsx"
import { Organization, WithContext } from 'schema-dts'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd: WithContext<Organization> = {
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
    description:
      'Acme Corporation builds developer tools that help teams ship software faster.',
    foundingDate: '2018-03-15',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-415-555-0132',
      contactType: 'customer service',
      areaServed: 'US',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '548 Market Street, Suite 72000',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94104',
      addressCountry: 'US',
    },
    sameAs: [
      'https://twitter.com/acmecorp',
      'https://www.linkedin.com/company/acmecorp',
      'https://github.com/acmecorp',
    ],
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
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
| name | Yes | string | Official organization name |
| url | Yes | string | Homepage URL |
| logo | Yes | ImageObject | Logo with `url`, `width`, and `height` — not a plain string |
| description | Recommended | string | Short description of the organization |
| foundingDate | Recommended | string | ISO 8601 date (e.g. `2018-03-15`) |
| contactPoint | Recommended | ContactPoint | Customer service phone with `contactType` and `areaServed` |
| address | Recommended | PostalAddress | Physical address with full postal details |
| sameAs | Recommended | string[] | Array of official social profile URLs |

### Common Mistakes
- Don't: Use `logo` as a plain string URL — Google requires an `ImageObject` with `width` and `height` for Knowledge Panel display
- Do: Always provide `logo` as `{ '@type': 'ImageObject', url, width, height }`
- Don't: Omit `sameAs` — social profile links are how Google connects your Knowledge Panel to verified accounts
- Do: Include all official social profiles in the `sameAs` array

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
