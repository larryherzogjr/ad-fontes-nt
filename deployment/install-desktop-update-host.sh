#!/usr/bin/env bash
# Install the reviewed updater-only Nginx routes and publish one signed update.
# Run interactively on the existing Ubuntu host as lherzog.
set -euo pipefail
[[ $# == 2 ]] || { echo 'Usage: install-desktop-update-host.sh STAGING_DIRECTORY VERSION' >&2; exit 2; }
cd "$(dirname "$0")"
staging=$(realpath "$1")
version=$2
available=/etc/nginx/sites-available/ad-fontes.app
enabled=/etc/nginx/sites-enabled/ad-fontes.app
baseline=ea7eca8471e10e6d2a9d2f392ebe00390ef6dd34f0a31945333be34495a3b1da
[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
[[ $(git rev-parse --abbrev-ref HEAD) == main ]] || { echo 'Host checkout must be on main.' >&2; exit 1; }
[[ $(readlink "$enabled") == "$available" ]] || { echo 'Unexpected enabled site; stop for review.' >&2; exit 1; }
current=$(sha256sum "$available" | cut -d ' ' -f 1)
if [[ "$current" != "$baseline" ]] && ! cmp -s "$available" nginx.conf; then
  echo 'The live Nginx site differs from the reviewed baseline; stop for review.' >&2
  exit 1
fi
curl --fail --silent --show-error --max-time 30 https://ad-fontes.app/api/health >/dev/null
sudo -v
sudo nginx -t
previous=$(mktemp)
trap 'rm -f "$previous"' EXIT
sudo cat "$available" > "$previous"
sudo install -m 644 nginx.conf "$available"
if ! sudo nginx -t; then
  sudo install -m 644 "$previous" "$available"
  echo 'Nginx validation failed; previous configuration restored without reload.' >&2
  exit 1
fi
if ! sudo systemctl reload nginx; then
  sudo install -m 644 "$previous" "$available"
  sudo nginx -t && sudo systemctl reload nginx
  echo 'Reload failed; previous configuration restored.' >&2
  exit 1
fi
curl --fail --silent --show-error --max-time 30 https://ad-fontes.app/api/health >/dev/null
bash publish-desktop-update.sh "$staging" "$version"
curl --fail --silent --show-error --max-time 30 https://ad-fontes.app/ >/dev/null
printf 'Installed updater routes and published signed desktop update %s; web containers were not rebuilt.\n' "$version"
