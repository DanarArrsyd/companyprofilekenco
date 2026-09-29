# Admin Redesign — Phase 1: Navigation, Indonesian Shell, Machine Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise the admin sidebar around the public website (plus a "Data Master / Opsi" group and a "Sistem" group), switch the admin shell to Bahasa Indonesia, and fix the capability ↔ machine visibility bugs found in the 2026-09-29 audit.

**Architecture:** `resources/js/lib/admin-nav.ts` becomes a list of headed sections whose entries are either a link or a collapsible group; `AdminSidebar.tsx` renders sections with headings (headings hidden when collapsed). URLs and route names do not change. Machine fixes are query-level: public capability pages only load published machines; the capability edit form lists published machines plus any machine already attached (flagged inactive) so it can be detached.

**Tech Stack:** Laravel 12, Inertia v2 React + TS, Tailwind 3.4, Pest, node:test.

**Approved design:** mockup https://claude.ai/artifact/2r6mLn2LLT3FshLCptgJ7d (Sidebar component + page chrome).

## Global Constraints

- Admin copy is Bahasa Indonesia (user decision 2026-09-29). Identifiers, routes, permissions stay English.
- Admin palette only: `navy-*`, `slate-700/500`, `gray-200/100`, semantic tokens (`tests/js/style-guard.test.ts`); no px text sizes in admin.
- Route names are unchanged; every nav `href` must be an existing named route.
- Status values (`draft|published|archived`) and section types stay locked (user decision 2026-09-29).
- Later phases (own plans): 2 uniform Edit template, 3 Data Master CRUD (departments, employment types, work locations), 4 quick-add from forms, 5 status labels.

---

### Task 1: Sectioned admin navigation (Indonesian)

**Files:**
- Modify: `resources/js/lib/admin-nav.ts`
- Modify: `resources/js/components/admin/AdminSidebar.tsx`
- Test: `tests/js/admin-nav.test.ts`, `tests/Feature/AdminNavRoutesTest.php`

**Interfaces:**
- Produces: `adminNavSections: AdminNavSection[]` where
  `AdminNavSection = { heading: string | null; entries: AdminNavEntry[] }`,
  `AdminNavEntry = { label: string; icon; href?: string; permission?: string; items?: AdminNavItem[] }`,
  `AdminNavItem = { name: string; href: string; permission?: string }`;
  `navHrefs(): string[]` (every route name used).

- [ ] Step 1: node test — unique hrefs, every entry has exactly one of `href`/`items`, headings are `null | 'Halaman Website' | 'Konten' | 'Data Master / Opsi' | 'Sistem'`, labels contain no English module names (`Dashboard`, `Settings`, `Job Vacancies`).
- [ ] Step 2: Pest test — read `admin-nav.ts`, extract `href: '…'`, assert `Route::has()` for each.
- [ ] Step 3: run both → FAIL.
- [ ] Step 4: implement sections:
  - (none): Dasbor → `dashboard`
  - Halaman Website: Beranda → `admin.homepage`; Halaman (Perusahaan, Visi-Misi, dll.) → `admin.pages`; Industri → `admin.industries`; Tonggak Sejarah → `admin.milestones`
  - Konten: Produk → `admin.products`; Kapabilitas & Fasilitas [Kapabilitas `admin.capabilities`, Fasilitas `admin.facilities`]; Mutu & Sertifikasi [Sertifikasi `admin.certifications`, Konten Mutu `admin.quality-content`]; Berita → `admin.news`; Karier [Lowongan `admin.careers`, Lamaran Masuk `admin.careers.applications`]; Pesan Masuk → `admin.inquiries`; Media → `admin.media`
  - Data Master / Opsi: Kategori Produk `admin.products.categories`; Kategori Fasilitas `admin.facilities.categories`; Kategori Berita `admin.news.categories`; Mesin & Peralatan `admin.machines`
  - Sistem: Pengguna `admin.users`; Peran & Akses `admin.roles`; SEO `admin.seo`; Pengaturan Website `admin.settings`; Log Aktivitas `admin.activity-logs`
  Permissions copied from the current entries.
- [ ] Step 5: sidebar renders section headings (`text-caption uppercase text-slate-500`, hidden when collapsed), link entries and accordion groups as today; collapsed mode shows every entry's icon.
- [ ] Step 6: tests PASS, `npx tsc --noEmit`, commit `feat(admin): sidebar grouped by website page with Data Master and Sistem`.

### Task 2: Indonesian admin shell

**Files:** `resources/js/components/admin/AdminHeader.tsx`, `AdminSidebar.tsx`, `resources/js/layouts/AdminLayout.tsx`

- [ ] Profile → Profil, Log Out → Keluar, "Open/Close navigation menu" → "Buka/Tutup menu", "Expand/Collapse sidebar" → "Lebarkan/Ciutkan menu", brand subtitle "Kelola website perusahaan".
- [ ] `npx tsc --noEmit`, style guard, commit `feat(admin): Indonesian admin shell`.

### Task 3: Machine visibility fixes

**Files:**
- Modify: `app/Http/Controllers/Public/CapabilityController.php` (show), `app/Http/Controllers/Admin/CapabilityController.php` (edit), `resources/js/pages/admin/capabilities/Edit.tsx`
- Test: `tests/Feature/CapabilityMachineVisibilityTest.php`

- [ ] Step 1: tests — (a) public capability page lists a published machine and not a draft one attached to it; (b) edit props `availableMachines` include an attached draft machine with `is_published: false` and exclude an unattached draft.
- [ ] Step 2: FAIL.
- [ ] Step 3: public `machines` eager load uses `fn ($q) => $q->active()->orderBy('sort_order')`; admin `availableMachines` = published ∪ attached, each `{id, name, is_published}`; Edit shows "Nonaktif" badge + hint "Tidak tampil di website".
- [ ] Step 4: PASS (`php artisan test`), commit `fix(capabilities): hide unpublished machines publicly, keep them detachable`.

### Task 4: Docs + deploy

- [ ] CLAUDE.md working memory: admin nav sections + Indonesian admin; staging deploy on the user's go.
