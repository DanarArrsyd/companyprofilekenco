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
- Vision–Mission implementation lives in `resources/js/components/public/SectionRenderer.tsx`; torn-paper assets live in `public/images/vision-mission-paper-{top,bottom}{,-1200}.webp` (WebP from the 991 KB PNG originals, served with a 1200w/2331w srcset).
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
- Admin redesign (user-approved mockup https://claude.ai/artifact/2r6mLn2LLT3FshLCptgJ7d, 2026-09-29; plans in `docs/superpowers/plans/2026-09-29-admin-redesign-*`): admin copy is Bahasa Indonesia (identifiers/routes/permissions stay English); the sidebar (`resources/js/lib/admin-nav.ts` → `adminNavSections`) is grouped by website page — (top) Dasbor · Halaman Website · Konten · Data Master / Opsi (every option list forms pick from) · Sistem; entries are a link or a collapsible group, never change route names (`tests/Feature/AdminNavRoutesTest.php`, `tests/js/admin-nav.test.ts`). Status values and section types stay locked (only their labels may become editable). Next phases: uniform Edit template (content cards left, sticky panel right with status + one Save for everything + preview + "Tampil di website"), Data Master CRUD for departments / employment types / work locations with quick-add from forms, status labels. Capability machines: public pages only show published machines; the edit form also lists attached unpublished ones (badge "Nonaktif") so they can be detached.
- Admin forms: `datetime-local` inputs go through `toDateTimeInput()` / `fromDateTimeInput()` (`resources/js/lib/datetime-input.ts`) so the form holds UTC ISO and the admin sees local time; never `.slice(0, 16)` a timestamp. Saving content as published without a date stamps `now()` (`HasPublishingLifecycle`). An image `*_path` key that is submitted empty removes the image; omit the key to keep it. Field guidance lives in `resources/js/lib/admin-field-help.ts` (`fieldHelp(module, field)` → `hint` under the field via `FieldHint`, `example` as placeholder, `bind(field, example)` for translatable fields); verify each hint against what the public site does. `tests/Feature/AdminSaveRoundTripTest.php` submits every Edit form's props unchanged and must leave the record untouched — extend it when adding an admin module.
- Admin auto-translate: saving with the "Auto-translate the other language on save" checkbox (ContentLocaleTabs, stored in localStorage, sent as `X-Auto-Translate: 1` by `registerAutoTranslateHeader` in app.tsx) makes `AutoTranslateChanges` fill the other locale in `HasLocalizedContent`'s saving hook. The language tab the admin saves from is the source (`X-Auto-Translate-Source`, kept current by `ContentLocaleTabs`; only forms that carry `translations` send the headers, so Publish/Archive never retranslate): every text of the other locale is regenerated from it, except text the admin also edited in the other tab in that save; an empty source never wipes the other locale. Engine: Azure Translator F0 via the `Translator` interface (`AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`); no key → option hidden. Terms that must stay as written go in `config/translation.php` `glossary`. Every auto-translated save reports its result through `App\Support\AutoTranslateReport` → flash `autoTranslate` ({status: translated|unchanged|failed, count, from, to, reason}) shown by `AutoTranslateStatus` under the language tabs; failures keep the save, carry Azure's own error code/message and also flash a warning. Settings → System → Machine translation shows key/region status and a "Test connection" button (`admin.settings.translator-test`). Tests reset `LocalizedContent` flags in `tests/TestCase.php`; fake Azure with `Http::fake()` (patterns match any host suffix). Page section `content` text is covered through `PageSection::translatableContentPaths()` (must match the `setText()` keys in `SectionContentFields.tsx`; `tests/js/section-content-paths.test.ts` checks it).
- Slugs are editable on the Edit pages of products, capabilities, news, careers, facilities, quality content and the three category types (`SlugField` + `lib/slug.ts` `slugify()`, rule `sometimes|required|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/|unique ignoring self`). Pages keep locked slugs because `company` / `company/vision-mission` are system keys. Products, capabilities, articles and vacancies use `RedirectsOldSlugs`: an old slug is stored in `slug_redirects` (pointing at the model, so no chains) and the `slug.redirect` middleware on the four public show routes 301s a would-be 404 to the current slug in the same locale.
- Public footer (`PublicFooter.tsx`, user reference 2026-09-26): navy wave image `resources/img/element_footer.webp` (its navy = `navy-950`; the WebP is cropped 3 px from the PNG to drop transparent bottom rows) with the KMI mascot `footer_maskot1.webp` bottom-left (head above the wave, cut at the waist by the footer's bottom edge on desktop, below the CTA on mobile), "Connect With Us" in Montserrat + white social circles with the official brand marks (`BrandIcon.tsx`, Simple Icons 13.21.0; colours `brand-linkedin/instagram/youtube/facebook/whatsapp/mono`) from the Settings `social_links` list (2026-09-29: an ordered list of `{platform, url, label}` — linkedin, instagram, youtube, facebook, tiktok, x, whatsapp, threads, or `other` named by its label with a globe icon; `lib/social-links.ts` must match `UpdateSettingsRequest::SOCIAL_PLATFORMS`; posted with `social_links_sent`; every url also feeds Organization `sameAs`) + "Contact Us" pill on the right. The navy block has a `lg:min-h` so the mascot always fits inside the footer: never let it overflow — Safari clips overflowing content when a hover transition composites the footer. The info strip (quick links, address, email/phone) was removed on 2026-09-26; since 2026-10-04 a credit line "Copyright {company} | Developed by Eka Danar Arrasyid" sits bottom-right on desktop and as its own bar under the mascot on phones (`DEVELOPER` constant; the name is never translated). The content overlaps the wave by a vw margin (the image scales with viewport width); the navy wrapper is `flow-root` so that margin does not pull the background over the wave's arc and star.
- Operating Values (user reference 2026-09-28): CMS section type `operating_values` on the `company/vision-mission` page, so it renders right under Vision & Mission on /company (`#values`). Content: `heading`, `description`, `eyebrow` ("What is??", Caveat), `items[]` of `{letter, title, description, icon}`; titles stay English in both languages because their letters spell K.E.N.C.O, only `items.*.description` is translatable. `OperatingValues.tsx` (wheel redesigned 2026-09-29 from the user's artwork `resources/design/reference/wheelie_value.png`, kept only as the reference): an SVG wheel (`ValueWheel`, geometry in `resources/js/lib/value-wheel.ts`, tested by `tests/js/value-wheel.test.ts`) of coloured outer bands carrying each title on an arc + pastel slices with the icon (uploaded `icon`, else a Lucide stand-in) around a still hub with `people_wheel.png`; it turns 360/n° per step, always the short way (unbounded `turn`), to bring the active value to the RIGHT, facing the text; labels on the lower half crossfade to an anticlockwise arc so they always read upright. Item `color` (CMS select: green/yellow/red/blue/grey, default = design order) maps to `--color-value-*` / `--color-value-*-soft` tokens in `app.css`. The `elemen_values` arc + star are anchored to the wheel in %, the acronym letters are tabs (letters up to the active one navy) with the active title/description; clicking a slice or letter, ‹ › buttons, arrow keys and swipes move, wrapping around, no autoplay, every value stays in the DOM; the SVG is aria-hidden (the tabs carry keyboard/screen-reader access). Seeded by migration `2026_09_28_000001_add_operating_values_section`.
- Page loader (user reference 2026-09-28, reworked after the user's screen recording the same evening): public full loads and Inertia visits to another public page show a navy (`navy-950`) curtain with the brush (`public/images/loader/brush.webp`, white at full alpha shown at 5% opacity) and the white logo (`logo-white.webp`; sources `resources/design/loader/brush_load.png`, `logo_kmi_white.png`), and the Uiverse "speeder" runner (ported to em in `app.css`) on a hairline rail exactly as wide as the logo, both ends feathered with a mask. The runner's position IS the real load progress (no CSS laps: a looping lap made the runner reappear on the left for a frame before the curtain left, and fixed holds felt fake): `page-loader-progress.ts` renders every frame from `stepProgress()` in `page-loader-rules.ts` — milestones set a floor (boot: CSS `is-booting` stretch to 12% until the app script runs, then script 0.2 → mounted 0.45 → fonts 0.6 → window load done; visits: request 0.12 → response/page swap 0.7 → the new page's on-screen images up to 0.95 → done), between milestones it creeps toward 0.9 (slower as it nears, so a slow network is a crawl, never a stop or a fake finish), the shown value follows smoothly capped at 1.5 rails/s, never goes backwards, and on done it runs off the right end once; then the curtain slides out to the right (950 ms easeInOutQuint, logo/brush lag 30% and fade). A progress fill (scaleX) under the runner tracks the head. Caps: boot 8 s, images 4 s; a hidden tab finishes at once. Visits: the curtain slides in from the left (750 ms), the visit (cancelled in Inertia's `before` event) is replayed once the curtain is ~93% across so the swap always lands on a closed curtain. Markup is in `app.blade.php` (public components only, never admin/error pages) so it paints before JS. Filters, pagination, same-page hashes, language switches, prefetches and partial reloads are never covered (`page-loader-rules.ts`, tested with the progress model in `tests/js/page-loader.test.ts`). `html.page-loading` locks scroll, stops Lenis and holds `.scroll-reveal` blocks in their start state so reveals play as the curtain opens. Reduced motion: no runner motion (it stands mid-rail), 200 ms fades.
- Operating hours (Settings → Contact, 2026-09-29): a schedule of rows `{from, to, open, close}` (days `mon`…`sun`, 24-hour `HH:MM`), stored as JSON in the `operating_hours` setting (SettingsService type `list`; anything else reads as an empty list) and shared as `siteSettings.operating_hours` (rows or null). `resources/js/lib/opening-hours.ts` words it per locale via Intl ("Senin – Kamis · 08.00 – 16.00" / "Monday – Thursday · 08:00 – 16:00") and lists uncovered days as closed (`t('Closed')`). Admin editor `OperatingHoursField` (rows + live preview); the FormData post carries `operating_hours_sent` so removing every row clears it. Validation: close after open, end day not before start day, max 7 rows.
- Customers Served (2026-09-29): the homepage section after Quality shows `customers` in two drifting logo rows by `segment` (`App\Enums\CustomerSegment`: `stamping` = "Stamping Production" on top, `engineering` = "Engineering Production" below; names stay English; an empty segment hides its row; shared as `customers.{stamping,engineering}`) with NO links and no "view all" — it replaced "Industries Served" on the homepage. `CustomerLogos.tsx` + `.logo-marquee` CSS: transparent logos (no tiles; `mix-blend-mode: multiply` on each item turns a logo's white box into the page colour, which needs the track's `background-color: rgb(var(--background))` because the moving track is its own compositing group — keep both if the section background changes), grayscale at 55% opacity until hovered/tapped, right-to-left infinite loop (list repeated to ≥8 per loop, loop rendered twice, track -50%, 3.2 s per logo), paused on hover, edges masked, reduced motion = one still wrapping row; screen readers get each customer once. `is_featured` = shown, `order` = position within its segment, logo = `logo_media_id` Media item, a customer without a logo shows its name. Industries were retired entirely on 2026-09-30 (user decision): no /company section, no admin module, no model/permissions; migration `2026_09_30_000001_drop_industries` drops the table, deletes its `industries/` images and detaches its activity-log subjects; `/industries` 301s to `/company`. Older data migrations skip tables that no longer exist. Admin module Halaman Website → Pelanggan (`admin.customers*`, `CustomerController` + `SaveCustomer` action: upload creates a Media item, a picked library path reuses one, empty `logo_path` removes; list reorder via `admin.customers.reorder`), permissions `customers.view/create/update/delete` created by migration `2026_09_29_000003_add_customer_permissions` (Super Admin all, Content Admin no delete) and in `RolePermissionSeeder`.
- Public navigation follows astra.co.id: floating white logo tab (top-left, rounded bottom-right), EN/ID pill + white pill hamburger (morphs to X) top-right, and a right-side menu panel (68% width, straight left edge since the user reference of 2026-10-04, full-screen on mobile) with accordion submenus, the 2 latest published news (`menuNews` shared prop, public requests only) and a centred "Copyright {company}" bar; beside it the page itself shows through the dimmed backdrop (a footer-like mascot artwork there was removed on 2026-10-04 because it read as the page jumping to the footer). Lives in `resources/js/components/public/PublicNavbar.tsx`; helpers in `navbar-scroll.ts`. Opening the menu (like astra.co.id) only sets body `overflow-y: hidden` and leaves Lenis running — never stop Lenis or move the body (`position: fixed` + `top` + `scrollTo` restore made Safari jump to the footer); the classic scrollbar it hides (Safari/Windows show our styled 10 px one) is replaced by body `padding-right` (`getBodyScrollLockStyles`) and `--scrollbar-compensation` shifts the fixed controls back, so the footer wave/mascot and centred content never widen or jump on open/close.
- Bilingual site (phases 1 URL/locale, 2 UI strings, 3 translatable CMS storage, 4 admin EN/ID tabs and 5 Indonesian drafts of existing content done; drafts come from `database/migrations/2026_09_25_000002_add_indonesian_drafts_for_existing_content.php`, which only fills text whose English is unchanged and has no Indonesian yet, for admin review): Bahasa Indonesia is the default at `/`, English at `/en/...` (same slugs). `SetLocale` resolves the locale from the path (admin is always `en`); public routes are registered once per locale in `routes/web.php` (`public.*` and `en.public.*`). Every public link must go through `useLocale().localize()` / `localizedRoute()` (frontend) or `App\Support\Locale::path()` (backend) — never hardcode `/products`-style hrefs. SeoHead emits `hreflang` id/en/x-default; the sitemap lists both locales. Brand name, legal name, tagline and product/certification names are never translated. UI text uses English source strings as keys: `t('Contact Us')` in React (`useLocale()`), `__('Contact Us')` in PHP, both reading `lang/id.json` (English needs no catalogue). Every new `t()` literal in public code needs an `lang/id.json` entry — `tests/js/i18n.test.ts` fails otherwise. Indonesian validation lives in `lang/id/validation.php`. Dates/numbers go through `formatDate()` / `intlLocale()`. CMS text is stored per locale via `spatie/laravel-translatable` (JSON `{"en","id"}` in TEXT columns) through `App\Models\Concerns\HasLocalizedContent` + a `$translatable` list on 16 models; reads and Inertia serialization return the current locale with English fallback and NULL stays null; `translationsFor()` returns every locale for admin forms. Product names, certification/machine/customer data, facility location and vacancy department/employment type stay single-value. `PageSection.content` keeps shared data plain and allows inline `{"en","id"}` text values resolved by `App\Support\LocalizedContent`. Tests query translatable columns with JSON paths (`where('title->en', …)`). Admin editing: `SetLocale` turns on `LocalizedContent::$serializeAllLocales` for /admin, so models serialize a `translations.id` object (and PageSection content stays raw); forms submit `translations.id.<field>` (SEO: `seo.translations.id.*`), FormRequests add rules via `ValidatesTranslations::withTranslations()`, and `HasLocalizedContent::fill()` applies them, so plain `create()/update()` stores every locale — a blank translation is removed. Frontend: `ContentLocaleTabs` + `translatableBinder()`/`translatableError()` from `resources/js/lib/translatable-form.ts`; section content text uses `readText()/writeText()`. Relations serialize snake_case — admin forms must read `seo_metadata`, never `seoMetadata`.
- Manufacturing Capabilities (user reference 2026-10-04): the homepage `capabilities` section and /capabilities both render `CapabilityShowcase.tsx` — large Montserrat heading + intro (homepage: section `heading`/`description`, falling back to the `Manufacturing Capabilities` copy; /capabilities: that copy as the page's h1), then one portrait card per capability (5:8 on desktop, 3:4 on phones/tablets; 2 px navy-950 border, rounded-lg) linking to `/capabilities/{slug}`: the featured photo drifts slowly (`.capability-card__photo` Ken Burns, 18 s alternate, phase-shifted per card, off for reduced motion), hover zooms the photo, deepens the navy gradient and shows an ↗ arrow; name + summary (max 4 lines) in white at the bottom. Four across at lg, 2×2 from sm, and a swipeable snap row on phones with the next card peeking. Both pages list the same cards from `Capability::showcase()` (every published capability, admin `sort_order`, then id); the homepage block's old `capability_ids` picker is ignored and its editor says so. The old zig-zag `CapabilityFeature` is gone.
- Images (performance audit 2026-09-30): every public `<img>` of a stored file goes through `responsiveImage(path, sizes)` (`resources/js/lib/responsive-image.ts`, `IMAGE_SIZES` presets), never `/storage/${path}` or a bare `mediaUrl()`. It points at WebP copies `/storage/_variants/v{VERSION}/w{480,960,1440,2000}/{path}.webp` (bump `ImageVariantService::VERSION` + `VARIANT_VERSION` when the encoding changes so the CDN never serves stale copies; `media:variants` deletes other versions; large copies q70, small q78) made by `App\Services\ImageVariantService` (never upscaled, alpha kept): a missing copy falls through the web server to the `media.variant` route (`routes/media.php`, outside the web middleware so no session cookie) which builds and saves it, after which Apache/CDN serve it as a static file; `media:variants` builds all missing copies and runs in the staging deploy after `artisan up`; replacing or deleting a stored file forgets its copies. Widths must match in PHP and TS (`tests/js/responsive-image.test.ts`). The home and /company hero photo is preloaded from the head with the same srcset (`App\Support\HeroImage`, `app.blade.php`) because the site has no SSR. The private `local` disk has `serve` off (no public /storage route). Audit baseline: server 1–13 queries/page, JS 115 KB br (framework core), TTFB ~0.2–0.3 s; remaining ideas the user has not approved yet: self-hosted fonts instead of bunny.net, smaller loader images + lazy footer art, year-long immutable cache for /build; the page-change curtain stays as it is (user decision).
- Repository layout (cleanup 2026-09-30): `resources/img/` holds only images the code imports (Vite bundles them); original artwork, PNG sources of the WebP files, content photos and design references live in `resources/design/{loader,sources,photos,reference}/` and are never bundled. Public static images (loader, torn paper, About accent) are WebP in `public/images/`. Docs: specs at the root, runbooks in `docs/deployment/`, historical audits in `docs/reports/`, feature specs/plans in `docs/superpowers/` (index: `docs/README.md`). Capability steps and machines save only through the main capability form (the separate step/machine endpoints were removed); the unused `Statistic` model, `UserPolicy` and `ErrorState` component are gone, and the empty `statistics` table is dropped by `2026_09_30_000002_drop_unused_statistics_table`. PHP style: `vendor/bin/pint` (the codebase passes `pint --test`).
- Security baseline: `SecurityHeaders` middleware sets a nonce CSP (Vite + Ziggy `@routes` carry the nonce; add new third-party origins to its allowlist), nosniff, SAMEORIGIN framing, Referrer/Permissions policies and HTTPS-only HSTS. Article HTML is sanitized on write by `RichTextSanitizer` (Article `content` mutator). Uploads are stored with the content-sniffed extension, never the client one. Guests get only the `public` Ziggy route group. The app sits behind Hostinger's CDN without `trustProxies`, so do not add global per-IP throttles until proxies are configured.
- Latest staging release is commit `3320385` (run `37211002607`; tab title no longer doubled, menu side art removed (dimmed page shows); menu keeps Lenis running, body overflow-y hidden only (Astra-style); menu lock = html overflow only, no body move (Safari footer jump fixed); menu lock keeps page width (scrollbar compensation); footer credit line + menu side art with mascot, straight panel edge, copyright bar; homepage capability cards = same list as /capabilities; Manufacturing Capabilities portrait cards on home + /capabilities; repo cleanup: design sources in resources/design, docs grouped, dead capability step/machine endpoints + Statistic/UserPolicy/ErrorState removed, Pint-formatted; responsive WebP image copies + hero preload + WebP torn paper (/company ~4 MB → ~0.9 MB), Industries retired from site/CMS/DB; Operating Values coloured SVG wheel turning the active value to the right, colour preset per value; customer logos multiply-blend their white boxes away; customer logos in Stamping / Engineering drifting rows; Customers Served logo wall + admin Pelanggan, Industries out of the Company submenu; operating hours schedule + open social links list, both migrated on staging; admin redesign phases 1–2: sidebar by website page + Indonesian shell, uniform Edit template live on Capabilities; Hostinger SSH intermittently closes new connections before login (again 05:21 UTC, 2 refusals) and its CDN sometimes 403s GitHub runners — the workflow now opens ONE multiplexed SSH connection (`staging` host alias) with 5 retries, retries rsync only on SSH drops (exit 255), never retries the deploy script, runs `php artisan app:smoke` (key pages rendered in-process, no network/CDN; the server cannot reach its own public URL through the edge) inside the deploy script, and treats a public 403 as a warning while 5xx/no answer fails; public page loader curtain whose runner and rail fill follow the real load progress on a logo-wide feathered rail, curtain sliding in from the left and out to the right, footer social links are white circles with a navy mark that fill the brand colour on hover with the mark dropping in (`social-slide-in` keyframes), Operating Values section under Vision & Mission, also in the Company submenu; homepage Company Milestones timeline removed — admin module kept; adds active-tab auto-translate with per-save status + translator test — confirmed working by the user on 2026-09-26 — and editable slugs with redirects; CSS audit, admin CRUD fixes and field hints, auto-translate phases 1–2 with the Azure key in staging `application/.env` since 2026-09-26, homepage ends after Latest News, Connect-With-Us footer without its info strip). After changing `.env` on staging, redeploy so `config:cache` picks it up. Favicon: head links the Settings favicon, and Settings saves plus deploy (`favicon:publish --web-root`) copy it to the web root as a real `favicon.ico`, because Hostinger's edge serves `/favicon.ico` statically. The staging front controller calls `usePublicPath(public_html)`, so `public_path()` is the web root on staging. User confirmed Astra-style motion, navbar/menu, admin spacing, sticky admin sidebar, security hardening and responsive menu on MacBook and Windows as the project UI/UX standard.

## Companion Specifications

Read [AGENTS.md](AGENTS.md), [DESIGN.md](DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE.md](DATABASE.md), [SEO.md](SEO.md), and [SKILL.md](SKILL.md) together. Public SEO requires the initial-HTML rendering acceptance criteria in SEO.md and the production runtime described in ARCHITECTURE.md.
