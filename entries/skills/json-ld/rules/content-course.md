---
title: Course
impact: LOW
impactDescription: displays course info in search results
tags: json-ld, schema, seo, course, education, learning, training
---

## Course

Add structured data to course pages so Google can display course rich results with provider, price, and format directly in search.

### When to Use
- Online or in-person courses and training programs
- Educational content with a defined curriculum and provider
- Certification programs, workshops, and bootcamps

### TypeScript Type

Import from `schema-dts`:

```ts
import { Course, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/courses/[slug]/page.tsx"
import { Course, WithContext } from 'schema-dts'

async function getCourse(slug: string) {
  // Fetch course data from your CMS or database
  return {
    title: 'Advanced TypeScript for React Developers',
    description: 'Master TypeScript generics, utility types, and advanced patterns for building type-safe React applications.',
    url: `https://www.acme.com/courses/${slug}`,
    provider: { name: 'Acme Academy', url: 'https://www.acme.com' },
    instructor: { name: 'Sarah Chen', url: 'https://www.acme.com/team/sarah-chen' },
    price: '99',
    currency: 'USD',
    duration: 'PT10H',
    level: 'Intermediate',
    language: 'en',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourse(slug)

  const jsonLd: WithContext<Course> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: course.url,
    provider: {
      '@type': 'Organization',
      name: course.provider.name,
      sameAs: course.provider.url,
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor.name,
      url: course.instructor.url,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration,
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: course.currency,
      availability: 'https://schema.org/InStock',
    },
    educationalLevel: course.level,
    inLanguage: course.language,
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Instructor: {course.instructor.name}</p>
      <p>Provider: {course.provider.name}</p>
      <p>Level: {course.level}</p>
      <p>Price: ${course.price} {course.currency}</p>
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Course title |
| description | Yes | string | Summary of what the course covers |
| provider | Yes | Organization | Organization offering the course — required for rich results |
| url | Recommended | string | URL of the course page |
| instructor | Recommended | Person | Course instructor with name and URL |
| hasCourseInstance | Recommended | CourseInstance | Delivery details including `courseMode` and `courseWorkload` |
| offers | Recommended | Offer | Pricing with `price`, `priceCurrency`, and `availability` |
| educationalLevel | Recommended | string | Difficulty level (e.g. `Beginner`, `Intermediate`, `Advanced`) |
| inLanguage | Recommended | string | Language code (e.g. `en`, `es`, `fr`) |

### Common Mistakes
- Don't: Omit `provider` — Google requires it for course rich results
- Don't: Use a plain string for `instructor` — use a structured `Person` object
- Do: Include `hasCourseInstance` with `courseMode` set to `online`, `onsite`, or `blended`
- Do: Use ISO 8601 duration format for `courseWorkload` (e.g. `PT10H` for 10 hours)
- Don't: Forget `offers` when the course has a price — this helps Google display pricing info

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
