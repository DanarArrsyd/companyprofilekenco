# CLAUDE.md

## Project Overview

Project ini adalah website Company Profile publik untuk perusahaan manufaktur.

Sistem terdiri dari:

- Public company profile website
- Admin CMS
- SEO management
- Product management
- Manufacturing capability management
- Facility and machine management
- Certification management
- News management
- Career management
- Contact inquiry management
- Media library
- User and role management
- Activity logs

Public website dan Admin CMS harus berada dalam satu Laravel application dan satu repository.

## Primary Goals

1. Membangun company profile profesional untuk publik.
2. Memperkuat corporate branding.
3. Mendukung kebutuhan SEO.
4. Memudahkan tim internal mengelola konten melalui CMS.
5. Responsive pada desktop, tablet, dan mobile.
6. Scalable untuk pengembangan jangka panjang.
7. Memiliki codebase yang terstruktur dan mudah dirawat.

## Required Tech Stack

Backend:

- Laravel
- PHP 8.3+
- MySQL 8+

Frontend:

- Inertia.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Vite

Recommended:

- TipTap for rich text editor
- Laravel Policies
- Laravel Form Requests
- Laravel Cache
- Laravel Storage
- PHPUnit / Pest

Do not replace the selected stack without explicit instruction.

## Architecture Rules

Use:

```text
Route
→ Controller
→ Form Request
→ Action / Service
→ Model
→ Database
```

Controllers must remain thin.

Business use cases belong in:

```text
app/Actions
```

Reusable infrastructure or cross-domain functionality belongs in:

```text
app/Services
```

Examples:

```text
CreateProduct
UpdateProduct
PublishArticle

MediaService
SeoService
ImageOptimizationService
SitemapService
```

Do not put large business logic directly inside controllers.

## Application Structure

Recommended:

```text
app/
├── Actions/
├── Enums/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/
├── Models/
├── Policies/
├── Services/
└── Support/

resources/js/
├── components/
│   ├── ui/
│   ├── public/
│   └── admin/
├── layouts/
├── pages/
│   ├── public/
│   └── admin/
├── hooks/
├── lib/
└── types/
```

## Coding Principles

Always prioritize:

- readability
- maintainability
- type safety
- reusable components
- semantic naming
- accessibility
- security
- performance

Avoid unnecessary abstraction.

Do not introduce:

- microservices
- separate REST API
- separate frontend repository
- GraphQL
- Redis dependency
- complex event architecture

unless explicitly required.

## Naming

Use English throughout:

```text
products
facilities
certifications
job_vacancies
contact_inquiries
```

Do not mix Indonesian and English identifiers.

## Public Website Pages

Required:

```text
/
company
company/vision-mission
company/milestones

capabilities
capabilities/{slug}

products
products/{slug}

facilities

quality
certifications

industries

news
news/{slug}

careers
careers/{slug}

contact
```

## Admin Pages

Use `/admin`.

Required modules:

```text
Dashboard
Pages
Homepage
Products
Product Categories
Capabilities
Facilities
Machines
Certifications
Industries
News
Careers
Job Applications
Contact Inquiries
Media Library
SEO
Users
Roles
Settings
Activity Logs
```

## CMS Philosophy

Do not implement an unrestricted drag-and-drop page builder.

Use structured CMS sections.

Admin users edit content, not page layout.

Example:

```text
Homepage

Hero
Company Introduction
Statistics
Capabilities
Products
Facilities
Quality
News
Career CTA
Contact CTA
```

The frontend controls presentation and layout.

## Content Status

Use standardized content statuses:

```text
draft
published
archived
```

Use PHP Enums where appropriate.

Public queries must only expose content where:

```text
status = published
published_at <= now()
```

## Security

Implement:

- authentication
- authorization policies
- CSRF protection
- login throttling
- rate limiting
- server-side validation
- MIME validation
- upload size validation
- session regeneration
- secure password hashing
- SQL-safe ORM queries
- activity logs

Never trust client-side validation alone.

## Performance

Implement:

- responsive images
- WebP where supported
- lazy loading
- database indexes
- route/config caching
- asset bundling
- query optimization
- eager loading where necessary

Avoid premature infrastructure complexity.

## SEO

SEO is a first-class feature.

Every public entity should support appropriate metadata.

Implement:

- meta title
- meta description
- canonical URL
- OpenGraph
- structured data
- sitemap.xml
- robots.txt
- semantic HTML
- breadcrumbs
- clean URLs

## Testing

At minimum test:

- public pages
- authentication
- authorization
- content visibility
- CRUD modules
- contact form
- job applications
- SEO rendering
- sitemap generation

## Definition of Done

A feature is finished only if:

- UI is responsive
- validation exists
- authorization exists
- empty states exist
- errors are handled
- loading states are handled
- accessibility is reasonable
- TypeScript has no avoidable errors
- no debug code remains
- feature has relevant tests

## Project Working Memory

- Use Caveman communication mode by default, as defined in `AGENTS.md`.
- Treat the supplied 1532 × 852 Vision–Mission screenshot as the desktop visual reference.
- Keep Vision–Mission asymmetric: tall white polygon on the left, shorter navy polygon on the right, with aligned headings and independent text positioning.
- Keep Vision–Mission content CMS-driven; do not hardcode the displayed language or copy.
- Vision–Mission implementation lives in `resources/js/components/public/SectionRenderer.tsx`; torn-paper assets live in `public/images/vision-mission-paper-*.png`.
- Vision–Mission uses Montserrat with Inter fallback; font loading is configured in `resources/views/app.blade.php`.
- Verify visual changes at 1532 px desktop and 390 px mobile, then run `npm run build` and `php artisan test`.
- Deploy staging manually with `gh workflow run deploy-staging.yml --ref main`, then verify `https://staging.kencomanufactur.co.id/company#vision-mission`.
- Company `Who We Are` uses CMS settings `heading_font: caveat` and `layout: taped_image`; its editable 4:3 image remains in section content rather than hardcoded markup.
- The taped-image presentation lives in `resources/js/components/public/SectionRenderer.tsx`; tape assets live in `resources/img/paper_tape1.png` and `resources/img/paper_tape2.png`.
- Public scroll motion matches astra.co.id: Lenis smooth scroll (`resources/js/lib/smooth-scroll.ts`, started by `PublicLayout`, paused while the nav menu is open) plus the shared IntersectionObserver in `resources/js/hooks/use-in-view.ts` and styles in `resources/css/app.css`. Reveals are bidirectional: trigger line 150 px above the viewport bottom, fade out when content drops back below it, stay visible when it leaves through the top; 600 ms, CSS `ease` curve, `translateY(min(20%, 40px))`. Pass `useInView(t, { once: true })` for effects that must not replay (counters). Honor `prefers-reduced-motion` (Lenis and reveals both off).
- Explicit `data-reveal` elements take priority over automatic ancestor reveals to prevent compounded motion; stagger delays use 140 ms steps capped at 420 ms and apply on entry only.
- Reveal direction is position-aware: blocks sharing a row with siblings enter from their own side (left column from the left, right column from the right; images unmask from that edge), stacked or centred blocks rise from below, so single-column mobile layouts rise. Use `data-reveal="auto"` (or no attribute) for this; `html, body { overflow-x: clip }` prevents sideways scroll from the offset.
- Public desktop scales proportionally: at >=1024px `html:has(.public-site)` (class on PublicLayout) sets `font-size: clamp(13px, min(1.1111vw, 2.0513vh), 16px)`, so a MacBook viewport (1440x780) is the 16px reference and shorter/narrower laptops shrink like browser zoom (never upscaled). Public sizes must be rem, never px (`text-[4.75rem]`, not `text-[76px]`), or they won't follow; phones/tablets/admin stay 16px. Verify at 1440x780, 1528x663 and 1366x625.
- Public section layout goes through `Container` / `Section` in `resources/js/components/public/Section.tsx` (80rem column, 20/24/32 px gutters). Vertical rhythm uses the `spacing` tiers `section` (64/96/112 px), `intro` (56/64/80 px, title bands and CTA strips) and `content` (48/56/64 px, body under an intro band); never hand-write `mx-auto max-w-content px-5 …` shells or ad-hoc `py-*` on public sections. Public code must stay on the DESIGN.md palette (`navy-950/900/800/700`, `slate-700/500`, `gray-200/100`, semantic tokens, `white`), the custom type scale (`text-small`, never `text-sm`), no hex literals and rem sizes — `tests/js/style-guard.test.ts` enforces it (admin: palette + no px text sizes). `cn()` knows the custom type scale, so `cn('text-small text-white')` keeps both.
- Admin forms: `datetime-local` inputs go through `toDateTimeInput()` / `fromDateTimeInput()` (`resources/js/lib/datetime-input.ts`) so the form holds UTC ISO and the admin sees local time; never `.slice(0, 16)` a timestamp. Saving content as published without a date stamps `now()` (`HasPublishingLifecycle`). An image `*_path` key that is submitted empty removes the image; omit the key to keep it. Field guidance lives in `resources/js/lib/admin-field-help.ts` (`fieldHelp(module, field)` → `hint` under the field via `FieldHint`, `example` as placeholder, `bind(field, example)` for translatable fields); verify each hint against what the public site does. `tests/Feature/AdminSaveRoundTripTest.php` submits every Edit form's props unchanged and must leave the record untouched — extend it when adding an admin module.
- Admin auto-translate: saving with the "Auto-translate the other language on save" checkbox (ContentLocaleTabs, stored in localStorage, sent as `X-Auto-Translate: 1` by `registerAutoTranslateHeader` in app.tsx) makes `AutoTranslateChanges` fill the other locale in `HasLocalizedContent`'s saving hook. The language tab the admin saves from is the source (`X-Auto-Translate-Source`, kept current by `ContentLocaleTabs`; only forms that carry `translations` send the headers, so Publish/Archive never retranslate): every text of the other locale is regenerated from it, except text the admin also edited in the other tab in that save; an empty source never wipes the other locale. Engine: Azure Translator F0 via the `Translator` interface (`AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`); no key → option hidden. Terms that must stay as written go in `config/translation.php` `glossary`. Every auto-translated save reports its result through `App\Support\AutoTranslateReport` → flash `autoTranslate` ({status: translated|unchanged|failed, count, from, to, reason}) shown by `AutoTranslateStatus` under the language tabs; failures keep the save, carry Azure's own error code/message and also flash a warning. Settings → System → Machine translation shows key/region status and a "Test connection" button (`admin.settings.translator-test`). Tests reset `LocalizedContent` flags in `tests/TestCase.php`; fake Azure with `Http::fake()` (patterns match any host suffix). Page section `content` text is covered through `PageSection::translatableContentPaths()` (must match the `setText()` keys in `SectionContentFields.tsx`; `tests/js/section-content-paths.test.ts` checks it).
- Slugs are editable on the Edit pages of products, capabilities, news, careers, facilities, industries, quality content and the three category types (`SlugField` + `lib/slug.ts` `slugify()`, rule `sometimes|required|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/|unique ignoring self`). Pages keep locked slugs because `company` / `company/vision-mission` are system keys. Products, capabilities, articles and vacancies use `RedirectsOldSlugs`: an old slug is stored in `slug_redirects` (pointing at the model, so no chains) and the `slug.redirect` middleware on the four public show routes 301s a would-be 404 to the current slug in the same locale.
- Public footer (`PublicFooter.tsx`, user reference 2026-09-26): navy wave image `resources/img/element_footer.webp` (its navy = `navy-950`; the WebP is cropped 3 px from the PNG to drop transparent bottom rows) with the KMI mascot `footer_maskot1.webp` bottom-left (head above the wave, cut at the waist by the footer's bottom edge on desktop, below the CTA on mobile), "Connect With Us" in Montserrat + white social circles with the official brand marks (`BrandIcon.tsx`, colours `brand-linkedin/instagram/youtube`) from Settings + "Contact Us" pill on the right. The navy block has a `lg:min-h` so the mascot always fits inside the footer: never let it overflow — Safari clips overflowing content when a hover transition composites the footer. The info strip (quick links, address, email/phone, copyright) was removed on 2026-09-26; the user will redesign it. The content overlaps the wave by a vw margin (the image scales with viewport width); the navy wrapper is `flow-root` so that margin does not pull the background over the wave's arc and star.
- Public navigation follows astra.co.id: floating white logo tab (top-left, rounded bottom-right), EN/ID pill + white pill hamburger (morphs to X) top-right, and a right-side menu panel (68% width, 40 px left radius, full-screen on mobile) with accordion submenus, the 2 latest published news (`menuNews` shared prop, public requests only) and a contact footer. Lives in `resources/js/components/public/PublicNavbar.tsx`; helpers in `navbar-scroll.ts`.
- Bilingual site (phases 1 URL/locale, 2 UI strings, 3 translatable CMS storage, 4 admin EN/ID tabs and 5 Indonesian drafts of existing content done; drafts come from `database/migrations/2026_09_25_000002_add_indonesian_drafts_for_existing_content.php`, which only fills text whose English is unchanged and has no Indonesian yet, for admin review): Bahasa Indonesia is the default at `/`, English at `/en/...` (same slugs). `SetLocale` resolves the locale from the path (admin is always `en`); public routes are registered once per locale in `routes/web.php` (`public.*` and `en.public.*`). Every public link must go through `useLocale().localize()` / `localizedRoute()` (frontend) or `App\Support\Locale::path()` (backend) — never hardcode `/products`-style hrefs. SeoHead emits `hreflang` id/en/x-default; the sitemap lists both locales. Brand name, legal name, tagline and product/certification names are never translated. UI text uses English source strings as keys: `t('Contact Us')` in React (`useLocale()`), `__('Contact Us')` in PHP, both reading `lang/id.json` (English needs no catalogue). Every new `t()` literal in public code needs an `lang/id.json` entry — `tests/js/i18n.test.ts` fails otherwise. Indonesian validation lives in `lang/id/validation.php`. Dates/numbers go through `formatDate()` / `intlLocale()`. CMS text is stored per locale via `spatie/laravel-translatable` (JSON `{"en","id"}` in TEXT columns) through `App\Models\Concerns\HasLocalizedContent` + a `$translatable` list on 16 models; reads and Inertia serialization return the current locale with English fallback and NULL stays null; `translationsFor()` returns every locale for admin forms. Product names, certification/machine/customer data, facility location and vacancy department/employment type stay single-value. `PageSection.content` keeps shared data plain and allows inline `{"en","id"}` text values resolved by `App\Support\LocalizedContent`. Tests query translatable columns with JSON paths (`where('title->en', …)`). Admin editing: `SetLocale` turns on `LocalizedContent::$serializeAllLocales` for /admin, so models serialize a `translations.id` object (and PageSection content stays raw); forms submit `translations.id.<field>` (SEO: `seo.translations.id.*`), FormRequests add rules via `ValidatesTranslations::withTranslations()`, and `HasLocalizedContent::fill()` applies them, so plain `create()/update()` stores every locale — a blank translation is removed. Frontend: `ContentLocaleTabs` + `translatableBinder()`/`translatableError()` from `resources/js/lib/translatable-form.ts`; section content text uses `readText()/writeText()`. Relations serialize snake_case — admin forms must read `seo_metadata`, never `seoMetadata`.
- Security baseline: `SecurityHeaders` middleware sets a nonce CSP (Vite + Ziggy `@routes` carry the nonce; add new third-party origins to its allowlist), nosniff, SAMEORIGIN framing, Referrer/Permissions policies and HTTPS-only HSTS. Article HTML is sanitized on write by `RichTextSanitizer` (Article `content` mutator). Uploads are stored with the content-sniffed extension, never the client one. Guests get only the `public` Ziggy route group. The app sits behind Hostinger's CDN without `trustProxies`, so do not add global per-IP throttles until proxies are configured.
- Latest staging release is commit `5db673f` (run `36212151282`, adds active-tab auto-translate with per-save status + translator test, and editable slugs with redirects; CSS audit, admin CRUD fixes and field hints, auto-translate phases 1–2 with the Azure key in staging `application/.env` since 2026-09-26, homepage ends after Latest News, Connect-With-Us footer without its info strip). After changing `.env` on staging, redeploy so `config:cache` picks it up. Favicon: head links the Settings favicon, and Settings saves plus deploy (`favicon:publish --web-root`) copy it to the web root as a real `favicon.ico`, because Hostinger's edge serves `/favicon.ico` statically. The staging front controller calls `usePublicPath(public_html)`, so `public_path()` is the web root on staging. User confirmed Astra-style motion, navbar/menu, admin spacing, sticky admin sidebar, security hardening and responsive menu on MacBook and Windows as the project UI/UX standard.

## Companion Specifications

Read [AGENTS.md](AGENTS.md), [DESIGN.md](DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE.md](DATABASE.md), [SEO.md](SEO.md), and [SKILL.md](SKILL.md) together. Public SEO requires the initial-HTML rendering acceptance criteria in SEO.md and the production runtime described in ARCHITECTURE.md.
