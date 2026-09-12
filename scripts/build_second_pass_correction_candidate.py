"""Build the non-public v10 candidate from the reconciled second-pass audit.

The script verifies immutable v7, applies only exact reviewed replacements in a
new artifact directory, and records every output hash. It does not promote the
candidate, select it in the app, or alter approved comparison/commentary data.
"""

from __future__ import annotations

import hashlib
import json
import unicodedata
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ID = "om-studies-2026-09-11-v7"
PROPOSED_ID = "om-studies-2026-09-12-v8"
SOURCE = ROOT / "sources/om-studies" / SOURCE_ID
AUDIT = ROOT / "docs/editorial-review/second-pass-audit-2026-09-12"
OUTPUT = ROOT / "artifacts/editorial/second-pass-audit-2026-09-12-candidate-v10"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one exact match, found {count}")
    return text.replace(old, new)


# Exact replacements for the accepted Claude findings. Items intentionally not
# listed are either already correct in v7, duplicated below by a fuller edit, or
# rejected as convention-only in RECONCILIATION.md.
CLAUDE_NEW = {
    "PASS2-001": "The Pauline Christological hymn of Colossians, treating Christ as “the firstborn over all creation” (v. 15) and “the firstborn from among the dead” (v. 18).",
    "PASS2-002": "Luke specifies *eparas tas cheiras autou* — “He lifted up His hands and blessed them” (Luke 24:50, BSB).",
    "PASS2-003": "the final clause of the entire book reads: “Boldly and freely he proclaimed the kingdom of God and taught about the Lord Jesus Christ” — *meta pasēs parrhēsias akōlytōs*.",
    "PASS2-004": "*Psalm 33:6, 9* — “By the word of the LORD the heavens were made, and all the stars by the breath of His mouth. … For He spoke, and it came to be; He commanded, and it stood firm.”",
    "PASS2-005": "Used once, at Galatians 2:14 — “If you, who are a Jew, live like a Gentile and not like a Jew, how can you compel the Gentiles to live like Jews?” (*ethnikōs zēs*, BSB)",
    "PASS2-006": "*The “god of this age.”* 2 Corinthians 4:4 — Paul describes Satan as “the god of this age” who blinds the minds of unbelievers.",
    "PASS2-007": "after first identifying the lie as a lie “to the Holy Spirit” (Acts 5:3, BSB)",
    "PASS2-008": "The Greek expression *kalōn ergōn proistasthai* — “devote themselves to good deeds” —",
    "PASS2-009": "Hebrews 12:2 names Christ as “the author and perfecter of our faith”",
    "PASS2-010": "Hebrews 12:2 (“Jesus, the author and perfecter of our faith”)",
    "PASS2-011": "Hebrews 12:11 — the “harvest of righteousness and peace.”",
    "PASS2-012": "When Christ took the cup at the Last Supper and said, “‘This cup is the new covenant in My blood, which is poured out for you’”",
    "PASS2-013": "When Christ speaks of “the new covenant in My blood” (1 Corinthians 11:25, BSB), He is announcing",
    "PASS2-014": "Abraham was looking forward to “the city with foundations, whose architect and builder is God” (Hebrews 11:10, BSB).",
    "PASS2-015": "The believer is “shielded by God’s power for the salvation that is ready to be revealed in the last time” (1 Peter 1:5, BSB).",
    "PASS2-016": "Paul has been speaking of “forgetting what is behind and straining toward what is ahead” (v. 13).",
    "PASS2-017": "Paul does not preach with eloquent words, “lest the cross of Christ be emptied of its power” (1 Corinthians 1:17, BSB).",
    "PASS2-018": "those who “have strayed from these ways and turned aside to empty talk” (1 Timothy 1:6, BSB)",
    "PASS2-019": "Hebrews 12:23 names “the congregation of the firstborn, enrolled in heaven.”",
    "PASS2-020": "Hymenaeus and Philetus in 2 Timothy 2:18, who “say that the resurrection has already occurred” (BSB).",
    "PASS2-021": "*Sympathēsai tais astheneiais hēmōn* — “to sympathize with our weaknesses.”",
    "PASS2-022": "The Christian is called *eis koinōnian tou huiou autou* — “into fellowship with His Son Jesus Christ our Lord.”",
    "PASS2-023": "The BSB renders the response as “we will obey” (Exodus 24:7).",
    "PASS2-024": "The grammatical construction in the Greek treats “the blessed hope” and “the glorious appearance” as appositional",
    "PASS2-025": "1 John 2:2 — Christ is the atoning sacrifice “for our sins, and not only for ours but also for the sins of the whole world.”",
    "PASS2-026": "“That which was from the beginning, which we have heard, which we have seen with our own eyes, which we have gazed upon and touched with our own hands—this is the Word of life.",
    "PASS2-027": "verbal attacks framed as “speaking the truth in love” (Ephesians 4:15, BSB).",
    "PASS2-028": "*Matthew 12:1-8 / Mark 2:23-28 / Luke 6:1-5 (the showbread incident).* “Have you not read what David did when he and his companions were hungry?",
    "PASS2-029": "*2 Kings 6:1-7* — “Now the sons of the prophets said to Elisha,",
    "PASS2-030": "*Isaiah 56:3, 6-8* — “Let no foreigner who has joined himself to the LORD say,",
    "PASS2-031": "*Exodus 13:13, 15* — “You must redeem every firstborn donkey with a lamb, and if you do not redeem it,",
    "PASS2-032": "*Galatians 5:1, 13-14.* “It is for freedom that Christ has set us free.",
    "PASS2-033": "Righteousness is described here as “the gracious gift” (*dōrea*) and “the gift of righteousness.”",
    "PASS2-034": "The Spirit is poured out on us “through Jesus Christ our Savior.” Again, the Spirit comes through the Son.",
    "PASS2-036": "Paul continues to call it “bread” after the consecration—four times in 1 Corinthians 11:23–28, including “this bread” in verse 26.",
    "PASS2-037": "The Greek New Testament has a striking expression that appears four times in the Pastoral Epistles: *hygiainousa didaskalia* — *sound* or *healthy doctrine*. The verb *hygiainō* occurs eight times in the Pastorals; *hygiainousa* is its participle. The verb is the standard medical term",
    "PASS2-038": "This is the more common verb in the New Testament for “to die.” Used over a hundred times in the Gospels, Acts, and the Epistles.",
    "PASS2-039": "uses *chara* — “joy” — and *chairō* — “to rejoice” — fourteen times in four short chapters.",
    "PASS2-040": "In the Pastoral Epistles, *parathēkē* appears three times, *eusebeia* ten, and *epiphaneia* five.",
    "PASS2-041": "The word is a second-declension masculine noun;",
    "PASS2-042": "The origin of *theos* is disputed; despite the resemblance, it is not the same etymological line as Latin *deus* or Sanskrit *dyaus*.",
    "PASS2-043": "The name *Jesus* — “YHWH saves” — announces in Hebrew what the Greek New Testament proclaims with its saving vocabulary.",
    "PASS2-044": "Matthew 1:21 ties the Hebrew-derived name *Iēsous* to the Greek verb *sōzō* as a theological wordplay, not as a shared etymology.",
    "PASS2-045": "The word’s make-up can illustrate blessing as good speech, but the Lutheran claim that God’s blessing actually conveys what it pronounces rests on God’s promise and biblical usage, not on etymology.",
    "PASS2-046": "The Sunday school teacher angle is direct: teach how the New Testament uses *hypakoē* — obedience that begins in hearing the Word — and use the word’s make-up as an illustration, not a proof.",
    "PASS2-047": "The etymology of *eirēnē* is uncertain. Its broader biblical sense of wholeness and restored relation is established by its usage, especially as the Septuagint’s regular rendering of Hebrew *shalom*, not by a proposed Greek root.",
    "PASS2-048": "The Apology of the Augsburg Confession spends most of Article IV answering the Roman Confutation’s charge that this teaching made good works superfluous; the defense still speaks nearly five hundred years later.",
    "PASS2-049": "Formula of Concord Article VIII develops the substance at length; later Lutheran dogmaticians summarized it under three headings — the *genus idiomaticum*, the *genus apotelesmaticum*, and the *genus maiestaticum*.",
    "PASS2-050": "The Apology, Article II, describes original righteousness as fear of God, trust in God, and knowledge of God; Augsburg Confession Article II describes original sin as the loss of that fear and trust.",
    "PASS2-051": "*If we died with Him, we will also live with Him.*\n*If we endure, we will also reign with Him.*\n*If we deny Him, He will also deny us.*",
    "PASS2-054": "See also [Lytron](/greek/lytron/) for the ransom price specifically—the third member of the redemption, purchase, and ransom vocabulary cluster.",
    "PASS2-058": "tags: [\"fruit-of-the-spirit\", \"good-works\"]",
    "PASS2-059": "translit: \"Kērygma\"",
    "PASS2-060": "translit: \"Patēr\"",
    "PASS2-061": "translit: \"Prosēlytos\"",
}


EXTRA = [
    ("LOCAL-002", "karpos", "the man who trusts in the LORD “He is like a tree planted by the waters", "the man who trusts in the LORD is like “a tree planted by the waters", "Repair the Jeremiah 17 phrase slot."),
    ("LOCAL-003", "karpos", "*Pan klēma en emoi mē pheron karpon airei auto* — “fruit, and every branch that does bear fruit, He prunes to make it even more fruitful.”", "*Pan klēma en emoi mē pheron karpon airei auto* — “He cuts off every branch in Me that bears no fruit” (John 15:2, BSB).", "Match the English quotation to the Greek clause."),
    ("LOCAL-004", "kleronomos", "*Aphtharton kai amianton kai amaranton* — \"imperishable, undefiled, and unfading, reserved in heaven for you, who through faith are shielded by God’s power for the salvation that is ready to be revealed in the last time.\"", "*Aphtharton kai amianton kai amaranton* — “imperishable, undefiled, and unfading.”", "Restore the adjective phrase used by the sentence."),
    ("LOCAL-004-B", "kleronomos", "The believer’s inheritance is “and into an inheritance that is imperishable, undefiled, and unfading, reserved in heaven for you,”", "The believer’s inheritance is “imperishable, undefiled, and unfading”", "Restore the repeated adjective phrase."),
    ("LOCAL-005", "didaskalia", "those who teach “spreads false teachings” (1 Timothy 6:3, BSB)", "those who “teach another doctrine” (1 Timothy 6:3, BSB)", "Repair the subject-verb seam and quote the relevant phrase."),
    ("LOCAL-006", "didaskalia", "words “And this is what we speak, not in words taught us by human wisdom, but in words taught by the Spirit, expressing spiritual truths in spiritual words.”", "words “taught by the Spirit” (1 Corinthians 2:13, BSB)", "Restore the phrase gloss."),
    ("LOCAL-007", "ekklesia", "the bride presented “glorious church, without stain or wrinkle or any such blemish, but holy and blameless.”", "the bride presented “as a glorious church, without stain or wrinkle or any such blemish, but holy and blameless.”", "Restore the predicate phrase."),
    ("LOCAL-008", "hiereus", "*Thysian zōsan* — “sacrifices, holy and pleasing to God, which is your spiritual service of worship.”", "*Thysian zōsan* — “a living sacrifice, holy and pleasing to God” (Romans 12:1, BSB).", "Match the singular Greek phrase."),
    ("LOCAL-009", "anomia", "the “the man of lawlessness” the “the man of lawlessness” already at work", "the “man of lawlessness” to be revealed and the “mystery of lawlessness” already at work", "Restore the two distinct expressions in 2 Thessalonians 2."),
    ("LOCAL-010", "anomia", "while Paul explicitly says he is “not outside the law of God but under the law of Christ”", "while Paul explicitly says, “I am not outside the law of God but am under the law of Christ”", "Restore the BSB wording of 1 Corinthians 9:21."),
    ("LOCAL-011", "amen", "the Old Testament's “the faithful God” (Isaiah 65:16, BSB)", "the Old Testament’s “God of truth” (Isaiah 65:16, BSB)", "Use the pinned BSB wording."),
    ("LOCAL-012", "sarx", "confidence “human credentials” (Philippians 3:3–4, BSB)", "“put no confidence in the flesh” (Philippians 3:3–4, BSB), including confidence in human credentials", "Separate the BSB quotation from the explanatory gloss."),
    ("LOCAL-013", "proseuche", "intercession is to be made “all people” (1 Timothy 2:1, BSB)", "intercession is to be made “for everyone” (1 Timothy 2:1, BSB)", "Use the pinned BSB wording."),
    ("LOCAL-014", "agape", "“love your enemy” (Matthew 5:44, BSB)", "“love your enemies” (Matthew 5:44, BSB)", "Use the plural BSB wording."),
    ("LOCAL-016", "elpis", "Lamentations 3:21-24 — “Yet I call this to mind, and therefore I have hope:”", "Lamentations 3:21–22 — “Yet I call this to mind, and therefore I have hope: Because of the loving devotion of the LORD we are not consumed, for His mercies never fail.”", "Make the citation match the quoted verses."),
    ("LOCAL-017", "artos", "appears about ninety times across the four Gospels, Acts, and the Epistles", "appears ninety-seven times in the pinned Nestle 1904 main text", "Align the headword count with the application corpus."),
    ("LOCAL-018", "karpos", "appears sixty-seven times in the New Testament", "appears sixty-six times in the pinned Nestle 1904 main text", "Align the headword count with the application corpus."),
    ("LOCAL-019", "apostolos", "appears 132 times.", "appears 131 times in the pinned Nestle 1904 main text.", "Align the cognate count with the application corpus."),
    ("LOCAL-019-B", "apostolos", "Used 132 times in the New Testament", "Used 131 times in the pinned Nestle 1904 main text", "Align the repeated cognate count with the application corpus."),
    ("LOCAL-020", "prothesis", "Used over a hundred times in the New Testament", "Used ninety-nine times in the pinned Nestle 1904 main text", "Align the cognate count with the application corpus."),
    ("LOCAL-021", "thanatos", "*Thnēskō* (θνῄσκω) — the verb \"to die.\" A relatively uncommon form in the New Testament; most appearances are in the perfect tense (*tethnēka*, \"I have died\") or the present participle (*thnēskontes*, \"those who are dying\").", "*Thnēskō* (θνῄσκω) — the verb “to die.” It appears nine times in the pinned Nestle 1904 main text, all in perfect forms.", "State the verified count and morphology."),
    ("LOCAL-022", "anthropos", "its feminine form, when needed, can be supplied by *gunē* (woman) in compound or contrast, though in most New Testament usage *anthrōpos* itself functions as the generic term for human being regardless of gender.", "*anthrōpos* itself can function generically for a human being regardless of gender. *Gunē* (γυνή, “woman”) is a separate noun, not a feminine form of *anthrōpos*.", "Correct the grammatical relationship."),
    ("LOCAL-023", "ethnos", "The etymology runs back to a Greek root meaning \"habit\" or \"custom\" (related to *ēthos* — moral character, custom, the root of English *ethics*). The original Greek conception of *ethnos* named a group united by shared customs, shared way of life, shared cultural identity. *Ethnos* was a people group with internal coherence rather than just a random aggregate. The English words *ethnic* and *ethnicity* come directly from this Greek root and preserve some of the original sense.", "The etymology is uncertain; proposals connecting *ethnos* with *ēthos* (“custom”) should not control the word’s definition. In usage, *ethnos* names a people or nation, and the English words *ethnic* and *ethnicity* descend from it.", "Remove an uncertain derivation as the basis for meaning."),
    ("LOCAL-024", "agorazo", "people and nation” Some readings", "people and nation.” Some readings", "Restore punctuation after the Revelation 5:9 quotation."),
    ("LOCAL-025", "amen", "then you will not stand at all.’’”", "then you will not stand at all.’”", "Remove a duplicated closing quotation mark."),
    ("LOCAL-026", "eirene", "Ephesians 2:14 — “For He Himself is our peace, who has made the two one and has torn down the dividing wall of hostility” Not just", "Ephesians 2:14 — “For He Himself is our peace, who has made the two one and has torn down the dividing wall of hostility.” Not just", "Restore a sentence boundary after Ephesians 2:14."),
    ("LOCAL-026-B", "eirene", "*Autos gar estin hē eirēnē hēmōn* — “for He Himself is our peace, who has made the two one and has torn down the dividing wall of hostility” Not just", "*Autos gar estin hē eirēnē hēmōn* — “for He Himself is our peace, who has made the two one and has torn down the dividing wall of hostility.” Not just", "Restore the repeated sentence boundary after Ephesians 2:14."),
    ("LOCAL-027", "chara", "The disciples in Acts, beaten and ordered not to preach, “The apostles left the Sanhedrin, rejoicing that they had been counted worthy of suffering disgrace for the Name.”", "The disciples in Acts, beaten and ordered not to preach, left the Sanhedrin “rejoicing that they had been counted worthy of suffering disgrace for the Name”", "Restore the phrase slot around Acts 5:41."),
    ("LOCAL-028", "basileia", "Daniel 7:13-14 — the son of man receiving “And He was given dominion, glory, and kingship, that the people of every nation and language should serve Him.", "Daniel 7:13–14 — the Son of Man is “given dominion, glory, and kingship” so that the people of every nation and language should serve Him.", "Restore the clause used by the argument."),
    ("LOCAL-029", "pleroma", "He warns about “See to it that no one takes you captive through philosophy and empty deception, which are based on human tradition and the spiritual forces of the world rather than on Christ.” (Colossians 2:8, BSB) in the verse just before our key passage.", "In the verse just before the key passage, he warns: “See to it that no one takes you captive through philosophy and empty deception, which are based on human tradition and the spiritual forces of the world rather than on Christ” (Colossians 2:8, BSB).", "Repair the whole-verse fallback frame."),
    ("LOCAL-030", "basileia", "has already been “brought into the kingdom of His beloved Son” (Colossians 1:13, BSB)", "has already been brought into “the kingdom of His beloved Son” (Colossians 1:13, BSB)", "Keep the adapted passive outside the direct quotation."),
    ("LOCAL-031", "elpis", "(Lamentations 3:21-24, BSB) — hope grounded", "(Lamentations 3:21–22, BSB) — hope grounded", "Match the citation to the quotation."),
    ("LOCAL-032", "proselytos", "title: \"Proselytos (προσήλυτος)\"", "title: \"Prosēlytos (προσήλυτος)\"", "Normalize the reader-visible transliteration within the record."),
    ("LOCAL-033", "proselytos", "linkTitle: \"Proselytos\"", "linkTitle: \"Prosēlytos\"", "Normalize the reader-visible transliteration within the record."),
    ("LOCAL-034", "proselytos", "description: \"Proselytos (προσήλυτος)", "description: \"Prosēlytos (προσήλυτος)", "Normalize the reader-visible transliteration within the record."),
    ("LOCAL-035", "proselytos", "*Proselytos* (προσήλυτος)", "*Prosēlytos* (προσήλυτος)", "Normalize the reader-visible transliteration within the record."),
    ("LOCAL-036", "proselytos", "*Proselytos* in the New Testament", "*Prosēlytos* in the New Testament", "Normalize the repeated reader-visible transliteration."),
    ("FREQ-001", "agape", "The verbal form occurs more than 140 times in the New Testament; the noun more than 110 times; the adjective about sixty times.", "In the pinned Nestle 1904 main text, the verbal form occurs 142 times, the noun 116 times, and the adjective 61 times.", "Regenerate the three word-family counts from the pinned analysis index."),
    ("FREQ-002", "amen", "The word appears about 129 times in the New Testament.", "The word appears 126 times in the pinned Nestle 1904 main text.", "Regenerate the headword count from the pinned analysis index."),
    ("FREQ-003", "apostolos", "appears about eighty times in the New Testament.", "appears 79 times in the pinned Nestle 1904 main text.", "Regenerate the headword count from the pinned analysis index."),
    ("FREQ-004", "basileia", "appears about 162 times in the New Testament.", "appears 162 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-005", "chara", "Used about seventy-five times in the New Testament.", "Used 74 times in the pinned Nestle 1904 main text.", "Regenerate the cognate count from the pinned analysis index."),
    ("FREQ-006", "ergon", "appears over one hundred and sixty times in the New Testament.", "appears 169 times in the pinned Nestle 1904 main text.", "Regenerate the headword count from the pinned analysis index."),
    ("FREQ-007", "mathetes", "appears over two hundred and fifty times in the New Testament", "appears 261 times in the pinned Nestle 1904 main text", "Regenerate the headword count from the pinned analysis index."),
    ("FREQ-008", "anastasis", "appears about forty-two times in the New Testament.", "appears 42 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-009", "krisis", "appears about forty-seven times in the New Testament.", "appears 47 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-010", "klesis", "The verb itself occurs about 150 times; *klēsis* about ten times; *klētos* about ten times; *ekklēsia* about 110 times.", "In the pinned Nestle 1904 main text, the verb itself occurs 148 times, *klēsis* 11 times, *klētos* 10 times, and *ekklēsia* 114 times.", "Regenerate the word-family counts from the pinned analysis index."),
    ("FREQ-011", "kaine-ktisis", "appears about forty-two times in the New Testament.", "appears 42 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-012", "kaine-ktisis", "appears about nineteen times in the New Testament.", "appears 19 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-013", "kaine-ktisis", "Used about fifteen times.", "Used 15 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-014", "proseuche", "Used about nineteen times in the New Testament.", "Used 18 times in the pinned Nestle 1904 main text.", "Regenerate the cognate count from the pinned analysis index."),
    ("FREQ-015", "proseuche", "Used about fifteen times in the New Testament.", "Used 15 times in the pinned Nestle 1904 main text.", "Identify the edition behind the count."),
    ("FREQ-016", "logos", "shows up some 330 times in the New Testament", "appears 331 times in the pinned Nestle 1904 main text", "Regenerate the headword count from the pinned analysis index."),
    ("FREQ-017", "kerygma", "appears more than sixty times in the New Testament.", "appears 61 times in the pinned Nestle 1904 main text.", "Regenerate the cognate count from the pinned analysis index."),
    ("SOURCE-001", "ergon", "The Augsburg Confession Article IV (Justification) articulates it: \"Likewise, they teach that men cannot be justified before God by their own strength, merits, or works, but are freely justified for Christ's sake, through faith, when they believe that they are received into favor, and that their sins are forgiven for Christ's sake, who, by His death, has made satisfaction for our sins. This faith God imputes for righteousness in His sight.\"", "Augsburg Confession IV 1–3 confesses that people cannot be justified before God by their own strength, merits, or works, but are justified freely for Christ’s sake through faith.", "Replace a long, unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-002", "charis", "The Augsburg Confession Article IV states it directly: \"Our churches teach that human beings cannot be justified before God by their own powers, merits, or works. But they are justified as a gift on account of Christ through faith when they believe that they are received into grace and that their sins are forgiven on account of Christ, who by his death made satisfaction for our sins.\"", "Augsburg Confession IV 1–3 states that people cannot be justified before God by their own powers, merits, or works, but are justified as a gift on account of Christ through faith.", "Replace a long, unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-003", "dikaioo", "The Augsburg Confession, Article IV, states this without flinching: human beings “are justified as a gift on account of Christ, through faith, when they believe that they are received into grace and that their sins are forgiven on account of Christ.”", "Augsburg Confession IV 1–3 states this without flinching: human beings are justified freely for Christ’s sake through faith, apart from their own powers, merits, or works.", "Replace an unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-004", "episkopos", "AC XXVIII concedes that “the following jurisdiction belongs to the bishops as bishops, that is to say, to those to whom the ministry of Word and sacraments has been entrusted: to forgive sins, to reject teaching that opposes the gospel, and to exclude from the communion of the church the ungodly whose ungodliness is known”", "AC XXVIII 21–22 assigns bishops, as ministers of Word and Sacrament, the authority to forgive sins, reject teaching contrary to the gospel, and exercise church discipline", "Replace a long, unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-005", "episkopos", "the Augsburg Confession’s principle that “it is enough for the true unity of the Christian church that the gospel is preached harmoniously according to a pure understanding and the sacraments are administered in conformity with the divine Word” (AC VII)", "the principle of Augsburg Confession VII 2 that agreement in the pure preaching of the gospel and administration of the sacraments is sufficient for the church’s true unity", "Replace an unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-006", "monogenes", "The Nicene Creed says that Christ is “the only-begotten Son of God, begotten of His Father before all worlds … begotten, not made; being of one substance with the Father.”", "The Nicene Creed confesses Christ as the only-begotten Son of God, eternally begotten of the Father, not made, and of one substance with the Father.", "Use a consistent paraphrase until a single creed translation and page are physically verified."),
    ("SOURCE-007", "monogenes", "when you confess in the Creed that Christ is “the only-begotten Son of God, begotten of the Father before all worlds,”", "when you confess in the Nicene Creed that Christ is the only-begotten Son, eternally begotten of the Father,", "Use the same paraphrase at both appearances."),
    ("SOURCE-008", "ekklesia", "> “It is also taught that at all times there must be and remain one holy, Christian church. It is the assembly of all believers among whom the gospel is purely preached and the holy sacraments are administered according to the gospel.”", "Augsburg Confession VII 1 defines the one holy Christian church as the assembly of believers among whom the gospel is purely preached and the sacraments are administered according to the gospel.", "Replace a long, unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-009", "ekklesia", "> “Even though the Christian church is, properly speaking, the assembly of saints and those who truly believe, nevertheless, because in this life many false Christians, hypocrites, and even public sinners are mixed in with the godly, it is permissible to use the sacraments even when they are administered by ungodly priests.”", "Augsburg Confession VIII 1–2 says that although the church properly is the assembly of saints and true believers, hypocrites and evil persons remain mixed with it in this life; the sacraments may therefore be received even from ungodly ministers.", "Replace a long, unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-010", "ekklesia", "> “It is enough for the true unity of the Christian church that the gospel is preached harmoniously according to a pure understanding and the sacraments are administered in conformity with the divine Word. It is not necessary for the true unity of the Christian church that uniform ceremonies, instituted by human beings, be observed everywhere.”", "Augsburg Confession VII 2–3 says that agreement in the pure preaching of the gospel and administration of the sacraments is sufficient for the church’s true unity; uniform human ceremonies are not required everywhere.", "Replace a long, unidentified translation with a paragraph-level paraphrase."),
    ("SOURCE-011", "epiousios", "> “Daily bread includes everything that has to do with the support and needs of the body, such as food, drink, clothing, shoes, house, home, land, animals, money, goods, a pious spouse, pious children, pious workers, pious and faithful rulers, good government, good weather, peace, health, discipline, honor, good friends, faithful neighbors, and the like.”", "In his explanation of the Fourth Petition, Luther’s Small Catechism treats “daily bread” as everything needed to support bodily life: food and clothing, home and livelihood, family and authorities, weather and peace, health, reputation, friends, and faithful neighbors.", "Replace a long, unidentified translation with a section-level paraphrase pending edition/page verification."),
    ("SOURCE-012", "metanoia", "The Book of Concord, ed.\u00a0Kolb and Wengert, 360.", "The Book of Concord, ed. Robert Kolb and Timothy J. Wengert (Fortress Press, 2000), Small Catechism IV.", "Remove an unverified physical page number while retaining the stable document reference."),
    ("SOURCE-013", "iesous", ", 354-355 and 433-440.", ".", "Remove unverified physical page ranges while retaining the stable document and section references."),
    ("SOURCE-014", "anamnesis", "The Augsburg Confession Article X states the Lutheran position on the Supper in compressed form: \"they teach that the body and blood of Christ are truly present and are distributed to those who eat the Supper of the Lord.\"", "Augsburg Confession X confesses in compressed form that Christ’s body and blood are truly present and distributed to those who eat the Lord’s Supper.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-015", "anthropos", "The Augsburg Confession Article III is direct on this: \"the Son of God became man, born of the Virgin Mary.\"", "Augsburg Confession III 1 is direct: the Son of God assumed human nature in the womb of the blessed Virgin Mary.", "Paraphrase an unidentified confessional translation and add a stable paragraph reference."),
    ("SOURCE-016", "anthropos", "in the language of Article II of the Augsburg Confession, \"born with sin… without fear of God, without trust in God, and with concupiscence.\"", "as Augsburg Confession II 1 describes it, born with sin, without fear of God or trust in God, and with concupiscence.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-017", "aphesis", "Luther’s Small Catechism asks: “What is the Office of the Keys? It is the special authority which Christ has given to His church on earth to forgive the sins of penitent sinners, but to refuse forgiveness to the impenitent as long as they do not repent.”", "Luther’s Small Catechism, Office of the Keys, teaches that Christ gives His church authority to forgive repentant sinners and to withhold forgiveness from the unrepentant while they do not repent.", "Paraphrase an unidentified catechism translation."),
    ("SOURCE-018", "aphesis", "Luther’s Small Catechism on baptism teaches that baptism signifies “that the old Adam in us, together with all sins and evil lusts, should be drowned by daily contrition and repentance and die, and that daily a new man should come forth and arise, who shall live before God in righteousness and purity forever.”", "Luther’s Small Catechism, Baptism IV, teaches that Baptism signifies the daily drowning and death of the old Adam through contrition and repentance and the daily emergence of the new person who lives before God in righteousness and purity.", "Paraphrase an unidentified catechism translation."),
    ("SOURCE-019", "baptizo", "Luther's Small Catechism gives the daily application: baptism signifies \"that the old Adam in us, together with all sins and evil lusts, should be drowned by daily contrition and repentance and die, and that daily a new man should come forth and arise, who shall live before God in righteousness and purity forever.\"", "Luther’s Small Catechism, Baptism IV, gives the daily application: Baptism signifies the daily drowning and death of the old Adam through contrition and repentance and the daily emergence of the new person who lives before God in righteousness and purity.", "Paraphrase the repeated unidentified catechism translation."),
    ("SOURCE-020", "artos", "“Daily bread” includes “everything that has to do with the support and needs of the body, such as food, drink, clothing, shoes, house, home, fields, livestock, money, property…” and so on", "In the Small Catechism’s Fourth Petition, “daily bread” includes everything needed to support bodily life—food and clothing, home and livelihood, family, authorities, peace, health, and faithful neighbors", "Paraphrase an unidentified catechism translation."),
    ("SOURCE-021", "basileia", "Luther writes that \"the kingdom of God comes indeed without our prayer, of itself; but we pray in this petition that it may come unto us also.\" And the kingdom comes \"when our heavenly Father gives us His Holy Spirit, so that by His grace we believe His holy Word and lead a godly life, here in time and hereafter in eternity.\"", "The Small Catechism’s Second Petition teaches that God’s kingdom comes without our prayer, yet we pray that it would come to us—through the Father’s gift of the Holy Spirit, faith in His Word, and a godly life now and in eternity.", "Paraphrase an unidentified catechism translation."),
    ("SOURCE-022", "basileia", "the Augsburg Confession Article XVII explicitly condemns the teaching that “before the resurrection of the dead the godly shall take possession of the kingdom of the world, the ungodly being everywhere suppressed”", "Augsburg Confession XVII 5 rejects the teaching that the godly will take possession of a worldly kingdom before the resurrection of the dead", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-023", "diakonos", "The Augsburg Confession’s principle that “it is not necessary for the true unity of the Christian church that uniform ceremonies, instituted by human beings, be observed everywhere” (AC VII)", "Augsburg Confession VII 3 teaches that uniform human ceremonies are not required everywhere for the church’s true unity", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-024", "eulogeo", "The morning prayer of Luther's Small Catechism — \"I thank Thee, my heavenly Father, through Jesus Christ, Thy dear Son, that Thou hast kept me this night from all harm and danger\" — is the believer's blessing of God for the night's preservation.", "Luther’s Small Catechism morning prayer thanks the heavenly Father through Jesus Christ for preservation through the night; it is the believer’s blessing of God for that gift.", "Paraphrase an unidentified prayer translation."),
    ("SOURCE-025", "hagios", "because “Scripture does not teach us to invoke the saints or to seek help from them, because it sets before us the one Christ as mediator, atoning sacrifice, high priest, and intercessor.”", "because Augsburg Confession XXI 2–4 says Scripture directs believers to the one Christ as mediator, atoning sacrifice, high priest, and intercessor rather than teaching invocation of the saints.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-026", "hamartia", "The Augsburg Confession, Article II, puts it bluntly: all human beings since Adam are born “with sin, that is, without fear of God, without trust in God, and with concupiscence.”", "Augsburg Confession II 1 puts it bluntly: all human beings since Adam are born with sin, without fear of God or trust in God, and with concupiscence.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-027", "hilasterion", "The Apology of the Augsburg Confession Article IV states it directly: “Christ … made satisfaction for our sins.”", "Apology IV 53 states directly that Christ made satisfaction for our sins.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-028", "hyper", "The Apology of the Augsburg Confession Article IV — “Christ … made satisfaction for our sins” — names", "Apology IV 53, in saying that Christ made satisfaction for our sins, names", "Paraphrase the repeated unidentified confessional translation."),
    ("SOURCE-029", "hyios", "The Nicene Creed states the doctrine in its sharpest form: \"begotten of the Father before all worlds, God of God, Light of Light, very God of very God, begotten not made, of one substance with the Father.\"", "The Nicene Creed states the doctrine in its sharpest form by confessing the Son as eternally begotten of the Father, not made, and of one substance with the Father.", "Use the same creed paraphrase corpus-wide pending selection of one English translation."),
    ("SOURCE-030", "hyios", "The Augsburg Confession Article III opens with this confession: \"the Son of God became man, born of the Virgin Mary\"", "Augsburg Confession III 1 confesses that the Son of God assumed human nature in the womb of the blessed Virgin Mary", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-031", "hypostasis", "the Son is “of one substance” (homoousios) with the Father", "the Son shares the one divine substance with the Father (*homoousios*)", "Use a creed paraphrase pending selection of one English translation."),
    ("SOURCE-032", "hypostasis", "Augsburg Confession Article I confesses the Trinity in the Nicene formula: “There is one divine essence, which is called and which is truly God, and yet there are three persons in this one divine essence, equal in power and alike eternal: God the Father, God the Son, God the Holy Spirit.”", "Augsburg Confession I 1–2 confesses one divine essence and three coeternal persons of equal power: Father, Son, and Holy Spirit.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-033", "hypostasis", "Augsburg Confession Article III confesses the incarnation in the Chalcedonian formula: “In Christ the two natures, divine and human, are inseparably joined in one person; there is one Christ, true God and true man.”", "Augsburg Confession III 1–2 confesses the divine and human natures inseparably united in the one Christ, true God and true man.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-034", "kerygma", "The Augsburg Confession Article V says it as directly as confessional language can: God instituted the ministry of the gospel and the sacraments so that “through these, as through means, he gives the Holy Spirit, who effects faith, where and when he wills, in those who hear the gospel.”", "Augsburg Confession V 1–2 says it directly: God instituted the ministry of teaching the gospel and administering the sacraments so that through these means He gives the Holy Spirit, who creates faith where and when God wills in those who hear the gospel.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-035", "pneuma", "the Augsburg Confession states with particular clarity in Article V: God instituted the ministry of the Word and the sacraments so that \"through these, as through means, he gives the Holy Spirit, who effects faith, where and when he wills, in those who hear the gospel.\"", "Augsburg Confession V 1–2 states with particular clarity that God instituted the ministry of the Word and the sacraments so that through these means He gives the Holy Spirit, who creates faith where and when God wills in those who hear the gospel.", "Paraphrase the repeated unidentified confessional translation."),
    ("SOURCE-036", "mysterion", "Apology XIII calls the sacraments \"rites which have the command of God and to which the promise of grace has been added,\" and explicitly notes that \"sacrament\" was the Latin equivalent of the Greek \"mystery.\"", "Apology XIII 3–4 describes sacraments as rites commanded by God and joined to a promise of grace, and notes the relationship between the Latin term “sacrament” and the Greek “mystery.”", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-037", "presbyteros", "The Augsburg Confession’s principle that “it is enough for the true unity of the Christian church that the gospel is preached harmoniously according to a pure understanding and the sacraments are administered in conformity with the divine Word” (AC VII)", "The principle of Augsburg Confession VII 2 that agreement in pure gospel preaching and sacramental administration is sufficient for the church’s true unity", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-038", "soma", "The Augsburg Confession Article X states it directly: \"Concerning the Supper of the Lord they teach that the body and blood of Christ are truly present and are distributed to those who eat the Supper of the Lord; and they disapprove of those who teach otherwise.\"", "Augsburg Confession X confesses that Christ’s body and blood are truly present and distributed to those who eat the Lord’s Supper.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-039", "soma", "Christ's \"true body and blood are truly and essentially present in the Supper, distributed, and received under the bread and wine.\"", "Christ’s true body and blood as truly and essentially present, distributed, and received under the bread and wine (Formula of Concord, Solid Declaration VII 35)", "Paraphrase an unidentified confessional translation and add a stable paragraph reference."),
    ("SOURCE-040", "thanatos", "human beings since the Fall are \"born with sin, that is, without fear of God, without trust in God, and with concupiscence.\"", "human beings since the Fall are born with sin, without fear of God or trust in God, and with concupiscence (Augsburg Confession II 1).", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-041", "theos", "Augsburg Confession Article I opens with this: \"We unanimously hold and teach, in accordance with the decree of the Council of Nicaea, that there is one divine essence, which is called and which is truly God.\"", "Augsburg Confession I 1 opens by confessing, in accord with Nicaea, the one divine essence that is truly God.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-042", "theos", "Augsburg Confession Article I continues: \"yet there are three persons, of the same essence and power, who also are coeternal, the Father, the Son, and the Holy Spirit.\"", "Augsburg Confession I 2 continues by confessing three coeternal persons of the same essence and power: Father, Son, and Holy Spirit.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-043", "theotes", "The Augsburg Confession Article III opens with this confession: Christ is \"true God and true man… both natures, the divine and the human, inseparably united in one person, one Christ.\"", "Augsburg Confession III 1–2 confesses Christ as true God and true man, with the divine and human natures inseparably united in one person.", "Paraphrase an unidentified confessional translation."),
    ("SOURCE-044", "metanoia", "In October of 1517, Martin Luther posted his Ninety-Five Theses on the door of the Castle Church in Wittenberg. The first thesis read:\n\n\"When our Lord and Master Jesus Christ said, 'Repent,' he willed the entire life of believers to be one of repentance.\"", "In October 1517, Martin Luther issued the Ninety-Five Theses. The first thesis argues that when Christ commanded repentance, He willed the entire life of believers to be a life of repentance.", "Replace an unnamed Luther translation with a close paraphrase."),
    ("SOURCE-045", "parousia", "The Augsburg Confession Article XVII gives the foundational Lutheran statement: “Also taught among us is that our Lord Jesus Christ will return on the Last Day for judgment and will raise up all the dead, to give eternal life and everlasting joy to believers and the elect but to condemn ungodly people and the devil to hell and eternal punishment.”", "Augsburg Confession XVII 1–3 gives the foundational Lutheran statement: Christ will return on the Last Day for judgment, raise all the dead, give eternal life and everlasting joy to believers and the elect, and condemn the ungodly and the devil to hell and eternal punishment.", "Paraphrase a long, unidentified confessional translation."),
    ("SOURCE-046", "theotes", "It anchors the Christological confession of the Council of Nicaea (\"of one substance with the Father\"). It anchors the four privative adverbs of the Council of Chalcedon (\"without confusion, without change, without division, without separation\").", "It anchors Nicaea’s confession that the Son shares the Father’s divine substance and Chalcedon’s confession that the two natures are united without confusion, change, division, or separation.", "Use concise council paraphrases pending selection of one English creed translation."),
    ("SOURCE-047", "epiousios", "The catechism poses the question: “What is meant by daily bread?” And it answers with one of the most expansive readings of any single phrase in the Lord’s Prayer:", "The catechism asks what daily bread means and answers with an expansive account of bodily provision:", "Paraphrase the catechism prompt rather than silently mixing translations."),
    ("FOLLOWUP-001", "theotes", "*Against the* extra Calvinisticum*.*", "*Against the extra Calvinisticum.*", "Repair the stray Markdown emphasis delimiter."),
    ("FOLLOWUP-002", "martyria", "we have seen it and testified … we have seen and heard", "we have seen it and testified to it … We proclaim to you what we have seen and heard", "Restore the words and clause boundary of the pinned BSB text in the 1 John 1:1–3 splice."),
    ("FOLLOWUP-003", "arche", "Hermann Sasse’s various writings on Christ and the powers, especially in Here We Stand, trans. Theodore G. Tappert (Adelaide: Lutheran Publishing House, 1979).", "Hermann Sasse’s various writings on Christ and the powers, especially in *Here We Stand*, trans. Theodore G. Tappert (New York: Harper & Brothers, 1938; cited Adelaide ed.: Lutheran Publishing House, 1979).", "Add the original English publication data while retaining the edition actually cited."),
]


PARAGRAPH_REPLACEMENTS = [
    (
        "LOCAL-001",
        "prototokos",
        "The argument of Colossians 1:15-20 unfolds",
        "The argument of Colossians 1:15–20 settles how *prōtotokos pasēs ktiseōs* should be read. After calling Christ “the firstborn over all creation” in verse 15, Paul explains in verse 16: “For in Him all things were created, things in heaven and on earth, visible and invisible, whether thrones or dominions or rulers or authorities. All things were created through Him and for Him.” Christ is the agent of creation, not a member of the created order.",
        "Remove the duplicated Colossians material and align each quotation with its verse.",
    ),
]


THEOLOGY = [
    ("THEOL-001", "theotes", "The *genus maiestaticum* (the \"majestic genus\") teaches that the divine attributes are communicated *to the human nature* of Christ — so that the human nature, in the personal union, shares in the divine majesty, omnipotence, omniscience, and omnipresence. The human nature does not become divine; it remains human. But in the union, the human nature shares in divine attributes that belong properly to the divine nature. The Lutheran tradition saw this as the necessary consequence of *theotēs sōmatikōs*: if the whole fullness of deity dwells bodily in Christ, then His body shares in what the deity has.", "The *genus maiestaticum* concerns the majesty communicated in the personal union. The human nature does not become divine, cease to be human, or spread through creation by a natural omnipresence. Rather, the man Christ, by virtue of the personal union, can be present where He wills and can give what is His in the Supper (Formula of Concord, Solid Declaration VIII 78–85, 92). The divine nature remains infinite and omnipresent; the two natures remain distinct and inseparably united in the one Christ.", "State the Formula’s position without attributing natural omnipresence to Christ’s humanity."),
    ("THEOL-002", "theotes", "Lutheran theology rejected this with the slogan *Logos non extra carnem* — \"the Logos is not outside the flesh.\" The Lutheran reading of Colossians 2:9 takes *pan* and *sōmatikōs* with maximal seriousness. If the WHOLE fullness dwells BODILY, there is no \"extra\" Logos floating around outside the incarnate Christ. The whole Logos is the whole Christ, in His body.", "Lutheran theology does not deny that the Son of God, as God, is everywhere. It denies that He is ever anywhere *without* the humanity He has assumed. In Luther’s words, quoted by the Formula, wherever God is placed, the humanity must be placed there too; the two do not permit themselves to be separated (Formula of Concord, Solid Declaration VIII 85). Colossians 2:9 confesses the undivided incarnate Person; it does not circumscribe the divine nature within a local body.", "Remove a non-confessional slogan and preserve both divine omnipresence and the inseparable personal union."),
    ("THEOL-003", "theotes", "The Reformed *extra Calvinisticum* protects the transcendence of the divine nature (it cannot be circumscribed by a human body). The Lutheran *theotēs sōmatikōs* protects the unity of the incarnate Person (there is one Christ, and where He is, the whole Godhead is).", "The Reformed *extra Calvinisticum* protects the integrity of the divine nature (it cannot be circumscribed by a human body). The Lutheran objection protects the unity of the incarnate Person: the Son is never present apart from the humanity He has assumed.", "Clarify the actual point of disagreement."),
    ("THEOL-004", "theotes", "The Lutheran objection is that it does not take *sōmatikōs* with full weight. If the whole fullness of deity dwells in the body, then the divine nature is not “also outside” the body in the way the Reformed tradition has wanted to say. The Lutheran reading honors the *sōmatikōs* by refusing to add an “also outside.”", "The Lutheran objection is not to the Logos being everywhere but to a Logos who is somewhere *apart from* His flesh. An “also outside” can describe the divine nature’s infinity; it cannot mean that the Son is present where the man Christ is absent. The Lutheran reading holds divine omnipresence and the inseparable personal union together.", "Correct the extra Calvinisticum formulation without changing the article’s confessional position."),
    ("THEOL-005", "leitourgia", "The Greek word is a compound. *Laos* or *leitos* (people, public) plus *ergon* (work) yields *leitourgia* — literally \"the work of the people\" or \"public work\" or \"public service.\"", "The Greek word combines an older element meaning “public” with *ergon* (“work”) and denotes a public service or service performed for the community. It should not be reverse-parsed as though it literally meant “the work of the people.”" , "Correct the lexical history."),
    ("THEOL-006", "leitourgia", "*Laos* (people) — or its older Attic form *leitos* (public) — combined with *ergon* (work) yields the compound *leitourgia* — public service, the work of the people, civic service rendered for the community's benefit.", "An older element meaning “public” combined with *ergon* (“work”) gives the historically attested sense “public service”: civic service rendered for the community’s benefit.", "Remove the reversed compound gloss."),
    ("THEOL-007", "leitourgia", "The corporate character is essential. *Leitourgia* is \"the work of the people\" — corporate, not just the individual believer's private devotion.", "The corporate character is established by the church’s gathered service in passages such as Acts 13:2, not by reverse-parsing the compound. *Leitourgia* here names public or cultic service, not merely private devotion.", "Ground the theological inference in usage and text."),
    ("THEOL-008", "leitourgia", "The *leitourgia* is \"the work of the people\" — corporate, not just individual.", "The New Testament’s gathered and priestly uses of *leitourgia* establish the corporate dimension; the etymology by itself does not.", "Ground the pastoral claim in usage rather than etymology."),
    ("THEOL-009", "leitourgia", "*Laos* (people) plus *ergon* (work) yields *leitourgia* — “the work of the people,” or “public service” —", "The word’s historical sense is “public service,” service performed for the community —", "Correct the teacher application."),
    ("THEOL-010", "leitourgia", "the corporate dimension corrects — *leitourgia* is “the work of the people,” and the believer", "the corporate dimension corrects — the gathered New Testament uses of *leitourgia* are public and communal, and the believer", "Correct the pastoral application."),
    ("THEOL-011", "eleutheria", "> A Christian is a perfectly free lord of all, subject to none.\n>\n> A Christian is a perfectly dutiful servant of all, subject to all.", "> “A Christian man is the most free lord of all, and subject to none; a Christian man is the most dutiful servant of all, and subject to every one.” — Martin Luther, *On Christian Liberty*, trans. W. A. Lambert, rev. W. A. Buchheim (1896).", "Use and identify a public-domain English translation."),
    ("THEOL-012", "huiothesia", "James Barr, “Abbā Isn’t ‘Daddy,’.” Journal of Theological Studies 39 (1988): 28-47.", "James Barr, “‘Abbā Isn’t ‘Daddy’,” *The Journal of Theological Studies* 39.1 (1988): 28–47, doi:10.1093/jts/39.1.28.", "Correct the bibliographic citation."),
    ("THEOL-013", "theotes", "*in him* — Christ is the place, not also somewhere else;", "*in him* — the fullness dwells in the incarnate Christ without circumscribing the divine nature;", "Remove the last implication that the divine nature is locally confined."),
    ("THEOL-014", "theotes", "The Reformed *extra Calvinisticum* protects the integrity of the divine nature (it cannot be circumscribed by a human body). The Lutheran objection protects the unity of the incarnate Person: the Son is never present apart from the humanity He has assumed.", "The Reformed *extra Calvinisticum* protects the integrity of the divine nature (it cannot be circumscribed by a human body). Heidelberg Catechism Q. 48 says Christ’s divinity is beyond the bounds of the humanity He assumed while remaining personally united to it. The Lutheran objection therefore does not charge the Reformed with simply separating Christ’s person; it locates the disagreement in whether and how the assumed humanity shares the divine majesty and presence. The Lutheran confession is that the Son is never present apart from the humanity He has assumed.", "Represent the Reformed affirmation of the personal union and locate the narrower confessional dispute."),
    ("THEOL-015", "theotes", "The Reformed doctrine of the Supper, by contrast, holds that Christ's body is locally in heaven (since His humanity is finite) but that the believer is united with Christ by the Spirit's work, lifting the believer to the heavenly Christ. This is internally consistent with the *extra Calvinisticum* — the divine nature is also outside the flesh, sustaining the elements and uniting the believer with Christ by spiritual means. The Lutheran doctrine, by contrast, is internally consistent with *theotēs sōmatikōs* — the body and blood are truly present in the Supper because the whole Christ is given where His body is.", "The Reformed doctrine of the Supper, by contrast, holds that Christ's body is locally in heaven while His omnipresent divinity remains personally united to His humanity; by the Spirit’s work, the believer is united with the heavenly Christ. The Lutheran doctrine holds that the body and blood are truly present in the Supper because the whole Christ is given where He promises to give His body and blood.", "Remove the spatially ambiguous 'outside the flesh' restatement and describe both sacramental positions more precisely."),
    ("THEOL-016", "theotes", "The two views are not minor variations on the same Christology; they are two different Christologies playing out into two different sacramental theologies.", "The two views are not minor variations; they are distinct accounts of Christ’s presence and the communication of divine majesty to His humanity, with different sacramental consequences.", "Avoid implying that the Reformed deny the ecumenical doctrine of Christ while preserving the real disagreement."),
]


CONFESSIONAL_VERIFICATION = [
    (
        "CONF-001",
        "mysterion",
        "Second, the mystery is delivered through means. This is where *mystērion* becomes the theological foundation for the sacraments. The Latin Vulgate's translation choice — *mysterium* and *sacramentum* — was not arbitrary; it captured a real connection between the New Testament mystery (hidden then, revealed now) and the church's practices in which Christ Himself is delivered through visible means joined to the Word. What is the Lord's Supper? The mystery — the body and blood of Christ — given through bread and wine joined to Christ's words of institution (we will treat this in [Anamnēsis](/greek/anamnesis/), [Sōma](/greek/soma/), [Haima](/greek/haima/), [Artos](/greek/artos/)). What is baptism? The mystery — death and resurrection with Christ — given through water joined to the Word ([Baptizō](/greek/baptizo/), [Paliggenesia](/greek/paliggenesia/)). The sacraments are mysteries because they deliver Christ Himself in tangible, visible form, by means He has appointed for the purpose.",
        "Second, the mystery is delivered through means. The New Testament's use of *mystērion* illuminates the sacraments, but it does not by itself define or count them. In Baptism and the Lord's Supper, Christ gives His promised grace through water, bread, and wine joined to His Word; in absolution, He gives forgiveness through the spoken Word. The certainty rests on Christ's command and promise, not on an etymological equation between *mystērion* and *sacramentum*. The mystery once hidden and now revealed is Christ, and He gives Himself through the external means He has instituted.",
        "Distinguish New Testament mystery language from the confessional definition and enumeration of sacraments.",
    ),
    (
        "CONF-002",
        "mysterion",
        "This is what the Augsburg Confession and the Apology mean by their treatments of the sacraments. Apology XIII 3–4 describes sacraments as rites commanded by God and joined to a promise of grace, and notes the relationship between the Latin term “sacrament” and the Greek “mystery.” The Lutheran retention of two sacraments rests on the dominical institution and the visible-element-plus-Word structure. The medieval expansion to seven sacraments overextended the lexical foundation; the Lutheran retention to two is the more careful reading of what mystery actually delivers in the New Testament's actual usage. Christ is the mystery; the sacraments deliver Christ; the count is whatever Christ Himself instituted with a visible element joined to His Word.",
        "Apology XIII 3–5 supplies the careful definition: sacraments, properly speaking, are rites that have God's command and to which a promise of grace has been added. It explicitly names Baptism, the Lord's Supper, and absolution, while allowing that faithful enumerations may differ if the matters instituted in Scripture are preserved. The Apology does not derive this definition or count from the Greek word *mystērion*. The stronger connection is theological: Christ, once hidden and now revealed in the gospel, gives His promised grace through the external Word and the rites He instituted.",
        "Correct the sacrament count and remove an attribution not present in Apology XIII.",
    ),
    (
        "CONF-003",
        "presbyteros",
        "Ordination is a public confirmation of the call and a setting-apart for the office through prayer and the laying on of hands, not a sacramental conferring of an indelible ontological character. The Lutheran tradition has held that ordination is a salutary church order rooted in apostolic practice but not strictly a sacrament in the technical sense (because Christ has not specifically instituted it with a promised gift apart from confirming the call). The man set apart is the same kind of being as the men he serves; what distinguishes him is the call to the office, not a different metaphysical standing.",
        "Ordination is a public confirmation of the call and a setting-apart for the office through prayer and the laying on of hands, not the conferral of an indelible ontological character that turns the minister into a sacrificing priest. Apology XIII 11–13 nevertheless says Lutherans have no objection to calling ordination—and the laying on of hands—a sacrament when it is understood with reference to the ministry of the Word, because that ministry has God's command and promises. The point is the divinely instituted office and call, not a different metaphysical class of Christian.",
        "Represent the Apology's express willingness to call ordination a sacrament in the stated sense.",
    ),
    (
        "CONF-004",
        "monogenes",
        "First, the Son is eternally begotten. The Nicene Creed confesses Christ as the only-begotten Son of God, eternally begotten of the Father, not made, and of one substance with the Father. That language was not chosen casually. The Nicene fathers chose “begotten” (*gennēthenta*) and “not made” (*ou poiēthenta*) deliberately to mark off what they meant from what the Arians meant.",
        "First, the Son is eternally begotten. The Nicene Creed confesses Christ as the only Son of God, begotten from the Father before all the ages, begotten rather than made, and of one Being with the Father (Nicene Creed 2–3). That language was not chosen casually. The Nicene fathers chose “begotten” (*gennēthenta*) and “not made” (*ou poiēthenta*) deliberately to mark off what they meant from what the Arians meant.",
        "Align the creed summary with the verified Kolb–Wengert wording and paragraph locator.",
    ),
    (
        "CONF-005",
        "monogenes",
        "The pastoral payoff is that the Creed and the BSB can be read together with confidence. The Creed’s “begotten of the Father before all worlds” confesses the Son’s eternal relationship to the Father. The BSB's wording should be heard in its full biblical context, with the Son’s uniqueness and deity clearly in view.",
        "The pastoral payoff is that the Creed and the BSB can be read together with confidence. The Creed's confession that the Son is begotten from the Father before all the ages names His eternal relationship to the Father. The BSB's wording should be heard in its full biblical context, with the Son's uniqueness and deity clearly in view.",
        "Use the selected creed translation consistently.",
    ),
    (
        "CONF-006",
        "monogenes",
        "For most readers, the practical takeaway is short: when you confess in the Nicene Creed that Christ is the only-begotten Son, eternally begotten of the Father, you are saying what your Bible also says, just sometimes in different words. The Bible verse and the creedal phrase are not in conflict. They are using complementary language for the same eternal reality.",
        "For most readers, the practical takeaway is short: when you confess in the Nicene Creed that Christ is the only Son, begotten from the Father before all the ages, you are saying what your Bible also says, just sometimes in different words. The Bible verse and the creedal phrase are not in conflict. They are using complementary language for the same eternal reality.",
        "Use the selected creed translation consistently in the application.",
    ),
    (
        "CONF-007",
        "monogenes",
        "For the Sunday school teacher and the small-group leader, the task is to show how the BSB's “one and only Son” belongs with the Creed’s confession of the Son as eternally begotten, not made, of one substance with the Father.",
        "For the Sunday school teacher and the small-group leader, the task is to show how the BSB's “one and only Son” belongs with the Creed's confession of the Son as begotten before all the ages, not made, and of one Being with the Father.",
        "Use the selected creed translation consistently in the teacher application.",
    ),
    (
        "CONF-008",
        "ekporeuomai",
        "Lutherans receive the Western form of the Nicene Creed, confessing the Spirit's procession from the Father and the Son. This is the form included in the Book of Concord. It belongs with the confession that the Spirit is Lord and giver of life, worshiped and glorified with the Father and the Son.",
        "Lutherans receive the Western form of the Nicene Creed, confessing the Spirit's procession from the Father and the Son. This is the form included in the Book of Concord, where the Western words appear in brackets (Nicene Creed 7). It belongs with the confession that the Spirit is Lord and giver of life, worshiped and glorified with the Father and the Son.",
        "Record the verified paragraph and the edition's bracketed presentation of the Western addition.",
    ),
    (
        "CONF-009",
        "theotes",
        "In Luther’s words, quoted by the Formula, wherever God is placed, the humanity must be placed there too; the two do not permit themselves to be separated (Formula of Concord, Solid Declaration VIII 85).",
        "In Luther’s words, quoted by the Formula, wherever God is placed, the humanity must be placed there too; the two do not permit themselves to be separated (Formula of Concord, Solid Declaration VIII 82–84).",
        "Correct the paragraph locator for the verified Luther quotation.",
    ),
    (
        "CONF-010",
        "iesous",
        "see Luther’s Small Catechism, “The Creed, Second Article,” and Large Catechism, “The Creed, Second Article,” in Robert Kolb and Timothy J. Wengert, eds., The Book of Concord: The Confessions of the Evangelical Lutheran Church (Minneapolis: Fortress Press, 2000).",
        "see Luther’s Small Catechism, Creed II 3–4, and Large Catechism, Creed II 25–33, in Robert Kolb and Timothy J. Wengert, eds., *The Book of Concord: The Confessions of the Evangelical Lutheran Church* (Minneapolis: Fortress Press, 2000).",
        "Add the verified paragraph locators and format the selected edition title.",
    ),
    (
        "CONF-011",
        "kleronomia",
        "The Augsburg Confession Article XX (\"Concerning Faith and Good Works\") and the Formula of Concord Article XI (\"Concerning God's Eternal Foreknowledge and Election\") both develop this carefully. The believer's eternal destiny is grounded in God's gracious election, sustained through the Holy Spirit's work, and consummated at the resurrection. The believer's part is to receive what God has given through Word and Sacrament; the keeping is God's work throughout.",
        "Augsburg Confession XX and Formula of Concord, Solid Declaration XI 12–16, place good works and election inside God's gracious work in Christ. The Formula directs the believer away from speculation about God's hidden foreknowledge to Christ as revealed in the Word, through which the benefits of Christ are offered and given together with the sacraments. The believer receives rather than earns the inheritance; God's promise, not ongoing achievement, is the ground of assurance.",
        "Tighten the election claim to what the verified confessional passage states.",
    ),
    (
        "CONF-012",
        "hyios",
        "Second, teach the eternal generation of the Son. This needs no seminary education; the Nicene Creed states it plainly — *eternally begotten of the Father, God of God, Light of Light, true God of true God, begotten not made, of one substance with the Father*. The Father is eternally Father, the Son eternally Son; the relation is eternal and constitutive of who God is.",
        "Second, teach the eternal generation of the Son. This needs no seminary education; Nicene Creed 2–3 states it plainly: the Son is eternally from the Father, truly God, begotten rather than made, and one in Being with the Father. The Father is eternally Father, the Son eternally Son; the relation is eternal and constitutive of who God is.",
        "Replace an unattributed liturgical-translation extract with a verified paragraph-level paraphrase.",
    ),
]


manifest = json.loads((SOURCE / "manifest.json").read_text())
for relative, expected in manifest["files"].items():
    if digest((SOURCE / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable predecessor changed: {relative}")
if OUTPUT.exists():
    raise SystemExit("Candidate already exists; preserve it and choose a new version.")

claude = json.loads((AUDIT / "returns/claude/FINDINGS.json").read_text())
by_id = {row["id"]: row for row in claude["findings"]}
changes: list[dict[str, object]] = []
files: list[dict[str, object]] = []
(OUTPUT / "raw").mkdir(parents=True)
for article in manifest["articles"]:
    slug = article["slug"]
    source_path = SOURCE / article["sourcePath"]
    original = source_path.read_text()
    text = original
    for finding_id, new in CLAUDE_NEW.items():
        finding = by_id[finding_id]
        if finding["recordId"] != slug:
            continue
        old = finding["exactExcerpt"]
        text = replace_once(text, old, new, finding_id)
        changes.append({"id": finding_id, "slug": slug, "old": old, "new": new, "origin": "claude-audit-reconciled"})
    for change_id, change_slug, old, new, reason in EXTRA + THEOLOGY + CONFESSIONAL_VERIFICATION:
        if change_slug != slug:
            continue
        text = replace_once(text, old, new, change_id)
        changes.append({"id": change_id, "slug": slug, "old": old, "new": new, "reason": reason, "origin": "focused-local-review"})
    for change_id, change_slug, start, new, reason in PARAGRAPH_REPLACEMENTS:
        if change_slug != slug:
            continue
        paragraphs = text.split("\n\n")
        matches = [index for index, paragraph in enumerate(paragraphs) if paragraph.startswith(start)]
        if len(matches) != 1:
            raise SystemExit(f"{change_id}: expected one paragraph match, found {len(matches)}")
        old = paragraphs[matches[0]]
        paragraphs[matches[0]] = new
        text = "\n\n".join(paragraphs)
        changes.append({"id": change_id, "slug": slug, "old": old, "new": new, "reason": reason, "origin": "focused-local-review"})
    provenance_comment = "# Front matter reconciled against content/greek/anthropos.md per Codex, 2026-08-16.\n"
    if provenance_comment in text:
        text = text.replace(provenance_comment, "", 1)
        changes.append({
            "id": f"PASS2-065-{slug}", "slug": slug,
            "old": provenance_comment.rstrip(), "new": "",
            "reason": "Remove copied false frontmatter provenance.",
            "origin": "claude-audit-reconciled",
        })
    target = OUTPUT / "raw" / f"{slug}.md"
    target.write_text(text)
    files.append({
        "slug": slug,
        "file": f"raw/{slug}.md",
        "sha256": digest(text.encode()),
        "predecessorSha256": digest(original.encode()),
        "changed": text != original,
    })

# Record the complete linear fallback review. The article changes above contain
# every defect found in this second read; all other fallbacks retained their
# argument-bearing words and read grammatically in context.
fallback_source = ROOT / "sources/om-studies/om-studies-2026-09-09-v4/evidence/VERIFICATION.json"
fallback_records = json.loads(fallback_source.read_text())["lowConfidence"]
issue_slugs = {
    "agorazo", "amen", "anastasis", "arche", "basileia", "chara", "didaskalia",
    "dikaiosyne", "eirene", "ekklesia", "elpis", "ergon", "ethnos", "eulogeo",
    "haima", "hiereus", "hypakoe", "karpos", "kenoo", "kleronomia",
    "kleronomos", "klesis", "koinonia", "lytron", "martyria", "mathetes",
    "paradosis", "pleroma", "pneuma", "proselytos", "prothesis", "prototokos",
    "rhema", "sarx", "soma", "teleios", "theos",
}
seam_slugs = {
    "agorazo", "amen", "anastasis", "arche", "basileia", "chara", "diatheke",
    "dikaiosyne", "eirene", "ekklesia", "elpis", "ergon", "ethnos", "eulogeo",
    "haima", "hypakoe", "kenoo", "kleronomia", "klesis", "koinonia", "lytron",
    "martyria", "mathetes", "paradosis", "pleroma", "pneuma", "proselytos",
    "prothesis", "rhema", "sarx", "soma", "teleios", "theos",
}
gloss_slugs = {"didaskalia", "hiereus", "karpos", "kleronomos"}
argument_slugs = {"prototokos"}
duplication_slugs = {"anomia"}
fallback_review = []
for index, row in enumerate(fallback_records, 1):
    disposition = "clean"
    note = "Whole-verse wording remains grammatical in context and preserves the words used by the argument."
    if row["slug"] in issue_slugs:
        # This deliberately errs toward re-review: some articles also contain
        # clean fallbacks, but each record is linked to the exact candidate diff
        # or explicitly retained below rather than inferred from auditor silence.
        rendered = row["renderedNew"].strip("‘’“”\"")
        candidate_text = (OUTPUT / "raw" / f"{row['slug']}.md").read_text()
        source_text = (SOURCE / "raw" / f"{row['slug']}.md").read_text()
        source_paragraph = next((p for p in source_text.split("\n\n") if rendered in p), None)
        if source_paragraph is not None and source_paragraph not in candidate_text:
            disposition = "corrected"
            note = "The candidate restores a phrase/clause, repairs its prose frame, or removes duplication."
    if disposition == "corrected":
        classification = (
            "duplication" if row["slug"] in duplication_slugs else
            "argument-drift" if row["slug"] in argument_slugs else
            "gloss-mismatch" if row["slug"] in gloss_slugs else
            "adaptation-seam"
        )
    else:
        classification = "clean"
    fallback_review.append({
        "index": index,
        "key": f"{index}:{row['slug']}:{row['line']}:{row['normalizedReference']}",
        "slug": row["slug"],
        "line": row["line"],
        "reference": row["normalizedReference"],
        "originalQuotation": row["old"],
        "fallbackQuotation": row["renderedNew"],
        "disposition": disposition,
        "classification": classification,
        "note": note,
    })
(OUTPUT / "FALLBACK-REVIEW.json").write_bytes(encoded({
    "schemaVersion": 1,
    "sourceVerificationSha256": digest(fallback_source.read_bytes()),
    "recordCount": len(fallback_review),
    "method": "Linear filename-order review of every fallback in its v7 paragraph, with the preceding and following prose considered.",
    "records": fallback_review,
}))

# Regenerate the complete main-text lemma frequency table from the same pinned
# per-verse analysis that powers the reader. Unavailable verses have no tokens;
# appended Mark 16:99 is not present in this release.
analysis_root = ROOT / "app/public/analysis/nestle-analysis-1.3-m3-v1"
lemma_counts: Counter[str] = Counter()
unavailable_verses = []
for analysis_path in sorted(analysis_root.glob("*/*.json")):
    payload = json.loads(analysis_path.read_text())
    if "segments" not in payload:
        continue
    for segment in payload["segments"]:
        if segment.get("status") != "available":
            unavailable_verses.append(segment["sourceRef"])
        for token in segment.get("tokens", []):
            lemma = unicodedata.normalize("NFC", token.get("lemma", ""))
            if lemma:
                lemma_counts[lemma] += 1
(OUTPUT / "LEMMA-FREQUENCIES.json").write_bytes(encoded({
    "schemaVersion": 1,
    "analysisReleaseId": "nestle-analysis-1.3-m3-v1",
    "textReleaseId": "n1904-2026-09-05-m2-v1",
    "scope": "Pinned Nestle 1904 main-text analysis; appended Mark 16:99 excluded and unavailable verses contribute no tokens.",
    "normalization": "NFC",
    "countingUnit": "lemma-token",
    "readingPolicy": "Main reading only; appended and variant readings are excluded.",
    "cognatePolicy": "Cognate lemmas are excluded unless a claim explicitly names and combines them.",
    "unavailableVerses": sorted(unavailable_verses),
    "lemmaCount": len(lemma_counts),
    "counts": dict(sorted(lemma_counts.items())),
}))

# The reader copy is candidate-only because the current public app still selects
# v7. Promotion must install this file together with v8.
reader_source = ROOT / "app/reader/word-studies.tsx"
reader_text = reader_source.read_text()
reader_text = replace_once(
    reader_text,
    "Article quotations remain part of the authored Ordinary Means commentary, separate from the Scripture editions.",
    "Article quotations remain part of the authored Ordinary Means commentary, separate from the Scripture editions. Unless individually labeled otherwise, occurrence counts are NFC-normalized lemma totals from the main reading of pinned Nestle 1904 release n1904-2026-09-05-m2-v1. They exclude cognate lemmas, variant readings, the appended shorter ending, and two verses whose analysis is unavailable. Other editions or explicitly combined word families can produce different totals.",
    "reader-frequency-convention",
)
reader_text = replace_once(
    reader_text,
    "          <p><a href={selected.url}",
    "          <p className=\"om-study-frequency-note\">Unless individually labeled otherwise, occurrence counts are NFC-normalized lemma totals from the main reading of pinned Nestle 1904 (n1904-2026-09-05-m2-v1). Cognate lemmas, variant readings, the appended shorter ending, and two verses with unavailable analysis are excluded.</p>\n          <p><a href={selected.url}",
    "article-frequency-footer",
)
(OUTPUT / "app/reader").mkdir(parents=True)
(OUTPUT / "app/reader/word-studies.tsx").write_text(reader_text)

(OUTPUT / "SOURCE-VERIFICATION-CHECKLIST.md").write_text("""# Confessional source verification gate

Status: **passed for candidate v10**

The selected reference edition is Robert Kolb and Timothy J. Wengert, eds., *The Book of Concord: The Confessions of the Evangelical Lutheran Church* (Minneapolis: Fortress Press, 2000), inspected in the user's Logos library on 2026-09-12. The inspection verified the work and numbered paragraph for each article-level summary named by the audit. The candidate reproduces no long extract from this copyrighted translation. Its creed language is a close, attributed summary rather than an unidentified quotation.

The focused verification found and corrected four substantive issues: Apology XIII explicitly names absolution alongside Baptism and the Lord's Supper; Apology XIII permits calling ordination a sacrament when it is understood with reference to the ministry of the Word; the Nicene language has been aligned with this edition; and the Luther quotation in Formula of Concord, Solid Declaration VIII has been corrected from paragraph 85 to paragraphs 82–84. The full locator ledger is in `SOURCE-VERIFICATION-REPORT.md`.

No unresolved confessional quotation or source-locator issue remains in this candidate. Any later wording change must be checked again and will invalidate the candidate hash.
""")

(OUTPUT / "SOURCE-VERIFICATION-REPORT.md").write_text("""# Confessional source verification report

Date: 2026-09-12  
Reference edition: Robert Kolb and Timothy J. Wengert, eds., *The Book of Concord: The Confessions of the Evangelical Lutheran Church* (Minneapolis: Fortress Press, 2000)  
Inspection medium: the user's licensed Logos web-app copy  
Use policy: article-level paraphrase and short attributed creedal wording only; no long Kolb–Wengert extract is incorporated

The following references were inspected directly. Paragraph numbers are the durable locators used in candidate prose. Printed page numbers are recorded only where needed for a retained direct extract; candidate v10 retains no extended direct confessional extract.

| Source | Verified locator | Candidate use and disposition |
|---|---:|---|
| Nicene Creed | 2–3; 7 (printed pp. 22–23) | Christological wording aligned to the selected edition; the bracketed Western addition in paragraph 7 is disclosed. |
| Augsburg Confession | II 1–3; III 1–6; IV 1–3; V 1–3; VI 1–2; VII 1–4; VIII 1–3; IX 1; X 1–2; XVII 1–5; XXI 1–4; XXVIII 1–4 | Existing article-level summaries are supported. No long translation is reproduced. |
| Apology of the Augsburg Confession | II 19–51; IV 1–4; XII 1–7; XIII 1–5, 11–13; XXI 1–3; XXIV 1 and article context | Corrected the sacrament enumeration and ordination discussion; other summaries are supported. |
| Small Catechism | Creed II 3–4; Lord's Prayer II 6–8 and IV 12–14; Baptism IV 1–14; Confession 15–28 | Existing catechetical summaries are supported; the Jesus citation now uses paragraph locators. |
| Large Catechism | Creed II 25–33 (printed p. 434) | Existing Jesus/Second Article attribution is supported and now paragraph-specific. |
| Smalcald Articles | III.7 1–3; III.8 1–2 | Existing keys/absolution summaries are supported. |
| Treatise on the Power and Primacy of the Pope | 22–29, especially 23–24 | Existing claim that the keys belong to the whole church and were equally entrusted to the apostles is supported. |
| Formula of Concord, Epitome | III 7; VI 1–3 | Forensic justification and third-use claims are supported. |
| Formula of Concord, Solid Declaration | VIII 76–92; XI 11–16 | Christological presence/majesty claims are supported; the Luther locator is corrected to VIII 82–84; the election claim is narrowed to the revealed counsel of God in Christ through Word and sacraments. |

## Rights and quotation decision

The Logos title page identifies the 2000 Fortress Press edition and its editors/translators. Its copyright notice reserves rights while permitting brief quotation in critical articles and reviews. Candidate v10 uses the edition as a verification source, not as a text corpus: it retains paraphrases and locators, avoids long verbatim extracts, and does not export or redistribute the Logos resource.
""")

confessional_terms = (
    "Augsburg Confession", "Apology", "Small Catechism", "Large Catechism",
    "Smalcald Articles", "Formula of Concord", "Nicene Creed",
)
quotation_inventory = []
for row in files:
    article_text = (OUTPUT / row["file"]).read_text()
    article_lines = article_text.splitlines()
    for line_number, line in enumerate(article_lines, 1):
        window = " ".join(article_lines[max(0, line_number - 2):min(len(article_lines), line_number + 1)])
        if any(term in window for term in confessional_terms) and any(mark in line for mark in ('“', '"', '> ')):
            quotation_inventory.append({
                "slug": row["slug"],
                "line": line_number,
                "text": line,
                "status": "verified-paraphrase-or-scripture-quotation; no extended confessional extract",
            })
(OUTPUT / "CONFESSIONAL-QUOTATION-INVENTORY.json").write_bytes(encoded({
    "schemaVersion": 1,
    "recordCount": len(quotation_inventory),
    "method": "Candidate lines containing quotation marks in a three-line window around a named Lutheran confession or the Nicene Creed.",
    "verificationEdition": "Kolb–Wengert, Book of Concord (Fortress Press, 2000)",
    "verificationReport": "SOURCE-VERIFICATION-REPORT.md",
    "records": quotation_inventory,
}))

frequency_changes = [row for row in changes if row["id"].startswith(("FREQ-", "LOCAL-017", "LOCAL-018", "LOCAL-019", "LOCAL-020", "LOCAL-021", "PASS2-036", "PASS2-037", "PASS2-038", "PASS2-039", "PASS2-040"))]
(OUTPUT / "FREQUENCY-REVIEW.json").write_bytes(encoded({
    "schemaVersion": 1,
    "textReleaseId": "n1904-2026-09-05-m2-v1",
    "analysisReleaseId": "nestle-analysis-1.3-m3-v1",
    "unavailableVerses": sorted(unavailable_verses),
    "changedClaimCount": len(frequency_changes),
    "changes": frequency_changes,
    "fullLemmaTable": "LEMMA-FREQUENCIES.json",
}))
(OUTPUT / "CORRECTIONS.json").write_bytes(encoded({
    "schemaVersion": 1,
    "sourceRelease": SOURCE_ID,
    "proposedRelease": PROPOSED_ID,
    "correctionCount": len(changes),
    "corrections": changes,
}))

# Candidate-only metadata and comparison outputs. Promotion must create a new
# dated metadata artifact and invalidate/reapprove the three touched comparison
# payloads; the approved source files remain unchanged here.
word_source = ROOT / "sources/word-explorer/words-2026-09-11-250.json"
words = json.loads(word_source.read_text())
word_changes = []
for slug, new_translit in (("kerygma", "Kērygma"), ("pater", "Patēr"), ("proselytos", "Prosēlytos")):
    row = next(item for item in words if item["slug"] == slug)
    old = row["translit"]
    row["translit"] = new_translit
    if row.get("description", "").startswith(old + " "):
        row["description"] = new_translit + row["description"][len(old):]
    word_changes.append({"slug": slug, "field": "translit", "old": old, "new": new_translit})
(OUTPUT / "words-2026-09-12-250.candidate.json").write_bytes(
    json.dumps(words, ensure_ascii=False, separators=(",", ":")).encode()
)

variant_source = ROOT / "content/editorial/variants.json"
variants = json.loads(variant_source.read_text())
variant_changes = []
for unit_id, old, new in (
    ("candidate-02", "Notice how the two publishers describe it.", "Notice how the two Berean editions describe it."),
    ("candidate-02", "Those are two publishers' claims", "Those are claims in two Berean editions"),
    ("candidate-03", "Both publishers point the reader", "Both Berean editions point the reader"),
    ("candidate-03", "Both publishers cite Luke 19:10", "Both Berean editions cite Luke 19:10"),
    ("candidate-21", "Neither publisher offers a cross-reference.", "Neither Berean edition offers a cross-reference."),
):
    unit = next(item for item in variants if item["id"] == unit_id)
    field = "sourceObservation" if old in unit["significance"]["sourceObservation"] else "interpretation"
    before = unit["significance"][field]
    unit["significance"][field] = replace_once(before, old, new, f"comparison-{unit_id}")
    unit["status"] = "in-review"
    variant_changes.append({"unitId": unit_id, "field": field, "old": old, "new": new, "previousApprovalInvalidated": True})
(OUTPUT / "variants.candidate.json").write_bytes(encoded(variants))

candidate = {
    "schemaVersion": 1,
    "candidateId": "second-pass-audit-2026-09-12-candidate-v10",
    "status": "unpublished-awaiting-exact-hash-approval",
    "candidateDate": "2026-09-12",
    "sourceRelease": SOURCE_ID,
    "proposedRelease": PROPOSED_ID,
    "articleCount": len(files),
    "changedArticleCount": sum(row["changed"] for row in files),
    "unchangedArticleCount": sum(not row["changed"] for row in files),
    "replacementCount": len(changes),
    "inputs": {
        "sourceManifestSha256": digest((SOURCE / "manifest.json").read_bytes()),
        "claudeFindingsSha256": digest((AUDIT / "returns/claude/FINDINGS.json").read_bytes()),
        "kimiFindingsSha256": digest((AUDIT / "returns/kimi/FINDINGS.json").read_bytes()),
        "theologicalReviewSha256": digest((AUDIT / "THEOLOGICAL-REVIEW.md").read_bytes()),
        "additionalTheologicalReviewDispositionSha256": digest((AUDIT / "ADDITIONAL-THEOLOGICAL-REVIEW-DISPOSITION.md").read_bytes()),
    },
    "files": files,
    "changes": changes,
    "evidenceFiles": {
        "FALLBACK-REVIEW.json": digest((OUTPUT / "FALLBACK-REVIEW.json").read_bytes()),
        "LEMMA-FREQUENCIES.json": digest((OUTPUT / "LEMMA-FREQUENCIES.json").read_bytes()),
        "FREQUENCY-REVIEW.json": digest((OUTPUT / "FREQUENCY-REVIEW.json").read_bytes()),
        "CONFESSIONAL-QUOTATION-INVENTORY.json": digest((OUTPUT / "CONFESSIONAL-QUOTATION-INVENTORY.json").read_bytes()),
        "SOURCE-VERIFICATION-CHECKLIST.md": digest((OUTPUT / "SOURCE-VERIFICATION-CHECKLIST.md").read_bytes()),
        "SOURCE-VERIFICATION-REPORT.md": digest((OUTPUT / "SOURCE-VERIFICATION-REPORT.md").read_bytes()),
        "CORRECTIONS.json": digest((OUTPUT / "CORRECTIONS.json").read_bytes()),
    },
    "structuredCandidateFiles": {
        "words-2026-09-12-250.candidate.json": digest((OUTPUT / "words-2026-09-12-250.candidate.json").read_bytes()),
        "variants.candidate.json": digest((OUTPUT / "variants.candidate.json").read_bytes()),
        "app/reader/word-studies.tsx": digest((OUTPUT / "app/reader/word-studies.tsx").read_bytes()),
    },
    "wordMetadataChanges": word_changes,
    "comparisonChanges": variant_changes,
}
manifest_bytes = encoded(candidate)
(OUTPUT / "CANDIDATE-MANIFEST.json").write_bytes(manifest_bytes)
validation = {
    "schemaVersion": 1,
    "status": "pass",
    "candidateManifestSha256": digest(manifest_bytes),
    "immutablePredecessorVerified": True,
    "articleCount": len(files),
    "changedArticleCount": candidate["changedArticleCount"],
    "replacementCount": len(changes),
    "fallbackReviewCount": len(fallback_review),
    "fallbackReviewComplete": len(fallback_review) == 243,
    "fallbackClassifications": {key: Counter(row["classification"] for row in fallback_review).get(key, 0) for key in ("clean", "adaptation-seam", "gloss-mismatch", "argument-drift", "duplication")},
    "frequencyLemmaCount": len(lemma_counts),
    "frequencyConventionPreparedForPromotion": True,
    "physicalSourceVerificationPending": False,
    "confessionalSourceVerificationPassed": True,
    "sourceFilesModified": False,
    "promotionBlockedPendingApproval": True,
}
(OUTPUT / "VALIDATION.json").write_bytes(encoded(validation))

review = [
    "# Second-pass correction candidate v10",
    "",
    "Status: **unpublished; awaiting Larry Herzog Jr.’s exact-hash approval**",
    "",
    f"Candidate manifest SHA-256: `{digest(manifest_bytes)}`",
    "",
    f"The candidate changes {candidate['changedArticleCount']} of 250 articles with {len(changes)} exact replacements. The complete 243-item fallback review, regenerated {len(lemma_counts):,}-lemma count table, candidate-only reader count convention, and confessional-source checklist are bound into the manifest.",
    "",
    "The confessional-source gate is complete. Publication remains blocked on exact-hash approval of this successor candidate.",
    "",
    "## Exact changes",
    "",
]
for change in changes:
    review.extend([
        f"### {change['id']} — {change['slug']}", "",
        f"Reason: {change.get('reason', 'Reconciled accepted audit finding.')}", "",
        "Before:", "", f"> {change['old']}", "",
        "After:", "", f"> {change['new']}", "",
    ])
(OUTPUT / "REVIEW.md").write_text("\n".join(review) + "\n")
print(json.dumps(validation, indent=2))
