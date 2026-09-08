# Unlisted website beta downloads

AFNT-107 / AFNT-029 · September 8, 2026. Larry explicitly requested using the approved AF icon for ad-fontes.app/favicon.ico and uploading both beta packages with direct links, without linking them anywhere in website navigation or pages.

The website favicon reuses the approved six-size ICO; root metadata references `/favicon.ico?v=af-20260908` to refresh normal browser tab-icon caching. The existing social preview is preserved.

## Download publication

Nginx serves `/beta-downloads/` from `/var/www/ad-fontes-downloads/`, outside Git, Docker builds, public app assets and the account service. Directory listings are disabled; only GET/HEAD are permitted. Responses request attachment download and carry `X-Robots-Tag: noindex, nofollow, noarchive`. Links are unlisted, not authenticated; anyone receiving a link can use it. No public page, navigation, sitemap or announcement links to these files.

Prepared URLs (available only after the publication script succeeds):

- https://ad-fontes.app/beta-downloads/2026-09-08-af/Ad-Fontes-NT-Windows-x64-beta-3.zip
- https://ad-fontes.app/beta-downloads/2026-09-08-af/Ad-Fontes-NT-macOS-Apple-Silicon-beta-2.dmg

The Windows ZIP includes setup, test instructions, checksum and build identity; the Mac download is the verified Apple Silicon DMG. The Windows setup is unsigned and the Mac bundle is ad-hoc signed, without Developer ID signing/notarization. See Windows-Build.md for exact source commits and package verification. `deployment/beta-downloads.sha256` pins the downloadable bytes.

## Host workflow

Both files are uploaded privately under `~/ad-fontes-beta-staging/2026-09-08-af/`. After the Mac pushes the reviewed source to main, pull on the host, then run:

```sh
bash deployment/publish-beta-downloads.sh
```

Enter sudo credentials only in the terminal. The script verifies staged hashes and the known live Nginx configuration, uses the normal `update-host.sh` build/backup/restart workflow for the favicon, copies immutable packages, validates and reloads only the existing Nginx configuration, and checks HTTPS responses and favicon bytes. Unexpected host edits or live configuration differences stop the script. An Nginx validation/reload failure restores the prior configuration. Other applications, databases, credentials and TLS configuration are unchanged.

The current remote sudo policy requires interactive authentication; SSH access alone cannot complete publication. After publication, verify full public-file hashes, content types, attachment/noindex headers, byte-range support, directory-listing denial, site health and the favicon URL. Do not report these URLs live merely because staging completed.

## Preparation verification

Local typecheck and production build passed (49 Node tests and 11 Python tests). The local production favicon response matches the approved ICO bytes and rendered metadata references the versioned URL. Homepage HTML contains no beta-download links. Both uploaded host files match `deployment/beta-downloads.sha256`; shell syntax and Git whitespace checks passed. Live Nginx validation and public HTTPS verification await the interactive publication step.
