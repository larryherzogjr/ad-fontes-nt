#!/usr/bin/env bash
# Publish an already signed, locally verified desktop update. Run on the host.
set -euo pipefail
[[ $# == 2 ]] || { echo 'Usage: publish-desktop-update.sh STAGING_DIRECTORY VERSION' >&2; exit 2; }
staging=$(realpath "$1")
version=$2
[[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+([+-][0-9A-Za-z.-]+)?$ ]] || { echo 'Invalid version' >&2; exit 2; }
manifest="$staging/stable/latest.json"
checksums="$staging/SHA256SUMS"
release_source="$staging/releases/$version"
[[ -f $manifest && -f $checksums && -d $release_source ]] || { echo 'Incomplete signed update staging directory' >&2; exit 1; }
validate_manifest() {
  python3 - "$1" "$2" <<'PY'
import json
import sys

path, version = sys.argv[1:]
with open(path, encoding="utf-8") as stream:
    manifest = json.load(stream)
if manifest.get("version") != version:
    raise SystemExit("Manifest version mismatch")
platforms = manifest.get("platforms")
if not isinstance(platforms, dict) or not platforms:
    raise SystemExit("Manifest has no platforms")
prefix = f"https://ad-fontes.app/desktop-updates/releases/{version}/"
for platform in platforms.values():
    if not isinstance(platform, dict):
        raise SystemExit("Invalid platform entry")
    signature = platform.get("signature")
    url = platform.get("url")
    if not isinstance(signature, str) or not signature:
        raise SystemExit("Missing platform signature")
    if not isinstance(url, str) or not url.startswith(prefix):
        raise SystemExit("Invalid immutable release URL")
PY
}
validate_manifest "$manifest" "$version"
(cd "$staging" && sha256sum --check SHA256SUMS)
destination=/var/www/ad-fontes-updates
sudo -v
sudo test ! -e "$destination/releases/$version" || { echo 'Immutable release destination already exists' >&2; exit 1; }
sudo install -d -m 755 "$destination" "$destination/releases" "$destination/stable"
sudo cp -a "$release_source" "$destination/releases/$version"
temporary=$(mktemp)
trap 'rm -f "$temporary"' EXIT
install -m 644 "$manifest" "$temporary"
sudo install -o root -g root -m 644 "$temporary" "$destination/stable/latest.json.next"
sudo mv "$destination/stable/latest.json.next" "$destination/stable/latest.json"
curl --fail --silent --show-error --max-time 30 https://ad-fontes.app/desktop-updates/stable/latest.json --output "$temporary"
validate_manifest "$temporary" "$version"
while read -r expected path; do
  [[ $expected =~ ^[0-9a-f]{64}$ && $path =~ ^releases/[0-9A-Za-z.+-]+/[0-9A-Za-z.+-]+$ ]] || { echo 'Invalid checksum entry' >&2; exit 1; }
  curl --fail --silent --show-error --max-time 300 "https://ad-fontes.app/desktop-updates/$path" --output "$temporary"
  [[ $(sha256sum "$temporary" | cut -d' ' -f1) == "$expected" ]] || { echo "Public artifact checksum mismatch: $path" >&2; exit 1; }
done < "$checksums"
printf 'Published signed desktop update %s\n' "$version"
