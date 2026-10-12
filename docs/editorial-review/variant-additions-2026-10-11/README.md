# Six additional textual comparisons — review handoff

Date: October 11, 2026
Backlog: AFNT-016/017 and AFNT-113 follow-on
Status: six complete drafts and six visual candidates; unpublished, awaiting exact-content adoption and approval

The requested six topics are prepared as candidates 105–110, in canonical order:
Matthew 20:16; Luke 24:51; John 1:28; Colossians 1:14; Hebrews 2:9; Revelation 1:5.
Approval of all six would bring the collection from 104 to 110. None is in the
public editorial source or bundle, and no approval ledger entry was added.

Each article includes the exact seven frozen edition rows, publisher notes at
its anchor when present, source observations, separate interpretation, and
source-specific manuscript evidence. All six plates include complete local
facsimiles, exact transcription/correction records, locators, credits and
evidence limits. Original draft prose was prepared by OpenAI Codex. Larry
Herzog Jr. / Ordinary Means is proposed attribution **only upon adoption**;
the candidate does not claim that Larry has already authored or approved it.

## Review artifacts

- Readable dossier: `artifacts/editorial/variant-additions-2026-10-11-review-v2/index.html`.
- Complete portable dossier: `artifacts/editorial/Ad-Fontes-Six-Comparison-Review-2026-10-11-v2.zip`.
- [Complete articles, edition readings and source citations](evidence/REVIEW.md).
- [Six app-schema draft records](evidence/NEW-UNITS.json).
- [Editorial candidate manifest](evidence/CANDIDATE-MANIFEST.json).
- Visual candidate: `sources/visuals/csntm-sinaiticus-additions-2026-10-11-v2-candidate/`.

The ZIP contains 105 members and is 7,929,777 bytes. Its SHA-256 is
`8251922832ae3bb4f0a16ca46e9bc56b53a3751d1af5439827c31dbe0c32aa62`.
Extract it and open its `index.html`; the articles and local images work without
network access. External source links remain optional online references.

## Exact review identities

Editorial manifest SHA-256:
`7499b21e24185dbc1d72447f6d360ae255df5bfb6f094d70915ea89011a51f91`.

Visual candidate SHA-256 (canonical manifest core):
`acc44841ea168a7f05e7453ab22615d7584e7941081c4c7f01d39f72ec75eead`.

Combined packet manifest SHA-256:
`9d6f851425702b8da807da350215a472a64c00fee298a895a32ce6c82a96d1c0`.

Review the complete articles and plates together. An approval should explicitly
adopt the proposed prose/attribution and approve both exact editorial and visual
identities above. Any subsequent content, attribution, citation or caption edit
requires a successor candidate and a fresh exact-content review. These are
review identifiers, not records of approval.

## Evidence distinctions

- **Luke 24:51:** all seven editions print the ascension clause. Nestle prints
  double brackets around it, while whole-verse coverage remains present. The
  Sinaiticus first hand lacks the clause; ca adds it. No artificial whole-verse
  absence or partial-focus bracket conversion was introduced.
- **John 1:28:** RP2018/MSB agree with Nestle/BSB/BLB on Bethany. The Sinaiticus
  cb2 spelling `βηθαραβα` stays exact; it is not silently rearranged to match
  Boyd's `Βηθαβαρᾶ`.
- **Colossians 1:14:** MSB/RP2018 also have the shorter wording. Byzantine and
  TR are not treated as interchangeable groups.
- **Hebrews 2:9:** all seven editions and the Sinaiticus plate support grace.
  No bundled publisher note supplies the alternative. The historical report
  comes from Origen, *Commentary on John* I.40, in Allan Menzies' translation,
  as reproduced/revised by New Advent. Its own source attribution dates the
  volume to 1896. A private HTML snapshot and SHA-256 are preserved; the draft
  uses brief wording identifiers and an original limited paraphrase, not an
  imported eighth Scripture edition or a modern manuscript apparatus. Original
  Greek and other witnesses have not been independently collated. The article
  has an explicit `comparisonNotice` and is not mislabeled publisher-note-only.
- **Sinaiticus:** claims were checked against the preserved version 1.04
  transcription. Complete-page facsimiles were inspected for usable presentation;
  this is not an independent paleographic collation of every letter or hand.
  These images retain the recorded project-owner permission basis and full
  institutional credits. Twelve missing image/metadata files were acquired for
  the specific new page inventory; normal verification performs no network fetch.

The initial private v1 was superseded before handoff to correct the external
translation's bibliographic year from 1897 to the source page's 1896. V1 bytes
remain outside production; v2 is the complete review candidate.

## Historical reserve disposition

The September 13 records preserve a **ten-unit viability reserve count**, but
no named reserve slate was found in the working tree, preserved expansion
packets or tracked expansion history. Those records are not proof that ten
completed articles exist. The original passage list was requested from Larry;
it is not silently replaced by ten newly invented topics. These six were checked
against the 104 approved anchors, but cannot be deduplicated against an unnamed
reserve. The three separately documented Western Acts source gaps remain
deferred and are not conflated with this unnamed reserve.

## Reproduction and verification

The editorial generator refuses to replace an existing output directory:

```sh
node scripts/build_variant_additions_candidate.mts --output=/private/tmp/ad-fontes-six-review-reproduction
```

The resulting editorial manifest and outputs should match v2 exactly. A second
generation was independently compared and produced byte-identical manifest
content. `prepare_variant_additions_sinaiticus.py` likewise refuses to overwrite
an existing visual candidate. The historical transcription parser is reused
without changes; its bytes and inputs are pinned.

```sh
node scripts/verify_variant_additions_candidate.mts
```

The verifier checks every editorial, source, visual and packet checksum; schema
and exact edition/note fidelity; all six payload bindings; image metadata/JPEG
integrity; John/Luke correction distinctions; the Hebrews limitation; unchanged
104-unit production and predecessor payloads; and rejection of all six drafts by
the existing publication gate. It never grants an approval or writes public data.

Browser review checked direct navigation to Luke and Hebrews, Enter-operated
disclosures, Nestle's exact double brackets, the local Luke facsimile at its
3744×5616 source dimensions, visible Hebrews limitation, six article sections,
390-pixel layout without overflow and no captured warning/error messages.
Phone evidence: `artifacts/review/variant-additions-hebrews-phone-2026-10-11.png`.

Final engineering checks: `npm test` passed (126 Node tests and 44 Python tests),
`npm run typecheck` passed, and `npm run build` passed, including its complete
prebuild import/fidelity/publication/test checks. The public Library remains
104 comparisons. No application runtime or reader code changed, so the browser
checks above concern the private review dossier, not new deployed reader behavior.

Next: Larry's review/adoption of these six articles and plates, recovery of the
named ten-item reserve, then guarded promotion and full shared web/desktop
release verification when authorized. No deployment, Git push, native packaging,
version change, or M5/MVP completion is implied by this preparation.

## Subsequent approval and promotion — October 11

Larry approved all six articles/plates and authorized coordinated release 3.6.2. [Exact approval](APPROVAL.md) supersedes the draft status above. Six matching editorial reviews adopt the unchanged payloads; the visual candidate bytes remain in the immutable successor with a separate approval record. The verifier now validates the approved 110-unit collection using preserved predecessor aliases, not the retired current-queue input paths. Normal release verification uses the saved evidence in this directory and the selected visual successor; ignored review artifacts are optional. The original generator is preserved as a historical implementation bound to its 104-unit predecessor and should not be run against the advanced live queue. Signed-artifact verification/staging and Larry's guarded own-terminal host publication remain release work.
