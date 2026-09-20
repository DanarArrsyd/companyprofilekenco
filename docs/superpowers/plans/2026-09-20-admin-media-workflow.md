# Admin Media Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a staged, reliable CMS media workflow whose uploaded assets resolve on public pages and whose destructive operations protect shared files.

**Architecture:** Preserve the Laravel/Inertia monolith and existing relative-path storage contract. Add one frontend URL/upload seam and one backend media-lifecycle seam, then adopt them incrementally across page sections, the Media Library, and remaining admin modules.

**Tech Stack:** Laravel, PHP 8.3+, Pest, Inertia.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Vite.

**Spec:** `docs/superpowers/specs/2026-09-20-admin-media-workflow-design.md`

## Global Constraints

- Always use the Caveman communication mode for this project.
- Preserve the Route → Controller → Form Request → Action / Service → Model → Database flow.
- Do not add a package or database migration for this work.
- Persist public media references as relative public-disk paths.
- Preserve private certification-document and applicant-CV storage.
- Reuse existing semantic design tokens and admin components.
- Keep the CMS structured; do not add a free-form page builder.
- Run `npm run build` and `php artisan test` before completing each approved stage.
- Stop after each stage and obtain explicit user confirmation before starting the next stage.

---

### Stage 1: Page-Section Media Reliability

**Acceptance:** Hero, company-intro, image-text, gallery, and Vision/Mission section images use the picker; invalid uploads show an exact error; relative paths render through `/storage/`; the section visibly distinguishes unsaved, saving, saved, and failed states.

**Files:**
- Create: `resources/js/lib/media.ts`
- Create: `tests/js/media.test.ts`
- Create: `tests/Feature/PageSectionMediaWorkflowTest.php`
- Modify: `package.json`
- Modify: `app/Http/Controllers/Admin/MediaController.php`
- Modify: `resources/js/components/admin/MediaPicker.tsx`
- Modify: `resources/js/components/admin/SectionContentFields.tsx`
- Modify: `resources/js/components/admin/PageSectionEditor.tsx`
- Modify: `resources/js/components/public/Hero.tsx`
- Modify: `resources/js/components/public/SectionRenderer.tsx`

**Interfaces:**
- Produces: `mediaUrl(path?: string | null): string | null`
- Produces: `uploadMedia(file: File): Promise<UploadedMedia>`
- Produces: `MediaUploadError extends Error` with a user-facing `message`
- Preserves: `MediaPickerField` support for deferred file selection until Stage 4
- Consumes: `POST admin.media.store` JSON `{ id, path, url }`

- [x] **Step 1: Add failing upload contract tests**

Add tests that prove JSON success and JSON validation behavior:

```php
test('media upload returns the selected path to the picker', function () {
    $user = createPageSectionMediaAdmin();

    $response = $this->actingAs($user)
        ->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('section.jpg', 1200, 800),
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['id', 'path', 'url']);
    expect($response->json('path'))->toStartWith('library/');
});

test('media picker receives the file validation error', function () {
    $user = createPageSectionMediaAdmin();

    $this->actingAs($user)
        ->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->create('payload.exe', 10, 'application/octet-stream'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});
```

- [x] **Step 2: Run the focused tests and confirm the success-status mismatch**

Run: `php artisan test tests/Feature/PageSectionMediaWorkflowTest.php`

Expected: the successful upload assertion fails because the current endpoint returns HTTP 200 rather than HTTP 201; the validation assertion passes.

Also create `tests/js/media.test.ts` before `resources/js/lib/media.ts` and run `node --experimental-strip-types --test tests/js/media.test.ts`. The initial run must fail with `ERR_MODULE_NOT_FOUND`. The tests assert these literal contracts:

```ts
assert.equal(mediaUrl('library/photo.jpg'), '/storage/library/photo.jpg');
assert.equal(mediaUrl('/images/static.jpg'), '/images/static.jpg');
assert.equal(mediaUrl('https://cdn.example.com/photo.jpg'), 'https://cdn.example.com/photo.jpg');
await assert.rejects(() => uploadMedia(invalidFile), { name: 'MediaUploadError', message: 'The file must be an image.' });
```

- [x] **Step 3: Add the shared frontend media contract**

Implement `resources/js/lib/media.ts` with these signatures and rules:

```ts
export interface UploadedMedia {
    id: number;
    path: string;
    url: string;
}

export class MediaUploadError extends Error {}

export function mediaUrl(path?: string | null): string | null {
    if (!path) return null;
    if (/^(https?:)?\/\//.test(path) || path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('/')) {
        return path;
    }
    return `/storage/${path.replace(/^\/+/, '')}`;
}

export async function uploadMedia(file: File): Promise<UploadedMedia> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(route('admin.media.store'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new MediaUploadError(payload?.errors?.file?.[0] ?? payload?.message ?? 'Upload failed. Please try again.');
    }
    if (!payload?.path || !payload?.url) {
        throw new MediaUploadError('Upload completed but the media response was invalid.');
    }
    return payload as UploadedMedia;
}
```

Add `"test:js": "node --experimental-strip-types --test tests/js/*.test.ts"` to `package.json`. Change the JSON upload response in `MediaController::store()` to HTTP 201.

- [x] **Step 4: Make the picker expose explicit states**

Update `MediaPickerField` so library-mode uploads call `uploadMedia`, retain the current image after failures, and render these states with existing tokens:

```ts
type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface MediaPickerFieldProps {
    label: string;
    currentUrl?: string | null;
    onSelectPath: (path: string) => void;
    onUploadFile?: (file: File) => void;
    uploadToLibrary?: boolean;
    onClear?: () => void;
    error?: string;
}
```

The field must show `Uploading…`, `Upload complete`, or the thrown error and keep both `Choose from Library` and `Remove` keyboard accessible.

- [x] **Step 5: Replace page-section manual path inputs**

Use `MediaPickerField uploadToLibrary` for:

- `hero.image`
- `company_intro.image`
- `image_text.image`
- each `gallery.images[index]`
- `vision_mission.left_image`
- `vision_mission.right_image`

Delete the component-local `uploadToMediaLibrary` function. Every preview must call `mediaUrl(value)`.

- [x] **Step 6: Normalize public rendering**

Use `mediaUrl` in `Hero` and every image branch in `SectionRenderer`. Preserve absolute URLs and current static `/images/...` values. A missing URL continues rendering the existing placeholder.

- [x] **Step 7: Add section dirty/save feedback**

Extend the existing Inertia `useForm` destructure with `isDirty`, `wasSuccessful`, and `errors`. Render:

- `Unsaved changes` when `isDirty`;
- `Saving…` while `processing`;
- `Saved` after `wasSuccessful` and no new changes;
- the first server error when the save fails.

The Save button remains explicit and disabled while processing or when no changes exist.

- [x] **Step 8: Complete Stage 1 verification**

Run:

```bash
php artisan test tests/Feature/PageSectionMediaWorkflowTest.php tests/Feature/PageSectionTest.php tests/Feature/MediaManagementTest.php
npm run test:js
npm run build
php artisan test
```

Expected: every command exits successfully. Manually verify one section upload, save, reload, and public-page image at desktop and mobile widths.

- [x] **Step 9: Commit Stage 1**

```bash
git add package.json app/Http/Controllers/Admin/MediaController.php resources/js/lib/media.ts resources/js/components/admin/MediaPicker.tsx resources/js/components/admin/SectionContentFields.tsx resources/js/components/admin/PageSectionEditor.tsx resources/js/components/public/Hero.tsx resources/js/components/public/SectionRenderer.tsx tests/js/media.test.ts tests/Feature/PageSectionMediaWorkflowTest.php
git commit -m "fix(admin): make page section media reliable"
```

**Checkpoint:** Report changed files and verification evidence. Wait for explicit approval before Stage 2.

---

### Stage 2: Shared-Media Lifecycle Safety

**Acceptance:** Media referenced anywhere in supported public content cannot be deleted; replacing a content image deletes only an unmanaged old upload and never a Media Library file.

**Files:**
- Create: `app/Services/MediaLifecycleService.php`
- Create: `tests/Feature/MediaLifecycleTest.php`
- Modify: `app/Actions/Media/DeleteMedia.php`
- Modify: `app/Http/Controllers/Admin/MediaController.php`
- Modify: `app/Actions/Product/UpdateProduct.php`
- Modify: `app/Actions/Product/DeleteProductImage.php`
- Modify: `app/Actions/Article/UpdateArticle.php`
- Modify: `app/Actions/Capability/UpdateCapability.php`
- Modify: `app/Http/Controllers/Admin/MilestoneController.php`
- Modify: `tests/Feature/MediaManagementTest.php`

**Interfaces:**
- Produces: `MediaLifecycleService::usages(Media $media): array`
- Produces: `MediaLifecycleService::isInUse(Media $media): bool`
- Produces: `MediaLifecycleService::deleteIfUnmanaged(?string $path): void`
- Consumes: existing `MediaUploadService::deletePublic()`

- [x] **Step 1: Write failing lifecycle tests**

Cover these exact cases:

```php
test('page section media cannot be deleted', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    PageSection::factory()->create(['content' => ['image' => $media->path]]);

    $this->actingAs($user)
        ->delete(route('admin.media.destroy', $media))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('media', ['id' => $media->id]);
});

test('replacing a product image preserves its previous library file', function () {
    Storage::fake('public');
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    Storage::disk('public')->put($media->path, 'shared');
    $product = Product::factory()->create(['featured_image' => $media->path]);

    app(UpdateProduct::class)->handle($product, productUpdateData([
        'featured_image' => UploadedFile::fake()->image('replacement.jpg'),
    ]));

    Storage::disk('public')->assertExists($media->path);
});
```

- [x] **Step 2: Run focused lifecycle tests and confirm failure**

Run: `php artisan test tests/Feature/MediaLifecycleTest.php tests/Feature/MediaManagementTest.php`

Expected: page-section deletion and shared-file preservation assertions fail against current logic.

- [x] **Step 3: Implement usage discovery**

`usages()` returns arrays with `type`, `id`, and `label`. Inspect direct columns for Product, Article, Capability, Facility, Machine, Industry, Milestone, QualityContent, SeoMetadata, Certification, SiteSetting, ProductImage, and Customer. Inspect `PageSection::content` recursively for an exact path value so SQLite tests and MySQL production behave consistently.

- [x] **Step 4: Implement managed/unmanaged deletion**

`deleteIfUnmanaged()` must return without deletion when the path is empty or a `Media` row owns that path. It delegates to `MediaUploadService::deletePublic()` only when no Media row exists.

- [x] **Step 5: Route destructive operations through the lifecycle service**

Replace `DeleteMedia::isInUse()` with the centralized service. Replace direct old-image deletion in Product, Article, Capability, Milestone, and product-gallery deletion flows with `deleteIfUnmanaged()`.

- [x] **Step 6: Complete Stage 2 verification**

Run:

```bash
php artisan test tests/Feature/MediaLifecycleTest.php tests/Feature/MediaManagementTest.php tests/Feature/ProductManagementTest.php
npm run build
php artisan test
```

- [x] **Step 7: Commit Stage 2**

```bash
git add app/Services/MediaLifecycleService.php app/Actions/Media/DeleteMedia.php app/Http/Controllers/Admin/MediaController.php app/Actions/Product/UpdateProduct.php app/Actions/Product/DeleteProductImage.php app/Actions/Article/UpdateArticle.php app/Actions/Capability/UpdateCapability.php app/Http/Controllers/Admin/MilestoneController.php tests/Feature/MediaLifecycleTest.php tests/Feature/MediaManagementTest.php
git commit -m "fix(media): protect shared asset references"
```

**Checkpoint:** Report the protected reference types and test evidence. Wait for explicit approval before Stage 3.

---

### Stage 3: Media Library Experience

**Acceptance:** The picker and library provide searchable/paginated browsing, clear selection and upload feedback, asset usage visibility, and explicit global-replace consequences.

**Files:**
- Modify: `app/Http/Controllers/Admin/MediaController.php`
- Modify: `resources/js/components/admin/MediaPicker.tsx`
- Modify: `resources/js/pages/admin/media/Index.tsx`
- Modify: `tests/Feature/MediaManagementTest.php`

**Interfaces:**
- Extends picker JSON items with `usage_count: number`
- Extends media detail page items with `usages: Array<{ type: string; id: number | string; label: string }>`
- Preserves `MediaPickerField` props established in Stage 1

- [ ] **Step 1: Write failing response-contract tests**

Assert picker pagination metadata and usage counts:

```php
test('picker response includes pagination and usage count', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create(['path' => 'library/used.jpg']);
    Article::factory()->create(['featured_image' => $media->path]);

    $this->actingAs($user)
        ->getJson(route('admin.media.picker', ['type' => 'image']))
        ->assertOk()
        ->assertJsonPath('data.0.usage_count', 1)
        ->assertJsonStructure(['current_page', 'last_page', 'data']);
});
```

- [ ] **Step 2: Run the focused test and confirm the missing field**

Run: `php artisan test tests/Feature/MediaManagementTest.php --filter=picker`

Expected: the `usage_count` assertion fails.

- [ ] **Step 3: Add usage metadata to MediaController responses**

Use `MediaLifecycleService::usages()` to append usage information without changing stored media rows. Keep the 24-item pagination limit.

- [ ] **Step 4: Upgrade the picker interaction**

Add:

- 300 ms debounced search;
- Previous/Next pagination controls;
- selected-card border and check icon;
- drag-over upload target using native drag events;
- visible JPG/PNG/WebP and 10 MB guidance;
- empty, loading, upload-error, and retry states;
- focus restoration to the opener when the modal closes.

- [ ] **Step 5: Upgrade Media Library detail and upload surfaces**

Add a preview-first upload panel, file-name display, progress state, success reset, usage list, disabled delete explanation, and `Replace everywhere` copy when usage count is non-zero. Keep permanent deletion behind the existing confirmation dialog.

- [ ] **Step 6: Complete Stage 3 verification**

Run:

```bash
php artisan test tests/Feature/MediaManagementTest.php
npm run build
php artisan test
```

Manually verify keyboard navigation, search debounce, pagination, failed upload, successful upload, in-use delete block, and global-replace copy.

- [ ] **Step 7: Commit Stage 3**

```bash
git add app/Http/Controllers/Admin/MediaController.php resources/js/components/admin/MediaPicker.tsx resources/js/pages/admin/media/Index.tsx tests/Feature/MediaManagementTest.php
git commit -m "feat(admin): improve media library workflow"
```

**Checkpoint:** Report the verified interactions. Wait for explicit approval before Stage 4.

---

### Stage 4: Admin-Wide Media Rollout

**Acceptance:** Public-image fields across admin modules provide a consistent preview/upload/library/remove workflow; specialized private documents and favicon input retain their correct storage rules with improved validation feedback.

**Files:**
- Modify: `resources/js/pages/admin/facilities/Create.tsx`
- Modify: `resources/js/pages/admin/facilities/Edit.tsx`
- Modify: `resources/js/pages/admin/machines/Create.tsx`
- Modify: `resources/js/pages/admin/machines/Edit.tsx`
- Modify: `resources/js/pages/admin/industries/Create.tsx`
- Modify: `resources/js/pages/admin/industries/Edit.tsx`
- Modify: `resources/js/pages/admin/quality-content/Create.tsx`
- Modify: `resources/js/pages/admin/quality-content/Edit.tsx`
- Modify: `resources/js/pages/admin/certifications/Create.tsx`
- Modify: `resources/js/pages/admin/certifications/Edit.tsx`
- Modify: `resources/js/pages/admin/settings/Edit.tsx`
- Modify: `resources/js/pages/admin/products/Edit.tsx`
- Modify corresponding Form Requests and controllers for `image_path` or `media_id`
- Modify: `tests/Feature/MediaUploadTest.php`
- Modify: `tests/Feature/ProductManagementTest.php`
- Add focused module tests where existing coverage does not exercise path selection

**Interfaces:**
- Consumes: `MediaPickerField`, `mediaUrl`, and `MediaLifecycleService`
- Adds validated `image_path` input to path-backed public-image modules
- Adds validated `media_path` input to product-gallery creation
- Keeps certification `document` and setting `favicon` as specialized direct uploads

- [ ] **Step 1: Add failing selected-path tests**

For Facility, Machine, Industry, and QualityContent, submit an existing Media Library path and assert that the stored `image` equals that path. For Product gallery, submit `media_path` and assert that a `product_images` row references it without copying or deleting the asset.

- [ ] **Step 2: Run the focused module tests and confirm request rejection**

Run the new tests with `php artisan test --filter='media library path'`.

Expected: requests either discard or reject the new path fields.

- [ ] **Step 3: Add backend path-selection support**

Each Form Request accepts a nullable string path with a 255-character maximum. Each controller selects in this order: new file, selected path, existing value. Old paths are passed to `MediaLifecycleService::deleteIfUnmanaged()` only when actually replaced or removed.

- [ ] **Step 4: Replace raw public-image inputs**

Use the shared picker and preview in Facility, Machine, Industry, QualityContent, Certification image, and Settings logo/default-OG-image forms. Preserve their existing submit buttons and publishing fields.

- [ ] **Step 5: Connect product gallery to the library**

Keep the current direct-upload plus button and add `Choose from Library`. Store a selected relative path in `product_images.path`. Show request errors and disable repeated upload while processing.

- [ ] **Step 6: Improve specialized file inputs**

Certification PDF and favicon remain direct inputs. Add selected filename, allowed format/size copy, validation message, processing state, and clear-selection action without exposing private files in the public picker.

- [ ] **Step 7: Complete Stage 4 verification**

Run:

```bash
php artisan test tests/Feature/MediaUploadTest.php tests/Feature/ProductManagementTest.php
npm run build
php artisan test
```

Manually verify create/edit flows for Facility, Machine, Industry, Quality Content, Certification, Settings, and Product gallery, then open their relevant public pages.

- [ ] **Step 8: Commit Stage 4**

Stage only the admin media rollout files and use:

```bash
git commit -m "feat(admin): unify media fields across cms"
```

**Checkpoint:** Report final coverage, test/build evidence, and any intentionally specialized fields. Deployment remains a separate user-authorized action.

---

## Self-Review

- Spec coverage: all approved reliability, UX, public-resolution, and shared-file safety requirements map to Stages 1–4.
- Scope: no package, migration, page-builder, crop editor, bulk migration, or automatic orphan cleanup is included.
- Interface consistency: all stages reuse the relative-path contract, `mediaUrl`, `MediaPickerField`, and `MediaLifecycleService` signatures defined before their consumers.
- Stop rule: each stage ends after focused tests, full tests, build, manual exercise, commit, and explicit user checkpoint.
