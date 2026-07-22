---
name: json-ld
description: Type-safe JSON-LD structured data for Next.js with schema-dts
version: 1.0.0
triggers:
  - json-ld
  - structured data
  - schema markup
  - SEO schema
  - rich snippets
  - schema.org
  - rich results
  - json-ld audit
  - structured data audit
  - seo audit
---

# JSON-LD Structured Data

Type-safe JSON-LD implementations for Next.js App Router using `schema-dts`.

## Prerequisites

```bash
npm install schema-dts
```

## Core Pattern

Every implementation follows this pattern:

```tsx
import { TypeName, WithContext } from 'schema-dts'

const jsonLd: WithContext<TypeName> = {
  '@context': 'https://schema.org',
  '@type': 'TypeName',
  // properties...
}

// Render in page/layout:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  }}
/>
```

## Rules by Priority

### CRITICAL — Every site needs these
| Rule | Schema Type | Rich Result |
|------|------------|-------------|
| org-organization | Organization | Knowledge Panel |
| nav-breadcrumb-list | BreadcrumbList | Breadcrumb trail in SERPs |
| nav-website | WebSite | Sitelinks search box |

### HIGH — Most sites benefit
| Rule | Schema Type | Rich Result |
|------|------------|-------------|
| content-article | Article | Article carousel |
| content-blog-posting | BlogPosting | Article rich result |
| interactive-faq-page | FAQPage | FAQ accordion in SERPs |
| local-local-business | LocalBusiness | Local pack / map |

### MEDIUM — Domain-specific
| Rule | Schema Type | Rich Result |
|------|------------|-------------|
| ecom-product | Product | Product snippet with price/rating |
| interactive-howto | HowTo | Step-by-step rich result |
| media-video-object | VideoObject | Video carousel |
| org-service | Service | Service description |
| content-job-posting | JobPosting | Job listing in Google Jobs |

### LOW — Niche use cases
| Rule | Schema Type | Rich Result |
|------|------------|-------------|
| content-course | Course | Course info in search |
| content-recipe | Recipe | Recipe card rich result |
| content-event | Event | Event listing |
| nav-site-navigation | SiteNavigationElement | Navigation hints |
| org-person | Person | Knowledge Panel |

## Workflows

| Rule | Description |
|------|-------------|
| audit-project | Scan project routes, detect existing JSON-LD, and generate a prioritized implementation plan |
