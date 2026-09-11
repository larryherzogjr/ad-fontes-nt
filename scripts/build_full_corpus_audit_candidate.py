"""Build the non-public candidate and reconciliation for the 2026-09-11 audit.

This script never edits immutable releases or approved editorial data. It copies
the v5 article release, variants, and word metadata into artifacts/editorial,
applies exact reviewed replacements there, and binds every output by SHA-256.
"""

from __future__ import annotations

import hashlib
import json
import shutil
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
AUDIT_ROOT = ROOT / "docs/editorial-review/full-corpus-audit-2026-09-11"
RETURN = AUDIT_ROOT / "returns/claude-2026-09-11"
FINDINGS_PATH = RETURN / "FINDINGS.json"
KIMI_RETURN = AUDIT_ROOT / "returns/kimi-2026-09-11"
KIMI_FINDINGS_PATH = KIMI_RETURN / "FINDINGS.json"
SOURCE_RELEASE = "om-studies-2026-09-10-v5"
SOURCE_DIR = ROOT / "sources/om-studies" / SOURCE_RELEASE
OUTPUT = ROOT / "artifacts/editorial/full-corpus-audit-2026-09-11-candidate-v2"
DOC_OUTPUT = AUDIT_ROOT / "reconciliation-v2"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def json_bytes(value: object, *, compact: bool = False) -> bytes:
    if compact:
        return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


# Exact, minimally scoped article corrections supported by the pinned BSB or by
# the article's own grammar/context. Findings needing an external source or an
# authorial/product decision are deliberately absent and remain in the queue.
ARTICLE_NEW = {
    "AUDIT-001": "renders John 1:1c as “the Word was a god.”",
    "AUDIT-002": "The grammar requires the third clause of John 1:1 to read either “the Word was God” or “the Word was divine” (qualitative emphasis). It cannot grammatically read “the Word was a god.”",
    "AUDIT-003": "*John 1:1.* “In the beginning was the Word, and the Word was with God, and the Word was God.”",
    "AUDIT-004": "*John 1:1.* \"In the beginning was the Word, and the Word was with God, and the Word was God.\"",
    "AUDIT-005": "“In the beginning was the Word, and the Word was with God, and the Word was God.”",
    "AUDIT-006": "should the sentence end after “Christ,” followed by a new doxology to the Father?",
    "AUDIT-007": "and “in whom I am well pleased” (Isaiah 42:1, the chosen servant)",
    "AUDIT-008": "“The thief comes only to steal and kill and destroy. I have come that they may have life, and have it in all its fullness.” (John 10:10, BSB)",
    "AUDIT-009": "“‘She will give birth to a Son, and you are to give Him the name Jesus, because He will save His people from their sins.’” (Matthew 1:21, BSB)",
    "AUDIT-010": "“And if it is by grace, then it is no longer by works. Otherwise, grace would no longer be grace.” (Romans 11:6, BSB)",
    "AUDIT-011": "“before men” (Matthew 10:32–33, BSB)",
    "AUDIT-012": "“Be perfect, therefore, as your heavenly Father is perfect.” (Matthew 5:48, BSB)",
    "AUDIT-013": "The verse is Colossians 2:9: “For in Christ all the fullness of the Deity dwells in bodily form,”",
    "AUDIT-014": "1 Corinthians 15:23 — “But each in his own turn: Christ the firstfruits; then at His coming, those who belong to Him.”",
    "AUDIT-015": "John 3:16 — “For God so loved the world that He gave His one and only Son, that everyone who believes in Him shall not perish but have eternal life.”",
    "AUDIT-016": "Matthew 1:21 closes the loop: “‘She will give birth to a Son, and you are to give Him the name Jesus, because He will save His people from their sins.’”",
    "AUDIT-017": "Ephesians 2:8 — “For it is by grace you have been saved through faith, and this not from yourselves; it is the gift of God,”",
    "AUDIT-018": "Christ's kingdom is “not of this world,” and the Lutheran two-kingdoms doctrine clarifies",
    "AUDIT-019": "The Son is called “the exact representation of His nature” (Hebrews 1:3, BSB). *Representation* renders *charaktēr*; *nature* renders [hypostasis](/greek/hypostasis/).",
    "AUDIT-020": "pronounced in the Erasmian convention as *hee-er-YOOS*, with the accent on the third (final) syllable",
    "AUDIT-021": "pronounced in the Erasmian convention as *hwee-o-the-SEE-a*, with the accent on the fourth syllable",
    "AUDIT-022": "what Lutherans summarize in a Greek phrase: *theotēs sōmatikōs* — deity, bodily.",
    "AUDIT-023": "",
    "AUDIT-024": "In Matthew 16:19, Christ gives Peter “the keys of the kingdom of heaven” and announces that “whatever you bind on earth will be bound in heaven, and whatever you loose on earth will be loosed in heaven.” Matthew 18:18 extends this authority to the church corporately.",
    "AUDIT-025": "“Shall we continue in sin so that grace may increase? Certainly not!” (Romans 6:1–2, BSB)",
    "AUDIT-026": "The Latin Vulgate translates this with *rapiemur* — “we will be caught up” — and from this Latin word the English term “rapture” derives.",
    "AUDIT-027": "*The reduction of* *“from every tribe and tongue and people and nation”* *to symbolic universality without substantive missionary implication.*",
    "AUDIT-028": "*“messengers of the churches” — sent representatives.*",
    "AUDIT-029": "Does “the Originator of God’s creation” mean Christ is the first thing God created",
    "AUDIT-030": "Romans 6:19 — Paul speaks of “offering the parts of your body in slavery to impurity and to escalating wickedness.”",
    "AUDIT-031": "every religious person of every era — is “ignorant of God’s righteousness” and tries to establish “their own” righteousness instead.",
    "AUDIT-032": "those rich in this present age are warned not to “put their hope in the uncertainty of wealth”.",
    "AUDIT-033": "Used once, at Galatians 2:14 — Peter “live[d] like a Gentile and not like a Jew”",
    "AUDIT-034": "*The* *“fruit of the Spirit”* *plural misreading.*",
    "AUDIT-035": "preaching being “emptied of its power” or boasting being “made empty.”",
    "AUDIT-036": "The inheritance is “imperishable, undefiled, and unfading, reserved in heaven for you.”",
    "AUDIT-037": "the Samaritans confess that Jesus “truly is the Savior of the world”.",
    "AUDIT-038": "where Paul names “the powers of this world’s darkness” as part of the spiritual hierarchy",
    "AUDIT-039": "*The* *“basic forces of the world”* *reductionism.*",
    "AUDIT-040": "is the same day on which “the sun of righteousness will rise with healing in its wings” for those who fear God's name.",
    "AUDIT-041": "where the prophet sees “One like the Son of Man” given dominion",
    "AUDIT-042": "*The* *“Son of Man = humility”* *reduction.*",
    "AUDIT-043": "First, it is identifying “the name above all names” with the name *Iēsous*,",
    "AUDIT-044": "The “all things together for the good” of Romans 8:28 is the practical face of the eternal purpose.",
    "AUDIT-045": "When Paul calls Christ “the firstborn over all creation” at Colossians 1:15",
    "AUDIT-046": "The third is misreading “recognizing the body” in 1 Corinthians 11:29.",
    "AUDIT-047": "Death becomes, in Paul's striking phrase, “to depart and be with Christ”",
    "AUDIT-048": "and the father is to “teach them diligently to your children”.",
    "AUDIT-049": "*The* *“released from the law”* *misread as freedom from the Decalogue.*",
    "AUDIT-050": "and at 1 Peter 1:18 (“from the empty way of life you inherited from your forefathers”).",
    "AUDIT-051": "The believer receives “his due for the things done in the body, whether good or bad.”",
    "AUDIT-052": "Hebrews 7:10 — Levi was “still in the loin of his ancestor.”",
    "AUDIT-053": "Luke 2:15 — the shepherds' “this thing that has happened”.",
    "AUDIT-054": "as something that took place “before many witnesses.”",
    "AUDIT-055": "Matthew 27:57 — Joseph of Arimathea “himself was a disciple of Jesus.”",
    "AUDIT-056": "2 Thessalonians 1:8 — those who “do not obey the gospel of our Lord Jesus”",
    "AUDIT-057": "Galatians 3:28 — “There is neither Jew nor Greek, slave nor free, male nor female, for you are all one in Christ Jesus.”",
    "AUDIT-058": "Romans 6:1-2 — “Shall we continue in sin so that grace may increase? Certainly not!”",
    "AUDIT-059": "1 Timothy 4:1 — “the teachings of demons.”",
    "AUDIT-060": "daily [repentance](/greek/metanoia/) and daily *aphesis*.",
    "AUDIT-061": "Used six times in the New Testament, five of them in the Pastoral Epistles.",
    "AUDIT-066": "The BSB and MSB print “the women,” while the BLB prints “Women likewise,”",
    "AUDIT-067": "subhead: \"Bought with a Price\"",
    "AUDIT-068": "subhead: \"This Is My Body\"",
    "AUDIT-069": "subhead: \"The New Covenant in My Blood\"",
}

UNRESOLVED = {
    "AUDIT-062": "Internal-link destination requires a product/editorial decision.",
    "AUDIT-063": "The referenced study is not identified in the supplied evidence.",
    "AUDIT-064": "The historical characterization needs textual-review approval.",
    "AUDIT-065": "The intended three-syllable referent is authorial and cannot be inferred safely.",
    "AUDIT-086": "The Erasmus/Textus Receptus history claim needs a directly adequate source or narrower wording.",
}

# Additional exact article fixes found while reconciling all 243 fallback records.
LOCAL_ARTICLE_CHANGES = [
    ("LOCAL-001", "basileia", "has already been “He has rescued us from the dominion of darkness and brought us into the kingdom of His beloved Son,”", "has already been “brought into the kingdom of His beloved Son”", "Restore the grammatical phrase slot for Colossians 1:13."),
    ("LOCAL-002", "eirene", "Solomon “For Solomon had dominion over everything west of the Euphrates—over all the kingdoms from Tiphsah to Gaza—and he had peace on all sides.”", "Solomon “had peace on all sides.”", "Restore the short phrase slot for 1 Kings 4:24."),
    ("LOCAL-003", "ergon", "Adam was placed in the garden “Then the LORD God took the man and placed him in the Garden of Eden to cultivate and keep it.”", "Adam was placed in the garden “to cultivate and keep it”", "Remove a duplicated subject introduced by a whole-verse fallback."),
    ("LOCAL-004", "hiereus", "Paul describing his ministry as “to be a minister of Christ Jesus to the Gentiles in the priestly service of the gospel of God, so that the Gentiles might become an offering acceptable to God, sanctified by the Holy Spirit” in the gospel of God", "Paul describing his ministry as “the priestly service of the gospel of God”", "Restore the phrase slot for Romans 15:16."),
    ("LOCAL-005", "leitourgia", "*hē diakonia tēs leitourgias tautēs* — “For this ministry of service is not only supplying the needs of the saints but is also overflowing in many expressions of thanksgiving to God.” — combines", "*hē diakonia tēs leitourgias tautēs* — “this ministry of service” — combines", "Restore the phrase gloss for 2 Corinthians 9:12."),
    ("LOCAL-006", "paradosis", "Jesus “He was delivered over to death for our trespasses and was raised to life for our justification.”", "Jesus “was delivered over to death for our trespasses”", "Restore the phrase slot for Romans 4:25."),
    ("LOCAL-007", "sarx", "“For I could wish that I myself were cursed and cut off from Christ for the sake of my brothers, my own flesh and blood,”", "“my own flesh and blood”", "Restore the phrase slot for Romans 9:3."),
    ("LOCAL-008", "anastasis", "John 11:24 (Martha: “Martha replied, ‘I know that he will rise again in the resurrection at the last day’”)", "John 11:24 (Martha: “I know that he will rise again in the resurrection at the last day”)", "Remove a duplicated speaker tag."),
    ("LOCAL-009", "chara", "Luke 1:28 (Gabriel to Mary: “The angel appeared to her and said, ‘Greetings, you who are highly favored! The Lord is with you’”)", "Luke 1:28 (Gabriel to Mary: “Greetings, you who are highly favored! The Lord is with you”)", "Remove a duplicated speaker tag."),
    ("LOCAL-010", "mathetes", "Thomas saying to his fellow disciples (*symmathētais*), “Then Thomas called Didymus said to his fellow disciples, ‘Let us also go, so that we may die with Him’”", "Thomas saying to his fellow disciples (*symmathētais*), “Let us also go, so that we may die with Him”", "Remove a duplicated speaker tag."),
    ("LOCAL-011", "mathetes", "the Pharisees say of the formerly blind man, “Then they heaped insults on him and said, ‘You are His disciple; we are disciples of Moses’”", "the Pharisees say of the formerly blind man, “You are His disciple; we are disciples of Moses”", "Remove a duplicated speaker tag."),
    ("LOCAL-012", "paradosis", "He quotes Isaiah 29:13: “Jesus answered them, ‘Isaiah prophesied correctly about you hypocrites, as it is written: ‘These people honor Me with their lips, but their hearts are far from Me. They worship Me in vain; they teach as doctrine the precepts of men.’’”", "He quotes Isaiah 29:13: “These people honor Me with their lips, but their hearts are far from Me. They worship Me in vain; they teach as doctrine the precepts of men.”", "Remove an unnecessary narrative wrapper and broken nested quotation."),
    ("LOCAL-013", "hyios", "Jesus's response (Matthew 16:17): “Jesus replied, ‘Blessed are you, Simon son of Jonah! For this was not revealed to you by flesh and blood, but by My Father in heaven.’”", "Jesus's response (Matthew 16:17): “Blessed are you, Simon son of Jonah! For this was not revealed to you by flesh and blood, but by My Father in heaven.”", "Remove a duplicated speaker tag."),
    ("LOCAL-014", "theos", "the people of Lystra cry out that “When the crowds saw what Paul had done, they lifted up their voices in the Lycaonian language: ‘The gods have come down to us in human form’”", "the people of Lystra cry out that “The gods have come down to us in human form”", "Restore the phrase slot for Acts 14:11."),
]

# Supportable additions from Kimi's independent audit. Numerical claims are
# normalized to the pinned Nestle analysis: mathētēs occurs 28 times in Acts
# (10 before Acts 11:26), and prothesis divides 4 showbread / 8 purpose.
KIMI_ARTICLE_CHANGES = [
    ("KIMI-001-A", "huiothesia", "*Huios* (υἱός) means “my firstborn”", "*Huios* (υἱός) means “son”", "Correct a corrupted lexical gloss."),
    ("KIMI-001-B", "huiothesia", "Israel as God's “my firstborn” (Exodus 4:22, BSB)", "Israel as God's “firstborn son” (Exodus 4:22, BSB)", "Correct the Exodus 4:22 phrase without importing a first-person possessive into the article's grammar."),
    ("KIMI-001-C", "huiothesia", "The Pauline use of “my firstborn” language is structural", "The Pauline use of “son” language is structural", "Correct a second corrupted huios gloss."),
    ("KIMI-002", "theos", "First clause: *en archē ēn ho logos* — \"in the beginning was the Word, and the Word was with God, and the Word was God.\"", "First clause: *en archē ēn ho logos* — \"in the beginning was the Word.\"", "Match the English gloss to the first Greek clause only."),
    ("KIMI-004", "teleios", "Then the closing sentence: “So then, be perfect, as your heavenly Father is perfect.”", "Then the closing sentence: “Be perfect, therefore, as your heavenly Father is perfect.”", "Correct the second Matthew 5:48 occurrence."),
    ("KIMI-008-A", "mathetes", "Luke uses *mathētēs* over thirty times in Acts before reaching this verse.", "Luke uses *mathētēs* ten times in Acts before reaching this verse.", "Use the exact count from the pinned Nestle analysis before Acts 11:26."),
    ("KIMI-008-B", "mathetes", "Acts uses *mathētēs* over thirty times for ordinary believers", "Acts uses *mathētēs* twenty-eight times for ordinary believers", "Use the exact Acts count from the pinned Nestle analysis."),
    ("KIMI-008-C", "mathetes", "the term Acts uses over thirty times for the believers", "the term Acts uses twenty-eight times for the believers", "Use the exact Acts count from the pinned Nestle analysis."),
    ("KIMI-009", "prothesis", "appears twelve times in the New Testament — six times in the showbread sense and six times in the purpose sense", "appears twelve times in the New Testament — four times in the showbread sense and eight times in the purpose sense", "Use the sense counts verified against the pinned Nestle analysis."),
    ("KIMI-010", "pater", "The reconstructed Proto-Indo-European form is *pH₂tér-, and it surfaces", "The reconstructed Proto-Indo-European form is *pH₂tér-*, and it surfaces", "Close the italic span after the reconstructed form."),
    ("KIMI-011", "agorazo", "First, the price is named explicitly: *en tō haimati sou*, “And they sang a new song: ‘Worthy are You to take the scroll and open its seals, because You were slain, and by Your blood You purchased for God those from every tribe and tongue and people and nation.’”", "First, the price is named explicitly: *en tō haimati sou*, “by Your blood.”", "Restore the phrase gloss instead of repeating the whole verse."),
    ("KIMI-012", "hyios", "‘This is My beloved Son, in whom I am well pleased’” The voice", "‘This is My beloved Son, in whom I am well pleased.’” The voice", "Restore sentence punctuation at the quotation boundary."),
    ("KIMI-013", "theos", "‘My Lord and my God’” In Greek", "‘My Lord and my God.’” In Greek", "Restore sentence punctuation at the quotation boundary."),
    ("KIMI-014", "amen", "‘Amen!’ and ‘Praise the LORD’” Nehemiah", "‘Amen!’ and ‘Praise the LORD!’” Nehemiah", "Restore the BSB exclamation mark at the quotation boundary."),
    ("KIMI-015", "agorazo", "people and nation’” The Greek", "people and nation.’” The Greek", "Restore sentence punctuation at the quotation boundary."),
    ("KIMI-016", "anastasis", "Do you believe this” The Greek", "Do you believe this?’” The Greek", "Restore the question mark and close the nested speech quotation."),
    ("KIMI-016-B", "anastasis", "*John 11:23-26.* “Your brother will rise again,’", "*John 11:23-26.* “‘Your brother will rise again,’", "Open the nested speech quotation that the corrected ending closes."),
    ("KIMI-017", "prototokos", "the firstborn over all creation” Then", "the firstborn over all creation.” Then", "Restore sentence punctuation at the quotation boundary."),
    ("KIMI-018", "theotes", "the fullness of the Deity dwells in bodily form” The Greek", "the fullness of the Deity dwells in bodily form.” The Greek", "Restore sentence punctuation at the quotation boundary."),
]

for kimi_number, slug in (
    (19, "antilytron"), (20, "authenteo"), (21, "charisma"),
    (22, "epiphaneia"), (23, "eusebeia"), (24, "hygiaino"),
    (25, "loutron"), (26, "mesites"), (27, "mythos"),
    (28, "orthotomeo"), (29, "paratheke"), (30, "soter"),
    (31, "theopneustos"),
):
    KIMI_ARTICLE_CHANGES.append((
        f"KIMI-{kimi_number:03d}", slug,
        "## Where You'll Meet It", "## Where You’ll Meet It",
        "Use the established curly-apostrophe heading style.",
    ))

# Additional occurrences explicitly described by an external finding but not
# captured in that finding's single exactExcerpt field.
FOLLOWUP_ARTICLE_CHANGES = [
    ("AUDIT-015-B", "kosmos", "*John 3:16.* \"For this is the way God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.\"", "*John 3:16.* \"For God so loved the world that He gave His one and only Son, that everyone who believes in Him shall not perish but have eternal life.\"", "AUDIT-015"),
    ("AUDIT-016-B", "iesous", "*you will name him Jesus*", "*you are to give Him the name Jesus*", "AUDIT-016"),
    ("AUDIT-016-C", "iesous", "*For he will save his people from their sins*", "*because He will save His people from their sins*", "AUDIT-016"),
    ("AUDIT-016-D", "iesous", "*Matthew 1:21.* \"She will give birth to a son and you will name him Jesus because he will save his people from their sins.\"", "*Matthew 1:21.* \"She will give birth to a Son, and you are to give Him the name Jesus, because He will save His people from their sins.\"", "AUDIT-016"),
    ("AUDIT-027-B", "agorazo", "Revelation 5:9 names the Lamb’s purchase from “And they sang a new song: ‘Worthy are You to take the scroll and open its seals, because You were slain, and by Your blood You purchased for God those from every tribe and tongue and people and nation’”", "Revelation 5:9 names the Lamb’s purchase from “every tribe and tongue and people and nation”", "AUDIT-027"),
    ("AUDIT-029-B", "arche", "Revelation 3:14's “To the angel of the church in Laodicea write: These are the words of the Amen, the faithful and true Witness, the Originator of God’s creation”", "Revelation 3:14's “the Originator of God’s creation”", "AUDIT-029"),
    ("AUDIT-029-C", "arche", "appeal to “To the angel of the church in Laodicea write: These are the words of the Amen, the faithful and true Witness, the Originator of God’s creation”", "appeal to “the Originator of God’s creation”", "AUDIT-029"),
    ("AUDIT-034-B", "karpos", "Many English speakers refer to “But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. Against such things there is no law”", "Many English speakers refer to the “fruit of the Spirit”", "AUDIT-034"),
    ("AUDIT-043-B", "iesous", "The “Therefore God exalted Him to the highest place and gave Him the name above all names, that at the name of Jesus every knee should bow, in heaven and on earth and under the earth, and every tongue confess that Jesus Christ is Lord, to the glory of God the Father” climax", "The “name above all names” climax", "AUDIT-043"),
    ("AUDIT-046-B", "soma", "On this reading, “For anyone who eats and drinks without recognizing the body eats and drinks judgment on himself” means recognizing", "On this reading, “recognizing the body” means recognizing", "AUDIT-046"),
    ("AUDIT-052-B", "pater", "Jesus tells His critics, “Abraham is our father,’ they replied. ‘If you were children of Abraham,’ said Jesus, ‘you would do the works of Abraham”", "Jesus tells His critics, “If you were children of Abraham, you would do the works of Abraham.”", "AUDIT-052"),
    ("AUDIT-052-C", "pater", "Abraham as “And he received the sign of circumcision as a seal of the righteousness that he had by faith while he was still uncircumcised. So then, he is the father of all who believe but are not circumcised, in order that righteousness might be credited to them. And he is also the father of the circumcised who not only are circumcised, but who also walk in the footsteps of the faith that our father Abraham had before he was circumcised.”", "Abraham as “the father of all who believe.”", "AUDIT-052"),
    ("AUDIT-054-B", "homologeo", "“Fight the good fight of the faith. Take hold of the eternal life to which you were called when you made the good confession before many witnesses.” (1 Timothy 6:12, BSB) refuses", "“before many witnesses” (1 Timothy 6:12, BSB) refuses", "AUDIT-054"),
]

WORD_CHANGES = {
    "AUDIT-070": ("bema", "pronunciation", "BAY-mah"),
    "AUDIT-071": ("eulogeo", "pronunciation", "yoo-lo-GEH-oh"),
    "AUDIT-072": ("mesites", "pronunciation", "mes-EE-tays"),
}

COMPARISON_REPLACEMENTS = {
    "AUDIT-073": ("candidate-16", "interpretation", "So the healing narrative stands either way, and so does the detail that the sick were waiting for the water to move.", "So the healing narrative stands either way, and verse 7 still shows that the stirring of the water was expected."),
    "AUDIT-074": ("candidate-17", "source:C3", "MSB notes JHN.8.2.note.95 through JHN.8.11.note.107 (eleven); BSB notes JHN.8.note.47, JHN.8.note.48, JHN.8.note.49 (three).", "MSB notes JHN.8.2.note.95 through JHN.8.11.note.107 (thirteen); BSB notes JHN.8.note.47–49 plus one rendering note (four)."),
    "AUDIT-075": ("candidate-21", "sourceObservation", "That is unusual: at comparable places in this collection both send the reader somewhere else in the New Testament where the disputed words also stand, and here neither does [C3].", "That is less common: at several comparable places in this collection both send the reader somewhere else in the New Testament where the disputed words also stand, though not at Mark 7:16, and here neither does [C3]."),
    "AUDIT-076": ("candidate-26", "interpretation", "Under the critical reading the pronoun looks back to the mystery Paul has just announced", "Under the critical reading the pronoun introduces the one in whom the mystery was revealed"),
    "AUDIT-077": ("candidate-11", "sourceObservation", "such markers", "editorial brackets"),
    "AUDIT-078": ("candidate-17", "sourceObservation", "such markers", "editorial brackets"),
    "AUDIT-079": ("candidate-02", "sourceObservation", "which is not always the case in this book", "which is not always the case in this collection"),
    "AUDIT-080": ("candidate-08", "interpretation", "Where they are not, it comes once, at verse 47's conclusion.", "Where they are not, it comes once, at verse 48, after the saying about the eye."),
    "AUDIT-081": ("candidate-01", "sourceObservation", "Both Berean editions footnote it", "The Berean Standard Bible footnotes it"),
    "AUDIT-082": ("candidate-03", "interpretation", "that verse is present in all seven editions compared here, and nothing in this comparison touches it.", "that verse is present in all seven editions compared here [C4], and nothing in this comparison touches it."),
    "AUDIT-083": ("candidate-24", "sourceObservation", "Nestle 1904 has an additional “of the ages” at the end of verse 27 compared with Robinson–Pierpont and Boyd.", "Nestle 1904 has an additional “of the ages” at the end of verse 27 compared with Robinson–Pierpont and Boyd [C6]."),
    "AUDIT-084": ("candidate-05", "sourceObservation", "Ἰησοῦ Χριστοῦ ⟨Υἱοῦ Θεοῦ⟩", "Ἰησοῦ Χριστοῦ <Υἱοῦ Θεοῦ>"),
    "AUDIT-085": ("candidate-18", "interpretation", "*Ad Fontes, Volume One*", "*Ad Fontes – Volume One*"),
    "AUDIT-087": ("candidate-29", "sourceObservation", "and the benediction naming Father, Son and Holy Spirit.", "and the benediction naming the Lord Jesus Christ, God, and the Holy Spirit."),
    "KIMI-041": ("candidate-17", "sourceObservation", "These seventeen Berean notes", "These seventeen publisher notes"),
}


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one exact match, found {count}")
    return text.replace(old, new)


if OUTPUT.exists() or DOC_OUTPUT.exists():
    raise SystemExit("Candidate/reconciliation v2 already exists; use a new version.")
OUTPUT.mkdir(parents=True)
DOC_OUTPUT.mkdir(parents=True)

audit = json.loads(FINDINGS_PATH.read_text())
findings = audit["findings"]
by_id = {row["id"]: row for row in findings}
if len(by_id) != 88:
    raise SystemExit("Expected 88 unique external findings.")
kimi_audit = json.loads(KIMI_FINDINGS_PATH.read_text())
kimi_findings = kimi_audit["findings"]
if len(kimi_findings) != 41:
    raise SystemExit("Expected 41 Kimi findings.")

# Verify the immutable article release before copying it.
manifest = json.loads((SOURCE_DIR / "manifest.json").read_text())
for relative, expected in manifest["files"].items():
    if digest((SOURCE_DIR / relative).read_bytes()) != expected:
        raise SystemExit(f"Immutable predecessor changed: {relative}")

article_out = OUTPUT / "articles/raw"
article_out.mkdir(parents=True)
article_changes = []
for row in manifest["articles"]:
    slug = row["slug"]
    text = (SOURCE_DIR / row["sourcePath"]).read_text()
    original = text
    for finding_id, new in ARTICLE_NEW.items():
        finding = by_id[finding_id]
        if finding["recordId"] == slug:
            text = replace_once(text, finding["exactExcerpt"], new, finding_id)
            article_changes.append({"id": finding_id, "slug": slug, "old": finding["exactExcerpt"], "new": new, "origin": "external-audit"})
    for change_id, change_slug, old, new, reason in LOCAL_ARTICLE_CHANGES:
        if change_slug == slug:
            text = replace_once(text, old, new, change_id)
            article_changes.append({"id": change_id, "slug": slug, "old": old, "new": new, "reason": reason, "origin": "local-reconciliation"})
    for change_id, change_slug, old, new, finding_id in FOLLOWUP_ARTICLE_CHANGES:
        if change_slug == slug:
            text = replace_once(text, old, new, change_id)
            article_changes.append({"id": change_id, "slug": slug, "old": old, "new": new, "findingIds": [finding_id], "origin": "external-audit-followup"})
    for change_id, change_slug, old, new, reason in KIMI_ARTICLE_CHANGES:
        if change_slug == slug:
            text = replace_once(text, old, new, change_id)
            article_changes.append({"id": change_id, "slug": slug, "old": old, "new": new, "reason": reason, "origin": "kimi-audit-reconciliation"})
    (article_out / f"{slug}.md").write_text(text)

# Copy and edit structured metadata, never the approved source file.
word_source = ROOT / "sources/word-explorer/words-2026-09-06-250.json"
words = json.loads(word_source.read_text())
word_changes = []
for finding_id, (slug, field, new) in WORD_CHANGES.items():
    row = next(item for item in words if item["slug"] == slug)
    old = row[field]
    row[field] = new
    word_changes.append({"id": finding_id, "slug": slug, "field": field, "old": old, "new": new})
(OUTPUT / "words-2026-09-06-250.candidate.json").write_bytes(json_bytes(words, compact=True))

variant_source = ROOT / "content/editorial/variants.json"
variants = json.loads(variant_source.read_text())
variant_changes = []
changed_variant_ids = set()
for finding_id, (unit_id, field, old, new) in COMPARISON_REPLACEMENTS.items():
    unit = next(item for item in variants if item["id"] == unit_id)
    if field.startswith("source:"):
        source_id = field.split(":", 1)[1]
        source = next(item for item in unit["explanationSources"] if item["id"] == source_id)
        source["locator"] = replace_once(source["locator"], old, new, finding_id)
    else:
        unit["significance"][field] = replace_once(unit["significance"][field], old, new, finding_id)
    unit["status"] = "in-review"
    changed_variant_ids.add(unit_id)
    variant_changes.append({"id": finding_id, "unitId": unit_id, "field": field, "old": old, "new": new})

# AUDIT-088 is a structured reciprocal-link correction.
for unit_id, related in (("candidate-19", "candidate-12"), ("candidate-12", "candidate-19")):
    unit = next(item for item in variants if item["id"] == unit_id)
    before = list(unit.get("relatedUnits", []))
    if related not in before:
        unit.setdefault("relatedUnits", []).append(related)
    unit["status"] = "in-review"
    changed_variant_ids.add(unit_id)
    variant_changes.append({"id": "AUDIT-088", "unitId": unit_id, "field": "relatedUnits", "old": before, "new": unit["relatedUnits"]})
(OUTPUT / "variants.candidate.json").write_bytes(json_bytes(variants))

original_variants = {item["id"]: item for item in json.loads(variant_source.read_text())}
candidate_variants = {item["id"]: item for item in variants}
review_hashes = []
for unit_id in sorted(changed_variant_ids):
    old = deepcopy(original_variants[unit_id]); old.pop("status", None)
    new = deepcopy(candidate_variants[unit_id]); new.pop("status", None)
    review_hashes.append({
        "unitId": unit_id,
        "previousReviewPayloadSha256": digest(json_bytes(old, compact=True)),
        "candidateReviewPayloadSha256": digest(json_bytes(new, compact=True)),
        "previousApprovalInvalidated": True,
    })

# Reconcile every external finding; no silent drops.
reconciliation = []
for finding in findings:
    finding_id = finding["id"]
    if finding_id in UNRESOLVED:
        disposition = "human-review-required"
        note = UNRESOLVED[finding_id]
    elif finding_id in ARTICLE_NEW or finding_id in WORD_CHANGES or finding_id in COMPARISON_REPLACEMENTS or finding_id == "AUDIT-088":
        disposition = "included-in-candidate"
        note = "An exact correction is included in the non-public candidate; author/reviewer approval remains required."
    else:
        raise SystemExit(f"Unreconciled external finding: {finding_id}")
    reconciliation.append({
        "id": finding_id,
        "corpus": finding["corpus"],
        "recordId": finding["recordId"],
        "classification": finding["classification"],
        "severity": finding["severity"],
        "externalRequiresHumanReview": finding["requiresHumanReview"],
        "disposition": disposition,
        "note": note,
    })

kimi_already_covered = {
    "AUDIT-003", "AUDIT-005", "AUDIT-006", "AUDIT-007",
    "AUDIT-032", "AUDIT-033", "AUDIT-034", "AUDIT-035", "AUDIT-036",
    "AUDIT-037", "AUDIT-038", "AUDIT-039", "AUDIT-040",
}
kimi_reconciliation = []
for finding in kimi_findings:
    finding_id = finding["id"]
    if finding_id in kimi_already_covered:
        disposition = "already-covered-by-candidate-v1"
        note = "Kimi independently confirmed a correction already present in candidate v1."
    else:
        disposition = "included-in-candidate-v2"
        note = "A supportable exact correction is included in candidate v2; author/reviewer approval remains required."
    kimi_reconciliation.append({
        "id": finding_id,
        "corpus": finding["corpus"],
        "recordId": finding["recordId"],
        "classification": finding["classification"],
        "severity": finding["severity"],
        "externalRequiresHumanReview": finding["requiresHumanReview"],
        "disposition": disposition,
        "note": note,
    })

article_files = []
for path in sorted(article_out.glob("*.md")):
    source = SOURCE_DIR / "raw" / path.name
    article_files.append({"file": f"articles/raw/{path.name}", "sha256": digest(path.read_bytes()), "predecessorSha256": digest(source.read_bytes()), "changed": path.read_bytes() != source.read_bytes()})

candidate_manifest = {
    "schemaVersion": 1,
    "candidateId": "full-corpus-audit-2026-09-11-candidate-v2",
    "status": "unpublished-awaiting-human-approval",
    "sourceArticleRelease": SOURCE_RELEASE,
    "proposedArticleRelease": "om-studies-2026-09-11-v6",
    "externalAuditFindingsSha256": digest(FINDINGS_PATH.read_bytes()),
    "kimiAuditFindingsSha256": digest(KIMI_FINDINGS_PATH.read_bytes()),
    "articleChangeCount": len(article_changes),
    "changedArticleCount": sum(row["changed"] for row in article_files),
    "wordMetadataChangeCount": len(word_changes),
    "comparisonChangeCount": len(variant_changes),
    "changedComparisonUnitCount": len(changed_variant_ids),
    "unresolvedFindingIds": sorted(UNRESOLVED),
    "inputs": {
        "articleManifestSha256": digest((SOURCE_DIR / "manifest.json").read_bytes()),
        "wordMetadataSha256": digest(word_source.read_bytes()),
        "variantsSha256": digest(variant_source.read_bytes()),
    },
    "structuredCandidateFiles": {
        "words-2026-09-06-250.candidate.json": digest((OUTPUT / "words-2026-09-06-250.candidate.json").read_bytes()),
        "variants.candidate.json": digest((OUTPUT / "variants.candidate.json").read_bytes()),
    },
    "articleFiles": article_files,
    "articleChanges": article_changes,
    "wordMetadataChanges": word_changes,
    "comparisonChanges": variant_changes,
    "comparisonReviewHashes": review_hashes,
}
manifest_bytes = json_bytes(candidate_manifest)
(OUTPUT / "CANDIDATE-MANIFEST.json").write_bytes(manifest_bytes)

validation = {
    "schemaVersion": 1,
    "status": "pass",
    "candidateManifestSha256": digest(manifest_bytes),
    "externalFindingCount": len(reconciliation),
    "includedExternalFindingCount": sum(row["disposition"] == "included-in-candidate" for row in reconciliation),
    "unresolvedExternalFindingCount": sum(row["disposition"] == "human-review-required" for row in reconciliation),
    "kimiFindingCount": len(kimi_reconciliation),
    "kimiNewCandidateFindingCount": sum(row["disposition"] == "included-in-candidate-v2" for row in kimi_reconciliation),
    "kimiAlreadyCoveredFindingCount": sum(row["disposition"] == "already-covered-by-candidate-v1" for row in kimi_reconciliation),
    "localFindingCount": len(LOCAL_ARTICLE_CHANGES),
    "immutablePredecessorVerified": True,
    "sourceFilesModified": False,
}
(OUTPUT / "VALIDATION.json").write_bytes(json_bytes(validation))

review_lines = [
    "# Full-corpus correction candidate v2",
    "",
    "Status: **unpublished; awaiting Larry Herzog Jr.'s review**",
    "",
    f"Candidate manifest SHA-256: `{digest(manifest_bytes)}`",
    "",
    "The manifest is authoritative. The excerpts below are a review aid; no source or approved file has been changed.",
    "",
    "## Article changes",
    "",
]
for change in article_changes:
    review_lines.extend([
        f"### {change['id']} — {change['slug']}",
        "",
        "Before:",
        "",
        f"> {change['old']}",
        "",
        "After:",
        "",
        f"> {change['new'] or '[deleted]'}",
        "",
    ])
review_lines.extend(["## Word-metadata changes", ""])
for change in word_changes:
    review_lines.append(f"- `{change['id']}` `{change['slug']}.{change['field']}`: `{change['old']}` → `{change['new']}`")
review_lines.extend(["", "## Comparison-commentary changes", ""])
for change in variant_changes:
    review_lines.append(f"- `{change['id']}` `{change['unitId']}.{change['field']}`: `{change['old']}` → `{change['new']}`")
review_lines.extend(["", "## Comparison approval hashes", ""])
for row in review_hashes:
    review_lines.append(f"- `{row['unitId']}`: `{row['previousReviewPayloadSha256']}` → `{row['candidateReviewPayloadSha256']}` (previous approval invalidated)")
review_lines.extend(["", "## Unresolved external findings", ""])
for finding_id, note in sorted(UNRESOLVED.items()):
    review_lines.append(f"- `{finding_id}`: {note}")
(OUTPUT / "REVIEW.md").write_text("\n".join(review_lines) + "\n")
(DOC_OUTPUT / "FINDING-RECONCILIATION.json").write_bytes(json_bytes({"schemaVersion": 1, "externalAuditFindingsSha256": digest(FINDINGS_PATH.read_bytes()), "findings": reconciliation, "localFindings": [row for row in article_changes if row["origin"] == "local-reconciliation"]}))
(DOC_OUTPUT / "KIMI-FINDING-RECONCILIATION.json").write_bytes(json_bytes({
    "schemaVersion": 1,
    "kimiAuditFindingsSha256": digest(KIMI_FINDINGS_PATH.read_bytes()),
    "findings": kimi_reconciliation,
    "orthotomeoSectionOrderObservation": "Kimi also observed that orthotomeo reverses two major sections relative to the other 249 articles. Candidate v2 preserves the authorial order pending an explicit editorial decision.",
}))
(DOC_OUTPUT / "CANDIDATE-VALIDATION.json").write_bytes(json_bytes(validation))

# Record a disposition for every one of the 243 fallback substitutions. This is
# a ledger reconciliation, not a claim that every retained full verse is ideal.
fallback_ledger_path = ROOT / "artifacts/editorial/om-bsb-2026-09-09-candidate-v30/verification.json"
fallback_verification = json.loads(fallback_ledger_path.read_text())
fallback_rows = []
for index, row in enumerate(fallback_verification["lowConfidence"], start=1):
    slug = row["slug"]
    predecessor_text = (SOURCE_DIR / "raw" / f"{slug}.md").read_text()
    candidate_text = (article_out / f"{slug}.md").read_text()
    rendered = row["renderedNew"]
    before_count = predecessor_text.count(rendered)
    after_count = candidate_text.count(rendered)
    corrected = after_count < before_count
    fallback_rows.append({
        "index": index,
        "key": f"{slug}:{row['line']}:{row['normalizedReference']}",
        "slug": slug,
        "line": row["line"],
        "reference": row["normalizedReference"],
        "score": row["score"],
        "oldLength": len(row["old"]),
        "renderedNewLength": len(rendered),
        "disposition": "candidate-corrected" if corrected else "retained-no-specific-defect-found",
        "candidateChangedRenderedOccurrenceCount": before_count - after_count,
        "reviewMethod": "deterministic-ledger-reconciliation plus targeted context review of likely phrase-slot risks",
    })
if len(fallback_rows) != 243:
    raise SystemExit("Expected 243 fallback records.")
(DOC_OUTPUT / "FALLBACK-RECONCILIATION.json").write_bytes(json_bytes({
    "schemaVersion": 1,
    "sourceVerificationSha256": digest(fallback_ledger_path.read_bytes()),
    "recordCount": len(fallback_rows),
    "candidateCorrectedCount": sum(row["disposition"] == "candidate-corrected" for row in fallback_rows),
    "retainedCount": sum(row["disposition"] == "retained-no-specific-defect-found" for row in fallback_rows),
    "interpretationWarning": "Retained means this reconciliation found no specific contextual defect; it is not a blanket editorial endorsement of whole-verse fallback as a future adaptation policy.",
    "records": fallback_rows,
}))

summary = f"""# Full-corpus audit reconciliation v2

Date: 2026-09-11  
Status: **correction candidate only — not approved, selected, published, or deployed**

## Result

Claude's returned audit contained 88 findings. This reconciliation includes exact candidate corrections for {validation['includedExternalFindingCount']} and leaves {validation['unresolvedExternalFindingCount']} in a named human-review queue. Local review of the fallback ledger added {len(LOCAL_ARTICLE_CHANGES)} phrase-slot and quotation-wrapper corrections.

Kimi's independent audit contained {validation['kimiFindingCount']} findings. It independently confirmed {validation['kimiAlreadyCoveredFindingCount']} candidate-v1 corrections and contributed {validation['kimiNewCandidateFindingCount']} supportable findings to candidate v2. Kimi's two count claims were recalculated against the pinned Nestle analysis: Acts contains 28 occurrences of *mathētēs*, 10 before Acts 11:26; the 12 occurrences of *prothesis* divide 4 showbread / 8 purpose. The observed `orthotomeo` section-order difference is recorded but deliberately not changed without an editorial decision.

The candidate changes {candidate_manifest['changedArticleCount']} of 250 immutable-v5 article copies with {candidate_manifest['articleChangeCount']} exact replacements, changes {len(word_changes)} word-metadata fields, and changes {len(changed_variant_ids)} comparison units. Every changed comparison unit is returned to `in-review`; its previous approval hash is explicitly invalidated. The separate fallback reconciliation accounts for all 243 fallback records and distinguishes candidate-corrected occurrences from retained records without treating retention as a blanket editorial endorsement.

Candidate manifest SHA-256: `{digest(manifest_bytes)}`

## Evidence boundary

Claude's and Kimi's returns are evidence, not authority. Claude reports automated checks across all 250 articles and close reading of flagged passages, plus close reading of all 30 comparison commentaries. Kimi reports complete deterministic coverage plus targeted/manual contextual review; neither return claims a fresh uninterrupted human-quality close read of every sentence in all 250 articles. The local reconciliation verified the immutable v5 hashes, checked proposed BSB wording against pinned sources, recalculated numerical claims against pinned analysis, and inspected all 243 fallback records through the deterministic ledger and targeted context review.

## Still requiring a decision or source

"""
for finding_id, note in sorted(UNRESOLVED.items()):
    finding = by_id[finding_id]
    summary += f"- `{finding_id}` ({finding['recordId']}): {note}\n"
summary += """

## Approval gate

Do not promote this candidate by copying files into the immutable release or approved editorial paths. Larry Herzog Jr. must first review the before/after changes and approve the exact candidate manifest SHA-256. A later promotion must create a new immutable article release, update comparison approval hashes, rerun the full verification suite, and produce a new public-release manifest.
"""
(DOC_OUTPUT / "RECONCILIATION.md").write_text(summary)

receipt = {
    "schemaVersion": 1,
    "receivedZip": "Claude-audit.zip",
    "receivedZipSha256": "e3109974da7f0d5b5cb44a6127a03205c7764e23c4f0fe37820b1f75da9098e5",
    "inputPacketManifestSha256": "7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06",
    "files": {path.name: digest(path.read_bytes()) for path in sorted(RETURN.iterdir()) if path.is_file()},
}
(DOC_OUTPUT / "EXTERNAL-AUDIT-RECEIPT.json").write_bytes(json_bytes(receipt))

kimi_receipt = {
    "schemaVersion": 1,
    "receivedZip": "Ad-Fontes-NT-Audit-Reports-2026-09-11.zip",
    "receivedZipSha256": "79855b36fc7c8bb4b0e5463edf54bca8ca5d4d74bc2b2e9d2c5703d25c95294c",
    "inputPacketManifestSha256": "7d54757af5da94553a87c0d546e78b34e54aea0c0f785ff82e4fb77e7fd62c06",
    "files": {path.name: digest(path.read_bytes()) for path in sorted(KIMI_RETURN.iterdir()) if path.is_file()},
}
(DOC_OUTPUT / "KIMI-AUDIT-RECEIPT.json").write_bytes(json_bytes(kimi_receipt))

print(json.dumps(validation, indent=2))
