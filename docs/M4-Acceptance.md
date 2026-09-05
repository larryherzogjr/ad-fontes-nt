# M4 acceptance — 2026-09-05

**M4 — account-backed personal notes and initial Ordinary Means resource links is accepted for the hosted application.** M5 — pilot and release — is next. This does not mark the finished MVP or complete broader release verification.

## Product-owner decision

Larry Herzog Jr. stated: “Remaining items 1-3 tested and confirmed working. Item 4 = I confirm, accept, and sign off on M4.” Date-only precision is retained.

His confirmation covers the three items presented immediately before this decision:

1. Browser export/download inspection and file-picker import, including restored notes and quotation metadata.
2. Cross-browser/device access and saved-note persistence through container restart or recreation.
3. Live deployment of the checkbox-size and milestone-wording corrections.

These are **user-reported verification results**, not additional agent-observed tests. No specific devices, browsers, restart commands or new test artifacts were supplied. Earlier live Google sign-in, once-only admission and personal-note use were also confirmed by Larry.

## Accepted scope

- **AFNT-022:** create/edit/delete private notes, canonical passage attachment, stable IDs/timestamps, explicit save/error feedback, edition/release quotations, JSON import/export and readable export. Notes follow canonical passages across editions.
- **AFNT-023:** account ownership, session/CSRF protections, optimistic update conflicts, invalid/duplicate import handling, safe text rendering and quota handling, under the authorized account-backed replacement for browser-only storage. Automated API tests plus the above user confirmation complete the presented acceptance checks.
- **AFNT-024/025:** initial curated 12-link collection: eight free studies, three Ad Fontes lessons and one essay, matched by documented book/passage coverage. Collapsed, unobtrusive links open in new tabs; no resource prose, Scripture quotations or PDFs are incorporated. See M4-Resource-Links.md.
- **AFNT-101, advanced scope:** Google identity with a shared password for initial admission only, independent account storage, isolated Ubuntu/Docker/PostgreSQL hosting, HTTPS, and the private GitHub Mac-push/host-pull workflow.

Recorded engineering evidence includes 38 Node groups, 11 Python fidelity tests, TypeScript checking and production builds; four database integration groups; local backup/restore rehearsal; live HTTPS/account checks; resource destination checks; and targeted browser/phone/keyboard verification. Those counts describe recorded runs, not new runs performed by this acceptance decision. All M3 editorial/source limitations remain unchanged.

## Continuing limits and next work

- Off-host backups are explicitly deferred by Larry. This acceptance does not establish scheduled off-host backup protection.
- Notes require connectivity and explicit saving. Unsaved drafts remain in the page; no offline editing is promised.
- Resource coverage is the initial curated set. Greek Word Explorer and broader question/essay mappings remain optional future curation, not incomplete acceptance conditions for this set.
- M5 retains broader accessibility, device/performance testing, release/rollback verification and the proposed 6–10-person pilot (AFNT-026–029). M4 sign-off does not certify those checks.

This record supersedes earlier “pending” M4 status in chronological implementation notes. It does not alter immutable corpus artifacts, editorial approval hashes or source-rights evidence.
