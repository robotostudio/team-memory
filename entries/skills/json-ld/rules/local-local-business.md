---
title: LocalBusiness
impact: HIGH
impactDescription: enables local pack and Google Maps listing
tags: json-ld, schema, seo, local, business, maps, location
---

## LocalBusiness

Add structured data to business location pages so Google can display your business in the local pack, Maps, and Knowledge Panel with address, hours, and contact details.

### When to Use
- Individual location pages for businesses with a physical address
- Store locator detail pages
- Any page representing a specific business location customers can visit

### TypeScript Type

Import from `schema-dts`:

```ts
import { LocalBusiness, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/locations/[slug]/page.tsx"
import { LocalBusiness, WithContext } from 'schema-dts'

async function getLocation(slug: string) {
  // Fetch location data from your CMS or database
  return {
    name: 'Acme Coffee Roasters — Downtown',
    url: 'https://www.acme-coffee.com/locations/downtown',
    telephone: '+1-212-555-0198',
    email: 'downtown@acme-coffee.com',
    images: [
      'https://www.acme-coffee.com/images/downtown-exterior.jpg',
      'https://www.acme-coffee.com/images/downtown-interior.jpg',
    ],
    address: {
      street: '350 Fifth Avenue',
      suite: 'Suite 100',
      city: 'New York',
      state: 'NY',
      zip: '10118',
      country: 'US',
    },
    geo: { lat: 40.7484, lng: -73.9857 },
    areaServed: 'Midtown Manhattan',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocation(slug)

  const jsonLd: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': location.url,
    name: location.name,
    url: location.url,
    telephone: location.telephone,
    email: location.email,
    image: location.images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${location.address.street}, ${location.address.suite}`,
      addressLocality: location.address.city,
      addressRegion: location.address.state,
      postalCode: location.address.zip,
      addressCountry: location.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.geo.lat,
      longitude: location.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
        ],
        opens: '07:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '09:00',
        closes: '15:00',
      },
    ],
    priceRange: '$$',
    areaServed: location.areaServed,
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{location.name}</h1>
      <address>
        {location.address.street}, {location.address.suite}
        <br />
        {location.address.city}, {location.address.state} {location.address.zip}
      </address>
      <p>Phone: <a href={`tel:${location.telephone}`}>{location.telephone}</a></p>
      <p>Email: <a href={`mailto:${location.email}`}>{location.email}</a></p>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Business name |
| @id | Recommended | string | Canonical URL as a unique identifier |
| address | Yes | PostalAddress | Full structured address |
| geo | Recommended | GeoCoordinates | Latitude and longitude — required for local pack placement |
| telephone | Recommended | string | Phone number in international format |
| email | Optional | string | Contact email address |
| url | Recommended | string | Business website URL |
| image | Recommended | string[] | Photos of the business |
| openingHoursSpecification | Recommended | OpeningHoursSpecification[] | Hours for each day or group of days |
| priceRange | Optional | string | Price indicator (e.g. `$`, `$$`, `$$$`) |
| areaServed | Optional | string | Geographic area the business serves |

### Common Mistakes
- Don't: Omit `geo` coordinates — without `latitude` and `longitude`, Google cannot place your business in local pack results or on Maps
- Don't: Use free-text addresses — always use a structured `PostalAddress` object with separate fields
- Do: Use international phone format (`+1-212-555-0198`) for the `telephone` property
- Don't: Forget `openingHoursSpecification` — this is one of the most useful fields for customers searching locally
- Do: Set `@id` to the canonical URL of the location page for consistent entity identification
- Do: Use a more specific `@type` when applicable (e.g. `Restaurant`, `Dentist`, `AutoRepair`) — these subtypes of `LocalBusiness` may unlock additional rich result features

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
