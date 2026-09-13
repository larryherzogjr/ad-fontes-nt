# Ad Fontes NT 1.0.0-rc.11 macOS lightbox correction

Date: 2026-09-13

Status: source candidate prepared locally; RC10 remains the published immutable release

## Scope

RC11 is a narrowly scoped coordinated web/macOS/Windows successor candidate for
AFNT-112. It corrects manuscript-image enlargement in the macOS Tauri/WebKit
application. The RC10 implementation placed a fixed-position Base UI portal
inside the reader's study `<dialog>`; WebKit constrained that overlay to the
study panel instead of the application viewport. The browser presentation was
not affected.

The correction uses a body-portaled native top-layer `<dialog>` for manuscript
enlargement. It centers the complete artifact against the full application
window, isolates Escape/cancel handling from the enclosing study dialog, and
restores focus to the exact `Enlarge` trigger. The reviewed title, locator, alt
text, caption guidance and locally bundled image remain unchanged.

No Scripture, approved commentary, lexical content, visual-source registry,
source image, caption, rights record, commentary approval hash, account,
database, hosting behavior, updater trust key or update-channel configuration
changes. RC10 remains intact as rollback.

## Verification before source commit

- A separately named local macOS debug application reproduced RC10's clipping
  and verified the correction in the Tauri WebKit runtime at the normal
  1280-pixel window and a true 390-pixel window.
- Both widths retained the complete artifact without panel clipping or
  horizontal overflow. Keyboard Escape dismissed only the enlargement,
  preserved the direct-linked comparison and restored focus to the exact image
  trigger.
- A local production-browser check repeated open, complete-artifact rendering,
  Escape dismissal, direct-link retention and focus restoration at 2 Peter
  3:10.
- `npm run verify:both` passed TypeScript checking, deterministic publication,
  production web and desktop builds, 69 Node tests, 20 Python tests, staging of
  all 13,412 released offline files and six desktop tests. The existing
  non-fatal desktop bundle-size warning remains.

## Release gates

This record does not authorize a push, signed build, artifact publication, web
deployment or hosted-server change. Delivery requires the established sequence:

1. exact source-commit review and approval, then fast-forward push to private
   `main`;
2. signed/notarized Apple Silicon and Public Trust-signed Windows builds from
   that exact source;
3. combined immutable staging and exact updater-manifest/artifact approval;
4. artifact-pin source commit and approval;
5. explicit publication and coordinated web-deployment authorization; and
6. independent live hash, header, health, rendered and updater verification.

The RC10 stable manifest, updater payloads and public installers remain
unchanged until those gates are completed.
