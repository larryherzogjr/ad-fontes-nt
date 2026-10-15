# Ad Fontes — Public Domain Library Handoff

A bundle of public-domain English biblical and patristic resources prepared for
ingestion into Ad Fontes (https://ad-fontes.app). Each resource lives in its own
directory with a `json/` file (structured text), a `text/` or per-volume text
export, and an `index.json` describing its schema and contents.

## Why these sources (and not Logos)

Everything here was taken from clean public-domain sources — Internet Archive
scans/OCR, CCEL transcriptions, CrossWire SWORD modules, and eBible-derived
texts. Faithlife Logos resources were deliberately **not** used: Logos' EULA
licenses the data for use only within Logos software, so extracting it for a
third-party app would not be safe even when the underlying text is public
domain. Where a Logos edition was the best available, the same public-domain
text was sourced independently.

## Resources

| Directory | Resource | Contents |
|---|---|---|
| `asv/` | American Standard Version (1901) | 66 books, 1,189 chapters, 31,102 verses |
| `brenton-lxx/` | Brenton, The Septuagint with Apocrypha (1844) | 52 books (full LXX incl. apocrypha), 27,622 verses |
| `church-fathers/` | Ante-Nicene Fathers + Nicene & Post-Nicene Fathers | 37 volumes, 2,166 works (ANF 9 vols / NPNF¹ 14 / NPNF² 14) |
| `josephus/` | Josephus, Complete Works (Whiston) | 4 works, 517 chapters |
| `eusebius-and-apostolic-fathers/` | Eusebius, Church History (McGiffert) + Apostolic Fathers | Church History (11 books) + 27 works |
| `edersheim-life-and-times/` | Edersheim, The Life and Times of Jesus the Messiah (1883) | 6 books |
| `isbe-1915/` | International Standard Bible Encyclopedia (1915) | 5 volumes, 9,867 articles |
| `tsk/` | Treasury of Scripture Knowledge | 66 books, 31,153 cross-reference entries |
| `bengel-gnomon/` | Bengel, Gnomon of the New Testament (word-level NT commentary) | 28 books (whole NT), ~6.6M chars |
| `walther-law-and-gospel/` | Walther, The Proper Distinction Between Law and Gospel (Dau trans., 1929) | 39 lectures |
| `krauth-conservative-reformation/` | Krauth, The Conservative Reformation and Its Theology (1872) | 14 sections |
| `_build/` | Build scripts used to produce this bundle | provenance only |

Not included: *The Lutheran Cyclopedia* (Jacobs & Haas, 1899) — the only
usable scan proved too damaged for reliable automated extraction and was
dropped from this packet. It can be revisited later with a better scan.

## Editorial decisions

- **ANF/NPNF**: Cleveland Coxe's editorial footnotes have been stripped (he
  signs them "C." / "Cleveland Coxe"). Translators' own footnotes where
  identifiable were kept. The **Pseudo-Clementines** (including the
  *Clementine Homilies* / *Recognitions* apparatus) and the **Apostolic
  Constitutions** were removed entirely, per request.
- **Eusebius** appears both in `church-fathers/npnf2/vol-01/` (with the full
  NPNF apparatus) and standalone in `eusebius-and-apostolic-fathers/` (same
  McGiffert translation, paired with the Apostolic Fathers). Keep whichever
  suits the app's data model.
- **Josephus** is the complete Whiston translation (Life, Antiquities, Against
  Apion, Wars).
- **Walther (1929)**: US copyright expired at the end of 2024 (95 years from
  publication); the text is public domain in the US. If Ad Fontes is
  distributed in other jurisdictions, check local terms.

## Known OCR caveats

All texts were machine-checked but not hand-proofread. Notable spots:

- **Bengel**: Greek text in the commentary is OCR'd and will contain accent/
  breathing errors; the 18 chapter boundaries flagged in
  `bengel-gnomon/index.json` (`uncertain_boundaries`) were assigned by
  sequence/vote where headings were ambiguous.
- **ISBE (1915)**: OCR noise (scattered character errors) is present but
  articles are cleanly delimited and alphabetized.
- **Krauth**: two benign folio misreads confirmed against running heads; the
  printed general index was dropped (body ends at printed p. 830).
- **Brenton LXX**: Esdras/Nehemiah overlap in the source edition is preserved
  as printed (1 Esdras / Ezra-Nehemiah both present, per Brenton's own
  arrangement).
- **ASV / TSK**: clean (TSK came from the CrossWire SWORD module rather than
  OCR).
- **ANF/NPNF / Josephus / Eusebius / Edersheim**: CCEL-derived transcriptions;
  quality is good; occasional scanner artifacts may remain.

## Schema

Each `index.json` documents its own schema string. Common shapes:

- Bible texts (ASV, Brenton, TSK): per-book JSON with `code`, `book`,
  `chapters` arrays keyed by chapter/verse.
- Reference works (ISBE): article list `{title, text}`.
- Monographs (Walther, Krauth, Edersheim, Eusebius): `sections: [{n, heading,
  text}]` with front matter.
- Church Fathers: per volume, per work, `sections` arrays keyed by the work's
  own divisions (books/chapters/sections as printed).

Everything is UTF-8 JSON + plain text. Bundle is ~340 MB uncompressed,
mostly the per-volume text exports; the JSON alone is much smaller.
