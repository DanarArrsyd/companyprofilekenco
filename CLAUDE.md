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

## Companion Specifications

Read [AGENTS.md](AGENTS.md), [DESIGN.md](DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE.md](DATABASE.md), [SEO.md](SEO.md), and [SKILL.md](SKILL.md) together. Public SEO requires the initial-HTML rendering acceptance criteria in SEO.md and the production runtime described in ARCHITECTURE.md.
