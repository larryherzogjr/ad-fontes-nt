#!/usr/bin/env bash
# After git pull --ff-only, rebuild and restart this application only.
set -euo pipefail
cd "$(dirname "$0")"
sudo -v
compose=(sudo docker compose -f compose.yml)
[[ ! -f .env ]] || compose+=(--env-file .env)
"${compose[@]}" config --quiet
"${compose[@]}" build
# Preserve any running legacy DB and its volume; this app no longer migrates it.
# Do not use --remove-orphans or down -v during retirement.
"${compose[@]}" up -d web --wait --wait-timeout 180
curl --fail --silent --show-error --max-time 20 https://ad-fontes.app/api/health
printf '\nAd Fontes updated. Legacy database and backups were left intact.\n'
# Nginx/TLS changes are deliberately not installed by routine app updates.
