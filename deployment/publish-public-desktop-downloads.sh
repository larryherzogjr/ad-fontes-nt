#!/usr/bin/env bash
# Publish the approved 4.3.1 installers behind the public /downloads page.
# Run interactively on the existing Ubuntu host as lherzog.
set -euo pipefail
cd "$(dirname "$0")"
version=4.3.1
staging="$HOME/ad-fontes-public-download-staging/$version-5876fe1"
destination="/var/www/ad-fontes-downloads/$version"
manifest="$PWD/public-desktop-downloads-$version.sha256"
mac_name=Ad-Fontes-macOS-Apple-Silicon-4.3.1.dmg
windows_name=Ad-Fontes-Windows-x64-4.3.1.exe
windows_source=/var/www/ad-fontes-updates/releases/4.3.1/ad-fontes-nt-4.3.1-windows-x86_64.exe

[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
[[ $(git rev-parse --abbrev-ref HEAD) == main ]] || { echo 'Host checkout must be on main.' >&2; exit 1; }
[[ -f "$staging/$mac_name" ]] || { echo 'The notarized macOS DMG is not staged.' >&2; exit 1; }
[[ $(sha256sum "$staging/$mac_name" | cut -d ' ' -f 1) == 39ca195c9f566590a0bba1111a27b42292c6363343b1427c0d7718ea3c75b0da ]] || { echo 'Staged macOS DMG checksum mismatch.' >&2; exit 1; }
[[ -f "$windows_source" ]] || { echo 'The published Windows 4.3.1 installer is missing.' >&2; exit 1; }
[[ $(sha256sum "$windows_source" | cut -d ' ' -f 1) == f58bfd3ed82cee4f70309956e5432f36088d88d7289e67b1495b1befeb88b982 ]] || { echo 'Published Windows 4.3.1 checksum mismatch.' >&2; exit 1; }

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
