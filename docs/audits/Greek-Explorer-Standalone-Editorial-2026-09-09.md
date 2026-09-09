# Greek Word Explorer — standalone editorial revision

September 9, 2026 · AFNT-104 / AFNT-107

Completed Larry's requested editorial pass in the author-site source: **107 revised articles, 143 unchanged**. The revision removes inherited book/chapter/volume/session navigation and rewrites introductions and conclusions so articles stand alone. Named links replace chapter numbers, including corrections where the old number disagreed with the named word. Source provenance remains in metadata.

The author repository contains the [review packet](/Users/lherzog/Documents/Codex/larryherzogjr/output/editorial/greek-standalone-2026-09-09/review.md), [complete patch](/Users/lherzog/Documents/Codex/larryherzogjr/output/editorial/greek-standalone-2026-09-09/changes.patch), [hash manifest](/Users/lherzog/Documents/Codex/larryherzogjr/output/editorial/greek-standalone-2026-09-09/manifest.json), and [verification record](/Users/lherzog/Documents/Codex/larryherzogjr/output/editorial/greek-standalone-2026-09-09/verification.json). All 107 entries are indexed there. Source edits preserved the repository's existing uncommitted approval reconciliation.

## Representative changes

| Entry | Result |
|---|---|
| Artos | Related Soma, Haima and Koinonia links replace the four-chapter reading sequence. |
| Amen | Opening and conclusion explain the word without the former hundred-word/two-volume framing. |
| Parousia | Standalone introduction and conclusion replace the first/last-chapter book structure. |
| Epiphaneia | Paratheke links and explicit passage context replace book opening/closing and session numbers. |
| Theotes | Pleroma now links to Pleroma despite the inherited mismatched volume/chapter. |

## Verification and limits

- All 355 blockquote lines and footnote-marker counts in revised articles are preserved. All 715 internal Greek links in those articles resolve to existing entries.
- All 143 unaffected article files are byte-for-byte unchanged. Titles, descriptions, headwords, URLs, categories, tags and provenance fields are preserved.
- Biblical chapter references were distinguished from original-book framing. Chapter ranges in external bibliographic citations, including Pelikan's *Mary Through the Centuries*, are retained.
- Author-site `make check build` passed using Hugo 0.163.0 extended, with zero build warnings. The site checker validated 642 rendered HTML pages, metadata/JSON-LD, accessible structure and images, discovery, unique IDs and internal references.
- This is an editorial adaptation of existing teaching, not a new theological, historical, lexical, translation or bibliography audit. No application behavior changed; no application tests, native rebuild or fresh full accessibility audit is claimed.

## Review and release

The author-site [AGENTS.md](/Users/lherzog/Documents/Codex/larryherzogjr/AGENTS.md) requires drafted pastoral copy to be provisional, flagged in front matter and indexed in COPY-REVIEW.md. The changed passages are marked pending review, with the original September 8 approval date retained separately. This pending review concerns only the new revision. Existing `draft: false` fields permit local build/link verification; they do not record approval of the revised prose.

No revised prose has been published or included in an application release. After Larry approves the revisions, record approval against final hashes, publish the author site, export a new immutable OM snapshot, verify both shared builds, deploy ad-fontes.app and produce replacement desktop packages. Preserve the current snapshot and distributed betas. Installed desktop packages cannot acquire this editorial update merely because a website is updated.
