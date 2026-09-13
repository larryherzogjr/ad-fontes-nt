# Ad Fontes NT 1.0.0-rc.13 textual-comparison Library return

Date: 2026-09-13

Status: corrected successor source and signed artifacts approved; artifact-pin publication gate prepared; RC12 remains published

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

## First source approval

Larry approved exact source commit
`f0f100038c53ef13f011247455ad90fafab80270`. It was pushed to private `main`,
and the remote branch independently resolved to the same hash.

## Superseded first source and native artifacts

- Apple application notarization submission:
  `012728f3-6428-43a1-86d8-f25d2656c5da` (Accepted).
- Apple DMG notarization submission:
  `a6acb741-8f7e-4d6b-990c-6adad8562ab4` (Accepted).
- macOS public DMG SHA-256:
  `b58eba7f69c288cc18e779305bba13c90e258c0f264598f630226cb8f1290300`.
- macOS updater archive SHA-256:
  `077a4e58519d92c1dbe1fabc6c47ce762e50f751af6c59bf5219ab577b4d515b`.
- macOS updater signature-file SHA-256:
  `c734c34e78b0b0fc2a6f390cfbd10802d1eadf9ce3996cceaca3a7c307577031`.
- Windows GitHub run: `34748192660`; clean shared verification, Azure OIDC,
  Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode
  verification and artifact upload passed.
- Windows installer/updater SHA-256:
  `9d5076904abe4919931f2b7c1f2074d068e2789d75713437ba5a584a5e0cdc86`.
- Windows updater signature-file SHA-256:
  `21f58b00c0cdd9606be61d5e6f3f31e8bfed5352af76d97c408bf364b6de76ee`.
- GitHub artifact ZIP digest:
  `sha256:7352da98c1ccc30c4d674d48cc462c285e953b1714049e2a29ee9c425c9abf6c`.

The permanent updater public key matched the release configuration. Independent
macOS verification reproduced the three hashes, confirmed version
`1.0.0-rc.13` and arm64 architecture, and passed strict/deep code signing,
Gatekeeper assessment, stapler validation and DMG checksum validation. A
read-only mount of the final DMG repeated the version, architecture, signing,
Gatekeeper and stapled-notarization checks against the packaged application.

## Superseded first updater candidate

The combined immutable staging reproduces both updater payload hashes and passes
every entry in `SHA256SUMS`. It has publication date
`2026-09-13T09:06:02Z` and release note: “Adds a direct return from textual
comparisons to the Library while preserving Close-to-Scripture.”

- `stable/latest.json` SHA-256:
  `a31f4ebaef6d020e59d1ba01cf0bec2dc116e6349b5a8a2643b466bddb4ba829`.
- `SHA256SUMS` SHA-256:
  `c813b52941a2bd4ca3413e95905a6ac2f269f5bc3dedb16bf127868150b51752`.

Larry approved that exact manifest hash and its associated signed artifacts.
During the subsequent artifact-pin review, the reader source was found to retain
the visible sentence “Version 1.0.0-rc.12 is the current cross-platform desktop
candidate.” The requested navigation behavior and all signed-package checks were
correct, but publishing an RC13 package with that stale status label would be
misleading. These first unpublished artifacts and their manifest are therefore
explicitly superseded and must not be published.

The corrected successor source identifies RC13 consistently in the in-reader
project status and Downloads page.

## Corrected successor verification

- `npm run verify:both` passed TypeScript checking, deterministic publication,
  72 Node and 20 Python tests, the production web build, staging of all 13,473
  released offline files, the desktop web build and six offline desktop tests.
- A rendered offline-desktop check confirmed both the textual-comparison return
  link and the exact `Version 1.0.0-rc.13 is the current cross-platform desktop
  candidate` project-status sentence. No browser-console warning or error was
  reported.
- The first corrected pass exposed only a regression-test-sensitive JSX line
  wrap in unchanged Downloads prose. Aligning that source wrap produced the
  clean final verification run; it did not alter visible wording or behavior.

Larry approved corrected successor source commit
`d1e318ceebf09b0bfbaa6ec7469c666f15a933f4`. It was pushed to private `main`,
and the remote branch independently resolved to the same hash.

## Corrected signed native artifacts

- Apple DMG notarization submission:
  `5b7ab931-e8b9-480f-b2e4-278ffd41cc09` (Accepted).
- macOS public DMG SHA-256:
  `8712ab085fb4b2221633cc69706bd3809c56dab033a447b75fc2e2b128c13201`.
- macOS updater archive SHA-256:
  `d304b88e9e44069faaddb240426dc86245b3d8fad6042fcd7b59444b6c2ff4d4`.
- macOS updater signature-file SHA-256:
  `3f50a8216dcc4a29cadf94a802b30d1ba0c33ed46689912e2a0a08cffebfbf08`.
- Windows GitHub run: `34750778343`; clean shared verification, Azure OIDC,
  Artifact Signing Public Trust, RFC 3161 timestamping, Authenticode
  verification and artifact upload passed at the corrected source commit.
- Windows installer/updater SHA-256:
  `075f53ebf4dbbbe46f48c96f27f83a0d4e8aa9af91d6834cb3c057dcef9b0240`.
- Windows updater signature-file SHA-256:
  `7386ee2d2ddaf260d09afedb7ec1c75da3c3288ad184540c156162314bc37ff3`.
- GitHub artifact ZIP digest:
  `sha256:68e853ca845c3516894d4f24a1aad1aadfb43053950aed0a04046cb1fd9beaac`.

Independent macOS verification reproduced every supplied hash, confirmed the
mounted DMG contains version `1.0.0-rc.13` and an arm64 executable, and passed
strict/deep code signing, Notarized Developer ID Gatekeeper assessment, app and
DMG stapler validation and DMG checksum validation. The downloaded Windows
artifact reproduced its internal checksums, exact source commit, version,
release ID and signing metadata.

## Corrected updater candidate approval

The corrected immutable staging reproduces both updater payloads and passes
every entry in `SHA256SUMS`. It has publication date
`2026-09-13T10:25:14Z` and release note: “Adds a direct return from textual
comparisons to the Library while preserving Close-to-Scripture.”

- `stable/latest.json` SHA-256:
  `ad0305581151a4b4691003f4149ea44f529b015841cf7df22e0ed101d9546eb6`.
- `SHA256SUMS` SHA-256:
  `5b491b6497b5cd0accd2fbee960cc3f84d1d87d1c1e885b859b88fd542a916a3`.

Larry approved that exact corrected manifest and the associated signed
artifacts. This approval does not revive or authorize any superseded RC13
artifact listed above.

## Remaining gates

The artifact-pin commit, publication of the corrected updater payloads and
public installers, coordinated web deployment, and independent live
verification remain separate gates.

Until those gates pass, the public Downloads page, stable updater manifest,
hosted web application and published desktop packages remain RC12.
