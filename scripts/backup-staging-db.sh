#!/usr/bin/env bash
#
# Backs up the staging database via mysqldump. Runs ON THE HOSTINGER SERVER
# over SSH — staging only, never touches production.
#
# Credentials are never hardcoded here: this script reads them out of the
# staging application's own .env at runtime, the same file the app itself
# uses, so there is exactly one place DB credentials live on the server.
#
# Usage (over SSH):
#   bash scripts/backup-staging-db.sh
#
# Output: a timestamped, gzip-compressed .sql file under
# $DOMAIN_ROOT/backups/db/ (created if missing). Old backups are not
# auto-deleted by this script — retention/cleanup is a separate decision
# (see docs/PHASE-11A2-STAGING-DEPLOYMENT.md's backup section).
#
set -euo pipefail

DOMAIN_ROOT="/home/u518638233/domains/staging.kencomanufactur.co.id"
APP_DIR="${DOMAIN_ROOT}/application"
BACKUP_DIR="${DOMAIN_ROOT}/backups/db"
ENV_FILE="${APP_DIR}/.env"

log() { echo "[backup-staging-db] $*"; }
fail() { echo "[backup-staging-db] FAILED: $*" >&2; exit 1; }

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

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${BACKUP_DIR}/staging-${DB_DATABASE}-${TIMESTAMP}.sql.gz"

log "Backing up database '${DB_DATABASE}' to ${OUT_FILE}..."

MYSQL_PWD="$DB_PASSWORD" mysqldump \
    --host="${DB_HOST:-127.0.0.1}" \
    --port="${DB_PORT:-3306}" \
    --user="$DB_USERNAME" \
    --single-transaction \
    --quick \
    --routines \
    "$DB_DATABASE" | gzip > "$OUT_FILE"

log "Backup complete: ${OUT_FILE} ($(du -h "$OUT_FILE" | cut -f1))"
