# Private evaluation edition — October 16, 2026

AF-EVAL-001 (access and delivery), AF-EVAL-002 (supplied resources), AF-EVAL-003 (desktop edition). Larry authorizes implementing the complete supplied bundle for the private internal evaluation group after public 4.3.4. Branch: `codex/private-evaluation`, based on `28488ce`. Public `main`, installed hosting, public signed artifacts and updater pins remain unchanged by this local implementation.

## Owner decisions

- Evaluation origin: `https://eval.ad-fontes.app`; Larry reports DNS already added. Bootstrap administrator: `larry.herzog@gmail.com`.
- Google identifies testers. Larry manually confirms that each tester's active Logos subscription includes all supplied resources, then explicitly grants access. There is no automated subscription check, Logos account integration, registration password, personal notes, or use of the legacy account/note database.
- Gated distribution suffices. Revocation blocks future website resource requests, downloads, pairing and updates. Delivered offline resources and already received browser data cannot be recalled. No DRM or ongoing desktop reading entitlement is claimed.
- The archive's instructions are informational. No bundled extraction, network or browser scripts were executed. No fresh Logos extraction occurred.
- This narrowly supersedes October 7 OAuth retirement for the evaluation service only. Existing public account/note routes stay absent, and public Compose remains independent of credentials/databases. Existing legacy volumes/configuration/backups are preserved.

## Supplied content and fidelity

Original ignored archive: `adfontes-confessional-package.zip`, SHA-256 `bfb5f040eedec49a0ca406ccc5cf327a09fa1c0d7c3c7338f5fd2d38031d8616`. Its bytes remain unchanged. Actual per-volume indexes, rather than the incomplete package root summary, establish this supplied inventory:

| Collection | Volumes/editions | Supplied sections |
|---|---:|---:|
| Book of Concord, Tappert 1959 | 1 | 12 |
| Book of Concord, Kolb/Wengert 2000 | 1 | 15 |
| Luther’s Works, American Edition | 55 | 1,042 |
| Concordia Commentary | 28 | 1,647 |
| Total | 85 | 2,716 |

`scripts/evaluation/import_resources.py` checks every section's character count, title and part against its supplied index and preserves the original text string and metadata in a new projection. It rejects duplicate/unsafe archive paths and unexpected inventory. The source archive, per-input SHA-256 and output checksums are pinned in `content/evaluation/evaluation-resources-2026-10-16-v1/manifest.json`. Normal evaluation imports reject differences. The final importer, index builder, shared tokenizer and pinned fflate implementation hashes are recorded in `implementation.json`, with source-code evidence preserved beside the manifests. Initial `--prepare` establishes a new release; it is not a failure-repair switch.

Generated text/catalog/search remain under ignored `private/evaluation/`, never `app/public`. The archive and all `private/` material are excluded from Docker contexts. Images contain only public resources and server code; dedicated evaluation containers mount restricted content read-only. Restricted reading text is also excluded from Git. Tracked manifests contain source/output hashes and locators, not the source bodies.

Source transcription is supplied AI extraction, not an independently proofread publisher transcription. Source-reported coverage ratios above 100% are not proof of complete/duplicate-free extraction. Four Concordia volumes report residue flags (Ezekiel 21–48, Joshua, Philemon, Ruth); Jonah reports two boundary anomalies in abbreviation sections. These source warnings are retained and shown on affected volume pages. Raw extraction/acquisition logs, publisher-original visual comparisons, images, reliable page mapping, reconstructed footnote links and article/paragraph alignment are not supplied/established. No missing source structure is invented.

## Reading and search

Evaluation builds add **Confessional Resources** for both BoCs and Luther’s Works; **Commentaries** adds Concordia alongside the preserved historical collections. Readers browse volumes and supplied sections, use stable deep links, previous/next sections, device bookmarks/recent readings and full-text search. Identically named BoC source documents have a link to the other edition; it starts at the document beginning and does not imply paragraph alignment. The former public Confessional Connections and historical Book of Concord projections remain retired.

The reader commentary selector adds Concordia. Suggested links come only from explicit full references at the start of supplied section headings. Generic Translation/Textual Notes/Commentary subdivisions can inherit their explicit part heading; a named essay cannot inherit a broad enclosing range. Canonical range parsing validates those headings; missing or incidental references remain unlinked. This is source-heading navigation, not an independently reviewed verse-level exposition mapping or exhaustive commentary coverage. Only the 28 supplied Concordia volumes are represented.

The existing Search resource text page offers separate Public/Evaluation scopes. Evaluation searches its own frozen, compressed, sharded index; public search inputs, implementation and all predecessor/current derivative pins remain untouched. Exact phrase/word matching shares the established tokenizer. Results retain source labels, open at highlighted matching paragraphs and preserve return URLs. No theological associations, English word alignment or rewritten source prose are added.

## Google reuse and access boundary

The earlier `app/server/accounts.ts` and `security.ts` at predecessor `6860713^` provide the reviewed approach: official Google library, authorization-code flow, PKCE, browser-bound single-use state, nonce/audience checks and session rotation. The isolated evaluation implementation reuses that approach with `google-auth-library` pinned at 11.0.2; it does not restore notes, old tables, shared registration passwords or account linking by email. Google subject remains account identity. Google access/refresh tokens are not persisted.

The prior Ad Fontes Google client ID and secret are present locally. `scripts/evaluation/configure.py --reuse-google` copies only those two keys into a new ignored mode-0600 `deployment/evaluation/.env`, refusing overwrite. The legacy file is unchanged. This dedicated local configuration has been prepared; no credential values are printed or placed in a browser bundle. The Google client still needs the exact authorized callback `https://eval.ad-fontes.app/api/evaluation/callback`; continued client validity and real consent/callback remain live checks. Optional local callback is `http://localhost:3046/api/evaluation/callback`.

Evaluation access uses a new dedicated SQLite database/volume, private file permissions, opaque hashed session/device tokens, secure host-only HttpOnly SameSite cookies under HTTPS, exact-Origin/CSRF checks for mutations, bounded JSON bodies, global login/pairing throttles and an audit of grants/revocations/pairing. The administrator must record the manual eligibility confirmation on every grant, including their own. Admin authority does not grant reading access automatically. Returning sign-ins remain bound to Google subject; an email match never inherits an existing user's grant.

Every restricted catalog, text, search file, installer and update request checks current admission. Files live outside static/public routing; names are allowlisted against pinned manifests/publication records. Protected responses are `private, no-store`, with no Nginx alias/CDN cache. Failed content reads report unavailability. Public builds disable the entire evaluation API regardless of browser flags. Expired/revoked sessions or device tokens cannot download new protected bytes. Online SQLite backup helper uses `VACUUM INTO` a new private backup path; no legacy database is opened.

## Desktop edition and release mechanics

Evaluation frontend staging and output use `app/desktop/evaluation-public` and `evaluation-dist`; ordinary builds retain `public`/`dist` and exclude every evaluation asset. Restricted offline files are enumerated in the desktop content inventory. Native override identity is `app.ad-fontes.evaluation` / Ad Fontes Evaluation, with separate default installation/data locations, Windows registry identity and macOS display metadata. Public package/signing/updater identity is preserved. Actual native co-install/upgrade behavior still requires installer verification before publication.

The evaluation UI/native version starts independently at 4.3.4; update both `app/evaluation/version.json` and the evaluation native override for a later evaluation release. The public version remains untouched. The evaluation updater points only to `https://eval.ad-fontes.app/api/evaluation/updates/latest.json`; it retains the existing trusted signing public key and signature verification. Evaluation manifests also carry an edition/installation-identifier marker, and the updater rejects the wrong edition before downloading. Browser cookies do not silently authorize native updates. An admitted tester generates a five-minute single-use code in the portal; the app exchanges it through a fixed HTTPS native command for a 30-day revocable update credential, saved in its private app-data directory (Unix mode 0600), not localStorage or URLs. It is a scoped evaluation bearer credential, not a Google token. Pairing refuses redirects. Resource reading remains offline regardless of update credentials. Native commands reject the public app identifier.

`scripts/evaluation/prepare_publication.mts` stages versioned private installer/updater files and metadata only after an explicit exact-artifact verification record. That record requires the evaluation identifier/version, notarization, Authenticode, updater signatures, co-install isolation and exact SHA-256 hashes. The record also identifies the frozen native source commit, resource release and exact signature-file hashes. The preparer consumes the record; it is not itself a substitute for those native checks. Published predecessor file records remain available, version destinations refuse overwrite, and the existing public publisher scripts/URLs are unchanged. The private download service verifies file checksums before streaming them.

## Commands

Run from the repository root. Existing normal commands remain public.

```sh
npm run evaluation:import
npm run evaluation:dev
npm run evaluation:build
npm run evaluation:desktop:web
npm run evaluation:desktop:preview
npm run evaluation:desktop:build -- --bundles app,dmg
npm run test:evaluation
```

The default local web preview uses localhost:3046 and a new private evaluation database, loading only the new evaluation env file. Do not use a live legacy database as a fixture. On Windows use the existing trusted signing environment and evaluation native configuration; test fresh installs, co-installation with the public app, upgrade/repeated upgrade and uninstall before publication. Current public Windows CI remains main-only and does not receive restricted source or evaluation assets; no private resources were uploaded to CI or another service.

## Prepared hosting and remaining release work

`deployment/evaluation/compose.yml`, Dockerfile and Nginx template describe a **new** service on loopback port 8136, independent access volume, read-only restricted content/download mounts, eval.ad-fontes.app TLS, disabled access logging, noindex headers and no static aliases for protected bytes. Public Compose/Nginx/service are unchanged. Do not replace the public stack or reuse its PostgreSQL volume. Back up evaluation access separately; protected content and downloads are separately checksum-reproducible. `deployment/evaluation/install-host.sh` prepares only the dedicated service/site after checking the separate checkout, branch, content hashes, port and existing config. It refuses unexpected edits or the public checkout. Its shell syntax and Compose configuration were validated, but it was not executed on a host. Host installation must be reviewed before execution; any sudo/password step is Larry's own-terminal handoff under AGENTS.md.

Pending live work: Google callback configuration and consent test, host port/TLS/service installation, securely transferring pinned restricted projections outside Git, frozen signed Mac/Windows evaluation artifacts, co-install/upgrade checks, exact-artifact publication record and private installer/updater publication, then real admitted/revoked-user and native-update verification. Implementation source is committed and pushed to the private `codex/private-evaluation` branch at `bea2622`; restricted texts and private configuration are excluded. No deployment, signed evaluation artifact, real subscription verification or live Google sign-in is claimed by this implementation.

Verification results and local review evidence are recorded in PROJECT-STATUS.md. Existing current-release/MVP acceptance remains closed; these future private-evaluation checks do not reopen it.

## Local verification completed

- Normal `npm test`: 189 application checks and 51 Python/source checks. Normal `npm run build` completed imports, tests and compilation. Final typecheck and public/evaluation web builds also pass; the latter compilation passes use the already verified unchanged public inputs.
- Public offline frontend builds and all 20 existing desktop checks pass. Evaluation offline staging contains 75,937 files versus 73,035 ordinary files; both evaluation packaging tests verify every restricted payload hash, the entire search pin, absence of raw/private runtime files and separate installer configuration.
- Four evaluation test groups pass on local Node 26 and official Node 22/24. Coverage includes public-edition denial, no automatic admin reading grant, CSRF/origin and admin enforcement, required manual eligibility confirmation, browser-bound OAuth state, nonce/audience checking, session rotation/replay denial, single-use pairing, revocation, logout, authorized GET/HEAD downloads and checksum-tamper rejection. Google token verification is mocked explicitly in tests; no live Google result is inferred.
- Public/evaluation native `cargo check --offline --locked` succeeds with the existing locked dependency graph (only direct references to already pinned reqwest/rustls are added). This is compilation, not signed packaging or actual native update verification.
- The private search builder reproduces the exact manifest under official Node 24. Source import and independent verification check all 2,901 pinned private files plus the search manifest. Compose `config --quiet`, Python compilation and installer shell syntax pass. A disposable SQLite backup reopens with both QA identities and mode 0600; no real identity/notes database is used.
- Browser checks with disposable, clearly labeled QA accounts cover anonymous resource denial, checkbox-gated grants, both edition choices, full Tappert/Concordia/Luther reading, Greek retention, phrase results/context/deep-link reload/search return, bookmarks, keyboard opening/Escape, source-heading Scripture links and 320px/390px without document overflow. The compiled production browser returns 462 sections for the sampled evaluation-wide phrase query and paginates 20 at a time. No errors/warnings were captured in that final production tab.
- Compiled production HTTP checks return 200 + private/no-store for admitted catalog/search/download requests, 403 for anonymous catalog/search/download/update requests and 503 for a tampered download. The fixture server/database/cookies never become an application login bypass.

Evidence: `artifacts/review/evaluation-2026-10-16/` (ignored). Source manifest SHA-256 `d2f1651c103398655c3ad0668c575255d7aa2d9fa1af8b5b691b04105280e8f5`; search manifest `266fc6ca1bdd48173a30383d7d3835f80088ce24ae2e9f780af527ad51da7a96`; implementation record `022ee2abca1685230a5543440fe7d98a2fb1a4011d724cf2aa74c2615d8b8692`. Source warning disclosures remain in force; no unobserved fidelity, native or live checks are claimed.

Final frozen-source evaluation web/offline builds and both packaging checks pass after all code corrections. Packaged offline review confirms the full Kolb/Wengert Augsburg Confession (185 supplied paragraphs), its corresponding Tappert document link and nine matching sections for the sampled phrase search, using only bundled assets. Review preview: `http://127.0.0.1:1434/library?view=confessional`.
