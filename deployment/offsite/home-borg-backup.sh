#!/usr/bin/env bash
# Runs as sitepull on the home-lab VM. Configuration is private and supplied by systemd.
set -euo pipefail
: "${AFNT_SOURCE:?Set AFNT_SOURCE, for example lherzog@larryherzogjr.com}"
: "${AFNT_SSH_KEY:?Set the dedicated pull-only SSH key path}"
: "${BORG_REPO:?Set the dedicated Ad Fontes Borg repository}"
: "${BORG_PASSCOMMAND:?Set a command that returns the repository passphrase}"
command -v borg >/dev/null
command -v pg_restore >/dev/null
work_directory=${AFNT_WORK_DIRECTORY:-/home/sitepull/.cache/ad-fontes-backup}
install -d -m 0700 "$work_directory"
exec 9>"$work_directory/backup.lock"
flock -n 9 || { echo 'Another Ad Fontes backup is already running.' >&2; exit 1; }
dump=$(mktemp "$work_directory/adfontes.XXXXXX.dump")
trap 'rm -f "$dump"' EXIT
chmod 0600 "$dump"
ssh -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -i "$AFNT_SSH_KEY" "$AFNT_SOURCE" fetch-latest > "$dump"
[[ -s $dump ]] || { echo 'Production returned an empty backup.' >&2; exit 1; }
pg_restore --list "$dump" >/dev/null
archive="adfontes-$(date -u +%Y%m%dT%H%M%SZ)"
borg create --compression zstd,6 --comment 'Ad Fontes NT PostgreSQL custom-format dump' "::$archive" "$dump"
# Private account and note data must not survive account deletion indefinitely.
# Retain database archives for no more than 30 rolling days. Longer-lived
# release/configuration archives belong in a separate repository and must not
# contain this dump.
borg prune --list --keep-within 30d
borg compact
printf 'Stored and pruned encrypted Ad Fontes archive %s\n' "$archive"
