#!/usr/bin/env bash
#
# Production deploy script — runs ON THE HOSTINGER SERVER over SSH.
#
# This script is PRODUCTION ONLY. It hardcodes the production domain path
# and refuses to run against anything else (see the guard checks below).
#
# ---------------------------------------------------------------------------
# THREE MODES — this is the whole safety model of this script
# ---------------------------------------------------------------------------
#
# 1. PREPARE (default — what a bare `bash scripts/deploy-production.sh` does):
#      sync incoming/ -> application/, composer install, and build the
#      Laravel app's public/ output into a STAGED, NOT-YET-LIVE directory
#      called public_html_new/. It never touches the live public_html/ and
#      never touches the production database. Safe to repeat.
#
# 2. CUTOVER (first go-live only; refused once Laravel already serves
#    public_html/):
#        CUTOVER_CONFIRM=SWITCH-PRODUCTION-NOW bash scripts/deploy-production.sh
#      everything PREPARE does, plus: back up the production database,
#      optionally replace it with the staging content
#      (IMPORT_STAGING_CONTENT=1, see scripts/import-staging-content.sh),
#      migrate, optimize, and swap public_html_new/ into public_html/ (the
#      legacy site is renamed, never deleted, into backups/legacy/). If the
#      in-process smoke check fails after the swap, the legacy site is
#      swapped straight back and the script exits non-zero.
#
# 3. UPDATE (every release after go-live; refused while the legacy site
#    still serves public_html/):
#        UPDATE_CONFIRM=DEPLOY-PRODUCTION-UPDATE bash scripts/deploy-production.sh
#      the same release steps as scripts/deploy-staging.sh: maintenance
#      mode, database backup, sync public assets into public_html/
#      (public_html/storage untouched), migrate, optimize, smoke check.
#
# There is no flag, prompt shortcut or default that performs a cutover or
# an update: both need their exact token. See
# docs/deployment/PRODUCTION-CUTOVER.md before the first cutover.
#
# Hostinger specifics learned on staging (keep in sync with
# scripts/deploy-staging.sh):
#   - the PHP CLI has proc_open disabled, so composer runs with --no-scripts
#     and package discovery runs directly afterwards;
#   - the server cannot reach its own public URL through the CDN edge, so
#     health is proven in-process with `artisan app:smoke`; the workflow
#     checks the public URLs from the runner.
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
EXPECTED_APP_URL="https://kencomanufactur.co.id"

# Marker line in deploy/production/public_html/index.php: its presence in the
# live docroot means Laravel (not the legacy site) is serving production.
FRONT_CONTROLLER_MARKER="Production front controller"

CUTOVER_TOKEN="SWITCH-PRODUCTION-NOW"
UPDATE_TOKEN="DEPLOY-PRODUCTION-UPDATE"

log() { echo "[deploy-production] $*"; }
fail() { echo "[deploy-production] FAILED: $*" >&2; exit 1; }

if [[ "${CUTOVER_CONFIRM:-}" == "$CUTOVER_TOKEN" && "${UPDATE_CONFIRM:-}" == "$UPDATE_TOKEN" ]]; then
    fail "Both CUTOVER_CONFIRM and UPDATE_CONFIRM are set — pick one."
elif [[ "${CUTOVER_CONFIRM:-}" == "$CUTOVER_TOKEN" ]]; then
    MODE="cutover"
elif [[ "${UPDATE_CONFIRM:-}" == "$UPDATE_TOKEN" ]]; then
    MODE="update"
else
    MODE="prepare"
fi

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
[[ -f "${APP_DIR}/.env" ]] || fail ".env missing at ${APP_DIR}/.env — create it manually first (docs/deployment/PRODUCTION-ENV.md), this script will not create one."

COMPOSER_BIN="$(command -v composer || true)"
[[ -n "$COMPOSER_BIN" ]] || fail "composer not found on PATH"

# .env content is never printed, but its shape is checked, since a wrong
# .env is exactly the kind of mistake this script exists to catch.
env_get() { grep -E "^${1}=" "${APP_DIR}/.env" | tail -n1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//'; }

[[ "$(env_get APP_ENV)" == "production" ]] || fail ".env APP_ENV is not 'production' — refusing to deploy."
[[ "$(env_get APP_URL)" == "$EXPECTED_APP_URL" ]] || fail ".env APP_URL is not '${EXPECTED_APP_URL}' — refusing to deploy."
[[ "$(env_get APP_DEBUG)" != "true" ]] || fail ".env APP_DEBUG is true — never run production with debug on."
[[ -n "$(env_get APP_KEY)" ]] || fail ".env APP_KEY is empty — run 'artisan key:generate' on the server first (docs/deployment/PRODUCTION-ENV.md). Never copy APP_KEY from staging or local."
[[ -n "$(env_get DB_DATABASE)" ]] || fail ".env DB_DATABASE is empty — refusing to deploy."
[[ -n "$(env_get DB_USERNAME)" ]] || fail ".env DB_USERNAME is empty — refusing to deploy."

LARAVEL_IS_LIVE=0
if [[ -f "${PUBLIC_DIR}/index.php" ]] && grep -q "$FRONT_CONTROLLER_MARKER" "${PUBLIC_DIR}/index.php"; then
    LARAVEL_IS_LIVE=1
fi

if [[ "$MODE" == "cutover" && "$LARAVEL_IS_LIVE" -eq 1 ]]; then
    fail "Laravel already serves ${PUBLIC_DIR} — the cutover has been done. Release with UPDATE_CONFIRM=${UPDATE_TOKEN} instead."
fi
if [[ "$MODE" == "update" && "$LARAVEL_IS_LIVE" -eq 0 ]]; then
    fail "${PUBLIC_DIR} still serves the legacy site — run the cutover (docs/deployment/PRODUCTION-CUTOVER.md) before an update."
fi
if [[ "${IMPORT_STAGING_CONTENT:-0}" == "1" && "$MODE" != "cutover" ]]; then
    fail "IMPORT_STAGING_CONTENT=1 is only allowed together with the cutover — it replaces the whole production database."
fi

log "Target: ${DOMAIN_ROOT}"
log "PHP:    $("$PHP_BIN" -v | head -n1)"
case "$MODE" in
    prepare) log "Mode:   PREPARE only (public_html and the database untouched)" ;;
    cutover) log "Mode:   CUTOVER (public_html WILL be switched; staging content import: ${IMPORT_STAGING_CONTENT:-0})" ;;
    update)  log "Mode:   UPDATE (live Laravel release)" ;;
esac

artisan() { "$PHP_BIN" "${APP_DIR}/artisan" "$@"; }

MAINTENANCE_ENABLED=0
ROLLBACK_DONE=0
cleanup() {
    if [[ "$MAINTENANCE_ENABLED" -eq 1 && "$ROLLBACK_DONE" -eq 0 ]]; then
        log "Restoring from maintenance mode (artisan up)..."
        artisan up || true
    fi
}
trap cleanup EXIT

# In UPDATE mode the app is live, so it goes into maintenance before its
# code changes underneath it.
if [[ "$MODE" == "update" ]]; then
    log "Enabling maintenance mode..."
    artisan down || true
    MAINTENANCE_ENABLED=1
fi

# ---------------------------------------------------------------------------
# 1. Sync incoming release into application/ — never touch .env, storage/,
#    or vendor/ (vendor is rebuilt by Composer below, not shipped here).
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
# 2. Install PHP dependencies (production, no dev tooling). --no-scripts
#    because this host's PHP CLI has proc_open disabled, which breaks the
#    "@php artisan package:discover" hook composer spawns; without discovery
#    the app cannot boot (the 2026-09-18 cutover answered 500 and rolled back).
# ---------------------------------------------------------------------------
log "Running composer install..."
"$PHP_BIN" "$COMPOSER_BIN" install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts \
    --working-dir="$APP_DIR"

# Drop framework caches first: a stale packages.php/services.php (e.g. one
# built with dev packages) would stop artisan from booting at all.
rm -f "${APP_DIR}"/bootstrap/cache/*.php

log "Running package discovery (composer's own post-install hook can't, see above)..."
artisan package:discover --ansi

# Copies the split-layout front controller pair (they differ from
# application/public/'s own copies, which expect vendor/ beside them).
install_front_controller() {
    cp "${APP_DIR}/deploy/production/public_html/index.php" "$1/index.php"
    cp "${APP_DIR}/deploy/production/public_html/.htaccess" "$1/.htaccess"
    grep -q "$FRONT_CONTROLLER_MARKER" "$1/index.php" \
        || fail "$1/index.php lacks the '${FRONT_CONTROLLER_MARKER}' marker — refusing to continue."
}

# Verifies or creates <docroot>/storage -> ../application/storage/app/public.
# Deliberately not `artisan storage:link`: see deploy-staging.sh step 5.
ensure_storage_link() {
    local link="$1/storage" target="../application/storage/app/public"
    if [[ -L "$link" ]]; then
        [[ "$(readlink "$link")" == "$target" ]] \
            || fail "${link} exists but points at '$(readlink "$link")', not '${target}' — investigate before continuing."
    elif [[ -e "$link" ]]; then
        fail "${link} exists and is NOT a symlink — refusing to overwrite automatically."
    else
        log "Creating storage symlink: ${link} -> ${target}"
        ln -s "$target" "$link"
    fi
}

backup_database() {
    log "Backing up production database..."
    bash "${APP_DIR}/scripts/backup-production-db.sh"
    LATEST_DB_BACKUP="$(ls -t "${DB_BACKUP_DIR}"/production-*.sql.gz 2>/dev/null | head -n1 || true)"
    [[ -n "$LATEST_DB_BACKUP" ]] || fail "No database backup file found after running backup-production-db.sh — refusing to migrate."
    [[ -s "$LATEST_DB_BACKUP" ]] || fail "Database backup file ${LATEST_DB_BACKUP} is empty — refusing to migrate."
    log "Database backup verified: ${LATEST_DB_BACKUP}"
}

migrate_and_optimize() {
    log "Running database migrations..."
    artisan migrate --force

    log "Optimizing (config/route/view cache)..."
    artisan optimize:clear
    artisan config:cache
    artisan route:cache
    artisan view:cache
}

# Renders the key pages through the HTTP kernel (no network, no CDN).
smoke_check() {
    log "Smoke-checking key pages in-process..."
    artisan app:smoke
}

# Steps that need the live docroot and must never fail a release.
post_release() {
    # Web-root copy of the Settings favicon (Hostinger serves /favicon.ico itself).
    artisan favicon:publish --web-root="${PUBLIC_DIR}" || true
    # Responsive WebP copies of stored images; a page still builds any
    # missing copy on demand.
    log "Building missing responsive image copies..."
    artisan media:variants || true
}

# ===========================================================================
# UPDATE — a normal release while Laravel is live.
# ===========================================================================
if [[ "$MODE" == "update" ]]; then
    backup_database

    log "Syncing public assets into ${PUBLIC_DIR}..."
    rsync -a \
        --exclude "storage" \
        --exclude ".htaccess" \
        --exclude "index.php" \
        --exclude ".well-known" \
        "${APP_DIR}/public/" "${PUBLIC_DIR}/"
    install_front_controller "$PUBLIC_DIR"
    [[ -f "${PUBLIC_DIR}/build/manifest.json" ]] || fail "Vite manifest missing at ${PUBLIC_DIR}/build/manifest.json — frontend was not built before sync."
    ensure_storage_link "$PUBLIC_DIR"

    migrate_and_optimize

    log "Restoring from maintenance mode..."
    artisan up
    MAINTENANCE_ENABLED=0

    post_release
    smoke_check || fail "Smoke check failed: a key page did not render. The site is up; see docs/deployment/PRODUCTION-ROLLBACK.md (database backup: ${LATEST_DB_BACKUP})."

    log "Update complete. Database backup taken before migrating: ${LATEST_DB_BACKUP}"
    exit 0
fi

# ---------------------------------------------------------------------------
# PREPARE / CUTOVER — build the STAGED public output in public_html_new/,
# never the live docroot, so the cutover only has to rename directories.
# ---------------------------------------------------------------------------
log "Preparing staged public output in ${NEW_PUBLIC_DIR}..."
mkdir -p "$NEW_PUBLIC_DIR"
rsync -a --delete \
    --exclude "storage" \
    --exclude ".htaccess" \
    --exclude "index.php" \
    --exclude ".well-known" \
    "${APP_DIR}/public/" "${NEW_PUBLIC_DIR}/"
install_front_controller "$NEW_PUBLIC_DIR"

[[ -f "${NEW_PUBLIC_DIR}/build/manifest.json" ]] || fail "Vite manifest missing at ${NEW_PUBLIC_DIR}/build/manifest.json — frontend was not built before sync. Refusing to continue."
ensure_storage_link "$NEW_PUBLIC_DIR"

if [[ "$MODE" == "prepare" ]]; then
    log "PREPARE complete. public_html/ and the database were NOT touched."
    log "Cut over with:  CUTOVER_CONFIRM=${CUTOVER_TOKEN} bash scripts/deploy-production.sh"
    log "Read docs/deployment/PRODUCTION-CUTOVER.md fully before doing that."
    exit 0
fi

# ===========================================================================
# CUTOVER — touches the production database and the live docroot.
# ===========================================================================
log "CUTOVER confirmed — proceeding with database backup, migration, and the public_html switch."

# Maintenance on application/ only: it is not serving traffic yet, but this
# makes it refuse requests until the swap below is complete.
log "Enabling maintenance mode on the staged application..."
artisan down || true
MAINTENANCE_ENABLED=1

backup_database

if [[ "${IMPORT_STAGING_CONTENT:-0}" == "1" ]]; then
    bash "${APP_DIR}/scripts/import-staging-content.sh"
fi

migrate_and_optimize

mkdir -p "$LEGACY_BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LEGACY_MOVE_TARGET="${LEGACY_BACKUP_DIR}/public_html-${TIMESTAMP}"

[[ -e "$PUBLIC_DIR" ]] || fail "${PUBLIC_DIR} does not exist — nothing to swap out, this looks like an unexpected state. Investigate manually before continuing."
[[ ! -e "$LEGACY_MOVE_TARGET" ]] || fail "${LEGACY_MOVE_TARGET} already exists — refusing to overwrite a previous backup."

# Keep the domain's ACME / verification files (e.g. SSL renewal) served.
if [[ -d "${PUBLIC_DIR}/.well-known" ]]; then
    log "Carrying public_html/.well-known over to the new docroot..."
    rsync -a "${PUBLIC_DIR}/.well-known/" "${NEW_PUBLIC_DIR}/.well-known/"
fi

log "Moving current public_html/ (legacy site) to ${LEGACY_MOVE_TARGET}..."
mv "$PUBLIC_DIR" "$LEGACY_MOVE_TARGET"

log "Moving staged public_html_new/ into place as public_html/..."
mv "$NEW_PUBLIC_DIR" "$PUBLIC_DIR"

rollback_swap() {
    log "Rolling back: restoring previous public_html/ (legacy site)..."
    mv "$PUBLIC_DIR" "${LEGACY_BACKUP_DIR}/public_html-failed-${TIMESTAMP}"
    mv "$LEGACY_MOVE_TARGET" "$PUBLIC_DIR"
    ROLLBACK_DONE=1
    fail "Cutover rolled back — legacy site restored. The failed docroot is kept at ${LEGACY_BACKUP_DIR}/public_html-failed-${TIMESTAMP}; see storage/logs/laravel.log and docs/deployment/PRODUCTION-ROLLBACK.md before retrying."
}

log "Restoring from maintenance mode..."
artisan up
MAINTENANCE_ENABLED=0

# The server cannot reach its own public URL through the CDN, so the app is
# proven in-process here; production must never be left serving a broken app.
if ! smoke_check; then
    rollback_swap
fi

post_release

log "Cutover complete. Laravel now serves ${EXPECTED_APP_URL} (public URLs are checked by the workflow)."
log "Previous legacy site preserved at: ${LEGACY_MOVE_TARGET}"
log "Database backup taken before migration: ${LATEST_DB_BACKUP}"
