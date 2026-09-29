# Admin Redesign — Phase 2: Uniform Edit Template (Capabilities first)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One Edit page layout for every admin module — content cards on the left, a sticky side panel on the right with status, the ONE save button for everything, preview and "Tampil di website" — starting with Capabilities, whose steps and machines move into the main save.

**Architecture:** Reusable components in `resources/js/components/admin/edit/` (`EditPageLayout`, `EditCard`, `PublishPanel`, `WebsitePanel`) plus `useUnsavedChangesWarning(isDirty)` and `lib/status-labels.ts` (Indonesian display labels for the locked status values). Capabilities: `UpdateCapabilityRequest` accepts `steps[]` and `machine_ids[]`; `UpdateCapability` syncs them in the same transaction when the keys are present (absent keys leave them untouched, so `AdminSaveRoundTripTest` and old endpoints keep working).

**Tech Stack:** Laravel 12, Inertia v2 React + TS, Tailwind 3.4, Pest, node:test.

**Approved design:** mockup artboard "1 · Edit Kapabilitas" at https://claude.ai/artifact/2r6mLn2LLT3FshLCptgJ7d.

## Global Constraints

- Admin copy Bahasa Indonesia; identifiers English. Admin palette + no px text sizes (style guard).
- Status values stay `draft|published|archived`; only the label shown changes (Draf / Tayang / Diarsipkan).
- Laravel `validated()` drops nested keys without rules — every nested key sent (`steps.*.translations.id.*`) needs a rule.
- Key presence semantics: `steps` / `machine_ids` absent → untouched; present (even empty) → synced.

---

### Task 1: Save steps and machines with the capability

**Files:** `app/Http/Requests/Admin/Capability/UpdateCapabilityRequest.php`, `app/Actions/Capability/UpdateCapability.php`, test `tests/Feature/CapabilitySingleSaveTest.php`

- [ ] Tests: one PUT updates an existing step, creates a new one, deletes a missing one, orders by position, stores the Indonesian step translation, and syncs `machine_ids`; a PUT without `steps`/`machine_ids` leaves both untouched; a step id from another capability is rejected (422).
- [ ] Rules: `steps` sometimes|array; `steps.*.id` nullable|integer|exists scoped to the capability; `steps.*.title` required|string|max:255; `steps.*.description` nullable|string; `steps.*.translations.id.title|description` nullable|string; `machine_ids` sometimes|array; `machine_ids.*` integer|exists:machines,id.
- [ ] Action: inside the transaction, `syncSteps()` (update/create with `sort_order` = index, delete the rest) and `machines()->sync()` when present.
- [ ] `php artisan test` PASS; commit.

### Task 2: Edit template components + Capabilities page

**Files:** create `resources/js/components/admin/edit/{EditPageLayout,EditCard,PublishPanel,WebsitePanel}.tsx`, `resources/js/hooks/use-unsaved-changes-warning.ts`, `resources/js/lib/status-labels.ts`; rewrite `resources/js/pages/admin/capabilities/Edit.tsx`; Indonesian copy in `ContentLocaleTabs.tsx`; test `tests/js/status-labels.test.ts`.

- [ ] `statusLabel('published') === 'Tayang'`, unknown values fall back to the raw value (test first).
- [ ] Layout: `lg:grid-cols-[minmax(0,1fr)_20rem]`, aside `lg:sticky lg:top-6`; the whole page is one `<form>` so the panel's button submits everything.
- [ ] PublishPanel: unsaved-changes notice (`isDirty`), status select with labels, publish date, slot for extra toggles, "Simpan perubahan" (submit), "Pratinjau" (new tab), last saved line.
- [ ] Capabilities: cards Informasi utama · Gambar utama · Langkah proses (add/remove/move up/down, per-language fields, saved with the form) · Mesin & peralatan (card checkboxes, inactive badge, "Kelola mesin →") · SEO; side: PublishPanel (+ "Tampilkan di Beranda", urutan) · WebsitePanel.
- [ ] Unsaved-changes warning on in-app navigation and tab close.
- [ ] tsc, JS tests, build, PHP tests; commit.

### Task 3: Roll out to the other Edit pages (own commits per module group)

Products, Facilities, Machines, Industries, Certifications, Quality content, News, Careers, Milestones, Pages, categories — same components, Indonesian copy, no behaviour change beyond layout (their relations already save with the main form).
