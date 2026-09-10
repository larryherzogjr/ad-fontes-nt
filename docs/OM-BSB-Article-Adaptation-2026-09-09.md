# Ad Fontes BSB article adaptation

Status: **review candidate prepared; not approved, selected, built, or deployed**.

## Decision and scope

- Adapt the 250 embedded Ordinary Means Greek articles in the Ad Fontes NT web and desktop applications from NET quotations to the Berean Standard Bible (BSB).
- Keep BSB as the primary English text. BLB and MSB may be named only when a comparison is useful; they are not automatic parallel quotations.
- Leave the corresponding pages on `larryherzogjr.com` unchanged. The application adaptation continues to link to each original page and must identify that page as the original website edition rather than implying byte-for-byte identity.
- Do not change the Scripture reader corpus, Greek analysis, lexical mappings, article identities, or original URLs as part of this work.

Keeping both sites textually identical is not required. The application already consumes a versioned, immutable article snapshot and can clearly disclose that its BSB adaptation differs from the original linked article. This avoids forcing an unrelated editorial and publishing change on the author site.

## Prepared candidate

`scripts/prepare_om_bsb_adaptation.py` reproducibly builds a review-only candidate from immutable `om-studies-2026-09-09-v3`, the pinned official BSB TXT, and the retained NET quotation-verification records in the author repository. Curated translation-specific prose lives in `scripts/om_bsb_prose_overrides.json`; `scripts/validate_om_bsb_candidate.py` independently validates the candidate.

The current local review output is `artifacts/editorial/om-bsb-2026-09-09-candidate-v30/`:

- 250 articles;
- 476 complete labeled Scripture blocks replaced with exact BSB passages;
- 1,563 line-local inline quotation replacements derived from retained quotation/reference evidence;
- 115 curated prose rewrites where the discussion depended on a NET-specific rendering, the projection was malformed in context, or an exact manual correction was required;
- all 150 additional source lines that explicitly attributed wording to NET surfaced for direct review after their BSB substitution;
- 243 conservative fallbacks reduced to the smallest whole verse or contiguous verse set supported by the quoted material, with no unresolved automatic verse selection;
- 32 contained evidence excerpts suppressed in favor of the longer excerpt at the same source location, with every surviving source span unique;
- a deterministic, stratified 136-item review sample from the remaining inline replacements, covering score bands, both testaments, and single-verse/range citations;
- 46 newly introduced BSB citation labels normalized to full book names, 24 stranded terminal periods removed from quotations that continue into lowercase prose, and 9 source-edition orphan nested closers removed;
- zero unmatched references, explicit NET labels, curated NET-distinctive lint hits, unbalanced double quotation marks, or orphan nested closing quotation marks;
- candidate manifest SHA-256 `dad1b34f996eb44bc30e9641083f39b8945992f768a2b96b511f0a695647eb2d`;
- validator report SHA-256 `ebf8611fdbf23710ebb61216357e92e9cc5964f6f74bd5c692717ed0df40abbd`.

The fallback rule is: use an exact projected BSB excerpt when the correspondence is reliable; otherwise quote the smallest whole verse or contiguous verse set containing the material on which the surrounding prose relies. Every fallback remains in the review index. The longest is 160 words because the source itself quotes most of Psalm 78:1–8; the former 290-word Romans 5 expansion is gone.

The candidate is deterministic: candidate v31 independently reproduced candidate v30 byte-for-byte, including its validator report. It is deliberately stored under ignored editorial artifacts and contains a visible-in-source pending-review marker. No immutable release bytes were changed.

## BSB source and rights

- Official source: `https://bereanbible.com/bsb.txt`
- Source SHA-256: `2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96`
- Rights evidence: `https://berean.bible/terms.htm`
- Rights: public-domain dedication effective April 30, 2023; all uses are freely permitted, including commercial reproduction and adaptation.
- Pinned local evidence and upstream checksums remain in `sources/bsb/m2-manifest.json` and `sources/bsb/evidence/`.

## Review and promotion gate

Before publication, Larry must review the complete candidate, including the 115 curated rewrites, all 150 other explicit source-attribution lines, 243 smallest-whole-verse fallbacks, and 136-item deterministic inline sample, then explicitly approve the final candidate manifest hash. Every sample item with a projection score below 0.65 is presumed to need editing until the reviewer explicitly clears it in context. Categories can overlap in the review index. The index includes source spans and occurrence numbers where repeated source text produces separate valid replacements. Any edit produces a new hash and requires approval of that new hash. The approval record must capture the manifest hash, BSB TXT checksum, validator-report hash, sample seed/results, overlap-resolution result, fallback-rule version, reviewer identity, and actual review date.

After approval:

1. Preserve the exact candidate, approval record, BSB source checksum, predecessor, replacement ledger, and output checksums in a new immutable OM release.
2. Change the shared `app/lib/domain/om-release.json` selector once; both web and desktop builds will then consume the same approved release.
3. Update the article viewer disclosure to say that the Ad Fontes edition is a BSB adaptation and that the external link opens the original website edition.
4. Run `npm test`, `npm run typecheck`, `npm run build`, desktop verification, and browser checks for deep links, internal article links, keyboard behavior, and phone widths.
5. Build new desktop packages and use the established reviewed host-update workflow. Do not deploy before approval.

Rollback is a single content-selector change back to `om-studies-2026-09-09-v3`, followed by the same build/deployment verification. Immutable predecessor bytes remain available throughout.

## Limits

- This preparation is not editorial approval and does not supersede the approved v3 release.
- No larryherzogjr.com source, build, or deployment was changed.
- No app selector, generated public bundle, native package, or live service was changed.
- BSB quotation use does not establish English-to-Greek word alignment.
- M4 remains accepted; this does not complete M5 or the MVP.
