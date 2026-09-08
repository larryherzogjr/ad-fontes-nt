# COPY-REVIEW.md — every block of draft copy awaiting Larry's review

All marketing/pastoral copy below was drafted by an assistant and is provisional
until Larry approves or rewrites it. Each location is marked `<!-- DRAFT COPY -->`
in the source (or noted in front matter).

## Greek Explorer batch 02 — September 6, 2026

- [x] `content/greek/typos.md` — complete entry and metadata; approved for production.
- [x] `content/greek/skia.md` — complete entry and metadata; approved for production.
- [x] `content/greek/pleroo.md` — complete entry and metadata; approved for production.
- [x] `content/greek/doulos.md` — complete entry and metadata; approved for production.
- [x] `content/greek/nekros.md` — complete entry and metadata; approved for production.
- [x] `content/greek/zoopoieo.md` — complete entry and metadata; approved for production.
- [x] `content/greek/aphthartos.md` — complete entry and metadata; approved for production.
- [x] `content/greek/phthora.md` — complete entry and metadata; approved for production.

[Review packet](output/editorial/greek-batch-02/review.md) records source checks,
word counts, optional sections, and editorial qualifications. Larry approved all eight
for production on September 6, 2026; none enter Word of the Week.

## Greek Explorer batch 01 — September 6, 2026

- [x] `content/greek/diakrino.md` — complete entry and metadata; approved for production.
- [x] `content/greek/poterion.md` — complete entry and metadata; approved for production.
- [x] `content/greek/deipnon.md` — complete entry and metadata; approved for production.
- [x] `content/greek/endyo.md` — complete entry and metadata; approved for production.
- [x] `content/greek/sphragizo.md` — complete entry and metadata; approved for production.
- [x] `content/greek/synthapto.md` — complete entry and metadata; approved for production.
- [x] `content/greek/arrabon.md` — complete entry and metadata; approved for production.
- [x] `content/greek/aparche.md` — complete entry and metadata; approved for production.
- [x] `content/greek/stephanos.md` — complete entry and metadata; approved for production.
- [x] `content/greek/misthos.md` — complete entry and metadata; approved for production.

Source evidence, lengths, optional sections, and review points are in the
[batch review](output/editorial/greek-batch-01/review.md). Larry approved all ten for production on September 6, 2026. No Word of the Week additions.

## Greek Explorer pilot — September 6, 2026

- [x] `content/greek/anaxios.md` — title/subhead/description and complete entry
      approved by Larry in his affirmative answer to review question 1.
- [x] `content/greek/proorizo.md` — title/subhead/description and complete entry
      approved by Larry in his affirmative answer to review question 2.
- [x] `content/greek/charakter.md` — title/subhead/description and complete entry
      approved by Larry in both affirmative answers to review question 3.

The pilot's [review record](output/editorial/greek-pilot/review.md) records the
Greek, NET, and direct Logos Kolb–Wengert checks and Larry's editorial approval.
Larry approved production release of all three entries on September 6, 2026.
They remain excluded from Word of the Week.
Larry's length guidance: stay consistent with deployed entries, without padding
or cutting useful content to meet a word count. Handoff ranges are advisory.

## Site-wide / homepage

- [x] Ordinary Means tagline — "Faith · Grace · Vocation." Supplied by Larry
      in the approved social-card identity and approved for the masthead and
      newsletter band on 2026-08-23. Its initially added homepage-hero
      repetition was removed the same day.
- [ ] Masthead eyebrow + headline — `content/_index.md` front matter
      ("Confessional Lutheran Author" / "Read deeply. Rest in what is given.").
      Updated from the original positioning line for the July 30 publisher-library
      redesign handoff.
- [ ] Homepage hero support (drop cap) — `content/_index.md` body
      ("Books, Bible studies, essays, and free resources for ordinary
      Christians—rooted in Scripture and formed by Word and Sacrament.").
      The provisional headline is also baked into
      `static/og-home-library.png`; regenerate that share card after approval
      if the wording changes.
- [ ] Homepage pathway promises — `data/pathways.yaml` `home_lede` fields for
      Bible readers, weary evangelicals, and the struggling. These are shown on
      the homepage only; the existing pathway-page ledes remain unchanged.
- [ ] Homepage library overview and six category descriptions —
      `layouts/index.html` and `data/home.yaml`.
- [ ] Homepage section framing — "Find your way in," "Start with one of these,"
      and "Studies for real congregations" plus its one-sentence introduction —
      `layouts/index.html`.
- [ ] Homepage/library CTAs — "Explore the library," "Find a starting point,"
      "Follow this path," and the browse/action labels in `layouts/index.html`.

## Under the Word collection

- [ ] Collection framing, choice labels, short resource descriptions, and the
      curriculum transition on `/under-the-word/` —
      `content/under-the-word/_index.md` and `layouts/under-the-word/hub.html`.
- [ ] Field Guide “second layer” framing line —
      `layouts/under-the-word/field-guide.html`.
- [ ] Generated page descriptions for the collection, handbook chapters,
      appendices, Field Guide entries, and question groups — marked in the
      generated front matter under `content/under-the-word/`.
- [ ] Resources-page start cues and the new Under the Word collection label —
      `content/resources.md`.

## Book blurbs (front matter `blurb`) and descriptions (body)

- [ ] for-you — `blurb`, `who_for`, `find_inside`, `related_books`, and the
      landing-page body adapted 2026-09-01 from Larry's supplied complete
      manuscript. The `weary-evangelicals` pathway and *The Hollow Altar*
      related-book link are editorial judgments based on the manuscript and
      the user-supplied companion relationship. No ISBN, publication date, or
      endorsements were inferred. `content/books/for-you.md`.
- [ ] the-left-hand — `summary`, `tags`, `blurb`, `who_for`, `find_inside`,
      `related_books`, and landing-page body adapted 2026-08-24 from Larry's
      supplied complete manuscript. The `weary-evangelicals` pathway follows
      the preface's explicit primary audience; the three related books are an
      editorial judgment based on the manuscript's themes. No ISBN,
      publication date or endorsements were inferred. Larry explicitly selected
      it for the homepage new-release plate on 2026-08-24.
      `content/books/the-left-hand.md`.
- [x] by-heart — `blurb`, `summary`, `tags`, and landing-page body adapted from
      Larry's supplied `by-heart-website-copy.md` on 2026-08-21. The source's
      explicitly unconfirmed figures (634 hymns and 110 preliminary pages) were
      omitted. Its free sample points to the existing *One Fold of Paper* essay;
      the nine-session Teacher's Guide is published as a free PDF and recorded
      in `ASSETS-NEEDED.md`. The three related Q&A entries now use this book page as
      their `deep_link`, as requested in the supplied guidance.
- [ ] one-fold-of-paper completion note — `content/essays/one-fold-of-paper.md`
      now identifies *By Heart* as complete and links to its book page. The
      downloadable essay's closing note was updated in parallel to remove
      “a book in progress” and point readers to the completed book.
- [ ] reverie — `blurb`, `who_for`, `find_inside`, and body description were
      rewritten 2026-08-14 at Larry's request in a shorter, broader register
      from his Amazon/KDP copy and manuscript. The requested military-location
      and performance details were omitted. The same provisional blurb is reused
      by the time-boxed homepage new-release plate. `content/books/reverie.md`.
- [x] grace-withheld — body description, `blurb`, `who_for`, and `find_inside`
      are Larry's OWN Amazon/KDP copy from the listing he supplied, applied
      2026-07-21 with Markdown emphasis and the bullet list moved into the
      existing `find_inside` field. `content/books/grace-withheld.md`.
- [x] a-man-of-blood — body description, `who_for`, and `find_inside` are
      Larry's OWN KDP marketing copy (Dropbox: `A Man of
      Blood/A_Man_of_Blood_KDP_Marketing.md`), applied verbatim 2026-07-09,
      replacing the earlier themed placeholder. Only change: the all-caps title
      convention (*A MAN OF BLOOD*) and light trimming (the "you will find"
      bullets moved to the `find_inside` field; the trailing trilogy line kept).
      `content/books/a-man-of-blood.md`.
- [ ] a-man-of-blood `blurb` — condensed by Claude from Larry's KDP copy
      ("A confessional Lutheran theology of moral injury…"). Catalog/plate
      teaser only; confirm the wording.
- [x] altar-call-anxious-bench-empty-pew — body description and `who_for` are
      Larry's OWN KDP/back-cover copy (Dropbox: `The Altar Call .../
      AltarCall_Collateral.md`), applied 2026-07-10 (light `<b>/<i>` → Markdown
      conversion only). New standalone. Its former companion
      relationship with THE HOLLOW ALTAR was removed at Larry's request on
      2026-09-02; both remain in the `weary-evangelicals` pathway.
      `content/books/altar-call-anxious-bench-empty-pew.md`.
- [ ] altar-call-anxious-bench-empty-pew `blurb` + `find_inside` +
      `related_resource` note — Claude-composed from claims Larry's description
      explicitly makes (the nineteenth-century revival technique; the three
      wounds; *extra nos*; water/word/table). `related_resource` points at the
      existing Law & Gospel paper. Verify the wording and the resource fit.
- [ ] KEPT + THORN closing "companion volume" lines — reworded 2026-07-09 to
      name the new third companion (*A Man of Blood*) alongside the existing one.
      `content/books/kept.md`, `content/books/thorn.md` (bodies still DRAFT).
- [ ] data-and-dust — `blurb`, `who_for`, `find_inside`, and 3-paragraph body
      rewritten 2026-08-17 from Larry's complete manuscript PDF. The earlier
      title/subtitle-only placeholder is gone. The new copy is grounded in the
      introduction's two rejected reflexes (baptism and dread), its four-part
      movement (diagnosis, anthropology, vocation, hope), the fourteen chapter
      titles, and the conclusion's dust/data contrast. It remains Codex-condensed
      marketing copy and needs Larry's review. `content/books/data-and-dust.md`.
      IMPORTANT TITLE CHECK: the public site and supplied cover say *Data &
      Dust*, while the manuscript title page and running heads say *Dust and
      Data*. The site title/slug were left unchanged. The manuscript's ISBN and
      month-only publication line were not added to front matter pending title
      confirmation and an exact publication date.
- [ ] ad-fontes — blurb + 3-paragraph description (incl. "Fall 2026 adult Sunday school text" line)
- [ ] ad-fontes-old-testament — blurb + 3-paragraph description. Claude-drafted
      2026-06-28. New standalone; companion to ad-fontes (the OT/Hebrew-text
      volume). `content/books/ad-fontes-old-testament.md`.
- [ ] just-enough-greek — blurb + 3-paragraph description (incl. Fall 2026 line)
- [ ] fifty-more-greek-words — blurb + 3-paragraph description. Claude-drafted
      2026-06-28. New standalone; "Just Enough Greek, Volume Two," companion to
      just-enough-greek. `content/books/fifty-more-greek-words.md`.
- [ ] judeo-christian-values — blurb + 3-paragraph description
- [ ] what-horse — blurb + 3-paragraph description
- [ ] the-hollow-altar — blurb + 3-paragraph description (homepage featured slot)
- [x] ALL 15 standalone book pages — NEW detail blocks + cross-links, Claude-drafted
      2026-06-29; APPROVED by Larry 2026-06-29 (DRAFT markers cleared from front
      matter and template):
      `who_for` (1 line), `find_inside` (3–4 bullets), `related_books`, and—where a
      free resource isn't already linked in the body—`related_resource` (label +
      url + 1-line `note`). The `find_inside`/`who_for` copy is derived faithfully
      from each book's existing description; review for voice and accuracy.
      Books touched: the-hollow-altar, what-horse, judeo-christian-values,
      the-purest-gospel, ad-fontes,
      ad-fontes-old-testament, just-enough-greek, fifty-more-greek-words, thorn,
      kept, no-other-gospel, once-for-all-delivered, the-knowledge-of-him.
      Notes: thorn/kept have no `related_resource` (no clean free-resource fit);
      judeo-christian-values, just-enough-greek, and the 3 free studies omit the
      resource box because their bodies already link /dispensationalism/ or /greek/.
      ad-fontes-OT's resource points at /greek/ (NT-Greek) as the nearest
      language-tools resource — swap if you'd rather it point elsewhere.
- [ ] kept — blurb + description + companion line
- [ ] thorn — blurb + description + companion line
- [x] counterfeit-harvest — unpublished 2026-08-28 at Larry's request; source
      copy remains in its draft content file for possible restoration.
- [ ] the-purest-gospel — free Romans exposition landing-page blurb and body,
      adapted 2026-08-28 from the former commercial page and Larry's supplied
      manuscript. Confirm the new free-study framing and “two volumes” wording.
- [ ] with-these-words — free Thessalonians study landing-page blurb, detail
      fields, and body, adapted 2026-08-28 from the former commercial page and
      Larry's supplied manuscript. Confirm the eleven-session free-study framing.
- [ ] once-for-all-delivered (Jude study) — blurb + 3-paragraph description.
      Claude-drafted 2026-06-25. Free standalone study; featured at the top of
      `/studies/`. `content/books/once-for-all-delivered.md`.
- [x] the-knowledge-of-him (2 Peter study) — blurb + 3-paragraph description.
      Claude-drafted 2026-06-27; approved by Larry 2026-06-28. Free standalone
      study; featured at the top of `/studies/`. `content/books/the-knowledge-of-him.md`.
- [ ] no-other-gospel (Galatians study) — blurb + 2-paragraph description.
      Claude-drafted 2026-06-28 from Larry's master manuscript. Free standalone
      study; featured at the top of `/studies/`. `content/books/no-other-gospel.md`.
      Also review the PDF cover/colophon copy (eyebrow, epigraph "For freedom
      Christ has set us free" / Gal 5:1, the two colophon notes) — all
      Claude-drafted, baked into the PDF, not in the source page.
      Manuscript revisions added 2026-08-27 are also provisional: the corrected
      `diathēkē` treatment, the Galatians 3:26–29 bridge and baptismal
      application, the Hagar/Sarah scope note, the Galatians 5:4 lexical note,
      and the expanded Galatians 5:1–24 commentary. Each passage is marked
      `DRAFT COPY` in `source/studies/no-other-gospel/manuscript.md`.
- [x] guard-the-deposit (Pastoral Epistles Greek study) — `blurb`, body,
      `who_for`, `find_inside`, and Greek Word Explorer cross-link paragraph
      approved for publication by Larry on 2026-08-15.
      `content/books/guard-the-deposit.md`.
- [ ] guard-the-deposit thematic reclassification — subtitle changed to “The
      Shared Greek Vocabulary of 1–2 Timothy and Titus”; the blurb, one
      `find_inside` bullet, and the body’s format sentence now call it a
      “thematic vocabulary study.” The new `/studies/` section description is
      also provisional. Requested 2026-08-17 after Larry noted that this study
      is structurally different from the four sequential Greek book studies.
      `content/books/guard-the-deposit.md`, `layouts/studies/list.html`.
- [ ] worthy-is-the-lamb (Revelation commentary) — blurb + 3-paragraph body +
      detail blocks (`who_for`, `find_inside`) + Dispensationalism field-guide
      cross-link. Claude-drafted 2026-06-29 from Larry's handoff (commentary, not a
      Greek word study; the body opening adapts the commentary's own Introduction).
      Free standalone study; featured at the top of `/studies/`.
      `content/books/worthy-is-the-lamb.md`.
      PDF: re-typeset 2026-06-29 into the HOUSE free-study style (Cardo + Source
      Serif 4, hairline frame, "A Free Study Resource" eyebrow, colophon, red
      folios) via `scripts/build_worthy_is_the_lamb.py` + `scripts/worthy-is-the-lamb.css`,
      replacing the handoff's EB-Garamond/6×9 build so it matches Jude/2 Peter/John.
      114 pp, `static/downloads/studies/worthy-is-the-lamb-revelation.pdf`; rebuild
      from the 14 installments in Dropbox (`Bible studies/Revelation/`). PDF cover
      copy to review: the eyebrow "A Free Study Resource" (matches the other studies)
      and the Claude-chosen epigraph — Rev 5:12, "Worthy is the Lamb who was slain…"
      (trimmed from the verse's full seven-fold doxology to fit the title page).
      Non-blocking: the handoff's pre-print citation pass (Kolb–Wengert / LW exact
      wording + pagination) remains for the print edition only; the PDF's translation
      note already covers the web download.
- [ ] worthy-is-the-lamb cross-links — Claude-drafted 2026-06-30. Added the
      commentary to seven existing curated lists so it's discoverable from the
      Resources page and the dispensationalism materials (Larry approved the scope):
      `content/resources.md` ("Other free studies and resources" — also added the
      previously-missing *That You May Believe* / John study); the field guide
      `content/dispensationalism/field-guide.md` "Go deeper"; and five spokes'
      "Go deeper" lists — `is-the-rapture-biblical`, `one-taken-one-left`
      (rapture excursus), `augsburg-confession-xvii-millennium`,
      `historic-vs-dispensational-premillennialism` (thousand-years excursus), and
      `who-is-israel-new-testament` (144,000 excursus). Each is a one-line
      bold-link entry in the existing voice; no inline DRAFT markers (they sit
      inside markdown lists), tracked here instead. Review the descriptions for
      voice/accuracy.
- [x] that-you-may-believe (John study) — blurb + 3-paragraph body + detail
      blocks + Greek Word Explorer cross-link + PDF cover/colophon copy.
      Claude-drafted 2026-06-29 from Larry's master manuscript; APPROVED by Larry
      2026-06-29 (verbiage, layout, look/feel, and NET corrections all approved)
      and published (draft:false). NET shaded blocks were reconciled verbatim
      against the labs.bible.org NET API (138 verses; 6 wording fixes at 6:50,
      8:52, 8:59, 9:2, 10:7, 10:13; NET editorial brackets at 9:38–39a dropped).
      Non-blocking follow-ups tracked elsewhere: real cover (ASSETS-NEEDED.md)
      and the *Just Enough Greek* footnote chapter numbers still using `s.v.`.
- [ ] that-you-may-believe editorial revision — Codex-drafted 2026-08-27 from
      the external 50-page editorial review. Review the softened claims for
      *trōgō*, *houtōs*, *allos/heteros*, and *tetelestai*; the more precise
      Roman Catholic summary in the John 6 excursus; and the synchronized
      *allos/heteros* paragraphs in `content/greek/{parakletos,pneuma}.md`.
      Definite copy fixes, counts, citations, dangling Jude references, and the
      generated contents page were applied at the same time.
- [ ] 12 study volumes — formulaic blurb + 2-paragraph description each
      ("A verse-by-verse adult Bible study of <scripture>…")

## Series copy

- [ ] Series de-emphasis copy — Codex-drafted 2026-08-28 after Larry approved
      the "unlisted, not unpublished" direction. Review the replacement
      homepage Bible-study heading/lede, the `/books/` cross-reference, the
      `/studies/` introduction and metadata, the revised About-page bio phrase,
      and the Bible-studies/Teacher's-guides category descriptions in
      `data/home.yaml`. The three series and all twelve volumes remain live and
      searchable, but are no longer presented by these curated surfaces.
- [ ] Catalog section headings + taglines — `layouts/books/list.html`.
      2026-07-01: the single "Standalone Titles" section was split into
      "Books on Amazon" (now 17 paid standalones; keeps the 2026-06-22
      tagline "Single-volume books — each a complete study in its own
      right.") and "Free full-length studies" (the 6 `free: true`
      standalones; NEW Claude tagline: "Complete, manuscript-length studies
      of Scripture — free to read as PDFs."). Split is driven by the `free`
      front matter param — no hardcoded titles. Review both headings and
      both taglines. The page intro was made format-neutral on 2026-07-21
      ("available on Amazon") because new listings may be Kindle-only.
- [ ] Bible Studies page headings — `layouts/studies/list.html`. 2026-07-01:
      "Featured study" (singular, over five studies) renamed "Featured free
      studies"; "Standalone Studies" recased to "Standalone studies" (sitewide
      sentence-case heading convention). Also flagging the standalone-studies
      tagline ("Single-volume studies that walk through a book of Scripture
      verse by verse — not part of a series, but the same approach and the
      same free Teacher's Guides.", Claude-drafted 2026-06-23) — it was
      missing from this index until now.
- [ ] Series hub meta descriptions — `content/studies/*/_index.md` front
      matter, one per series, added 2026-07-01 (≤155 chars, condensed from
      `data/series.yaml`). These three pages previously fell back to the
      generic sitewide meta description.
- [ ] `data/series.yaml` — taglines + descriptions for all three series.
      The literal "DRAFT —" prefixes were removed 2026-06-10 after Larry
      flagged them on the live site; the text itself still merits his
      read-through.

## Pathway pages (letters)

- [ ] /for/bible-readers/ — lede (data/pathways.yaml) + 3 paragraphs
- [ ] /for/weary-evangelicals/ — lede + 3 paragraphs
- [ ] /for/the-struggling/ — lede + 3 paragraphs; updated 2026-08-14 to include
      *Reverie* and the previously omitted *A MAN OF BLOOD*
- [ ] /for/discerning-readers/ — lede (data/pathways.yaml) + 3 paragraphs
      (apologetics/discernment pathway; URL-only, off the homepage + footer)

## Dispensationalism study library and field guide

- [x] Hub structure and editorial selection — APPROVED by Larry 2026-08-17:
      `/dispensationalism/` now leads with the six-week adult class, then the
      field guide and seven focused articles, three core books, *Counterfeit
      Harvest* and *The Hollow Altar* as secondary reading, six applicable
      Questions links, and the `Ordinary Means` form.
- [ ] Hub metadata, introduction, course description/note, field-guide framing,
      book labels, and section headings — `content/dispensationalism/_index.md`
      and `layouts/dispensationalism/list.html`. Codex-drafted 2026-08-17 to
      connect the approved sections; each block is marked DRAFT in source.
- [n/a] Field-guide body — `content/dispensationalism/field-guide.md` (moved
      from the section `_index.md` 2026-08-17 when the dedicated hub was added;
      formerly `content/dispensationalism.md` before the 2026-07-01 section
      conversion). Author-supplied
      content (drafted with Larry per the handoff), not Claude draft copy, so it
      carries no `<!-- DRAFT COPY -->` markers. Listed here only for visibility.
- [x] Field-guide entry blurb on the Resources index — `content/resources.md`
      ("A free, in-depth web guide to dispensationalism…"). APPROVED 2026-06-25.
      (The page-wide DRAFT marker in `resources.html` stays — it still covers other
      unapproved group blurbs/outros.)
- [ ] Study-library promo on the homepage — `layouts/index.html`, between the
      "Start here" triptych and the Featured slot. Replaced the approved
      field-guide-only promo 2026-08-17; it now reuses the provisional hub
      description and links to the complete library.
- [x] Reciprocal callout on the JCV book page — `content/books/judeo-christian-values.md`
      ("New to the topic? Start with the free Dispensationalism field guide…").
      APPROVED 2026-06-25. (File-level DRAFT marker stays — the book's 3-paragraph
      description above it is still pending below.)
- [x] Field-guide sentence added to the weary-evangelicals pathway letter —
      `content/for/weary-evangelicals.md` (last paragraph). APPROVED 2026-06-25.
      (File-level DRAFT marker stays — the surrounding pathway letter is still
      pending below.)

### Cluster spokes — added 2026-06-25, APPROVED by Larry 2026-06-25

Seven topic-cluster spokes under `content/dispensationalism/`, each with body copy
*and* a mirrored `faq:` list. Larry approved the theological content; DRAFT markers
removed from the bodies and the list-page tagline.

- [x] `is-the-rapture-biblical.md` → *With These Words*
- [x] `one-taken-one-left.md` → *With These Words* / pillar
- [x] `who-is-israel-new-testament.md` → *Judeo-Christian Values?*
- [x] `what-is-christian-zionism.md` → *Judeo-Christian Values?*
- [x] `seven-dispensations.md` → *Judeo-Christian Values?*
- [x] `historic-vs-dispensational-premillennialism.md` → pillar
- [x] `augsburg-confession-xvii-millennium.md` → pillar

## Greek Word Explorer (/greek/) — added 2026-06-25

- [n/a] The word entries — `content/greek/*.md`. Author-supplied content from the
      *Just Enough Greek* manuscript chapters, not Claude draft copy, so they carry
      no `<!-- DRAFT COPY -->` markers. Tagged `volume: 1` (the 50 of Vol. One) or
      `volume: 2` (the 50 of Vol. Two, imported 2026-06-27) — 100 live. Each
      publishes the four core sections (cut before the book-only "Where People Get
      It Wrong / So What / If You Want to Go Deeper"). Vol. Two Part names are
      Larry's (Word and Christ / Sin and the Fallen World / Salvation and Redemption
      / Word, Sacraments, Christian Life / Spirit and Christian Virtue / Church and
      Ministry / Last Things and Final Hope). Listed here only for visibility.
- [x] Explorer hub intro — `content/greek/_index.md` body. The original
      handoff-supplied 100-word introduction was revised 2026-08-15 for the new
      multi-collection schema and approved for publication by Larry on
      2026-08-15.
- [ ] Word Explorer cross-link on the *Just Enough Greek* book page —
      `content/books/just-enough-greek.md` ("Want a taste first? The free Word
      Explorer…"). Claude-drafted 2026-06-25. Stale word-count corrected
      2026-07-01: "opens a dozen of the fifty words in full" → "opens all
      fifty" (all 50 of this volume's words are now full free entries in the
      100-word Explorer).
- [ ] Word Explorer cross-link in the Bible-readers pathway letter —
      `content/for/bible-readers.md` ("You can start today, for free…").
      Claude-drafted 2026-06-25. (File-level DRAFT marker stays — the pathway
      letter itself is still pending above.) Stale word-count corrected
      2026-08-15: the fixed "one hundred" count became count-neutral so future
      collections do not make the pathway copy stale. The same earlier fix was applied to the `related_resource` note on
      `content/books/fifty-more-greek-words.md` ("opens a dozen of these words"
      → "opens all fifty").
- [ ] Word Explorer cross-link on the Jude study page —
      `content/books/once-for-all-delivered.md` ("Several of Jude's key words…").
      Claude-drafted 2026-06-25. (File-level DRAFT marker stays.)
- [x] Word Explorer cross-link on the 2 Peter study page —
      `content/books/the-knowledge-of-him.md` ("Several of 2 Peter's key words…").
      Claude-drafted 2026-06-27; approved by Larry 2026-06-28.
- [ ] Word Explorer cross-link on the Galatians study page —
      `content/books/no-other-gospel.md` ("Several of Galatians' key words…").
      Claude-drafted 2026-06-28. (File-level DRAFT marker stays.)
- [ ] Word-page CTA + preview teaser framing — `layouts/greek/single.html`
      ("is 1 of 100 in the *Just Enough Greek* series" — per Larry's 2026-06-27
      instruction). Template-level. 2026-07-01: the book link now resolves per
      volume via `data/greek.yaml` (Vol. One words → *Just Enough Greek*,
      Vol. Two words → *50 More Greek Words…*); previously every word linked
      to the Vol. One book page.
- [ ] Explorer hero label/dek — `layouts/greek/explorer.html` ("One Greek word,
      opened up." / "What it means, where you'll meet it…"). Template-level.

## Essays

Current presentation (2026-08-30): `/essays/` opens with four curated starting
points, then offers subject/search filtering above the complete chronological
archive. The Resources page automatically previews the five newest essays.
The controlled subject assignments and starting-point slugs live in
`data/essay_topics.yaml`.

- [ ] Essays-library section framing — `layouts/essays/list.html` adds the
      provisional heading “Four essays to start with.” The functional labels
      “Begin here,” “Browse by subject,” “The complete archive,” and “All
      essays” are navigation rather than marketing copy.

Previously, `/essays/` was only the complete archive, and the
Resources page automatically previews the five newest essays. Historical notes
below that mention an individual Resources listing describe the earlier,
manually maintained presentation; essay titles no longer live in
`content/resources.md`.

- [x] Essay landing-page editorial sweep — Larry supplied the complete set of
      26 live Markdown files (the archive index plus 25 essays) on 2026-08-26.
      Applied exactly as supplied. The revised files remove the provisional-copy
      markers and therefore approve the current essay metadata and landing-page
      blurbs. Regenerated the essay Open Graph cards from the approved metadata.

- [ ] "Two Kingdoms, One Lord" essay — author-supplied text (2026-06-30 handoff),
      not Claude-drafted, so it carries no `<!-- DRAFT COPY -->` marker. Only the
      PDF/site *metadata* is a Claude judgment call, flagged here: the cover
      eyebrow "On Church and State" (topical label, matching the pattern of
      "On Contemporary Worship" / "Confessional Lutheran Theology" on the other
      two essays); the title/subtitle split on the cover, taken directly from the
      author's own H1 and italic dek; the `slug` "two-kingdoms-one-lord"; and the
      Resources listing label. Built via `scripts/brand_handout.py` (generalized
      to accept a non-.docx `--src` when `--title`/`--subtitle` are both passed
      explicitly — previously .docx-only) into
      `static/downloads/essays/two-kingdoms-one-lord.pdf` (8pp). Listed in
      `content/resources.md` "Essays" group only, matching the other two essays'
      scope (no further cross-links elsewhere on the site).
- [ ] "No One Takes This Honor for Himself" essay — author-supplied text
      (2026-07-01 handoff), not Claude-drafted. The handoff arrived with
      blog/CMS-shaped front matter (`date`, `tags`, `categories`, `description`)
      that doesn't map to any content type this site has — DESIGN.md §14
      explicitly excludes blog/article hosting (that content lives on Beehiiv) —
      so it was built as a fourth PDF in the same "Essays" pattern as the other
      three, not as a new page type. Only the cover eyebrow "On the Doctrine of
      the Call" is a Claude judgment call (topical label, matching the existing
      pattern); title/subtitle on the cover are taken verbatim from the handoff's
      own `title`/`subtitle` front matter. `static/downloads/essays/no-one-takes-this-honor.pdf`
      (8pp). Listed in `content/resources.md` "Essays" group only.
- [ ] "Love the Sinner, Hate the Sin" essay — author-supplied text (2026-07-02
      handoff), not Claude-drafted, so it carries no `<!-- DRAFT COPY -->` marker.
      Arrived with the same blog/CMS-shaped front matter as "No One Takes This
      Honor" (`date`, `tags`, `categories`, `description`, `summary`), which maps
      to no content type this site has (DESIGN.md §14 excludes blog/article
      hosting), so it was built as a fifth PDF in the same "Essays" pattern, not
      as a new page type. Only the cover eyebrow "On a Common Saying" is a Claude
      judgment call (topical label matching the existing "On …" pattern, chosen to
      fit a chapter adapted from *What Horse? Common Misconceptions About What the
      Bible Actually Says*); title/subtitle are taken verbatim from the handoff's
      own `title`/`subtitle`, and the adapted-from `source` line is carried onto
      the cover. `static/downloads/essays/love-the-sinner-hate-the-sin.pdf` (5pp).
      Listed in `content/resources.md` "Essays" group only.
- [ ] "A Word From Outside Us" essay — author-supplied rewrite (2026-07-02
      handoff, `confessional-lutheran-defense-v2.md`), not Claude-drafted, so it
      carries no `<!-- DRAFT COPY -->` marker. This *replaces* the original
      "On Which the Church Stands or Falls" defense essay in place: same slug and
      URL (`static/downloads/essays/confessional-lutheran-defense.pdf`), so no
      external link breaks and the slug stays topically accurate ("this essay is
      a defense of that faith"). Rebuilt via `scripts/brand_handout.py` (13pp, up
      from 6pp — the rewrite is longer and adds a "Standard Objections" section).
      No Claude metadata calls: eyebrow "Confessional Lutheran Theology",
      title/subtitle, and byline all come verbatim from the handoff's own heading
      block (`#`/`##`/`###` + byline lines). Preprocessing dropped the handoff's
      title block, its inter-section `---` rules (redundant with the styled `##`
      headers, matching the original essay's clean look), and the closing
      copyright footer. Resources label updated to the new title.
- [ ] Essay landing pages + OG cards (new `content/essays/` section, 2026-07-03).
      Added so each essay has a shareable web page carrying an Open Graph card
      (essays were previously PDF-only, with no page for a card to attach to).
      Five thin landing pages (`content/essays/*.md`) + an index — each shows
      eyebrow/title/subtitle, a short blurb, a "Read the essay (PDF)" button to
      the existing PDF, and any adapted-from credit. Deliberately *not* full-text
      reproductions of the PDFs (that would be the "article hosting" DESIGN.md
      §14 lists as out of scope for v1); they are download/landing pages, matching
      how the site has already grown past strict v1 (the `questions/` section).
- [ ] "The Proof of the Cup" essay — author-supplied text (2026-07-03 handoff),
      not Claude-drafted. Arrived with the same blog/CMS-shaped front matter as
      the other handoffs (`date`, `tags`, `categories`, `description`, `summary`,
      `draft: true`), which maps to no content type this site has, so it was
      built in the established Essays pattern: a branded PDF via
      `scripts/brand_handout.py` (`--src` the .md, `--drop 0` since the title
      block lives in front matter not the body, `--kicker "Essay"`) →
      `static/downloads/essays/the-proof-of-the-cup.pdf` (5pp); a thin landing
      page `content/essays/the-proof-of-the-cup.md`; an OG card via
      `scripts/gen_essays_og.py` → `static/og/essays/the-proof-of-the-cup.png`;
      and a Resources "Essays" listing. Claude judgment calls:
      1. `draft: true` in the handoff → `draft: false` on the landing page, since
         the ask was to publish it. Flag if you wanted it staged instead.
      2. Cover/page eyebrow "On the Lord's Supper" (topical label matching the
         existing "On …" pattern). Title/subtitle taken verbatim from the
         handoff's own `title`/`subtitle`. No `source`/adapted-from line — this
         is an original essay, not a book adaptation.
      3. `summary` and `description` are the author's own (from the handoff front
         matter), used verbatim — no `DRAFT COPY` marker on them. Only the short
         landing-page blurb body is Claude-composed (condensed from the author's
         summary) and carries the usual `<!-- DRAFT COPY -->` marker.
      4. Resources label converts the subtitle's em-dash to a comma and
         title-cases it, matching the "Love the Sinner…" listing convention.
      5. Build note (environment, not content): WeasyPrint's native libs aren't
         loadable under the SIP-stripped system `python3`; both `brand_handout.py`
         and `gen_essays_og.py` were run with `/opt/homebrew/bin/python3.12`,
         which has the deps and honors the library path.
      Templates `layouts/essays/{single,list}.html`; OG wiring in
      `layouts/partials/head.html` (article type + `static/og/essays/<slug>.png`);
      cards generated by `scripts/gen_essays_og.py` (reuses the Greek/dispensationalism
      house style — paper ground, hairline frame, Cardo, rubric eyebrow, byline).
      The Resources "Essays" group now links to these pages instead of straight to
      the PDFs (adds one click before download; revert to direct-PDF links if
      preferred). **Copy needing review:** every landing-page blurb and meta
      `description` is Claude-drafted (flagged `<!-- DRAFT COPY -->`), plus the
      index intro and eyebrows "Free to read and share". The
      `confessional-lutheran-defense` and `love-the-sinner-hate-the-sin` blurbs
      were drafted from the full essay text; the `the-leaderboard`,
      `two-kingdoms-one-lord`, and `no-one-takes-this-honor` blurbs were drafted
      from their subtitles + the notes above (those three PDFs were not re-read),
      so check them for mischaracterization. Titles/subtitles/eyebrows on the cards
      and pages are verbatim from the existing PDF covers, not new judgments.

- [ ] "Held, Not Holding" essay — author-supplied text (2026-07-03 handoff),
      not Claude-drafted. Built in the established Essays pattern: branded PDF via
      `scripts/brand_handout.py` (`--src` the .md, `--drop 0`, `--kicker "Essay"`;
      the H1 title / H3 subtitle / leading `---` were stripped from the body since
      the cover renders the title block, and the Philippians 1:6 epigraph was kept
      as the opening line) → `static/downloads/essays/held-not-holding.pdf` (7pp);
      landing page `content/essays/held-not-holding.md`; OG card via
      `scripts/gen_essays_og.py` → `static/og/essays/held-not-holding.png`; and a
      Resources "Essays" listing. **Copy needing review (Claude-composed):**
      1. Eyebrow "On the Perseverance of the Saints" (topical label matching the
         existing "On …" pattern). Title/subtitle taken verbatim from the essay.
      2. `summary`, `description`, and the landing-page blurb body are all
         Claude-drafted from the full essay text (flagged in front matter / with
         `<!-- DRAFT COPY -->`). No `source`/adapted-from line — original essay.
      3. Resources label converts the subtitle's em-dash pattern, matching the
         listing convention.

- [ ] Three Q&A entries deep-linking to the essay (2026-07-03) — bodies and
      `summary` lines are author-supplied (verbatim, not draft copy); only each
      `description` meta line is Claude-drafted (flagged `# DRAFT COPY`).
      `content/questions/{can-a-true-believer-fall-away,is-preservation-synergistic,
      how-can-i-be-sure-my-faith-will-last}.md`. Judgment calls, made with Larry
      via AskUserQuestion (categories) / by convention (rest):
      1. The handoff labeled two entries "Election & Predestination" and "Grace,
         Faith & Salvation" (categories that don't exist); folded both into the
         existing **Soteriology** bucket per Larry's choice, matching the sibling
         `can-a-christian-lose-their-salvation`. The third stays "Pastoral &
         Existential" (already a real category).
      2. `deep_link` pointed at `/held-not-holding/`; corrected to the canonical
         essay URL `/essays/held-not-holding/`.
      3. Titles derived from each question; `date: 2026-07-03`, `draft: false`;
         inline-array `tags`/`refs` reformatted to the house block-list style.

- [ ] Six essays — author-supplied text (2026-07-04 handoff), not Claude-drafted.
      Each arrived with the same blog/CMS-shaped front matter as prior handoffs
      (`title`, `date`, `description`, `summary`, `categories`, `tags`,
      `scripture_refs`, `confession_refs`, `imprint`) and no in-body title block,
      so each was built in the established Essays pattern: a branded PDF via
      `scripts/brand_handout.py` (`--src` the .md, `--drop 0`, `--kicker "Essay"`,
      explicit `--title`/`--subtitle`/`--eyebrow`) → `static/downloads/essays/<slug>.pdf`
      (4–5pp each); a thin landing page `content/essays/<slug>.md`; an OG card via
      `scripts/gen_essays_og.py` → `static/og/essays/<slug>.png`; and a Resources
      "Essays" listing. Slugs (from the handoff's own deep-link targets):
      `law-and-gospel`, `theology-of-the-cross`, `real-presence`, `sola-scriptura`,
      `the-antichrist`, `lutherans-and-other-protestants`.
      **Copy needing review — Claude judgment calls:**
      1. Each handoff `title` carried a "Main Title: Subtitle" (or "Question?
         Subtitle") string; split into landing-page/cover `title` + `subtitle` on
         the first colon (or the "?"). Split is verbatim, no rewording.
      2. Eyebrows are Claude-chosen topical labels matching the existing "On …"
         pattern: "On Law and Gospel", "On the Theology of the Cross", "On the
         Lord's Supper" (real-presence — shares the label with the-proof-of-the-cup),
         "On Sola Scriptura", "On the Antichrist", "On the Means of Grace"
         (lutherans-and-other-protestants — labels the essay's thesis, not the title).
      3. `summary` and `description` are the author's own (from the handoff front
         matter), used verbatim — no `DRAFT COPY` marker on them. Only the short
         landing-page blurb body is Claude-composed (condensed from the author's
         summary/opening) and carries the usual `<!-- DRAFT COPY -->` marker.
      4. `draft` was already `false` in the handoffs; published as-is. No
         `source`/adapted-from line — these are original essays.
      5. Resources labels are `Title — Subtitle`, matching the listing convention.
      6. Build note (environment, not content): `brand_handout.py` and
         `gen_essays_og.py` were run with `/opt/homebrew/bin/python3.12` +
         `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib` (WeasyPrint/Pango deps).

- [ ] Six Question `deep_link` retargets (2026-07-04) — the only change per file
      is the `deep_link` line, now pointing each source question at its new essay
      (the handoff's operative change; other front matter left as-is):
      `what-is-the-difference-between-law-and-gospel` → `/essays/law-and-gospel/`
      (was the Distinguishing Law & Gospel position paper);
      `what-is-the-theology-of-the-cross` → `/essays/theology-of-the-cross/`
      (was `/books/worthy-is-the-lamb/`);
      `is-christ-really-present-in-communion` → `/essays/real-presence/`
      (was the Lord's Supper position paper);
      `what-is-sola-scriptura` → `/essays/sola-scriptura/` (was empty — now has a
      "Go deeper" target);
      `who-or-what-is-the-antichrist` → `/essays/the-antichrist/`
      (was `/dispensationalism/`);
      `how-are-lutherans-different-from-other-protestants` →
      `/essays/lutherans-and-other-protestants/` (was the confessional-Lutheran
      position paper). Not draft copy; flag if you'd rather a question kept its
      prior "Go deeper" target instead of the essay.

## Questions (new section, added 2026-07-01)

New content type: `content/questions/` (one page per question, grouped by
`category` on the `/questions/` index), a new nav item "Questions", and a new
`QAPage`/`Question`/`Answer` JSON-LD block in `seo-jsonld.html` for single
question pages. Design decisions (nav label "Questions" at `/questions/`,
grouped-by-category display, kept separate from — cross-linking only to — the
existing dispensationalism study library/articles) were made with Larry via
AskUserQuestion before building. New template layouts (`layouts/questions/`)
and DESIGN.md §7.11 are implementation, not draft copy.

- [ ] Index intro + eyebrow — `content/questions/_index.md` (marked
      `<!-- DRAFT COPY -->` in the body) and the eyebrow in
      `layouts/questions/list.html` (template-level, not front matter).
      2026-07-01: the original eyebrow "Ask a confessional Lutheran pastor"
      was REPLACED with "Confessional Lutheran answers" — Larry is a layman
      (content/about.md), so the pastoral framing was factually wrong, as an
      outside reviewer also flagged. The replacement wording is still
      Claude's; review it. (Correction to this entry's earlier text:
      `single.html` never carried the eyebrow — its eyebrow is the question's
      `category`.)
- [ ] Meta descriptions on all 184 question pages — `description:` front
      matter added 2026-07-01 (each ≤155 chars, condensed answer-first from
      that page's own `summary`; each file carries a `# DRAFT COPY` comment
      above the field). They surface only in search snippets and og/twitter
      descriptions, never on the page. Spot-check a handful for voice.
- [x] "What Is Dispensationalism?" and "Why Can't Women Be Pastors?" — the
      question/answer prose itself is Larry's own text (2026-07-01 handoff),
      not Claude-drafted. Two substantive edits were made to the
      dispensationalism one, both worth Larry's sign-off:
      1. `deep_link` was corrected from `/series/dispensationalism-and-american-evangelicalism/`
         (a URL that doesn't exist on this site — no `/series/` path, and no
         page by that slug) to `/dispensationalism/` (the actual field-guide
         pillar page, which is what the site's other cross-links to this
         topic already point at).
      2. The body's closing `---` + "**Going deeper:**" paragraph was removed,
         since `deep_link` now renders as a templated "Go deeper →" link
         automatically (leaving both in would have shown two near-identical
         CTAs back to back).
      `content/questions/what-is-dispensationalism.md`,
      `content/questions/why-cant-women-be-pastors.md`.
- [x] "Why Do Bad Things Happen to Good People?" — Larry's own text
      (2026-07-01 handoff), no edits needed. Two Claude judgment calls, both
      discussed with and confirmed by Larry: recategorized from "Suffering &
      Providence" to "Pastoral & Existential" (a category now designed in
      per DESIGN.md §7.11 for pastoral-care questions alongside doctrinal
      ones), and `deep_link` set to `/books/thorn/` — THORN's central text is
      2 Corinthians 12 ("My grace is sufficient for you"), the same passage
      and the same power-in-weakness theology of the cross this question
      lands on, though THORN's own frame is narrower (besetting sin) than
      this question's (general theodicy). `content/questions/why-do-bad-things-happen-to-good-people.md`.
- [x] Nine questions added 2026-07-01 (zip handoff) — Larry's own text, no
      edits needed to the prose. `can-a-christian-lose-their-salvation`,
      `do-i-need-a-conversion-experience`, `does-baptism-actually-save`,
      `how-can-i-be-sure-im-saved`, `is-christ-really-present-in-communion`,
      `what-is-the-difference-between-law-and-gospel`,
      `what-is-the-office-of-the-keys`, `where-do-people-go-when-they-die`,
      `why-does-god-feel-absent` (all in `content/questions/`). One Claude
      judgment call: four of the nine had an existing position paper that is
      an exact, unambiguous topical match (not an interpretive stretch like
      THORN above), so `deep_link` was set to point at each — verified all
      four PDFs exist and resolve in the built `public/`:
      - does-baptism-actually-save → `/downloads/papers/holy-baptism.pdf`
      - is-christ-really-present-in-communion → `/downloads/papers/lords-supper.pdf`
      - what-is-the-office-of-the-keys → `/downloads/papers/confession-and-absolution.pdf`
      - what-is-the-difference-between-law-and-gospel → `/downloads/papers/distinguishing-law-and-gospel.pdf`
      The remaining five (`can-a-christian-lose-their-salvation`,
      `do-i-need-a-conversion-experience`, `how-can-i-be-sure-im-saved`,
      `where-do-people-go-when-they-die`, `why-does-god-feel-absent`) had no
      similarly unambiguous match, so `deep_link` was left empty as authored
      rather than guessed at.
- [ ] Thirteen more questions added 2026-07-01 (second zip handoff) — Larry's
      own text, no edits needed to the prose. `do-i-have-free-will-to-choose-god`,
      `do-i-have-to-go-to-church`, `does-god-still-love-me-after-what-ive-done`,
      `is-hell-real-and-eternal`, `what-do-lutherans-believe-about-the-end-times`,
      `what-does-justification-by-faith-alone-mean`,
      `what-if-my-faith-feels-too-weak`, `what-is-a-sacrament`,
      `what-is-the-church`, `what-is-the-priesthood-of-all-believers`,
      `what-is-the-rapture`, `why-do-i-still-sin-if-im-a-christian`,
      `why-do-lutherans-baptize-babies` (all in `content/questions/`). Now 25
      questions across the same 5 categories (Eschatology 4, Pastoral &
      Existential 6, Sacraments 5, Soteriology 6, The Church & Ministry 4).
      Claude judgment calls:
      1. `what-is-the-rapture` shipped with the identical broken `deep_link`
         bug as `what-is-dispensationalism` before it —
         `/series/dispensationalism-and-american-evangelicalism/`, a URL that
         doesn't exist — corrected to `/dispensationalism/`.
      2. Two unambiguous new `deep_link`s, same rule as the batch above (exact
         topical match, not interpretive): `why-do-lutherans-baptize-babies`
         → `/downloads/papers/holy-baptism.pdf`; `what-do-lutherans-believe-about-the-end-times`
         → `/dispensationalism/` (the field guide's own scope is explicitly
         "the rapture, the millennium, Israel and the Church" — i.e. this
         question). Both verified to resolve in the built `public/`.
      3. `does-god-still-love-me-after-what-ive-done` → `/downloads/papers/confession-and-absolution.pdf`
         and `why-do-i-still-sin-if-im-a-christian` → `/books/thorn/` — flagged
         above as thematic (not exact-title) matches; Larry confirmed both on
         2026-07-01. Verified to resolve in the built `public/`.
- [ ] Twenty-five more questions added 2026-07-01 (third zip handoff) — Larry's
      own text, no edits needed to the prose. `are-there-contradictions-in-the-bible`,
      `can-i-trust-the-bible`, `do-good-works-matter`,
      `do-i-have-to-be-worthy-to-receive-communion`, `does-god-choose-who-is-saved`,
      `does-god-exist`, `does-my-ordinary-work-matter-to-god`,
      `doesnt-science-disprove-god`, `how-do-i-deal-with-worry-and-anxiety`,
      `how-do-i-forgive-someone-who-hurt-me`, `how-should-i-interpret-the-bible`,
      `is-jesus-god`, `is-jesus-the-only-way-to-god`,
      `isnt-faith-just-believing-without-evidence`, `what-does-the-bible-say-about-money`,
      `what-is-sola-scriptura`, `what-is-the-church-year`, `what-is-the-millennium`,
      `what-is-the-trinity`, `who-is-the-holy-spirit`, `why-did-jesus-have-to-die`,
      `why-do-i-need-to-be-saved`, `why-do-lutherans-worship-with-liturgy`,
      `why-doesnt-god-answer-my-prayers`, `why-pray-if-god-already-knows` (all in
      `content/questions/`). Introduces 5 new categories alongside the existing
      5 (no template changes needed — categories are freeform, grouped by
      `.GroupByParam`): Apologetics (3), Christian Life & Vocation (5), God,
      Christ & the Trinity (5), Scripture & Authority (4), Worship & Practice
      (2). Now 50 questions across 10 categories. Claude judgment calls:
      1. `what-is-the-millennium` shipped with the same broken `deep_link` bug
         a third time (`/series/dispensationalism-and-american-evangelicalism/`)
         — corrected, and pointed more precisely than the earlier two fixes:
         since this question is specifically about the millennium (not the
         rapture or end times generally), it goes to the matching spoke,
         `/dispensationalism/augsburg-confession-xvii-millennium/`, rather
         than the pillar.
      2. Two files — `do-i-have-to-be-worthy-to-receive-communion` and
         `why-do-lutherans-worship-with-liturgy` — shipped with `deep_link`
         and `summary` missing from front matter entirely (every other
         question in all three handoffs has both). Both fields were restored
         for parity: `summary` drafted from the file's own body text (needs
         Larry's sign-off, same as any Claude-drafted copy); `deep_link` set
         to `""` on both, pending the calls below.
      3. One unambiguous `deep_link` (exact topical match, same rule as
         before): `do-i-have-to-be-worthy-to-receive-communion` →
         `/downloads/papers/lords-supper.pdf` (same paper already linked from
         `is-christ-really-present-in-communion`).
      4. `why-do-lutherans-worship-with-liturgy` → `/books/the-hollow-altar/`
         and `how-should-i-interpret-the-bible` → `/books/what-horse/` —
         flagged above as thematic (not exact-title) matches; Larry confirmed
         both on 2026-07-01. Verified to resolve in the built `public/`.
- [ ] Ninety-five more questions added 2026-07-01 (fourth zip handoff) —
      Larry's own text, no edits needed to the prose. Grows `/questions/` from
      50 to 145 entries across 12 categories (2 new: "Angels, Demons & the
      Unseen," "Marriage, Sexuality & Family"). File list: run
      `git show --stat` on this commit — too many to enumerate here (all in
      `content/questions/`). Claude judgment calls:
      1. `is-jesus-coming-soon` shipped with the same broken `deep_link` bug a
         fourth time (`/series/dispensationalism-and-american-evangelicalism/`)
         — corrected to `/dispensationalism/` (general pillar, matching the
         earlier "what-do-lutherans-believe-about-the-end-times" fix, since
         this question is about timing/imminence generally).
      2. **72 of the 95 files** shipped with `deep_link` and `summary` missing
         from front matter entirely — a much larger version of the two-file
         gap in the second batch. Both fields restored on all 72 for parity;
         every `summary` is drafted from that file's own body text (concise,
         one-paragraph, matching the site's established voice) and needs
         Larry's sign-off, same as any Claude-drafted copy. `deep_link` was
         left `""` on all 72 except the six exact matches below — no thematic
         guesses were forced at this scale.
      3. Six unambiguous `deep_link`s wired (same exact-topical-match rule as
         every prior batch): `do-i-need-to-be-baptized-to-be-saved`,
         `is-my-baptism-valid-should-i-be-rebaptized`, and
         `why-do-lutherans-baptize-by-pouring` → `/downloads/papers/holy-baptism.pdf`;
         `do-lutherans-believe-in-transubstantiation` and
         `how-often-should-i-take-communion` → `/downloads/papers/lords-supper.pdf`;
         `what-is-private-confession` → `/downloads/papers/confession-and-absolution.pdf`.
         All six verified to resolve in the built `public/`.
      4. Two borderline candidates were considered but *not* wired (left `""`
         like the rest, no COPY-REVIEW flag needed since they're not live
         yet): `can-infants-have-faith` (adjacent to, but not the same
         question as, the Holy Baptism paper) and `why-do-we-need-creeds-and-confessions`
         (adjacent to, but broader than, "What It Means to Be Confessional
         Lutheran"). Mention if you'd like either wired.
- [ ] **Separately discovered while reviewing the above**: fourteen questions
      from the *third* zip batch (commit `eddd77d`, "twenty-five more
      questions") were published missing `deep_link`/`summary` entirely, and
      this was missed at the time — a gap in that review, not a new issue.
      Fixed in the same pass as a distinct commit: `do-good-works-matter`,
      `does-god-exist`, `does-my-ordinary-work-matter-to-god`,
      `doesnt-science-disprove-god`, `how-do-i-forgive-someone-who-hurt-me`,
      `is-jesus-god`, `is-jesus-the-only-way-to-god`,
      `what-does-the-bible-say-about-money`, `what-is-the-church-year`,
      `what-is-the-trinity`, `who-is-the-holy-spirit`,
      `why-did-jesus-have-to-die`, `why-do-i-need-to-be-saved`,
      `why-pray-if-god-already-knows`. Summaries drafted from each file's own
      body text, same as above; no exact-match `deep_link` candidates found
      among these fourteen.
- [x] Go-Deeper link expansion (2026-07-01) — Larry asked which unlinked
      questions could point at an existing resource; wired 25 (Go-Deeper
      coverage 22 → 47 of 145). All targets verified to resolve in `public/`.
      Tier A (same-subject, extends conventions already live):
      `can-infants-have-faith`→Holy Baptism paper; `how-do-i-deal-with-guilt-and-shame`
      & `how-do-i-forgive-myself`→Confession & Absolution paper;
      `what-are-the-ten-commandments-for`→Law & Gospel paper;
      `how-do-i-stop-a-sin-i-keep-repeating`→THORN;
      `should-christians-be-involved-in-politics`→Two Kingdoms essay;
      `what-is-a-pastor`→No One Takes This Honor essay;
      `why-do-lutherans-sing-hymns`→The Leaderboard essay;
      `can-i-trust-the-bible` & `how-did-we-get-the-bible`→Ad Fontes;
      `where-do-people-go-when-they-die`→With These Words;
      `what-is-the-final-judgment` & `what-is-heaven-like`→Worthy Is the Lamb;
      `what-does-justification-by-faith-alone-mean`→The Purest Gospel.
      Tier B (genuine but a judgment call, Larry approved): `do-good-works-matter`
      →No Other Gospel; `what-is-the-gospel` & `why-do-i-need-to-be-saved`
      →The Purest Gospel; `what-is-the-resurrection-of-the-body` &
      `im-afraid-of-dying`→With These Words; `is-hell-real-and-eternal`→Worthy Is the Lamb;
      `why-do-catholic-bibles-have-extra-books`→Ad Fontes: Old Testament;
      `does-the-bible-have-errors`→Ad Fontes; `do-i-need-a-conversion-experience`
      →Non-Lutheran Assumptions paper; `why-cant-women-be-pastors`→No One Takes
      This Honor essay; `whats-the-difference-between-lutherans-and-catholics`
      →What It Means to Be Confessional Lutheran paper. (The optional Greek-Explorer
      links for definitional soteriology questions were offered but not wired.)
- [ ] Thirty more questions added 2026-07-01 (individual-file handoff) — Larry's
      own text, no edits to the prose. 26 of the 30 shipped without `deep_link`
      and `summary` (same gap as prior batches); both fields backfilled —
      summaries drafted from each file's own body (Claude copy, review for
      voice/accuracy). New questions span Christian Life & Vocation (the Ten
      Commandments and Lord's Prayer catechism expositions), Worship & Practice,
      The Church & Ministry (the Baptist/Calvinist/Protestant comparisons),
      Soteriology, and pastoral care. Larry asked me to run a Go-Deeper search
      and link what fits; 8 wired (coverage 47→55 of 175), all verified to
      resolve in `public/`, all extending conventions already live:
      `do-i-need-to-accept-jesus-into-my-heart`→Non-Lutheran Assumptions paper
      (decision theology); `how-do-i-overcome-pornography` &
      `what-does-saint-and-sinner-at-the-same-time-mean`→THORN (besetting sin /
      *simul iustus et peccator*, both named in THORN's own blurb);
      `is-contemporary-worship-wrong`→The Leaderboard essay;
      `is-the-lords-supper-just-a-symbol`→Lord's Supper paper;
      `what-is-confession-and-absolution-in-the-service`→Confession & Absolution
      paper; `whats-the-difference-between-lutherans-and-baptists`→Holy Baptism
      paper; `how-are-lutherans-different-from-other-protestants`→What It Means
      to Be Confessional Lutheran paper. The catechism expositions (individual
      commandments, Lord's Prayer petitions, Creed articles) were left unlinked —
      the site has no catechism resource, so no honest match.
      `what-is-the-theology-of-the-cross` → `/books/worthy-is-the-lamb/` (the
      Revelation commentary explicitly centers the theology of the cross) — first
      flagged as oblique, then Larry confirmed 2026-07-01; now wired (coverage
      56/175). Verified to resolve.
- [ ] Theological-audit intake, 15 files (2026-07-01 zip handoff; Fable 5 audit
      results, Larry's text) — 12 updates + 3 new questions
      (`what-does-the-bible-say-about-gender-identity`,
      `what-does-the-bible-say-about-homosexuality`,
      `who-or-what-is-the-antichrist`; now 178 questions). Audit corrections
      applied as delivered: confession refs fixed/added (AC XXVI/XXVIII,
      AC II, Apology XIII, FC VIII, FC IX, Smalcald II.II), body-theology
      revisions (hell traced to human rejection with the Lutheran asymmetry;
      "never heard" perishing traced to inborn sin, not merely suppressed
      information; hiddenness re-grounded in faith-by-hearing rather than the
      coerced-love argument; new right-hand/ubiquity paragraph on
      `where-is-jesus-now`), `is-the-lords-supper-just-a-symbol` recategorized
      to Sacraments, and `what-is-the-office-of-the-keys` retitled to match
      its slug (was "What Is Confession and Absolution?", which collided with
      the separate in-the-service question). Claude judgment calls in the merge:
      1. The handoff was exported from a pre-2026-07-01 snapshot, so the
         backfilled `summary`/`description` fields and four Larry-approved
         `deep_link` wirings (THORN ×2, Lord's Supper paper, Confession &
         Absolution paper) were missing/empty in it — all preserved from the
         repo rather than reverted.
      2. `who-or-what-is-the-antichrist` shipped the recurring broken
         `/series/dispensationalism-and-american-evangelicalism/` deep_link
         (fifth batch in a row) — corrected to `/dispensationalism/`,
         matching every prior fix. Verified to resolve.
      3. `why-doesnt-god-make-himself-more-obvious`: the old Claude summary/
         description leaned on the coerced-love argument the audit removed —
         both re-derived to match the audited body (faith comes by hearing).
      4. New Claude meta descriptions for the three new questions (≤155 chars,
         from each file's own summary). The two sexuality questions were left
         with `deep_link: ""` — the site has no matching resource; no guess
         forced.
- [ ] One more question added 2026-07-02 (individual-file handoff) —
      `should-a-christian-be-cremated` (category Christian Life & Vocation;
      now 179 questions). Larry's own text, body unedited. Claude judgment
      calls in the intake:
      1. The handoff carried only the content fields; the house-style
         `title`/`date`/`draft` were added ("Should a Christian Be Buried or
         Cremated?", 2026-07-02, draft:false), and `category` was normalized
         from "Christian Life" to the taxonomy's "Christian Life & Vocation".
      2. New Claude meta `description` (154 chars, condensed from Larry's own
         summary) — review for voice.
      3. `deep_link` left `""` as delivered. Candidate not wired: *With These
         Words* is the resurrection-of-the-body book (already the target for
         `what-is-the-resurrection-of-the-body`, `im-afraid-of-dying`,
         `where-do-people-go-when-they-die`), but this question is really
         about burial *practice* / adiaphora, not the resurrection doctrine —
         a thematic stretch, not an exact match. Say the word and I'll wire it.
- [ ] One more question added 2026-07-03 (individual-file handoff) —
      `does-the-lords-supper-require-wine-with-alcohol` (category Sacraments;
      now 180 questions). Larry's own text, body unedited. Claude judgment
      calls in the intake:
      1. The handoff carried only the content fields; the house-style
         `title`/`date`/`draft` were added ("Does the Lord's Supper Require
         Wine With Alcohol?", 2026-07-03, draft:false).
      2. `confession_refs` normalized to the site's naming style: "Small
         Catechism VI (The Sacrament of the Altar)" → "Small Catechism, The
         Sacrament of the Altar"; "Large Catechism V.9-10" → "Large Catechism,
         The Sacrament of the Altar" (first Large Catechism ref on the site;
         the body cites it explicitly); "Augsburg Confession X" kept as-is.
      3. `tags` lowercased to match the inline-array convention used across
         `content/questions/`.
      4. New Claude meta `description` (150 chars, condensed from Larry's own
         summary) — review for voice.
      5. `deep_link` wired to `/downloads/papers/lords-supper.pdf` (delivered
         empty). Exact-topical match, same convention as the other Supper
         questions already pointing there (`is-the-lords-supper-just-a-symbol`,
         `how-often-should-i-take-communion`,
         `do-lutherans-believe-in-transubstantiation`). Verified to resolve.

## Other pages

- [ ] Studies index intro — `content/studies/_index.md`
- [x] Newsletter pitch and landing-page framing — `content/newsletter.md`,
      `layouts/_default/newsletter.html` (+ privacy note in template).
      2026-07-01: trimmed the draft paragraph's closing "No noise, no funnels;
      just a letter worth reading." — it duplicated the Larry-approved
      form-pitch rendered directly beneath it ("…No noise. No outrage
      cycle…"). The approved pitch now carries that positioning alone.
      2026-08-17: expanded the landing page with a three-point "What arrives"
      promise, a two-column signup composition, and "Read before you
      subscribe" framing. The three example essays are resolved from their
      existing pages by slug, so their titles and summaries are not duplicated
      here. The expanded pitch, section labels, representative readings, and
      privacy note were APPROVED by Larry 2026-08-17; DRAFT markers removed.
- [x] Newsletter value-promise near the form — `layouts/_default/newsletter.html`
      ("Get one weekly confessional Lutheran letter for lay teachers, Bible
      readers, and weary evangelicals. No noise. No outrage cycle…"). Added
      2026-06-29 verbatim from Larry's suggestion; APPROVED by Larry 2026-06-29.
- [ ] Resources intro, metadata, "Free library" eyebrow, and group
      blurbs/outros — `content/resources.md`,
      `layouts/_default/resources.html`. Reorganized 2026-08-17 into five
      sections: free studies and commentaries; Teacher's Guides and class
      materials; online study and reference tools; position papers; and recent
      essays. The free-study titles now come from book front matter, while the
      essays remain a five-item, newest-first preview generated from
      `content/essays/`; `/essays/` is the canonical complete archive.
- [ ] Resources dispensationalism doorway wording — `content/resources.md`.
      Updated 2026-08-17 so Resources points to the canonical study library
      instead of duplicating the six handouts. The course framing now lives in
      `content/dispensationalism/_index.md` and is tracked above.
- [x] Bio — Larry's own copy (2026-06-10).
- [x] Speaking & interviews — `content/about.md`. Expanded 2026-08-17 from its original
      one-line availability note into a five-topic list grounded in Larry's
      published books and resources. APPROVED by Larry 2026-08-17; DRAFT marker
      removed.
- [ ] About: Music paragraph is Larry's own copy (2026-06-10) — approved.
      Still draft: the photo caption ("Holding down the low end.") and the
      "Before the books" teaser's surrounding sentences — `content/about.md`.
- [x] About: method/rigor paragraph (after the bio) — Claude-drafted 2026-07-11
      from the outside reviewer's suggestion (developed from Scripture, the
      Confessions, and the primary sources cited in each work). APPROVED by Larry
      2026-07-11. `content/about.md`.
- [x] About: "Before the books" reworked 2026-07-11 (outside reviewer) — the
      freelance-technology enumeration was replaced with a focused pointer to
      **Herzog Enclave** (`https://herzogenclave.com`), framed as "data protection
      and private AI," with professional inquiries routed there rather than the
      author email. APPROVED by Larry 2026-07-11. `content/about.md`.
- [ ] 404 copy — `layouts/404.html`
- [ ] Newsletter band one-liner — `layouts/partials/newsletter-band.html`
- [ ] Triptych panel labels/CTAs — template-level, `layouts/index.html`
- [ ] Series-page free-materials pitch line — `layouts/studies/series.html`
      ("These are free. If they serve your congregation…")

## "Start here" doorways (added 2026-07-03, outside-reviewer request)

Two curated front-door blocks added above long list pages, both data-driven
(front matter, not hardcoded template titles). No new CSS — reuse existing
`.series-row`/`.download-list` patterns. The linked destinations are all real,
pre-existing pages/PDFs (nothing fabricated).

- [ ] Resources "Start with these" cues — `content/resources.md` front matter
      `start_here` (4 items, each `<!-- DRAFT COPY -->` in
      `layouts/_default/resources.html`). The cue wording ("New to confessional
      Lutheranism?", "Teaching an adult class?", "Untangling dispensationalism?",
      "Want Greek helps?") is Claude's; review for voice. Links → the
      confessional-Lutheran paper PDF, `/studies/`, `/dispensationalism/`,
      `/greek/`.
- [x] Questions "Popular starting points" — `content/questions/_index.md` front
      matter `popular` (6 question slugs, order = display order) rendered by
      `layouts/questions/list.html`. Heading is a plain UI label; the listed
      titles/summaries are the questions' own existing (separately reviewed)
      copy, so no new pastoral copy here — only the editorial selection is
      Claude's. Selection: does-god-exist, where-should-i-start-reading-the-bible,
      does-baptism-actually-save, whats-the-difference-between-lutherans-and-baptists,
      what-do-lutherans-believe-about-the-end-times, how-do-i-stop-a-sin-i-keep-repeating.

## "Double Honor" essay + Q&A (added 2026-07-05)

- [ ] "Double Honor: What a Congregation Owes Its Pastor" essay — author-supplied
      text (2026-07-05 handoff), not Claude-drafted. Arrived with blog/CMS-shaped
      front matter (`category`, `tags`, `scripture_refs`, `confession_refs`,
      `summary`) that maps to no content type here, so it was built in the
      established Essays pattern: branded PDF via `scripts/brand_handout.py`
      (`--src` the .md, `--drop 0` since the title lives in front matter not the
      body, `--kicker "Essay"`) → `static/downloads/essays/double-honor.pdf`
      (5pp); thin landing page `content/essays/double-honor.md`; OG card via
      `scripts/gen_essays_og.py` → `static/og/essays/double-honor.png`; and a
      Resources "Essays" listing. **Copy needing review (Claude-composed):**
      1. Eyebrow "On the Support of the Ministry" (topical label matching the
         existing "On …" pattern). Title "Double Honor" / subtitle "What a
         Congregation Owes Its Pastor" taken verbatim from the essay's own title.
      2. `summary` is the author's own (verbatim, from the handoff front matter).
         The landing-page `description` (meta) and blurb body are Claude-drafted
         from the full essay text (flagged `# DRAFT COPY` / `<!-- DRAFT COPY -->`).
      3. Resources label converts the title's colon to an em-dash, matching the
         listing convention. No `source`/adapted-from line — original essay.
- [ ] Q&A "How Much Should a Pastor Make?" — `content/questions/how-much-should-a-pastor-make.md`,
      deep-links to `/essays/double-honor/`. Body, `question`, and `summary` are
      author-supplied (verbatim, not draft copy). Category "The Church & Ministry"
      and tags taken from the handoff (both pre-existing on the site, cf.
      `what-is-a-pastor`). Only the `description` meta line is Claude-drafted
      (flagged `# DRAFT COPY`).

## "The Text the Church Copied for a Thousand Years" essay (added 2026-07-12)

- [ ] Essay adapted from Chapter 13 of *Ad Fontes: Textual Criticism for
      Lutheran Laity* — author-supplied text (`Dropbox/Essays/the-text-the-church-copied.md`),
      not Claude-drafted. Built in the established Essays pattern, mirroring
      "The Leaderboard" (the other adapted-from-a-book essay): branded PDF via
      `scripts/brand_handout.py` (`--src` the sliced body — intro paragraph
      through the closing prayer, with the title/subtitle/attribution top-matter
      and the duplicate trailing attribution stripped; `--drop 0`, `--kicker
      "Essay"`, `--source` the adapted-from line) → `static/downloads/essays/the-text-the-church-copied.pdf`
      (8pp); thin landing page `content/essays/the-text-the-church-copied.md`;
      OG card via `scripts/gen_essays_og.py` → `static/og/essays/the-text-the-church-copied.png`.
      Appears on `/essays/` automatically and in the Resources newest-five
      preview whenever its publication date places it there; **no**
      book→essay cross-link on the Ad Fontes page (matching precedent: the Hollow
      Altar page does not link to "The Leaderboard"). **Copy needing review
      (Claude-composed):**
      1. Title and subtitle taken verbatim from the essay's own H1/H3 (subtitle =
         "The Majority Text Position, Fairly Presented — and Why I Do Not Finally
         Hold It", the chapter title). Eyebrow "On the Majority Text" (topical
         label matching the existing "On …" pattern).
      2. `source`/adapted-from line composed to name the chapter, mirroring "The
         Leaderboard": "Adapted from Chapter 13, "The Majority Text Position,
         Fairly Presented," of *Ad Fontes: Textual Criticism for Lutheran Laity*."
      3. `summary`, `description` (meta), and the landing-page blurb body are all
         Claude-drafted from the full essay text (flagged `# DRAFT COPY` /
         `<!-- DRAFT COPY -->`). The blurb leans on the essay's own opening and its
         "unpersuasive, not unserious" verdict line.
      4. Resources discoverability now comes from the automatic newest-five
         preview; no per-essay label is maintained in `content/resources.md`.
      5. **Ordinary Means announcement — Claude-drafted, UNPUBLISHED beehiiv draft**
         (`post_efe26949-38ba-4478-8639-0b4e9eef82bb`; editor:
         app.beehiiv.com/posts/efe26949-38ba-4478-8639-0b4e9eef82bb/edit).
         A newsletter-length teaser in the house "essay-as-newsletter" style,
         mirroring "The Ledger Knows What We Sing": italic adapted-from lead,
         the essay's argument in Larry's first person (adapted faithfully from
         the essay text — no invented claims), `<hr>`, then the standard 👉 CTA
         block linking the essay page + the Ad Fontes book, and the boilerplate
         subscribe footer. Built with the **"Ordinary Means — Site Style"** post
         template applied (theme/sender/header/footer), author byline = Larry,
         top social share, link tracking on, free+premium on both channels, SEO
         titles set. Tags "Ad Fontes" + "Textual Criticism" (both newly created).
         Not scheduled. Needs Larry's review + manual promote. NOTE: a first,
         template-less draft (`post_338408d6-...`) was superseded by this one and
         should be deleted in the beehiiv UI (the API cannot delete drafts).
      6. Social share art (brand OG treatment, newsletter byline), generated by
         `scripts/gen_newsletter_card.py` → `static/og/newsletter/the-text-the-church-copied.png`
         (1200×630 social card) and `…-thumb.png` (1600×900 wide thumbnail).
         Not yet attached to the beehiiv post — beehiiv ingests images only from a
         public URL, so attach after deploy (URLs: larryherzogjr.com/og/newsletter/…)
         or by drag-drop in the editor.

## Questions topic pages (added 2026-07-13)

- [ ] Twelve structural topic hubs at `/questions/topics/<slug>/`, sourced from
      the existing approved `category` labels. Question titles, summaries, and
      counts are reused directly; no new theological or pastoral prose was
      written. Review the shared meta-description pattern in
      `layouts/partials/head.html`: “Browse confessional Lutheran answers in
      {topic} — Scripture first, with the Book of Concord close behind.”
- [ ] `/questions/topics/` directory meta description in
      `content/question-topics/_index.md`: “Browse confessional Lutheran answers
      by topic — from Scripture and the sacraments to vocation, suffering,
      apologetics, and the last things.” The on-page labels and count sentence
      are functional UI copy.

## "Depart, Unclean Spirit" essay (added 2026-07-15)

- [ ] "Depart, Unclean Spirit: What the Lutherans Lost at the Font" —
      author-supplied text (`/Users/lherzog/Downloads/depart-unclean-spirit.md`),
      not Codex-drafted. Built in the established Essays pattern: branded PDF
      via `scripts/brand_handout.py` (`--drop 0`, `--kicker "Essay"`) →
      `static/downloads/essays/depart-unclean-spirit.pdf` (8pp); thin landing
      page `content/essays/depart-unclean-spirit.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/depart-unclean-spirit.png`; and a Resources "Essays"
      listing. No new marketing or pastoral copy was drafted: the landing-page
      body and meta summary both use the author's supplied `summary` verbatim,
      and the eyebrow "The Sacraments" is the supplied `category` value.
      Judgment calls:
      1. Split the supplied colon title into title "Depart, Unclean Spirit" and
         subtitle "What the Lutherans Lost at the Font," with no rewording.
      2. Changed the handoff's `draft: true` to `draft: false`, treating "Add
         this essay to the website" as authorization to publish it.
      3. The source's tags and Scripture/Confession reference arrays were not
         copied to the thin landing-page front matter because the Essays content
         type does not render or index those fields.
      4. `scripts/brand_handout.py` now hides redundant Pandoc endnote backlink
         glyphs (which were unavailable in the embedded font subset) and uses
         compact endnote typography; the essay PDF was rendered page by page to
         verify the full text and all 14 sources without missing glyphs or an
         orphan source page.

## "The Wordless Book and the Baptized Child" essay (added 2026-07-23)

- [ ] "The Wordless Book and the Baptized Child: Why Child Evangelism
      Fellowship Cannot Be Made Lutheran" — author-supplied text
      (`/Users/lherzog/Library/CloudStorage/Dropbox/CEF/wordless-book-and-the-baptized-child.md`),
      not Codex-drafted. Built in the established Essays pattern: branded PDF
      via `scripts/brand_handout.py` (`--drop 0`, `--kicker "Essay"`) →
      `static/downloads/essays/wordless-book-and-the-baptized-child.pdf`
      (14pp); thin landing page
      `content/essays/wordless-book-and-the-baptized-child.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/wordless-book-and-the-baptized-child.png`; and a
      Resources "Essays" listing. No new marketing or pastoral copy was
      drafted: the landing-page body and meta summary both use the author's
      supplied `summary` verbatim, and the eyebrow "Children's Ministry" is the
      supplied `children's ministry` tag rendered in title case.
      Judgment calls:
      1. Changed the handoff's `draft: true` to `draft: false`, treating "Post
         the attached essay to the website" as authorization to publish it.
      2. The source's tags and Scripture/Confession reference arrays were not
         copied to the thin landing-page front matter because the Essays content
         type does not render or index those fields.
      Updated 2026-07-23 from Larry's revised source: the lay-teacher example
      was tightened, and the Sunday-school selection/accountability wording now
      names the Board of Deacons and the deacons' spiritual-care responsibility.
      Title, subtitle, summary, landing page, Resources listing, and OG card
      remain unchanged; the branded PDF remains 14pp.

## "You Are Egypt" essay (added 2026-07-23)

- [ ] "You Are Egypt: Why the Disney Princess critique lands — and why it
      lands somewhere other than the Lutheran confession" — author-supplied
      text
      (`/Users/lherzog/Library/CloudStorage/Dropbox/Essays/you-are-egypt.md`),
      not Codex-drafted. Built in the established Essays pattern: branded PDF
      via `scripts/brand_handout.py` (`--drop 0`, `--kicker "Essay"`) →
      `static/downloads/essays/you-are-egypt.pdf` (6pp); thin landing page
      `content/essays/you-are-egypt.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/you-are-egypt.png`; and a Resources "Essays" listing.
      No new marketing or pastoral copy was drafted: the landing-page body and
      meta summary reuse the author's sentences "The critique is sound. Where
      it goes wrong is in the diagnosis of the cause, and therefore in the
      prescription of the cure." verbatim.
      Judgment calls:
      1. Added the house-style publication fields `date: 2026-07-23` and
         `draft: false`, treating "Post this essay to the website" as
         authorization to publish it.
      2. Used "Confession and Absolution" as the eyebrow, drawn directly from
         the essay's terminology.
      3. Removed the source's title, subtitle, and opening rule from the PDF
         body because the branded cover supplies that material.

## "When the Answer Is “He Said It”" essay (added 2026-08-03)

- [ ] "When the Answer Is “He Said It”" — author-supplied text
      (`/Users/lherzog/Downloads/when-the-answer-is-he-said-it.md`), not
      Codex-drafted. Built in the established Essays pattern: branded PDF via
      `scripts/brand_handout.py` (`--drop 0`, `--kicker "Essay"`) →
      `static/downloads/essays/when-the-answer-is-he-said-it.pdf`; thin landing
      page `content/essays/when-the-answer-is-he-said-it.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/when-the-answer-is-he-said-it.png`; and the generated
      Resources "Essays" listing. No new marketing or pastoral copy was
      drafted: the summary and landing-page body use the author's supplied
      summary verbatim; the eyebrow uses the supplied category; and the
      subtitle is the first sentence of the supplied summary, title-cased.
      Judgment calls:
      1. Replaced the question-style `category` field with the essay-style
         `eyebrow`, and omitted `tags`, `scripture_refs`, and `confession_refs`,
         which are not part of the established thin essay landing-page schema.
      2. Added the house-style `date: 2026-08-03`, PDF path, and `draft: false`,
         treating "New essay for website" as authorization to publish it.

## "It Was Not an Enemy" essay (added and revised 2026-08-17)

- [ ] "It Was Not an Enemy: The wounds friends leave, the scars Christ kept,
      and the forgiveness he gave away" — author-supplied essay text
      (`/Users/lherzog/Downloads/it-was-not-an-enemy.md`), not Codex-drafted.
      Built in the established Essays pattern: branded PDF via
      `scripts/brand_handout.py` (`--drop 0`, `--kicker "Essay"`) →
      `static/downloads/essays/it-was-not-an-enemy.pdf`; thin landing page
      `content/essays/it-was-not-an-enemy.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/it-was-not-an-enemy.png`; and the generated Resources
      "Essays" listing. The title and full essay remain the author's supplied
      wording. At Larry's request, the subtitle, meta summary, and landing-page
      blurb were rewritten by Codex after reading the complete essay; all three
      are flagged as provisional draft copy in the content file. The revision
      follows the essay's movement from betrayal inside the circle, through
      Psalm 55, to Christ's retained scars, spoken peace, Supper, and
      forgiveness. Judgment calls:
      1. Changed the handoff's `draft: true` to `draft: false` and added the
         house-style publication date `2026-08-17`, treating "New essay for the
         website" as authorization to publish it.
      2. Used the existing essay label "On a Common Saying" as the eyebrow,
         matching the essay's stated subject without introducing a new topical
         category.
      3. Normalized the supplied `bible_version` key to the site's established
         `scripture_version` key while preserving the supplied value, `NET`.
      4. Rebuilt the branded PDF cover and dedicated OG card with the revised
         subtitle so every presentation of the essay remains consistent.

## "Mice from a Dirty Shirt" essay (added 2026-08-17)

- [ ] "Mice from a Dirty Shirt: Two thousand years of believing life makes
      itself, and one Frenchman with a bent glass neck" — author-supplied,
      original essay text (`/Users/lherzog/Downloads/mice-from-a-dirty-shirt.md`),
      not adapted from either related book and not Codex-drafted. Built in the
      established Essays pattern: branded PDF via `scripts/brand_handout.py`
      (`--drop 0`, `--kicker "Essay"`) →
      `static/downloads/essays/mice-from-a-dirty-shirt.pdf` (8pp); thin landing
      page `content/essays/mice-from-a-dirty-shirt.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/mice-from-a-dirty-shirt.png`; and the generated Essays
      archive / Resources newest-five listings. The author's title, subtitle,
      summary, tags, Scripture references, Confession references, and full
      argument are retained. Judgment calls and copy needing review:
      1. Added the house-style date, `draft: false`, PDF path, and normalized
         `scripture_version: "NET"`. No `source`/adapted-from line was added.
      2. The topical eyebrow "On Revivalism and the Means of Grace," landing
         meta description, and landing-page blurb are Codex-drafted and flagged
         as provisional in the content file.
      3. Corrected the essay's opaque/incorrect “third word … is *pew*” line to
         name *The Altar Call, the Anxious Bench, and the Empty Pew* explicitly
         and identify *pew* as its last word. Converted manual superscripts and
         two `<cite index>` artifacts into real Pandoc footnotes / ordinary
         quotations; added missing note calls for Needham/Spallanzani, Pasteur,
         Virchow, Finney, and the Confessions.
      4. Tightened two historical attributions during the source pass: Virchow
         “popularized” *omnis cellula e cellula*, and the older *omne vivum ex
         vivo* is described as the principle Pasteur's experiments established,
         not a phrase he originated. Removed the unsupported “within a day”
         timing from the tipped-flask sentence, retained the author's broader
         claims, and added a full citation for van Helmont's proposed randomized
         fever-treatment comparison.
      5. `related_books` on the essay landing page resolves the catalog records
         in deliberate order: *The Altar Call…* first as the direct continuation,
         then *The Hollow Altar* as the broader invitation. The Altar Call book's
         `related_resource` now points back to the essay; its replacement note
         is Codex-drafted and flagged as provisional. The former Law-and-Gospel
         position paper remains available in the Resources library.
      6. The PDF was rendered and inspected page by page. Its nine cited notes
         use a compact two-column endnote treatment added to
         `scripts/brand_handout.py`, avoiding an orphan ninth page while keeping
         the type legible. `scripts/gen_greek_og.py` now imports PyYAML only in
         its Greek-only code path, allowing the essay-card generator to reuse
         its shared drawing helpers in the documented Homebrew environment.
      7. Added a square pull-quote card via
         `scripts/gen_mice_quote_card.py` →
         `promotional/mice-from-a-dirty-shirt/01-the-neck-is-open.png`. The quote
         is verbatim from the author-supplied essay; only the functional source
         eyebrow, essay title/byline, and direct site URL were added.

## "If Weakness Is the Goal" essay (added 2026-08-18)

- [ ] "If Weakness Is the Goal: On a viral graphic, a missing word, and a
      comfort that does not depend on you" — author-supplied original essay
      text (`/Users/lherzog/Downloads/if-weakness-is-the-goal.md`), not
      Codex-drafted. Built in the established Essays pattern: branded PDF via
      `scripts/brand_handout.py` (`--drop 1`, `--kicker "Essay"`) →
      `static/downloads/essays/if-weakness-is-the-goal.pdf`; thin landing page
      `content/essays/if-weakness-is-the-goal.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/if-weakness-is-the-goal.png`; and the generated Essays
      archive / Resources newest-five listings. The author's title, subtitle,
      summary, tags, Scripture references, and full argument are retained.
      Judgment calls:
      1. Added the house-style date, `draft: false`, and PDF path, treating
         "New essay" as authorization to publish it. No Scripture version or
         adapted-from source was inferred.
      2. Used "Law and Gospel" for the topical eyebrow, taken directly from
         the supplied tags rather than drafting a new label.
      3. Reused the author-supplied summary verbatim for the meta description
         and landing-page blurb, so no new marketing or pastoral copy was
         introduced.

## "The Wrong Address" essay (added 2026-08-27)

- [ ] "The Wrong Address: Why a Debate Group Could Never Have Given Her What
      She Came For" — author-supplied original essay text
      (`/Users/lherzog/Downloads/the-wrong-address.md`), not Codex-drafted.
      Built in the established Essays pattern: branded PDF via
      `scripts/brand_handout.py` (`--drop 1`, `--kicker "Essay"`) →
      `static/downloads/essays/the-wrong-address.pdf`; thin landing page
      `content/essays/the-wrong-address.md`; OG card via
      `scripts/gen_essays_og.py` →
      `static/og/essays/the-wrong-address.png`; and the generated Essays
      archive / Resources newest-five listings. The author's title, subtitle,
      summary, NET designation, Scripture and confession references, and full
      argument are retained. Judgment calls:
      1. Added the house-style date, `draft: false`, and PDF path, treating
         "Add the attached new essay to the website" as authorization to
         publish it despite the attachment's working `status: draft` field.
      2. Used "Means of Grace" for the topical eyebrow, taken directly from
         the essay's argument rather than introducing a new claim.
      3. Reused the author-supplied summary verbatim for the meta description
         and landing-page blurb, so no new marketing or pastoral copy was
         introduced.

## "The Christ Behind the Doctrine" essay (added 2026-08-30)

- [ ] "The Christ Behind the Doctrine: On a graphic that makes you choose
      between theology and love" — author-supplied original essay text
      (`/Users/lherzog/Downloads/the-christ-behind-the-doctrine.md`), not
      Codex-drafted. Built in the established Essays pattern: branded PDF at
      `static/downloads/essays/the-christ-behind-the-doctrine.pdf`; thin landing
      page `content/essays/the-christ-behind-the-doctrine.md`; OG card at
      `static/og/essays/the-christ-behind-the-doctrine.png`; and the generated
      Essays archive / Resources newest-five listings. The author's title,
      subtitle, summary, tags, Scripture and confession references, NET
      designation, and full argument are retained. Judgment calls:
      1. Added the house-style `draft: false` and PDF path, treating the essay
         submission as authorization to publish it at the author-supplied date.
      2. Used "Doctrine and Discernment" for the topical eyebrow, drawn from the
         title and supplied tags rather than introducing a new claim.
      3. Reused the author-supplied summary verbatim for the meta description
         and landing-page blurb, so no new marketing or pastoral copy was
         introduced.

## "Why Did Jesus Descend into Hell?" question (added 2026-07-17)

- [ ] Author-supplied replacement for the shorter answer already published at
      `content/questions/what-does-it-mean-that-jesus-descended-into-hell.md`.
      The supplied question, summary wording, Scripture/Confession references,
      and body are used verbatim; the summary's Markdown emphasis markers were
      stripped because question indexes render front matter as plain text. The
      first summary sentence is also reused as the meta description, so no new
      draft copy was written. Judgment calls:
      1. Updated the existing page instead of creating
         `why-did-jesus-descend-into-hell.md`, avoiding a duplicate question and
         preserving the established public URL.
      2. Added the title from the supplied filename plus the house-style
         `date: 2026-07-17` and `draft: false` publication fields.
      3. Normalized category `Christology` to the site's existing
         `God, Christ & the Trinity` topic and changed hyphenated tags to the
         space-separated spellings used by related questions.
      4. Left `deep_link: ""` because the supplied `descent-into-hell` value is
         a topic identifier rather than a valid site URL, and no exact matching
         long-form resource exists.

## Question metadata editorial cleanup (added 2026-08-28)

- [ ] Sixteen spoken `question:` fields were expanded so they no longer merely
      repeat the display title and so an audio editor can hear the actual issue
      being answered. These are Codex-drafted provisional copy, marked in each
      file: `why-must-i-still-fight-sin`, `should-a-christian-be-cremated`,
      `what-do-lutherans-believe-about-the-end-times`,
      `i-surrendered-and-nothing-changed`, `is-it-wrong-to-sing-just-as-i-am`,
      `what-if-i-die-with-an-unconfessed-sin`,
      `does-the-lords-supper-require-wine-with-alcohol`,
      `is-let-go-and-let-god-in-the-bible`,
      `four-women-in-matthews-genealogy`,
      `are-my-future-sins-already-forgiven`,
      `does-a-christian-stop-being-a-sinner`,
      `what-does-justification-by-faith-alone-mean`, `such-were-some-of-you`,
      `how-can-i-tell-whether-a-hymn-is-teaching-law-or-gospel`,
      `how-much-should-a-pastor-make`, and
      `why-do-lutheran-hymnals-include-revival-and-gospel-hymns`.
- [ ] Sixteen search `description:` fields were added or rewritten to remove
      missing values, exact summary duplication, and lengths over 160
      characters. These are Codex-drafted provisional copy, marked in each
      file: `why-must-i-still-fight-sin`, `how-can-i-be-sure-my-faith-will-last`,
      `i-surrendered-and-nothing-changed`, `is-it-wrong-to-sing-just-as-i-am`,
      `what-if-i-die-with-an-unconfessed-sin`, `what-is-the-unforgivable-sin`,
      `is-let-go-and-let-god-in-the-bible`,
      `four-women-in-matthews-genealogy`,
      `are-my-future-sins-already-forgiven`, `can-a-true-believer-fall-away`,
      `does-a-christian-stop-being-a-sinner`, `is-preservation-synergistic`,
      `such-were-some-of-you`,
      `how-can-i-tell-whether-a-hymn-is-teaching-law-or-gospel`,
      `how-much-should-a-pastor-make`, and
      `why-do-lutheran-hymnals-include-revival-and-gospel-hymns`.
- [ ] The same objective cleanup pass also normalized the two sentence-case
      display titles, closed spaced em dashes in the twenty late-added entries,
      expanded abbreviated Scripture and Confession references there, added
      six body-cited passages missing from `scripture_refs`, normalized six
      unambiguous duplicate tag spellings, and corrected README's question
      count from 184 to 197. These mechanical changes introduce no new claims.
- [ ] The divorce-and-remarriage answer now includes a Codex-drafted,
      safety-first paragraph directing endangered adults and children away
      from danger and toward civil, professional, pastoral, and legal help. It
      describes persistent violence, coercion, or terror as potentially
      amounting to desertion in fact while explicitly withholding an automatic
      doctrinal ruling. The paragraph is marked `DRAFT COPY` in the page.
- [ ] The remaining question-corpus rulings approved on 2026-08-28 were
      applied: direct Scripture quotations now use NET Second Edition wording
      and carry `(NET)` attribution; site-authored divine pronouns use lowercase
      styling while quotations retain source styling; Church/church follows the
      universal/local distinction; Book of Concord citations use reader-facing
      full names; ellipses use three periods; the “Just As I Am” lyric is a
      blockquote; four singular/plural tag pairs use their singular form; and
      the approved #99 and #153 titles/terminology were aligned without changing
      either public URL. These are user-approved editorial or source-text
      changes rather than newly drafted claims.

## Three author-supplied questions (added 2026-08-28)

- [ ] `can-a-christian-be-a-soldier`, `do-people-become-angels`, and
      `some-manuscripts-do-not-include` use Larry's supplied questions,
      summaries, reference lists, tags, and body copy. Each search description
      reuses an exact sentence from its supplied summary, so no new marketing
      or pastoral copy was drafted. Editorial judgments:
      1. All three supplied categories were retained because they exactly match
         the existing taxonomy and the subjects of the answers.
      2. The soldier/police answer retains its supplied link to
         `/books/a-man-of-blood/`, which is live and directly relevant.
      3. The angels answer links to the existing
         `/questions/what-is-the-communion-of-saints/`, the resource that most
         directly develops its closing pastoral claim about believers living
         and dead remaining one body in Christ.
      4. The textual-criticism answer's nonexistent `/studies/ad-fontes/` link
         was corrected to `/ad-fontes/mark-16-and-confidence/`, the live Ad
         Fontes lesson devoted to Mark 16 and confidence in the biblical text.
      5. Abbreviated Confession references were expanded to the site's
         reader-facing style; direct Scripture excerpts were checked against
         NET Second Edition and labeled `(NET)`.

## Ad Fontes 2026–27 class signup and bulletin insert (added 2026-08-03)

- [ ] Unlisted `/ad-fontes-class/` page — hero line, three-paragraph class
      description, online-study preview link label, form introduction, and
      privacy/use note are Codex-drafted provisional copy. The fall/spring terms
      follow Larry's request and the current calendar: Fall 2026 for the New
      Testament volume and Spring 2027 for the Old Testament volume. The book
      titles, subtitles, blurbs, covers, and Amazon URLs remain data-driven from
      their existing approved catalog records. The signup now posts to the
      first-party self-hosted registration service and records the response
      directly rather than opening an email application. No third-party form
      service was introduced. The dedicated OG card reuses the page's
      provisional hero and semester lines and adds no new promotional claim.
- [ ] `/ad-fontes-class/thanks/` and `/ad-fontes-class/problem/` — the short
      confirmation, privacy reminder, retry guidance, headings, and action
      labels are Codex-drafted provisional copy. Both pages remain unlisted,
      `noindex`, and outside the sitemap.
- [ ] `output/pdf/ad-fontes-class-bulletin-insert.pdf` — all recruitment and
      explanatory wording on the bulletin insert is provisional, including the
      statement that course books are provided at no cost to students. The
      single-page 11 x 8.5 inch landscape sheet places the 5.5 x 8.5 inch
      insert on the left and leaves the right half blank for the church
      secretary's printing workflow.

## Genesis online study (added 2026-09-02)

- [ ] `/genesis/` online-edition summary paragraph is Codex-drafted
      provisional copy. The remaining study text, front matter, prayers,
      discussion questions, bibliography, Scripture index, timeline, and map
      labels come from Larry's supplied corrected manuscript and production
      apparatus. The importer removes obvious duplicated/pasted production
      artifacts from Session 30 and changes the timeline's Rebekah birth year
      from the contradictory `-140` value to “not stated,” following the
      timeline document's own stated policy. `content/genesis/_index.md` and
      `scripts/import_genesis_study.py`.

## Usability refinements (September 2026)

- [ ] `layouts/_default/newsletter.html` — shortened signup pitch.
- [ ] `content/studies/_index.md` — free studies, online studies, and teaching-material entry descriptions.
- [ ] `content/question-topics/{apologetics,eschatology,pastoral-existential,soteriology}.md` — plain-language topic titles; existing categories and URLs remain stable.

## Greek Word Explorer redesign — September 6, 2026

Larry approved all proposed/suggested NET migration updates and requested completion. The redesign and editorial audit are complete locally; nothing is deployed.

- [x] Explorer introduction and metadata (`content/greek/_index.md`).
- [x] All fifteen proposed prose revisions and all approved quotation changes, followed by the complete NET contextual audit across `content/greek/*.md`.
- [x] Additional coordinated adaptations in amen, arche, graphe, hypostasis, kleronomia, kleronomos, epiousios, anthropos, dikaiosyne, paliggenesia, orthotomeo, theos and thanatos; punctuation, quotation-boundary and reference repairs throughout the Explorer. All entry bodies carry a DRAFT COPY source annotation indexing these authorized adaptations.
- [x] Shared Scripture/gloss/historical-source explanation in `layouts/greek/single.html`.
- [x] Conforming pass on all fourteen existing Guard the Deposit entries.

The 250 imported manuscript sections and GTD paragraph groups are supplied/existing authored material. No missing optional section was invented. Draft annotations record authorship of adaptations and do not create a new approval gate.

The completed report, current excerpt verification and per-entry provenance are indexed in [the Greek redesign report](output/editorial/greek-redesign-review.md). Historical JSON change logs preserve earlier proposals; the final ledger describes the delivered files. No editorial decision remains outstanding.

## Greek Explorer — batch 03 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-03/review.md).

- [x] `content/greek/morphe.md` — He Emptied Himself by Taking; production approved, excluded from Word of the Week.
- [x] `content/greek/tapeinoo.md` — The State of Humiliation; production approved, excluded from Word of the Week.
- [x] `content/greek/hypsoo.md` — Lifted Up Two Ways at Once; production approved, excluded from Word of the Week.
- [x] `content/greek/phos.md` — Light of Light; production approved, excluded from Word of the Week.
- [x] `content/greek/apaugasma.md` — Radiance, Not Reflection; production approved, excluded from Word of the Week.
- [x] `content/greek/prosopon.md` — Face, and Then Person; production approved, excluded from Word of the Week.
- [x] `content/greek/physis.md` — Two Natures, One Person; production approved, excluded from Word of the Week.
- [x] `content/greek/ekporeuomai.md` — Proceeds From the Father; production approved, excluded from Word of the Week.

## Greek Explorer — batch 04 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-04/review.md).

- [x] `content/greek/stauros.md` — The Cross You Cannot Decorate; production approved, excluded from Word of the Week.
- [x] `content/greek/moria.md` — Foolishness Is the Plan; production approved, excluded from Word of the Week.
- [x] `content/greek/skandalon.md` — The Offense You Are Not Allowed to Remove; production approved, excluded from Word of the Week.
- [x] `content/greek/amnos.md` — The Lamb Is Not About Gentleness; production approved, excluded from Word of the Week.
- [x] `content/greek/archegos.md` — Author, Not Coach; production approved, excluded from Word of the Week.
- [x] `content/greek/katara.md` — He Became the Curse; production approved, excluded from Word of the Week.
- [x] `content/greek/teleo.md` — It Is Finished; production approved, excluded from Word of the Week.
- [x] `content/greek/hilaskomai.md` — God, Be Merciful to Me; production approved, excluded from Word of the Week.

## Greek Explorer — batch 05 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-05/review.md).

- [x] `content/greek/logizomai.md` — The Accounting Word; production approved, excluded from Word of the Week.
- [x] `content/greek/epangelia.md` — A Promise Is Not an Offer; production approved, excluded from Word of the Week.
- [x] `content/greek/dorean.md` — Without a Cause; production approved, excluded from Word of the Week.
- [x] `content/greek/kauchaomai.md` — Where Your Confidence Sits; production approved, excluded from Word of the Week.
- [x] `content/greek/skybalon.md` — His Best, Not His Worst; production approved, excluded from Word of the Week.
- [x] `content/greek/synergeo.md` — The Word the Controversy Is Named After; production approved, excluded from Word of the Week.
- [x] `content/greek/katakrima.md` — No Condemnation; production approved, excluded from Word of the Week.
- [x] `content/greek/perisseuo.md` — Where Sin Increased; production approved, excluded from Word of the Week.

## Greek Explorer — batch 06 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-06/review.md).

- [x] `content/greek/pantokrator.md` — Almighty Means Holding, Not Just Able; production approved, excluded from Word of the Week.
- [x] `content/greek/aoratos.md` — The God You Cannot See; production approved, excluded from Word of the Week.
- [x] `content/greek/onoma.md` — Into the Name; production approved, excluded from Word of the Week.
- [x] `content/greek/abba.md` — The Word Left Untranslated; production approved, excluded from Word of the Week.
- [x] `content/greek/apostello.md` — Sent, and Sending; production approved, excluded from Word of the Week.
- [x] `content/greek/eudokia.md` — According to His Good Pleasure; production approved, excluded from Word of the Week.
- [x] `content/greek/prognosis.md` — Knowing Beforehand Is Not Choosing; production approved, excluded from Word of the Week.
- [x] `content/greek/thelema.md` — Thy Will Be Done; production approved, excluded from Word of the Week.

## Greek Explorer — batch 07 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-07/review.md).

- [x] `content/greek/akoe.md` — Faith Comes by Hearing; production approved, excluded from Word of the Week.
- [x] `content/greek/kleis.md` — The Keys and Who Holds Them; production approved, excluded from Word of the Week.
- [x] `content/greek/poimen.md` — What a Pastor Is For; production approved, excluded from Word of the Week.
- [x] `content/greek/oikonomos.md` — Stewards of the Mysteries; production approved, excluded from Word of the Week.
- [x] `content/greek/oikodome.md` — Built Up by What?; production approved, excluded from Word of the Week.
- [x] `content/greek/taxis.md` — Decently and in Order; production approved, excluded from Word of the Week.
- [x] `content/greek/episynagoge.md` — Not Neglecting to Gather; production approved, excluded from Word of the Week.
- [x] `content/greek/hymnos.md` — Teaching One Another in Song; production approved, excluded from Word of the Week.

## Greek Explorer — batch 08 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-08/review.md).

- [x] `content/greek/peirasmos.md` — Lead Us Not; production approved, excluded from Word of the Week.
- [x] `content/greek/paraklesis.md` — Comfort Is Something You Are Told; production approved, excluded from Word of the Week.
- [x] `content/greek/phobos.md` — Two Kinds of Fear; production approved, excluded from Word of the Week.
- [x] `content/greek/eleos.md` — Kyrie Eleison; production approved, excluded from Word of the Week.
- [x] `content/greek/makrothymia.md` — Long-Tempered; production approved, excluded from Word of the Week.
- [x] `content/greek/deesis.md` — Four Words for Prayer; production approved, excluded from Word of the Week.
- [x] `content/greek/entynchano.md` — Someone Is Praying for You Right Now; production approved, excluded from Word of the Week.
- [x] `content/greek/hosanna.md` — A Prayer That Became a Cheer; production approved, excluded from Word of the Week.

## Greek Explorer — batch 09 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-09/review.md).

- [x] `content/greek/skenoo.md` — He Pitched His Tent; production approved, excluded from Word of the Week.
- [x] `content/greek/analambano.md` — Taken Up — To Where?; production approved, excluded from Word of the Week.
- [x] `content/greek/eperotema.md` — Baptism Now Saves You; production approved, excluded from Word of the Week.
- [x] `content/greek/eucharistia.md` — Where the Name Came From; production approved, excluded from Word of the Week.
- [x] `content/greek/klao.md` — The Breaking of the Bread; production approved, excluded from Word of the Week.
- [x] `content/greek/oikos.md` — He and His Whole Household; production approved, excluded from Word of the Week.
- [x] `content/greek/naos.md` — The Inner Sanctuary; production approved, excluded from Word of the Week.
- [x] `content/greek/latreia.md` — Who Serves Whom; production approved, excluded from Word of the Week.

## Greek Explorer — batch 10 (September 6, 2026)

Larry approved all eight entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-10/review.md).

- [x] `content/greek/epithymia.md` — The Sin Before the Sin; production approved, excluded from Word of the Week.
- [x] `content/greek/orge.md` — The Wrath from Which He Saves Us; production approved, excluded from Word of the Week.
- [x] `content/greek/paidagogos.md` — Under a Guardian; production approved, excluded from Word of the Week.
- [x] `content/greek/stoicheia.md` — Back to the Basics You Were Rescued From; production approved, excluded from Word of the Week.
- [x] `content/greek/kardia.md` — The Heart God Opens; production approved, excluded from Word of the Week.
- [x] `content/greek/charitoo.md` — Favored by God; production approved, excluded from Word of the Week.
- [x] `content/greek/aletheia.md` — Truth With a Face; production approved, excluded from Word of the Week.
- [x] `content/greek/exestin.md` — All Things Are Lawful — Says Who?; production approved, excluded from Word of the Week.

## Greek Explorer — batch 11 (September 6, 2026)

Larry approved all twelve entries for production on September 6, 2026. [Review packet](output/editorial/greek-batch-11/review.md).

- [x] `content/greek/ktizo.md` — Made, and Made Again; production approved, excluded from Word of the Week.
- [x] `content/greek/anastrophe.md` — The Life Your Neighbor Sees; production approved, excluded from Word of the Week.
- [x] `content/greek/koimaomai.md` — Why We Call It Sleeping; production approved, excluded from Word of the Week.
- [x] `content/greek/hades.md` — He Descended Into What?; production approved, excluded from Word of the Week.
- [x] `content/greek/psyche.md` — Soul, Life, and the Whole Person; production approved, excluded from Word of the Week.
- [x] `content/greek/astheneia.md` — Weakness Is Where He Works; production approved, excluded from Word of the Week.
- [x] `content/greek/mataiotes.md` — Subjected to Futility; production approved, excluded from Word of the Week.
- [x] `content/greek/paroikos.md` — Resident Aliens; production approved, excluded from Word of the Week.
- [x] `content/greek/makarios.md` — Blessed Is a Declaration; production approved, excluded from Word of the Week.
- [x] `content/greek/splanchna.md` — Compassion in the Gut; production approved, excluded from Word of the Week.
- [x] `content/greek/aionios.md` — Eternal Life Is Not Only Later; production approved, excluded from Word of the Week.
- [x] `content/greek/apokalypsis.md` — The Unveiling; production approved, excluded from Word of the Week.


## Greek Explorer rotation update (September 6, 2026)

Larry requested that every published word participate in Word of the Week and
that `/greek/` show a dynamic collection total. All 97 approved native entries now
use `wotw: true`; all 211 published words participate. This supersedes the rotation
exclusions in the historical batch records above. Approved entry prose is unchanged.
The factual count under the page heading is generated from published entries.


## Greek Explorer — additional 39 (September 6, 2026)

Larry requested unattended drafting of all 39 and publication-ready preparation, with final review before commit. These entries are included in production builds (`draft: false`) and Word of the Week, but their wording is **pending author review**. Source comments and `editorial_review` preserve that distinction. The collection now contains 250 words. [Review packet](output/editorial/greek-batch-12/review.md).

- [ ] `content/greek/hilasmos.md` — For the Whole World; publication-ready, final author review pending.
- [ ] `content/greek/ephapax.md` — A Sacrifice That Does Not Need Repeating; publication-ready, final author review pending.
- [ ] `content/greek/archiereus.md` — The High Priest Who Knows Our Weakness; publication-ready, final author review pending.
- [ ] `content/greek/engyos.md` — Christ Is the Guarantee; publication-ready, final author review pending.
- [ ] `content/greek/harpagmos.md` — Equality with God and the Form of a Servant; publication-ready, final author review pending.
- [ ] `content/greek/thysia.md` — The Sacrifice Given and the Thanks Returned; publication-ready, final author review pending.
- [ ] `content/greek/didomi.md` — Given for You; publication-ready, final author review pending.
- [ ] `content/greek/lambano.md` — Receiving the Gift; publication-ready, final author review pending.
- [ ] `content/greek/pisteuo.md` — Trusting the One Who Justifies; publication-ready, final author review pending.
- [ ] `content/greek/charizomai.md` — Forgiveness Freely Given; publication-ready, final author review pending.
- [ ] `content/greek/aphiemi.md` — The Forgiveness Christ Sends; publication-ready, final author review pending.
- [ ] `content/greek/helko.md` — The Father Draws Us to the Son; publication-ready, final author review pending.
- [ ] `content/greek/metamelomai.md` — When Regret Needs a Promise; publication-ready, final author review pending.
- [ ] `content/greek/exousia.md` — Authority to Forgive; publication-ready, final author review pending.
- [ ] `content/greek/deo.md` — The Key That Binds; publication-ready, final author review pending.
- [ ] `content/greek/lyo.md` — The Key That Releases; publication-ready, final author review pending.
- [ ] `content/greek/katecheo.md` — Learning the Faith We Confess; publication-ready, final author review pending.
- [ ] `content/greek/didache.md` — Continuing in the Apostles' Teaching; publication-ready, final author review pending.
- [ ] `content/greek/kerysso.md` — A Message the Preacher Receives; publication-ready, final author review pending.
- [ ] `content/greek/matheteuo.md` — Baptizing and Teaching; publication-ready, final author review pending.
- [ ] `content/greek/baptisma.md` — Buried with Christ through Baptism; publication-ready, final author review pending.
- [ ] `content/greek/anothen.md` — Born Again, Born from Above; publication-ready, final author review pending.
- [ ] `content/greek/anagennao.md` — Born Anew through the Living Word; publication-ready, final author review pending.
- [ ] `content/greek/antitypos.md` — The Water and the Promise; publication-ready, final author review pending.
- [ ] `content/greek/enochos.md` — Concerning the Body and Blood; publication-ready, final author review pending.
- [ ] `content/greek/dokimazo.md` — Examine Yourself, and So Eat; publication-ready, final author review pending.
- [ ] `content/greek/hagiasmos.md` — The Holy Life God Gives; publication-ready, final author review pending.
- [ ] `content/greek/nekroo.md` — Putting the Old Life to Death; publication-ready, final author review pending.
- [ ] `content/greek/peripateo.md` — Walking in What God Has Prepared; publication-ready, final author review pending.
- [ ] `content/greek/diakonia.md` — Service with Something to Give; publication-ready, final author review pending.
- [ ] `content/greek/leitourgos.md` — God's Servants in Ordinary Offices; publication-ready, final author review pending.
- [ ] `content/greek/hypotasso.md` — Authority under God's Word; publication-ready, final author review pending.
- [ ] `content/greek/plesion.md` — The Neighbor in Front of You; publication-ready, final author review pending.
- [ ] `content/greek/egeiro.md` — He Will Raise Your Mortal Body; publication-ready, final author review pending.
- [ ] `content/greek/apokatastasis.md` — The Restoration God Has Promised; publication-ready, final author review pending.
- [ ] `content/greek/katapausis.md` — Entering God's Rest; publication-ready, final author review pending.
- [ ] `content/greek/sabbatismos.md` — The Sabbath Rest That Remains; publication-ready, final author review pending.
- [ ] `content/greek/apoleia.md` — A Warning Worth Hearing; publication-ready, final author review pending.
- [ ] `content/greek/geenna.md` — The Warning of the Savior; publication-ready, final author review pending.

## Greek Explorer missing-data repairs — September 6, 2026

Larry approved the reviewed drafts and removal of “Go Deeper” altogether for
production on September 6, 2026. Commit, push, and deployment remain with Larry.

- [x] `content/greek/authenteo.md` — new “So What” closing; Larry approved the
  copy and production release. Source comments now record COPY APPROVED.
- [x] `content/greek/anastasis.md` — revised intermediate-state paragraph;
  Larry approved the copy and production release. Apology XXI.9 checked directly
  in the public-domain text; the editor's suggested FC XII citation was not supported.
- [x] Removed all 56 “If You Want to Go Deeper” sections. Preserved the footnote
  definition used by the remaining `metanoia` article and the Heidelberg Disputation
  source link beside the existing `stauros` discussion. Historical manuscript
  extracts remain intact. Current section rules no longer permit “Go Deeper.”
  Removed stray undefined numeric footnote markers from 23 articles; valid
  citations and article prose remain intact.
- Pronunciation work: 166 empty fields filled, two placeholders replaced, and
  `mesites` respelling normalized; those three body guides synchronized. See
  `output/editorial/greek-pronunciation-repairs.json` for every change and its basis.
- `orthotomeo` uses a new heading for its existing confessional discussion;
  `pistos-ho-logos` retains its intentionally different substantive headings.

Full scope and source notes: [missing-data review](output/editorial/greek-missing-data-review.md).
Removal manifest: `output/editorial/greek-go-deeper-removal.json`.
Approval applies to the two new passages reviewed in this task and the section
removal. Other batches retain their independently recorded review statuses.
