# Unlisted website beta downloads

AFNT-107 / AFNT-029 · September 8, 2026. Larry explicitly requested using the approved AF icon for ad-fontes.app/favicon.ico and uploading both beta packages with direct links, without linking them anywhere in website navigation or pages.

The website favicon reuses the approved six-size ICO; root metadata references `/favicon.ico?v=af-20260908` to refresh normal browser tab-icon caching. The existing social preview is preserved.

## Download publication

Nginx serves `/beta-downloads/` from `/var/www/ad-fontes-downloads/`, outside Git, Docker builds, public app assets and the account service. Directory listings are disabled; only GET/HEAD are permitted. Responses request attachment download and carry `X-Robots-Tag: noindex, nofollow, noarchive`. Links are unlisted, not authenticated; anyone receiving a link can use it. No public page, navigation, sitemap or announcement links to these files.

Previous 0.1.0 download URLs (retained):

- https://ad-fontes.app/beta-downloads/2026-09-08-af/Ad-Fontes-NT-Windows-x64-beta-3.zip
- https://ad-fontes.app/beta-downloads/2026-09-08-af/Ad-Fontes-NT-macOS-Apple-Silicon-beta-2.dmg

The Windows ZIP includes setup, test instructions, checksum and build identity; the Mac download is the verified Apple Silicon DMG. The Windows setup is unsigned and the Mac bundle is ad-hoc signed, without Developer ID signing/notarization. See Windows-Build.md for exact source commits and package verification. `deployment/beta-downloads.sha256` pins the downloadable bytes.

## September 9 approved article update — version 0.1.1

The 250 approved articles now use the standalone editorial revision, release `om-studies-2026-09-09-v3`. Both native packages are built from `77a91ba`. The Mac package is beta 3; Windows is workflow beta 6. The download filenames include application version 0.1.1 to distinguish them from the earlier packages.

Live verified 0.1.1 direct URLs:

- https://ad-fontes.app/beta-downloads/2026-09-09-standalone/Ad-Fontes-NT-Windows-x64-0.1.1-beta.zip
- https://ad-fontes.app/beta-downloads/2026-09-09-standalone/Ad-Fontes-NT-macOS-Apple-Silicon-0.1.1-beta.dmg

`deployment/article-beta-downloads.sha256` pins these new files. Upload to `~/ad-fontes-beta-staging/2026-09-09-standalone/`, then run `bash deployment/publish-article-beta.sh` from the clean, fast-forwarded host checkout. It verifies package hashes, invokes the existing app build/backup/restart workflow, publishes the immutable downloads through the existing Nginx location, and verifies the new public article index. It does not change Nginx configuration. Interactive sudo authentication remains required in the user's terminal.

Mac verification passed disk-image integrity, mounted bundle strict/deep signature, approved icon identity and version checks. The installed Mac app was updated with a retained prior-bundle backup and opened John 1 BSB while network access was denied. Browser smoke tests passed at stable 1280px and 320px widths: revised Logos text, Logos → Pistis → Hypostasis links, original website link, September 9 saved date, reload and Escape focus return. Windows beta 6 succeeded in [run 34319404686](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/34319404686). The 293,965,538-byte ZIP matches GitHub’s artifact digest and passes ZIP integrity; setup checksum, build identity, version, icon master identity and all 251 prepared article/index hashes match. Windows installation/runtime acceptance still requires tester machines.

Publication completed from host source `0521c6a` on September 9, with both app/database containers healthy and backup `adfontes-before-update-20260909T065331Z.dump`. Independent public verification matched all 251 article/index files against the pinned v3 checksums and downloaded both complete packages: Windows 293,965,538 bytes and Mac 35,722,380 bytes exactly match `deployment/article-beta-downloads.sha256`. Both URLs return HTTP 200 with attachment/noindex headers and HTTP 206 for byte ranges. Download directories deny listing with HTTP 403; health is OK; the approved favicon is unchanged; the homepage has no beta links. The previous beta URLs remain HTTP 200. Live browser checks at 1280px and 320px passed the revised prose, named article links, original source link, saved date, reload, passage URL preservation and Escape focus restoration. Local detailed verification records are retained under ignored `artifacts/editorial/standalone-2026-09-09/`.

## September 9 BSB adaptation — version 0.1.2

The app-only `om-studies-2026-09-09-v4` release adapts all 250 embedded articles to BSB while leaving the original `larryherzogjr.com` editions unchanged. Both packages are built from `d8971be`; Mac is beta 4 and Windows is workflow beta 7.

Live verified direct URLs:

- https://ad-fontes.app/beta-downloads/2026-09-09-bsb/Ad-Fontes-NT-Windows-x64-0.1.2-beta.zip
- https://ad-fontes.app/beta-downloads/2026-09-09-bsb/Ad-Fontes-NT-macOS-Apple-Silicon-0.1.2-beta.dmg

`deployment/bsb-beta-downloads.sha256` pins both files. Upload them to `~/ad-fontes-beta-staging/2026-09-09-bsb/`, fast-forward the clean host checkout, then run `bash deployment/publish-bsb-beta.sh`. The script checks v4 selection and package bytes, uses the existing isolated app update/backup/restart workflow, publishes the new immutable downloads, and verifies the live v4 index. It does not alter Nginx configuration or the sibling website. Interactive sudo authentication remains required.

Publication completed from clean host source `8e81e35` on September 10. The isolated update created backup `adfontes-before-update-20260910T050714Z.dump`, and the application health check passed. Independent HTTPS verification matched all 251 v4 article/index files and both complete downloads against their pinned hashes: Windows 293,940,328 bytes at `3e771f7cf602ae007354ff9bf2e909aa0d28ccd2cb48927c8a882368d8eef7fa`, and Mac 35,740,516 bytes at `d5bb90c87e69f35227f5ba207839d7fc2f067f1c7a61fc86e321ed58a0ce8ceb`. Both serve attachment/noindex responses with HTTP 200 and byte ranges with HTTP 206; release and parent directories deny listing with HTTP 403. The homepage contains no beta links, the favicon and health endpoint are unchanged, and all four preceding beta URLs remain HTTP 200.

Live browser verification passed the John 1 deep link, the Logos article, Logos → Pistis internal navigation, visible BSB/original-website-edition disclosure, preserved passage state, Escape dismissal and focus return. A separate public check confirmed that the linked Logos article on `larryherzogjr.com` retains its NET attribution. This verifies publication and package identity, not Windows installation/runtime acceptance on tester hardware.

## Host workflow (September 8 publication)

Both files are uploaded privately under `~/ad-fontes-beta-staging/2026-09-08-af/`. After the Mac pushes the reviewed source to main, pull on the host, then run:

```sh
bash deployment/publish-beta-downloads.sh
```

Enter sudo credentials only in the terminal. The script verifies staged hashes and the known live Nginx configuration, uses the normal `update-host.sh` build/backup/restart workflow for the favicon, copies immutable packages, validates and reloads only the existing Nginx configuration, and checks HTTPS responses and favicon bytes. Unexpected host edits or live configuration differences stop the script. An Nginx validation/reload failure restores the prior configuration. Other applications, databases, credentials and TLS configuration are unchanged.

The current remote sudo policy requires interactive authentication; SSH access alone cannot complete publication. After publication, verify full public-file hashes, content types, attachment/noindex headers, byte-range support, directory-listing denial, site health and the favicon URL. Do not report these URLs live merely because staging completed.

## Preparation verification

Local typecheck and production build passed (49 Node tests and 11 Python tests). The local production favicon response matches the approved ICO bytes and rendered metadata references the versioned URL. Homepage HTML contains no beta-download links. Both uploaded host files match `deployment/beta-downloads.sha256`; shell syntax and Git whitespace checks passed. Larry completed publication from source `e77d559`; Nginx validation passed and the app/database containers were healthy. The reload-transition 404 cleared on the built-in retry. The routine app update created `backups/adfontes-before-update-20260908T235608Z.dump`.

Independent public HTTPS verification downloaded both entire files and matched their pinned SHA-256 values (Windows 293,900,554 bytes; Mac 35,727,188 bytes). Both return HTTP 200 with attachment/noindex headers and HTTP 206 for byte-range requests. `/beta-downloads/` and its release directory both return 403, preventing listings. The public favicon matches the approved ICO bytes; homepage metadata is correct and includes no beta links; the health endpoint returns `{"ok":true}`. This verifies distribution, not actual Windows/Mac tester acceptance.
