#!/usr/bin/env bash
# Build, notarize and verify the Apple Silicon release candidate on a trusted Mac.
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
cd "$repo"
: "${APPLE_SIGNING_IDENTITY:?Set the Developer ID Application identity from security find-identity}"
: "${TAURI_SIGNING_PRIVATE_KEY:?Set the updater private key path or content}"
: "${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:?Set the updater key password}"
if [[ -z ${APPLE_API_KEY:-} || -z ${APPLE_API_ISSUER:-} || -z ${APPLE_API_KEY_PATH:-} ]]; then
  if [[ -z ${APPLE_ID:-} || -z ${APPLE_PASSWORD:-} || -z ${APPLE_TEAM_ID:-} ]]; then
    echo 'Set either App Store Connect API credentials or APPLE_ID/APPLE_PASSWORD/APPLE_TEAM_ID for notarization.' >&2
    exit 2
  fi
fi
security find-identity -v -p codesigning | grep -F -- "$APPLE_SIGNING_IDENTITY" >/dev/null || {
  echo 'The requested Developer ID signing identity is not installed and valid.' >&2
  exit 2
}
npm run verify:both
npm run desktop:build -- --bundles app,dmg --config src-tauri/tauri.macos.release.conf.json -- --locked
bundle='app/desktop/src-tauri/target/release/bundle/macos/Ad Fontes NT.app'
dmg=$(find app/desktop/src-tauri/target/release/bundle/dmg -maxdepth 1 -type f -name '*.dmg' -print -quit)
update=$(find app/desktop/src-tauri/target/release/bundle/macos -maxdepth 1 -type f -name '*.app.tar.gz' -print -quit)
[[ -d $bundle && -f $dmg && -f $update && -f $update.sig ]] || { echo 'Expected signed release outputs are incomplete.' >&2; exit 1; }
codesign --verify --deep --strict --verbose=2 "$bundle"
codesign -dvv "$bundle" 2>&1 | grep -F 'Authority=Developer ID Application:' >/dev/null
spctl --assess --type execute --verbose=2 "$bundle"
xcrun stapler validate "$bundle"
hdiutil verify "$dmg"
if [[ -n ${APPLE_API_KEY:-} && -n ${APPLE_API_ISSUER:-} && -n ${APPLE_API_KEY_PATH:-} ]]; then
  xcrun notarytool submit "$dmg" --key "$APPLE_API_KEY_PATH" --key-id "$APPLE_API_KEY" --issuer "$APPLE_API_ISSUER" --wait
else
  xcrun notarytool submit "$dmg" --apple-id "$APPLE_ID" --password "$APPLE_PASSWORD" --team-id "$APPLE_TEAM_ID" --wait
fi
xcrun stapler staple "$dmg"
xcrun stapler validate "$dmg"
[[ $(file "$bundle/Contents/MacOS/ad-fontes-nt-desktop") == *arm64* ]] || { echo 'Release executable is not Apple Silicon.' >&2; exit 1; }
shasum -a 256 "$dmg" "$update" "$update.sig"
printf 'Verified signed, notarized Apple Silicon release outputs.\n'
