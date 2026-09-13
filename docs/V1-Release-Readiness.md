# Ad Fontes NT v1.0 public-release readiness

Owner decisions recorded September 10, 2026. This is the controlling M5 readiness ledger for the public v1.0 release. It does not itself approve publication.

## Acceptance resolution — 2026-09-12

Larry Herzog Jr. subsequently stated, **“Those tasks in M5 HAVE all been completed to my satisfaction.”** AFNT-026–029 and the defined MVP are therefore accepted. The checklist below is retained as the pre-acceptance gate ledger; unchecked boxes no longer indicate an unaccepted milestone, and the underlying records remain authoritative about which evidence was agent-observed, user-reported, partial, or completed through a later release candidate. See [M5 and MVP acceptance](M5-Acceptance.md).

This acceptance did not itself approve new release bytes. RC13 was subsequently approved, published and independently verified as an immutable release candidate. Larry later approved the exact 1.0.0 source, signed artifacts, updater manifest and artifact-pin commit and explicitly authorized coordinated publication. Final 1.0.0 was published and independently verified on September 13, 2026; RC13 is its immutable rollback release. The 48-hour soft-launch observation remains underway and distinct from publication.

## Final publication resolution — 2026-09-13

Ad Fontes NT 1.0.0 is the current published web and desktop release. Exact artifact, signing, publication and live-verification evidence is recorded in [the final release record](V1-Final-Release-2026-09-13.md). The 48-hour observation began at approximately `2026-09-13T13:32Z`; completion before `2026-09-15T13:32Z` and any broader announcement are not claimed.

## Frozen release scope

- Web v1.0 may launch before signed desktop v1.0 packages. Anonymous reading remains public; private-note registration remains invitation-only through the once-only shared registration password.
- Web scope is the currently accepted reader, seven named editions, reviewed comparison and Greek tools, initial resources, the 250 approved app-only BSB article adaptations, Google identity and account-backed private notes.
- Desktop scope is the shared offline reader for macOS Apple Silicon and Windows x64. Accounts, notes, automatic silent installation, Intel Mac, Windows ARM and Linux remain outside v1.0.
- Supported systems are macOS Sonoma 14 or newer on Apple Silicon and Windows 11 x64. The product is free of charge. Application code remains private and the distributed application is free-to-use, all-rights-reserved software; included sources retain their own rights notices.

## Owner decisions

- Operator: **Larry Herzog Jr., publishing as Ordinary Means**, North Dakota, United States. Public contact: `larry@larryherzogjr.com`.
- Public legal/support pages will cover privacy, terms, support, account deletion, 30-day backup aging, essential cookies, no behavioral analytics/advertising/desktop telemetry, and a 13-or-parental-permission account boundary. Owner must approve exact text before publication.
- Account deletion removes the live account and all notes immediately; encrypted backup copies age out within 30 days. Email support is the fallback.
- Privacy-minimal monitoring covers uptime, health, backup failures and deployment failures. Successful routine jobs stay silent; failures notify the public contact.
- Off-host private-data backups use a dedicated encrypted Borg repository on Ubuntu Server `sitepull@10.20.30.70`, isolated from the existing zrxoa.org repository, with a strict maximum retention of 30 rolling days, integrity checks and a restore rehearsal. Any 12-weekly/12-monthly history is kept separately and may contain only public immutable releases and non-secret configuration, never database dumps, accounts, notes, sessions, OAuth identifiers or identifying logs.
- Existing several-hour testing by a mixed group including teachers, unfamiliar readers and Windows users is accepted by the owner as sufficient pilot participation. The owner declined another structured participant pass and expressed confidence in current status and functionality. This is user-reported acceptance, not newly observed test evidence.
- Desktop apps check quietly for stable updates at most once per 24 hours, notify when available, require approval before download/install, and include a manual check. Offline reading never depends on the update service.
- Update metadata and immutable artifacts may be served by `ad-fontes.app`. The Tauri updater key is separate from OS code signing and requires a secure independent backup.
- macOS Developer ID signing and Apple notarization are configured on the trusted build Mac; the first signed/notarized app, DMG and updater archive passed static validation. Microsoft Azure Artifact Signing Basic remains an available Windows-signing path, subject to identity validation and the owner's explicit approval immediately before starting its paid subscription. Windows remains an unsigned beta unless that or another signing path is approved and verified.
- Public desktop downloads will have a visible download page with supported systems, checksums, release notes and limitations. Existing beta links remain available but unlisted.
- Use a 48-hour soft launch before broader announcement.

## Pre-acceptance release-gate ledger

- [ ] AFNT-026: keyboard, screen-reader, touch, contrast, 200% zoom, supported desktop widths, phone layout, and polytonic Greek checks completed; blocking issues resolved.
- [ ] Performance measured cold and warm against documented representative conditions.
- [ ] Dependency, application, account and distribution security review completed with no unresolved release blocker.
- [ ] Self-service account deletion passes ownership, CSRF, cascade, stale-session and UI confirmation checks.
- [x] Privacy, Terms and Support text approved by the owner on September 10, 2026; effective dates set and draft notices removed.
- [ ] Dedicated encrypted Borg repository configured; scheduled pull, pruning, integrity check, failure notification and restore rehearsal verified without exposing credentials.
- [ ] Immutable web release manifest, complete source differences, clean reproduction, sanitized-markup/error/cache checks and unexpected-network-call checks recorded.
- [ ] Web deployment rollback rehearsed against the isolated service and database.
- [ ] Tauri updater trust key generated, backed up, and configured; stable metadata and immutable artifact publishing verified for both supported targets.
- [ ] macOS Developer ID signing, notarization, Gatekeeper installation and updater path verified on a supported Mac.
- [ ] Windows signing option approved and configured; signed clean install, upgrade, uninstall and updater path verified on Windows 11 x64.
- [ ] Exact `1.0.0-rc.1` artifacts and hashes approved. No release bytes change between approval and promotion.
- [x] Owner approves public web v1.0 promotion and, separately, each signed desktop v1.0 package.
- [ ] Production verification and 48-hour soft-launch monitoring complete before broader announcement.

## Explicit non-blockers and deferrals

No new Scripture, commentary, alignment, payment, desktop note, Linux, Intel Mac, Windows ARM or automatic-update feature beyond the agreed user-controlled stable channel is required for v1.0. A delayed Windows signing acquisition does not block web v1.0 or signed/notarized Mac v1.0.
