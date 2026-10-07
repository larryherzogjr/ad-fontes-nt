# English OT source/display acceptance and Ad Fontes branding — 2026-10-07

Larry Herzog Jr. approved step 1 (recording approval and promoting the verified English OT corpora) and authorized step 2 (public rebranding) with the exact response:

> 1. Approved
> 2. Go for it

This follows his “Looks good” review of the local OT reading/comparison preview. The accepted source/display candidate is `ot-english-2026-10-07-candidate-v3`; its exact metadata identities are recorded in `sources/ot/releases/ot-english-2026-10-07-v1/approval.json`. Acceptance covers the reviewed four English editions, title/heading distinctions, source reconciliation decisions and disclosed BLB draft / MSB OT identity. No exhaustive physical-device, textual-apparatus or live note-persistence audit is inferred.

## Promotion

The successor `ot-english-2026-10-07-v1` publishes four edition releases under `/corpus/`. Scripture, blocks, notes, original source fields, coverage and search content are unchanged from candidate v3. Only chapter release IDs and manifest release/status/provenance fields change. Publisher output checksums and implementation identity are pinned; every promoted file is independently compared with its candidate predecessor. All raw inputs, NT releases, original registries and candidate metadata remain preserved.

The selected whole-Bible registry is the approved successor file under this release. The original `registry.json` and `canonical-registry.json` remain NT reproduction inputs. Reader references now use the successor, independent of edition coverage. Normal offline builds reproduce approved OT files; desktop staging includes these four releases alongside the seven NT editions. Greek editions, analysis and existing commentary remain NT-only.

## Public branding

The public name is **Ad Fontes**, with exact subtitle **A biblical study environment from Ordinary Means.** Reader, Library, public pages, metadata and desktop reader/update UI use it. Native product/package identifiers, signing configuration, application bundle names, updater URLs and existing download paths stay unchanged. The existing 1.1.5 downloads are expressly identified as NT-only packages. Previously supplied social-preview graphics remain unchanged historical assets; replacing their printed branding requires a later asset update.

## Release boundary and next work

Promotion means inclusion in normal local web/desktop builds. No Git push, hosted deployment, new signed installer or updater publication is included. Existing live account APIs and ownership/Origin/CSRF/version rules are unchanged. Live OT note saving remains a separate verification step in the configured isolated test environment. Mixed-testament quotations/comparisons remain unsupported because the two testaments retain independent source releases. Septuagint, Hebrew tooling and curated NT-to-OT connections remain deferred.

AFOT-004 local English OT implementation and source/display acceptance are complete. AFOT-006 public code branding is implemented; signed release packaging and historical social graphics remain separate. AFOT-005 NT-to-OT connections/Septuagint source selection is the next content capability after release verification.

## Final engineering verification

`npm run verify:both` passed typecheck, production web build, all 81 Node and 29 Python tests, deterministic source reproduction, desktop staging of 17,197 released files, desktop build and six desktop tests. The promotion tests compare every released OT file to its exact candidate predecessor and preserve NT registry/native-identity checks. Browser review checked the new reader/Library name and subtitle, OT deep links, four-edition comparison, keyboard study/reference and Malachi-to-Matthew navigation, source links and 390px reading / 320px comparison and sources without horizontal overflow. No physical-device or live-note-saving test is claimed.

## Subsequent release direction

Larry subsequently directed that the standalone English OT foundation release be forgone in favor of NT/OT connections. The approved local corpus bytes and branding decision remain; no separate foundation publication is planned. See [the superseding scope record](NT-OT-Connections-2026-10-07.md).
