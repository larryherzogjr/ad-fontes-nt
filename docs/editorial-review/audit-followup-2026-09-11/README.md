# Resolved audit findings — correction candidate

Larry Herzog Jr. supplied editorial decisions for `AUDIT-062`, `AUDIT-063`, `AUDIT-064`, `AUDIT-065`, and `AUDIT-086` on September 11, 2026. The exact replacements are recorded in `CORRECTIONS.json`.

The deterministic builder verifies immutable article release `om-studies-2026-09-11-v6`, copies all 250 articles into an ignored review candidate, applies exactly four article replacements, and applies one comparison-commentary replacement to candidate-18. The changed comparison unit is returned to `in-review`, and its prior approval hash is explicitly invalidated. It does not modify Scripture, approved public content, or `larryherzogjr.com`.

Run:

```sh
python3 scripts/build_audit_followup_candidate.py
```

Promotion requires Larry’s explicit approval of the exact `CANDIDATE-MANIFEST.json` SHA-256. Promotion must create immutable article release `om-studies-2026-09-11-v7`, replace candidate-18 with the approved payload, append its new review record, select v7 in the shared application, and run the full web/desktop verification suite.
