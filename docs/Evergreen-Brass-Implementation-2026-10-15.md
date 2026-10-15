# Evergreen and brass implementation — October 15, 2026

AF-UI-035–038 implements the selected handoff on the existing uncommitted AF-UI-008–016 baseline. This is a local enhancement; current-release acceptance remains closed. Version remains 4.1.3. No commit/push, hosting change, native signing, installer publication, icon replacement or account restoration.

## Changes

- **035:** Evergreen mastheads and primary/selected controls, ivory reading background, charcoal text, sage supporting surfaces/count badges, brass rule/navigation detail, and darker green links/focus. Older decorative/interactive blues were replaced by their roles; edition-status colors, publisher markers, warm exact-match/selection emphasis and source classifications remain distinct. Input boundary is deliberately `#78867E` (darker than the prior boundary); the soft decorative border is not used as its substitute. Light mobile menus retain dark-green text and focus.
- **036:** Shared local Source Serif 4 for the wordmark and scoped English interface titles; Source Sans 3 for interface controls and supporting text. The source-reading stack remains Georgia. Dedicated Greek Palatino/Times and Hebrew Noto treatments are unchanged. The original UI stack is retained explicitly for mixed-source dictionary paragraphs, word details, research/paired Greek where previously inherited, full-text excerpts/context prose and confessional source paragraphs. Authored/historical reading prose keeps its previous Georgia treatment. Packet typography is explicitly self-contained, including saved HTML.
- **037:** All twelve overview cards retain order, labels, hrefs, descriptions and the three existing data-derived counts. Each gets one decorative Lucide line icon and 30×2px brass rule, quiet card surface and restrained hover/focus. No fake counts or nested controls. Existing 3/2/1-column breakpoints remain.
- **038:** Overview introduction is “Explore the texts, languages, and resources that support your study.” The existing title, eyebrow, collection selector, overview default, recent/saved features and navigation behavior remain.

## Font provenance and delivery

The original upstream WOFF2 bytes and both OFL 1.1 licenses are in `app/public/fonts/ad-fontes-ui-v1/`. The adjacent manifest records exact source URLs, commits, internal version strings, weights/axis, sizes and SHA-256 for each file.

| Artifact | Upstream version / commit | Bytes |
| --- | --- | ---: |
| SourceSerif4-Regular.otf.woff2 | 4.005 / `80d3f8894c09c937bebfa9011247d2e1c79fd6f4` | 107,408 |
| SourceSerif4-Semibold.otf.woff2 | Same | 112,092 |
| SourceSans3VF-Upright.otf.woff2 | 3.052 / `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e` | 164,736 |

Sources: [Adobe Source Serif](https://github.com/adobe-fonts/source-serif), [Adobe Source Sans](https://github.com/adobe-fonts/source-sans). Total font payload: **384,236 bytes**. Serif supplies actual 400/600 faces; Sans supplies its actual 200–900 weight axis, including 700. No runtime/build font download or remote stylesheet dependency, no preload, no modified/subset font binaries. `font-display:swap` and local fallback stacks retain usable text if a face fails.

CSS limits the new faces to recorded Latin, combining-mark and punctuation ranges; Greek/Hebrew blocks are excluded. FontTools cmap inspection verified the recorded Latin transliteration sample without missing glyphs. This protects Greek glyph fallback even though upstream fonts contain Greek. Mixed-script source strings retain their whole prior font stack rather than being segmented or rewritten. Noto’s immutable source path/bytes remain unchanged.

`prepare_desktop.mts` explicitly stages only `fonts/ad-fontes-ui-v1` in addition to its existing release paths. Tests check exact font/license hashes, WOFF2 signatures, manifest provenance, the six expected staged files and inventory hashes. The existing desktop inventory safety test was updated for this exact folder; private/unreleased paths remain excluded. Native `font-src 'self'`, signing/updater identities and release versions are unchanged.

## Verification and evidence

`npm run typecheck` passes. `npm run build` passes, with `npm test` executed by prebuild: **185 application / 50 Python-source checks**. Final CSS-only refinements were rebuilt with `npm exec -- vinext build`. `npm run desktop:build:web` stages 61,469 files, including the exact six UI font/license/manifest files. Final presentation refinements were rebuilt with `npm exec -- vite build --config desktop/vite.config.ts`, and all **16 desktop tests** pass after the build. The initial desktop inventory assertion rejected the newly authorized font folder; its allowlist now permits that exact folder, with a stricter exact-file inventory assertion. The finished offline frontend also loads both new interface families and the pinned Hebrew font locally; English, Greek and Hebrew computed reading stacks match the web implementation. No captured final web/offline warnings or errors. No extra standalone full-test run is claimed. The UI asset test was rerun after tightening the exact-file inventory check.

Evidence: `artifacts/review/evergreen-brass/`, with before/after Library desktop/phone, English reader, Greek/Hebrew details, study/Aramaic screens, computed-font records, card matrix and contrast results. At matched 320px, all captured Greek and Hebrew source text/font/line-height records are identical before/after; English Scripture remains 21px/37.8px Georgia, and 32px/57.6px at maximum app size. Main Greek is 21px/40.95px Palatino/Times; Hebrew main reading is 21px/48.3px Noto Serif Hebrew. Dictionary source prose retains its old 16px/28.8px UI stack. Long authored bodies remain 19px/33.25px Georgia; Lenski/K&D phone prose remains 16.8px/30.24px Georgia.

Checked all twelve cards at 1440/1024/900/390/320px, including the two-column intermediate layout, with no horizontal overflow. Reader checks cover Matthew 6, Job poetry, four/five-tool phone layouts with 44px targets, maximum text, selection/copy confirmation, publisher note, focus mode, Escape and keyboard chapter navigation. Checked Greek main/interlinear/lexicon/Abbott-Smith, WLC main/Hebrew pane, H1254a/b, long Aramaic A324, exact occurrence marks, authored pages, Lenski/K&D, full-text result/context return, legacy comparison query, Hebrew page return and Back/Forward, public page masthead, mobile navigation, light/dark focus, and packet preview/HTML fragment typography. Core routes and source boundaries are unchanged.

Normal-text contrast: body 13.48:1, links 7.36:1, supporting copy 5.63:1 on ivory / 5.23:1 on sage, masthead/primary text 11.25:1. Input boundary is 3.59:1 against ivory and 3.75:1 against controls; light focus 7.36:1, brass focus on evergreen 4.28:1. Brass is decorative on light surfaces. Semantic status colors and existing forced-colors rules remain in place.

Unavailable checks are not passes: no new signed native build/device verification, OS forced-colors/contrast switching, browser 200% native zoom, or forced font-network failure. App maximum text size and responsive widths were exercised. Packet DOM/export CSS were inspected; no new system print-dialog or automated downloaded-file claim. The existing browser download-event limitation remains documented in AF-UI-015.

The active search manifest stays `70017093d90f97ccedd89edbc9d99663c18bd43b52de59bcbc24ab8f56c10a1d`. Corpus, analysis, source numbering/mappings, source dictionary/article text and approval pins are unchanged. Next: Larry reviews the complete web/offline implementation locally before separate release authorization.
