---
title: JSON-LD Audit
impact: CRITICAL
impactDescription: discovers missing structured data across an entire Next.js project
tags: json-ld, schema, seo, audit, analysis, implementation-plan, routes
---

## JSON-LD Audit

Scan a Next.js App Router project to discover all routes, determine which JSON-LD types apply to each, detect existing implementations, and produce a prioritized implementation plan.

### When to Use

- Starting SEO work on a new or existing Next.js project
- Auditing structured data coverage before a site launch
- Reviewing which routes are missing JSON-LD after adding new pages
- When asked to "audit", "assess", or "review" structured data

### Phase 1: Route Discovery

Scan the project's `app/` directory for all `page.tsx` and `layout.tsx` files. Build a route map:

1. **Find all route files**:
   ```bash
   # Glob for page and layout files
   app/**/page.tsx
   app/**/layout.tsx
   ```

2. **Compute URL paths** from file paths:
   - Strip `app/` prefix and `/page.tsx` or `/layout.tsx` suffix
   - Strip route group parentheses: `(marketing)/about` → `about`
   - Preserve dynamic segments: `blog/[slug]` stays as-is
   - Preserve catch-alls: `[...slug]` stays as-is

3. **Handle special Next.js patterns**:
   - **Route groups** `(group)` — remove from URL path, keep in file path references
   - **Parallel routes** `@folder` — skip these, they don't create URL routes
   - **Intercepting routes** `(.)`, `(..)` — skip these
   - **Private folders** `_folder` — skip these

4. **Output**: A table of `File Path → URL Path → Type (page|layout)`

### Phase 2: Route Classification

Map each discovered route to applicable JSON-LD types using two tiers.

#### Tier A — Path Pattern Matching

Match URL paths against these patterns. A route can match multiple types.

| URL Pattern | JSON-LD Types | Rule Files |
|-------------|---------------|------------|
| Root `layout.tsx` | Organization, WebSite | `org-organization`, `nav-website` |
| Root `layout.tsx` (if site has nav) | SiteNavigationElement | `nav-site-navigation` |
| Any nested layout or page | BreadcrumbList | `nav-breadcrumb-list` |
| `/blog/[slug]`, `/posts/[slug]`, `/news/[slug]` | BlogPosting | `content-blog-posting` |
| `/blog`, `/posts`, `/news` (index) | Article (for listing pages) | `content-article` |
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

#### Tier B — Content Analysis

For routes that don't match any Tier A pattern (e.g., `/pricing`, `/[...slug]` catch-all), read the page component and look for:

- **CMS data fetches**: Function names like `getPost()`, `getProduct()`, `getEvent()` suggest content types
- **Component imports**: `VideoPlayer`, `ProductCard`, `FAQAccordion`, `RecipeCard` suggest schema types
- **Content patterns**: Lists of Q&A pairs → FAQPage, numbered steps → HowTo, price/rating → Product
- **TypeScript types**: Imported types from CMS (e.g., `Post`, `Product`) indicate content type

If a route still cannot be classified, flag it as "Unclassified — manual review needed" in the output.

### Phase 3: Existing JSON-LD Detection

For each route file, scan for existing JSON-LD implementations:

1. **Direct script tags**: Search for `application/ld+json` in the file
2. **schema-dts imports**: Search for `from 'schema-dts'` or `from "schema-dts"`
3. **JSON-LD component imports**: Search for imports of shared JSON-LD components (e.g., `JsonLd`, `StructuredData`, `SchemaMarkup`)
4. **Extract @type values**: From any detected JSON-LD, extract the `@type` property to identify which schema types are already implemented

Also check `layout.tsx` files in parent directories — JSON-LD in a layout applies to all child routes.

Mark each route as:
- **Complete** — all recommended types are implemented
- **Partial** — some types implemented, others missing
- **Missing** — no JSON-LD found

### Phase 4: Plan Output

Generate the audit report at `docs/plans/YYYY-MM-DD-json-ld-audit.md` in the target project:

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
| `/` | `app/layout.tsx` | Organization | Organization, WebSite, SiteNavigationElement | Partial |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | BlogPosting, BreadcrumbList | BlogPosting, BreadcrumbList | Complete |
| `/products/[id]` | `app/products/[id]/page.tsx` | — | Product, BreadcrumbList | Missing |
| `/faq` | `app/faq/page.tsx` | — | FAQPage, BreadcrumbList | Missing |

## Implementation Plan

Ordered by impact priority. Each item references the rule file containing
the full implementation pattern and code example.

### CRITICAL Priority

1. **Add WebSite to root layout** (`app/layout.tsx`)
   - Schema: `WebSite` — enables sitelinks search box
   - Rule: `nav-website` → see `rules/nav-website.md`

2. **Add BreadcrumbList to nested layouts** (`app/blog/layout.tsx`, etc.)
   - Schema: `BreadcrumbList` — breadcrumb trail in SERPs
   - Rule: `nav-breadcrumb-list` → see `rules/nav-breadcrumb-list.md`

### HIGH Priority

3. **Add FAQPage to /faq** (`app/faq/page.tsx`)
   - Schema: `FAQPage` — FAQ accordion in SERPs
   - Rule: `interactive-faq-page` → see `rules/interactive-faq-page.md`

### MEDIUM Priority

4. **Add Product to /products/[id]** (`app/products/[id]/page.tsx`)
   - Schema: `Product` — product snippet with price/rating
   - Rule: `ecom-product` → see `rules/ecom-product.md`

### LOW Priority
...

### Unclassified Routes
Routes that could not be automatically classified:
- `/pricing` (`app/pricing/page.tsx`) — manual review needed

## Next Steps

Run the implementation phase to auto-generate JSON-LD for each route.
Ensure `schema-dts` is installed: `npm install schema-dts`
```

### Phase 5: Implementation

After presenting the plan, offer to implement. If the user accepts:

1. **Install prerequisite**: Ensure `schema-dts` is in the project's dependencies
2. **Batch by priority**: Implement CRITICAL items first, then HIGH, MEDIUM, LOW
3. **One subagent per route**: Each implementation is independent. The subagent should:
   - Read the referenced rule file (e.g., `rules/ecom-product.md`) for the complete implementation pattern
   - Read the target route file to understand existing data fetching and component structure
   - Adapt the rule's code example to the route's actual data sources and props
   - Add the JSON-LD `<script>` tag within the component's return JSX
   - Add `schema-dts` type imports
   - Apply XSS sanitization: `.replace(/</g, '\\u003c')`
   - Preserve any existing JSON-LD — do not duplicate types already present
4. **Re-audit**: After all implementations, re-run phases 1–3 to confirm coverage and report results

### Checklist

- [ ] Discover all routes in `app/` directory
- [ ] Classify each route using Tier A patterns, then Tier B for unmatched
- [ ] Detect existing JSON-LD in each route and parent layouts
- [ ] Generate audit report at `docs/plans/YYYY-MM-DD-json-ld-audit.md`
- [ ] Present plan to user for review
- [ ] If approved, implement using subagents batched by priority
- [ ] Re-audit to confirm coverage
