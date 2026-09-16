# Phase 11A.1 — Hosting & Deployment Audit

Status: **audit only**. Nothing was deployed, no production database was
created, no DNS was touched, no production migration was run. This document
is the input to Phase 11A.2 (deployment architecture implementation), not an
implementation itself.

Target production: `https://kencomanufactur.co.id` — PT. Kenco Manufactur
Indonesia. Hosting is assumed shared hosting / cPanel (Niagahoster/Hostinger
family) with SSH access available, but **most server-side facts below are
unknown and must be verified by the user in cPanel/SSH** — see the checklist
in Part 4.

---

## 1. Current application requirements

| | |
|---|---|
| Framework | Laravel `^13.17` |
| PHP | `^8.3` (composer.json `require.php`) |
| Frontend | Inertia.js v2 (`inertiajs/inertia-laravel ^2.0`, `@inertiajs/react ^2.0`) + React 18 + TypeScript + Vite `^8.0` |
| Auth/permissions | `laravel/sanctum ^4.0`, `spatie/laravel-permission ^8.3` |
| Other notable deps | `doctrine/dbal ^4.4` (used for migration column-modify support), `tightenco/ziggy ^2.0` (route helpers in JS) |
| Dev-only | Pest 5, Laravel Breeze/Pail/Pint, Faker — never needed in production |

No SSR (Inertia server-side rendering) is configured. This is a pre-existing,
already-documented gap (see `SEO.md`'s "Implementation (Phase 10)" section)
— out of scope for this audit, but relevant to production because it means
the app is a pure client-hydrated SPA today; nothing about that requires
Node on the production server (see §6).

## 2. Required PHP extensions

Derived from `composer.lock`'s actual declared `ext-*` requirements across
every installed package (not guessed):

**REQUIRED** (the app will not boot or will error without these):
- `ext-openssl` — encryption, `APP_KEY`, HTTPS
- `ext-pdo` + `ext-pdo_mysql` — database (PDO itself isn't in composer.lock
  because it's a runtime driver choice, not a composer dependency, but it is
  unconditionally required to connect to MySQL/MariaDB)
- `ext-mbstring` — string handling throughout Laravel
- `ext-tokenizer` — used by Laravel's console/parsing internals
- `ext-ctype`, `ext-filter`, `ext-hash`, `ext-session` — Laravel framework core
- `ext-json` — Laravel core + all API/Inertia responses
- `ext-xml`, `ext-dom`, `ext-simplexml`, `ext-xmlwriter`, `ext-libxml` —
  needed transitively (Doctrine DBAL, dev tooling, sitemap XML generation
  path in `SitemapController` uses a Blade view, not `ext-dom`, but Doctrine
  DBAL and some Symfony components do use these)
- `ext-fileinfo` — file upload MIME validation (`MediaUploadService`, all
  admin upload Form Requests use `mimes:`/`image` rules that rely on this)

**RECOMMENDED**:
- `ext-curl` — Guzzle (Laravel's HTTP client) prefers curl; it can fall back
  to PHP streams but curl is standard on virtually all hosts
- `ext-gd` — `MediaUploadService::optimizeToWebp()` explicitly self-guards
  with `extension_loaded('gd')` and silently skips WebP generation if
  absent, so this is **not a hard requirement**, just a quality-of-life one
- `ext-intl` — not currently used by any app code (no `IntlDateFormatter`,
  `NumberFormatter`, etc. found in `app/` or `resources/`), but commonly
  bundled and harmless to have

**OPTIONAL / not needed**:
- `ext-bcmath` — not called anywhere in `app/` or `resources/`; not a hard
  Laravel 13 core requirement per `composer.lock`. Fine to have, not worth
  blocking on.
- `ext-imagick` — never referenced; the app only ever uses GD, optionally.
- `ext-redis` / `phpredis` — **not required**. `CACHE_STORE` and
  `QUEUE_CONNECTION` both default to `database` in `.env.example`; Redis
  config exists in `config/*.php` only because it ships with the Laravel
  skeleton, it is not wired as the active default anywhere in this repo.

Testing-only, never needed in production: `ext-pdo_sqlite` (used only by
`phpunit.xml`'s `DB_CONNECTION=sqlite` / `:memory:` test database).

## 3. Filesystem audit

| Path | Must be writable? | Notes |
|---|---|---|
| `storage/` (all subdirs: `app/public`, `app/private`, `framework/cache`, `framework/sessions`, `framework/views`, `framework/testing`, `logs`) | **Yes** | Standard Laravel requirement. `framework/sessions` matters here because `SESSION_DRIVER=database` is the default in `.env.example` (not file), so this is actually less critical than usual — but `framework/views` (compiled Blade) and `logs` are always needed. |
| `bootstrap/cache/` | **Yes** | Route/config/event cache files are written here by `php artisan config:cache` / `route:cache` / `optimize`. |
| `public/storage` | Must exist as a **symlink** to `storage/app/public` | Created by `php artisan storage:link`. |

**Symlink dependency — real production risk.** Every public-facing image in
this app (product/capability/facility/certification/industry/milestone/news
images, OG images, admin-uploaded media) is served through the `public` disk
and rendered client-side as a literal `/storage/<path>` URL
(`MediaUploadService::storePublicImage()` → `Storage::disk('public')`, and
every frontend component does `src={`/storage/${path}`}` directly — this is
a fixed, hardcoded URL prefix throughout the codebase, not resolved through
`Storage::url()` on the frontend side).

**If `storage:link` is unsupported** (some shared-hosting control panels
restrict `symlink()`, or the hosting account runs under `open_basedir` /
`safe_mode`-style restrictions that block it): every image on the entire
public site will 404. This must be verified over SSH before deployment (see
checklist §E). If symlinks turn out to be unsupported, the fallback is to
serve the `public` disk through a Laravel route (`Storage::response()`)
instead of a symlink — this is a real architecture change and should be
decided in Phase 11A.2, not silently assumed to work here.

Private disk (`local` → `storage/app/private`) is used for CV uploads
(`JobApplication`) and certification documents — these are never
symlinked or directly URL-addressable; they're served through authenticated
admin download routes. No production risk there beyond normal
directory-permission requirements.

## 4. Database audit

- Driver: MySQL, configured via `config/database.php`'s `mysql` connection.
  `charset` = `utf8mb4`, `collation` = `utf8mb4_unicode_ci` (both from
  Laravel's own defaults, not overridden) — this requires **MySQL 5.7.8+ or
  MariaDB 10.2.7+** (for the `utf8mb4_unicode_ci`/JSON support used below);
  both are trivially satisfied by any current shared-hosting MySQL/MariaDB
  offering.
- **JSON columns**: used in 3 migrations (`seo_metadata.schema_json`, and
  two CMS-content JSON columns). Requires native `JSON` column type —
  MySQL 5.7.7+ / MariaDB 10.2.7+ (MariaDB implements it as `LONGTEXT` with a
  `CHECK` constraint, functionally compatible). Any hosting-provided
  MySQL/MariaDB from the last ~7 years supports this; still worth confirming
  the exact version in the checklist since "shared hosting" sometimes runs
  older defaults on legacy accounts.
- **Foreign keys**: 1 migration uses `foreign()`/`constrained()` — requires
  the **InnoDB** storage engine (MyISAM does not support FKs). Laravel's
  default migration engine on MySQL is InnoDB and this is essentially never
  an issue on modern hosting, but shared-hosting control panels occasionally
  default new databases to MyISAM for legacy reasons — worth a quick check.
- No full-text indexes, no stored procedures, no triggers, no
  MySQL-version-specific SQL used anywhere in the migrations.
- Migrations are additive throughout this project's history (confirmed by
  reviewing the migration set — no destructive/data-loss migrations exist).
  They are safe to run against a fresh, empty production database.

### Production database plan (recommendation only — not executed)

- **Name convention**: most cPanel MySQL setups auto-prefix database/user
  names with the cPanel account username (e.g. `cpaneluser_kenco`) — follow
  whatever the host enforces; don't fight it.
- **User permissions**: a dedicated DB user with `ALL PRIVILEGES` scoped to
  just that one database (never a shared/global MySQL user across other
  sites on the same hosting account).
- **Charset/collation**: `utf8mb4` / `utf8mb4_unicode_ci` at database-creation
  time, matching `config/database.php` — set this explicitly in cPanel's DB
  creation step rather than trusting the server default.
- **Initial migration command**: `php artisan migrate --force` (the
  `--force` flag is required because Laravel blocks `migrate` in
  `APP_ENV=production` without it — this is intentional safety, not a bug to
  route around).
- **Seeding strategy**: run **only** `RolePermissionSeeder` (roles/permission
  catalog) and a **fresh, real** `AdminUserSeeder` run with a real
  `ADMIN_DEV_EMAIL`/`ADMIN_DEV_PASSWORD` pair set in the production `.env`
  for that one command, then those env vars should be removed/blanked again.
  **Do not run** any development/demo/sample content seeder in production —
  this repo's local dev DB currently has demo Articles/Products/Milestones/
  Vacancies seeded via ad-hoc tinker scripts for UI verification; none of
  that is real company content and must never reach production.
- **Initial admin creation**: via `AdminUserSeeder` (already environment-
  aware — generates and prints a random password once if none is supplied)
  run once over SSH immediately after migration, then verify login and
  rotate the password from the admin UI.

## 5. Frontend build audit

**Node/npm is not needed on the production server.** This project's
`npm run build` (`tsc && vite build`) produces static assets under
`public/build/` (JS/CSS bundles + a `manifest.json` that
`@vite` / `laravel-vite-plugin`'s Blade directive reads at runtime). Laravel
serves those as plain static files — nothing in the PHP runtime path invokes
Node, `npm`, or Vite. The correct architecture for this shared-hosting
target is:

```
CI (GitHub Actions, has Node):
  npm ci
  npm run build          → produces public/build/**

Deploy artifact includes public/build/** (already compiled)
Production server: never runs npm/node, only serves the static output
```

This project supports that cleanly today — `vite.config.ts` is a standard
Laravel-Vite setup with no server-side rendering entry point, no runtime
Node dependency, and the build output is self-contained static assets.

### Build artifacts — what a deploy must include

| Include | Built where |
|---|---|
| Laravel application code (`app/`, `bootstrap/`, `config/`, `database/`, `resources/views` [Blade], `routes/`, `public/index.php`, `artisan`, etc.) | Repo, as-is |
| `vendor/` | **Recommendation: install server-side via Composer**, not committed to the deploy artifact — see below |
| `public/build/**` (compiled JS/CSS) | CI (`npm run build`), copied into the deploy artifact |
| `storage/` directory *structure* (empty `app/public`, `app/private`, `framework/{cache,sessions,views,testing}`, `logs`, each with a `.gitignore`-committed placeholder) | Repo skeleton; contents are runtime-generated, never deployed |
| `bootstrap/cache/` (empty, writable) | Repo skeleton |
| `.env` | **Never** in the deploy artifact/repo — created once directly on the server |

**Vendor: Composer install server-side (A) vs. build-in-CI-and-deploy (B)** —
recommendation for this shared-hosting target is **A, install server-side
over SSH**, because:
- SSH access is confirmed available, and `composer install
  --no-dev --optimize-autoloader` is a completely standard, low-risk step to
  run there.
- Shipping a `vendor/` directory in a deploy artifact/zip is fragile across
  differing PHP versions/architectures between the CI runner and the actual
  hosting PHP build (extension ABI mismatches for any compiled extensions in
  dependencies — none currently in this project's deps, but it's the safer
  default policy regardless), and bloats every deploy transfer significantly.
- The composer.lock is already committed, so a server-side `composer
  install` is fully deterministic — no version drift risk.

If SSH/Composer access turns out to be restricted on the actual hosting
account (unconfirmed — see checklist), option B becomes the fallback and
should be revisited in 11A.2, not assumed now.

## 6. Node/npm requirement — restated

To directly answer the audit question: **no**, the production server does
not need Node or npm installed at all, under the recommended CI-builds/
server-serves-static-output architecture above. This should be explicitly
confirmed as *not required* on the hosting checklist (§4D below) rather than
assumed — if it turns out Node happens to be available on the host, that's a
bonus/irrelevant, not a dependency.

---

## Part D — Hosting verification checklist

Nothing below is marked "supported" — every line is something the user must
personally verify in cPanel/SSH before Phase 11A.2 can be planned concretely.
Unchecked = unknown, not assumed-safe.

### A. Server
- [ ] PHP version (need **>= 8.3**; confirm exact version, e.g. via cPanel
      "Select PHP Version" or `php -v` over SSH)
- [ ] PHP extensions present: openssl, pdo_mysql, mbstring, tokenizer,
      ctype, filter, hash, session, json, xml, dom, simplexml, xmlwriter,
      fileinfo (all **required**); curl, gd, intl (recommended)
- [ ] `memory_limit` (Laravel/Composer comfortably want >= 256M; Composer's
      dependency resolution itself can need more transiently, but
      `composer install` on an already-locked `composer.lock` is lighter)
- [ ] `max_execution_time` (default 30s is usually fine for a request-driven
      site with no queue workers; confirm it isn't set unusually low, e.g.
      10s, which could affect admin bulk operations or large uploads)
- [ ] `upload_max_filesize` and `post_max_size` (must comfortably exceed the
      app's own upload limits — CV uploads allow up to 5MB per
      `SubmitJobApplicationRequest`; PHP's ini limits must be >= that plus
      headroom for multipart overhead, e.g. 10M+)

### B. Database
- [ ] MySQL or MariaDB version (need MySQL 5.7.8+/MariaDB 10.2.7+ for JSON
      columns; realistically confirm whatever the panel reports)
- [ ] Can create a new database via cPanel
- [ ] DB user can be created and granted full privileges on that one database
- [ ] Confirm host is `localhost`/`127.0.0.1` (same-server) vs. a remote DB
      host string — changes `DB_HOST` in production `.env`

### C. SSH
- [ ] SSH access actually works (login test)
- [ ] `php -v` over SSH matches the CLI PHP version to the web-facing PHP
      version (cPanel hosts sometimes run a **different** PHP binary for CLI
      vs. the web server — this has bitten Laravel deploys before; must be
      explicitly checked, not assumed)
- [ ] `php artisan` runs without error once the app is present (`php
      artisan --version` is a safe smoke test)
- [ ] Composer available (`composer --version`), and which version (need
      Composer 2.x for this `composer.lock` format)
- [ ] Git available on the server (`git --version`) — relevant only if a
      git-pull-based deploy is chosen in 11A.2 over an artifact-upload deploy
- [ ] Confirm the SSH user actually owns/can write to the target directories
      (not just read)

### D. Node
- [ ] Node version if installed (informational only)
- [ ] npm version if installed (informational only)
- [ ] **Explicitly confirmed: production does NOT need Node/npm** under the
      recommended architecture (§6) — this line exists so nobody wastes time
      trying to install Node on the production account later.

### E. Filesystem
- [ ] Document root: does cPanel allow pointing the domain's document root
      at a subdirectory (i.e. `public/`) rather than `public_html/`
      directly? This is **the single most common Laravel-on-shared-hosting
      blocker.** Three possible outcomes, must identify which applies:
      1. cPanel lets you set the domain's document root to
         `.../public` directly (ideal, no workaround needed).
      2. It doesn't for the primary domain, but does for an **addon
         domain** — in which case the production domain should be added as
         an addon domain pointing its docroot at the Laravel `public/` dir.
      3. Neither is possible — requires copying `public/*` contents into
         `public_html` and adjusting `index.php`'s `require` paths to point
         up into the real app directory (a known, if inelegant, Laravel
         shared-hosting pattern) — decide only if 1 and 2 are both
         confirmed unavailable.
- [ ] `symlink()` support confirmed (test: SSH in, run `php artisan
      storage:link` against a throwaway test install, or directly test PHP's
      `symlink()` function) — see §3's production-risk note
- [ ] `storage/` and `bootstrap/cache/` are writable by the PHP process user
- [ ] `mod_rewrite` enabled (required by `public/.htaccess`, standard on
      virtually all cPanel/Apache hosting but confirm)

### F. Cron
- [ ] cPanel "Cron Jobs" UI available on the account
- [ ] Exact shell command format the panel expects (varies by host —
      some need a full `php` binary path, e.g. `/usr/local/bin/php83`,
      not just `php`)
- [ ] **Not currently needed** — see §13 (Scheduler audit): this app has
      zero scheduled tasks today. Checklist item kept for completeness/
      future-proofing only, not a blocker.

### G. Mail
- [ ] A domain mailbox/SMTP account can be created (e.g.
      `noreply@kencomanufactur.co.id` or `website@kencomanufactur.co.id`)
      through cPanel Email Accounts
- [ ] SMTP host/port/encryption the panel issues for that mailbox
- [ ] Outbound port (587/465/25) isn't blocked by the hosting network (some
      budget shared hosts block outbound 25 specifically — 587 with TLS is
      usually fine)

### H. SSL
- [ ] SSL certificate active on the domain (AutoSSL / Let's Encrypt via
      cPanel is standard and free — confirm it's actually issued once DNS
      points at the host)
- [ ] HTTP → HTTPS redirect configured (either via `.htaccess` rule or
      cPanel's "Force HTTPS Redirect" toggle)
- [ ] Certificate auto-renewal confirmed (AutoSSL renews automatically;
      manually-issued certs do not — confirm which kind is in use)

### I. Deployment
- [ ] FTP available (known: yes, used previously)
- [ ] **SFTP** available (usually the same credentials as SSH on cPanel —
      confirm explicitly, since SFTP is strictly preferable to plain FTP:
      encrypted, and works with the same key/credential model as SSH)
- [ ] Full SSH-based deploy (git pull or artifact upload +
      composer/artisan commands run remotely) confirmed possible — this is
      the recommended method, see Part E below
- [ ] If SSH deploy is *not* practical for some reason discovered during
      verification, document exactly why (e.g. jailed shell, no outbound
      git access) so 11A.2 can plan the FTP fallback deliberately rather
      than defaulting to it

### J. Backup
- [ ] Does the hosting plan include automatic backups (many cPanel hosts
      offer daily/weekly snapshots as part of the plan — confirm tier)
- [ ] Can a DB-only backup/export be triggered manually (`mysqldump` over
      SSH, or cPanel's "Backup" → database export)
- [ ] Can uploaded media (`storage/app/public`, `storage/app/private`) be
      backed up/downloaded on demand (file manager, SFTP, or SSH tar/zip)

---

## Mail recommendation

**Preferred, in priority order:**
1. **Domain-owned SMTP** (`noreply@kencomanufactur.co.id` or
   `website@kencomanufactur.co.id`) issued by the hosting's Email Accounts
   feature — if the checklist (§G) confirms it's reliable (not rate-limited
   or frequently flagged as spam by the shared IP pool many budget hosts
   share across customers).
2. If hosting SMTP proves unreliable (common failure mode on shared
   hosting: the shared outbound IP has poor sender reputation, deliverability
   suffers) — fall back to a **transactional email provider** (Brevo or
   Postmark) sending *as* `noreply@kencomanufactur.co.id` via SMTP relay or
   API, with the domain's SPF/DKIM records pointing at the provider.

**Never** a personal Gmail account as the production sender — not
recommended, not implemented.

Must be checked/decided before configuring (documented here, not yet done):
SMTP host, port, username, encryption (TLS/SSL), sender address
verification, SPF record for the sending domain, DKIM record (from
whichever provider ends up sending), DMARC policy if the company wants one
(optional, stricter anti-spoofing).

No secrets are configured anywhere in this repo as part of this audit.

## Queue / scheduler recommendation

- **Current queue usage: none.** Grepped the entire `app/` tree for
  `dispatch(`/`::dispatch`/`ShouldQueue` — zero matches, zero `Job` classes
  exist. Contact form submissions and job applications are stored
  synchronously; **no email is even sent today** (no `Mail::` usage found
  anywhere in the codebase — confirms email is not yet wired up at all,
  independent of hosting).
- **Recommendation**: keep `QUEUE_CONNECTION=sync` (or `database`, which is
  already the `.env.example` default and costs nothing extra — it just sits
  unused) for production initially. Do **not** require Redis. Do **not**
  require Supervisor. If email sending is added later (e.g. contact-form
  notifications) and volume grows enough that synchronous SMTP calls
  noticeably slow form submissions, switch `QUEUE_CONNECTION=database` and
  run `php artisan queue:work` — only if the hosting confirmed a way to keep
  a long-running process alive (Supervisor, or a cPanel-provided "Setup
  Node.js/Python App"-style process manager), which is unconfirmed (§C).
  Until then, this is explicitly **not needed**.
- **Scheduler: no scheduled tasks exist** (`routes/console.php` only has the
  default `inspire` Artisan command). No cron job should be created "just in
  case" — that's dead infrastructure. If a future phase adds a real
  scheduled task (e.g. expiring old sessions, pruning old activity logs),
  the cPanel cron entry would be:
  ```
  * * * * * php /absolute/path/to/artisan schedule:run >> /dev/null 2>&1
  ```
  The exact absolute path is unknown until the document-root question (§E)
  is resolved — do not guess it.

## Staging recommendation

Recommend `staging.kencomanufactur.co.id` as a subdomain pointing at a
second copy of the app (separate database, separate `.env`, same codebase).

```
feature/development → GitHub → CI (tests + build) → staging deploy
    → smoke test → manual approval → production deploy
```

Why: this is a corporate-facing production site for a real company — the
cost of a broken production deploy (broken images, broken forms, exposed
`.env`) is reputational, not just technical. A staging environment gives a
real, hosting-identical rehearsal step before every production deploy,
catches shared-hosting-specific surprises (symlink support, PHP CLI/web
version mismatches, upload limits) *before* they hit the live domain, and
costs only one extra subdomain + one extra (small) database on hosting that
already supports multiple databases/subdomains per account. No DNS/subdomain
was created as part of this audit — this is a recommendation for 11A.2.

## Deployment protocol recommendation

**Priority: SSH/SFTP-based deploy over FTP**, if the checklist confirms SSH
is usable for deployment purposes (not just interactive login).

Why SSH is preferred over the previously-used FTP workflow:
- `artisan migrate --force`, `artisan config:cache`/`route:cache`/
  `view:cache`, `artisan storage:link`, and `composer install --no-dev` all
  need to actually **run** on the server — FTP can only transfer files, it
  cannot execute anything, so an FTP-only workflow would require either
  manually SSHing in anyway after every upload (defeating the point) or
  never running these commands at all (leaving stale caches / missing
  migrations / missing symlinks after every deploy).
- File permissions (`storage/`, `bootstrap/cache/` writability) are far
  easier to get right and keep right via SSH (`chmod`/`chown` as needed)
  than via an FTP client's permission dialog, which varies by client and is
  easy to get subtly wrong.
- Health checks and rollback are only practical with shell access — being
  able to `curl` the `/up` endpoint immediately after deploy and, if it
  fails, restore the previous release directory, is an SSH-shaped workflow.
- FTP remains the documented fallback only if the hosting checklist (§I)
  turns up a genuine restriction on SSH-based deployment (e.g. a jailed
  shell that blocks `composer`/`artisan` execution even though login works)
  — this should not be assumed now.

## Backup strategy (recommendation)

- **Before every migration/deployment**: a database dump (`mysqldump` over
  SSH, or cPanel's export) and, if any migration touches file storage
  conventions, a snapshot of `storage/app/public` + `storage/app/private`.
- **Routine**: daily automated DB backup if the hosting plan supports it
  (§J); otherwise a scripted `mysqldump` via cron once the cron checklist
  item is resolved. Media backup on a slower cadence (weekly is reasonable
  — media changes far less often than the database) is fine given generally
  low churn expected on a corporate profile site.
- **Retention**: a rolling 7–14 day window for daily backups is a reasonable
  starting point for a site this size; adjust once real backup-storage costs
  on the actual hosting plan are known.
- No backup package is installed in this repo as part of this audit (e.g.
  `spatie/laravel-backup` is not currently a dependency) — noting it as an
  option to consider in 11A.2 if hosting-native backups turn out to be
  insufficient, not installing it now.

## Downtime strategy

Target: **minimal**, not strict zero-downtime — appropriate for a corporate
profile site with no e-commerce checkout or high-frequency traffic. A few
minutes of `php artisan down` during a rare deploy is an acceptable
trade-off against the complexity of true zero-downtime (blue/green releases,
symlink-swapped release directories) on shared hosting, unless the company
later states a stricter SLA requirement.

Recommended sequence per deploy: build assets in CI beforehand → upload/sync
the new release → `php artisan down` only for the brief window that
actually needs it (migration + cache rebuild) → run migration → `artisan
optimize` (config/route/view cache) → `artisan up` → hit `/up` as an
immediate health check → roll back (restore previous release/DB backup)
immediately if it fails.

## Health check

`bootstrap/app.php` already configures Laravel's built-in health route:
`health: '/up'` (Laravel 11+ default `/up` endpoint — returns 200 with a
minimal view, no auth required, no elaborate checks). This is sufficient for
a basic "the app booted and can serve a response" smoke test and needs no
changes for Phase 11A.1. Deeper health checks (DB connectivity check,
storage-writable check) are out of scope for this audit phase — revisit only
if 11A.2's deploy pipeline needs a stronger signal than "process is up."

## Production security readiness — flags found (not fixed, audit only)

| Item | Status | Risk if unaddressed |
|---|---|---|
| `APP_DEBUG` | `.env.example` currently has `APP_DEBUG=true` (correct for **local dev**, this file's committed default) | Must be explicitly `false` in the real production `.env` — Laravel's debug page leaks stack traces, `.env` values, and full file paths if left `true` in production. Not currently a risk (nothing is deployed), but a **must-verify item** before any go-live. |
| `.env` exposure | Not in git (`.gitignore` covers it, confirmed standard Laravel skeleton behavior); `public/.htaccess` doesn't need to block it since it lives outside `public/` | Low risk given standard Laravel directory layout is respected — but if the document-root workaround in §E option 3 (copying `public/*` into `public_html`) is ever needed, must double-check `.env` and the rest of the app directory stay **outside** the web-servable root. |
| storage exposure | `storage/app/private` is not web-servable (outside `public/`), correct by default | None currently. |
| Debug tooling in prod deps | None found — no `barryvdh/laravel-debugbar`, no Telescope, no Clockwork in `composer.json` | None. |
| Dev/test-only packages | `require-dev` correctly separates Pest/Breeze/Pail/Faker/Pint from `require` — a `composer install --no-dev` on the server will correctly exclude all of them | None, as long as `--no-dev` is actually used at deploy time (must be enforced in 11A.2's pipeline). |
| CORS | No custom `config/cors.php` published; Laravel's default (permissive only for `api/*` paths, which this app doesn't meaningfully use — it's a same-origin Inertia app) | Low risk for this app's shape; revisit only if a public API is ever added. |
| Trusted proxies | Not configured (`bootstrap/app.php` has no `->trustProxies()` call) | If the host sits behind any reverse proxy/load balancer/CDN (common on shared hosting via a caching layer, or if Cloudflare proxying is later added), Laravel may misdetect the client IP/HTTPS scheme without this. Worth setting up in 11A.2 once the actual network path is known — unknown today. |
| HTTPS | SSL/HTTPS not yet active anywhere (nothing deployed) | See checklist §H. |
| Session cookies | `SESSION_SECURE_COOKIE` unset in `.env.example` (defaults to Laravel's own auto-detection); `SESSION_DRIVER=database` (not file — good, works identically on shared hosting DB-wise) | Must be explicitly `true` in the production `.env` once HTTPS is confirmed active — see §17 recommended values below. |
| File permissions | Unverified (server unknown) | See checklist §A/§E. |

None of the above are Phase 11A.1 blockers by themselves — they're the exact
list Phase 11A.2/production cutover must resolve before go-live.

## GitHub Actions audit

**No `.github/workflows` directory exists in this repository.** There is
currently no CI, no automated test run on push, and no deploy workflow of
any kind — nothing to preserve or avoid breaking, a clean slate for 11A.2/
11A.3.

### Target pipeline design (proposal only — not implemented)

```
Push/merge to main
  → composer install (with dev deps, for testing)
  → php artisan test
  → npm ci
  → npx tsc --noEmit
  → npm run build
  → package deploy artifact (app code + vendor via server-side composer
     install, or a built artifact per §5's decision)
  → deploy to staging
  → smoke test (hit /up, spot-check a few public routes)
  → manual approval gate
  → production database backup
  → deploy to production
  → composer install --no-dev --optimize-autoloader (server-side)
  → php artisan migrate --force
  → php artisan config:cache && route:cache && view:cache
  → php artisan storage:link (idempotent — safe to re-run)
  → health check (/up)
```

This is a proposal for Phase 11A.2/11A.3 to implement — no workflow files
were created in this phase.

---

## Branding cleanup — "Kenco Manufacturing" → "PT. Kenco Manufactur Indonesia"

### Approach

The site already had a centralized branding source from earlier phases:
`SiteSettings.company_name` (a Settings → General field), shared into every
Inertia page via `HandleInertiaRequests`, consumed by `PublicLayout`,
`PublicFooter`, `StructuredDataService::organization()` (JSON-LD `name`),
and `SeoService` (title-format company-name suffix). This meant the actual
rebrand touchpoint was almost entirely **one Settings value**, not a
repo-wide find/replace of live content.

What still needed a code change was the **hardcoded fallback string** used
when that setting is empty (fresh installs, or before an admin ever visits
Settings) — these existed in 4 places, all now updated to
`"PT. Kenco Manufactur Indonesia"`:

- `resources/js/layouts/PublicLayout.tsx` — footer/navbar fallback
- `resources/js/components/public/PublicFooter.tsx` — footer fallback
- `resources/js/pages/public/Home.tsx` — the "homepage has no sections yet"
  empty-state H1 (was fully hardcoded, not even settings-aware before —
  fixed to read `siteSettings.company_name` with the new fallback)
- `.env.example` — `APP_NAME` (affects the browser-tab title suffix and
  `MAIL_FROM_NAME` default)

One additional real fix, not just a string swap:
`resources/js/layouts/AuthLayout.tsx` (the `/admin/login` page's logo/brand
text) was **fully hardcoded** with no Settings-awareness at all — this was
the one genuine centralization gap. Fixed by wiring it to
`usePage().props.siteSettings.company_name` (same pattern as the other three
files) instead of just swapping the literal string, so future rebrands (or
per-admin customization) won't require another repo-wide edit.

The local development database's `company_name` setting row was also
updated (`PT. Kenco Manufactur Indonesia`) for demo/QA consistency — this is
runtime data, not a repo change, and has no bearing on production (which
starts with an empty Settings table and must have this set once during
initial admin setup, see §5's seeding-strategy recommendation).

### Regression check

`grep -rn "Kenco Manufacturing"` across the entire repository (excluding
`vendor/`, `node_modules/`, `.git/`, build output) after cleanup: **zero
occurrences remaining.**

### Intentionally retained — reviewed individually

- `docs/PHASE-9A-UI-AUDIT.md` — contains the bare word "Kenco" (not the full
  "Kenco Manufacturing" phrase) three times, in narrative sentences from an
  earlier design-review audit ("what Kenco makes", "establish who Kenco
  is..."). **Retained**: this is a historical record of a past analysis
  session, not live branding — rewriting it would misrepresent what was
  actually observed/written at the time. Does not appear anywhere
  user-visible.
- `database/seeders/AdminUserSeeder.php`'s `ADMIN_DEV_EMAIL=admin@kenco.test`
  default (in `.env.example`) — **retained**: this is a placeholder
  *technical* dev-credential domain (`.test` is the IANA-reserved
  non-resolvable TLD for local development, deliberately not a real email),
  not a company-branding string. Renaming it wouldn't change anything
  user-visible and risks confusion with a real domain if someone assumed
  `kenco.test` needed to resolve to anything.
- Test fixture strings using the *old* name as arbitrary test data (e.g. one
  unrelated test in `SettingsManagementTest.php` using `'Kenco Public Name'`
  to verify the settings-update mechanism generically) were left as-is where
  they don't contain the literal retired phrase — only exact matches of
  "Kenco Manufacturing" were changed, and all of those were updated (see
  above; the two tests that did contain the literal phrase,
  `SeoMetadataTest.php` and `StructuredDataTest.php`, were updated to the
  new name so their assertions stay meaningful, not just passing by
  coincidence).

Nothing was renamed at the identifier level: no PHP namespace, class name,
database table/column name, config key, route name, or domain was touched —
all changes were user-visible display strings only, per instruction.

---

## Production `.env` — recommended values (documentation only, nothing applied)

`.env.example` already documents the shape of every variable needed
(`APP_*`, `DB_*`, `MAIL_*`, `FILESYSTEM_*`, `CACHE_*`, `SESSION_*`,
`QUEUE_CONNECTION`) with no secrets — it did not need structural changes
beyond the `APP_NAME` branding fix above. For the actual production `.env`
(to be created directly on the server in 11A.2, never committed), the
recommended values are:

```
APP_NAME="PT. Kenco Manufactur Indonesia"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://kencomanufactur.co.id

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=<confirmed via checklist §B>
DB_PORT=3306
DB_DATABASE=<cpanel-assigned name>
DB_USERNAME=<cpanel-assigned user>
DB_PASSWORD=<real secret, set directly on server>

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_ENCRYPT=false

FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=<from checklist §G>
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@kencomanufactur.co.id"
MAIL_FROM_NAME="${APP_NAME}"
```

No real credentials appear above or anywhere in this audit — every value
that would be a secret is a placeholder pointing at "confirmed via
checklist."

---

## Production blocking issues (as of this audit)

None of these block *starting* Phase 11A.2 planning, but each must be
resolved before an actual production deploy:

1. **Document root support unconfirmed** (§E) — the single highest-risk
   unknown; determines the entire deploy directory layout.
2. **Symlink support unconfirmed** (§E) — determines whether the `public`
   disk architecture works as-is or needs a route-based fallback.
3. **PHP CLI vs. web version match unconfirmed** (§C) — a known cPanel
   footgun for Composer/Artisan-driven deploys.
4. **Mail is entirely unconfigured** — not just unconfirmed-hosting, but
   genuinely not implemented in the app at all yet (no `Mail::` usage
   anywhere). Contact-form/job-application notifications, if wanted, are a
   separate feature, not just a config change.
5. **`APP_DEBUG`/`SESSION_SECURE_COOKIE`/HTTPS** must be explicitly set
   correctly at cutover — currently only documented as recommendations, not
   yet applied anywhere (nothing is deployed).

## Proposed architecture for Phase 11A.2

1. Confirm every checklist item in Part D above (user, in cPanel/SSH).
2. Based on the document-root finding, decide the deploy directory layout
   (direct `public/` docroot vs. addon-domain vs. `public_html` copy
   pattern).
3. Stand up `staging.kencomanufactur.co.id` first; rehearse the full deploy
   sequence there before touching production.
4. Implement the GitHub Actions pipeline proposed above, gated at the
   manual-approval step before production.
5. Create the production database and run the seeding strategy from §"5.
   Production database plan" (migration + `RolePermissionSeeder` +
   `AdminUserSeeder` only — no demo content).
6. Cut DNS over to the confirmed working deploy only after a successful
   staging smoke test.

## User actions required in cPanel (summary)

Everything in Part D's checklist, concretely:
- Verify PHP version + extensions (§A)
- Create nothing yet, but confirm database creation works (§B)
- Test SSH login and note CLI PHP version + Composer/Git availability (§C)
- Note whether Node/npm exist (informational only, §D)
- **Determine the document-root situation** — this is the one item most
  likely to need back-and-forth with hosting support (§E)
- Test `symlink()` support (§E)
- Check cPanel Cron Jobs UI exists, even though nothing needs it yet (§F)
- Create a test mailbox and note its SMTP details (§G)
- Confirm AutoSSL/Let's Encrypt is available for the domain once DNS points
  at it (§H)
- Confirm SFTP/SSH-deploy is usable, not just FTP (§I)
- Note what backup options the hosting plan includes (§J)

## Go / No-Go checklist

Not ready to deploy until **all** of the following are true — none are true
yet, this is the target state for the end of 11A.2:

- [ ] Document root / deploy layout decided and confirmed working
- [ ] `storage:link` (or its fallback) confirmed working on the actual host
- [ ] PHP version + all required extensions confirmed present on production
- [ ] Production database created, with a scoped-privilege user
- [ ] Production `.env` created directly on server (never committed) with
      `APP_ENV=production`, `APP_DEBUG=false`, correct `APP_URL`,
      `SESSION_SECURE_COOKIE=true`
- [ ] SSL active and HTTP→HTTPS redirect confirmed
- [ ] Staging rehearsal completed successfully at least once
- [ ] Migration run (`--force`) + `RolePermissionSeeder` +
      `AdminUserSeeder` completed, admin login verified, no demo/sample
      content seeded
- [ ] `/up` returns 200 on the live domain
- [ ] Backup taken immediately before first production traffic is allowed
- [ ] Mail decision made and tested (domain SMTP or transactional provider)
      — acceptable to ship without this if the company accepts that contact
      forms currently don't send email at all (pre-existing, unrelated to
      hosting)

---

## Validation run (this phase)

```
php artisan test        → 249/249 passed
npx tsc --noEmit         → clean
npm run build            → clean
```

Manual verification: homepage navbar/footer, `/admin/login` branding, all
confirmed showing "PT. Kenco Manufactur Indonesia" after the Settings value
update (local dev only — no production access used).
