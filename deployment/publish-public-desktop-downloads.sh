#!/usr/bin/env bash
# Publish the approved RC5 installers behind the public /downloads page.
# Run interactively on the existing Ubuntu host as lherzog.
set -euo pipefail
cd "$(dirname "$0")"
version=1.0.0-rc.5
staging="$HOME/ad-fontes-public-download-staging/$version"
destination="/var/www/ad-fontes-downloads/$version"
manifest="$PWD/public-desktop-downloads-$version.sha256"
mac_name=Ad-Fontes-NT-macOS-Apple-Silicon-1.0.0-rc.5.dmg
windows_name=Ad-Fontes-NT-Windows-x64-1.0.0-rc.5.exe
windows_source=/var/www/ad-fontes-updates/releases/1.0.0-rc.5/ad-fontes-nt-1.0.0-rc.5-windows-x86_64.exe

[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
[[ $(git rev-parse --abbrev-ref HEAD) == main ]] || { echo 'Host checkout must be on main.' >&2; exit 1; }
[[ -f "$staging/$mac_name" ]] || { echo 'The notarized macOS DMG is not staged.' >&2; exit 1; }
[[ $(sha256sum "$staging/$mac_name" | cut -d ' ' -f 1) == 08c7848e27d80e5fb080320ddf57b2a9121013a9cc7cba9f881bcadcd25d9596 ]] || { echo 'Staged macOS DMG checksum mismatch.' >&2; exit 1; }
[[ -f "$windows_source" ]] || { echo 'The published Windows RC5 installer is missing.' >&2; exit 1; }
[[ $(sha256sum "$windows_source" | cut -d ' ' -f 1) == 82f47ac80bcd1655a25757fdaa6db233388fee2d0ade5d381d4b11f03b726276 ]] || { echo 'Published Windows RC5 checksum mismatch.' >&2; exit 1; }

sudo -v
sudo test ! -e "$destination" || { echo 'Immutable public download destination already exists.' >&2; exit 1; }
sudo install -d -m 755 "$destination"
sudo install -m 644 "$staging/$mac_name" "$destination/$mac_name"
sudo install -m 644 "$windows_source" "$destination/$windows_name"
(cd "$destination" && sudo sha256sum --check "$manifest")

for filename in "$mac_name" "$windows_name"; do
  curl --fail --silent --show-error --head --max-time 30 --retry 5 --retry-all-errors --retry-delay 2 \
    "https://ad-fontes.app/beta-downloads/$version/$filename"
done
printf 'Published public desktop downloads for %s; no application or Nginx service was rebuilt.\n' "$version"
