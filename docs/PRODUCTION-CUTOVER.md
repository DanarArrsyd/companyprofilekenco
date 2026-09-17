# Production Cutover — Kenco Manufacturing

This is the human-run checklist for switching `kencomanufactur.co.id` from
the legacy PHP Native site to the Laravel application. It is written to be
followed top to bottom, in order, by whoever runs the cutover. Nothing in
this document has been executed as part of Phase 11A.3 — this phase only
prepares the repository, scripts, and documentation for this checklist to
exist and be ready when cutover is explicitly approved.

**Do not start this checklist without explicit, separate approval to cut
over production.** Preparing the repository (Phase 11A.3) is not that
approval.

## Before you start

Confirm all of these are true. If any is not, stop and fix it first —
do not proceed with a partial prerequisite.

- [ ] Staging has been running the same release with no open issues for a
      reasonable soak period.
- [ ] `docs/PRODUCTION-ENV.md` has been followed: `application/.env` exists
      on the production server, `APP_KEY` has been generated (and is
      **different** from staging's), `DB_DATABASE`/`DB_USERNAME`/
      `DB_PASSWORD` point at a real, dedicated production database that
      already exists.
- [ ] GitHub Secrets exist for the `production` environment:
      `PRODUCTION_HOST`, `PRODUCTION_PORT`, `PRODUCTION_USER`,
      `PRODUCTION_SSH_PRIVATE_KEY`, `PRODUCTION_PATH` — a dedicated SSH
      keypair, not staging's.
- [ ] The `production` GitHub Environment has required-reviewer protection
      configured in repo settings (Settings → Environments → production →
      Required reviewers), so `workflow_dispatch` on
      `deploy-production.yml` cannot run unattended.
- [ ] A maintenance window has been communicated to whoever needs to know
      (internal stakeholders, anyone who might notice a brief outage).
- [ ] You have read `scripts/deploy-production.sh` in full and understand
      its PREPARE vs CUTOVER modes (see the comment block at its top).
- [ ] You have read `docs/PRODUCTION-ROLLBACK.md` and know exactly what
      you'll do if a step below fails.

## The sequence

### 1. Announce maintenance window

Tell whoever needs to know that a brief interruption is expected around
the cutover time. The legacy site stays up through step 6 — the actual
window is only steps 7–10.

### 2. Final legacy site backup

Run, over SSH, from the production server:

```bash
bash scripts/backup-legacy-site.sh
```

This tars `public_html/` (the current legacy site) to
`backups/legacy/legacy-site-files-<timestamp>.tar.gz` without modifying
anything. If the legacy site has its own database, supply its credentials
inline for this run only (see the script's header comment):

```bash
LEGACY_DB_NAME=... LEGACY_DB_USER=... LEGACY_DB_PASSWORD=... \
  bash scripts/backup-legacy-site.sh
```

Verify the resulting file(s) are non-empty and, ideally, copy them
somewhere off-server too.

### 3. Final legacy DB backup

Covered by step 2 if the legacy site has a database and credentials were
supplied. If the legacy site is static/flat-file only, note that
explicitly and skip.

### 4. Verify Laravel application ready

Run the deploy workflow in PREPARE mode (the default — leave "Confirm
cutover" blank):

```bash
gh workflow run deploy-production.yml --ref main
```

This builds, tests, rsyncs to `incoming/`, and runs
`scripts/deploy-production.sh` with no `CUTOVER_CONFIRM` set — it prepares
`application/` and the staged `public_html_new/`, but never touches the
live `public_html/`. Confirm the run succeeds and ends with "PREPARE
complete."

### 5. Verify production DB connection

Still safe, still read-only against the live site. Over SSH:

```bash
/opt/alt/php83/usr/bin/php /home/u518638233/domains/kencomanufactur.co.id/application/artisan db:show
```

Confirm it connects to the correct, dedicated production database (not
staging's).

### 6. Run migrations

This is the first step that touches the production database — it happens
automatically as part of the confirmed cutover run (step 7), not
separately, because `scripts/deploy-production.sh` backs up the database
immediately before migrating as one atomic sequence. Do not migrate by
hand ahead of time.

### 7. Switch `public_html` safely

This is the actual cutover. Trigger the workflow with cutover confirmed:

```bash
gh workflow run deploy-production.yml --ref main -f confirm_cutover=SWITCH-PRODUCTION-NOW
```

If GitHub Environment protection is configured (it should be, per the
prerequisites above), this pauses for the required reviewer(s) to approve
before the job actually runs.

On the server, this one confirmed run does, in order: backs up the
production database, runs migrations, optimizes caches, and atomically
renames the current `public_html/` to
`backups/legacy/public_html-<timestamp>/` before renaming the staged
`public_html_new/` into `public_html/`. See
`scripts/deploy-production.sh`'s own comments for the exact mechanics.

### 8. Storage symlink

Verified automatically as part of step 7 (`public_html_new/storage ->
../application/storage/app/public`, created before the swap so it's
already correct the instant the swap happens).

### 9. Optimize

Also automatic as part of step 7 (`config:cache`, `route:cache`,
`view:cache`).

### 10. Health check

Automatic: `scripts/deploy-production.sh` curls `https://kencomanufactur.co.id/up`
immediately after bringing the app out of maintenance mode. **If this
fails, the script automatically rolls back** (restores the previous
`public_html/`) and exits non-zero — you do not need to manually roll back
in that case, but you do need to investigate before retrying.

### 11. Public smoke tests

Automatic, in the workflow's "Smoke test" step (only runs when cutover was
confirmed): `/`, `/admin/login`, `/products`, `/news`, `/contact`,
`/sitemap.xml`, `/robots.txt`.

Manually, also check:

- [ ] Homepage loads with real content (not an empty-state fallback) —
      if this is the very first real content, that's expected; if content
      that should exist is missing, investigate before calling this done.
- [ ] CSS/JS assets load (check browser devtools network tab, not just
      HTTP status).
- [ ] No mixed-content warnings (everything over HTTPS).
- [ ] Uploaded media (`/storage/...` paths) load correctly — this
      specifically exercises the storage symlink.

### 12. Admin login test

Log into `/admin/login` with a real admin account and confirm the
dashboard loads. Do not leave this for "later" — an admin who can't log in
means content can't be managed until fixed.

### 13. Robots/sitemap verification

- [ ] `https://kencomanufactur.co.id/robots.txt` reflects **production**
      rules (allowing indexing) — not the non-production blanket
      `noindex, nofollow` that staging and any non-production environment
      always force (see `app/Services/SeoService.php`'s `finalize()`).
      Production is the only `APP_ENV` where full indexing should be
      allowed.
- [ ] `https://kencomanufactur.co.id/sitemap.xml` is well-formed and lists
      real URLs.

### 14. Remove maintenance mode

Already automatic (step 7's script calls `artisan up` right after the
swap, before the health check). Confirm the site is not showing a
maintenance page.

### 15. Monitor errors

Watch `application/storage/logs/laravel.log` for the first while after
cutover (tail it over SSH). Watch for anything unexpected — a clean log is
the goal, not just a 200 on the homepage.

### 16. Rollback if critical checks fail

If steps 10–13 reveal a critical problem that the script's own automatic
rollback didn't already catch (e.g., homepage 200s but admin login is
broken, or content is visibly wrong), follow
`docs/PRODUCTION-ROLLBACK.md` immediately. Don't try to "fix forward" under
pressure during the maintenance window — roll back, investigate calmly,
retry later.

## What this checklist deliberately does NOT do

- It does not change DNS. `kencomanufactur.co.id` continues pointing at
  the same Hostinger server throughout — only what `public_html/` serves
  changes.
- It does not delete the legacy site. It is renamed into
  `backups/legacy/public_html-<timestamp>/` and stays there.
- It does not touch `staging.kencomanufactur.co.id` in any way.
