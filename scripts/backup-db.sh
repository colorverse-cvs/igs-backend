#!/bin/bash

# -----------------------
# Configuration
# -----------------------
BACKUP_DIR="/var/backups/mongodb"
DB_NAME="giftshop"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${DB_NAME}_backup_${TIMESTAMP}.gz"
RETENTION_DAYS=7

# Load environment variables if available
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting backup for database: $DB_NAME..."

# Run mongodump locally
mongodump \
  --db "$DB_NAME" \
  --archive="$BACKUP_DIR/$BACKUP_NAME" \
  --gzip

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_DIR/$BACKUP_NAME"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Retention policy: remove old backups
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "${DB_NAME}_backup_*.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "🎉 Backup process completed."

# Create & permit backup dir
# sudo mkdir -p /var/backups/mongodb
# sudo chown -R $USER:$USER /var/backups/mongodb
# sudo chmod 700 /var/backups/mongodb


# Automate daily with cron
# crontab -e
# 0 2 * * * /path/to/mongo-backup.sh >> /var/log/mongo-backup.log 2>&1
# Restore
# mongorestore --archive=/var/backups/mongodb/giftshop_backup_20251219_020000.gz --gzip