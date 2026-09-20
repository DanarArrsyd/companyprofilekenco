# Admin Media Workflow Design

**Date:** 2026-09-20

**Status:** Approved for staged implementation

## Goal

Make image and document management predictable for administrators: every supported upload must show a preview and explicit status, persist through an intentional save action, and resolve correctly on the public website.

## Confirmed Problems

1. The media picker discards non-success responses, so validation and network failures appear to do nothing.
2. CMS section types use three incompatible workflows: Media Library selection, direct file upload, and manual path entry.
3. `image_text` and `gallery` render stored relative paths as raw URLs, while other public components prefix `/storage/`.
4. Section image selection changes only local form state; the UI gives no clear unsaved/saved feedback before the section is persisted.
5. Media deletion checks only Certification, Product, Article, and Capability references. Other references can be deleted while still public.
6. Some entity update actions delete the previous file without distinguishing an owned upload from a shared Media Library file.

## Chosen Approach

Use a unified media workflow without a database-wide `media_id` migration.

- Persist a public-disk relative path such as `library/uuid.jpg` in existing content fields.
- Convert that path to a browser URL through one TypeScript helper.
- Upload new picker files through the Media Library endpoint and select the returned path.
- Keep an explicit form or section Save action; an upload alone does not publish content.
- Surface upload progress, validation errors, unsaved state, and save success.
- Add centralized usage discovery before allowing destructive Media Library actions.
- Preserve current Laravel monolith, actions/services, Inertia forms, React components, and design tokens.

## User Flow

### Image field

1. Admin sees the current image in a large preview.
2. Admin chooses `Upload new`, `Choose from library`, or `Remove`.
3. Upload validates JPG, JPEG, PNG, or WebP up to the server limit.
4. The UI shows uploading, success, or the exact failure message.
5. The selected path updates the enclosing form and marks it unsaved.
6. Admin presses the enclosing Save button.
7. The UI confirms the saved state and provides a public-page link where available.

### Media Library

1. Admin can search, filter, paginate, and inspect metadata.
2. A file detail panel shows where the asset is used.
3. Delete is blocked while usages exist.
4. Replace is labelled as a global action because the stable path updates every reference.

## Path Contract

- Database value: relative public-disk path without a leading slash.
- Public URL: `/storage/<relative-path>`.
- Legacy absolute URLs and `/storage/...` values remain readable during transition.
- Blob URLs are allowed only for local previews and are never persisted.

## Error Contract

The upload endpoint continues returning Laravel JSON validation errors. The client extracts the first `errors.file` message; network and malformed-response failures receive a readable fallback. Failed uploads never close the picker or overwrite the current selection.

## Save Contract

- Uploading a file creates a Media record immediately.
- Selecting it changes local form data only.
- The enclosing Save action persists the reference used by the public page.
- Abandoning the form can leave an unused Media record; the Media Library exposes it, and no automatic cleanup is included in this work.

## Security and Data Integrity

- Existing authorization middleware and Form Requests remain authoritative.
- Paths selected from the Media Library are validated as strings and resolved only through the public storage URL helper.
- Shared Media Library files are never deleted implicitly when one content item changes image.
- Media deletion is blocked when referenced by entity image columns, SEO metadata, site settings, milestones, or page-section JSON.
- Private certification documents and applicant CVs remain outside the public image picker.

## Visual Direction

The CMS remains an enterprise working surface:

- light surface, restrained borders, existing semantic tokens;
- clear labels and status text;
- large useful previews instead of decorative cards;
- no marketing gradients, glass effects, or new visual language;
- keyboard-accessible modal controls and visible focus/error states.

## Stages

### Stage 1 — Page-section reliability

Fix path resolution, picker error handling, manual path fields, and section unsaved/saved feedback. This stage directly addresses the reported CMS image-change failure.

### Stage 2 — Shared-media safety

Centralize usage detection, prevent deletion of referenced media, and prevent content updates from deleting shared files.

### Stage 3 — Media Library experience

Improve search, pagination, selection state, metadata, upload feedback, usage display, and global-replace warning.

### Stage 4 — Admin-wide rollout

Replace remaining raw image inputs across facilities, machines, industries, quality content, certifications, settings, and product galleries with the shared workflow where their storage/privacy rules permit it.

## Acceptance

- A valid image can be uploaded or selected from every in-scope page-section image field.
- Invalid uploads show the server validation message without losing the current selection.
- Saving a section makes its image resolve correctly on the public page.
- Unsaved section changes are visibly distinguishable from saved content.
- Referenced Media Library files cannot be silently deleted.
- Replacing a content image cannot delete a shared library asset.
- Existing direct and absolute image URLs remain readable.
- `npm run build` and `php artisan test` pass after every approved stage.

## Non-goals

- No unrestricted drag-and-drop page builder.
- No database-wide conversion to `media_id` foreign keys.
- No new frontend or upload dependency.
- No image crop editor, DAM taxonomy, automatic orphan cleanup, or bulk migration.
- No redesign of the public website beyond correcting image URL resolution.
