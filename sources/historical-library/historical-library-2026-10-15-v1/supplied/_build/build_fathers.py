#!/usr/bin/env python3
"""Build ANF/NPNF per-document JSON from CCEL ThML XML (lxml DOM walk).

Document model (heuristic, per div1):
- div1 whose div2 children contain div3+ -> div1 IS the document (div2/div3
  titles become section headings).
- otherwise, leaf div2 with non-chapter-like titles -> div1 is a collection;
  each div2 is a document.
- otherwise -> div1 is a single document with div2 sections.
Editorial front matter (title pages, prefaces, introductory notices,
elucidations, indexes) is dropped. ANF vol.7 Apostolic Constitutions and
vol.8 Pseudo-Clementine Literature excluded per request. All <note> elements
stripped in ANF (Coxe/Roberts editorial footnotes); kept inline as
[Note: ...] in NPNF (Schaff & translators).
"""
import json, os, re
from lxml import etree

WS = "/Users/lherzog/Documents/kimi/tasks/2026-10-09/07-25-13-9358ceac/ad-fontes-pd-library"
SRC = "/tmp/pdlib_src/ccel"

def ln(t): return t.split(".")[-1] if isinstance(t, str) else ""

SERIES = {
    "anf": {"volumes": [f"anf{i:02d}" for i in range(1, 10)],
            "name": "Ante-Nicene Fathers", "strip_notes": True,
            "vol_author": {i: None for i in range(1, 10)}},
    "npnf1": {"volumes": [f"npnf1{i:02d}" for i in range(1, 15)],
              "name": "Nicene and Post-Nicene Fathers, Series 1", "strip_notes": False,
              "vol_author": {**{i: "Augustine of Hippo" for i in range(1, 9)},
                             **{i: "John Chrysostom" for i in range(9, 15)}}},
    "npnf2": {"volumes": [f"npnf2{i:02d}" for i in range(1, 15)],
              "name": "Nicene and Post-Nicene Fathers, Series 2", "strip_notes": False,
              "vol_author": {1: "Eusebius of Caesarea",
                             2: "Socrates Scholasticus; Sozomen",
                             3: "Theodoret of Cyrrhus; Jerome; Rufinus of Aquileia",
                             4: "Athanasius of Alexandria",
                             5: "Athanasius of Alexandria",
                             6: "Jerome",
                             7: "Cyril of Jerusalem; Gregory of Nazianzus",
                             8: "Basil of Caesarea",
                             9: "Hilary of Poitiers; John of Damascus",
                             10: "Ambrose of Milan",
                             11: "Sulpitius Severus; Vincent of Lerins; John Cassian",
                             12: "Leo the Great; Gregory the Great",
                             13: "Gregory the Great; Ephraim the Syrian",
                             14: "Various (Ecumenical Councils)"}},
}

AUTHOR_HINTS = [
    ("socrates scholasticus", "Socrates Scholasticus"),
    ("sozomen", "Sozomen"),
    ("theodoret", "Theodoret of Cyrrhus"),
    ("lives of illustrious men", "Jerome; Gennadius"),
    ("rufinus", "Rufinus of Aquileia"),
    ("catechetical lectures", "Cyril of Jerusalem"),
    ("gregory nazianzen", "Gregory of Nazianzus"),
    ("de trinitate", "Hilary of Poitiers"),
    ("de synodis", "Hilary of Poitiers"),
    ("homilies on psalms", "Hilary of Poitiers"),
    ("john of damascus", "John of Damascus"),
    ("pastoral rule", "Gregory the Great"),
    ("ephraim", "Ephraim the Syrian"),
    ("leo the great", "Leo the Great"),
    ("gregory the great", "Gregory the Great"),
    ("council", "Ecumenical Councils"),
]

DROP_DIV1_EXACT = {
    ("anf", "Constitutions of the Holy Apostles"),
    ("anf", "Pseudo-Clementine Literature."),
    ("anf", "Pseudo-Clementine Literature"),
}
# never treat index material as a work container, even if it holds div2s
SKIP_INDEX = re.compile(r"(?i)\b(index of|indexes|words and phrases)\b")

def norm(s):
    return re.sub(r"\s+", " ", (s or "").replace("\u2019", "'").replace("\u2018", "'")).strip()

SKIP_DIV1 = re.compile(
    r"(?i)\b(title pages?|series title\.?|preface\.?|editor'?s preface|contents\.?|"
    r"comparative table|chief events|indexes?|index of|subject indexes?|dedication.*|"
    r"introductory( (notice|note|essay))?|general index|"
    r"words and phrases|genealogical tables?|chronological table|credits\.?)\b"
)
SKIP_DIV2 = re.compile(
    r"(?i)^(title pages?\.?|preface\.?|preface to .*|prefatory note\.?|"
    r"introductory( (notice|note))*\.?.*|introduction\.?|editor'?s preface\.?|note by the american editor\.?|"
    r"elucidations?\.?|argument\.?|translator'?s (preface|introductory notice)\.?.*|"
    r"index of .*|.* words and phrases|index of pages.*|index of subjects\.?|"
    r"contents.*|life and writings of .*|"
    r"the opinion of .*|advertisement\.?)$"
)
CHAPTER_LIKE = re.compile(
    r"(?i)^(chapter|section|book|part|lecture|tractate|homily|psalm|canto|"
    r"discourse|paragraph|caput|fragment)\b|^[ivxlcdm]+\.\s"
)
COLLECTION_WORDS = re.compile(
    r"(?i)\b(works of|treatises|writings|select(ions|ed)?|lives|hymns|homilies|"
    r"orations|letters|sermons|epistles|canons|prefaces|dialogues|history of)\b"
)

def slugify(title):
    s = re.sub(r"(?i)\b(the|of|a|an|to|and|or|in|on|for)\b", " ", title.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60].strip("-")

def emit_text(el, strip_notes, parts):
    if el.text:
        parts.append(el.text)
    for node in el:
        t = ln(node.tag)
        if t == "note":
            if not strip_notes:
                parts.append(" [Note: ")
                emit_text(node, strip_notes, parts)
                parts.append("] ")
        elif t in ("pb", "style", "index"):
            pass
        elif t in ("h1", "h2", "h3", "h4"):
            pass
        else:
            if t == "p":
                parts.append("\n\n")
            elif t in ("l", "br"):
                parts.append("\n")
            elif t == "cell":
                parts.append(" | ")
            emit_text(node, strip_notes, parts)
        if node.tail:
            parts.append(node.tail)

def sections_from(doc_el, strip_notes):
    sections = []
    cur = None
    def new_section(heading):
        nonlocal cur
        cur = [heading, []]
        sections.append(cur)
    def walk(el):
        nonlocal cur
        for node in el:
            t = ln(node.tag)
            if t in ("h2", "h3", "h4"):
                new_section(norm("".join(node.itertext())))
                continue
            if t in ("div2", "div3", "div4", "div5"):
                title = norm(node.get("title") or node.get("shorttitle"))
                if SKIP_DIV2.search(title or " "):
                    continue
                if title:
                    new_section(title)
                walk(node)
                continue
            if t == "note":
                if not strip_notes:
                    if cur is None: new_section("")
                    cur[1].append(" [Note: ")
                    emit_text(node, strip_notes, cur[1])
                    cur[1].append("] ")
                continue
            if t in ("pb", "style"):
                continue
            if cur is None:
                new_section("")
            if t == "p":
                cur[1].append("\n\n")
            elif t in ("l", "br"):
                cur[1].append("\n")
            elif t == "cell":
                cur[1].append(" | ")
            emit_text(node, strip_notes, cur[1])
            if node.tail:
                cur[1].append(node.tail)
    new_section("")
    walk(doc_el)
    out = []
    for heading, parts in sections:
        text = "".join(parts).replace("\xa0", " ")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r" *\n *", "\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text).strip()
        if text:
            out.append((heading, text))
    return out

def author_for(title, div1_title, vol_author):
    hay = f"{div1_title} {title}".lower()
    for key, auth in AUTHOR_HINTS:
        if key in hay:
            return auth
    return vol_author or div1_title

def build_volume(series_key, volfile, volnum):
    cfg = SERIES[series_key]
    tree = etree.parse(os.path.join(SRC, volfile + ".xml"),
                       etree.XMLParser(recover=True, huge_tree=True))
    body = next(el for el in tree.getroot().iter() if ln(el.tag) == "body")
    docs = []   # (title, author, element)
    for d1 in body:
        if ln(d1.tag) != "div1":
            continue
        t1 = norm(d1.get("title") or d1.get("shorttitle"))
        d2s = [c for c in d1 if ln(c.tag) == "div2"]
        editorial_div2 = [d for d in d2s
                          if SKIP_DIV2.search(norm(d.get("title") or d.get("shorttitle") or "x") or "x")]
        real_div2 = [d for d in d2s
                     if not SKIP_DIV2.search(norm(d.get("title") or d.get("shorttitle") or "x") or "x")]
        if not t1 or SKIP_INDEX.search(t1) or (SKIP_DIV1.search(t1) and not real_div2):
            continue
        if (series_key, t1) in DROP_DIV1_EXACT:
            print(f"    [excluded] {t1}")
            continue
        vol_author = cfg["vol_author"].get(volnum)
        if real_div2:
            all_chapter = all(
                CHAPTER_LIKE.match(norm(d.get("title") or d.get("shorttitle") or ""))
                for d in real_div2)
            chapter_book = (not t1.isupper() and not COLLECTION_WORDS.search(t1)
                            and not SKIP_DIV1.search(t1))
            if all_chapter:
                # chapters/books/psalms -> div1 is one document
                docs.append((t1, t1, d1, vol_author))
            elif (chapter_book and
                  all(not any(ln(g.tag) in ("div3", "div4", "div5") for g in d)
                      for d in real_div2) and
                  [d.get("n") for d in real_div2] ==
                  [str(i) for i in range(1, len(real_div2) + 1)]):
                # sequentially numbered leaf chapters of a single work
                docs.append((t1, t1, d1, vol_author))
            else:
                # each div2 is its own document
                for d2 in real_div2:
                    t2 = norm(d2.get("title") or d2.get("shorttitle"))
                    if (chapter_book and
                            any(ln(g.tag) in ("div3", "div4", "div5") for g in d2)):
                        n = d2.get("n") or ""
                        t2 = f"{t1}, Book {n}" if n else t1
                    docs.append((t2, t1, d2, vol_author))
        else:
            if not SKIP_DIV1.search(t1):
                docs.append((t1, t1, d1, vol_author))
    outdir = f"{WS}/church-fathers/{series_key}/vol-{volnum:02d}"
    os.makedirs(outdir, exist_ok=True)
    index, used = [], {}
    for title, group, el, vol_author in docs:
        secs = sections_from(el, cfg["strip_notes"])
        if not secs:
            continue
        slug = slugify(title) or "untitled"
        n = used.get(slug, 0)
        used[slug] = n + 1
        if n:
            slug = f"{slug}-{n+1}"
        if series_key == "anf":
            author = group
        else:
            author = author_for(title, group if group != title else "", vol_author)
        doc = {
            "slug": slug, "title": norm(title), "author": norm(author),
            "series": cfg["name"], "volume": volnum,
            "sections": [{"n": i + 1, "heading": h, "text": tx} for i, (h, tx) in enumerate(secs)],
        }
        with open(f"{outdir}/{slug}.json", "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=1)
        txt = [doc["title"], f"{doc['author']} — {cfg['name']}, Volume {volnum}", ""]
        for s in doc["sections"]:
            if s["heading"]:
                txt += [s["heading"], ""]
            txt += [s["text"], ""]
        open(f"{outdir}/{slug}.txt", "w", encoding="utf-8").write("\n".join(txt))
        index.append({"slug": slug, "title": doc["title"], "author": doc["author"],
                      "sections": len(doc["sections"])})
    with open(f"{outdir}/index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    print(f"    {len(index)} documents")
    return len(index)

if __name__ == "__main__":
    summary = {}
    for key in ("anf", "npnf1", "npnf2"):
        total = 0
        for n, vol in enumerate(SERIES[key]["volumes"], 1):
            print(f"  {vol}")
            total += build_volume(key, vol, n)
        summary[key] = total
    print("TOTALS:", summary)
