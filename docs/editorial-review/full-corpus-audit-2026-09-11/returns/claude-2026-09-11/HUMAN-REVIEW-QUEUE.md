# Human-review queue

Items that the supplied evidence cannot resolve. Each gives the question, why the packet is insufficient, what would resolve it, and whether it bears on v1 readiness. Findings flagged `requiresHumanReview: true` in FINDINGS.json are listed at the end.

## Corpus-wide

### HR-01. Which wording is the BSB, across all quotations? (v1: yes)
- **Question:** Does every quotation labeled or presented as BSB match the pinned BSB source?
- **Why the packet is insufficient:** The BSB text is excluded. This audit could only detect conflicts where a verse is quoted twice, plus sentences broken by substitution. AUDIT-003 to 005, 008 to 019 and 057 to 059 are the detected cases.
- **Resolution:** A deterministic comparison of every inline and block quotation against `sources/bsb/raw/bsb.txt` (hash in the v5 manifest), run in the repository, followed by author review of mismatches.

### HR-02. The 243 whole-verse substitutions (v1: yes)
- **Question:** Which of the substitutions recorded by `smallest-supported-whole-verse-v1` broke sentence grammar, headings, attributions or arguments?
- **Why the packet is insufficient:** The substitution list is not in the packet. This audit found about 45 by heuristics (whole capitalized verse in a phrase slot, italic heading slots, duplicated quotations, speech introductions).
- **Resolution:** The adaptation candidate's replacement log, reviewed by the author against the website originals.

### HR-03. NET identification (v1: yes, as part of HR-01)
- **Question:** Is the non-matching wording in the edition findings actually NET?
- **Why the packet is insufficient:** That identification is the reviewer's knowledge, not packet evidence.
- **Resolution:** Resolved automatically by HR-01.

### HR-04. Occurrence counts (v1: low to medium)
- **Question:** Are the frequency claims accurate? Examples: amen "about 129 times," chara "fifty-nine," ethnos and basileia "162," eusebeia "fifteen," hiereus "thirty-one."
- **Why the packet is insufficient:** No concordance is in the packet, and M3 notes that app occurrence indexes cover only the Nestle subset.
- **Resolution:** A lexicon or concordance check (for example against the pinned Nestle morphology) by a Greek-competent reviewer, with the counting edition stated.

### HR-05. Verse-number bounds (v1: low)
- **Question:** Are all cited verse numbers within range?
- **Why the packet is insufficient:** Only chapter bounds were checked (4,528 references, none out of range). Versification data is not in the packet.
- **Resolution:** A versification check against the canonical registry in the repository.

## Specific passages

### HR-06. homologeo: "the Latin is itself a translation" (v1: no)
- **Question:** The article says Latin *confiteor* is "itself a translation" of Greek *homologeō*. *Confiteor* is a native Latin verb that was used to translate the Greek. Is the sentence a historical claim, or shorthand for "the Latin rendering"?
- **Resolution:** Author wording decision. No lexical source is supplied.

### HR-07. theotes: Athanasian Creed Latin (v1: no)
- **Question:** The article attributes the Latin "unitas Deitatis" to the Athanasian Creed for "the unity of the Godhead." Does the creed's Latin text use that wording?
- **Why the packet is insufficient:** The creed text is not supplied.
- **Resolution:** Check against a critical Latin text of the *Quicumque*.

### HR-08. candidate-23: list of greeters (v1: low)
- **Question:** "then returns to greetings from Gaius, Erastus and Quartus." Romans 16:21–22 also names other senders before verse 23. Is the selective list acceptable as a summary, or should it read "greetings, among them from Gaius, Erastus and Quartus"?
- **Why the packet is insufficient:** The readings for 16:21–23 are not supplied.

### HR-09. candidate-10: "in the Greek editions, the identical clause" (v1: low)
- **Question:** Source C2 documents string comparison of Luke 22:37 against Mark 15:28 in RP2018 and TR-BOYD only. Does the Nestle 1904 wording at Luke 22:37 also match the clause, or should the sentence name the two editions?
- **Why the packet is insufficient:** Luke 22:37 is not in the packet.

### HR-10. paratheke: "the last thing Paul says before the closing benediction" (v1: no)
- **Question:** 1 Timothy 6:20b–21a continues the charge after "guard the deposit." Is "last thing" meant loosely?
- **Resolution:** Author decision. The five-word Greek count itself checks out: *Ō / Timothee / tēn / parathēkēn / phylaxon* = 5.

### HR-11. hyios: transliteration (v1: no)
- **Question:** The title and front matter give "Hyios," while the body gives "(*huios*)", as do the related huiothesia slug and translit. Is the variation deliberate and disclosed?

### HR-12. Readable but awkward whole-verse substitutions (v1: low, editorial)
These were not filed as findings because the sentence still reads.
- **Redundant speech introductions:**
  - anastasis: "(Martha: “Martha replied…”)"
  - chara: "(Gabriel to Mary: “The angel appeared to her and said…”)"
  - mathetes: "“Then Thomas called Didymus said to his fellow disciples…” and “Then they heaped insults on him and said…”"
  - paradosis: "He quotes Isaiah 29:13: “Jesus answered them…”"
  - hyios: "Jesus's response (Matthew 16:17): “Jesus replied…”"
  - theos: "the people of Lystra cry out that “When the crowds saw…”"
- **Unbalanced nested quotation marks:**
  - basileia: "Mark summarizes it: “The time is fulfilled,’ He said…"
  - anastasis: "*John 11:23-26.* “Your brother will rise again,’ Jesus told her."
  - ethnos: "John 18:35 (Pilate: “Am I a Jew?’ Pilate replied."
- **Resolution:** Included in HR-02.

## Findings requiring human review

| ID | Record | Sev. | Question |
|---|---|---|---|
| AUDIT-001 | theos | S1 | The sentence attributes to the New World Translation a rendering of all of John 1:1 that ends “the Word was fully God.” The paragraph goes on to say the Watch Tower uses the missing article to argue the Word is “not the God but only a god.” The quoted text cannot be the rendering that argument depends on, so the section now misstates the position it refutes.. |
| AUDIT-002 | theos | S1 | The sentence names three readings, two it allows and one it rules out, but all three quotations are the same whole-verse text. |
| AUDIT-003 | theos | S2 | In the BSB-adapted article, John 1:1 is quoted ending “the Word was fully God,” while other articles in the same release quote the verse ending “the Word was God.” At most one of these can be the BSB wording.. |
| AUDIT-004 | arche | S2 | John 1:1 is quoted ending “the Word was fully God,” conflicting with the corpus’s other wording of the verse (“the Word was God”).. |
| AUDIT-005 | logos | S2 | Within this article John 1:1 appears in two different wordings: line 37 ends “the Word was God,” and this range-of-meaning bullet ends “the Word was fully God.”. |
| AUDIT-006 | theos | S2 | The parenthesis is meant to show the alternative punctuation, in which the clause becomes a separate doxology to the Father. |
| AUDIT-008 | zoe | S2 | The article quotes John 10:10 twice, both times labeled BSB, in different wordings (“may have it abundantly” here; “have it in all its fullness” at line 92). |
| AUDIT-009 | sozo | S2 | Matthew 1:21 is quoted twice in this article, both times labeled BSB, in different wordings (“you will name him Jesus” here; “you are to give Him the name Jesus” at line 59).. |
| AUDIT-010 | charis | S2 | Romans 11:6 is quoted twice, both times labeled BSB, in different wordings (line 31 lacks “then” and punctuates differently from the blockquote at line 62).. |
| AUDIT-012 | teleios | S2 | The article’s key verse is labeled BSB and begins “So then.” Line 77 quotes the same wording and then says “The “therefore” connects the teleios command…”, referring to a word the quotation does not contain. |
| AUDIT-019 | charakter | S2 | The headword article presents “the representation of his essence” as the BSB wording of Hebrews 1:3 and builds its explanation on “essence.” Two other articles quote Hebrews 1:3 as BSB with “the exact representation of His nature.” The BSB label and the “essence renders hypostasis” explanation are therefore unsupported within the release.. |
| AUDIT-024 | aphesis | S2 | The words presented as what Christ announces to Peter in Matthew 16:19 begin “Truly I tell you,” the opening of the plural saying to the disciples at Matthew 18:18, and the very next sentence then treats Matthew 18:18 as a separate text. |
| AUDIT-025 | nomos | S3 | The quotation starts partway through a question, so it begins “we continue in sin…” without its interrogative opening. |
| AUDIT-026 | parousia | S3 | The gloss for the Latin word rapiemur (“we shall be caught up”) has been replaced by the whole English verse 1 Thessalonians 4:17. |
| AUDIT-027 | agorazo | S3 | An error-list heading that should name a short phrase now contains all of Revelation 5:9. |
| AUDIT-028 | apostolos | S3 | The italic lead-in of a range-of-meaning entry has been replaced by the whole verse, which the next sentence then quotes again. |
| AUDIT-029 | arche | S3 | The question about the meaning of the phrase ho archē tēs ktiseōs has the whole of Revelation 3:14 in the phrase’s place, twice more in the article (lines 114 and 132). |
| AUDIT-030 | anomia | S3 | The sentence expects a short phrase after “Paul speaks of” (the escalating-lawlessness phrase), but the whole verse appears, so the sentence doesn’t read and the phrase that supports the point is buried.. |
| AUDIT-031 | dikaiosyne | S3 | The predicate “is [ignorant of God’s righteousness]” was replaced by the whole of Romans 10:3, so the sentence reads “every religious person … is ‘Because they were ignorant…’”.. |
| AUDIT-032 | elpis | S3 | The sentence says the rich are “warned not to” and then quotes the command to Timothy, so what they are warned against is lost.. |
| AUDIT-033 | ethnos | S3 | The entry should say that Peter “lives like a Gentile” (ethnikōs zēs). |
| AUDIT-034 | karpos | S3 | The error heading, and the sentence “Many English speakers refer to … as if Galatians 5:22-23 listed nine separate fruits,” both hold the whole two-verse passage where the short phrase “fruit of the Spirit” belongs.. |
| AUDIT-035 | kenoo | S3 | A list of short participial glosses (“made void,” …, “made empty”) has the whole of 1 Corinthians 1:17 as its middle item.. |
| AUDIT-036 | kleronomia | S3 | Under the heading “The inheritance reserved in heaven,” the predicate after “The inheritance is” has been replaced by the whole passage beginning at 1 Peter 1:3. |
| AUDIT-037 | kosmos | S3 | The sentence expects the confession’s object (“is the Savior of the world”) but contains the whole of John 4:42 with its speech introduction.. |
| AUDIT-038 | kosmos | S3 | The entry on kosmokratōr (“world-ruler”) should name the phrase “powers of this world’s darkness.” The whole verse is inserted instead, so the term being defined is not isolated.. |
| AUDIT-039 | kosmos | S3 | The error heading should name the phrase ta stoicheia tou kosmou (“the basic forces of the world”) but contains the whole of Galatians 4:3.. |
| AUDIT-040 | krisis | S3 | The sentence expects “the sun of righteousness will rise”. |
| AUDIT-041 | hyios | S3 | The sentence says the prophet sees [“one like a son of man”] given dominion. |
| AUDIT-042 | hyios | S3 | The error heading names a popular reduction (Son of Man as humility) but now contains Mark 14:62–63. |
| AUDIT-043 | iesous | S3 | The sentence (and line 147, “The “Therefore God exalted Him…” climax of verses 9-11”) should refer to “the name above all names” but contains the whole verse, so both sentences are broken.. |
| AUDIT-044 | prothesis | S3 | The sentence expects a noun phrase (“The ‘all things work together for good’ of Romans 8:28”), but the whole verse is inserted after the article.. |
| AUDIT-045 | prototokos | S3 | The sentence should say Paul calls Christ “the firstborn over all creation,” but the whole verse is inserted, producing “calls Christ the ‘The Son is…’”.. |
| AUDIT-046 | soma | S3 | The article is discussing the phrase “recognizing the body.” The whole verse is inserted here and again in “On this reading, … means recognizing that the congregation is one body,” so that sentence now says the whole verse means “recognizing that the congregation is one body.”. |
| AUDIT-047 | thanatos | S3 | The “striking phrase” (to analysai kai syn Christō einai, “to depart and be with Christ”) was replaced by the whole of Philippians 1:23, giving “Death becomes … the ‘I am torn between the two…’”.. |
| AUDIT-048 | didaskalia | S3 | The sentence should continue “the father is to [teach them diligently to your children]”. |
| AUDIT-049 | eleutheria | S3 | The error heading should name the phrase “released from the law” but contains the whole of Romans 7:6.. |
| AUDIT-050 | apolytrosis | S3 | The quotation stops at “inherited from your,” cutting the phrase off before its noun.. |
| AUDIT-051 | bema | S4 | The sentence expects the object phrase (“his due for the things done in the body”) but has the whole verse, which was already quoted in the sentence before.. |
| AUDIT-052 | pater | S4 | Several range-of-meaning entries contain whole verses where short phrases belong: “Levi was ‘For when Melchizedek…’” (line 85) and “Abraham as ‘And he received the sign of circumcision…’” (line 87). |
| AUDIT-053 | rhema | S4 | The entry expects the shepherds’ phrase (“this thing that has happened”) but contains the whole verse, giving “the shepherds’ ‘When the angels had left them…’”.. |
| AUDIT-054 | homologeo | S4 | The sentence expects the phrase “before many witnesses.” The whole of 1 Timothy 6:12 is inserted instead (and again at line 97 in a list of short phrases).. |
| AUDIT-055 | mathetes | S4 | The entry illustrates the verb form ematheteuthē (“had become a disciple”) but quotes the whole verse after the name, giving “Joseph of Arimathea ‘When it was evening…’”.. |
| AUDIT-056 | hypakoe | S4 | The sentence expects the phrase “do not obey the gospel” but contains the whole verse. |
| AUDIT-057 | huiothesia | S3 | Galatians 3:28 is quoted here in wording that differs from its quotation in eleutheria (“There is neither Jew nor Greek, slave nor free, male nor female, for you are all one in Christ Jesus.”). |
| AUDIT-058 | eklektos | S3 | Romans 6:1 is quoted here as “Are we to remain in sin…,” but nomos quotes it as BSB with “…continue in sin…”. |
| AUDIT-059 | didaskalia | S3 | This phrase from 1 Timothy 4:1 does not match rhema’s quotation of the same verse (“the teachings of demons”).. |
| AUDIT-060 | aphesis | S4 | The link text is aphesis (this article’s own headword) but the target is the metanoia article.. |
| AUDIT-062 | hades | S4 | This is the only internal link outside /greek/. |
| AUDIT-063 | epiphaneia | S4 | The boxed note sends the reader to a study titled The Knowledge of Him, which is not in this corpus and not otherwise identified. |
| AUDIT-064 | eusebeia | S3 | The note ties the King James to “the Byzantine tradition.” The release’s edition model separates the Byzantine Majority (Robinson–Pierpont) from the Textus Receptus, which is what the KJV translators used, and the guidance says not to imply the two are identical. |
| AUDIT-065 | hyper | S4 | The referent of “three syllables” is unclear. |
| AUDIT-066 | diakonos | S4 | Specific claim about the wording of three editions at 1 Timothy 3:11. |
| AUDIT-067 | agorazo | S4 | The front-matter subtitle (“bought at a price”) differs in wording and capitalization from word-metadata.json and the v5 manifest (“Bought with a Price”).. |
| AUDIT-073 | candidate-16 | S3 | The interpretation says the detail that the sick were waiting for the water to move is present either way. |
| AUDIT-074 | candidate-17 | S3 | The public source locator contradicts itself. |
| AUDIT-075 | candidate-21 | S3 | The note says the missing cross-reference is unusual because at comparable places “both” publishers point elsewhere, and its interpretation calls this “the rarer case.” Candidate-06 (Mark 7:16), a comparable whole-verse difference, says neither publisher points the reader anywhere else.. |
| AUDIT-076 | candidate-26 | S3 | In the Nestle reading the relative pronoun is masculine (Ὃς) and μυστήριον is neuter (τὸ … μυστήριον), so the pronoun does not agree with “mystery” as its grammatical antecedent. |
| AUDIT-080 | candidate-08 | S4 | Candidate-07 and this unit’s own source observation put the single occurrence at verse 48. |
| AUDIT-081 | candidate-01 | S4 | Earlier in the paragraph the “Berean” editions named are BSB and BLB, so “Both Berean editions” reads as BSB and BLB. |
| AUDIT-086 | candidate-18 | S4 | The historical claims (Erasmus 1516; basis of the KJV) are cited to C7, whose locator describes Boyd’s introduction only as covering the Stephanus/Elzevir/Scrivener compilation. |
| AUDIT-087 | candidate-29 | S4 | This is in the source observation, but none of the seven benediction readings contains “Father”; they name the Lord Jesus Christ, God, and the Holy Spirit. |
| AUDIT-088 | candidate-19 | S4 | The prose points the reader to the Luke 17:36 unit (candidate-12), but candidate-19 has no relatedUnits and candidate-12 does not link back.. |

**No source content was edited. All items remain recommendations pending Larry Herzog Jr.'s review and approval.**
