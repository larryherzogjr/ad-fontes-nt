# Ad Fontes NT second-pass editorial audit packet

This directory controls a sanitized, report-only packet for an independent non-Codex review of the commentary currently shipped by Ad Fontes NT.

The generated archive contains:

- all 250 immutable `om-studies-2026-09-11-v7` Greek Word Explorer articles;
- all 30 currently published Ordinary Means comparison commentaries, one JSON file per unit;
- the active 250-record word metadata snapshot;
- the v7 release manifest and its retained approval/correction/validation evidence;
- narrowly relevant source and editorial guidance;
- exact input and output coverage ledgers, a finding schema, and complete SHA-256 manifests; and
- a second-pass prompt aimed at editorial defects that can survive ordinary quotation/count checking.

It excludes Git history and configuration, credentials, keys, deployment configuration, databases and dumps, private notes, the supplied review-book PDF, full Scripture and Greek-analysis archives, native binaries, build products, and the `larryherzogjr.com` source tree.

Generate it from the repository root:

```sh
node scripts/create_second_pass_editorial_audit_packet.mjs
```

Expected outputs:

```text
docs/editorial-review/Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12.zip
docs/editorial-review/Ad-Fontes-NT-Second-Pass-Editorial-Audit-2026-09-12.zip.sha256
```

Upload the ZIP and paste the complete `AUDIT-PROMPT.md` into the external reviewer. The return is evidence only. No proposed change is approved until it is reconciled, built as an immutable candidate, verified, and explicitly approved by Larry Herzog Jr.
