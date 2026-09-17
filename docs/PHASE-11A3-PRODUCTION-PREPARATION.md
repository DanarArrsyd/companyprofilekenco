# Phase 11A.3 — Production Deployment Preparation

Status: **preparation only — no production deployment or cutover has
occurred.** This phase prepares the repository, scripts, workflow, and
documentation needed for a future, separately-approved production cutover.
It does not touch the live `kencomanufactur.co.id` site, its database, or
DNS in any way.

## Scope: PREPARATION vs DEPLOYMENT vs CUTOVER vs ROLLBACK

These four terms are used precisely and differently throughout this
phase's documentation:

- **PREPARATION** (this phase, Phase 11A.3): writing scripts, workflow,
  and docs. Nothing runs against the production server. This document.
- **DEPLOYMENT** (safe, repeatable, non-disruptive): running
  `scripts/deploy-production.sh` in its default mode — syncs
  `incoming/` into `application/`, runs `composer install`, and builds a
  staged `public_html_new/` that is never served. The live legacy site at
  `public_html/` is never touched. Safe to run as many times as needed to
  keep a release warm ahead of a scheduled cutover. See
  `.github/workflows/deploy-production.yml` (triggered with "Confirm
  cutover" left blank) or run the script directly over SSH.
- **CUTOVER** (the one disruptive, approval-gated event): running
  `scripts/deploy-production.sh` with `CUTOVER_CONFIRM=SWITCH-PRODUCTION-NOW`
  set — backs up the production database, migrates, optimizes, and
  atomically swaps `public_html_new/` into `public_html/` (the previous
  `public_html/` is renamed, never deleted, into `backups/legacy/`). Full
  human checklist: `docs/PRODUCTION-CUTOVER.md`.
- **ROLLBACK**: reversing a cutover, either automatically (the script
  itself, if the post-swap health check fails) or manually (a human,
  following `docs/PRODUCTION-ROLLBACK.md`, for a problem the health check
  didn't catch).

## What this phase built, based on the proven staging pattern

Phase 11A.2 proved the split-layout deployment pattern on staging
(`application/` outside the docroot, `public_html/` holding only the
front controller, `.htaccess`, and built static assets — see
`docs/PHASE-11A2-STAGING-DEPLOYMENT.md`). That pattern is reused as-is for
production. The one structural difference: on staging, `public_html/` was
empty/available from the start; on production, `public_html/` is
currently the **live legacy PHP Native site** and cannot simply be
rsynced over. See "Production directory layout" below for how that's
handled.

## Production directory layout

Target, mirroring staging's proven structure:

```
/home/u518638233/domains/kencomanufactur.co.id/
├── application/          # full Laravel app — prepared here first, safe
├── incoming/              # rsync target from CI, same pattern as staging
├── public_html_new/       # staged Laravel public/ output — NOT live, built ahead of cutover
├── backups/
│   ├── legacy/             # legacy public_html snapshots (renamed here during cutover, plus standalone backups)
│   └── db/                 # production DB backups (production-*.sql.gz)
└── public_html/            # LIVE docroot — legacy site today, becomes Laravel's public/ output only at cutover
```

The key departure from a naive "copy the staging setup" approach:
`public_html_new/` is an extra staging area that does not exist in the
staging environment's own layout, added specifically because staging never
had to coexist with something already live in its docroot. Production
does. `public_html_new/` lets the entire Laravel release — composer
install, built assets, storage symlink — be fully prepared and verified
*before* the live docroot is touched, so the actual cutover is a fast
rename instead of a slow rsync, minimizing the live-traffic-affecting
window to seconds.

`public_html/` is switched only during the explicit, confirmed cutover
step — never during ordinary preparation/deployment runs. See
`scripts/deploy-production.sh`'s own header comment for the exact
mechanics, and `docs/PRODUCTION-CUTOVER.md` for the full human procedure.

## Backup strategy

Three distinct backups, each covering something different:

1. **Legacy site files** — `scripts/backup-legacy-site.sh`. Tars
   `public_html/` in place, read-only, to
   `backups/legacy/legacy-site-files-<timestamp>.tar.gz`. Run manually,
   ahead of the cutover window, as many times as wanted.
2. **Legacy database**, if one exists — same script, only if
   `LEGACY_DB_NAME`/`LEGACY_DB_USER` (and optionally
   `LEGACY_DB_PASSWORD`) are supplied for that run. We don't know the
   legacy site's database credentials or config location (it's a
   hand-built site outside this repo), so nothing is assumed or
   hardcoded — this step is explicitly opt-in.
3. **Production Laravel database** — `scripts/backup-production-db.sh`,
   same pattern as `scripts/backup-staging-db.sh`: reads credentials out
   of `application/.env` at runtime, never hardcodes or prints them,
   outputs to `backups/db/production-<db>-<timestamp>.sql.gz`.
   Additionally invoked **automatically** by `scripts/deploy-production.sh`
   immediately before every migration during a confirmed cutover — the
   deploy script refuses to migrate if this backup doesn't produce a
   non-empty file.

**Naming**: `<label>-<db-or-"files">-<timestamp>.{sql.gz,tar.gz}`,
`YYYYMMDD-HHMMSS` timestamps, consistent with the staging scripts.

**Retention**: none of these scripts ever delete an existing backup.
Retention/cleanup is a manual, separate decision — not automated here, to
avoid ever automatically deleting the one thing a rollback depends on.

**Restore procedure**: documented in full in `docs/PRODUCTION-ROLLBACK.md`.

No backup was taken during this phase — Step 3 of the phase brief was
preparation of the *strategy and scripts* only, explicitly not execution.

## Deployment strategy

`scripts/deploy-production.sh`, modeled directly on the proven
`scripts/deploy-staging.sh`, with these production-specific additions:

- Hard guard checks at the very top (before touching any file) verifying
  the domain root path, `.env`'s `APP_ENV`, `APP_URL`, `APP_KEY`
  non-empty, and `DB_DATABASE`/`DB_USERNAME` non-empty — refuses to run
  at all if any of these look wrong. See "Safety guards" below.
- PREPARE/CUTOVER mode split (see above) — the single biggest structural
  difference from staging, which has no live site to protect and so
  performs its rsync into `public_html/` unconditionally.
- Automatic database backup immediately before every migration, with a
  hard fail if the backup is missing or empty.
- Atomic-as-possible `public_html` swap via `mv`, never `rm -rf` +
  rebuild, and never deleting the previous `public_html/` — only renaming
  it into `backups/legacy/`.
- Automatic rollback (restores the previous `public_html/`) if the
  post-swap health check or homepage smoke check fails.

## Cutover strategy

Full checklist: `docs/PRODUCTION-CUTOVER.md`. Summary: legacy backup →
verify Laravel app ready (PREPARE run) → verify DB connection → confirmed
CUTOVER run (DB backup → migrate → optimize → atomic swap → health check,
with automatic rollback built in) → manual verification (admin login,
robots/sitemap, error log monitoring) → done, or roll back.

## Rollback strategy

Full procedure: `docs/PRODUCTION-ROLLBACK.md`. Two cases: automatic
(the deploy script's own health-check-triggered rollback — the common
case, requires no manual action) and manual (a human restores the
timestamped legacy backup from `backups/legacy/` for a problem the health
check didn't catch). DNS is never involved in rollback because it's never
involved in cutover.

## Safety guards

Implemented directly in `scripts/deploy-production.sh` (see STEP 9 of the
phase brief this responds to):

| Guard | Where |
|---|---|
| Wrong path (not exactly the production domain root) | Guard check #1, before anything else runs |
| Path accidentally contains "staging" | Guard check #2 |
| `APP_ENV` not `production` | Guard check, reads `.env` directly |
| `APP_URL` not the production URL | Guard check |
| Empty `APP_KEY` | Guard check |
| Missing `DB_DATABASE`/`DB_USERNAME` | Guard check |
| Missing Vite build manifest | Checked after building `public_html_new/`, before it can ever be swapped in |
| Missing `public_html_new/index.php` | Same check |
| Failed/empty database backup | Checked before migrate ever runs; migrate is skipped entirely if this fails |
| Failed migration | `set -euo pipefail` — any migration error aborts the script before the swap happens |
| Failed `/up` health check post-swap | Triggers automatic rollback |
| Failed homepage smoke check post-swap | Triggers automatic rollback |

No step in `scripts/deploy-production.sh`, `scripts/backup-production-db.sh`,
`scripts/backup-legacy-site.sh`, or `.github/workflows/deploy-production.yml`
uses `continue-on-error` or `|| true` around anything that represents a
real failure. The only `|| true` in the deploy script is around
`artisan down` during setup, matching the staging script's existing
pattern (maintenance mode failing to engage shouldn't block a backup from
being attempted, and the trap-based cleanup still runs `artisan up`
afterward regardless).

## GitHub Actions

`.github/workflows/deploy-production.yml` — `workflow_dispatch` only,
never on push, uses the `production` GitHub Environment (configure
required-reviewer protection on this environment in repo settings before
ever confirming a real cutover — see `docs/PRODUCTION-CUTOVER.md`'s
prerequisites), and reads only `PRODUCTION_*`-named secrets — never
`STAGING_*` — so a naming mistake can't silently point production
deployment at staging credentials or vice versa. Runs the full test/build
pipeline (Pest, `tsc`, `npm run build`) before ever touching SSH. Defaults
to PREPARE mode; cutover requires the `confirm_cutover` input to be typed
exactly as `SWITCH-PRODUCTION-NOW`. **Not triggered during this phase.**

## What was NOT done in this phase

- No production deployment.
- No production database changes (no migration, no backup taken — the
  scripts exist and were validated for syntax only).
- No DNS changes.
- No modification, deletion, rename, or move of the legacy PHP Native
  site or its files.
- No GitHub Actions workflow was triggered.
- No GitHub Secrets were created, read, or guessed — this document only
  names the secrets `deploy-production.yml` expects
  (`PRODUCTION_HOST`, `PRODUCTION_PORT`, `PRODUCTION_USER`,
  `PRODUCTION_SSH_PRIVATE_KEY`, `PRODUCTION_PATH`), consistent with how
  `docs/PHASE-11A2-STAGING-DEPLOYMENT.md` named staging's without ever
  creating them.

## Prerequisites still required before any real cutover

Same shape as staging's equivalent list in
`docs/PHASE-11A2-STAGING-DEPLOYMENT.md`, plus the production-specific
items:

- [ ] Production MySQL database created (dedicated, not shared with
      legacy or staging).
- [ ] `application/.env` created manually on the production server per
      `docs/PRODUCTION-ENV.md`.
- [ ] Production `APP_KEY` generated (unique from staging's).
- [ ] Dedicated production SSH deploy keypair generated (not staging's).
- [ ] Five `PRODUCTION_*` GitHub Secrets configured.
- [ ] `production` GitHub Environment created with required-reviewer
      protection.
- [ ] SSL already active on `kencomanufactur.co.id` (expected — it's
      already live).
- [ ] Explicit, separate approval to begin the cutover checklist itself.
