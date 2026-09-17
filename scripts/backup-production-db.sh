#!/usr/bin/env bash
#
# Backs up the production database via mysqldump. Runs ON THE HOSTINGER
# SERVER over SSH — production only.
#
# Credentials are never hardcoded here: this script reads them out of the
# production application's own .env at runtime, the same file the app
# itself uses, so there is exactly one place DB credentials live on the
# server. Nothing is ever echoed or written to a second file.
#
# Usage (over SSH):
#   bash scripts/backup-production-db.sh
#
# Also invoked automatically by scripts/deploy-production.sh immediately
# before running migrations during a confirmed cutover — deploy-production.sh
# refuses to migrate if this script does not produce a non-empty backup file.
#
# Output: a timestamped, gzip-compressed .sql file under
# $DOMAIN_ROOT/backups/db/ (created if missing). Existing backups are never
# deleted or overwritten by this script — retention/cleanup is a separate,
# manual decision (see docs/PRODUCTION-CUTOVER.md's backup section).
#
set -euo pipefail

DOMAIN_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
APP_DIR="${DOMAIN_ROOT}/application"
BACKUP_DIR="${DOMAIN_ROOT}/backups/db"
ENV_FILE="${APP_DIR}/.env"

log() { echo "[backup-production-db] $*"; }
fail() { echo "[backup-production-db] FAILED: $*" >&2; exit 1; }

[[ "$DOMAIN_ROOT" == "/home/u518638233/domains/kencomanufactur.co.id" ]] \
    || fail "DOMAIN_ROOT does not match the expected production path — refusing to run."
[[ -f "$ENV_FILE" ]] || fail ".env not found at $ENV_FILE"
command -v mysqldump > /dev/null || fail "mysqldump not found on PATH"

# Read DB_* values out of .env without ever echoing them or writing them to
# a second file — sourced into this subshell's environment only.
read_env() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//'
}

DB_HOST="$(read_env DB_HOST)"
DB_PORT="$(read_env DB_PORT)"
DB_DATABASE="$(read_env DB_DATABASE)"
DB_USERNAME="$(read_env DB_USERNAME)"
DB_PASSWORD="$(read_env DB_PASSWORD)"

[[ -n "$DB_DATABASE" ]] || fail "DB_DATABASE is empty in .env — refusing to run mysqldump with no target database."
[[ -n "$DB_USERNAME" ]] || fail "DB_USERNAME is empty in .env — refusing to run mysqldump with no user."

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${BACKUP_DIR}/production-${DB_DATABASE}-${TIMESTAMP}.sql.gz"

log "Backing up database '${DB_DATABASE}' to ${OUT_FILE}..."

MYSQL_PWD="$DB_PASSWORD" mysqldump \
    --host="${DB_HOST:-127.0.0.1}" \
    --port="${DB_PORT:-3306}" \
    --user="$DB_USERNAME" \
    --single-transaction \
    --quick \
    --routines \
    "$DB_DATABASE" | gzip > "$OUT_FILE"

# Verify non-empty output before declaring success — an empty/near-empty
# backup file is worse than no backup, because it looks safe but isn't.
[[ -s "$OUT_FILE" ]] || fail "Backup file ${OUT_FILE} is empty after mysqldump — something went wrong."

log "Backup complete: ${OUT_FILE} ($(du -h "$OUT_FILE" | cut -f1))"
