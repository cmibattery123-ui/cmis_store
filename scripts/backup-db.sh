#!/usr/bin/env bash
# ==============================================================================
# Automated Database Backup Script (Local Disk / S3)
# ==============================================================================

set -euo pipefail

BACKUP_DIR="data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

if docker ps | grep -q "cmis-db"; then
  BACKUP_FILE="${BACKUP_DIR}/cmis_db_${TIMESTAMP}.sql.gz"
  echo "📦 Backing up PostgreSQL database from cmis-db..."
  docker exec cmis-db pg_dump -U postgres cmis_store | gzip > "$BACKUP_FILE"
  echo "✅ PostgreSQL backup created: ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))"
elif [ -f "data/app.db" ]; then
  BACKUP_FILE="${BACKUP_DIR}/app_${TIMESTAMP}.db.gz"
  echo "📦 Backing up SQLite database file..."
  gzip -c data/app.db > "$BACKUP_FILE"
  echo "✅ SQLite backup created: ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "⚠️ No active local database found to back up."
  exit 1
fi

# Rotate backups: keep last 7 days only to save disk space
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete || true
echo "🧹 Cleaned up backups older than 7 days."
