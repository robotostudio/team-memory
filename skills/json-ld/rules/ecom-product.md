---
title: Product
impact: MEDIUM
impactDescription: enables product snippet with price and rating in search results
tags: json-ld, schema, seo, product, ecommerce, price, rating
---

## Product

Add structured data to product pages so Google can display rich results with price, availability, ratings, and reviews directly in search.

### When to Use
- E-commerce product detail pages with a price and availability
- Any page selling a physical or digital product
- Products with customer reviews or ratings

### TypeScript Type

Import from `schema-dts`:

```ts
import { Product, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/products/[id]/page.tsx"
import { Product, WithContext } from 'schema-dts'

async function getProduct(id: string) {
  // Fetch product data from your database or CMS
  return {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Bluetooth 5.2 connectivity.',
    sku: 'WH-NC400',
    gtin13: '0012345678905',
    image: 'https://www.acme.com/images/headphones-wh-nc400.jpg',
    brand: 'Acme Audio',
    price: '29.99',
    currency: 'USD',
    url: `https://www.acme.com/products/${id}`,
    ratingValue: '4.5',
    reviewCount: '89',
    reviews: [
      {
        authorName: 'Alex Johnson',
        datePublished: '2025-11-20',
        body: 'Excellent sound quality and the noise cancellation is top-notch. Comfortable for long listening sessions.',
        ratingValue: '5',
      },
    ],
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.sku,
    gtin13: product.gtin13,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency,
      price: product.price,
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    },
    review: product.reviews.map((r) => ({
      '@type': 'Review' as const,
      author: {
        '@type': 'Person' as const,
        name: r.authorName,
      },
      datePublished: r.datePublished,
      reviewBody: r.body,
      reviewRating: {
        '@type': 'Rating' as const,
        ratingValue: r.ratingValue,
        bestRating: '5',
      },
    })),
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price} {product.currency}</p>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Product name |
| image | Yes | string | Product image URL — use absolute URLs |
| offers | Yes | Offer | Price, currency, availability, and condition |
| offers.price | Yes | string | Price as a string, not a number |
| offers.priceCurrency | Yes | string | ISO 4217 currency code (e.g. `USD`) |
| offers.availability | Yes | string | Full schema.org URL (e.g. `https://schema.org/InStock`) |
| offers.priceValidUntil | Recommended | string | ISO 8601 date — required for price drop appearance |
| brand | Recommended | Brand | Brand object with `name` |
| aggregateRating | Recommended | AggregateRating | Average rating with `ratingValue` and `reviewCount` |
| review | Recommended | Review[] | Array of individual reviews |
| sku | Recommended | string | Stock-keeping unit identifier |
| gtin13 | Recommended | string | Global Trade Item Number |
| description | Recommended | string | Product description |

### Common Mistakes
- Don't: Use a number for price (`price: 29.99`) — use a string (`price: '29.99'`)
- Don't: Use `InStock` without the full URL prefix — always use `https://schema.org/InStock`
- Don't: Omit `priceValidUntil` — Google requires it for price drop rich results
- Do: Include at least one `review` with a `reviewRating` for best rich result display
- Don't: Use relative URLs for `image` or `offers.url` — always use absolute URLs

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
