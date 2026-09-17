# Production Rollback — Kenco Manufacturing

What to do if the production cutover (`docs/PRODUCTION-CUTOVER.md`) needs
to be reversed — either automatically (the deploy script already did it)
or manually (you're doing it by hand because something the script
couldn't detect went wrong).

## Case 1 — the deploy script already rolled back automatically

`scripts/deploy-production.sh` rolls back on its own if, immediately after
the `public_html` swap, either:

- `https://kencomanufactur.co.id/up` fails, or
- `https://kencomanufactur.co.id/` doesn't return HTTP 200.

In that case the script has already:

1. Deleted the just-swapped-in Laravel `public_html/`.
2. Renamed the previous legacy `public_html/` (from
   `backups/legacy/public_html-<timestamp>/`) back into place as
   `public_html/`.
3. Exited non-zero with a clear "Cutover rolled back" message.

**The legacy site is already live again at this point.** DNS was never
touched. Nothing further is required to restore service — go straight to
"After any rollback" below, then investigate the failure before retrying
cutover.

## Case 2 — manual rollback (something else went wrong)

Use this if the automated health check passed (so the script did not
auto-rollback) but a later manual check — admin login, visibly wrong
content, an error spike in the logs — shows a critical problem.

### Restore previous `public_html`

Find the most recent legacy backup (the swap in
`scripts/deploy-production.sh` step 8 creates exactly one of these per
cutover attempt, named with a timestamp):

```bash
ls -t /home/u518638233/domains/kencomanufactur.co.id/backups/legacy/public_html-*/ 2>/dev/null | head -n1
```

Then, over SSH, as the production user:

```bash
DOMAIN_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
LATEST_LEGACY="$(ls -td "${DOMAIN_ROOT}"/backups/legacy/public_html-*/ | head -n1)"

# Put the Laravel public_html aside instead of deleting it, in case its
# state is needed to diagnose what went wrong.
mv "${DOMAIN_ROOT}/public_html" "${DOMAIN_ROOT}/backups/legacy/public_html-failed-$(date +%Y%m%d-%H%M%S)"

# Restore the legacy site.
mv "$LATEST_LEGACY" "${DOMAIN_ROOT}/public_html"
```

Verify:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://kencomanufactur.co.id/
```

Should return the legacy site's normal response.

### Restore previous legacy database, if relevant

Only needed if migrations already ran against a shared/legacy database
(they should not have — the Laravel app is expected to use its own
dedicated database, per `docs/PRODUCTION-ENV.md` — but if that assumption
turns out to be wrong, or the legacy site's own database was affected for
any reason):

```bash
DOMAIN_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
LATEST_LEGACY_DB="$(ls -t "${DOMAIN_ROOT}"/backups/legacy/legacy-site-db-*.sql.gz 2>/dev/null | head -n1)"
[ -n "$LATEST_LEGACY_DB" ] && echo "Restore from: $LATEST_LEGACY_DB" || echo "No legacy DB backup found — legacy site may not have its own database."
```

Restoring a `mysqldump` backup:

```bash
gunzip -c "$LATEST_LEGACY_DB" | mysql --host=<host> --user=<user> -p <legacy_db_name>
```

(Run only against the legacy database itself, with its own credentials —
never against the Laravel application's dedicated production database.)

### Restore Laravel's production database, if migrations caused a problem

`scripts/deploy-production.sh` always takes a fresh database backup
immediately before running migrations, and refuses to migrate if that
backup is missing or empty. To restore it:

```bash
DOMAIN_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
LATEST_DB_BACKUP="$(ls -t "${DOMAIN_ROOT}"/backups/db/production-*.sql.gz | head -n1)"
echo "Restoring from: $LATEST_DB_BACKUP"

gunzip -c "$LATEST_DB_BACKUP" | mysql --host=<host> --user=<user> -p <production_db_name>
```

Use the exact `DB_HOST`/`DB_USERNAME`/`DB_DATABASE` from
`application/.env` (read them, never print them in a shared terminal/log).

### DNS

Never touched by any of the above. No DNS rollback is ever needed — DNS
was never part of this cutover in the first place; only what
`public_html/` serves on the existing server changes.

## After any rollback

- [ ] Confirm `https://kencomanufactur.co.id/` serves the legacy site
      correctly.
- [ ] Confirm `https://kencomanufactur.co.id/up` is no longer reachable/
      relevant (legacy site has no such route — a 404 there is expected
      and fine post-rollback).
- [ ] Check `application/storage/logs/laravel.log` for the exception that
      caused the rollback, and read it fully before attempting cutover
      again.
- [ ] Do not delete the failed Laravel `public_html-failed-<timestamp>/`
      or the pre-cutover legacy backup until the root cause is understood
      and fixed.
- [ ] Communicate the rollback and revised timeline to whoever was told
      about the maintenance window.
- [ ] Fix the root cause, re-verify on staging first, then restart
      `docs/PRODUCTION-CUTOVER.md` from the top — do not resume partway
      through.
