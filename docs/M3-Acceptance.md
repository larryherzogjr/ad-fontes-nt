# M3 acceptance — 2026-09-05

**M3 — curated comparison and Greek explorer is accepted for the local application.** This is not the finished MVP or approval for deployment. M4 is next.

## Human decision

Larry Herzog Jr., the assigned reviewer and product owner, replied **“All accepted/approved.”** to the three decisions in [Remaining acceptance](M3-Remaining-Acceptance.md): sampled Greek analysis/display, disclosed Greek-tool limitations, and the existing study experience subject to engineering completion. The decision is recorded with date-only precision. No additional consulted reference, physical device, exhaustive audit or manuscript-image verification is inferred. All 30 explanations already have individual, content-hashed publication approvals.

## Completed scope

- AFNT-016/017: validated editorial schema, publication checks and 30 approved local explanations; no draft or pending initial candidate. Scripture, publisher notes, commentary and historical source claims remain distinct.
- AFNT-018: chapter links plus accessible **OM** buttons beside affected source verses. Absent verses have coverage notices with commentary buttons, including in whole-chapter reading. Canonical mappings drive the links, including joined/renumbered source verses and cross-chapter units. Buttons open the complete reviewed range and preserve the note-only presentation where required. An OM legend and explicit accessible labels distinguish them from publisher daggers.
- AFNT-019/020: pinned source morphology, contextual glosses and historical dictionary, Greek exploration and exact indexed occurrences. The presented four-sample review and disclosed limitations are accepted; automated source-span and independent RP sample checks remain in force.
- AFNT-021: exact released source spans, long/mixed/relocated units, differences in English rendering, unknown/unavailable enrichment, and approval integrity have verification coverage. No corpus bytes, mappings or frozen analysis assets changed in the marker implementation.

## Final verification

Final commands: `npm run typecheck` and `npm run build` (the prebuild runs offline imports, publication validation and the full test suite). **34 Node test groups and 11 Python tests passed.** Production build and typecheck passed.

A new regression checks marker reachability for all **30 units × seven editions**, through source-mapped verse markers or explicit absent-verse coverage. It also checks cross-chapter endpoints, excluded neighboring verses, draft exclusion and source numbering in 3 John.

Focused browser checks:

- John 8 inline marker opens the complete John 7:53–8:11 note. Escape restores the John 8 URL and the precise invoking marker.
- Acts 8 in BSB exposes its absent-verse commentary button from the full chapter. The note opens at Acts 8:37; Close restores the exact coverage-marker focus. The first check revealed that the notice previously required explicit passage selection; the final implementation also exposes reviewed absences during whole-chapter reading.
- Luke 22:43’s inline button opens Publisher note study with zero comparison cards; Escape restores the inline marker. Direct note URL reopening also works.
- At 390px the Scripture and inline markers remain readable without horizontal overflow. Marker targets measure at least 24×24 CSS pixels, and keyboard focus is visibly outlined. Desktop restored to 1280px. Earlier batch acceptance covers 320px panel layouts; this does not constitute physical-device testing or full accessibility certification.
- 2 Thessalonians 2:13 retains readable Greek text with an explicit unavailable-analysis explanation. It is not shown as missing Scripture.

## Continuing limitations and next milestone

Two source verses have unavailable analysis; 28 analyzed verses lack matched contextual glosses. Occurrence counts cover only the indexed Nestle subset. Strong’s pronunciation is a historical written guide for its standard form, not necessarily the selected inflection. There is no verified English word alignment. BGB availability and the exact MSB Greek-source identity remain unresolved; named fallback editions and limitation labels are retained.

Book-attributed manuscript accounts keep their approved verification limits; no new independently established attestations are claimed. Review acceptance does not imply a full manuscript/apparatus, lexical, accessibility or release-security audit. Preserved source manifests retain their original pre-acceptance review wording as historical evidence; this record supplies the subsequent decision.

**Next: M4 — local personal notes and verified passage-linked Ordinary Means resources (AFNT-022–025).** Resource links require actual supplied inventory and rights. M5 retains broader accessibility, pilot, performance, restore/rollback and public-release verification. No public deployment or paid service is authorized.
