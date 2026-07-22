# JSON-LD Structured Data — Agent Reference

> This document is optimized for AI agents and LLMs. For human overview, see SKILL.md.

## Prerequisites

```bash
npm install schema-dts
```

## Core Pattern

Every JSON-LD implementation in Next.js follows this pattern:

```tsx
import { TypeName, WithContext } from 'schema-dts'

export default async function Page() {
  const jsonLd: WithContext<TypeName> = {
    '@context': 'https://schema.org',
    '@type': 'TypeName',
    // ... properties
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

**Key rules:**
- Use native `<script>` tag, NOT `next/script` (JSON-LD is data, not executable code)
- Always sanitize with `.replace(/</g, '\\u003c')` to prevent XSS
- Type with `WithContext<Type>` from `schema-dts` for full type safety

## Quick Reference

| Schema Type | Import | Priority | Route Example |
|------------|--------|----------|---------------|
| Organization | `Organization` | CRITICAL | `app/layout.tsx` |
| BreadcrumbList | `BreadcrumbList` | CRITICAL | `app/[...slug]/page.tsx` |
| WebSite | `WebSite` | CRITICAL | `app/layout.tsx` |
| Article | `Article` | HIGH | `app/articles/[slug]/page.tsx` |
| BlogPosting | `BlogPosting` | HIGH | `app/blog/[slug]/page.tsx` |
| FAQPage | `FAQPage` | HIGH | `app/faq/page.tsx` |
| LocalBusiness | `LocalBusiness` | HIGH | `app/locations/[slug]/page.tsx` |
| Product | `Product` | MEDIUM | `app/products/[id]/page.tsx` |
| HowTo | `HowTo` | MEDIUM | `app/guides/[slug]/page.tsx` |
| VideoObject | `VideoObject` | MEDIUM | `app/videos/[id]/page.tsx` |
| Service | `Service` | MEDIUM | `app/services/[slug]/page.tsx` |
| JobPosting | `JobPosting` | MEDIUM | `app/careers/[slug]/page.tsx` |
| Course | `Course` | LOW | `app/courses/[slug]/page.tsx` |
| Recipe | `Recipe` | LOW | `app/recipes/[slug]/page.tsx` |
| Event | `Event` | LOW | `app/events/[slug]/page.tsx` |
| SiteNavigationElement | `SiteNavigationElement` | LOW | `app/layout.tsx` |
| Person | `Person` | LOW | `app/team/[slug]/page.tsx` |

## Rules


## Organization

Define your brand's identity for Google's Knowledge Panel, including logo, contact info, and social profiles.

### When to Use
- Every website that represents a company or organization
- Place in root layout so it appears on every page
- Pair with `WebSite` schema in the same layout

### TypeScript Type

Import from `schema-dts`:

```ts
import { Organization, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/layout.tsx"
import { Organization, WithContext } from 'schema-dts'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acme Corporation',
    url: 'https://www.acme.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.acme.com/images/logo.png',
      width: '600',
      height: '60',
    },
    description:
      'Acme Corporation builds developer tools that help teams ship software faster.',
    foundingDate: '2018-03-15',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-415-555-0132',
      contactType: 'customer service',
      areaServed: 'US',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '548 Market Street, Suite 72000',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94104',
      addressCountry: 'US',
    },
    sameAs: [
      'https://twitter.com/acmecorp',
      'https://www.linkedin.com/company/acmecorp',
      'https://github.com/acmecorp',
    ],
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Official organization name |
| url | Yes | string | Homepage URL |
| logo | Yes | ImageObject | Logo with `url`, `width`, and `height` — not a plain string |
| description | Recommended | string | Short description of the organization |
| foundingDate | Recommended | string | ISO 8601 date (e.g. `2018-03-15`) |
| contactPoint | Recommended | ContactPoint | Customer service phone with `contactType` and `areaServed` |
| address | Recommended | PostalAddress | Physical address with full postal details |
| sameAs | Recommended | string[] | Array of official social profile URLs |

### Common Mistakes
- Don't: Use `logo` as a plain string URL — Google requires an `ImageObject` with `width` and `height` for Knowledge Panel display
- Do: Always provide `logo` as `{ '@type': 'ImageObject', url, width, height }`
- Don't: Omit `sameAs` — social profile links are how Google connects your Knowledge Panel to verified accounts
- Do: Include all official social profiles in the `sameAs` array

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
---

## BreadcrumbList

Add structured breadcrumb trails so Google displays your page hierarchy directly in search results.

### When to Use
- Any page with a logical hierarchy (e.g. Home > Category > Product)
- Dynamic routes where the URL path reflects content structure
- Place on individual pages, not in the root layout

### TypeScript Type

Import from `schema-dts`:

```ts
import { BreadcrumbList, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/[...slug]/page.tsx"
import { BreadcrumbList, WithContext } from 'schema-dts'

function buildBreadcrumbs(slug: string[]) {
  const baseUrl = 'https://www.acme.com'

  const items: { name: string; url?: string }[] = [
    { name: 'Home', url: baseUrl },
  ]

  let path = ''
  for (const segment of slug) {
    path += `/${segment}`
    items.push({
      name: segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `${baseUrl}${path}`,
    })
  }

  // Last item is the current page — omit the URL
  const lastItem = items[items.length - 1]
  delete lastItem.url

  return items
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const breadcrumbs = buildBreadcrumbs(slug)

  const jsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  }

  // Example output for /docs/getting-started:
  // Home (pos 1) > Docs (pos 2) > Getting Started (pos 3, no item URL)

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <nav aria-label="Breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, index) => (
            <li key={index}>
              {crumb.url ? (
                <a href={crumb.url}>{crumb.name}</a>
              ) : (
                <span aria-current="page">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| itemListElement | Yes | ListItem[] | Ordered array of breadcrumb items |
| ListItem.position | Yes | number | 1-based position in the trail |
| ListItem.name | Yes | string | Display label for the breadcrumb |
| ListItem.item | Conditional | string | URL of the breadcrumb — omit for the last (current) item |

### Common Mistakes
- Don't: Start `position` at 0 — positions must start at 1
- Don't: Include `item` URL on the last breadcrumb — omit it for the current page
- Do: Always include the homepage as position 1
- Don't: Use only two breadcrumbs — include every meaningful level of hierarchy
- Do: Keep breadcrumb names concise and match visible navigation text

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
---

## WebSite

Declare your site's identity and search endpoint so Google can display a sitelinks search box directly in search results.

### When to Use
- Every website — place once in the root layout
- Pair with `Organization` schema in the same layout
- Only include one `WebSite` schema per site

### TypeScript Type

Import from `schema-dts`:

```ts
import { WebSite, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/layout.tsx"
import { Organization, WebSite, WithContext } from 'schema-dts'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationJsonLd: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acme Corporation',
    url: 'https://www.acme.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.acme.com/images/logo.png',
      width: '600',
      height: '60',
    },
  }

  const websiteJsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Acme Corporation',
    url: 'https://www.acme.com',
    description:
      'Developer tools that help teams ship software faster.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://www.acme.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Name of the website |
| url | Yes | string | Homepage URL |
| description | Recommended | string | Short site description |
| potentialAction | Recommended | SearchAction | Enables the sitelinks search box in Google results |
| potentialAction.target | Yes (if SearchAction) | EntryPoint | Must include `urlTemplate` with `{search_term_string}` placeholder |
| potentialAction.query-input | Yes (if SearchAction) | string | Must be `'required name=search_term_string'` |

### Common Mistakes
- Don't: Omit `potentialAction` — without it you won't get the sitelinks search box in Google results
- Do: Include `SearchAction` with a working search URL that matches your site's actual search endpoint
- Don't: Place `WebSite` schema on every page via individual page components — add it once in the root layout
- Do: Pair `WebSite` and `Organization` schemas together in the same root layout
- Don't: Forget the `{search_term_string}` placeholder in `urlTemplate` — Google replaces it with the user's query

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
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
---

## FAQPage

Add structured data to FAQ pages so search engines and AI systems can parse your questions and answers. When eligible, Google displays an expandable accordion directly in search results.

### When to Use
- Dedicated FAQ pages with a list of common questions and answers
- Product or service pages with an FAQ section
- Support and help center pages

### Important: Google Rich Result Eligibility

Google deprecated FAQ rich results for most sites in August 2023. FAQ accordions in search now only appear for authoritative government and health websites. However, FAQPage structured data remains valuable for:
- AI and LLM consumption (ChatGPT, Perplexity, Claude, etc.)
- Other search engines (Bing, Yandex, etc.)
- Knowledge graph enrichment
- Future-proofing if Google re-enables the feature

### TypeScript Type

Import from `schema-dts`:

```ts
import { FAQPage, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/faq/page.tsx"
import { FAQPage, WithContext } from 'schema-dts'

const faqs = [
  {
    question: 'What is JSON-LD structured data?',
    answer:
      'JSON-LD (JavaScript Object Notation for Linked Data) is a method of encoding structured data using JSON. It allows you to describe your page content in a way that search engines can easily parse and use for rich results.',
  },
  {
    question: 'Does JSON-LD affect page performance?',
    answer:
      'No. JSON-LD is injected as a script tag in the HTML and is not rendered visually. Search engines read it directly from the source, so it has no impact on page load time or Core Web Vitals.',
  },
  {
    question: 'Can I have multiple JSON-LD blocks on one page?',
    answer:
      'Yes. Google supports multiple JSON-LD blocks on a single page. Each block should describe a different entity or schema type. This is common when combining BreadcrumbList with Article or Product schemas.',
  },
]

export default async function Page() {
  const jsonLd: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
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
      <h1>Frequently Asked Questions</h1>
      <dl>
        {faqs.map((faq, index) => (
          <div key={index}>
            <dt>{faq.question}</dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| mainEntity | Yes | Question[] | Array of Question objects |
| Question.name | Yes | string | The full text of the question |
| Question.acceptedAnswer | Yes | Answer | The answer object |
| Answer.text | Yes | string | The full text of the answer — can include HTML |

### Common Mistakes
- Don't: Use `question` and `answer` as property names — the schema.org spec uses `name` for the question text and `acceptedAnswer` for the answer object
- Don't: Use FAQPage for a single question — use it only for pages with multiple Q&A pairs
- Do: Make the `name` property the complete question text, exactly as shown on the page
- Don't: Include FAQ structured data on pages where the questions are not visible to users — content must match
- Do: Keep answers in `Answer.text` concise but complete — you can include basic HTML for formatting

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
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
---

## HowTo

Add structured data to tutorial and guide pages so Google can display step-by-step rich results with images, tools, and estimated time directly in search.

### When to Use
- Step-by-step tutorials and how-to guides
- DIY instructions, recipes with non-food steps, or setup guides
- Any content that walks the user through a process with distinct steps

### TypeScript Type

Import from `schema-dts`:

```ts
import { HowTo, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/guides/[slug]/page.tsx"
import { HowTo, WithContext } from 'schema-dts'

async function getGuide(slug: string) {
  // Fetch guide data from your CMS or database
  return {
    title: 'How to Set Up a Next.js Project',
    description: 'Learn how to create a new Next.js application from scratch with TypeScript, ESLint, and Tailwind CSS configured.',
    image: 'https://www.acme.com/images/nextjs-setup-guide.jpg',
    totalTime: 'PT30M',
    steps: [
      {
        name: 'Install Node.js',
        text: 'Download and install Node.js 18 or later from nodejs.org. Verify the installation by running node --version in your terminal.',
        image: 'https://www.acme.com/images/step-1-install-node.jpg',
        url: `https://www.acme.com/guides/${slug}#step-1`,
      },
      {
        name: 'Create the Project',
        text: 'Run npx create-next-app@latest my-app in your terminal. Select TypeScript, ESLint, and Tailwind CSS when prompted.',
        image: 'https://www.acme.com/images/step-2-create-project.jpg',
        url: `https://www.acme.com/guides/${slug}#step-2`,
      },
      {
        name: 'Start the Development Server',
        text: 'Navigate into your project directory with cd my-app, then run npm run dev. Open http://localhost:3000 in your browser to see your new app.',
        image: 'https://www.acme.com/images/step-3-dev-server.jpg',
        url: `https://www.acme.com/guides/${slug}#step-3`,
      },
    ],
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = await getGuide(slug)

  const jsonLd: WithContext<HowTo> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.description,
    image: guide.image,
    totalTime: guide.totalTime,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Code editor (e.g. VS Code)',
      },
      {
        '@type': 'HowToSupply',
        name: 'Terminal application',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Node.js 18+',
      },
      {
        '@type': 'HowToTool',
        name: 'npm',
      },
    ],
    step: guide.steps.map((s) => ({
      '@type': 'HowToStep' as const,
      name: s.name,
      text: s.text,
      image: s.image,
      url: s.url,
    })),
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{guide.title}</h1>
      <p>{guide.description}</p>
      <p>Estimated time: 30 minutes</p>
      <ol>
        {guide.steps.map((step, index) => (
          <li key={index}>
            <h2>{step.name}</h2>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Title of the how-to guide |
| step | Yes | HowToStep[] | Array of structured step objects |
| step[].name | Yes | string | Short title for the step |
| step[].text | Yes | string | Full instruction text for the step |
| step[].image | Recommended | string | Image URL illustrating the step |
| step[].url | Recommended | string | URL with anchor to this step on the page |
| description | Recommended | string | Summary of what the guide covers |
| image | Recommended | string | Hero image for the guide |
| totalTime | Recommended | string | ISO 8601 duration (e.g. `PT30M`) |
| estimatedCost | Recommended | MonetaryAmount | Cost to complete (use `value: '0'` for free) |
| supply | Recommended | HowToSupply[] | Materials needed |
| tool | Recommended | HowToTool[] | Tools required |

### Common Mistakes
- Don't: Use plain strings for steps instead of `HowToStep` objects — Google requires structured steps with `name` and `text`
- Don't: Omit the `name` property on steps — each step must have a short descriptive title
- Do: Keep step text concise and actionable — one instruction per step
- Don't: Use relative URLs for step `url` or `image` — always use absolute URLs
- Do: Include `totalTime` in ISO 8601 duration format (`PT30M` for 30 minutes, `PT1H` for 1 hour)

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
---

## VideoObject

Add structured data to video pages so Google can display video rich results with thumbnails, duration, and upload date in search and the video carousel.

### When to Use
- Pages featuring a video as the primary content
- Video landing pages with embedded players
- Tutorial or course pages with video content

### TypeScript Type

Import from `schema-dts`:

```ts
import { VideoObject, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/videos/[id]/page.tsx"
import { VideoObject, WithContext } from 'schema-dts'

async function getVideo(id: string) {
  // Fetch video data from your CMS or database
  return {
    title: 'Getting Started with Next.js App Router',
    description: 'A beginner-friendly walkthrough of the Next.js App Router, covering file-based routing, layouts, server components, and data fetching patterns.',
    thumbnails: [
      'https://www.acme.com/thumbnails/nextjs-app-router-16x9.jpg',
      'https://www.acme.com/thumbnails/nextjs-app-router-4x3.jpg',
    ],
    uploadDate: '2025-10-15T08:00:00Z',
    duration: 'PT1M33S',
    contentUrl: 'https://www.acme.com/videos/nextjs-app-router.mp4',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    viewCount: '12345',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = await getVideo(id)

  const jsonLd: WithContext<VideoObject> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnails,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: {
        '@type': 'WatchAction',
      },
      userInteractionCount: video.viewCount,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Acme Tutorials',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.acme.com/logo.png',
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
      <h1>{video.title}</h1>
      <iframe
        src={video.embedUrl}
        title={video.title}
        allowFullScreen
      />
      <p>{video.description}</p>
    </section>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Video title |
| description | Yes | string | Video description |
| thumbnailUrl | Yes | string[] | Array of thumbnail image URLs — required by Google |
| uploadDate | Yes | string | ISO 8601 date when the video was published |
| contentUrl | Recommended | string | Direct URL to the video file |
| embedUrl | Recommended | string | URL for the embeddable video player |
| duration | Recommended | string | ISO 8601 duration (e.g. `PT1M33S` for 1 min 33 sec) |
| interactionStatistic | Recommended | InteractionCounter | View count using `WatchAction` interaction type |
| publisher | Recommended | Organization | Publisher with name and logo |

### Common Mistakes
- Don't: Omit `thumbnailUrl` — Google requires a thumbnail for video rich results
- Don't: Use a single string for `thumbnailUrl` when you have multiple sizes — use an array
- Do: Use ISO 8601 duration format for `duration` (`PT1M33S`, not `1:33` or `93`)
- Don't: Confuse `contentUrl` (direct file) with `embedUrl` (player page) — include both when available
- Do: Keep `description` under 2048 characters for best compatibility

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
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
---

## Recipe

Add structured data to recipe pages so Google can display recipe cards with images, ratings, cook times, and ingredients directly in search results.

### When to Use
- Recipe pages with ingredients, instructions, and cook times
- Food blog posts centered around a single recipe
- Any cooking or baking content with structured preparation steps

### TypeScript Type

Import from `schema-dts`:

```ts
import { Recipe, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/recipes/[slug]/page.tsx"
import { Recipe, WithContext } from 'schema-dts'

async function getRecipe(slug: string) {
  // Fetch recipe data from your CMS or database
  return {
    title: 'Classic Margherita Pizza',
    description: 'A simple and authentic Margherita pizza with fresh mozzarella, San Marzano tomatoes, and basil on a crispy thin crust.',
    images: [
      'https://www.acme.com/images/margherita-16x9.jpg',
      'https://www.acme.com/images/margherita-4x3.jpg',
      'https://www.acme.com/images/margherita-1x1.jpg',
    ],
    author: { name: 'Marco Rossi', url: 'https://www.acme.com/team/marco-rossi' },
    publishedAt: '2025-06-10T10:00:00Z',
    prepTime: 'PT15M',
    cookTime: 'PT30M',
    totalTime: 'PT45M',
    servings: '4 servings',
    category: 'Dinner',
    cuisine: 'Italian',
    calories: '350 calories',
    ingredients: [
      '2 cups all-purpose flour',
      '1 cup warm water',
      '1 tablespoon olive oil',
      '1 teaspoon salt',
      '1 teaspoon active dry yeast',
      '1 cup San Marzano tomato sauce',
      '8 oz fresh mozzarella, sliced',
      'Fresh basil leaves',
    ],
    steps: [
      { text: 'Combine flour, water, olive oil, salt, and yeast in a bowl. Knead for 10 minutes until smooth.' },
      { text: 'Let the dough rise in a covered bowl for 1 hour at room temperature.' },
      { text: 'Preheat oven to 475°F (245°C) with a pizza stone or inverted baking sheet inside.' },
      { text: 'Stretch the dough into a 12-inch round on a floured surface.' },
      { text: 'Spread tomato sauce evenly over the dough, leaving a 1-inch border.' },
      { text: 'Arrange mozzarella slices on top and bake for 12-15 minutes until crust is golden.' },
      { text: 'Remove from oven, top with fresh basil leaves, and slice.' },
    ],
    rating: { value: 4.8, count: 312 },
    videoName: 'How to Make Margherita Pizza',
    videoDescription: 'Step-by-step video guide for making authentic Margherita pizza at home.',
    videoThumbnail: 'https://www.acme.com/images/margherita-video-thumb.jpg',
    videoUploadDate: '2025-06-10T10:00:00Z',
    videoContentUrl: 'https://www.acme.com/videos/margherita-pizza.mp4',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const recipe = await getRecipe(slug)

  const jsonLd: WithContext<Recipe> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.images,
    description: recipe.description,
    author: {
      '@type': 'Person',
      name: recipe.author.name,
      url: recipe.author.url,
    },
    datePublished: recipe.publishedAt,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.servings,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    nutrition: {
      '@type': 'NutritionInformation',
      calories: recipe.calories,
    },
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((s) => ({
      '@type': 'HowToStep' as const,
      text: s.text,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.value.toString(),
      reviewCount: recipe.rating.count.toString(),
    },
    video: {
      '@type': 'VideoObject',
      name: recipe.videoName,
      description: recipe.videoDescription,
      thumbnailUrl: recipe.videoThumbnail,
      uploadDate: recipe.videoUploadDate,
      contentUrl: recipe.videoContentUrl,
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
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <p>By {recipe.author.name}</p>
      <p>Prep: {recipe.prepTime} | Cook: {recipe.cookTime}</p>
      <p>Serves: {recipe.servings}</p>
      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      <h2>Instructions</h2>
      <ol>
        {recipe.steps.map((step, index) => (
          <li key={index}>{step.text}</li>
        ))}
      </ol>
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Recipe title |
| image | Yes | string[] | Array of image URLs — include 16x9, 4x3, and 1x1 aspect ratios |
| recipeIngredient | Yes | string[] | Array of individual ingredient strings — must be an array, not a single string |
| recipeInstructions | Yes | HowToStep[] | Array of step objects with `text` property |
| author | Yes | Person | Recipe author as a structured object |
| datePublished | Recommended | string | ISO 8601 publication date |
| prepTime | Recommended | string | ISO 8601 duration (e.g. `PT15M`) |
| cookTime | Recommended | string | ISO 8601 duration (e.g. `PT30M`) |
| totalTime | Recommended | string | ISO 8601 duration — should equal prepTime + cookTime |
| recipeYield | Recommended | string | Number of servings (e.g. `4 servings`) |
| recipeCategory | Recommended | string | Meal type (e.g. `Dinner`, `Dessert`, `Appetizer`) |
| recipeCuisine | Recommended | string | Cuisine type (e.g. `Italian`, `Mexican`, `Japanese`) |
| nutrition | Recommended | NutritionInformation | Nutritional info with at least `calories` |
| aggregateRating | Recommended | AggregateRating | Rating with `ratingValue` and `reviewCount` |
| video | Recommended | VideoObject | Optional video with name, thumbnail, and content URL |

### Common Mistakes
- Don't: Use a single string for `recipeIngredient` — Google requires an array of individual ingredient strings
- Don't: Use plain text for `recipeInstructions` — use an array of `HowToStep` objects with a `text` property
- Do: Use ISO 8601 duration format for all time values (`PT15M` for 15 minutes, `PT1H30M` for 90 minutes)
- Don't: Omit `image` — recipe rich results require at least one image
- Do: Include multiple image aspect ratios (16:9, 4:3, 1:1) for best display across devices

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
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
---

## SiteNavigationElement

Add structured data to your site navigation so search engines and AI crawlers can understand your site's primary navigation structure and internal link hierarchy.

### When to Use
- Root layout or shared navigation component with primary site links
- Sites that want to reinforce internal link structure for search engines
- Pages targeting AI-powered search engines and assistants that consume structured data

> **Note:** SiteNavigationElement does not produce a visible rich result in Google. It helps search engines understand site structure and improves internal link signals. Focus on Organization, BreadcrumbList, and WebSite schemas first — they have much higher SEO impact.

### TypeScript Type

Import from `schema-dts`:

```ts
import { SiteNavigationElement, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/layout.tsx"
import { SiteNavigationElement, WithContext } from 'schema-dts'

const navItems = [
  { name: 'Home', url: '/' },
  { name: 'Products', url: '/products' },
  { name: 'Pricing', url: '/pricing' },
  { name: 'Blog', url: '/blog' },
  { name: 'About', url: '/about' },
  { name: 'Contact', url: '/contact' },
]

const baseUrl = 'https://www.acme.com'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd: WithContext<SiteNavigationElement> = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    hasPart: navItems.map((item) => ({
      '@type': 'SiteNavigationElement' as const,
      name: item.name,
      url: `${baseUrl}${item.url}`,
    })),
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.url}>
                <a href={item.url}>{item.name}</a>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Label for the navigation element or group |
| url | Yes | string | Absolute URL the navigation item links to |
| hasPart | Recommended | SiteNavigationElement[] | Nested navigation items within a parent group |

### Common Mistakes
- Don't: Over-invest in this schema — it has the lowest SEO impact of all structured data types. Focus on Organization, BreadcrumbList, and WebSite first.
- Don't: Include every page on the site — only add primary navigation items that appear in your main menu
- Do: Use absolute URLs (e.g. `https://www.acme.com/about`) — never relative paths
- Don't: Duplicate navigation structured data on every page if it's already in the root layout
- Do: Keep the navigation structure flat and simple — avoid deeply nested hierarchies

### Validation
- [Schema Markup Validator](https://validator.schema.org/)
- [Rich Results Test](https://search.google.com/test/rich-results) (no rich result preview — validates syntax only)
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

---

## Workflows

### JSON-LD Audit

Scan a Next.js App Router project to discover all routes, determine which JSON-LD types apply, detect existing implementations, and produce a prioritized implementation plan.

#### When to Use

- Starting SEO work on a new or existing Next.js project
- Auditing structured data coverage before a site launch
- Reviewing which routes are missing JSON-LD after adding new pages

#### Phase 1: Route Discovery

Scan `app/` for all `page.tsx` and `layout.tsx` files. Build a route map:

1. Glob for `app/**/page.tsx` and `app/**/layout.tsx`
2. Compute URL paths: strip `app/` prefix, strip `/page.tsx` or `/layout.tsx`, strip route group parens `(group)` → ``
3. Skip parallel routes `@folder`, intercepting routes `(.)`, private folders `_folder`
4. Preserve dynamic segments `[slug]` and catch-alls `[...slug]` in output

#### Phase 2: Route Classification

Map each route to JSON-LD types using two tiers.

**Tier A — Path Patterns:**

| URL Pattern | JSON-LD Types | Rule |
|-------------|---------------|------|
| Root `layout.tsx` | Organization, WebSite | `org-organization`, `nav-website` |
| Root `layout.tsx` (if site has nav) | SiteNavigationElement | `nav-site-navigation` |
| Any nested layout or page | BreadcrumbList | `nav-breadcrumb-list` |
| `/blog/[slug]`, `/posts/[slug]`, `/news/[slug]` | BlogPosting | `content-blog-posting` |
| `/blog`, `/posts`, `/news` (index) | Article | `content-article` |
| `/articles/[slug]`, `/press/[slug]` | Article | `content-article` |
| `/products/[id]`, `/shop/[slug]`, `/store/[slug]` | Product | `ecom-product` |
| `/faq`, `/faqs`, `/help`, `/frequently-asked-questions` | FAQPage | `interactive-faq-page` |
| `/about`, `/team`, `/company` | Organization | `org-organization` |
| `/team/[slug]`, `/people/[slug]`, `/authors/[slug]` | Person | `org-person` |
| `/services`, `/services/[slug]`, `/solutions/[slug]` | Service | `org-service` |
| `/locations/[slug]`, `/stores/[slug]`, `/contact` | LocalBusiness | `local-local-business` |
| `/careers`, `/jobs`, `/careers/[slug]`, `/jobs/[slug]` | JobPosting | `content-job-posting` |
| `/courses/[slug]`, `/learn/[slug]`, `/training/[slug]` | Course | `content-course` |
| `/recipes/[slug]`, `/cooking/[slug]` | Recipe | `content-recipe` |
| `/events/[slug]`, `/calendar/[slug]`, `/meetups/[slug]` | Event | `content-event` |
| `/guides/[slug]`, `/how-to/[slug]`, `/tutorials/[slug]` | HowTo | `interactive-howto` |
| `/videos/[slug]`, `/watch/[slug]` | VideoObject | `media-video-object` |

**Tier B — Content Analysis** (for routes not matching Tier A):

Read the page component and look for:
- CMS data fetches: `getPost()`, `getProduct()`, `getEvent()` suggest content types
- Component imports: `VideoPlayer`, `ProductCard`, `FAQAccordion` suggest schema types
- Content patterns: Q&A lists → FAQPage, numbered steps → HowTo, price/rating → Product
- TypeScript types from CMS imports

If unclassifiable, flag as "Unclassified — manual review needed".

#### Phase 3: Existing JSON-LD Detection

For each route file, scan for:
1. `<script type="application/ld+json">` tags
2. `from 'schema-dts'` or `from "schema-dts"` imports
3. JSON-LD component imports (e.g., `JsonLd`, `StructuredData`)
4. Extract `@type` values from detected JSON-LD

Check parent `layout.tsx` files too — JSON-LD in layouts applies to child routes.

Mark each route: **Complete** | **Partial** | **Missing**

#### Phase 4: Plan Output

Generate `docs/plans/YYYY-MM-DD-json-ld-audit.md` in the target project:

```markdown
# JSON-LD Structured Data Audit

Generated: YYYY-MM-DD

## Summary

- **Routes scanned**: N
- **JSON-LD implementations found**: N types across N routes
- **Missing implementations**: N types across N routes
- **Coverage**: N%

## Current Coverage

| Route | File Path | Existing JSON-LD | Recommended | Status |
|-------|-----------|-----------------|-------------|--------|
| `/` | `app/layout.tsx` | Organization | Organization, WebSite | Partial |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | BlogPosting, BreadcrumbList | BlogPosting, BreadcrumbList | Complete |
| `/products/[id]` | `app/products/[id]/page.tsx` | — | Product, BreadcrumbList | Missing |

## Implementation Plan

### CRITICAL Priority

1. **Add WebSite to root layout** (`app/layout.tsx`)
   - Schema: `WebSite` — enables sitelinks search box
   - Rule: `nav-website` → see rules/nav-website.md

### HIGH Priority

2. **Add FAQPage to /faq** (`app/faq/page.tsx`)
   - Schema: `FAQPage` — FAQ accordion in SERPs
   - Rule: `interactive-faq-page` → see rules/interactive-faq-page.md

### MEDIUM Priority
...

### LOW Priority
...
```

#### Phase 5: Implementation

If the user accepts the plan:

1. Ensure `schema-dts` is in project dependencies
2. Batch by priority: CRITICAL → HIGH → MEDIUM → LOW
3. One subagent per route — each reads the referenced rule file for the implementation pattern, reads the target route, adapts the pattern, adds JSON-LD
4. Apply XSS sanitization: `.replace(/</g, '\\u003c')`
5. Do not duplicate existing JSON-LD types
6. Re-audit after to confirm coverage
