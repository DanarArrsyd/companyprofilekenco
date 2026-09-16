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

## Implementation (Phase 10)

This section documents what is actually implemented, as of Phase 10 —
Technical SEO + SEO Manager + Structured Data + Sitemap + Robots. Keep it in
sync with the code; it is not a spec, it is a description of current state.

**Known gap — Inertia SSR is not yet implemented.** Every rule below about
metadata, canonical URLs, and structured data is fully correct and tested at
the Inertia-props level (`php artisan test`, and manual verification of the
hydrated DOM), and is served correctly to real browsers and any crawler that
executes JavaScript. Without SSR, however, the *raw* initial HTML response
does not yet contain the resolved `<title>`, meta tags, or JSON-LD — those
are injected client-side after hydration. This matters most for crawlers
that don't execute JS (most social-media link-preview scrapers) and for the
"Initial HTML and Indexability Acceptance" section above. Implementing SSR is
a production-deployment-runtime change (see ARCHITECTURE.md's "Production
Rendering and Operations") and was intentionally left out of this phase's
scope — it should be done before the site is actually deployed to production,
as its own reviewed change.

### Metadata resolution — `App\Services\SeoService`

Every public controller resolves metadata through one of three methods —
none of them hand-build a metadata array:

- `resolve($model, $fallbackTitle, $fallbackDescription = null, $entityImage = null, $ogType = 'website')`
  — for model-backed detail pages (Product, Capability, Article, JobVacancy,
  Page). `$model` must use the `HasSeoMetadata` trait.
- `resolveStatic($title, $description = null, $image = null)` — for
  listing/static pages with no SEO-metadata record of their own (Products
  index, Facilities, Quality, Certifications, Industries, News index,
  Careers index, Contact).
- `homepage($page = null)` — homepage title is the company name alone (or
  the Homepage `Page`'s own SEO override), never duplicated with a separator.
- `preview($title)` — always `noindex, nofollow`, used by every admin
  preview route.

**Fallback order** (`SeoService::finalize()` is the single place this is
applied):

```text
META TITLE:      SEO override → "{fallback title} {separator} {Company Name}"
META DESCRIPTION: SEO override → controller-provided fallback (e.g. excerpt/summary) → Settings default
OG TITLE:         OG override → resolved meta title
OG DESCRIPTION:   OG override → resolved meta description
OG IMAGE:         SEO og_image → entity image (featured_image etc.) → Settings default OG image
TWITTER:          twitter_card/title/description/image always mirror the OG values (no per-entity
                   Twitter override fields — this is a B2B site with no need for Twitter-specific
                   copy; card type defaults to summary_large_image when an image is present)
ROBOTS:           SEO override (robots_index/robots_follow) → Settings default → forced
                   noindex,nofollow outside production, unconditionally, last
```

The title separator ("|" by default) and the site-wide default robots value
are both configurable at Settings → SEO.

An explicit SEO `meta_title` override is used **verbatim** — it does not get
the "| Company Name" suffix appended a second time; only the *derived*
fallback title gets that treatment. (`resources/js/app.tsx`'s global Inertia
title callback also guards against double-appending the company name for any
title that already ends with it.)

### Canonical URLs

Default canonical = the current request's full absolute URL (including any
query string, e.g. `?category=...`), scheme forced to `https` in production.
This deliberately does **not** strip query parameters or collapse paginated/
filtered URLs to page 1 — doing so would treat genuinely distinct filtered
content (a category-filtered news list, a specific page of results) as
duplicates, which is the wrong trade-off for this site's scale. An admin can
override the canonical per entity via the SEO panel's "Canonical URL
override" field.

### Robots

- Published public pages: `index, follow` by default (or the Settings
  default), unless a per-page SEO override says otherwise.
- Draft/unpublished preview routes (`/admin/.../preview`): always
  `noindex, nofollow` (`SeoService::preview()`).
- `/admin/*` and `/admin/login`: server-rendered `<meta name="robots"
  content="noindex, nofollow">` directly in `resources/views/app.blade.php`
  (present in the raw HTML regardless of JS/SSR, since admin never uses
  `SeoHead`).
- **Any non-production environment** (`app()->environment('production')` is
  false): every public page is forced to `noindex, nofollow`, unconditionally,
  inside `SeoService::finalize()` — this is the single source of truth for
  that rule, so it can never end up as a second, conflicting `<meta
  name="robots">` tag alongside the per-page one.

### `/robots.txt` — `App\Http\Controllers\Public\RobotsController`

Dynamic route (no static `public/robots.txt` file — it was removed so the
route actually gets hit), environment-aware:

- **Production**: `Allow: /`, `Disallow: /admin`, `Disallow: /login`, and a
  `Sitemap:` line pointing at `/sitemap.xml`.
- **Everything else** (local/staging/testing): `Disallow: /` — a forgotten
  environment checkbox can never get a non-production deploy indexed.

### `/sitemap.xml` — `App\Http\Controllers\Public\SitemapController`

Built entirely from the database on every request (no hardcoded slug lists),
cached for 30 minutes (`Cache::remember('sitemap.xml', ...)`). Includes:

- Homepage (`lastmod` = the Homepage `Page`'s `updated_at`)
- Every published Standard `Page` under `company` or `company/*` (dynamic —
  whatever the admin actually publishes there, not a hardcoded list)
- `/products` + every published product detail URL
- `/capabilities` + every published capability detail URL
- `/facilities`, `/quality`, `/certifications`, `/industries` (index-only —
  no detail routes exist for these)
- `/news` + every published article detail URL
- `/careers` + every published **and currently open** (`closes_at` null or
  future) job vacancy detail URL — closed vacancies are excluded
- `/contact`

`lastmod` uses each record's real `updated_at` (or the max `updated_at`
across a listing page's items); it is never set to "now" on every request.
Never included: `/admin/*`, `/login`, drafts, archived content, or preview
URLs.

### Structured data (JSON-LD) — `App\Services\StructuredDataService`

Rendered via `resources/js/components/public/SeoHead.tsx`'s `schema` prop,
which calls `jsonLdScripts()` (a plain function, not a React component — see
that file's comment for why: Inertia's `<Head>` inspects its children's
element `type` directly without ever invoking function components, so a
`<JsonLd/>` component child would silently serialize to nothing).

| Page | Schema |
|---|---|
| Homepage | `Organization` + `WebSite` |
| Product detail | `BreadcrumbList` |
| Capability detail | `BreadcrumbList` + `Service` |
| Article detail | `BreadcrumbList` + `NewsArticle` |
| Job vacancy detail | `BreadcrumbList` (always) + `JobPosting` (only when the vacancy is currently open **and** has a real description — Google requires removing JobPosting markup once a posting closes, and a schema with no real description is worse than no schema) |

`BreadcrumbList` is generated from the exact same `breadcrumb` array the
`<Breadcrumb>` UI component renders (built once, server-side, in the
controller, and passed down as a prop) — there is only one breadcrumb
hierarchy, not two independently-maintained ones.

Every schema builder (`StructuredDataService`) only emits properties backed
by real data (`prune()` strips null/empty values recursively) — no invented
`foundingDate`, `numberOfEmployees`, salary, or ratings. `Product` schema was
deliberately **not** implemented: this is a B2B manufacturing showcase with
no price/offers data, and schema.org `Product` markup without that would be
misleading; `Capability` maps to `Service` instead, which fits the data that
actually exists.

### Admin SEO Manager

- **Settings → SEO** (`resources/js/pages/admin/settings/Edit.tsx`): Default
  Meta Title, Default Meta Description, Default OG Image, Title Separator,
  Default Robots (index,follow / noindex,follow / noindex,nofollow — a
  constrained select, not free text), Twitter/X Card Type, Twitter/X
  Username. Site Name is not duplicated here — it reuses the existing
  General tab's Company Name.
- **Per-entity override** — Page, Product, Capability, Article (News),
  JobVacancy (Careers) each have a reusable `SeoFields` panel
  (`resources/js/components/admin/SeoFields.tsx`) on their Create/Edit forms:
  Meta Title (with a "60 chars recommended" counter, not a hard block), Meta
  Description (160 chars), Canonical URL override, Robots (select), OG
  Title, OG Description, OG Image (via the existing `MediaPickerField` —
  choose from the Media Library or upload new), and a lightweight SERP
  preview (URL / title / description) above the fields. Facility and
  Industry do not have this panel — neither has a public detail page, so a
  per-entity SEO override would have nothing to attach to.
- Every Create/Update Action for these five entities funnels its `seo.*`
  input through `SeoService::saveMetadata()` — the one place that resolves
  an uploaded OG image file vs. a Media Library path vs. leaving the
  existing image untouched, and upserts the `seo_metadata` row. No
  controller or Action hand-builds that upsert anymore.

### Image fallback

OG/Twitter image resolution always produces an **absolute** URL
(`url(Storage::disk('public')->url($path))`) or `null` — never a bare
relative `/storage/...` path, since social crawlers require absolute image
URLs. An already-absolute admin-entered URL passes through unchanged.
