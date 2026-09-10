#!/usr/bin/env bash
# Run as root from a systemd timer. Produces a short-lived, validated dump for the pull-only key.
set -euo pipefail
[[ $(id -u) == 0 ]] || { echo 'Run as root through the dedicated systemd service.' >&2; exit 1; }
deployment_directory=${AFNT_DEPLOYMENT_DIRECTORY:-/home/lherzog/ad-fontes-nt/deployment}
export_directory=${AFNT_EXPORT_DIRECTORY:-/var/lib/ad-fontes-backup-export}
reader_group=${AFNT_BACKUP_READER_GROUP:-lherzog}
cd "$deployment_directory"
[[ -f .env && -f compose.yml ]] || { echo 'Ad Fontes deployment configuration is missing.' >&2; exit 1; }
install -d -o root -g "$reader_group" -m 0750 "$export_directory"
name="adfontes-$(date -u +%Y%m%dT%H%M%SZ).dump"
temporary="$export_directory/$name.tmp"
final="$export_directory/$name"
trap 'rm -f "$temporary"' EXIT
umask 027
docker compose --env-file .env -f compose.yml exec -T db pg_dump -U afnt -d adfontes -Fc > "$temporary"
docker compose --env-file .env -f compose.yml exec -T db pg_restore --list < "$temporary" >/dev/null
chown root:"$reader_group" "$temporary"
chmod 0640 "$temporary"
mv "$temporary" "$final"
trap - EXIT
# Keep only a small transfer window. Long retention belongs to the encrypted Borg repository.
find "$export_directory" -maxdepth 1 -type f -name 'adfontes-*.dump' -mtime +3 -delete
printf 'Prepared validated off-host export: %s\n' "$final"
