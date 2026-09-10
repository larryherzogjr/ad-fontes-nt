#!/usr/bin/env bash
# Forced command for the dedicated home-lab pull key. It can only stream the newest dump.
set -euo pipefail
export_directory=${AFNT_EXPORT_DIRECTORY:-/var/lib/ad-fontes-backup-export}
[[ ${SSH_ORIGINAL_COMMAND:-} == fetch-latest ]] || { echo 'Only fetch-latest is permitted.' >&2; exit 2; }
latest=$(find "$export_directory" -maxdepth 1 -type f -name 'adfontes-*.dump' -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
[[ -n $latest && -r $latest ]] || { echo 'No readable Ad Fontes backup is available.' >&2; exit 1; }
exec cat "$latest"
