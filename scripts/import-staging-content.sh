#!/usr/bin/env bash
#
# Replace the production database and uploads with the content editors
# entered on staging — runs ON THE HOSTINGER SERVER, where both domains live
# under the same account.
#
# Only meant for the one-time go-live: scripts/deploy-production.sh calls it
# during the cutover when IMPORT_STAGING_CONTENT=1, right after its own
# production database backup and before migrating. Running it by hand
# requires the same confirmation token:
#   IMPORT_CONFIRM=REPLACE-PRODUCTION-CONTENT bash scripts/import-staging-content.sh
# (deploy-production.sh passes it for you).
#
# What it copies:
#   - every staging table's structure, and the data of every table except
#     runtime state and form submissions (sessions, cache, queues, password
#     resets, contact inquiries, job applications, activity logs), which
#     production starts empty;
#   - storage/app/public (uploaded images and media), minus the generated
#     _variants/ copies, which `artisan media:variants` rebuilds.
# Staging URLs inside the content are rewritten to the production domain.
# Admin users come along with their staging passwords — change them after
# go-live.
#
set -euo pipefail

PROD_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
STAGING_ROOT="/home/u518638233/domains/staging.kencomanufactur.co.id"
PROD_APP="${PROD_ROOT}/application"
STAGING_APP="${STAGING_ROOT}/application"
WORK_DIR="${PROD_ROOT}/backups/staging-import"

STAGING_HOSTNAME="staging.kencomanufactur.co.id"
PROD_HOSTNAME="kencomanufactur.co.id"

# Data that is runtime state or personal submissions: structure only.
SKIP_DATA_TABLES=(
    sessions cache cache_locks jobs job_batches failed_jobs
    password_reset_tokens contact_inquiries job_applications activity_logs
)

log() { echo "[import-staging-content] $*"; }
fail() { echo "[import-staging-content] FAILED: $*" >&2; exit 1; }

if [[ "${IMPORT_CONFIRM:-}" != "REPLACE-PRODUCTION-CONTENT" && "${CUTOVER_CONFIRM:-}" != "SWITCH-PRODUCTION-NOW" ]]; then
    fail "This replaces the whole production database. Run it through the cutover, or set IMPORT_CONFIRM=REPLACE-PRODUCTION-CONTENT."
fi

[[ -f "${PROD_APP}/.env" ]] || fail "Production .env not found at ${PROD_APP}/.env"
[[ -f "${STAGING_APP}/.env" ]] || fail "Staging .env not found at ${STAGING_APP}/.env"
command -v mysqldump > /dev/null || fail "mysqldump not found on PATH"
command -v mysql > /dev/null || fail "mysql client not found on PATH"

env_from() { grep -E "^${2}=" "$1" | tail -n1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//'; }

S_HOST="$(env_from "${STAGING_APP}/.env" DB_HOST)"; S_PORT="$(env_from "${STAGING_APP}/.env" DB_PORT)"
S_DB="$(env_from "${STAGING_APP}/.env" DB_DATABASE)"; S_USER="$(env_from "${STAGING_APP}/.env" DB_USERNAME)"
S_PASS="$(env_from "${STAGING_APP}/.env" DB_PASSWORD)"
P_HOST="$(env_from "${PROD_APP}/.env" DB_HOST)"; P_PORT="$(env_from "${PROD_APP}/.env" DB_PORT)"
P_DB="$(env_from "${PROD_APP}/.env" DB_DATABASE)"; P_USER="$(env_from "${PROD_APP}/.env" DB_USERNAME)"
P_PASS="$(env_from "${PROD_APP}/.env" DB_PASSWORD)"

[[ -n "$S_DB" && -n "$S_USER" ]] || fail "Staging DB_DATABASE / DB_USERNAME missing in its .env"
[[ -n "$P_DB" && -n "$P_USER" ]] || fail "Production DB_DATABASE / DB_USERNAME missing in its .env"
[[ "$S_DB" != "$P_DB" ]] || fail "Staging and production point at the same database — refusing to continue."

staging_dump() {
    MYSQL_PWD="$S_PASS" mysqldump --host="${S_HOST:-127.0.0.1}" --port="${S_PORT:-3306}" --user="$S_USER" \
        --single-transaction --quick --no-tablespaces --skip-triggers "$@"
}
prod_mysql() {
    MYSQL_PWD="$P_PASS" mysql --host="${P_HOST:-127.0.0.1}" --port="${P_PORT:-3306}" --user="$P_USER" "$@"
}

mkdir -p "$WORK_DIR"
DUMP="${WORK_DIR}/staging-content-$(date +%Y%m%d-%H%M%S).sql"

log "Dumping staging database '${S_DB}'..."
IGNORE_ARGS=()
for table in "${SKIP_DATA_TABLES[@]}"; do
    IGNORE_ARGS+=("--ignore-table=${S_DB}.${table}")
done
{
    staging_dump --no-data "$S_DB"
    staging_dump --no-create-info "${IGNORE_ARGS[@]}" "$S_DB"
} | sed -e "s#${STAGING_HOSTNAME//./\\.}#${PROD_HOSTNAME}#g" > "$DUMP"
[[ -s "$DUMP" ]] || fail "Staging dump ${DUMP} is empty."
grep -q "CREATE TABLE \`migrations\`" "$DUMP" || fail "Staging dump has no migrations table — refusing to import it."
log "Staging dump: ${DUMP} ($(du -h "$DUMP" | cut -f1))"

# Production was backed up by deploy-production.sh just before this runs.
log "Dropping every table in production database '${P_DB}'..."
TABLES="$(prod_mysql -N -B -e 'SHOW TABLES' "$P_DB")"
if [[ -n "$TABLES" ]]; then
    DROP_SQL="SET FOREIGN_KEY_CHECKS=0;"
    while IFS= read -r table; do
        DROP_SQL+="DROP TABLE IF EXISTS \`${table}\`;"
    done <<< "$TABLES"
    DROP_SQL+="SET FOREIGN_KEY_CHECKS=1;"
    prod_mysql "$P_DB" -e "$DROP_SQL"
fi

log "Importing staging content into '${P_DB}'..."
{ echo "SET FOREIGN_KEY_CHECKS=0;"; cat "$DUMP"; echo "SET FOREIGN_KEY_CHECKS=1;"; } | prod_mysql "$P_DB"
gzip -f "$DUMP"

log "Copying uploaded files (storage/app/public)..."
mkdir -p "${PROD_APP}/storage/app/public"
rsync -a --exclude "_variants/" \
    "${STAGING_APP}/storage/app/public/" "${PROD_APP}/storage/app/public/"

log "Staging content imported. Change the admin passwords after go-live (they are staging's)."
