#!/usr/bin/env bash
# Run on the existing Ubuntu host as lherzog; enter sudo credentials privately.
set -euo pipefail
cd "$(dirname "$0")"
release=2026-09-08-af
staging="$HOME/ad-fontes-beta-staging/$release"
destination="/var/www/ad-fontes-downloads/$release"
available=/etc/nginx/sites-available/ad-fontes.app
enabled=/etc/nginx/sites-enabled/ad-fontes.app
baseline=03bd6852d269f76e68dc4056fb64e4f28e0cc090755d46ba6f352477978cebdc
manifest="$PWD/beta-downloads.sha256"
[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
(cd "$staging" && sha256sum --check "$manifest")
sudo -v
[[ $(sudo readlink "$enabled") == "$available" ]] || { echo 'Unexpected enabled site; stop for review.' >&2; exit 1; }
current=$(sudo sha256sum "$available" | cut -d ' ' -f 1)
if [[ "$current" != "$baseline" ]] && ! sudo cmp -s "$available" nginx.conf; then
  echo 'The live Nginx site differs from the reviewed configuration; stop for review.' >&2
  exit 1
fi
sudo nginx -t
# Normal app release: build, back up the app DB, restart, verify HTTPS health.
bash update-host.sh
sudo install -d -m 755 /var/www/ad-fontes-downloads "$destination"
while read -r digest filename; do
  if sudo test -e "$destination/$filename"; then
    actual=$(sudo sha256sum "$destination/$filename" | cut -d ' ' -f 1)
    [[ "$actual" == "$digest" ]] || { echo "Existing download differs: $filename" >&2; exit 1; }
  else
    sudo install -m 644 "$staging/$filename" "$destination/$filename.tmp"
    actual=$(sudo sha256sum "$destination/$filename.tmp" | cut -d ' ' -f 1)
    [[ "$actual" == "$digest" ]] || { echo "Copied download differs: $filename" >&2; exit 1; }
    sudo mv "$destination/$filename.tmp" "$destination/$filename"
  fi
done < "$manifest"
previous=$(mktemp)
trap 'rm -f "$previous"' EXIT
sudo cat "$available" > "$previous"
sudo install -m 644 nginx.conf "$available"
if ! sudo nginx -t; then
  sudo install -m 644 "$previous" "$available"
  echo 'Nginx validation failed; previous config restored without reload.' >&2
  exit 1
fi
if ! sudo systemctl reload nginx; then
  sudo install -m 644 "$previous" "$available"
  sudo nginx -t && sudo systemctl reload nginx
  echo 'Reload failed; previous configuration restored.' >&2
  exit 1
fi
for filename in Ad-Fontes-NT-Windows-x64-beta-3.zip Ad-Fontes-NT-macOS-Apple-Silicon-beta-2.dmg; do
  url="https://ad-fontes.app/beta-downloads/$release/$filename"
  curl --fail --silent --show-error --head --max-time 30 --retry 5 --retry-all-errors --retry-delay 2 "$url"
done
curl --fail --silent --show-error --max-time 30 https://ad-fontes.app/favicon.ico -o "$staging/favicon-served.ico"
cmp "$staging/favicon-served.ico" ../app/public/favicon.ico
printf '\nFavicon and unlisted beta downloads are live.\n'
