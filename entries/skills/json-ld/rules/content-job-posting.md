---
title: JobPosting
impact: MEDIUM
impactDescription: enables job listing in Google Jobs search
tags: json-ld, schema, seo, job, careers, hiring, employment
---

## JobPosting

Add structured data to job listing pages so Google can display your openings in the dedicated Jobs search experience with salary, location, and application details.

### When to Use
- Individual job listing pages on your careers site
- Remote or hybrid job postings with location requirements
- Any page advertising a specific open position

### TypeScript Type

Import from `schema-dts`:

```ts
import { JobPosting, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/careers/[slug]/page.tsx"
import { JobPosting, WithContext } from 'schema-dts'

async function getJob(slug: string) {
  // Fetch job data from your ATS or database
  return {
    title: 'Senior Full-Stack Engineer',
    description: '<p>We are looking for a Senior Full-Stack Engineer to join our product team. You will build and maintain our Next.js web application, design APIs, and collaborate with designers and product managers to ship features that delight our users.</p><p><strong>Requirements:</strong></p><ul><li>5+ years of experience with TypeScript and React</li><li>Experience with Next.js App Router and server components</li><li>Strong understanding of relational databases and REST/GraphQL APIs</li></ul>',
    datePosted: '2026-03-15',
    validThrough: '2026-06-15T23:59:59Z',
    employmentType: 'FULL_TIME',
    city: 'San Francisco',
    region: 'CA',
    country: 'US',
    isRemote: true,
    salaryCurrency: 'USD',
    salaryValue: 120000,
    salaryMin: 100000,
    salaryMax: 140000,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = await getJob(slug)

  const jsonLd: WithContext<JobPosting> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Acme Inc.',
      sameAs: 'https://www.acme.com',
      logo: 'https://www.acme.com/logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city,
        addressRegion: job.region,
        addressCountry: job.country,
      },
    },
    jobLocationType: job.isRemote ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements: job.isRemote
      ? {
          '@type': 'Country',
          name: 'United States',
        }
      : undefined,
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency,
      value: {
        '@type': 'QuantitativeValue',
        value: job.salaryValue,
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'YEAR',
      },
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
      <h1>{job.title}</h1>
      <p>
        {job.isRemote ? 'Remote' : `${job.city}, ${job.region}`} &middot;{' '}
        {job.employmentType.replace('_', ' ').toLowerCase()}
      </p>
      <div dangerouslySetInnerHTML={{ __html: job.description }} />
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| title | Yes | string | Job title — use a concise, standard title |
| description | Yes | string | Full job description — can contain HTML |
| datePosted | Yes | string | ISO 8601 date when the job was posted |
| validThrough | Yes | string | ISO 8601 expiration date — required by Google |
| hiringOrganization | Yes | Organization | Company posting the job with `name`, `sameAs`, and `logo` |
| jobLocation | Yes | Place | Physical location with a `PostalAddress` |
| employmentType | Recommended | string | One of `FULL_TIME`, `PART_TIME`, `CONTRACTOR`, `TEMPORARY`, `INTERN` |
| baseSalary | Recommended | MonetaryAmount | Salary with `QuantitativeValue` containing `minValue`, `maxValue`, and `unitText` |
| jobLocationType | Conditional | string | Set to `TELECOMMUTE` for remote positions |
| applicantLocationRequirements | Conditional | Country | Required when `jobLocationType` is `TELECOMMUTE` |

### Common Mistakes
- Don't: Omit `validThrough` — Google requires an expiration date for job postings
- Don't: Use `hiringOrganization` as a string — it must be a structured `Organization` object
- Do: Include `jobLocationType: 'TELECOMMUTE'` and `applicantLocationRequirements` together for remote jobs
- Don't: Use informal job titles like "Rockstar Developer" — use standard titles for better matching
- Do: Include salary information in `baseSalary` — listings with salary ranges get significantly more visibility in Google Jobs

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
