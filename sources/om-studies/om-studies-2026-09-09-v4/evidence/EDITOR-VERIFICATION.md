# Verification report: candidate v30 (post-fix)

Scope: re-ran the full verification battery on `om-bsb-2026-09-09-candidate-v30`
(250 raw articles + README + updated adaptation doc, copied into this workspace).
Every finding from the v17 review and fix checklist was checked against the actual
bytes. Candidate manifest per README: `dad1b34f996eb44bc30e9641083f39b8945992f768a2b96b511f0a695647eb2d`.

## Verdict: every v17 finding is verifiably closed

### P0 items — all four landed

- **hypomone.md:140** — now reads `…direct: “Consider Him who endured such hostility
  from sinners, so that you will not grow weary and lose heart.”` The mid-verse
  "of God." fragment is gone. ✅
- **mathetes.md:89** — now `Acts 11:26 — “The disciples were first called Christians
  at Antioch.”` ✅
- **agape.md:116** — now `…also said “Now go and sin no more” (John 8:11, BSB).`
  The narrative-frame mismatch is resolved exactly as suggested. ✅
- **eulogeo.md:79,133** — both now end `…give you peace.”` — orphan `’` removed. ✅
  Corpus-wide scan: zero orphan nested closers of any kind remain (README reports
  9 removed; eulogeo was 2 of them).

### Mechanical fix classes — all confirmed

- **Fragment-opening quotations:** zero remain corpus-wide (the v17 scan pattern
  finds nothing in v30).
- **F9 stranded terminal periods:** zero period cases remain. Only the 8 `?`/`!`
  cases survive — the set explicitly classified "acceptable English, expect to keep."
  (README reports 24 removals vs. my count of 25 period instances — the delta is
  consistent with one case having been resolved by a curated rewrite rather than the
  mechanical remover; the end state, zero, is what matters.)
- **F4 abbreviated BSB labels:** zero remain. The 46 labels are normalized to full
  book names (verified in the diffs, e.g. nomos: `(Rom 7:23, 25, BSB)` →
  `(Romans 7:23, 25, BSB)`, `(Gal 6:2, BSB)` → `(Galatians 6:2, BSB)`).
- **soma.md:115** — both 1 Cor 11:29 occurrences now continue cleanly
  (`…judgment on himself” in…`, `…judgment on himself” means…`).

### Gate/protocol improvements adopted

- The <0.65 presumed-needs-editing rule is now written into the review gate
  (adaptation doc, "Review and promotion gate" section). ✅
- The review index now includes occurrence numbers for repeated source spans
  (addresses the soma duplicate-row ambiguity). *The v30 REVIEW.md was not attached,
  so this is claimed, not verified.*
- Curated rewrites grew 72 → 115, absorbing the malformed-projection corrections.

### Regression battery — all clean

- Zero "NET" strings; zero hits for the NET-ism probe set.
- No unbalanced curly double quotes in any of the 250 files.
- Pending-review marker present in all 250 files.
- Longest fallback unchanged at 158 words (didaskalia, Psalm 78:1–8).
- 68 files changed v17→v30; sampled diffs across amen, laos, krisis, graphe, soma,
  nomos show changes confined to the fix classes — no unrelated drift detected.

### Notable: the v30 pass caught malformed projections my v17 scan missed

Two examples visible in the diffs that were **not** on my checklist:

- `amen.md` — v17 had `—“of God are ‘Yes’ in Christ. And so throu…` (a mid-verse
  fragment opening of 2 Cor 1:20); v30 replaces it with a properly opening excerpt.
- `krisis.md` — v17 quoted John 8:16 as `“my judgment is”` (lowercase fragment,
  truncated clause); v30 has `“My judgment is true”`.

This validates the expanded curated-rewrite pass (72 → 115) and the <0.65 triage
rule. It also means my mechanical scans had a blind spot — fragment openings not
matching my two specific regex shapes — which the additional human/curated pass
covered. The two-layer approach worked as designed.

## What remains unverifiable from the attachments

- The candidate manifest hash and validator-report hash (manifest and validator
  output not attached). Approval must recompute both in the repository.
- The v31 = v30 byte-for-byte determinism claim (asserted in the doc).
- The v30 review index composition (243 fallbacks, 136-item sample, 150 attribution
  lines, occurrence numbers) — REVIEW.md was not attached this round.
- Post-approval gate steps (npm test/build, desktop, browser checks).

## Bottom line

v30 closes every finding from the v17 review, adopts the protocol recommendations,
and its expanded curated pass demonstrably caught defects beyond the mechanical
checklist. Nothing in the artifacts blocks the gated human review. The candidate is
ready for Larry's editorial review against manifest
`dad1b34f996eb44bc30e9641083f39b8945992f768a2b96b511f0a695647eb2d`, with the review
focused where the gate points it: the 115 curated rewrites, 150 attribution lines,
243 fallbacks, and the 136-item sample (sub-0.65 items first).
