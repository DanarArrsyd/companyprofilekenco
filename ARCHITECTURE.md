# ARCHITECTURE.md

## Architectural Style

Use a Laravel monolith.

Public website and Admin CMS live in the same application.

```text
Browser
   ↓
Laravel Router
   ↓
Controller
   ↓
Action / Service
   ↓
Eloquent
   ↓
MySQL

Frontend rendering:
Laravel
↓
Inertia.js
↓
React
```

## Why Monolith

Benefits:

- one deployment
- one authentication system
- one database
- one media storage layer
- shared public rendering and SEO metadata pipeline
- lower maintenance overhead
- no internal API complexity

## Backend Layers

### Controllers

Responsibilities:

- receive requests
- call validated actions
- return responses

Do not place large business logic here.

### Form Requests

Responsibilities:

- validation
- request authorization where appropriate

### Actions

Responsibilities:

one specific business operation.

Examples:

```text
CreateProduct
UpdateProduct
PublishArticle
ArchiveJobVacancy
```

### Services

Reusable capabilities.

Examples:

```text
MediaService
SeoService
SitemapService
ImageOptimizationService
```

### Policies

Use Laravel Policies for resource-level authorization.

## Routes

Separate:

```text
routes/web.php
routes/admin.php
```

Admin routes should use appropriate middleware.

## Frontend Structure

```text
resources/js/
├── components/
│   ├── ui/
│   ├── public/
│   └── admin/
├── layouts/
│   ├── PublicLayout.tsx
│   ├── AdminLayout.tsx
│   └── AuthLayout.tsx
├── pages/
│   ├── public/
│   └── admin/
├── hooks/
├── lib/
└── types/
```

## Authentication

Admin authentication only.

Public website does not require accounts.

Initial roles:

```text
Super Admin
Content Admin
```

Design permission model so future roles can be added.

Potential permissions:

```text
products.view
products.create
products.update
products.delete

news.view
news.create
news.update
news.delete

careers.manage
settings.manage
users.manage
```

## Caching

Recommended cache targets:

- site settings
- navigation
- homepage data
- categories
- sitemap

Invalidate relevant cache after CMS updates.

Redis is optional, not required for V1.

## Media

Upload flow:

```text
Validate
↓
Generate safe filename
↓
Optimize
↓
Generate variants
↓
Store
↓
Create media record
```

Recommended variants:

```text
original
large
medium
thumbnail
```

Prefer WebP when server support is available.

## Deployment

GitHub Actions should handle deployment.

Typical pipeline:

```text
Push main
↓
composer install --no-dev
↓
npm ci
↓
npm run build
↓
deploy files
↓
php artisan migrate --force
↓
php artisan optimize
```

Prefer environments:

```text
development
staging
production
```

## Production Rendering and Operations

The public rendering acceptance criteria are defined in [SEO.md](SEO.md).
Use Inertia SSR for indexable public pages so the initial HTML contains the
page content and resolved metadata. Keep the SSR entry point in the same
repository. Provision and supervise its runtime alongside the Laravel application.

Before production deployment:

- Run relevant backend tests, TypeScript checks, and the production asset build.
- Build and verify the SSR bundle, then verify direct public page requests.
- Keep environment secrets outside source control; disable production debug output.
- Use HTTPS and secure session cookies.
- Back up the database and uploaded media; document and test restoration.
- Use backward-compatible migrations and a documented application rollback procedure.
- Monitor application errors and SSR health; check public pages after deployment.
- If queued mail or image processing is enabled, supervise workers and monitor failures.
- Store applicant CVs privately and serve them only through authorized admin requests.
- Sanitize rich text on the server and expose only necessary data in Inertia props.

Use transactions for related database changes. File storage is not transactional;
clean up orphaned uploads on failure. Invalidate affected public caches after
successful writes, and account for scheduled publication when setting cache expiry.
