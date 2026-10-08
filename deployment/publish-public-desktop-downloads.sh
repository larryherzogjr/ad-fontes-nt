#!/usr/bin/env bash
# Publish the approved 2.0.0 installers behind the public /downloads page.
# Run interactively on the existing Ubuntu host as lherzog.
set -euo pipefail
cd "$(dirname "$0")"
version=2.0.0
staging="$HOME/ad-fontes-public-download-staging/$version-053ddfc"
destination="/var/www/ad-fontes-downloads/$version"
manifest="$PWD/public-desktop-downloads-$version.sha256"
mac_name=Ad-Fontes-NT-macOS-Apple-Silicon-2.0.0.dmg
windows_name=Ad-Fontes-NT-Windows-x64-2.0.0.exe
windows_source=/var/www/ad-fontes-updates/releases/2.0.0/ad-fontes-nt-2.0.0-windows-x86_64.exe

[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
[[ $(git rev-parse --abbrev-ref HEAD) == main ]] || { echo 'Host checkout must be on main.' >&2; exit 1; }
[[ -f "$staging/$mac_name" ]] || { echo 'The notarized macOS DMG is not staged.' >&2; exit 1; }
[[ $(sha256sum "$staging/$mac_name" | cut -d ' ' -f 1) == ba0ed8efb48c54bbd536fd23e4e17c9259917e3c4fdd2cfbecea41ecb528150b ]] || { echo 'Staged macOS DMG checksum mismatch.' >&2; exit 1; }
[[ -f "$windows_source" ]] || { echo 'The published Windows 2.0.0 installer is missing.' >&2; exit 1; }
[[ $(sha256sum "$windows_source" | cut -d ' ' -f 1) == c7014040c30de0ad28b1c8736a46ba71f5b4f3a6ab9c90c72b8955b750e68984 ]] || { echo 'Published Windows 2.0.0 checksum mismatch.' >&2; exit 1; }

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
