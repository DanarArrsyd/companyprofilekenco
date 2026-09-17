#!/usr/bin/env bash
#
# Production deploy script — runs ON THE HOSTINGER SERVER over SSH.
#
# This script is PRODUCTION ONLY. It hardcodes the production domain path
# and refuses to run against anything else (see the guard checks below).
#
# ---------------------------------------------------------------------------
# TWO MODES — this is the whole safety model of this script
# ---------------------------------------------------------------------------
#
# 1. PREPARE (default — this is what running the script normally does):
#      sync incoming/ -> application/, composer install, run the Laravel
#      app's public/ output into a STAGED, NOT-YET-LIVE directory called
#      public_html_new/. It never touches the real public_html/ (the live
#      legacy PHP Native site) and never touches the production database.
#      Safe to run as many times as needed to keep the prepared release
#      warm and current before a cutover is scheduled.
#
# 2. CUTOVER (only with explicit confirmation — see below):
#      everything PREPARE does, plus: back up the production database,
#      run migrations, optimize caches, and atomically swap public_html_new/
#      into public_html/ (the previous public_html/ is renamed, never
#      deleted, into backups/legacy/ — see scripts/backup-legacy-site.sh
#      for a standalone full backup of it before this point). If the
#      post-swap health check fails, this script automatically swaps the
#      previous public_html/ back and exits non-zero.
#
#      Cutover only runs when invoked as:
#        CUTOVER_CONFIRM=SWITCH-PRODUCTION-NOW bash scripts/deploy-production.sh
#      Any other invocation — including a bare `bash scripts/deploy-production.sh`
#      — runs PREPARE only. There is no flag, no interactive prompt shortcut,
#      and no default that performs a cutover. This is deliberate: it must
#      be impossible to switch production by accident.
#
# See docs/PRODUCTION-CUTOVER.md for the full, human-run cutover checklist
# this script is one part of — do not run this script as the only step of
# a real cutover; read that document first.
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Explicit paths — production only. Do not parameterize this into also
# accepting a staging path; scripts/deploy-staging.sh is the separate,
# already-proven script for staging and must not be touched by this file.
# ---------------------------------------------------------------------------
DOMAIN_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
APP_DIR="${DOMAIN_ROOT}/application"
PUBLIC_DIR="${DOMAIN_ROOT}/public_html"
NEW_PUBLIC_DIR="${DOMAIN_ROOT}/public_html_new"
INCOMING_DIR="${DOMAIN_ROOT}/incoming"
BACKUP_ROOT="${DOMAIN_ROOT}/backups"
LEGACY_BACKUP_DIR="${BACKUP_ROOT}/legacy"
DB_BACKUP_DIR="${BACKUP_ROOT}/db"

PHP_BIN="/opt/alt/php83/usr/bin/php"
HEALTH_URL="https://kencomanufactur.co.id/up"
HOMEPAGE_URL="https://kencomanufactur.co.id/"
EXPECTED_APP_URL="https://kencomanufactur.co.id"

CUTOVER="${CUTOVER_CONFIRM:-}"
CUTOVER_TOKEN="SWITCH-PRODUCTION-NOW"

log() { echo "[deploy-production] $*"; }
fail() { echo "[deploy-production] FAILED: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 0. Guard checks — refuse to run anywhere except exactly this production
#    path, and refuse to proceed with an obviously-wrong environment. These
#    checks run before ANYTHING else touches the filesystem.
# ---------------------------------------------------------------------------
[[ "$DOMAIN_ROOT" == "/home/u518638233/domains/kencomanufactur.co.id" ]] \
    || fail "DOMAIN_ROOT does not match the expected production path — refusing to run."
[[ "$DOMAIN_ROOT" != *"staging"* ]] \
    || fail "DOMAIN_ROOT contains 'staging' — this script must never run against staging. Use scripts/deploy-staging.sh."
[[ -x "$PHP_BIN" ]] || fail "PHP 8.3 binary not found at $PHP_BIN"
[[ -d "$INCOMING_DIR" ]] || fail "Nothing to deploy: $INCOMING_DIR does not exist. Upload a release there first."
[[ -f "${APP_DIR}/.env" ]] || fail ".env missing at ${APP_DIR}/.env — create it manually first (docs/PRODUCTION-ENV.md), this script will not create one."

COMPOSER_BIN="$(command -v composer || true)"
[[ -n "$COMPOSER_BIN" ]] || fail "composer not found on PATH"

# .env content is never printed (STEP 4 secrecy requirement) but its
# presence/shape is checked, since a wrong .env is exactly the kind of
# mistake this script exists to catch before it reaches production traffic.
env_get() { grep -E "^${1}=" "${APP_DIR}/.env" | tail -n1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//'; }

[[ "$(env_get APP_ENV)" == "production" ]] || fail ".env APP_ENV is not 'production' — refusing to deploy."
[[ "$(env_get APP_URL)" == "$EXPECTED_APP_URL" ]] || fail ".env APP_URL is not '${EXPECTED_APP_URL}' — refusing to deploy."
[[ -n "$(env_get APP_KEY)" ]] || fail ".env APP_KEY is empty — run 'artisan key:generate' on the server first (docs/PRODUCTION-ENV.md). Never copy APP_KEY from staging or local."
[[ -n "$(env_get DB_DATABASE)" ]] || fail ".env DB_DATABASE is empty — refusing to deploy."
[[ -n "$(env_get DB_USERNAME)" ]] || fail ".env DB_USERNAME is empty — refusing to deploy."

log "Target: ${DOMAIN_ROOT}"
log "PHP:    $("$PHP_BIN" -v | head -n1)"
log "Mode:   $([[ "$CUTOVER" == "$CUTOVER_TOKEN" ]] && echo "CUTOVER (public_html WILL be switched)" || echo "PREPARE only (public_html untouched)")"

# ---------------------------------------------------------------------------
# 1. Sync incoming release into application/ — never touch .env, storage/,
#    or vendor/ (vendor is rebuilt by Composer below, not shipped here).
#    Safe in both modes.
# ---------------------------------------------------------------------------
log "Syncing incoming release into ${APP_DIR}..."
mkdir -p "$APP_DIR"
rsync -a --delete \
    --exclude ".env" \
    --exclude "storage/" \
    --exclude "vendor/" \
    --exclude "node_modules/" \
    --exclude ".git/" \
    "${INCOMING_DIR}/" "${APP_DIR}/"

for dir in \
    app/public app/private \
    framework/cache/data framework/sessions framework/views framework/testing \
    logs
do
    mkdir -p "${APP_DIR}/storage/${dir}"
done

# ---------------------------------------------------------------------------
# 2. Install PHP dependencies (production, no dev tooling). Safe in both
#    modes — this only affects application/, never public_html/.
# ---------------------------------------------------------------------------
log "Running composer install..."
"$PHP_BIN" "$COMPOSER_BIN" install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --working-dir="$APP_DIR"

# ---------------------------------------------------------------------------
# 3. Build the STAGED public output in public_html_new/ — this is never the
#    live docroot. It exists so the cutover step below only has to do a
#    fast rename, not a slow rsync, while the site is briefly down.
#    Safe in both modes.
# ---------------------------------------------------------------------------
log "Preparing staged public output in ${NEW_PUBLIC_DIR}..."
mkdir -p "$NEW_PUBLIC_DIR"
rsync -a --delete \
    --exclude "storage" \
    --exclude ".htaccess" \
    --exclude "index.php" \
    "${APP_DIR}/public/" "${NEW_PUBLIC_DIR}/"

cp "${APP_DIR}/deploy/production/public_html/index.php" "${NEW_PUBLIC_DIR}/index.php"
cp "${APP_DIR}/deploy/production/public_html/.htaccess" "${NEW_PUBLIC_DIR}/.htaccess"

[[ -f "${NEW_PUBLIC_DIR}/build/manifest.json" ]] || fail "Vite manifest missing at ${NEW_PUBLIC_DIR}/build/manifest.json — frontend was not built before sync. Refusing to continue."
[[ -f "${NEW_PUBLIC_DIR}/index.php" ]] || fail "${NEW_PUBLIC_DIR}/index.php missing after copy — refusing to continue."

STAGED_STORAGE_LINK="${NEW_PUBLIC_DIR}/storage"
STAGED_STORAGE_TARGET="../application/storage/app/public"
if [[ -L "$STAGED_STORAGE_LINK" ]]; then
    CURRENT_TARGET="$(readlink "$STAGED_STORAGE_LINK")"
    [[ "$CURRENT_TARGET" == "$STAGED_STORAGE_TARGET" ]] \
        || fail "${STAGED_STORAGE_LINK} exists but points at '$CURRENT_TARGET', not '$STAGED_STORAGE_TARGET' — investigate before continuing."
elif [[ -e "$STAGED_STORAGE_LINK" ]]; then
    fail "${STAGED_STORAGE_LINK} exists and is NOT a symlink — refusing to overwrite automatically."
else
    log "Creating staged storage symlink: ${STAGED_STORAGE_LINK} -> ${STAGED_STORAGE_TARGET}"
    ln -s "$STAGED_STORAGE_TARGET" "$STAGED_STORAGE_LINK"
fi

if [[ "$CUTOVER" != "$CUTOVER_TOKEN" ]]; then
    log "PREPARE complete. public_html/ was NOT touched — the live legacy site is still serving all traffic."
    log "To perform the real cutover, re-run this script as:"
    log "  CUTOVER_CONFIRM=${CUTOVER_TOKEN} bash scripts/deploy-production.sh"
    log "Read docs/PRODUCTION-CUTOVER.md fully before doing that."
    exit 0
fi

# ===========================================================================
# Everything below here only runs when CUTOVER_CONFIRM is set correctly.
# From this point on, the script touches the production database and the
# live docroot.
# ===========================================================================
log "CUTOVER confirmed — proceeding with database backup, migration, and the public_html switch."

# ---------------------------------------------------------------------------
# 4. Maintenance mode on application/ (this doesn't affect public_html/ or
#    the legacy site's own traffic yet — it only prepares Laravel to refuse
#    requests the instant it does start receiving them post-swap).
# ---------------------------------------------------------------------------
log "Enabling maintenance mode on the staged application..."
"$PHP_BIN" "${APP_DIR}/artisan" down || true

ROLLBACK_DONE=0
cleanup() {
    if [[ "$ROLLBACK_DONE" -eq 0 ]]; then
        "$PHP_BIN" "${APP_DIR}/artisan" up || true
    fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# 5. Backup production database BEFORE migrating. Fail loudly and stop
#    (do not migrate) if the backup does not exist or is empty.
# ---------------------------------------------------------------------------
log "Backing up production database before migrating..."
bash "${APP_DIR}/scripts/backup-production-db.sh"
LATEST_DB_BACKUP="$(ls -t "${DB_BACKUP_DIR}"/production-*.sql.gz 2>/dev/null | head -n1 || true)"
[[ -n "$LATEST_DB_BACKUP" ]] || fail "No database backup file found after running backup-production-db.sh — refusing to migrate."
[[ -s "$LATEST_DB_BACKUP" ]] || fail "Database backup file ${LATEST_DB_BACKUP} is empty — refusing to migrate."
log "Database backup verified: ${LATEST_DB_BACKUP}"

# ---------------------------------------------------------------------------
# 6. Migrate. --force required because APP_ENV=production blocks migrate
#    without it. This only runs inside the CUTOVER branch, never PREPARE.
# ---------------------------------------------------------------------------
log "Running database migrations..."
"$PHP_BIN" "${APP_DIR}/artisan" migrate --force

# ---------------------------------------------------------------------------
# 7. Optimize caches.
# ---------------------------------------------------------------------------
log "Optimizing (config/route/view cache)..."
"$PHP_BIN" "${APP_DIR}/artisan" optimize:clear
"$PHP_BIN" "${APP_DIR}/artisan" config:cache
"$PHP_BIN" "${APP_DIR}/artisan" route:cache
"$PHP_BIN" "${APP_DIR}/artisan" view:cache

# ---------------------------------------------------------------------------
# 8. Atomic-as-possible public_html switch. The previous public_html/ (the
#    legacy site) is RENAMED, never deleted, into backups/legacy/ with a
#    timestamp — it can be renamed straight back by docs/PRODUCTION-ROLLBACK.md
#    at any time. No wildcard delete of public_html/ ever happens here.
# ---------------------------------------------------------------------------
mkdir -p "$LEGACY_BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LEGACY_MOVE_TARGET="${LEGACY_BACKUP_DIR}/public_html-${TIMESTAMP}"

[[ -e "$PUBLIC_DIR" ]] || fail "${PUBLIC_DIR} does not exist — nothing to swap out, this looks like an unexpected state. Investigate manually before continuing."
[[ ! -e "$LEGACY_MOVE_TARGET" ]] || fail "${LEGACY_MOVE_TARGET} already exists — refusing to overwrite a previous backup."

log "Moving current public_html/ (legacy site) to ${LEGACY_MOVE_TARGET}..."
mv "$PUBLIC_DIR" "$LEGACY_MOVE_TARGET"

log "Moving staged public_html_new/ into place as public_html/..."
mv "$NEW_PUBLIC_DIR" "$PUBLIC_DIR"

rollback_swap() {
    log "Rolling back: restoring previous public_html/ (legacy site)..."
    rm -rf "$PUBLIC_DIR"
    mv "$LEGACY_MOVE_TARGET" "$PUBLIC_DIR"
    ROLLBACK_DONE=1
    fail "Cutover rolled back — legacy site restored. See docs/PRODUCTION-ROLLBACK.md and investigate before retrying."
}

# ---------------------------------------------------------------------------
# 9. Bring the (now-live) Laravel app out of maintenance mode.
# ---------------------------------------------------------------------------
log "Restoring from maintenance mode..."
"$PHP_BIN" "${APP_DIR}/artisan" up

# ---------------------------------------------------------------------------
# 10. Health check + homepage smoke check. Automatic rollback if either
#     fails — production must never be left serving a broken Laravel app.
# ---------------------------------------------------------------------------
log "Health-checking ${HEALTH_URL}..."
if ! curl -fsS --max-time 15 "$HEALTH_URL" > /dev/null; then
    rollback_swap
fi

log "Smoke-checking ${HOMEPAGE_URL}..."
HOMEPAGE_STATUS="$(curl -s -o /dev/null --max-time 15 -w '%{http_code}' "$HOMEPAGE_URL" || echo "000")"
if [[ "$HOMEPAGE_STATUS" != "200" ]]; then
    rollback_swap
fi

log "Cutover complete. ${HOMEPAGE_URL} is healthy (HTTP ${HOMEPAGE_STATUS})."
log "Previous legacy site preserved at: ${LEGACY_MOVE_TARGET}"
log "Database backup taken before migration: ${LATEST_DB_BACKUP}"
