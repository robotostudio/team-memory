# JSON-LD Structured Data Skill

## What is JSON-LD?

JSON-LD (JavaScript Object Notation for Linked Data) is a method of encoding structured data using JSON. It allows you to describe the content of your web pages in a way that search engines can understand, enabling rich results (also known as rich snippets) in search engine results pages (SERPs).

JSON-LD is Google's recommended format for structured data. It is embedded in a `<script>` tag in the page's HTML, completely separate from the visible content, making it easy to add and maintain.

### Why it matters for SEO

- Enables rich results in Google Search (FAQ accordions, breadcrumbs, product cards, etc.)
- Improves click-through rates by making your listings more visually prominent
- Helps search engines understand page content and entity relationships
- Powers Knowledge Panels for organizations and people
- Required for eligibility in many Google Search features

## Prerequisites

```bash
npm install schema-dts
```

The `schema-dts` package provides TypeScript type definitions for all schema.org types, giving you autocomplete and type checking for your structured data.

## Quick Start

```tsx
import { Organization, WithContext } from 'schema-dts'

const jsonLd: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'My Company',
  url: 'https://www.example.com',
  logo: 'https://www.example.com/logo.png',
  sameAs: [
    'https://twitter.com/example',
    'https://linkedin.com/company/example',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {children}
    </>
  )
}
```

The `.replace(/</g, '\\u003c')` call is an XSS sanitization step that prevents script injection through the JSON-LD data.

## Included Schema Types

| Schema Type | Priority | Category |
|------------|----------|----------|
| Organization | CRITICAL | Business Identity |
| BreadcrumbList | CRITICAL | Site Structure |
| WebSite | CRITICAL | Site Structure |
| Article | HIGH | Content |
| BlogPosting | HIGH | Content |
| FAQPage | HIGH | Interactive |
| LocalBusiness | HIGH | Local SEO |
| Product | MEDIUM | E-Commerce |
| HowTo | MEDIUM | Interactive |
| VideoObject | MEDIUM | Media |
| Service | MEDIUM | Business Identity |
| JobPosting | MEDIUM | Content |
| Course | LOW | Content |
| Recipe | LOW | Content |
| Event | LOW | Content |
| SiteNavigationElement | LOW | Site Structure |
| Person | LOW | Business Identity |

## Validation Tools

- [Rich Results Test](https://search.google.com/test/rich-results) — Test your pages for rich result eligibility
- [Schema Markup Validator](https://validator.schema.org/) — Validate your JSON-LD against the schema.org specification
