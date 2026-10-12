#!/usr/bin/env bash
# Publish the approved 3.6.2 installers behind the public /downloads page.
# Run interactively on the existing Ubuntu host as lherzog.
set -euo pipefail
cd "$(dirname "$0")"
version=3.6.2
staging="$HOME/ad-fontes-public-download-staging/$version-6168025"
destination="/var/www/ad-fontes-downloads/$version"
manifest="$PWD/public-desktop-downloads-$version.sha256"
mac_name=Ad-Fontes-macOS-Apple-Silicon-3.6.2.dmg
windows_name=Ad-Fontes-Windows-x64-3.6.2.exe
windows_source=/var/www/ad-fontes-updates/releases/3.6.2/ad-fontes-nt-3.6.2-windows-x86_64.exe

[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
[[ $(git rev-parse --abbrev-ref HEAD) == main ]] || { echo 'Host checkout must be on main.' >&2; exit 1; }
[[ -f "$staging/$mac_name" ]] || { echo 'The notarized macOS DMG is not staged.' >&2; exit 1; }
[[ $(sha256sum "$staging/$mac_name" | cut -d ' ' -f 1) == 4f182dd2bd4ba08d333c7acdf17c1e7ba81ad0484ce99e6eaf9656d7e27f5a1e ]] || { echo 'Staged macOS DMG checksum mismatch.' >&2; exit 1; }
[[ -f "$windows_source" ]] || { echo 'The published Windows 3.6.2 installer is missing.' >&2; exit 1; }
[[ $(sha256sum "$windows_source" | cut -d ' ' -f 1) == e996abc5c710f63ff29ab68def25f495e52ef5beb3b42b59222fd649d0345263 ]] || { echo 'Published Windows 3.6.2 checksum mismatch.' >&2; exit 1; }

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
