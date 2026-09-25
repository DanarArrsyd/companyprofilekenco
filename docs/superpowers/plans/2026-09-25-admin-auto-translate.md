# Admin Auto-Translate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Saving an admin form fills the other language (EN ⇄ ID) by machine translation, so content is edited once.

**Architecture:** A `Translator` interface with an Azure Translator v3 implementation, a glossary protector, and an `AutoTranslateChanges` action run from `HasLocalizedContent`'s `saving` hook when `LocalizedContent::$autoTranslate` is on. `SetLocale` turns the flag on for admin requests that carry `X-Auto-Translate: 1`; the header comes from one Inertia `before` listener driven by a checkbox in `ContentLocaleTabs`.

**Tech Stack:** Laravel 12 HTTP client, spatie/laravel-translatable, Inertia v2 React, Pest (`Http::fake()`), node:test.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-25-admin-auto-translate-design.md`.
- Engine: Azure Translator F0, `POST {endpoint}/translate?api-version=3.0&from=..&to=..&textType=html`, headers `Ocp-Apim-Subscription-Key`, `Ocp-Apim-Subscription-Region`, 10 s timeout.
- Env: `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`, `AZURE_TRANSLATOR_ENDPOINT` (default `https://api.cognitive.microsofttranslator.com`).
- A failed translation never blocks the save; flash `warning` "Automatic translation failed; the other language was not changed."
- Seeders, migrations, console and tests never call the API unless a test enables the flag with `Http::fake()`.
- Locales: `en` (source) and `id`.

---

### Task 1: Translator service (Azure + glossary)

**Files:**
- Create: `config/translation.php`, `app/Services/Translation/Translator.php`, `app/Services/Translation/TranslationFailed.php`, `app/Services/Translation/GlossaryProtector.php`, `app/Services/Translation/AzureTranslator.php`
- Modify: `app/Providers/AppServiceProvider.php` (bind `Translator`), `.env.example`
- Test: `tests/Feature/Translation/AzureTranslatorTest.php`

**Interfaces:**
- Produces: `Translator::isConfigured(): bool`; `Translator::translate(array $texts, string $from, string $to): array` (list in, list out, same order; HTML detected per text); throws `TranslationFailed`.

- [ ] Step 1: tests — request shape (URL, query, headers, JSON body), glossary terms wrapped in `<span class="notranslate">` and restored, plain text escaped/decoded with newlines kept, HTML passed through, HTTP 4xx/5xx and connection errors throw `TranslationFailed`, unconfigured → `isConfigured()` false and `translate()` throws.
- [ ] Step 2: run `php artisan test tests/Feature/Translation/AzureTranslatorTest.php` → FAIL (classes missing).
- [ ] Step 3: implement the five files (code in the commit of this task).
- [ ] Step 4: run the test → PASS.
- [ ] Step 5: commit `feat(translation): Azure Translator client with glossary protection`.

### Task 2: AutoTranslateChanges + model hook + request flag

**Files:**
- Create: `app/Actions/Translation/AutoTranslateChanges.php`
- Modify: `app/Support/LocalizedContent.php` (`public static bool $autoTranslate = false;`), `app/Models/Concerns/HasLocalizedContent.php` (run the action first in `saving`, catch `TranslationFailed` → log + flash), `app/Http/Middleware/SetLocale.php` (set the flag), `app/Http/Middleware/HandleInertiaRequests.php` (share `autoTranslate` on admin requests)
- Test: `tests/Feature/Translation/AutoTranslateTest.php`

**Interfaces:**
- Consumes: `Translator` from Task 1.
- Produces: `AutoTranslateChanges::handle(Model $model): void`.

- [ ] Step 1: tests through real admin routes with `Http::fake()`: EN-only change → ID filled; ID-only change → EN filled; both changed → no request; unchanged + ID empty → ID filled; unchanged + both filled → no request; no header → no request; SEO meta_title translated; failure → saved + `warning` flash; article HTML content keeps markup.
- [ ] Step 2: run → FAIL.
- [ ] Step 3: implement.
- [ ] Step 4: run the whole suite (`php artisan test`) → PASS.
- [ ] Step 5: commit `feat(admin): auto-translate the other language on save`.

### Task 3: Admin toggle + request header

**Files:**
- Create: `resources/js/lib/auto-translate.ts`
- Modify: `resources/js/app.tsx` (register the listener), `resources/js/components/admin/ContentLocaleTabs.tsx` (checkbox), `resources/js/types/index.d.ts` (shared prop type)
- Test: `tests/js/auto-translate.test.ts`

**Interfaces:**
- Produces: `autoTranslateEnabled(): boolean`, `setAutoTranslateEnabled(on: boolean): void`, `autoTranslateHeaders(method: string, pathname: string): Record<string, string>`, `registerAutoTranslateHeader(router)`.

- [ ] Step 1: node test for `autoTranslateHeaders` (non-GET admin → header when enabled; GET, public URLs or disabled → none) and preference storage fallback when `localStorage` throws.
- [ ] Step 2: run `npm run test:js` → FAIL.
- [ ] Step 3: implement; checkbox only when `autoTranslate` prop is true and the tabs are not `inline`.
- [ ] Step 4: `npm run test:js`, `npx tsc --noEmit`, `npm run build` → PASS.
- [ ] Step 5: commit `feat(admin): auto-translate toggle on the language tabs`.

### Task 4: Docs

- [ ] Add the rule to `CLAUDE.md` working memory and the Azure setup steps (resource F0, key, region, `.env`) to the reply; commit `docs: record auto-translate`.
