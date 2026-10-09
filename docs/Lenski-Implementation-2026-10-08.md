# Lenski commentary — October 8, 2026

AFNT-108: Larry authorized building Lenski after stating he had researched the public-domain status of all NT commentaries. This records the user's source-rights determination and authorization; it does not claim independent legal certification. The supplied handoff's instructions are source material, not a replacement for repository requirements.

The original supplied ZIP is pinned unchanged in `sources/lenski/raw/`; `sources/lenski/source.json` records attribution, exact hash, the decision and transcription limitations. No supplied extraction scripts are executed. The archive does not contain original renderer dumps, source-page locations or the old comparison transcription. We preserve the supplied text, including reported Greek-adjacent spacing losses, rather than invent restorations or claim original-edition fidelity.

## Import and mapping

`python3 scripts/lenski/import_lenski.py` runs offline and verifies the archive, implementation, mapping decisions and every generated output against `content/lenski/release.json`. The release is `lenski-2026-10-08-v1`. All 27 books / 260 chapters are preserved. Rejoining each chapter's paragraphs exactly reproduces its supplied source text and hash. New releases are required for future source/mapping changes after acceptance; this is the initial local candidate.

The paragraph mapping audit excludes introductory outlines, internal numbered lists, a duplicated verse-39 discussion boundary and broken Robertson page references. Explicit engineering decisions recover merged section headings, comma-grouped verse labels, a standalone label, a missing parenthesis, a subverse label and inspected opening quotations. The numbered prose itself is unchanged. 2 Corinthians 13 has an explicit canonical override: Lenski's source 12 includes canonical 12–13; source 13 is canonical 14. The reader discloses this distinction.

The current candidate contains 7,766 sections and maps 7,881 addresses from the canonical NT union. 81 addresses do not receive a guessed precise anchor. This includes unnumbered joint exposition, textual discussion, cross-chapter placement and alternative canonical-union addresses. `mapping-audit.json` enumerates every gap. Selecting these addresses explicitly offers chapter context; it does not say Lenski has no commentary or Scripture is absent. Full chapter reading/search remains available. These engineering checks are not a line-by-line scholarly transcription review or new theological approval.

## Shared interface

Study Library → Commentaries → Lenski contains all books, chapter navigation, a separate introduction view and on-demand text search within a selected book. Search links preserve chapter/paragraph context and distinguish introduction results. The reader offers Commentaries from its toolbar, selected-verse actions and study tabs. Selected passages show matching sections; longer reading is available with “Read chapter commentary.” Cross-chapter selections load each relevant chapter; the tool limits simultaneous loading to ten chapters. OT selection explains the collection's NT scope. Reader return links go to Study Library.

Lenski's prose and translations are labeled historical commentary, distinct from the active Scripture edition and Ordinary Means editorial content. Source details include the original edition/transcription limitations. Text is rendered as React text nodes, not trusted HTML. Commentary chapters and per-book search indexes load on demand. The same release is included in the desktop asset allowlist; no external commentary service or account is required.

## Verification and status

Verification passed: 108 Node tests, 32 Python tests, TypeScript checking, production web build, offline desktop web build and all six desktop checks. Desktop verification compares every packaged release file byte-for-byte with its public source; its asset-category assertion now includes commentaries. Tests cover all output hashes, chapter reconstruction, outline/page-number exclusions, grouped labels, merged headings, canonical overrides, multi-chapter selection, OT scope and conservative gap behavior. Browser checks cover the Library, John search, direct reader links, 390px layout and keyboard close/reopen with restored focus. Additional browser checks verified Philemon grouped verses, the 2 Corinthians 13:14 numbering exception, an unmapped Romans address with full-chapter fallback, introduction search from chapter 2 and restoration of the search after browser Back. Screenshots are under `artifacts/review/lenski-*`.

This is local implementation only. No deployment, signed installer, new version number, Git push or completion of M5/MVP is implied. Prior desktop 2.1.3 publication handoff is separate. Next: user review of the working feature and remaining precise-mapping gaps before coordinated publication. No native installers were built for this candidate.
