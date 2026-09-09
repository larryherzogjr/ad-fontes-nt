#!/usr/bin/env bash
# Publish the approved September 9 content release and immutable beta packages.
# Run as the existing deployment user; enter sudo credentials only in the terminal.
set -euo pipefail
cd "$(dirname "$0")"
release=2026-09-09-standalone
staging="$HOME/ad-fontes-beta-staging/$release"
destination="/var/www/ad-fontes-downloads/$release"
manifest="$PWD/article-beta-downloads.sha256"
[[ $(id -u) != 0 ]] || { echo 'Run as lherzog, not root.' >&2; exit 1; }
[[ -z $(git status --porcelain --untracked-files=no) ]] || { echo 'Tracked host edits need review.' >&2; exit 1; }
python3 - <<'PY'
import json
from pathlib import Path
r=json.loads(Path('../app/lib/domain/om-release.json').read_text())
assert r['releaseId']=='om-studies-2026-09-09-v3' and r['articleCount']==250, 'Unexpected article release'
PY
(cd "$staging" && sha256sum --check "$manifest")
sudo -v
# Uses only this app's existing containers and backup workflow.
bash update-host.sh
# Existing Nginx beta-downloads location serves this new directory automatically.
# No Nginx configuration, account settings or other applications are modified.
sudo install -d -m 755 "$destination"
while read -r digest filename; do
  [[ "$filename" != */* && "$filename" == Ad-Fontes-NT-* ]] || { echo 'Invalid package filename.' >&2; exit 1; }
  if sudo test -e "$destination/$filename"; then
    actual=$(sudo sha256sum "$destination/$filename" | cut -d ' ' -f 1)
    [[ "$actual" == "$digest" ]] || { echo "Existing download differs: $filename" >&2; exit 1; }
  else
    sudo install -m 644 "$staging/$filename" "$destination/$filename.tmp"
    actual=$(sudo sha256sum "$destination/$filename.tmp" | cut -d ' ' -f 1)
    [[ "$actual" == "$digest" ]] || { echo "Copied download differs: $filename" >&2; exit 1; }
    sudo mv "$destination/$filename.tmp" "$destination/$filename"
  fi
  curl --fail --silent --show-error --head --max-time 30 --retry 5 --retry-all-errors --retry-delay 2 "https://ad-fontes.app/beta-downloads/$release/$filename"
done < "$manifest"
# Check the new release's public index against the pinned expected bytes.
curl --fail --silent --show-error --max-time 30 --retry 5 --retry-all-errors --retry-delay 2 https://ad-fontes.app/om/om-studies-2026-09-09-v3/index.json -o "$staging/index-served.json"
python3 - "$staging/index-served.json" <<'PY'
import hashlib,json,sys
from pathlib import Path
manifest=json.loads(Path('../sources/om-studies/om-studies-2026-09-09-v3/manifest.json').read_text())
actual=Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(actual).hexdigest()==manifest['outputChecksums']['index.json'],'Public article index mismatch'
PY
printf '\nApproved articles and updated unlisted desktop packages are live.\n'
