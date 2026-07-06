---
title: Service
impact: MEDIUM
impactDescription: describes service offerings for search engines and AI
tags: json-ld, schema, seo, service, agency, consulting
---

## Service

Add structured data to service pages so search engines and AI assistants can understand your intangible offerings, pricing, and service area.

### When to Use
- Agency or consultancy service pages (e.g. web development, marketing, legal)
- SaaS product offering pages that describe a service rather than a physical product
- Professional services with defined pricing and geographic availability

### TypeScript Type

Import from `schema-dts`:

```ts
import { Service, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/services/[slug]/page.tsx"
import { Service, WithContext } from 'schema-dts'

async function getService(slug: string) {
  // Fetch service data from your CMS or database
  return {
    name: 'Web Development',
    description: 'Full-stack web development services including custom Next.js applications, e-commerce platforms, and progressive web apps. From design to deployment.',
    serviceType: 'Web Development',
    url: `https://www.acme.com/services/${slug}`,
    image: 'https://www.acme.com/images/web-development-service.jpg',
    category: 'Technology',
    price: '5000',
    currency: 'USD',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getService(slug)

  const jsonLd: WithContext<Service> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    url: service.url,
    image: service.image,
    category: service.category,
    provider: {
      '@type': 'Organization',
      name: 'Acme Digital Agency',
      url: 'https://www.acme.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.acme.com/logo.png',
      },
    },
    areaServed: {
      '@type': 'Place',
      name: 'United States',
    },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: service.currency,
    },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{service.name}</h1>
      <p>{service.description}</p>
      <p>Starting at ${service.price} {service.currency}</p>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Name of the service |
| description | Recommended | string | Detailed description of what the service includes |
| serviceType | Recommended | string | Type of service (e.g. `Web Development`, `Consulting`) |
| provider | Recommended | Organization | The business providing the service |
| areaServed | Recommended | Place or GeoShape | Geographic area where the service is available |
| offers | Recommended | Offer | Pricing information with `price` and `priceCurrency` |
| url | Recommended | string | URL of the service page |
| image | Recommended | string | Image representing the service |
| category | Recommended | string | Broad category the service belongs to |

### Common Mistakes
- Don't: Confuse `Service` with `Product` — use `Service` for intangible offerings (consulting, development, maintenance) and `Product` for physical or digital goods
- Don't: Omit `provider` — always include the organization offering the service
- Do: Use `areaServed` to specify where the service is available, especially for local services
- Don't: Use a number for `offers.price` — use a string (`price: '5000'`, not `price: 5000`)
- Do: Include `serviceType` to help search engines categorize your offering

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
