---
title: VideoObject
impact: MEDIUM
impactDescription: enables video carousel and video rich results
tags: json-ld, schema, seo, video, media, youtube, embed
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
