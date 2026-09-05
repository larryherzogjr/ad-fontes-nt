# Ad Fontes NT

**A New Testament study environment from Ordinary Means.**

Product and engineering handoff · Version 1.0 · September 5, 2026

Status: implementation-ready direction, with explicit source and editorial gates. No application has been built or deployed as part of this handoff.

Companion: [Implementation plan and initial backlog](Ad-Fontes-NT-Implementation-Plan.md).

## 1. Product thesis

Ad Fontes NT helps serious lay readers and teachers read the New Testament closely, understand why texts and translations differ, explore Greek responsibly, and bring those observations into study and teaching. It combines a calm reading environment with trustworthy, passage-linked Ordinary Means material.

The distinctive promise is a short path from reading a passage to understanding a meaningful textual question, without requiring scholarly software or prior knowledge of textual criticism. Textual criticism is a first-class capability in the data and editorial workflow; its presence in the default reading interface is restrained.

The foundational content is locally maintained public-domain Scripture. The application must remain useful without an external Bible API, licensed premium translations, or AI. BSB is the default English reading edition. Scripture references, notes, resources, and variants are anchored independently of that default.

Commercial viability remains a hypothesis. The initial business experiment is whether Ordinary Means readers return to this environment and use it for actual study and preparation. Neither an AI feature nor a large translation menu establishes willingness to pay. Keep the technical foundation compatible with later commercial use without making subscriptions an MVP dependency.

### Decision provenance

The controlling brief is the user's current request. The referenced conversation, “Assess Bible Study Tool viability,” was recovered through the conversation reader. It supports NT-only scope, local BSB, separate Byzantine Majority and TR groupings, and the Ordinary Means identity. Some historical assistant messages remain truncated in the retrieved record; no unavailable material is treated as a requirement. No Ordinary Means brand files, content archive, doctrinal style guide, or NET ePub was attached.

**Fixed direction:** product name and subtitle; NT-only MVP; reading-first UX; translation-neutral references; local corpus; three textual groupings; clear source categories; Ordinary Means identity; no Logos-scale scope.

**Recommended implementation choices:** a modular web application, static public reading data, separate private notes storage, curated variants, and local notes before account synchronization.

**Still provisional:** exact edition releases, hosting/runtime, editorial reviewers, visual brand assets, public-launch variant coverage, and revenue model.

## 2. Target users and jobs to be done

| User | Situation and job | Successful outcome |
|---|---|---|
| Serious lay reader | “I want to read carefully without losing the flow.” | Opens a passage, reads a chapter, switches translation, and returns to the same place. |
| Reader encountering a textual question | “My Bible has a footnote or a missing verse number. What is going on?” | Sees edition-specific readings and a plain explanation, distinguishing textual variation from English wording. |
| Church teacher or study leader | “I need to explain this passage accurately to a group.” | Saves a passage note, consults reviewed Ordinary Means resources, and follows citations. |
| Greek-curious reader | “What Greek word is here, and how is it used elsewhere?” | Sees a contextual gloss, lemma, understandable grammatical information, and occurrences in a named edition. |
| Ordinary Means reader | “Where does this essay or study connect with the NT?” | Opens its linked passages and finds related material without losing the reading context. |

Scholars can benefit, but exhaustive apparatus research and advanced syntax querying do not determine the MVP. Newcomers should be able to read immediately without an account, a confessional vocabulary lesson, or choosing a theory of textual criticism.

## 3. Editorial and theological posture

Ordinary Means supplies the editorial voice and Lutheran/confessional perspective. Preserve the identity openly, while explaining unfamiliar terms when relevant. Do not invent a narrower denominational affiliation or doctrinal policy from the name alone.

Proposed editorial practices, subject to review against existing Ordinary Means material:

- Treat Scripture reverently and render the selected edition faithfully. Do not silently harmonize, modernize, or correct its text.
- Present textual evidence, editorial judgments, and theological interpretation as distinguishable claims. Explain competing readings fairly; avoid sensational labels such as “corrupted Bible.”
- Do not imply that BSB and BLB are independent manuscript witnesses, that Majority and TR are identical, or that a majority of displayed translations settles a reading.
- Explain the scope of a variant before discussing its interpretive significance. Avoid automatic claims that every variant either threatens doctrine or has no significance.
- Use existing Ordinary Means writing to establish tone. Link confessional sources with work, article/section, edition, and author or translator where applicable.
- Attribute direct quotations and distinguish them from summaries. A historical confession may be old while a modern English translation remains protected.

### Content categories visible to readers

| Category | Visible treatment | Provenance requirement |
|---|---|---|
| Scripture | Main reading surface; translation and edition identified | Corpus edition and release |
| Publisher's notes | Footnote surface labeled by publisher | Source file and original note identifier |
| Ordinary Means commentary | Resource or explanation panel; byline | Author, reviewer, date, citations |
| Confessional source | Labeled quotation or summary in a separate resource | Work, section, edition, translation, rights |
| Personal note | “My note”; private workspace | User ownership and passage anchor |
| AI-generated material, if added | Explicit “AI-generated” label; separate surface | Generation provenance, cited inputs, review status |

AI is outside the MVP. Later use must not modify Scripture, invent manuscript support, or automatically publish variant explanations. Human-reviewed material that originated with AI retains provenance internally; review does not erase authorship history.

## 4. Scope and non-goals

### MVP commitment

Support all 27 NT books, BSB/BLB/MSB/YLT or a verified replacement, and one explicitly identified public-domain Greek edition for each comparison grouping. Provide chapter reading, reference navigation, translation switching, basic English text search, curated variant panels, basic Greek word exploration, private passage notes, and passage-linked Ordinary Means resources.

Proposed editorial launch target: 25–40 reviewed variant units spanning several books and types, plus 10–20 approved Ordinary Means resource links. These are planning targets, not existing inventory or promised exhaustive coverage. Complete NT Scripture coverage and selective explanatory coverage must be communicated separately.

Greek exploration begins with a named Greek edition and its verified token/lemma data. Word-level English links are offered only where alignment is established. A full English reverse interlinear across four translations is not a launch requirement.

### Deferred

Account synchronization; teacher collections and handouts; group assignments and discussions; licensed NET/ESV; offline application installation; advanced Greek searches; audio; manuscript images; richer confessional libraries; AI assistance; payment flows.

### Explicit non-goals

Old Testament textual criticism, Hebrew tooling, a complete manuscript apparatus, a theological chatbot as the core interaction, a general research library marketplace, native mobile apps, collaborative editing, or recreating Logos. The schema can accommodate new corpora later without implementing OT behaviors now.

## 5. Corpus and licensing register

Research below was checked against the linked publisher or distributor pages on September 5, 2026. “Public-domain statement located” is evidence for planning, not a claim that a particular unexamined download and all its ancillary assets have been cleared. Before shipping, record the exact files and license evidence for every included layer.

| Corpus | Product role and proposed source | Evidence located | Verification before ingestion/release |
|---|---|---|---|
| BSB, NT subset | Default readable English; critical/eclectic grouping | Berean dedicates its Bible texts to the public domain and permits commercial adaptations. [Berean terms](https://berean.bible/terms.htm) | Pin edition/release and checksum; preserve text; audit headings, notes, and references separately. |
| BLB, NT | Literal English companion; critical/eclectic grouping | Berean's terms link BLB; official downloads include the NT. [Terms](https://berean.bible/terms.htm), [downloads](https://berean.bible/downloads.htm) | Confirm selected file's notice and version; BLB means Berean Literal Bible here, not Blue Letter Bible. |
| MSB, NT | Readable Byzantine Majority English | Publisher identifies it as the BSB counterpart using Robinson–Pierpont and describes CT/TR footnotes. [MSB publisher](https://majoritybible.com/) | Identify exact underlying RP edition where possible; do not assume agreement with every RP release. |
| YLT, preferably 1898 | Initial TR-based English candidate | eBible marks its YLT public domain; Young's revised preface identifies the Received Text. [eBible](https://ebible.org/engylt/), [historical preface](https://media.sabda.org/alkitab-12/ccel/bible/ylt/ylt.htm) | Pin digital edition and transcription provenance. Do not claim it translates precisely the chosen Greek TR edition. Archaic language needs a short selector description. |
| Berean Greek Bible (BGB) | Preferred candidate for the critical/eclectic Greek slot because of the related Berean data | Official downloads list the Greek NT; Berean describes the sources consulted. [Downloads](https://berean.bible/downloads.htm), [source description](https://bereanbibles.com/about-berean-study-bible/greek-and-hebrew-sources/) | Confirm exact BGB text, its public-domain coverage, table-field rights, release compatibility, and alignment with English. Do not label it NA28 or the universal critical text. |
| Nestle 1904 | Concrete fallback for critical/eclectic Greek | CrossWire identifies its Nestle 1904 module as public domain. [Distributor rights record](https://www.crosswire.org/sword/copyright/ModInfoCopyright.jsp?modName=Nestle1904) | Verify downloaded module against source transcription; review morphology independently. Label as a historical critical edition, not the exact Greek behind BSB/BLB. |
| Robinson–Pierpont 2018 | Proposed Byzantine Greek edition | Official repository identifies RP2018, provides morphology/Strong's data, and declares its code and text public domain. [Official repository](https://github.com/byztxt/byzantine-majority-text) | Pin a suitable 3.x release/commit; verify Unicode against official source files; select main text versus apparatus intentionally. |
| Boyd's 2022 TR compilation, distributed as `grctr` | Concrete public-domain TR Greek candidate | eBible declares text and Boyd's manuscript comparison notes public domain; introduction describes a compilation of three historical TR editions. [Rights record](https://ebible.org/bible/details.php?id=grctr), [edition introduction](https://ebible.org/pdf/grctr/grctr_all.pdf) | Label “TR — Boyd compilation (2022)” explicitly. If a single historical edition is preferred, substitute a verified Scrivener or Stephanus transcription before freezing fixtures. Never label Boyd's compilation “Scrivener 1894.” |

BSB's classification as critical/eclectic is a product-level description consistent with the publisher's consultation of multiple editions; it is not a declaration of verse-by-verse identity with one modern Greek edition. [Berean source description](https://bereanbibles.com/about-berean-study-bible/greek-and-hebrew-sources/)

A useful machine-readable BSB/MSB candidate is the publisher-associated USFM/USJ/USX repository, which separately describes its text as public domain. Choose a pinned artifact only after checking it against the direct official download. [BSB/MSB distribution](https://github.com/BSB-publishing/bsb2usfm)

**Greek selection decision:** attempt BGB validation first; use Nestle 1904 if BGB's exact distributable text or metadata cannot be established promptly. Keep RP2018 and the explicitly named Boyd compilation as the proposed other slots. This preserves three-group coverage without pretending the editions are exact equivalents of the English versions.

### Supplementary data and optional editions

Lexicon entries, morphology, English–Greek alignment, apparatus notes, modern editorial introductions, audio, fonts, and manuscript images are independent assets. A Scripture license does not automatically cover them. The RP repository is a promising first morphology source. A public-domain/CC0 lexicon candidate is the [Biblical Humanities Dodson lexicon](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon); inspect the precise license and attribution before importing. Curated contextual glosses can be authored by Ordinary Means.

NET remains optional. Its current copyright page separates noncommercial uses from commercial permission requests and excludes notes from some permissions. Possessing an ePub does not establish application redistribution rights. Verify text, notes, storage, search, and export rights separately. [NET copyright](https://netbible.com/copyright/)

ESV remains optional. Crossway's API is offered for noncommercial use with storage and usage restrictions; a commercial application needs suitable written terms. Do not build the foundational search or reading database from that API. [ESV API conditions](https://api.esv.org/), [Crossway permissions](https://www.crossway.org/permissions/)

KJV is not required as a backup. Any alternative TR English candidate needs the same edition, distribution-territory, and asset checks; do not equate online availability with permission. No publisher contact or licensing purchase has been initiated.

### Required source manifest

Record `sourceId`, title, editor/translator, language, textual grouping, edition label, version/commit, download URL, retrieval date, SHA-256, license URL and saved evidence, permitted uses, attribution, territorial scope, included asset layers, and review status. Separate code licenses from content rights. Keep raw downloads immutable; derived data records its source, importer version, and transformations. Unresolved files stay out of production builds.

## 6. Information architecture

Primary navigation: **Read · Explore · Resources · My Notes**. About/help and Sources & Editions remain readily accessible. The home view offers passage selection and resume reading; it does not start with a dashboard of competing tools.

| Surface | Purpose | Proposed route |
|---|---|---|
| Reader | Read chapter with selected verse/range | `/read/ROM/3?translation=BSB&verses=23-26` |
| Text search | Query selected English edition; optional book filter | `/search?q=grace&translation=BSB` |
| Variant detail | Shareable reviewed comparison | `/variants/{variantId}` |
| Word explorer | Lemma within named Greek edition | `/words/{lemmaId}?edition={editionId}` |
| Resource library/detail | Approved Ordinary Means material and source excerpts | `/resources` and `/resources/{slug}` |
| Private notes | Browse/export local passage notes | `/notes` |
| Sources & Editions | Provenance, rights, scope, methodology | `/about/sources` |

Routes are proposals, not vendor APIs. Translation selection is separate from passage identity. Share links preserve passage, edition choice, and optional public panel state; they never contain private note text.

## 7. Reading and study UX

### Default reading

Use a readable single column with clear paragraphing, restrained verse numbers, adjustable type size, a translation selector, and simple previous/next chapter controls. A book/chapter picker and reference input share the navigation bar. Preserve the selected verse and reading position when switching editions.

Variant markers are quiet buttons with descriptive accessible names, such as “Textual note for Acts 8:37.” Do not depend on color, hovering, or a tiny symbol alone. Publisher footnotes and Ordinary Means textual notes remain distinguishable. Users can reduce markers through reading settings.

On desktop, open the selected study tool alongside the passage. On narrow screens, use a full-width sheet or dedicated view with an obvious return action. Do not squeeze three comparison columns into a phone viewport. Restore focus to the invoking marker when the panel closes.

### Variant panel

Present the question, its location, and a short explanation first. Then show three parallel groups: **Critical/Eclectic · Byzantine Majority · Textus Receptus**. Each contains an exact edition label, that edition's Greek reading when available, a clearly labeled English rendering or translation excerpt, and its treatment of the passage.

Display category, scope of effect, interpretive significance, and supporting sources. Put detailed evidence and disagreements behind “More detail.” An Ordinary Means summary is commentary even when printed adjacent to Scripture.

The English and Greek rows are separate evidence. If YLT differs from the selected TR Greek edition, show the difference; do not repair either text. If English wording differs because of translation technique rather than a Greek variant, explain that distinction rather than inventing a variant record.

The panel answers: What differs? Which named editions have each reading? Does it change spelling, wording, a sentence, or a longer passage? What does that mean for reading this passage? Where can I learn more? “Significance not yet assessed” is preferable to an unreviewed claim.

### Difficult passage behavior

An address can exist even where an edition has no main-text verse at that number. Opening it shows the neighboring context and the edition's actual treatment: not in main text, printed in a note, bracketed, relocated, or another documented state. An import failure produces an error, not “this edition omits this verse.”

Long units can cross verse/chapter boundaries or include alternative placement. Reader markers may appear at multiple anchors but open one canonical variant record. Do not renumber Scripture to force visual alignment.

### Greek word exploration

Offer “Explore Greek for this verse” consistently. Show the chosen edition, surface form, lemma, transliteration, concise contextual gloss, grammatical description, and a link to occurrences with surrounding verses. Technical parsing codes can expand into plain language.

Where a verified alignment exists, an English word or phrase can open its Greek token(s). Allow many-to-many links. Do not map by string position, Strong's number alone, or a one-English-word/one-Greek-word assumption. If no alignment exists, offer the verse's Greek text and say that word mapping is unavailable.

Distinguish possible dictionary senses from the meaning in this context. Avoid treating a word's etymology or every possible gloss as the meaning of every occurrence. Frequency counts always name the edition and counting scope.

### Notes and resources

A note attaches to a canonical passage; an optional selected quotation also records translation, release, and text. Changing translations retains the note while identifying the original quotation. Save locally for MVP, show save status and “Stored on this device,” and provide export/import. Explain potential loss when browser storage is cleared at the point of use.

Resource suggestions prioritize directly linked passages, then explicitly labeled related topics. Label the content type, author, and source. Begin with curated links and permitted excerpts; full-text hosting waits for an inventory of existing Ordinary Means material and its rights. Distinguish a quoted confession from Ordinary Means' explanation of it.

## 8. Canonical references and content model

Use internal references such as `ROM.3.23`, with a documented uppercase book-code registry. This is an application convention inspired by common Bible identifiers; do not assert that these spellings are valid OSIS identifiers. Explicitly map OSIS, USFM, provider IDs, and common user aliases at boundaries.

A canonical passage contains one or more ordered ranges of reference anchors. Anchors exist independently of any edition and cover the union of supported verse addresses. Validate against the NT reference registry, not a regular expression alone. Ordering is numeric and uses canonical book order, not lexical string sorting.

Canonical anchors identify locations; they do not assert that verse divisions are original or that every edition has one text row for every anchor. Edition segment mappings handle splits, joins, gaps, parts, and relocations. Tokens belong to an immutable edition release and segment; token offsets are not universal across texts.

### Core entities

| Entity | Essential fields and relationships |
|---|---|
| `Book`, `ReferenceAnchor`, `PassageRange` | Book code/order, chapter, verse, optional subanchor; ordered ranges; alias registry |
| `Edition` | ID, abbreviation, full name, language, tradition grouping, publisher, basis description; optional relationships such as “related translation” |
| `EditionRelease`, `SourceArtifact` | Immutable release, checksum, source/rights manifest, ingestion report, importer version |
| `TextSegment` | Release, source segment ID, source verse label, structured text and paragraph/poetry markers |
| `SegmentAnchor` | Segment-to-canonical mapping, ordered anchors, mapping type, reviewer, placement |
| `EditionCoverage` | Release and anchor; main-text state and note treatment; data availability stored separately |
| `PublisherNote` | Edition release, note type, body, source ID, passage/token anchors |
| `Token`, `TokenAnalysis` | Release/segment/position, surface form; one or more lemma/morphology analyses with provenance |
| `Lemma`, `LexiconEntry` | Lexeme identity, dictionary headword, lexicon source, sense/gloss; Strong's IDs as external mappings |
| `Alignment` | Source/target release IDs, token-span sets, method, confidence/review state; may be many-to-many |
| `VariantUnit`, `Reading`, `ReadingAttestation` | Stable unit, passage anchors, alternative readings, edition-specific evidence and treatment |
| `ExplanationRevision` | Variant, lay explanation, significance, citations, author/reviewer, publication status |
| `Resource`, `ResourcePassage` | Content class, author, rights, canonical URL or hosted body, revision, passage ranges, relation type |
| `PersonalNote` | ID, canonical passage, optional edition quotation/token selection, body, created/updated times, schema version |

Index text and public resources separately. Scripture searches return verse references and edition names; commentary searches return resource titles and labels. Never mix personal note contents into a public search index.

## 9. Textual-variant schema and editorial workflow

The comparison is an edition comparison informed by textual criticism. It is not an exhaustive manuscript apparatus. Add manuscript attestations only when a reliable, permitted source explicitly supports them; never infer manuscript support from the fact that a printed edition has a reading.

| Field | Definition |
|---|---|
| `id`, `revision` | Stable ID such as `afnt-var-000001`; independently versioned content |
| `anchors` | One or more canonical ranges; display anchors may be separate |
| `scope` | `token`, `phrase`, `verse`, or `passage` |
| `categories` | One or more of `orthography`, `punctuation`, `substitution`, `word_order`, `presence_absence`, `harmonization`, `other` |
| `readings[]` | Stable reading ID; Greek text or token-span references; exact source release; editorial English gloss separately labeled |
| `attestations[]` | Reading ID plus edition release; main text, note, brackets, alternative placement, or absent; citation and exact locator |
| `groupPresentations[]` | Three UI grouping keys with selected edition IDs; each can contain internal disagreements |
| `effect` | `surface_only`, `wording`, `clause`, `passage`, `unassessed`; an editorial description, not a numeric importance score |
| `significance` | Reviewed local interpretive effect, uncertainty, and any separate theological discussion |
| `explanation` | Short title, plain summary, optional technical detail, citations |
| `evidence` | Source ID, locator, claim supported, attribution/rights; distinguishes direct observation from interpretation |
| `review` | Draft/in-review/published/withdrawn, author, reviewer, timestamps, revision rationale |

“Harmonization” is an interpretive assessment, not merely a mechanical difference. Store its rationale and reviewer. Use presence/absence rather than implying the direction of textual history through “addition” or “deletion” unless an editor has justified that claim.

### Relational invariants

Every published unit needs anchored readings, checked source locators, named edition releases, and a human-reviewed explanation. An attestation can only reference a reading belonging to its unit. Missing data is not an attestation of absence. Published content must have resolved source rights. A normalized string difference may suggest a candidate but cannot publish it.

Store source text verbatim and use separately normalized copies for matching. A change in accents or punctuation must not accidentally create a substantive variant. An unchanged normalized string does not remove the need to preserve original typography.

### Workflow

1. Ingest and reconcile the selected editions and publisher notes.
2. Generate or manually nominate candidate differences, including multi-verse units.
3. Verify each reading in the exact source release; establish range/placement and group labels.
4. Write a short explanation and distinguish facts, interpretation, and uncertainty.
5. Have a qualified human review Greek accuracy and lay accessibility. Keep correction history.
6. Publish a versioned public content bundle; roll back defective entries without replacing unrelated corpus text.

Candidate review fixtures include Mark 16:9–20, John 7:53–8:11, Acts 8:37, 1 John 5:7–8, and Romans 5:1. These are research locations, not assertions about the chosen editions. Verify actual readings first. If the selected editions agree at a candidate location, do not fabricate a three-way difference; explain edition agreement or choose another fixture.

## 10. Technical architecture options

These are design options, not claims about current vendor prices or a commitment to a particular framework version.

| Option | Shape | Strength | Cost/limitation |
|---|---|---|---|
| A. Static-first web client | Versioned chapter bundles, browser search index, local notes | Small operational footprint; reading has no account/server dependency | Larger browser search payloads; later synchronization needs a service |
| B. Modular application — recommended | Web reader plus server endpoints, static corpus delivery, relational public data and separate private storage | Supports editorial growth and later accounts while keeping one deployable system | Requires deliberate cache/auth boundaries and database operations |
| C. Separate frontend and service platform | Dedicated content, search, identity, and editorial services | Useful for multiple clients or large teams later | Excess coordination and deployment complexity for this MVP |

Recommend B with A's delivery model for public Scripture: prebuilt chapter assets and immutable source releases, a small public search capability, and local personal notes initially. A React/TypeScript frontend and relational database are reasonable implementation candidates; a specific framework and host should be selected during setup against the chosen deployment environment. SQLite can support a local prototype; PostgreSQL is a reasonable later server-store choice. Do not add a search cluster or vector database before a measured requirement.

### Logical flow

```text
Official source files + rights evidence
    -> immutable raw archive
    -> edition-specific import adapters
    -> reference reconciliation + validation reports
    -> versioned public corpus / search / editorial bundles
    -> reader, comparison panel, Greek explorer, resources

Personal notes -> separate local store -> user export
                                    -> optional future authenticated sync
```

Define interfaces around domain operations: `resolveReference`, `getPassage`, `getEditionCoverage`, `searchText`, `getPublisherNotes`, `getVariants`, `getGreekTokens`, and `getResources`. Responses identify the release and distinguish unsupported capability, unavailable data, and a textual absence. User interfaces do not depend on the format of a particular vendor's payload.

Future licensed adapters carry capability and rights policies for local storage, search, cache duration, quotation, and export. A failed optional adapter never prevents BSB reading. Do not silently replace a requested edition with BSB; offer an explicit fallback.

### Import and release pipeline

Keep raw artifacts immutable. Parse structured text where available, preserve paragraphing/poetry/footnote roles, reconcile references, build token and search indexes, validate coverage, produce diff reports, and publish an atomic release manifest. Import only NT books into application data. Source files may contain the full Bible without making OT navigation part of the product.

Do not consume a mutable “latest” download in production. Changes in source wording require a reviewable diff and a new release. Notes keep their original quoted text; token-level annotations require migration or a visible stale-anchor state after a release change.

### Privacy, reliability, and accessibility

Anonymous reading is the default. MVP notes use browser storage with explicit local status, export/import, and tested upgrades. If accounts are added, enforce per-user access on the server, define backup/deletion behavior, and test account isolation. Private responses must bypass public caches. Never log personal note bodies or search contents by default.

Treat imported markup and note content as untrusted for rendering. Sanitize resource HTML, restrict rendered markup, and protect future write endpoints. Preserve Greek Unicode and use fonts tested for polytonic Greek. Design for keyboard navigation, visible focus, screen readers, text scaling, contrast, and touch targets; target WCAG 2.2 AA and verify applicable criteria at release.

## 11. Milestones and definition of done

The [implementation plan](Ad-Fontes-NT-Implementation-Plan.md) provides ticket IDs, dependencies, acceptance criteria, and the first build sequence.

| Milestone | Deliverable | Exit condition |
|---|---|---|
| M0 — Source and design foundation | Corpus manifests, reference decisions, editorial rubric, deployment decision | Sources selected; blocking uncertainties identified per asset; no unverified content silently approved |
| M1 — Reading vertical slice | Full BSB NT, deep links, navigation, English search | All 27 books accessible; source reconciliation passes; no external Bible API required |
| M2 — English and Greek comparison | Other English editions, Greek editions, mapped references | All intended corpora imported with provenance; explicit gap/placement behavior; switching preserves passage |
| M3 — Textual study and Greek | Reviewed variant panels and basic word explorer | Editorial target met or explicitly revised; edition-specific readings and analyses verified |
| M4 — Personal study and resources | Private local notes, export/import, Ordinary Means resource links | Notes persist and round-trip; sources visibly distinguished; passage links validated |
| M5 — Pilot and release | Usability, accessibility, integrity, and operational review | No unresolved critical data errors or note-loss defects; pilot demonstrates core jobs |

Proposed pilot: 6–10 readers, including 2–3 teachers and several users unfamiliar with textual criticism. Ask them to find a passage, switch translations, explain a variant in their own words, explore a Greek word, and save/export a note. Target at least 80% unassisted completion of the core reading tasks. Observe confusion about evidence categories as carefully as speed. These are proposed thresholds, not test results.

Performance budgets for implementation planning: chapter data should be cacheable and small; aim for reading content within 2.5 seconds on an agreed representative mobile connection, and basic search within one second after indexing. Measure cold and warm behavior separately before claiming success.

## 12. Risks, open questions, and decisions needed

| Risk/question | Consequence | Proposed treatment / owner |
|---|---|---|
| Exact Greek editions and release alignment | Misleading comparisons or incorrect word links | Engineer and textual reviewer freeze edition manifests in M0–M2; prefer explicit mismatch over silent harmonization. |
| Ancillary rights are unclear | Inability to redistribute particular annotations | Content steward clears each asset layer; omit unresolved enrichment while retaining verified Scripture. |
| Sparse editorial capacity | Attractive UI with unreliable explanations | Product owner identifies a qualified reviewer; start with a small curated collection. |
| Missing Ordinary Means assets/inventory | Invented brand or inaccurate content links | Use the supplied name/subtitle now; obtain authentic logo, palette, sample writing, resource URLs, and rights before production styling/content publication. |
| Device-local notes mistaken for synchronization | Lost work or user distrust | Persistent local-status label, export/import, storage-error handling; add sync only as a separate milestone. |
| English differences mistaken for Greek variants | False confidence in textual conclusions | Separate translation comparison from variant evidence and show exact edition labels. |
| Variant markers imply exhaustive coverage | Readers assume unmarked verses have no variants | Label curated scope in help and panel empty states; no “no variants exist” wording. |
| Source updates shift word positions | Broken annotations and incorrect highlights | Immutable releases, provenance, migration reports, stale-anchor behavior. |
| Monetization is unknown | Unnecessary infrastructure or uncertain ongoing cost | Pilot first; defer billing; select commercially compatible foundation now. |
| Scope expands toward a research suite | Slow delivery and difficult reading UX | Enforce NT-only and one primary reading workflow; later features need evidence of use. |

Before implementation freezes, resolve: deployment preference; exact source releases; primary Greek candidate; initial variant/resource list; editorial ownership; authentic Ordinary Means visual and writing references. Reasonable defaults in this document allow prototype work to begin without resolving account sync, payment, or premium licensing.

## 13. Initial implementation direction

Begin with source manifests and a canonical-reference module, then ship a working BSB NT reading slice before adding textual panels. Prove translation switching with BLB/MSB/YLT and verify difficult reference mappings early. Add the three named Greek editions, editorially reviewed variants, and basic word exploration. Finish the pilot experience with local notes and passage-linked Ordinary Means resources.

The handoff is the product authority for scope and terminology; the companion backlog translates it into work. Update both when a source choice or milestone changes. Readiness for implementation does not mean the proposed corpus has already been downloaded, licensed asset by asset, imported, or editorially validated.
