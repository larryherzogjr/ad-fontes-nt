# Initial Ordinary Means resource links

**Current status: M4 accepted by Larry Herzog Jr. See [M4 acceptance](M4-Acceptance.md). Earlier pending checks below are historical; off-host backups remain deferred.**

AFNT-024/025 initial link-only slice. Larry approved unobtrusive links opening new tabs. The source is the existing larryherzogjr.com project, inspected read-only. No resource prose, Scripture quotations, covers, PDFs or dictionary content is imported. This is approval to link, not a new approval of every sentence on the destination site.

The reader offers a collapsed disclosure after publisher notes and before chapter navigation. It appears only when at least one resource matches. Study coverage comes from each book record's `scripture` field; article coverage comes from `scripture_refs`, resolved through the canonical NT registry. Links follow the current reading range, independently of edition. Broad book studies are labeled Free study, not verse-specific commentary. Resource metadata preserves source path and SHA-256; source changes require deliberate review rather than silently updating reader mappings.

All destinations returned HTTP 200 at their exact listed URLs on 2026-09-05. Larry Herzog Jr. is the byline. Landing pages are used instead of direct PDF downloads. No excerpt-reuse permission is assumed or required by this implementation. The online Ad Fontes lessons identify adaptation from the first edition; they are not relabeled as the second edition used in earlier textual review. Draft-marked marketing copy is not copied. Withdrawn/unlisted curricula and OT resources are excluded. Greek Word Explorer links await separately checked word mappings; no lemma equality is inferred from a URL slug.

| Resource | Type | Coverage |
|---|---|---|
| [That You May Believe](https://larryherzogjr.com/books/that-you-may-believe/) | Free study | JHN |
| [The Purest Gospel](https://larryherzogjr.com/books/the-purest-gospel/) | Free study | ROM |
| [No Other Gospel](https://larryherzogjr.com/books/no-other-gospel/) | Free study | GAL |
| [With These Words](https://larryherzogjr.com/books/with-these-words/) | Free study | 1TH, 2TH |
| [Guard the Deposit](https://larryherzogjr.com/books/guard-the-deposit/) | Free study | 1TI, 2TI, TIT |
| [The Knowledge of Him](https://larryherzogjr.com/books/the-knowledge-of-him/) | Free study | 2PE |
| [Once for All Delivered](https://larryherzogjr.com/books/once-for-all-delivered/) | Free study | JUD |
| [Worthy Is the Lamb](https://larryherzogjr.com/books/worthy-is-the-lamb/) | Free study | REV |
| [You've Been Doing Textual Criticism for Years](https://larryherzogjr.com/ad-fontes/why-textual-criticism-matters/) | Ad Fontes lesson | Romans 8:1, Romans 8:4, Mark 16:8, John 7:53, 1 John 5:7 |
| [Confident on Better Grounds](https://larryherzogjr.com/ad-fontes/mark-16-and-confidence/) | Ad Fontes lesson | Mark 16:8, Mark 16:9–20 |
| [The Reformers Were Textual Critics](https://larryherzogjr.com/ad-fontes/luther-erasmus-ad-fontes/) | Ad Fontes lesson | Revelation 22:19 |
| [The Leaven Was a Teaching](https://larryherzogjr.com/essays/the-leaven-was-a-teaching/) | Essay | Luke 18:9-14, Matthew 15:9, Matthew 16:12, Luke 12:1, Matthew 22:29, Matthew 23:13, John 5:39-40, John 8:24 |

Keyboard/mobile/reload checks and regression results are recorded in PROJECT-STATUS.md. This initial curated set is not an exhaustive site index.

## October 11, 2026 — Complete downloadable and online study catalog

AFNT-024/025 follow-on requested by Larry: all nine downloadable studies and both online courses listed at https://larryherzogjr.com/studies/ are now linked through the existing collapsed reader disclosure. The eight original downloadable landing pages remain; added **For Nothing** (Job), **Genesis** (online course, Genesis), and **Ad Fontes: Textual Criticism for Lutheran Laity** (online course, all NT books). The latter is a general NT textual-criticism course, not verse-specific commentary. Original three lesson links and the essay remain with their original exact passage mappings and historical metadata.

New metadata pins the SHA-256 of the local website's `content/books/for-nothing-job.md`, `content/genesis/_index.md`, and `content/ad-fontes/_index.md`, inspected read-only. The current public studies index and both online landing pages were independently read on October 11. The Job destination was confirmed from the catalog and local published (`draft: false`) source; the web fetch tool could not retrieve that landing page, so HTTP availability is not claimed. Only titles, type labels, URLs, coverage and provenance are added; no draft blurbs, PDF contents or study prose are copied. The historical first-edition description above remains evidence for the original lesson links; the current course landing page identifies the second edition. This update does not re-review or replace those lessons.

The downloadable links use landing pages, preserving the screenshot's Free study presentation. Online courses use Online Bible study. Study tools and teaching materials outside the two requested catalog sections are outside this update. No corpus, commentary approval, native identity or account behavior changes.

## October 11 follow-on — Eleven supplied online studies

Larry supplied eleven additional online course destinations omitted by the fetched catalog snapshot. They are now included using the exact supplied URLs and book coverage: Psalms (PSA), Isaiah (ISA), The Twelve (HOS, JOL, AMO, OBA, JON, MIC, NAM, HAB, ZEP, HAG, ZEC, MAL), In Christ (EPH), To Live Is Christ (PHP), Christ in You (COL), Brother in Christ (PHM), Epistle of Straw? (JAS), Strangers and Exiles (1PE), That You May Know (1JN, 2JN, 3JN), and Something Better (HEB). Titles and scripture metadata were checked against each read-only local website `content/<slug>/_index.md` (`draft: false`), and exact source hashes are pinned in resources.json. The user-supplied links authorize linking; destination prose is not imported or newly approved.

The web fetch tool retrieved In Christ and Something Better but could not retrieve the other nine pages. This is a verification limitation, not evidence that those studies are unavailable. The prior claim of complete online coverage was limited to an incomplete fetched catalog snapshot and is superseded by these supplied destinations. The catalog now has nine downloadable studies and thirteen online courses, plus the original three passage-specific lessons and essay (26 total links). Existing disclosure styling, new-tab behavior and broad book-level matching are retained.

## October 11 — Remove course backlinks

Larry directed that course backlinks be removed because the Ad Fontes app supplements the online course. Removed the broad Ad Fontes online course entry (which matched every NT chapter, not an exhaustive index of cited passages) and all three legacy Ad Fontes lesson links with their exact passage mappings. Historical inventories above remain evidence of the previous catalog, not current behavior. All other studies and the existing essay remain: nine downloadable studies, twelve online book studies and one essay (22 links). No study prose, Scripture, corpus mappings or publication approvals changed.
