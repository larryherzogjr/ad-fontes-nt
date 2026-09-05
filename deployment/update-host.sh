#!/usr/bin/env bash
# After git pull --ff-only, rebuild and restart this application only.
set -euo pipefail
cd "$(dirname "$0")"
sudo -v
compose=(sudo docker compose --env-file .env -f compose.yml)
"${compose[@]}" config --quiet
"${compose[@]}" build
# Back up the existing DB before any new schema migration can run.
umask 077
mkdir -p backups
file="backups/adfontes-before-update-$(date -u +%Y%m%dT%H%M%SZ).dump"
"${compose[@]}" exec -T db pg_dump -U afnt -d adfontes -Fc > "$file.tmp"
mv "$file.tmp" "$file"
"${compose[@]}" up -d --wait --wait-timeout 180
curl --fail --silent --show-error --max-time 20 https://ad-fontes.app/api/health
printf '\nAd Fontes updated. Backup: %s\n' "$file"
# Nginx/TLS changes are deliberately not installed by routine app updates.
