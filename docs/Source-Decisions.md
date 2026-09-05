# M1 source and architecture decisions

## Authority and provenance

Retrieved 2026-09-05 from the [official download listing](https://berean.bible/downloads.htm). The publisher labels the BSB downloads “Current, updated to 3rd Printing”; it supplies no semantic version for these files. ZIP members are dated 2026-03-08. The local release is pinned to the structured archive checksum, with the TXT and saved web evidence separately hashed in `sources/bsb/manifest.json`. These dates are provenance, not a claim of an upstream release number or repository commit.

[Publisher terms](https://berean.bible/terms.htm) dedicate Berean Bible texts to the public domain effective April 30, 2023 and allow all uses, including commercial reproduction/adaptation. Evidence is saved verbatim. Scripture, publisher footnotes, section headings and layout markers are taken from the directly linked official artifacts; unrelated web assets, logos, audio, fonts and translation-table layers are excluded. No territorial restriction is stated. This records publisher evidence, not new rights claims over unrelated assets.

The complete official TXT NT inventory contains 7,941 nonempty rows. The USJ NT inventory contains the same 7,941 verse markers, across 27 books / 260 chapters, with 1,312 notes. These counts describe this snapshot, not a universal expected verse count.

## Reconciliation decision

TXT is the authority for Scripture characters, punctuation and spaces. USJ is the authority for paragraph, poetry, publisher-heading and publisher-note structure. Every render run retains its original USJ string. Every verse has a source USJ content path, a source verse label, a canonical mapping and exact TXT wording. Notes retain their entire original USJ object and source path. Flattened search uses only the authoritative verse strings.

After accounting for paragraph boundaries, 200 verses differ between official artifacts. 188 differences are whitespace only. The other twelve are:

- `[’’]` suffixes at MAT.5.48, MAT.6.34, MAT.19.30, MAT.24.51, JHN.13.38, JHN.14.31, JHN.15.27, REV.1.20 and REV.2.29;
- `vvv` characters at LUK.9.33 and ACT.4.36;
- `. . .` at JHN.21.7.

The exact before/after strings are pinned in `reviewed-differences.json`; any new difference fails import. Character alignment assigns the official TXT characters to the existing USJ reading runs; it never rewrites either raw source. The UI renders original publisher notes separately and does not treat the converter strings as textual variants. This is a transcription/format reconciliation, not an Ordinary Means theological judgment.

All 16 internal verse gaps were inspected in USJ and official TXT and have corresponding publisher notes containing the numbered reading. Those canonical anchors remain addressable with `dataState: available`, `textState: absent`, and note links. Mark 16:9–20 and John 7:53–8:11 are present in this source; the app does not infer their treatment from generic lists of “missing verses.” A missing file, wrong release, incomplete coverage, or missing present segment yields a data error instead.

## Reference contract

`registry.json` is a versioned application registry, initially seeded from this source's chapter maxima plus all intermediate numbered anchors (including the sixteen absent ones), then frozen. It is not loaded from the active edition at runtime. Supported later corpora may extend its union through explicit reviewed changes; no claim is made that the current address inventory settles every future versification scheme. Each book records canonical order, common aliases, explicit OSIS and USFM names. App codes are not advertised as OSIS. Book/chapter/verse order is numeric. Ranges can cross chapters/books, and multiple ordered non-overlapping ranges are supported. A bare single-chapter book resolves to its chapter; `Jude 5` is verse 5, whereas `John 5` is chapter 5.

`CorpusAdapter` exposes chapter/passages, coverage, notes and search; independent adapters can implement the same contract. Errors distinguish invalid reference, unsupported edition and unavailable data. M1 implements exact mappings and verified whole-verse absences; split/join/bracketed/relocated mapping implementation remains M2, not fabricated fixtures. The type contract reserves those coverage states.

## Architecture

The fixed product requirements determine scope. Static public delivery, React/TypeScript and local preferences are recommendations adopted for M1. The prescribed Sites scaffold supplies Vinext, React and accessible native-select components. There is one app, no database, no login, no API key, no remote corpus fallback. Python's standard library supplies a reproducible offline importer; Node's built-in test runner exercises TypeScript domain code. Browser storage contains only position/type settings. Standard full document navigation avoids interference with framework history handling and makes direct URL/reload behavior straightforward. Navigation is intentionally optimized for reliability before client-side routing sophistication.

The reading design is neutral prototype typography with the exact supplied branding: navy/white surfaces, a single serif reading column, quiet verse numbers, separate publisher notes and accessible controls. System serif fallback fonts support Greek; named Greek corpora and full polytonic typography acceptance are M2/M5. No fabricated logo, visual identity endorsement, commentary or resource inventory is used. No images are needed for this reading tool.

Hosting skill review: local-only scope means no Sites registration or publication. A production build is verified locally. No D1/R2 capabilities are configured. Future deployment remains a separate decision, including clearing the saved dependency audit.

## Later gates (not M1 blockers)

See `sources/registry.json`: BLB, MSB, YLT, BGB (Nestle 1904 fallback), RP2018 and Boyd 2022 TR remain candidates with no approved artifacts. Freeze exact releases/rights and avoid claiming agreement with an English version merely from grouping labels. Greek morphology, lexicon and alignment each need separate rights and source checks. An actual qualified reviewer, authentic Ordinary Means writing/assets, approved resource inventory, 25–40 variant candidates and a worked reviewed example are still needed. Source-selection or editorial ownership is not inferred from prior conversations.
