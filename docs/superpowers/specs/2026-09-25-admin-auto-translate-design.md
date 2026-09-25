# Admin auto-translate (EN ⇄ ID) — design

Date: 2026-09-25 · Status: approved by user (engine: Azure Translator F0)

## Goal

An admin edits content once, in either language tab, and saves. The other
language is filled in by machine translation in the same save, so no field
has to be typed twice.

## Behaviour

- The language tab bar on every translatable admin form gets a checkbox
  **"Auto-translate the other language"**, on by default and remembered per
  browser. It is shown only when a translator is configured
  (`autoTranslate` shared prop). When on, admin form submissions carry the
  header `X-Auto-Translate: 1` (added by one Inertia `before` listener), so no
  individual form changes.
- On save, per translatable field, compared with the stored value:

| Changed in this save | Result |
|---|---|
| English only | Indonesian re-generated from English (overwrites) |
| Indonesian only | English re-generated from Indonesian (overwrites) |
| Both | Both kept as typed, nothing translated |
| Neither, other language empty | Other language filled from the source |
| Neither, both filled | Untouched, no API call |

  A changed source that is now empty is not translated (clearing English does
  not wipe Indonesian and vice versa).
- Checkbox off → today's behaviour, nothing translated.
- Glossary terms never translate: brand/legal name, product and certification
  names, manufacturing jargon and job titles (user decision of 2026-09-25). They
  live in `config/translation.php` and are wrapped in
  `<span class="notranslate">` before the call.
- Rich text (article `content`) is sent with `textType=html`, so markup and
  links survive. Plain fields are HTML-escaped for the call and decoded after.

## Architecture

- `App\Services\Translation\Translator` (interface): `translate(list<string>
  $texts, string $from, string $to, bool $html): list<string>`.
- `App\Services\Translation\AzureTranslator`: Translator v3
  (`POST /translate?api-version=3.0`), headers `Ocp-Apim-Subscription-Key` and
  `Ocp-Apim-Subscription-Region`; one request per save and direction, 10 s
  timeout. Config: `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`,
  `AZURE_TRANSLATOR_ENDPOINT` (default global endpoint). Server-side only, so no
  CSP change and the key never reaches the browser.
- `App\Services\Translation\GlossaryProtector`: wraps/unwraps glossary terms.
- `App\Actions\Translation\AutoTranslateChanges`: given a model (with its
  original translations) and the list of fields, applies the table above and
  writes the generated locale through `setTranslation()`.
- Hook: `HasLocalizedContent` runs the action in `saving` only when
  `LocalizedContent::$autoTranslate` is on. `SetLocale` (admin requests) turns
  it on when the request carries `X-Auto-Translate: 1` and a translator is
  configured. Seeders, migrations, tests and console commands never call the API.
- Synchronous (Hostinger has no queue worker); edits are small.

## Scope

Phase 1 (this spec): every model using `HasLocalizedContent` — products,
articles, capabilities + steps, vacancies, pages, facilities, industries,
quality content, milestones, product/facility/news categories, statistics —
and `SeoMetadata`.

Phase 2 (separate spec): `PageSection.content` inline `{"en","id"}` values
(homepage and page sections), which need a per-section map of text keys.

## Errors

A failed call (missing key, quota reached — F0 stops at 2 M chars/month —,
timeout, HTTP error) never blocks the save: the typed text is stored, the other
language is left unchanged, the failure is logged and the admin sees a warning
flash "Automatic translation failed; the other language was not changed."

## Testing

`Http::fake()` for Azure. Cases: EN→ID, ID→EN, both changed, unchanged field
(no request), checkbox off (no request), empty source, HTML content, glossary
terms preserved, API failure keeps the save and flashes the warning, no key
configured → no request.
