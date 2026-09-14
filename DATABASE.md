# DATABASE.md

## Database

Use:

```text
MySQL 8+
```

## Main Tables

### Authentication

```text
users
roles
permissions
role_user
permission_role
```

### Pages

```text
pages
page_sections
```

### Products

```text
product_categories
products
product_images
```

### Manufacturing

```text
capabilities
capability_steps
facility_categories
facilities
machines
capability_machine
```

### Quality

```text
certifications
quality_contents
```

### News

```text
news_categories
articles
```

### Careers

```text
job_vacancies
job_applications
```

### Corporate

```text
industries
customers
milestones
statistics
```

### Platform

```text
media
seo_metadata
contact_inquiries
site_settings
activity_logs
```

## Standard Content Fields

Content entities should commonly support:

```text
status
published_at
created_by
updated_by
created_at
updated_at
```

Use soft deletes for important managed content where appropriate.

## Slugs

Public entities must use unique readable slugs.

Index slug columns.

Examples:

```text
/products/bracket-assy
/news/new-production-line
/capabilities/stamping
```

## SEO Relationship

Use polymorphic SEO metadata.

```text
seo_metadata
├── seoable_type
├── seoable_id
├── meta_title
├── meta_description
├── canonical_url
├── og_title
├── og_description
├── og_image
├── robots_index
├── robots_follow
└── schema_json
```

## Indexing

Add indexes where appropriate to:

```text
slug
status
published_at
email
created_at
foreign keys
```

## Multilanguage Readiness

Do not immediately implement a complicated translation system unless needed.

Architecture should remain compatible with future:

```text
English
Bahasa Indonesia
Japanese
```

Do not create fields such as:

```text
title_en
title_id
title_jp
```

across every table.
