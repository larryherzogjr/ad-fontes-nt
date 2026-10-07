# NT/OT connections and account retirement — October 7, 2026

Larry directed that the standalone English OT foundation release be forgone and work proceed to NT-to-OT connections. The approved English corpora remain available locally to support connected reading; no separate foundation deployment or signed desktop publication is planned. Earlier release/acceptance records remain historical evidence. Public branding and native identities retain their previously approved scope.

## AFOT-005 — First connections layer

The immutable `bsb-testament-connections-2026-10-07-v1` index contains 698 explicit cross-testament reference objects from the pinned BSB NT and OT publisher notes. It retains note identities, full note bodies, original reference objects and source paths. Its manifest pins all 1,189 chapter inputs, the indexing implementation and output checksum. Ordinary Means commentary is not added by this index.

The shared web/desktop reader lists connections overlapping the selected passage in either Testament. Readers can inspect publisher citations, read both passages together in their selected English edition (BSB fallback from a Greek edition), and follow separate context links. Repeated citations with identical passage pairs share a navigation entry, with every source citation retained.

This is partial publisher-reference coverage, not an exhaustive account of the NT's use of the OT. Plain-text mentions and headings are not indexed. A publisher note's NT anchor can be the closing verse of a longer quotation; the index does not infer quotation extent. It does not classify quotations, allusions or parallels, establish Hebrew/LXX dependence, or establish English word alignment. Seven unresolved references to Jasher, 1 Esdras and 1 Enoch remain separate pinned review evidence; no canonical mapping is invented. Missing/corrupt data reports an error rather than textual absence.

Next: prepare a small reviewed set of quotation/allusion studies with explicit NT quotation extent, OT context, edition/versification evidence and source attribution. Larry Herzog Jr.'s textual-review assignment remains an assignment, not approval. Editorial candidates must remain outside public bundles until exact review hashes are approved.

## Septuagint source investigation

The leading candidate for a separate source audit is Swete's historical text via [Open Greek and Latin's First1KGreek](https://github.com/OpenGreekAndLatin/First1KGreek), using the [nathans/lxx-swete](https://github.com/nathans/lxx-swete) extraction as a possible adapter reference. The extraction README distinguishes CC BY-SA 4.0 text/annotations from MIT build code. It names the upstream commit used; no moving HEAD or badge alone should serve as corpus provenance. This is a recommendation for investigation, not corpus/license approval or an import.

[STEPBible Data](https://github.com/STEPBible/STEPBible-Data) includes TVTMS versification evidence and uses CC BY 4.0, making it a possible independently audited mapping resource. Do not assume its README's future LXX material is an available full Greek corpus. [Open Scriptures GreekResources](https://github.com/openscriptures/GreekResources) explicitly excludes CCAT LXX text because of its restrictive terms; its support-file license must not be applied to the absent corpus. [Penn's CCAT distribution page](https://ccat.sas.upenn.edu/~jtreat/rs/rscpuhx.html) also describes special distribution arrangements. The new [Open Scriptorium morphology project](https://openscriptorium.org/posts/free-lxx-morphology) is an optional experimental analysis candidate requiring independent specialist review, not a replacement for a pinned Scripture authority.

Before import: save primary rights evidence and exact artifacts/checksums; inventory source books and variants; distinguish source numbering from canonical identity; audit Psalms, Daniel/Esther expansions and deuterocanonical scope. Do not reuse English numbering blindly or infer mappings from numeric offsets. Greek text, morphology and future commentary require separate provenance and acceptance.

## AFNT-027 — Personal notes and Google OAuth retirement

Larry explicitly requested complete removal of personal notes and Google OAuth from the web and app because they are unused. The shared UI, personal-note domain/client, account/note routes, server session/database/security modules, Google OAuth dependencies and migration/configuration runners are removed. Publisher footnotes remain. Device-local preferences, recent passages and Library bookmarks remain.

The application health endpoint is independent of a database. The web container no longer receives database, registration or Google configuration, starts without migrations, and has no database dependency. The compose database is retained only under the `legacy-data` profile for deliberate backup/recovery. Runtime retirement preserves the existing database volume, private configuration and backups. Update scripts rebuild/start the web service without stopping or deleting legacy services/data. Prepared Nginx configuration returns 410 for retired API paths; existing host configuration is not changed by routine updates, but removed application routes return 404. Historical migration SQL and M4 records are retained as evidence.

No real account database was opened, modified, truncated or deleted. No Google Console client was deleted or revoked, private `.env` rewritten, host service changed, push/deployment performed, or signed installer/updater published. After deployment, old installed desktop applications remain their published versions until a separately prepared update. Explicit deletion of retained data, removal of legacy containers/volumes, secret cleanup and Google Console client retirement remain separate operational steps; no new application code consumes those credentials.

## Verification and local review

`npm run verify:both` passed with 83 Node tests, 29 Python tests and six desktop tests. Source-object fidelity checks cover every connection and input hash; corrupt/truncated releases report unavailability. Final typecheck and both builds were refreshed after the anchor explanation, with six desktop tests repeated. Shell syntax and Compose validation without account credentials passed. Local retired routes return 404 and health returns `{"ok":true}`.

Web review covered reciprocal Matthew/Isaiah links, BSB/YLT connected text, Hebrews/Jeremiah ranges, empty partial-coverage messaging, keyboard operation and 320px/390px layouts. Packaged desktop review confirmed the same BSB passages, keyboard operation, 390px layout and a clean console. This verifies the shared desktop web bundle, not a new signed native installer or physical Windows acceptance. The web preview remains available at http://localhost:3016/read/MAT/1?translation=BSB&passage=MAT.1.23 . The desktop preview was stopped after review. Screenshot: `artifacts/review/nt-ot-connections-2026-10-07.png`.

## Verse-level panel follow-on

Larry requested the familiar study-panel interaction. Selecting a verse now exposes **NT/OT Connections** beside Copy, Compare and Greek. The same action is in the reader toolbar and study-tool tabs. Shareable `panel=connections` links open the desktop side panel or phone full-screen modal. The first connection opens automatically; the related Testament is shown first, followed by the original passage and retained citation choices. Context links preserve the English edition and panel state in either direction. The top overview remains optional.

Shared verification passed again (83 Node / 29 Python / six desktop tests, typecheck and both builds). Browser checks cover keyboard selection, context navigation in both directions, YLT, Greek tool switching, closing/return, desktop layout and 390px/320px modals. Packaged desktop checks confirm reverse-direction reading and phone layout. Scripture/index provenance and partial coverage are unchanged. No deployment or signed native publication occurred.

## Subsequent Septuagint audit

The all-phase implementation sprint encountered an unresolved upstream rights conflict in the proposed Rahlfs morphology source before import. See [the October 7 audit](LXX-Source-Audit-2026-10-07.md). The earlier morphology candidate recommendation is suspended; no LXX feature is ready to test.

## Septuagint follow-on implemented locally

Larry subsequently authorized proceeding with all three Greek OT phases on his source-rights decision. The earlier audit stop is superseded. [Implementation and limitations](LXX-Implementation-2026-10-07.md) records pinned sources, successive engineering releases, preserved notices, Greek comparison/interlinear and existing OM lemma links. Existing passage commentary and quotation/allusion classifications remain unchanged. Local review precedes any deployment or signed package.
