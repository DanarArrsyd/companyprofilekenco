#!/usr/bin/env bash
#
# Backs up the current LEGACY PHP Native production site — files, and
# optionally its database if credentials are supplied. Runs ON THE
# HOSTINGER SERVER over SSH — production only. Read-only against the
# legacy site: it only ever copies from public_html/, never modifies or
# deletes anything there.
#
# This is deliberately separate from the rename-based backup that
# scripts/deploy-production.sh performs automatically during cutover
# (which moves public_html/ into backups/legacy/public_html-<timestamp>/
# as an atomic step of the swap). Run *this* script beforehand, as many
# times as wanted, to take a standalone full-file (and optionally
# database) backup with zero effect on the live legacy site — useful for
# an off-server copy well before the actual cutover window.
#
# Usage (over SSH):
#   bash scripts/backup-legacy-site.sh
#
# Optional legacy database backup — only attempted if these are set. We
# don't know the legacy site's DB credentials or config file location
# (it's a hand-built PHP Native site, not this repo), so nothing is
# guessed or hardcoded. Supply them inline for a one-off run, e.g.:
#   LEGACY_DB_NAME=legacy_db LEGACY_DB_USER=legacy_user \
#     LEGACY_DB_PASSWORD=... bash scripts/backup-legacy-site.sh
# If LEGACY_DB_NAME is not set, the database step is skipped with a
# warning and only files are backed up.
#
set -euo pipefail

DOMAIN_ROOT="/home/u518638233/domains/kencomanufactur.co.id"
PUBLIC_DIR="${DOMAIN_ROOT}/public_html"
BACKUP_DIR="${DOMAIN_ROOT}/backups/legacy"

log() { echo "[backup-legacy-site] $*"; }
warn() { echo "[backup-legacy-site] WARNING: $*" >&2; }
fail() { echo "[backup-legacy-site] FAILED: $*" >&2; exit 1; }

[[ "$DOMAIN_ROOT" == "/home/u518638233/domains/kencomanufactur.co.id" ]] \
    || fail "DOMAIN_ROOT does not match the expected production path — refusing to run."
[[ -d "$PUBLIC_DIR" ]] || fail "${PUBLIC_DIR} does not exist — nothing to back up."

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

# ---------------------------------------------------------------------------
# Files — full tar+gzip of public_html/, read-only source access.
# ---------------------------------------------------------------------------
FILES_OUT="${BACKUP_DIR}/legacy-site-files-${TIMESTAMP}.tar.gz"
log "Archiving ${PUBLIC_DIR} to ${FILES_OUT}..."
tar -czf "$FILES_OUT" -C "$DOMAIN_ROOT" "$(basename "$PUBLIC_DIR")"

[[ -s "$FILES_OUT" ]] || fail "Archive ${FILES_OUT} is empty after tar — something went wrong."
log "Files backup complete: ${FILES_OUT} ($(du -h "$FILES_OUT" | cut -f1))"

# ---------------------------------------------------------------------------
# Database — optional, only if credentials were supplied for this run.
# ---------------------------------------------------------------------------
if [[ -n "${LEGACY_DB_NAME:-}" ]]; then
    [[ -n "${LEGACY_DB_USER:-}" ]] || fail "LEGACY_DB_NAME is set but LEGACY_DB_USER is not — refusing to attempt a partial DB backup."
    command -v mysqldump > /dev/null || fail "mysqldump not found on PATH"

    DB_OUT="${BACKUP_DIR}/legacy-site-db-${LEGACY_DB_NAME}-${TIMESTAMP}.sql.gz"
    log "Backing up legacy database '${LEGACY_DB_NAME}' to ${DB_OUT}..."

    MYSQL_PWD="${LEGACY_DB_PASSWORD:-}" mysqldump \
        --host="${LEGACY_DB_HOST:-127.0.0.1}" \
        --port="${LEGACY_DB_PORT:-3306}" \
        --user="$LEGACY_DB_USER" \
        --single-transaction \
        --quick \
        --routines \
        "$LEGACY_DB_NAME" | gzip > "$DB_OUT"

    [[ -s "$DB_OUT" ]] || fail "Legacy database backup ${DB_OUT} is empty after mysqldump — something went wrong."
    log "Legacy database backup complete: ${DB_OUT} ($(du -h "$DB_OUT" | cut -f1))"
else
    warn "LEGACY_DB_NAME not set — skipping legacy database backup (files-only backup taken). If the legacy site has a database, back it up manually before cutover — see docs/PRODUCTION-CUTOVER.md."
fi

log "Legacy site backup complete."
