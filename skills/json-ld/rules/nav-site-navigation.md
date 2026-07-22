---
title: SiteNavigationElement
impact: LOW
impactDescription: helps search engines and AI understand site navigation structure
tags: json-ld, schema, seo, navigation, menu, sitemap
---

## SiteNavigationElement

Add structured data to your site navigation so search engines and AI crawlers can understand your site's primary navigation structure and internal link hierarchy.

### When to Use
- Root layout or shared navigation component with primary site links
- Sites that want to reinforce internal link structure for search engines
- Pages targeting AI-powered search engines and assistants that consume structured data

> **Note:** SiteNavigationElement does not produce a visible rich result in Google. It helps search engines understand site structure and improves internal link signals. Focus on Organization, BreadcrumbList, and WebSite schemas first — they have much higher SEO impact.

### TypeScript Type

Import from `schema-dts`:

```ts
import { SiteNavigationElement, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/layout.tsx"
import { SiteNavigationElement, WithContext } from 'schema-dts'

const navItems = [
  { name: 'Home', url: '/' },
  { name: 'Products', url: '/products' },
  { name: 'Pricing', url: '/pricing' },
  { name: 'Blog', url: '/blog' },
  { name: 'About', url: '/about' },
  { name: 'Contact', url: '/contact' },
]

const baseUrl = 'https://www.acme.com'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd: WithContext<SiteNavigationElement> = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    hasPart: navItems.map((item) => ({
      '@type': 'SiteNavigationElement' as const,
      name: item.name,
      url: `${baseUrl}${item.url}`,
    })),
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
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.url}>
                <a href={item.url}>{item.name}</a>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Label for the navigation element or group |
| url | Yes | string | Absolute URL the navigation item links to |
| hasPart | Recommended | SiteNavigationElement[] | Nested navigation items within a parent group |

### Common Mistakes
- Don't: Over-invest in this schema — it has the lowest SEO impact of all structured data types. Focus on Organization, BreadcrumbList, and WebSite first.
- Don't: Include every page on the site — only add primary navigation items that appear in your main menu
- Do: Use absolute URLs (e.g. `https://www.acme.com/about`) — never relative paths
- Don't: Duplicate navigation structured data on every page if it's already in the root layout
- Do: Keep the navigation structure flat and simple — avoid deeply nested hierarchies

### Validation
- [Schema Markup Validator](https://validator.schema.org/)
- [Rich Results Test](https://search.google.com/test/rich-results) (no rich result preview — validates syntax only)
