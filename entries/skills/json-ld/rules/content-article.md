---
title: Article
impact: HIGH
impactDescription: enables article rich results and carousel in Google
tags: json-ld, schema, seo, article, news, editorial
---

## Article

Add structured data to editorial and news content so Google can display article rich results with headline, image, date, and author in search and Discover.

### When to Use
- News articles, editorials, opinion pieces, and investigative reports
- Any non-blog content page with a clear author and publication date
- Pages that should appear in Google's Top Stories carousel

### TypeScript Type

Import from `schema-dts`:

```ts
import { Article, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/articles/[slug]/page.tsx"
import { Article, WithContext } from 'schema-dts'

async function getArticle(slug: string) {
  // Fetch article data from your CMS or database
  return {
    title: 'Understanding Structured Data for SEO',
    description: 'A comprehensive guide to implementing JSON-LD structured data in modern web applications.',
    author: { name: 'Jane Smith', url: 'https://www.acme.com/authors/jane-smith' },
    publishedAt: '2025-09-15T08:00:00Z',
    updatedAt: '2025-10-02T12:30:00Z',
    images: [
      'https://www.acme.com/images/article-16x9.jpg',
      'https://www.acme.com/images/article-4x3.jpg',
      'https://www.acme.com/images/article-1x1.jpg',
    ],
    body: '...',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)

  const jsonLd: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: article.images,
    publisher: {
      '@type': 'Organization',
      name: 'Acme Media',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.acme.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.acme.com/articles/${slug}`,
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
      <h1>{article.title}</h1>
      <p>By {article.author.name}</p>
      <time dateTime={article.publishedAt}>
        {new Date(article.publishedAt).toLocaleDateString()}
      </time>
      <p>{article.description}</p>
      {/* Article body */}
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| headline | Yes | string | Article title — keep under 110 characters |
| author | Yes | Person or Organization | Structured author — must be an object, not a string |
| datePublished | Yes | string | ISO 8601 publication date |
| dateModified | Recommended | string | ISO 8601 last-modified date |
| image | Recommended | string[] | Array of image URLs — include 16x9, 4x3, and 1x1 aspect ratios |
| publisher | Recommended | Organization | Publisher with name and logo |
| description | Recommended | string | Short summary of the article |
| mainEntityOfPage | Recommended | WebPage | Canonical page reference with `@id` set to the page URL |

### Common Mistakes
- Don't: Use `author: "Jane Smith"` as a plain string — Google requires a structured `Person` or `Organization` object with at least a `name` property
- Don't: Omit `datePublished` — this is required for article rich results
- Do: Provide multiple image URLs in different aspect ratios (16:9, 4:3, 1:1) for best display across surfaces
- Don't: Use relative URLs for images — always use fully qualified absolute URLs
- Do: Keep `headline` under 110 characters to avoid truncation in search results

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
