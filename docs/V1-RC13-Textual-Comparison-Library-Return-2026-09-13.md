# Ad Fontes NT 1.0.0-rc.13 textual-comparison Library return

Date: 2026-09-13

Status: prepared and locally verified; RC12 remains the current published release

## Scope

RC13 is a narrowly scoped coordinated web/macOS/Windows successor candidate for
AFNT-114. It adds `← Browse Textual Comparisons` at the top of a loaded textual
comparison so a reader who entered from the Library can return directly to the
default textual-comparison collection at `/library`.

The existing `Close` action is unchanged and continues to close the study panel
while retaining the Scripture reading screen. The new return link appears for
both edition-comparison and publisher-note comparison presentations. It does not
appear in Greek exploration. The route is local and is included in both the web
application and offline desktop bundle.

No Scripture, approved commentary, Greek analysis, lexicon content, manuscript
evidence or image, source registry, corpus mapping, account, database, hosting,
updater trust key or update-channel behavior changes. RC12 remains intact as the
published rollback release.

## Verification before source commit

- `npm run verify:both` passed TypeScript checking, deterministic publication,
  72 Node and 20 Python tests, the production web build, staging of all 13,473
  released offline files, the desktop web build and six offline desktop tests.
- Starting in the offline desktop Library, opening the Mark 11:26 textual
  comparison exposed both `← Browse Textual Comparisons` and `Close`. The return
  link navigated to `/library`; Close removed the panel parameters and retained
  the Mark 11 Scripture reader.
- Direct links verified the return action in an edition comparison and the
  Revelation 13:18 publisher-note presentation. A John 1:1 Greek-exploration
  direct link did not expose the textual-comparison return action.
- At an exact 390×844 browser viewport, both return and Close actions were
  visible, the document had no horizontal overflow, and return navigation
  reached `/library`.
- Enter-key activation of the return link reached `/library`. Shared web and
  offline-desktop presentations both exposed the link, and the checked browser
  states reported no console warning or error.
- The existing non-fatal desktop bundle-size warning remains.

## Remaining gates

This preparation does not authorize a source push, native package build,
signing, notarization, updater-manifest change, publication or deployment. The
next gate is owner review and approval of the exact source commit. If approved,
macOS and Windows packages must be built from that exact source and independently
verified before a separately approved updater manifest and coordinated web
publication.

Until those gates pass, the public Downloads page, stable updater manifest,
hosted web application and published desktop packages remain RC12.
