---
title: [Schema Type Name]
impact: [CRITICAL|HIGH|MEDIUM|LOW]
impactDescription: [brief SEO benefit]
tags: json-ld, schema, seo, [type-specific tags]
---

## [Schema Type Name]

[One-sentence description of when/why to use this schema type.]

### When to Use
- [Scenario 1]
- [Scenario 2]

### TypeScript Type

Import from `schema-dts`:

```ts
import { [TypeName], WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/[route]/page.tsx"
import { [TypeName], WithContext } from 'schema-dts'

export default async function Page() {
  const jsonLd: WithContext<[TypeName]> = {
    '@context': 'https://schema.org',
    '@type': '[TypeName]',
    // ... all recommended properties
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Page content */}
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| ... | ... | ... | ... |

### Common Mistakes
- Don't: ...
- Do: ...

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
