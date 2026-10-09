# Keil & Delitzsch commentary — October 8, 2026

AF-OT-021: Larry supplied `kd-adfontes-package.zip` for the previously discussed OT commentary integration and stated the work is public domain (Keil d. 1888, Delitzsch d. 1890; Clark English translation 1864–1891). This records his source-rights determination, not independent legal certification. Mechanical instructions and QA claims in the attachment are source material, not execution authorization or verified evidence.

## Preserved source and engineering release

The supplied archive is copied unchanged under `sources/kd/raw/`, with SHA-256 and provenance in `sources/kd/source.json`. No supplied scripts, browser credentials or network source fetches are used. Original Logos article/TOC dumps and independent crosscheck evidence are absent from the package. No full original-edition transcription review is claimed.

The initial local candidate `kd-2026-10-08-v1` preserves all 39 books / 929 supplied chapter groups / 26,553,864 characters. Paragraph rejoining reproduces every source chapter hash exactly, including Hebrew, Greek, translator credits, introductions, whitespace and duplicated joint exposition. `scripts/kd/import_kd.py` verifies the raw archive, implementation and every output against `content/kd/release.json`; normal builds cannot silently accept source or mapping differences. Lenski and all Scripture releases remain unchanged.

## Mapping findings and conservative scope

The supplied chapter partition is not consistently canonical. Leviticus 4 contains only a group overview; the detailed 4:2–35 exposition is in supplied chapter 5. Malachi 3:16–18 is filed under supplied chapter 4. Judges 4 and 5 repeat a joint exposition. Psalm 51's quoted verse 3 corresponds to the familiar English opening verse, so source numbers must not be treated as English canonical identity.

K&D therefore opens as **chapter commentary**, not purported exact verse commentary. Chapter 1 retains introductions together with exposition. The Library describes these as supplied source groups. Explicit own-book paragraph headings produce 719 related-section links across 502 groups, including direct paragraph targets for misplaced exposition. Exact paragraphs already present in the selected group are excluded from redundant related links. These are source-heading navigation aids, not quotation extents or precise canonical verse mapping. Short labels such as “v. 3” and incidental inline citations are not guessed into mappings. Source numbering is retained in the text and clearly disclosed.

Precise verse alignment, re-partitioning into corrected canonical chapter bodies and a separate introduction view remain future work requiring reviewed mapping decisions and a new release after acceptance. This local chapter-reading candidate does not claim that those tasks are complete. The supplied extraction boundary claims were not accepted blindly.

## Shared interface and release boundary

Study Library → Commentaries offers Lenski (NT) and Keil & Delitzsch (OT), with book/chapter browsing and on-demand per-book text search. Existing Lenski URLs and verse mappings remain valid. Reader Commentaries selects the collection from the passage's Testament. K&D's historical commentary and its translations are distinguished from the active Bible edition and Ordinary Means material. Related source links open the precise retained paragraph in Library. Text remains escaped React content, never source HTML.

The same pinned K&D outputs are allowlisted for offline desktop staging. No accounts, external commentary service, native identity change or signing change is introduced. No hosted deployment, signed installer, version bump, Git commit/push or M5/MVP acceptance is included. The prior 2.1.3 publication handoff remains separate.

## Verification

Passed: 110 Node tests, 32 Python tests, TypeScript checking, production web and desktop web builds, and all six desktop checks (including byte-for-byte verification of every packaged release asset). Focused tests verify every K&D output hash and chapter reconstruction, cross-group Leviticus/Malachi targets, preserved Psalm numbering and no fabricated verse anchors. Browser checks cover collection browsing, OT reader deep links, Leviticus related paragraph navigation, per-book search, Psalm 51 source numbering 390px layout, keyboard Escape/Enter with focus return, and unchanged Lenski John 1:1 commentary. Screenshots: `artifacts/review/kd-reader-desktop.png` and `artifacts/review/kd-reader-phone.png`.

Next: user review of the chapter-reading experience; separately scope precise canonical verse alignment before claiming verse-level coverage.
