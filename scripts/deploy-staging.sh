#!/usr/bin/env bash
#
# Staging deploy script — runs ON THE HOSTINGER SERVER over SSH.
#
# This script is STAGING ONLY. It hardcodes the staging domain path and must
# never be pointed at the production directory. It does not touch
# kencomanufactur.co.id in any way.
#
# What it assumes is already true before it runs:
#   - $DOMAIN_ROOT/incoming/ contains a fresh copy of the application source
#     (repo checkout + built public/build/**), placed there by rsync/scp from
#     CI (or manually, for the first rehearsal) — see
#     docs/PHASE-11A2-STAGING-DEPLOYMENT.md for exactly how to populate it.
#   - $DOMAIN_ROOT/application/.env already exists (created once, by hand,
#     per docs/STAGING-ENV.md) — this script NEVER creates, overwrites, or
#     deletes it.
#   - The staging MySQL database already exists and its credentials are in
#     that .env — this script does not create databases or users.
#
# What it does, in order: sync incoming/ into application/ (preserving .env
# and storage/), composer install, sync public assets into public_html/
# (preserving public_html/storage and any runtime uploads), verify the
# storage symlink, run migrations, optimize caches, health-check.
#
# Usage (over SSH, from the staging account's shell):
#   bash scripts/deploy-staging.sh
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Explicit paths — staging only. Do not parameterize this into also
# accepting a production path; a separate, explicitly-reviewed script should
# exist for production when that phase is approved.
# ---------------------------------------------------------------------------
DOMAIN_ROOT="/home/u518638233/domains/staging.kencomanufactur.co.id"
APP_DIR="${DOMAIN_ROOT}/application"
PUBLIC_DIR="${DOMAIN_ROOT}/public_html"
INCOMING_DIR="${DOMAIN_ROOT}/incoming"

PHP_BIN="/opt/alt/php83/usr/bin/php"
HEALTH_URL="https://staging.kencomanufactur.co.id/up"

log() { echo "[deploy-staging] $*"; }
fail() { echo "[deploy-staging] FAILED: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 0. Sanity checks before touching anything
# ---------------------------------------------------------------------------
[[ -x "$PHP_BIN" ]] || fail "PHP 8.3 binary not found at $PHP_BIN"
[[ -d "$INCOMING_DIR" ]] || fail "Nothing to deploy: $INCOMING_DIR does not exist. Upload a release there first."
[[ -f "${APP_DIR}/.env" ]] || fail ".env missing at ${APP_DIR}/.env — create it manually first (docs/STAGING-ENV.md), this script will not create one."

COMPOSER_BIN="$(command -v composer || true)"
[[ -n "$COMPOSER_BIN" ]] || fail "composer not found on PATH"

log "Target: ${DOMAIN_ROOT}"
log "PHP:    $("$PHP_BIN" -v | head -n1)"

# ---------------------------------------------------------------------------
# 1. Maintenance mode (only once artisan is already runnable, i.e. not on a
#    from-scratch first install where application/ doesn't exist yet)
# ---------------------------------------------------------------------------
MAINTENANCE_ENABLED=0
if [[ -f "${APP_DIR}/artisan" ]]; then
    log "Enabling maintenance mode..."
    "$PHP_BIN" "${APP_DIR}/artisan" down || true
    MAINTENANCE_ENABLED=1
fi

# Always try to bring the site back up, even if a later step fails.
cleanup() {
    if [[ "$MAINTENANCE_ENABLED" -eq 1 ]] && [[ -f "${APP_DIR}/artisan" ]]; then
        log "Restoring from maintenance mode (artisan up)..."
        "$PHP_BIN" "${APP_DIR}/artisan" up || true
    fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# 2. Sync incoming release into application/ — never touch .env, storage/,
#    or vendor/ (vendor is rebuilt by Composer in step 4, not shipped here).
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

# storage/ is runtime state (uploads, logs, sessions, cache) — it must exist
# with the right subdirectories on a brand-new install, but must never be
# wiped by a redeploy. Create the skeleton only if genuinely missing.
for dir in \
    app/public app/private \
    framework/cache/data framework/sessions framework/views framework/testing \
    logs
do
    mkdir -p "${APP_DIR}/storage/${dir}"
done

# ---------------------------------------------------------------------------
# 3. Install PHP dependencies (production, no dev tooling)
# ---------------------------------------------------------------------------
log "Running composer install..."
"$PHP_BIN" "$COMPOSER_BIN" install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --working-dir="$APP_DIR"

# ---------------------------------------------------------------------------
# 4. Sync Laravel's built public assets into public_html — additive/mirrored
#    for the app's own files, but NEVER touching public_html/storage (the
#    symlink to real uploads) or any file that isn't part of this app's
#    public/ output.
# ---------------------------------------------------------------------------
log "Syncing public assets into ${PUBLIC_DIR}..."
mkdir -p "$PUBLIC_DIR"
rsync -a \
    --exclude "storage" \
    --exclude ".htaccess" \
    --exclude "index.php" \
    --exclude "default.php" \
    "${APP_DIR}/public/" "${PUBLIC_DIR}/"

# index.php and .htaccess are the split-layout versions checked into the
# repo at deploy/staging/public_html/ (they differ from application/public/'s
# own copies, which point at a same-directory vendor/bootstrap that doesn't
# exist in public_html) — always (re)deploy these two from that source,
# never from application/public/.
cp "${APP_DIR}/deploy/staging/public_html/index.php" "${PUBLIC_DIR}/index.php"
cp "${APP_DIR}/deploy/staging/public_html/.htaccess" "${PUBLIC_DIR}/.htaccess"

# Hostinger's placeholder default.php is only ever removed once Laravel's
# own index.php is confirmed present — never delete it blindly before that.
if [[ -f "${PUBLIC_DIR}/index.php" ]] && [[ -f "${PUBLIC_DIR}/default.php" ]]; then
    log "Removing Hostinger placeholder default.php (Laravel index.php is in place)..."
    rm -f "${PUBLIC_DIR}/default.php"
fi

# ---------------------------------------------------------------------------
# 5. Storage symlink — deliberate, not artisan storage:link (see
#    docs/PHASE-11A2-STAGING-DEPLOYMENT.md part F for why: public_path()
#    resolves to application/public here, not the real public_html, so the
#    framework's own storage:link command would create the symlink in the
#    wrong, unserved location).
# ---------------------------------------------------------------------------
STORAGE_LINK="${PUBLIC_DIR}/storage"
STORAGE_TARGET="../application/storage/app/public"
if [[ -L "$STORAGE_LINK" ]]; then
    log "Storage symlink already present, verifying target..."
    CURRENT_TARGET="$(readlink "$STORAGE_LINK")"
    if [[ "$CURRENT_TARGET" != "$STORAGE_TARGET" ]]; then
        fail "public_html/storage exists but points at '$CURRENT_TARGET', not '$STORAGE_TARGET' — investigate before continuing, refusing to overwrite it automatically."
    fi
elif [[ -e "$STORAGE_LINK" ]]; then
    fail "public_html/storage exists and is NOT a symlink — refusing to overwrite a real file/directory automatically. Investigate manually."
else
    log "Creating storage symlink: ${STORAGE_LINK} -> ${STORAGE_TARGET}"
    ln -s "$STORAGE_TARGET" "$STORAGE_LINK"
fi

# ---------------------------------------------------------------------------
# 6. Database migration — additive only, --force required because
#    APP_ENV will be "staging" (Laravel blocks migrate outside local without
#    it). Staging DB must already exist and be configured in .env.
# ---------------------------------------------------------------------------
log "Running database migrations..."
"$PHP_BIN" "${APP_DIR}/artisan" migrate --force

# ---------------------------------------------------------------------------
# 7. Optimize caches
# ---------------------------------------------------------------------------
log "Optimizing (config/route/view cache)..."
"$PHP_BIN" "${APP_DIR}/artisan" optimize:clear
"$PHP_BIN" "${APP_DIR}/artisan" config:cache
"$PHP_BIN" "${APP_DIR}/artisan" route:cache
"$PHP_BIN" "${APP_DIR}/artisan" view:cache

# ---------------------------------------------------------------------------
# 8. Bring the site back out of maintenance mode before health-checking it
# ---------------------------------------------------------------------------
log "Restoring from maintenance mode..."
"$PHP_BIN" "${APP_DIR}/artisan" up
MAINTENANCE_ENABLED=0

# ---------------------------------------------------------------------------
# 9. Health check — fail visibly (non-zero exit) if this doesn't succeed.
# ---------------------------------------------------------------------------
log "Health-checking ${HEALTH_URL}..."
if ! curl -fsS --max-time 15 "$HEALTH_URL" > /dev/null; then
    fail "Health check failed: ${HEALTH_URL} did not return a successful response."
fi

log "Deploy complete. ${HEALTH_URL} is healthy."
