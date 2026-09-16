# Phase 11A.2 — Staging Deployment Architecture

Status at the end of this phase: **everything is prepared and repository-side
ready. No deployment has actually happened yet.** Production
(`kencomanufactur.co.id`, the legacy PHP-native site) was never touched.
GitHub Actions has not been connected to the real staging server — that
requires the user to create GitHub Secrets first (Part 16).

---

## 1. Verified Hostinger environment

Facts given for this phase, treated as verified (not re-derived):

| | |
|---|---|
| Hosting | Hostinger shared hosting / hPanel |
| Production domain | `https://kencomanufactur.co.id` — legacy PHP-native site, must stay online, untouched |
| Staging domain | `https://staging.kencomanufactur.co.id` |
| Staging document root | `/home/u518638233/domains/staging.kencomanufactur.co.id/public_html` (fixed — Hostinger does not allow changing it) |
| Staging current contents | `default.php` (Hostinger placeholder) |
| Production document root | `/home/u518638233/domains/kencomanufactur.co.id/public_html` — **out of scope, never referenced by anything in this phase** |
| SSH | Available |
| SFTP | Verified working |
| PHP CLI default | 8.1.x — **never invoke plain `php` for this project** |
| PHP 8.3 binary | `/opt/alt/php83/usr/bin/php` (verified 8.3.33) |
| Composer | 2.9.8 — must be invoked as `/opt/alt/php83/usr/bin/php $(which composer) ...` |
| Git | Available |
| Node/npm | **Not installed, not required** |
| Symlink support | Verified supported |
| MySQL/MariaDB client, mysqldump, curl | Available |

## 2. Directory structure

```
/home/u518638233/domains/staging.kencomanufactur.co.id/
├── application/                  ← full Laravel app, OUTSIDE the document root
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/                  ← runtime: uploads, logs, sessions, cache
│   ├── vendor/                   ← installed server-side by Composer, not shipped
│   ├── deploy/staging/public_html/  ← source of truth for the two split-layout files
│   ├── scripts/deploy-staging.sh
│   ├── artisan
│   ├── composer.json / composer.lock
│   ├── .env                      ← created once, manually, never committed
│   └── public/                   ← Laravel's own public dir; NOT web-served directly
│       └── build/                ← Vite output lands here first
├── public_html/                  ← the actual web-servable document root
│   ├── index.php                 ← split-layout version (deploy/staging/public_html/index.php)
│   ├── .htaccess                 ← verbatim copy of Laravel's own public/.htaccess
│   ├── build/                    ← mirrored from application/public/build/ on every deploy
│   ├── favicon.ico
│   └── storage -> ../application/storage/app/public   (symlink)
├── incoming/                     ← deploy staging area; rsync target from CI, merged into application/ by the deploy script
└── backups/db/                   ← mysqldump output (see scripts/backup-staging-db.sh)
```

## 3. Why the application lives outside `public_html`

Hostinger's hPanel does not allow pointing `staging.kencomanufactur.co.id`'s
document root anywhere other than its fixed `public_html`. Laravel, however,
is designed to have its own `public/` directory be the document root — that
directory is the *only* thing meant to be web-servable; everything else
(`app/`, `config/`, `.env`, `database/`, the framework itself) must stay
outside it, because there is nothing else stopping a web request from
requesting `.env` directly and reading it in plain text if it were ever
inside a served directory.

Since `public_html` can't be pointed at `application/public/`, the two are
kept as **separate, sibling directories**: the full application lives in
`application/`, entirely outside the web-servable tree, and only the handful
of files a browser actually needs to fetch directly (the compiled JS/CSS,
`index.php`, `.htaccess`, favicon) live in `public_html/`. This is a
well-established pattern for Laravel on this exact class of shared hosting
— not a workaround unique to this project.

## 4. `index.php` path adjustment

`deploy/staging/public_html/index.php` is Laravel's own `public/index.php`
(Laravel 13, logic completely unmodified) with exactly the three path
references that used to say `__DIR__.'/../X'` changed to
`__DIR__.'/../application/X'`, because `public_html/index.php`'s `__DIR__`
is `public_html` itself, and the app now lives in the sibling `application/`
directory rather than one level up from a `public/` that's inside the app.
Nothing about Laravel's bootstrap logic itself was touched — see the file
for the exact diff (it's three lines).

## 5. `.htaccess` strategy

`deploy/staging/public_html/.htaccess` is a byte-for-byte copy of Laravel's
own `public/.htaccess`. It needed **no changes** — every rule in it is
relative to whatever directory it lives in (it just routes non-file,
non-directory requests to `index.php` in the same folder), so copying it
into `public_html` unmodified is correct. No attempt was made to write a
clever rewrite rule that proxies `public_html` requests into
`application/public` — per the phase brief, security here comes from the
application being outside the document root entirely, not from `.htaccess`
gymnastics trying to hide it while it's still reachable.

## 6. Public asset sync

`scripts/deploy-staging.sh` (§8 below) mirrors `application/public/*` into
`public_html/`, **excluding** `storage` (the symlink, never touched by the
sync — see §14), and excluding `.htaccess`/`index.php`/`default.php` (those
three are handled separately and deliberately, not by the generic mirror —
see the script and §14/§4/§5 for why). It uses `rsync -a` (not `--delete`)
for this specific sync so nothing Hostinger-specific that might legitimately
live in `public_html` gets removed by surprise; the removal of the
Hostinger placeholder `default.php` is its own explicit, guarded step (only
once Laravel's `index.php` is confirmed in place).

## 7. PHP 8.3 binary

Every command in `scripts/deploy-staging.sh` and this documentation
explicitly uses `/opt/alt/php83/usr/bin/php` — never bare `php`, which
would resolve to the default 8.1.x CLI and silently run this Laravel
13/PHP-8.3-only codebase on an unsupported PHP version.

## 8. Composer command

```bash
/opt/alt/php83/usr/bin/php $(which composer) install \
  --no-dev --prefer-dist --no-interaction --optimize-autoloader \
  --working-dir=/home/u518638233/domains/staging.kencomanufactur.co.id/application
```

This is exactly what `scripts/deploy-staging.sh` runs. `vendor/` is
installed **server-side** from the committed `composer.lock` (deterministic,
no version drift), never shipped as part of the CI artifact — see the
Phase 11A.1 audit for the reasoning (avoids PHP-build/extension-ABI mismatch
risk between the CI runner and the actual hosting PHP build, and keeps the
rsync payload small).

## 9. Node/CI strategy

Node/npm are confirmed **not installed** on Hostinger and are **not
required** — the production/staging PHP runtime never invokes Node in any
way. All frontend building (`npm ci`, `npx tsc --noEmit`, `npm run build`)
happens exclusively in GitHub Actions (`.github/workflows/ci.yml` and
`.github/workflows/deploy-staging.yml`); only the compiled output
(`public/build/**`) is shipped to the server. Nothing in this phase runs
`npm install`/`npm ci`/`npm run build` on Hostinger, and nothing should ever
try to.

## Public path audit — is a `PUBLIC_PATH` override actually needed?

The phase brief asked to audit this carefully rather than assume either
way. Every `public_path()`-touching mechanism in this codebase was checked:

- **Vite manifest resolution** (`laravel-vite-plugin`'s Blade directive):
  reads `public_path('build/manifest.json')` **server-side, in PHP**, purely
  to know which hashed filename to reference when rendering `<script>`/
  `<link>` tags. Since `public_path()` defaults to `application/public`
  (Laravel's own, unmoved public directory) — and that is exactly where
  `npm run build` originally writes `build/manifest.json` before the deploy
  script *also* mirrors a copy into `public_html/build/` — this resolves
  correctly with **no override needed**. The manifest read and the actual
  browser-facing asset fetch are two entirely separate paths: PHP reads the
  manifest from `application/public/build/`, the browser fetches the actual
  `.js`/`.css` files via a plain HTTP request straight to
  `public_html/build/...`, served by Apache directly, never touching PHP or
  `public_path()` at all.
- **`asset()` / URL generation**: builds a string from `APP_URL`, doesn't
  touch the filesystem — unaffected either way.
- **`storage_path()` / `base_path()` / `config_path()`**: all resolve
  relative to Laravel's own base path (`application/`), which is correct
  and unaffected by where the document root physically is.
- **The one actual `public_path()` call in this entire codebase** is
  `config/filesystems.php`'s `'links' => [public_path('storage') => ...]`
  — used only by `artisan storage:link`. This command is **deliberately not
  used** on this host (see §14) precisely because it would create the
  symlink inside `application/public/storage`, which is never served. The
  deploy script creates the correct `public_html/storage` symlink directly
  instead, bypassing this entirely.
- **Sitemap/robots responses**: `SitemapController` and `RobotsController`
  build their output from `url()`/database queries and a Blade view — no
  `public_path()` involvement.

**Conclusion: no `PUBLIC_PATH` override, no `bootstrap/app.php` change, and
no `usePublicPath()` call were implemented.** One was attempted and reverted
during this phase — see the note in Part 22 (Troubleshooting) for exactly
what broke and why it was rolled back; the working conclusion is that the
override is genuinely unnecessary for this architecture, not merely
untested.

## 10. Database creation steps (hPanel — user action required)

Not automated, not guessed. In hPanel:

1. Create a **new, staging-specific** MySQL database (do not reuse or
   pre-empt whatever the future production database will be named).
2. Create a **new, staging-specific** database user.
3. Grant that user full privileges on that one database only.
4. Note the DB host hPanel gives you (commonly `localhost` on shared
   hosting, but confirm — do not assume).
5. Set charset/collation to `utf8mb4` / `utf8mb4_unicode_ci` at creation
   time if hPanel exposes that choice (matches `config/database.php`'s
   defaults).

## 11. `.env` setup

See `docs/STAGING-ENV.md` for the full recommended template (no secrets).
Created once, by hand, directly on the server at
`application/.env` — never generated or overwritten by any script in this
repo. `scripts/deploy-staging.sh` explicitly refuses to run at all if
`.env` is missing, and never touches it if present (verified via
`rsync --exclude ".env"` on every sync).

## 12. Migration

```bash
/opt/alt/php83/usr/bin/php /home/u518638233/domains/staging.kencomanufactur.co.id/application/artisan migrate --force
```

`--force` is required because `APP_ENV=staging` is not `local`, and Laravel
refuses to run migrations outside `local` without it — this is intentional
Laravel safety, not something to route around. All migrations in this
project are additive (verified in Phase 11A.1's audit) and safe to run
against a fresh, empty staging database. This is also exactly what
`scripts/deploy-staging.sh` runs automatically on every deploy — running it
by hand is only needed for troubleshooting.

## 13. Seeders

Run **only** these two, and only once, after the first successful
migration:

```bash
/opt/alt/php83/usr/bin/php artisan db:seed --class=Database\\Seeders\\RolePermissionSeeder
/opt/alt/php83/usr/bin/php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder
```

(Run from inside `application/`, or with `--working-dir`-equivalent paths —
same pattern as the migrate command above.)

**Do not** run any demo/sample content seeder — this project's local
development database has ad-hoc demo Articles/Products/Milestones/
Vacancies created via tinker scripts purely for local UI verification during
earlier phases; none of that is real company content and none of it should
ever reach staging or production.

## Admin creation

`AdminUserSeeder` is environment-aware: set `ADMIN_DEV_EMAIL` and
`ADMIN_DEV_PASSWORD` in `.env` temporarily before running it (a real email
you control, a real strong password you choose — not committed anywhere),
or leave `ADMIN_DEV_PASSWORD` blank and the seeder will generate and print a
random one **once**, to the console output of that single command. Either
way:

1. Run the seeder once.
2. Log in at `https://staging.kencomanufactur.co.id/admin/login`
   immediately to confirm it worked.
3. Rotate the password from the admin UI itself if you used the
   auto-generated one.
4. Remove/blank `ADMIN_DEV_EMAIL`/`ADMIN_DEV_PASSWORD` from `.env`
   afterward — they have no further purpose once the account exists.

## 14. Storage symlink

**Verified, deliberate, non-default approach** — per the phase brief's own
warning, `artisan storage:link` was audited and confirmed to be the wrong
tool here: it would create the symlink at
`application/public/storage`, which is never served by Apache (only
`public_html` is), making it silently useless.

`scripts/deploy-staging.sh` instead creates the correct link directly:

```bash
ln -s ../application/storage/app/public /home/u518638233/domains/staging.kencomanufactur.co.id/public_html/storage
```

The script checks this idempotently on every deploy: if the symlink already
exists and points at the right target, it leaves it alone; if it exists but
points somewhere unexpected, or if a real file/directory already occupies
that path, the script **fails loudly** rather than silently overwriting
something that might be real data — see the script's comments.

## 15. Private storage

`application/storage/app/private` (CVs from job applications, private
certification documents) sits inside `application/`, which is entirely
outside `public_html` — there is no URL path that can reach it directly.
These files are only ever served through the existing authenticated admin
download routes (unchanged by this phase). No additional action was needed
to keep them private; the split-layout architecture already guarantees it
structurally, which is a stronger guarantee than relying on `.htaccess`
rules to block access to a directory that's technically still inside the
document root.

## 16. GitHub Actions

Two workflows were created:

- **`.github/workflows/ci.yml`** — runs on every push and pull request.
  Backend job: PHP 8.3, `composer install`, `php artisan test`. Frontend
  job: Node 20, `npm ci`, `npx tsc --noEmit`, `npm run build`, uploads
  `public/build` as a workflow artifact. Fails the whole workflow if any
  step fails. This has no deploy capability at all — it cannot reach
  staging or production.
- **`.github/workflows/deploy-staging.yml`** — **manual trigger only**
  (`workflow_dispatch`), deliberately, per the phase brief ("prefer manual
  workflow_dispatch initially until the staging workflow is proven
  reliable"). Rebuilds the frontend itself (self-contained, doesn't depend
  on a separate CI run's artifact), loads an SSH deploy key, `rsync`s the
  built tree to the server's `incoming/` directory (excluding `.git`,
  `node_modules`, `tests`, `.env`, `storage`, and the local dev
  `public/storage` symlink), then SSHes in once to run
  `scripts/deploy-staging.sh`, then runs a smoke test against the listed
  public routes. This workflow **only ever references the staging path** —
  no production host, path, or credential appears anywhere in it.

Neither workflow can currently run against the real server — see Part 24 for
exactly what's still needed (GitHub Secrets).

## 17. GitHub Secrets required

None of these have been created or guessed. Names only, no values:

| Secret | Purpose |
|---|---|
| `STAGING_HOST` | Hostinger server hostname/IP for SSH |
| `STAGING_PORT` | SSH port |
| `STAGING_USER` | SSH username |
| `STAGING_SSH_PRIVATE_KEY` | Private half of a **dedicated deploy keypair** (see Part 22 below) — never a personal workstation key |
| `STAGING_PATH` | `/home/u518638233/domains/staging.kencomanufactur.co.id` (the domain root, not `public_html` and not `application` — the workflow/script derive both from this) |

Configured in GitHub under the repository's `staging` **environment**
(referenced by `environment: staging` in `deploy-staging.yml`) so they can
optionally be gated with required reviewers later — not configured as plain
repository secrets, to keep the door open for that.

## SSH key recommendation

Generate a **dedicated deploy keypair**, not a reuse of any personal
workstation key:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy-staging" -f ./staging_deploy_key -N ""
```

- The **public** half (`staging_deploy_key.pub`) goes into the staging
  account's `~/.ssh/authorized_keys` on Hostinger (hPanel's SSH Access
  section, or appended manually over an existing SSH session).
- The **private** half (`staging_deploy_key`) goes into the
  `STAGING_SSH_PRIVATE_KEY` GitHub Secret, and nowhere else — delete the
  local copy after it's in GitHub Secrets.
- If Hostinger's shared-hosting SSH setup only supports a single key per
  account (no scoping to specific paths/commands), least-privilege here
  means: this key's *only* practical use is running
  `scripts/deploy-staging.sh` and the `rsync` step — nothing in this
  project's automation ever uses it for anything else, and it should not be
  reused for any other purpose (personal login, other projects, etc).
- If Hostinger's account-level SSH access cannot be restricted to key-only
  auth (i.e. password auth must stay enabled for the account's own regular
  use), that's a hosting-level trade-off outside this phase's control —
  document it, don't attempt to disable password SSH access as a side
  effect of this phase.

## 18. First deployment

See Part 24 ("Ready for staging deployment") below — this is the checkpoint
this phase stops at. First deployment has **not** happened.

## 19. Subsequent deployment

Once the first deployment has succeeded manually-verified, subsequent
deploys are: push changes → manually trigger
`Deploy to Staging` from the GitHub Actions tab (still `workflow_dispatch`
at this point) → it rebuilds, syncs, and re-runs
`scripts/deploy-staging.sh`, which is safe to re-run repeatedly (idempotent
symlink handling, `.env`/`storage` never touched, migrations are additive).

## 20. Health check

`GET /up` (Laravel's built-in health route, unchanged from Phase 11A.1's
audit) — `scripts/deploy-staging.sh` itself calls this via `curl -fsS` as
its last step and **exits non-zero if it fails**, so a broken deploy is
never silently reported as successful.

## Smoke tests

`deploy-staging.yml`'s final step additionally checks (not relying on `/up`
alone, per the phase brief): `/`, `/admin/login`, `/products`, `/news`,
`/contact`, `/sitemap.xml`, `/robots.txt`.

## 21. Rollback concept

No automated rollback was built in this phase (out of scope — this is the
*first* rehearsal). The manual rollback path, if a deploy leaves staging
broken:

1. `application/.env` and `application/storage/` were never touched by the
   deploy — they're already safe.
2. If the *code* is the problem: re-run `deploy-staging.yml` against a
   previous known-good commit (checkout that commit, dispatch the workflow
   manually), which re-syncs `incoming/` and re-runs the deploy script
   against it.
3. If a *migration* is the problem: restore the most recent
   `scripts/backup-staging-db.sh` dump (see Part 18 of the original scope —
   staging backup) before re-attempting.
4. If the server is left mid-deploy in maintenance mode: the deploy
   script's `trap cleanup EXIT` runs `artisan up` even on failure, so this
   should self-heal; if it doesn't (e.g. the script itself couldn't start),
   manually run `php artisan up` from `application/`.

A more formal release-directory-based rollback (keeping N previous releases,
symlink-swapping between them) is a reasonable future improvement but was
judged unnecessary complexity for a first staging rehearsal on a corporate
profile site — revisit if staging deploys become frequent enough to justify
it.

## 22. Troubleshooting

- **A `PUBLIC_PATH`/`bootstrap/app.php` override was attempted and reverted
  during this phase.** The initial approach added an early,
  manually-invoked `Dotenv::createImmutable(...)->safeLoad()` call inside
  `bootstrap/app.php` (to make `env('PUBLIC_PATH')` available before
  Laravel's own environment-loading bootstrapper runs) plus a
  `$app->usePublicPath(...)` call. This caused **79 of 249 tests to fail**
  locally — session/auth/CSRF failures across the board — almost certainly
  because invoking `vlucas/phpdotenv` directly bypasses Laravel's own
  `Illuminate\Support\Env` repository-adapter setup, putting environment
  state into an inconsistent shape relative to what the framework's normal
  bootstrap expects later in the same request. The change was fully
  reverted (`git checkout -- bootstrap/app.php`), tests confirmed back to
  249/249, and — per the Public Path Audit above — it turned out to be
  **unnecessary anyway**, so nothing was lost by removing it. If a future
  phase genuinely needs an early-available env value before framework
  bootstrap, don't repeat this approach; investigate Laravel's documented
  extension points for this instead (e.g. a custom `LoadEnvironmentVariables`
  bootstrapper, or setting real server-level environment variables via
  Apache `SetEnv` in `public_html/.htaccess`, which requires no PHP-side
  workaround at all).
- **PHP CLI mismatch**: if any command silently behaves like PHP 8.1
  instead of 8.3 (e.g. a syntax error on something that's valid PHP 8.3),
  double check the full `/opt/alt/php83/usr/bin/php` path was used — `php`
  alone resolves to 8.1.x on this host, confirmed in Phase 11A.1.
- **`storage:link` was run by mistake**: if `application/public/storage`
  ends up existing as a stray symlink, it's harmless (unserved, ignored) —
  just don't confuse it for the real, required `public_html/storage` link.
- **Health check fails after deploy**: check
  `application/storage/logs/laravel.log` first (SSH in, `tail -n 100`). Most
  likely causes for a first-deploy failure: `.env` missing/misconfigured
  (script should have already refused to run in that case), the staging
  database not actually created/reachable yet, or the storage symlink
  pointing at the wrong target (script checks and fails loudly on this too,
  see §14).
- **`rsync` step in the GitHub Actions workflow fails**: almost always an
  SSH connectivity/auth issue — confirm `STAGING_HOST`/`STAGING_PORT` are
  exactly what hPanel shows, confirm the deploy key's public half is
  actually in `~/.ssh/authorized_keys` on the server, and confirm
  `ssh-keyscan` in the workflow can actually reach the host (some hosts
  firewall the SSH port from unexpected source ranges — GitHub Actions
  runner IPs are not fixed/allowlistable, so this would need to be an open
  port, not IP-restricted).

---

## 23. Ready for staging deployment — user checkpoint

**Everything repository-side is prepared. Nothing has been deployed. Do not
proceed to an actual first deployment run until all of the following are
complete** — none of these can be done by this session (no hosting/GitHub
credentials, and the phase brief explicitly requires stopping here):

1. **Staging database created** in hPanel (Part 10) — name, user, password
   noted somewhere safe (a password manager, not a chat log).
2. **`application/.env` created manually** on the server (Part 11 /
   `docs/STAGING-ENV.md`), with the real staging DB credentials from step 1.
3. **`APP_KEY` generated** on the server, once, after `.env` exists.
4. **`application/` and `incoming/` directories exist** on the server (can
   be empty/`mkdir -p`'d ahead of the first deploy — the deploy script
   creates what it needs, but the parent dirs and `.env` must pre-exist).
5. **A dedicated SSH deploy keypair generated**, public half installed on
   the Hostinger account, private half ready to paste into a GitHub Secret
   (Part "SSH key recommendation").
6. **GitHub Secrets configured**: `STAGING_HOST`, `STAGING_PORT`,
   `STAGING_USER`, `STAGING_SSH_PRIVATE_KEY`, `STAGING_PATH` (Part 17).
7. **SSL active** on `staging.kencomanufactur.co.id` (AutoSSL via hPanel,
   confirm it issued successfully once DNS/the subdomain is live) — the
   deploy script's health check and the workflow's smoke test both hit
   `https://`, they will fail on plain HTTP.
8. **First `incoming/` population for the very first run**: since
   `scripts/deploy-staging.sh` doesn't exist on the server yet before the
   first deploy, the very first run must either (a) be triggered via the
   GitHub Actions workflow once secrets are set (it rsyncs everything,
   including the script itself, before invoking it), or (b) a one-time
   manual `rsync`/`scp` of this repository (built, per §9) into
   `incoming/` followed by manually running
   `bash incoming/scripts/deploy-staging.sh` over SSH once. Either path
   works; (a) is preferred since it's the same path every subsequent deploy
   will use.

Once all of the above are done, triggering `Deploy to Staging` from the
GitHub Actions tab performs the actual first rehearsal. **This session did
not do that, and does not have the credentials to.**

---

## 24. Local validation (this phase)

```
php artisan test        → 249/249 passed
npx tsc --noEmit         → clean
npm run build            → clean
```

Shell scripts checked with `bash -n` (syntax-only validation, no execution):
`scripts/deploy-staging.sh` and `scripts/backup-staging-db.sh` both pass.

Both scripts were manually reviewed to confirm:
- No secrets/credentials are hardcoded anywhere (`backup-staging-db.sh`
  reads DB credentials out of the server's own `.env` at runtime; nothing
  is echoed).
- No reference anywhere to the production path
  (`kencomanufactur.co.id`/`.../domains/kencomanufactur.co.id/...`) — every
  path is the staging one, and the domain root is `staging.` explicitly.
- No destructive wildcard deletes — every `rsync` either omits `--delete`
  where deletion would be unsafe (the `public_html` mirror step) or scopes
  `--delete` to a controlled, excludes-protected sync (the
  `incoming/` → `application/` step, which excludes `.env`, `storage/`,
  `vendor/`, `.git/`, `node_modules/`).
