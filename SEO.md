# SEO.md

## Objective

SEO must be treated as a core platform feature.

Primary goals:

- indexable corporate pages
- discoverable products/capabilities
- strong branded search presence
- correct social sharing
- crawlable news
- clean technical SEO

## Metadata

Every relevant public page should support:

```text
meta title
meta description
canonical URL
OpenGraph title
OpenGraph description
OpenGraph image
robots index
robots follow
```

## Fallback Strategy

Example:

```text
Custom SEO Title
↓
Content Title + Company Name
↓
Global Default
```

Descriptions may fall back to summary/excerpt.

## Required Technical SEO

Implement:

```text
sitemap.xml
robots.txt
canonical tags
OpenGraph
Twitter metadata
semantic HTML
breadcrumbs
clean slugs
structured data
```

## Structured Data

Recommended Schema.org types:

```text
Organization
WebSite
BreadcrumbList
Article
JobPosting
Product
```

Use `Product` schema carefully because this is B2B manufacturing, not ecommerce.

## Sitemap

Include:

- static pages
- published products
- published capabilities
- published news
- active careers

Exclude:

- drafts
- archived content
- admin
- private preview URLs

## Performance

SEO performance priorities:

- optimized images
- proper dimensions
- lazy loading below fold
- minimal render-blocking assets
- good Core Web Vitals
- responsive layout

## Content Rules

Each important page should have:

- exactly one meaningful H1
- logical heading order
- descriptive title
- internal links
- meaningful image alt text
- unique metadata where possible

Do not stuff keywords.

## Initial HTML and Indexability Acceptance

Indexable public pages must return their meaningful content, title, description,
canonical URL, and relevant structured data in the initial HTML response.
Implement and verify Inertia SSR as described in [ARCHITECTURE.md](ARCHITECTURE.md);
client navigation alone is not the SEO acceptance test.

- Test a direct request to a public detail URL with JavaScript disabled.
- Verify metadata on both direct requests and Inertia navigation.
- Keep drafts, future publications, archived and deleted records out of public
  listings, search, related content, and sitemaps.
- Protect previews with authorization and use noindex; robots.txt is not access control.
- Use only canonical, indexable URLs in the sitemap.
- Return an actual 404 for unavailable content; redirect changed published slugs
  permanently to their replacement where a replacement exists.
- Avoid indexing internal search results and redundant filter combinations.
- Render structured data from verified content; do not invent ratings, prices,
  company metrics, certifications, or job details.
- Exclude closed vacancies from the active-career sitemap and remove active
  JobPosting markup when the vacancy closes.
