# Ad Fontes NT 1.0.0-rc.4 full-corpus correction candidate

Date: 2026-09-11  
Status: **local release-candidate source; not committed, pushed, published, or deployed**

## Approved content basis

Larry Herzog Jr. approved full-corpus candidate manifest SHA-256 `634d06bd89eb99826c5f70ea726a6d7aaca1673558e6f790bfb6312ef8c4d213` on 2026-09-11. The approval is preserved at `docs/editorial-review/full-corpus-audit-2026-09-11/APPROVAL.md` and authorizes Ad Fontes NT promotion only.

- Immutable article successor: `om-studies-2026-09-11-v6`; manifest SHA-256 `abccd93fb810c354a36d709ebda915c8f6e6efb2b410e7aeafb3b887e5078be9`.
- Article delta: 124 exact replacements across 67 of 250 articles; 183 article files are unchanged from v5.
- Immutable word-metadata successor: `sources/word-explorer/words-2026-09-11-250.json`; SHA-256 `db4cb6f0ed59255bcd5e73aae5d751e17e4a2d2f53c85139d19580f88eba0d02`.
- Lexical bundle successor: `dodson-2010-v4`; manifest SHA-256 `d52fb7f7d60bc779be19daff4791bca09490b3d35e68e13ad185e0a65060d3ac`.
- Comparison delta: 17 exact edits across 15 units. The previously approved hashes are invalidated and replaced by Larry's 2026-09-11 approvals bound to the candidate review hashes.
- Five findings remain explicitly unresolved and unchanged: `AUDIT-062`, `AUDIT-063`, `AUDIT-064`, `AUDIT-065`, and `AUDIT-086`.

Scripture editions, canonical mappings, Greek text and analysis, publisher notes, account-backed notes, database schema and hosting configuration are unchanged. The author site `larryherzogjr.com` is outside this promotion and remains unchanged.

## Release-candidate boundary

The coordinated application version advances from public RC3 to local source version `1.0.0-rc.4`. The public Downloads page and hosted updater continue to point to RC3. A later Windows build requires the established GitHub Actions signing lane; a notarized macOS package requires the established local Developer ID workflow. Neither artifact may be published until its exact combined manifest is reviewed and approved.

## Verification

- `npm run verify:both` passed: TypeScript checking, production web build, 56 Node tests, 19 Python tests, all pinned offline imports, the desktop web build, a 13,371-file desktop bundle, and five desktop packaging tests.
- A production-browser check at a 320-pixel emulated mobile viewport loaded John 19, opened Explore Greek, selected `ἄνθρωπος`, and confirmed a 320-pixel document width with no horizontal overflow. The active v6 article bytes and all 124 approved replacements are verified by the immutable release tests.
- The promoted comparison data passed review-payload hashing for all 15 changed units and rejects the invalidated predecessor approval hashes. The promoted word metadata passed complete 250-record link preservation plus the exact three approved pronunciation changes.
- `git diff --check` passed.

No native RC4 package has been built, signed, notarized, published or runtime-tested yet. Do not infer Windows or macOS runtime acceptance from source verification alone.
