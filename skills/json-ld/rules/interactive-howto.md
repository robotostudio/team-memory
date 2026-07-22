---
title: HowTo
impact: MEDIUM
impactDescription: enables step-by-step rich result in Google
tags: json-ld, schema, seo, howto, tutorial, guide, steps
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
