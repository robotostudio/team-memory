---
title: FAQPage
impact: HIGH
impactDescription: displays FAQ accordion directly in search results
tags: json-ld, schema, seo, faq, questions, answers
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
