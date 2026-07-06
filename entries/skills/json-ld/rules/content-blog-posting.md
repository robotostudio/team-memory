---
title: BlogPosting
impact: HIGH
impactDescription: enables article rich results for blog content
tags: json-ld, schema, seo, blog, post, content
---

## BlogPosting

Add structured data to blog posts so Google can display rich results with headline, author, date, and images — just like Article, but semantically correct for blog content.

### When to Use
- Blog posts, personal essays, and opinion pieces published on a blog
- Content that lives under a `/blog/` or similar blog section of your site
- Use `BlogPosting` instead of `Article` when the content is explicitly a blog post

### BlogPosting vs Article

`BlogPosting` extends `Article` in the schema.org hierarchy — every `BlogPosting` is an `Article`, but not every `Article` is a `BlogPosting`. Use `BlogPosting` for blog content and `Article` for news, editorial, or general journalistic content. Never use both on the same page.

### TypeScript Type

Import from `schema-dts`:

```ts
import { BlogPosting, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/blog/[slug]/page.tsx"
import { BlogPosting, WithContext } from 'schema-dts'

async function getBlogPost(slug: string) {
  // Fetch blog post data from your CMS or database
  return {
    title: 'Getting Started with JSON-LD in Next.js',
    description: 'Learn how to add structured data to your Next.js app for better SEO and rich search results.',
    author: { name: 'Alex Johnson', url: 'https://www.acme.com/authors/alex-johnson' },
    publishedAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-05T14:20:00Z',
    images: [
      'https://www.acme.com/images/blog-post-16x9.jpg',
      'https://www.acme.com/images/blog-post-4x3.jpg',
      'https://www.acme.com/images/blog-post-1x1.jpg',
    ],
    wordCount: 1850,
    keywords: 'JSON-LD, structured data, Next.js, SEO, schema.org',
    section: 'Web Development',
    body: '...',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.images,
    publisher: {
      '@type': 'Organization',
      name: 'Acme Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.acme.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.acme.com/blog/${slug}`,
    },
    wordCount: post.wordCount,
    keywords: post.keywords,
    articleSection: post.section,
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{post.title}</h1>
      <p>By {post.author.name}</p>
      <time dateTime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString()}
      </time>
      <p>{post.description}</p>
      {/* Blog post body */}
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| headline | Yes | string | Blog post title — keep under 110 characters |
| author | Yes | Person or Organization | Structured author object |
| datePublished | Yes | string | ISO 8601 publication date |
| dateModified | Recommended | string | ISO 8601 last-modified date |
| image | Recommended | string[] | Array of image URLs in multiple aspect ratios |
| publisher | Recommended | Organization | Publisher with name and logo |
| description | Recommended | string | Short summary of the blog post |
| mainEntityOfPage | Recommended | WebPage | Canonical page reference with `@id` |
| wordCount | Optional | number | Total word count of the post body |
| keywords | Optional | string | Comma-separated list of keywords |
| articleSection | Optional | string | Section or category the post belongs to |

### Common Mistakes
- Don't: Use both `Article` and `BlogPosting` on the same page — pick one based on your content type
- Don't: Use `author: "Alex Johnson"` as a plain string — must be a structured `Person` object
- Do: Include `wordCount` and `keywords` when available — they help search engines understand content depth
- Don't: Use `BlogPosting` for news or editorial content — use `Article` instead
- Do: Set `articleSection` to the blog category for better content classification

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
