---
title: Event
impact: LOW
impactDescription: displays event listing with date, location, and tickets in search
tags: json-ld, schema, seo, event, conference, meetup, concert
---

## Event

Add structured data to event pages so Google can display event listings with dates, location, and ticket information directly in search results.

### When to Use
- Conference, meetup, and workshop pages
- Concert, festival, and performance event listings
- Webinars, online events, and virtual conferences
- Any page describing a scheduled event with a date and location

### TypeScript Type

Import from `schema-dts`:

```ts
import { Event, WithContext } from 'schema-dts'
```

### Next.js Implementation

#### In-Person Event

```tsx filename="app/events/[slug]/page.tsx"
import { Event, WithContext } from 'schema-dts'

async function getEvent(slug: string) {
  // Fetch event data from your CMS or database
  return {
    title: 'React Summit 2026',
    description: 'The largest React conference in North America, featuring talks from core team members and community leaders.',
    image: 'https://www.acme.com/images/react-summit-2026.jpg',
    startDate: '2026-06-15T09:00:00-07:00',
    endDate: '2026-06-17T18:00:00-07:00',
    venue: {
      name: 'Moscone Center',
      street: '747 Howard St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'US',
    },
    organizer: { name: 'Acme Events', url: 'https://www.acme.com' },
    performer: { name: 'Dan Abramov' },
    ticketUrl: `https://www.acme.com/events/${slug}/tickets`,
    price: '50',
    currency: 'USD',
    ticketAvailability: 'https://schema.org/InStock',
    ticketValidFrom: '2026-01-15T00:00:00-08:00',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  const jsonLd: WithContext<Event> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    image: event.image,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.street,
        addressLocality: event.venue.city,
        addressRegion: event.venue.state,
        postalCode: event.venue.postalCode,
        addressCountry: event.venue.country,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer.name,
      url: event.organizer.url,
    },
    performer: {
      '@type': 'Person',
      name: event.performer.name,
    },
    offers: {
      '@type': 'Offer',
      url: event.ticketUrl,
      price: event.price,
      priceCurrency: event.currency,
      availability: event.ticketAvailability,
      validFrom: event.ticketValidFrom,
    },
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>
        {new Date(event.startDate).toLocaleDateString()} —{' '}
        {new Date(event.endDate).toLocaleDateString()}
      </p>
      <p>{event.venue.name}, {event.venue.city}, {event.venue.state}</p>
      <a href={event.ticketUrl}>Get Tickets — ${event.price}</a>
    </article>
  )
}
```

#### Online Event Variant

For virtual events, use `VirtualLocation` and `OnlineEventAttendanceMode`:

```tsx
const onlineEventJsonLd: WithContext<Event> = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'React Performance Workshop',
  description: 'A hands-on virtual workshop on optimizing React application performance.',
  image: 'https://www.acme.com/images/react-perf-workshop.jpg',
  startDate: '2026-07-20T10:00:00-07:00',
  endDate: '2026-07-20T14:00:00-07:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  location: {
    '@type': 'VirtualLocation',
    url: 'https://www.acme.com/events/react-perf-workshop/join',
  },
  organizer: {
    '@type': 'Organization',
    name: 'Acme Events',
    url: 'https://www.acme.com',
  },
  offers: {
    '@type': 'Offer',
    url: 'https://www.acme.com/events/react-perf-workshop/tickets',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Event title |
| startDate | Yes | string | ISO 8601 date with timezone (e.g. `2026-06-15T09:00:00-07:00`) |
| location | Yes | Place or VirtualLocation | Physical venue or virtual meeting URL |
| eventAttendanceMode | Yes | string | Full schema.org URL — `OfflineEventAttendanceMode`, `OnlineEventAttendanceMode`, or `MixedEventAttendanceMode` |
| eventStatus | Recommended | string | Full schema.org URL — `EventScheduled`, `EventPostponed`, `EventCancelled`, or `EventRescheduled` |
| endDate | Recommended | string | ISO 8601 date with timezone |
| description | Recommended | string | Summary of the event |
| image | Recommended | string | Event image URL |
| organizer | Recommended | Organization | Event organizer with name and URL |
| performer | Recommended | Person | Featured speaker or performer |
| offers | Recommended | Offer | Ticket info with price, currency, availability, and `validFrom` date |

### Common Mistakes
- Don't: Use plain strings like `EventScheduled` for `eventStatus` — use full schema.org URLs like `https://schema.org/EventScheduled`
- Don't: Use plain strings like `OfflineEventAttendanceMode` for `eventAttendanceMode` — use full schema.org URLs
- Do: Include timezone offsets in `startDate` and `endDate` (e.g. `-07:00` or `Z` for UTC)
- Don't: Use `Place` for online events — use `VirtualLocation` with a `url` property
- Do: Update `eventStatus` when an event is postponed or cancelled rather than removing the structured data

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
