# Ad Fontes NT

Read `docs/Ad-Fontes-NT-Handoff.md`, `docs/Ad-Fontes-NT-Implementation-Plan.md`, and `PROJECT-STATUS.md` before changing scope. Current delivery is accepted M4 (hosted account-backed notes and initial resource links), not the finished MVP. Read `docs/M4-Acceptance.md` for the user sign-off and deferred items. M5 pilot/release work is next. Read `docs/M3-Acceptance.md` for the approval scope and continuing limitations. Read `docs/M2-Source-Decisions.md` before changing corpus mappings. App code is in `app/`; the root documents are authoritative.

- Preserve the exact name/subtitle. Do not invent Ordinary Means resources, logos, theological explanations, or reviewers.
- NT only. Keep canonical references independent of edition coverage. Unavailable data never means textual absence.
- `sources/bsb/raw/` and saved evidence are pinned originals. Do not edit them or fetch “latest” during builds. New sources/importer behavior need a reviewed new release, explicit differences, and checksums.
- `scripts/import_bsb.py` is the BSB adapter. The official TXT is Scripture authority; USJ supplies structure and publisher notes. Preserve both, including reviewed alignment differences.
- Run `npm test`, `npm run typecheck`, and `npm run build` for corpus/domain/reader changes. Browser-test meaningful reading changes, including deep links, keyboard navigation and phone widths. Do not claim tests you did not run.
- Keep Scripture, publisher notes, Ordinary Means commentary, confessions, personal notes and future AI material distinct. Do not publish unreviewed commentary or unresolved corpus assets.
- Use the installed Sites skills for this scaffold. The user explicitly authorized isolated Ubuntu/Docker hosting preparation, Google sign-in and account-backed notes with a once-only shared registration password. See `docs/M4-Accounts-and-Hosting.md`. Do not modify the hosted server or deploy until the prepared configuration is reviewed and required access/secrets are available; do not use existing apps’ accounts, secrets, volumes or databases. Paid services and messages to publishers remain outside scope.
- Update `PROJECT-STATUS.md` with backlog IDs, decisions, limitations and next steps. Never mark all of M0 or the MVP complete merely because M1 works.

- M2 adapters live in `scripts/m2/`; `scripts/import_m2.py` verifies immutable release outputs. Keep raw artifacts, evidence, reviewed differences and output checksums. Never run `--freeze` to make an unexplained test failure disappear.
- Keep `registry.json` as the frozen M1 reproduction base and `canonical-registry.json` as the current union. Source numbering is not canonical identity. A mapping correction needs a new release; preserve predecessor bytes.
- Read `docs/M3-Source-Decisions.md` before changing analysis. Nestle morphology/glosses and Strong’s historical dictionary are separate from immutable Scripture. Preserve source-specific tags, unknown values and exact matching limits. No English word alignment is established.
- Larry Herzog Jr. is assigned as textual reviewer; assignment is not approval. Draft candidates stay outside public bundles. Use `content/editorial/REVIEW.md`; changed content invalidates the recorded approval hash.
- Preserve the explicit BLB draft, Nestle fallback and Boyd compilation labels.

- Private-note APIs must derive ownership from admitted server sessions, verify Origin/CSRF on mutations, and reject stale versions. Never add an application test-login bypass. Use the isolated `afnt_m4_test` database for integration tests; never run its truncating setup against a real user database. Keep secrets and exports out of public assets and URLs.

- GitHub is private at `larryherzogjr/ad-fontes-nt`, branch `main`. Use the documented Mac-push/host-pull workflow. Live hosting was explicitly approved and installed; routine app updates use `deployment/update-host.sh` after a fast-forward pull. Keep credentials, private keys, database dumps, generated public bundles and the supplied review-book PDF out of Git. Never force-reset a host checkout with unexplained edits. The host deploy key is read-only and repository-specific.
- Interactive terminal handoff does not work reliably for Larry. Whenever host `sudo`, a password, or other interactive input is required, stop and send Larry the complete copy-paste command to run in his own terminal; then continue from the output he reports or from independent read-only verification.
