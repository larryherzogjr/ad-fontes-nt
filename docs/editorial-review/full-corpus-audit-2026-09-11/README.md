# Ad Fontes NT full-corpus AI audit packet

This control directory builds a sanitized, report-only editorial review packet for a non-Codex AI. The packet audits the public Ad Fontes NT commentary content without exposing the private repository, Git history, credentials, databases, personal notes, deployment configuration, or the supplied review-book PDF.

The generated ZIP contains:

- all 250 immutable `om-studies-2026-09-10-v5` Ordinary Means BSB-adapted Greek-word articles;
- all 30 published Ordinary Means comparison commentaries, split into one JSON file per unit;
- the active 250-record Greek-word metadata snapshot;
- the immutable v5 release manifest and the already-approved word-count correction evidence;
- the M2/M3 source-decision and editorial-limitation records needed to avoid false findings;
- an input coverage inventory, output coverage template, finding schema, packet manifest, and SHA-256 list; and
- `AUDIT-PROMPT.md`, ready to paste into the reviewing system after uploading the ZIP.

The packet deliberately excludes full Scripture corpora and raw analysis archives. The included commentaries contain their exact published readings and citations; claims that cannot be resolved from the supplied evidence must be placed in the human-review queue rather than guessed.

Generate the packet from the repository root:

```sh
node scripts/create_editorial_audit_packet.mjs
```

Expected outputs:

```text
docs/editorial-review/Ad-Fontes-NT-Full-Corpus-Audit-2026-09-11.zip
docs/editorial-review/Ad-Fontes-NT-Full-Corpus-Audit-2026-09-11.zip.sha256
```

Upload the ZIP to the external AI, then paste the complete contents of `AUDIT-PROMPT.md`. The external reviewer must return reports only. Any accepted correction requires a new immutable candidate, deterministic validation, a new manifest hash, and Larry Herzog Jr.'s explicit approval.
