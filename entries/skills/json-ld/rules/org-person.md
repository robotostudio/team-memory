---
title: Person
impact: LOW
impactDescription: enables personal Knowledge Panel and connects social profiles
tags: json-ld, schema, seo, person, author, team, profile
---

## Person

Add structured data to team member and author profile pages so Google can build a Knowledge Panel and connect social profiles to a person's identity.

### When to Use
- Team member or staff profile pages
- Author bio pages linked from blog posts or articles
- Personal portfolio or about pages
- Speaker profile pages for conferences and events

### TypeScript Type

Import from `schema-dts`:

```ts
import { Person, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/team/[slug]/page.tsx"
import { Person, WithContext } from 'schema-dts'

async function getTeamMember(slug: string) {
  // Fetch team member data from your CMS or database
  return {
    name: 'Sarah Chen',
    url: `https://www.acme.com/team/${slug}`,
    image: 'https://www.acme.com/images/team/sarah-chen.jpg',
    jobTitle: 'Senior Software Engineer',
    email: 'sarah@acme.com',
    employer: { name: 'Acme Inc.', url: 'https://www.acme.com' },
    alumniOf: { name: 'MIT', url: 'https://www.mit.edu' },
    socialProfiles: [
      'https://www.linkedin.com/in/sarahchen',
      'https://x.com/sarahchen',
      'https://github.com/sarahchen',
    ],
    expertise: ['TypeScript', 'React', 'Node.js', 'System Design'],
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const member = await getTeamMember(slug)

  const jsonLd: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    url: member.url,
    image: member.image,
    jobTitle: member.jobTitle,
    email: member.email,
    worksFor: {
      '@type': 'Organization',
      name: member.employer.name,
      url: member.employer.url,
    },
    alumniOf: {
      '@type': 'Organization',
      name: member.alumniOf.name,
      url: member.alumniOf.url,
    },
    sameAs: member.socialProfiles,
    knowsAbout: member.expertise,
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <img src={member.image} alt={member.name} />
      <h1>{member.name}</h1>
      <p>{member.jobTitle} at {member.employer.name}</p>
      <p>Education: {member.alumniOf.name}</p>
      <p>Expertise: {member.expertise.join(', ')}</p>
      <ul>
        {member.socialProfiles.map((profile) => (
          <li key={profile}>
            <a href={profile}>{profile}</a>
          </li>
        ))}
      </ul>
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Full name of the person |
| url | Recommended | string | URL of the person's profile page |
| image | Recommended | string | Photo URL — use a professional headshot |
| jobTitle | Recommended | string | Current job title or role |
| worksFor | Recommended | Organization | Employer with name and URL |
| sameAs | Recommended | string[] | Array of social profile URLs (LinkedIn, X/Twitter, GitHub) — connects profiles to Knowledge Panel |
| email | Optional | string | Contact email address |
| alumniOf | Optional | Organization | Educational institution or previous employer |
| knowsAbout | Optional | string[] | Array of topics or skills the person is known for |

### Common Mistakes
- Don't: Omit `sameAs` — this is how Google connects social profiles to a person's Knowledge Panel
- Don't: Use relative URLs for `image` or `url` — always use fully qualified absolute URLs
- Do: Include all relevant social profiles in `sameAs` — LinkedIn, X/Twitter, GitHub, personal website
- Don't: Use a plain string for `worksFor` — use a structured `Organization` object
- Do: Keep `knowsAbout` focused on professional expertise — avoid overly broad or vague terms

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
