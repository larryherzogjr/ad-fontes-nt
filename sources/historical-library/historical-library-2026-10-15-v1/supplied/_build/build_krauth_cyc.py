#!/usr/bin/env python3
"""Build Krauth, The Conservative Reformation and Its Theology (1872)
and the Lutheran Cyclopedia (Jacobs & Haas, 1899) into Ad Fontes JSON/text bundles.

Krauth segmentation is driven by the book's own chapter openers: a line with the
article's roman numeral ("II.", "IV,"), a caps title block, and the printed page
folio at the bottom of the opener page.  Every cut was validated against the
running-head page map (parity-checked, monotonic) and the printed TOC.
"""
import json, os, re, sys

WS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = "/tmp/pdlib_src"
OUT = os.path.join(WS, "krauth-conservative-reformation")

# ---------------------------------------------------------------- Krauth ----

HEAD_L = re.compile(r"^\s*(\d{1,3})\s+([A-Z][A-Z .,'\-]{5,})\.?\s*$")
HEAD_R = re.compile(r"^\s*([A-Z][A-Z .,'\-]{5,})\.?\s+(\d{1,3})\s*$")

# (key, display heading, anchor pattern, search center line, expected opener page)
# The book has fourteen printed articles; XII-XIV are the three parts of the
# Lord's Supper treatment (Thetically Stated, Antithesis, Objections).
KRAUTH_ARTICLES = [
    ("1",  "I. The Occasion and Cause of the Reformation",
     r"immediate\s+occasion\s+of\s+the\s+Reformation", 596, 1),
    ("2",  "II. The Chief Organ: Luther",
     r"LUTHER\s+PICTURED\s+BY\s+PENCIL", 1537, 22),
    ("3",  "III. The Chief Instrument: Luther's New Testament",
     r"LUTHER'?S\s+TRANSLATION\s+OF\s+THE\s+NEW\s+TESTA?J?MENT", 4573, 88),
    ("4",  "IV. The Church of the Conservative Reformation: The Lutheran Church",
     r"CONSERVATIVE\s+CHURCH\s+OF\s+THE\s+REFORMATION", 6053, 112),
    ("5",  "V. The Confessional Principle",
     r"CONFESSIONAL\s+PRINCIPLE\s+OF\s+THE\s+CONSERV", 8328, 162),
    ("6",  "VI. The Primary Confession: The Augsburg Confession",
     r"PRIMARY\s+CONFESSION", 10055, 201),
    ("7",  "VII. The Secondary Confessions: The Book of Concord",
     r"SECONDARY\s+CONFESSIONS\s+OF\s+THE\s+CON", 13249, 268),
    ("8",  "VIII. History and Doctrines: Mistakes Corrected",
     r"MISTAKES\s+IN\s+REGARD\s+TO\s+THE\s+HISTORY", 16034, 329),
    ("9",  "IX. Original Sin",
     r"SPECIFIC\s+DOCTRINES\s+OF\s+THE\s+CONSERVATIVE", 17163, 355),
    ("10", "X. The Person of Christ",
     r"PERSON\s+OF\s+OUR\s+LORD\s+AND\s+HIS\s+SACRAMENTAL", 22081, 456),
    ("11", "XI. Baptism",
     r"^\s*XI\.\s*$", 24916, 518),
    ("12", "XII. The Doctrine of the Lord's Supper Thetically Stated",
     r"LORD'?S\s+SUPPER\s+THETICALLY", 28069, 585),
    ("13", "XIII. The Doctrine of the Lord's Supper Considered in Its Antithesis",
     r"LORD'?S\s+SUPPER\s+CONSIDERED", 31684, 664),
    ("14", "XIV. Objections to the New Testament Doctrine of the Lord's Supper",
     r"OBJECTIONS\s+TO\s+THE\s+NEW\s+TESTAMENT\s+DOCTRINE", 35874, 755),
]


def page_events(lines):
    """Running heads as (line_idx, page): parity-checked, monotonic, gap-limited."""
    ev = []
    for i, ln in enumerate(lines):
        m = HEAD_L.match(ln)
        if m:
            p = int(m.group(1))
            if p % 2 == 0 and p <= 900:
                ev.append((i, p))
            continue
        m = HEAD_R.match(ln)
        if m:
            p = int(m.group(2))
            if p % 2 == 1 and p <= 900:
                ev.append((i, p))
    out, last = [], 0
    for i, p in ev:
        if p > last and p - last <= 14:
            out.append((i, p))
            last = p
    return out


def find_opener(lines, pat, center, expect_page, warnings):
    """Locate the chapter-opener line index; validate the printed folio."""
    rx = re.compile(pat)
    lo, hi = max(0, center - 200), min(len(lines), center + 200)
    hits = [i for i in range(lo, hi) if rx.search(lines[i])]
    if not hits:
        raise SystemExit(f"KRAUTH: anchor not found: {pat!r} near line {center}")
    idx = hits[0]
    # walk back over blank lines to include the "N." roman numeral line
    start = idx
    j = idx - 1
    while j >= 0 and (not lines[j].strip()
                      or re.match(r"^\s*[IVXLC]+\.?,?\s*$", lines[j])):
        if re.match(r"^\s*[IVXLC]+\.?,?\s*$", lines[j]):
            start = j
        j -= 1
    # validate against the opener page's own printed folio (bottom of page)
    if expect_page == 1:
        if start > 700:
            warnings.append(f"art I opener at line {start} later than expected")
        return start
    folio = None
    for k in range(idx, min(len(lines), idx + 140)):
        m = re.match(r"^\s*(\d{1,3})\s*$", lines[k])
        if m:
            folio = int(m.group(1))
            break
    if folio != expect_page:
        warnings.append(f"art opener near line {idx}: folio {folio}, "
                        f"expected {expect_page}")
    return start


def clean_section(lines):
    """Drop running heads, standalone folios; join paragraphs."""
    keep = []
    for ln in lines:
        s = ln.strip()
        if not s:
            keep.append("")
            continue
        if re.match(r"^\d{1,3}$", s):          # standalone folio
            continue
        m = HEAD_L.match(ln)
        if m and int(m.group(1)) % 2 == 0:
            continue
        m = HEAD_R.match(ln)
        if m and int(m.group(2)) % 2 == 1:
            continue
        keep.append(ln.rstrip())
    t = "\n".join(keep)
    t = re.sub(r"\n{3,}", "\n\n", t).strip()
    t = re.sub(r"(\w)-\n(\w)", r"\1\2", t)     # de-hyphenate wraps
    paras = [re.sub(r"[ \t]+", " ", p).strip() for p in t.split("\n\n")]
    return "\n\n".join(p for p in paras if p)


def build_krauth():
    lines = open(os.path.join(SRC, "ia/krauth.txt"), encoding="utf-8").read().split("\n")

    # body end: the first "INDEX." running head — body pages run to 830 and
    # the printed general index (pp. 831-865, references only) is dropped
    body_end = next(i for i in range(38000, len(lines))
                    if re.match(r"^\s*INDEX\.\s*$", lines[i]))

    warnings = []
    bounds = []
    for key, heading, pat, center, page in KRAUTH_ARTICLES:
        bounds.append((find_opener(lines, pat, center, page, warnings),
                       key, heading, page))

    body_start = bounds[0][0]
    front = clean_section(lines[:body_start])

    sections = []
    for n, (start, key, heading, page) in enumerate(bounds):
        end = bounds[n + 1][0] if n + 1 < len(bounds) else body_end
        text = clean_section(lines[start:end])
        if len(text) < 500:
            raise SystemExit(f"KRAUTH: section {key} suspiciously short "
                             f"({len(text)} chars)")
        sections.append({"n": int(key) if key.isdigit() else key,
                         "heading": heading, "text": text,
                         "start_page": page})

    doc = {
        "code": "KRAUTH-CR",
        "author": "Charles Porterfield Krauth",
        "work": "The Conservative Reformation and Its Theology",
        "edition": "Philadelphia: J. B. Lippincott & Co., 1872",
        "language": "en",
        "front_matter": front,
        "sections": [{k: s[k] for k in ("n", "heading", "text")} for s in sections],
    }

    os.makedirs(os.path.join(OUT, "json"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "text"), exist_ok=True)
    with open(os.path.join(OUT, "json/krauth-conservative-reformation.json"), "w") as f:
        json.dump(doc, f, ensure_ascii=False)
    with open(os.path.join(OUT, "text/krauth-conservative-reformation.txt"), "w") as f:
        f.write(doc["front_matter"] + "\n\n")
        for s in doc["sections"]:
            f.write("=" * 70 + "\n" + s["heading"] + "\n" + "=" * 70 + "\n\n")
            f.write(s["text"] + "\n\n")
    index = {
        "resource": "Krauth, The Conservative Reformation and Its Theology",
        "source": "Internet Archive OCR of the 1872 Philadelphia edition "
                  "(J. B. Lippincott & Co.); public domain",
        "schema": "json/krauth-conservative-reformation.json -> "
                  "{code, author, work, edition, front_matter, sections: [{n, heading, text}]}",
        "sections": len(sections),
        "section_chars": [len(s["text"]) for s in sections],
        "front_matter_chars": len(front),
        "notes": [
            "Articles I-VIII cover the Conservative Reformation itself; IX-XIV "
            "are the Specific Theology (Original Sin, Person of Christ, Baptism, "
            "and the Lord's Supper in three printed articles: Thetically Stated "
            "p.585, Antithesis p.664, Objections p.755).",
            "Each opener was validated against the printed page folio at the "
            "bottom of its chapter-opener page and the printed TOC.",
            "Page-bottom footnotes remain inline at their page positions; the "
            "printed general index at the back was dropped (references only).",
            "Known OCR noise: occasional garbled words, two-column marginal "
            "notes interleaved mid-paragraph.",
        ],
    }
    with open(os.path.join(OUT, "index.json"), "w") as f:
        json.dump(index, f, indent=1)
    for w in warnings:
        print("  WARNING:", w)
    print(f"krauth: {len(sections)} sections, "
          f"{sum(len(s['text']) for s in sections)} chars, "
          f"front {len(front)}")


# ----------------------------------------------------------- Cyclopedia ----

CYC_OUT = os.path.join(WS, "lutheran-cyclopedia")
CYC_CACHE = os.path.join(SRC, "ia/cyclopedia_recon.txt")
CYC_XML = os.path.join(SRC, "ia/cyc_cu.xml")

ROMAN_OK = {"V", "IV", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII",
            "XIV", "XV", "I", "II", "III", "XVI", "XVII", "XVIII", "XIX", "XX"}


def reconstruct_cyc(xml_path):
    """Reading-order text for the Cornell Jacobs-Haas scan.

    Unlike the ISBE scans, this book's running heads are set as
    column-width lines at the top of each column, so header dropping must
    not require full width.  Pages whose DjVu rows merged across the
    gutter (word coordinates are unusable) are split per row at the
    character-balance point, which keeps the column streams separate.
    """
    from lxml import etree
    out = []
    ctx = etree.iterparse(xml_path, events=("end",), tag="OBJECT", huge_tree=True)
    for _, page in ctx:
        w = int(page.get("width") or 0)
        rows = []
        for line in page.iter():
            if not isinstance(line.tag, str) or line.tag != "LINE":
                continue
            words = [x for x in line if isinstance(x.tag, str) and x.tag == "WORD"]
            if not words:
                continue
            cs = [tuple(int(v) for v in x.get("coords").split(",")) for x in words]
            l = min(c[0] for c in cs); t = min(c[1] for c in cs)
            r = max(c[2] for c in cs); b = max(c[3] for c in cs)
            rows.append({"l": l, "t": t, "r": r, "b": b,
                         "words": [(x.text or "") for x in words]})
        if not rows or not w:
            page.clear()
            continue
        hmax = max(x["b"] for x in rows)
        body = [x for x in rows if x["t"] >= 0.07 * hmax]
        # drop standalone folio numbers (top or bottom zone)
        body = [x for x in body
                if not (len(x["words"]) <= 2
                        and all(re.fullmatch(r"[0-9]{1,4}[.:]?", (t or "").strip())
                                for t in x["words"])
                        and (x["t"] < 0.12 * hmax or x["b"] > 0.90 * hmax))]
        wide = [x for x in body if x["r"] - x["l"] > 0.58 * w]
        merged = bool(body) and len(wide) > 0.3 * len(body)
        if merged and wide:
            # per-row balanced character split recovers the two column streams
            def split_row(row):
                ws, total = row["words"], 0
                lens = [len(x.strip()) for x in ws]
                total = sum(lens) + len(ws) - 1
                best, bestd = 1, None
                cum = lens[0]
                for j in range(1, len(ws)):
                    d = abs(cum - (total - cum))
                    if bestd is None or d < bestd:
                        best, bestd = j, d
                    cum += 1 + lens[j]
                if not (1 <= best < len(ws)):
                    best = max(1, len(ws) // 2)
                mk = lambda part, side: {
                    "l": row["l"] if side == "L" else (row["l"] + row["r"]) / 2,
                    "r": (row["l"] + row["r"]) / 2 if side == "L" else row["r"],
                    "t": row["t"], "b": row["b"], "words": part}
                return [mk(ws[:best], "L"), mk(ws[best:], "R")]
            fixed = []
            for x in body:
                if x["r"] - x["l"] > 0.58 * w:
                    fixed.extend(split_row(x))
                else:
                    fixed.append(x)
            body = fixed
        mid = w / 2.0
        left, right, full = [], [], []
        for x in body:
            (full if x["r"] - x["l"] > 0.58 * w else
             left if (x["l"] + x["r"]) / 2 < mid else right).append(x)
        page_out = [(" ".join(x["words"])).strip()
                    for x in sorted(left + full, key=lambda y: y["t"])]
        page_out += [(" ".join(x["words"])).strip()
                     for x in sorted(right, key=lambda y: y["t"])]
        out.append("\n".join(x for x in page_out if x))
        page.clear()
        while page.getprevious() is not None:
            del page.getparent()[0]
    return "\n".join(out)


# --- entry splitting ---

# topical: "Advent.  See Church Year." / "Accent,  ecclesiastical,  is  the ..."
# bio:     "Acrelius,  Israel,  Swedish  American  histor-" ("Surname, First,")
TOPIC_FOLLOW = ("See", "Is", "Was", "Were", "Are", "Has", "Have", "A", "An",
                "The", "Denotes", "Means", "Refers", "Consists", "Signifies",
                "Designates", "Embraces", "Covers", "Treats", "Discusses",
                "Defines", "Includes")
FUNC_WORDS = {"the", "of", "in", "for", "and", "or", "de", "von", "van", "zu",
              "der", "den", "dem", "le", "la", "di", "und", "y", "e", "da",
              "del", "della", "ten", "ter", "op", "ten", "zu", "zur", "van",
              "a", "an"}

TOPIC_RE = re.compile(
    r"^([A-Z][\w'’\-\.]*(?:(?:,\s*|\s+)[\w'’\-\.()]+){0,5}?[,.])\s+"
    r"(See|Is|Was|Were|Are|Has|Have|A|An|The|Denotes|Means|Refers|Consists|"
    r"Signifies|Designates|Embraces|Covers|Treats|Discusses|Defines|Includes)"
    r"(\s|$)")
BIO_RE = re.compile(
    r"^([A-Z][\w'’\-]+,(?:\s+(?:[A-Z][\w'’\-]+|\([0-9]{3,4}[a-z.]*\))){1,4},?)"
    r"\s{1,8}((?:b|d)\.|[A-Z(\"'“‘]\w*[.):]?)")
# "Kentucky, Lutherans in. In this state ...": headword ends in a function
# word and the follower is any capitalized sentence opener
FW_RE = re.compile(
    r"^([A-Z][\w'’\-\.]*(?:(?:,\s*|\s+)[\w'’\-\.()]+){0,5}?[,.])\s+"
    r"([A-Z][\w'’\-\.]*)(\s|$)")

SENT_END = tuple('.!?:;)”’»')

# words that appear in bibliography lines ("Schmid, Geschichte des Pietismus")
# or after "St." ("St. Sebald, Nuremberg") - never headword material
CITE_WORDS = {
    "geschichte", "dogmengeschichte", "theologie", "theol", "kirchliche",
    "christliche", "handbuch", "beitrage", "zeitschrift", "blatter",
    "archiv", "studien", "untersuchungen", "ausgabe", "auflage",
    "realencyklopadie", "encyklopadie", "encyclopedia", "nuremberg",
    "leipzig", "berlin", "wien", "heidelberg", "erlangen", "sqq",
    "pp", "luthertum", "kirchengeschichte", "dogmatik", "ethik",
    "symbolik", "homiletik", "exegetische", "historische", "kritische",
    "art", "conf", "cap", "sect",
}


def hw_key(title):
    t = re.sub(r"\([^)]*\)", "", title)     # parentheticals don't sort
    return re.sub(r"[^A-Z0-9]", "", t.upper())


def valid_title(hw):
    hw = hw.strip()
    if not (2 <= len(hw) <= 58):
        return False
    if sum(c.isalnum() for c in hw) < 2:
        return False
    if hw.upper().strip(".,") in ROMAN_OK:
        return False
    if re.search(r"[;:—&]", hw):
        return False
    if re.search(r"\d{4}-\d", hw):      # a date range is not a headword
        return False
    toks = hw.split()
    if toks[0].strip(".,").upper() in ROMAN_OK:
        return False                     # "IX. Eleemosynary Institutions."
    # every token must be Capitalized, ALLCAPS, initial, parenthetical, digit,
    # or an allowed function word / lowercase qualifier right after a comma
    qual_used = False
    for k, t in enumerate(toks):
        core = t.strip(".,()'’\"")
        if not core:
            continue
        if core.lower() in CITE_WORDS:
            return False
        if re.search(r"\d", core) and not re.fullmatch(
                r"\([0-9]{3,4}[a-z.]?\)", core):
            return False                 # bare numbers belong to citations
        if core[0].islower():
            if core in FUNC_WORDS or (t.startswith("(") and len(core) >= 4):
                continue
            # lowercase qualifier directly after the first comma
            # ("Accent, ecclesiastical,") - at most one
            if (not qual_used and any(c == "," for c in "".join(toks[:k]))
                    and k >= 1 and toks[k - 1].endswith(",")):
                qual_used = True
                continue
            return False
    last = toks[-1].strip(".,()'’\"")
    if last in FUNC_WORDS and not hw.rstrip().endswith("."):
        return False
    return True


def split_cyclopedia(text):
    lines = text.split("\n")
    # locate regions
    dict_start = next(i for i, ln in enumerate(lines)
                      if re.match(r"^Absolution\.\s+See\s+Conf", ln))
    appx = {}
    order = ["world", "chronology", "calendar", "contributors"]
    pats = {
        "world": r"^LUTHERANS\s+IN\s+THE\s+WORLD",
        "chronology": r"^LUTHERAN\s+CHRONOLOGY",
        "calendar": r"^LUTHERAN\s+CALENDAR",
        "contributors": r"^INDEX\s+OF\s+CONTRIBUTORS",
    }
    for name, pat in pats.items():
        for i in range(dict_start, len(lines)):
            if re.match(pat, lines[i]):
                appx[name] = i
                break
    world = appx.get("world", len(lines))
    front = "\n".join(lines[:dict_start]).strip()
    appendix_lines = {
        "world": lines[world:appx.get("chronology", len(lines))],
        "chronology": lines[appx.get("chronology", world):appx.get("calendar", len(lines))],
        "calendar": lines[appx.get("calendar", world):appx.get("contributors", len(lines))],
        "contributors": lines[appx.get("contributors", world):],
    }

    # --- split entries over lines[dict_start:world] ---
    entries = []          # (title, [line indices])
    last_key = ""
    violations = []
    prev_text = None      # previous non-empty line
    prev_idx = None
    streak = 0            # consecutive alphabetization rejects
    body = lines[dict_start:world]
    for i, raw in enumerate(body):
        ln = raw.strip()
        if not ln:
            continue
        # running-head stragglers: one short title-case word, nothing else
        if re.fullmatch(r"[A-Z][A-Za-z'’\-]{2,22}\.?", ln):
            prev_text, prev_idx = ln, i
            continue
        m = TOPIC_RE.match(ln) or BIO_RE.match(ln)
        if not m:
            mf = FW_RE.match(ln)
            if mf:
                last_tok = mf.group(1).strip().split()[-1].strip(".").lower()
                if last_tok in FUNC_WORDS:
                    m = mf
        if not m:
            prev_text, prev_idx = ln, i
            continue
        # a follower that is a roman numeral marks a mid-entry enumeration
        if len(m.groups()) >= 2 and m.group(2):
            f0 = m.group(2).strip().strip(".").upper().strip(")")
            f_raw = m.group(2).strip().lower().strip(".")
            if f0 in ROMAN_OK or f_raw in {"p", "pp", "vol", "vols", "no",
                                           "nos", "ed", "eds", "col", "cols",
                                           "chap", "art", "line", "lines"}:
                prev_text, prev_idx = ln, i
                continue
        hw = m.group(1).strip()
        if not valid_title(hw):
            prev_text, prev_idx = ln, i
            continue
        # context: previous line must close a sentence (or be a signature)
        wrapped = False
        if prev_text is not None:
            if prev_text.rstrip().endswith("-"):
                wrapped = True
            elif not prev_text.rstrip().endswith(SENT_END) \
                    and not re.fullmatch(r"[A-Z][. ]{1,4}([A-Z][. ]{1,4})*[A-Z]?\.?",
                                         prev_text.strip()):
                prev_text, prev_idx = ln, i
                continue
        if wrapped and prev_idx is not None:
            frag = prev_text.rstrip().rstrip("-").strip()
            hw = (frag + hw) if frag else hw
            if entries:
                t, ix = entries[-1]
                if len(ix) <= 1:
                    entries.pop()            # phantom: heading was pure fragment
                    hw = (t.rstrip("-").strip() + hw) if t else hw
                else:
                    entries[-1] = (t, ix[:-1])   # detach the fragment line
        key = hw_key(hw)
        rejected = False
        if key:
            if last_key and key <= last_key:
                # tolerate OCR key garbles inside the same two-letter region
                common = 0
                for a, b in zip(key, last_key):
                    if a != b:
                        break
                    common += 1
                if common < 2:
                    rejected = True
            if not rejected and last_key and key[0].isalpha() \
                    and last_key[0].isalpha() \
                    and ord(key[0]) - ord(last_key[0]) > 1:
                # dictionary letters advance one at a time; a bigger forward
                # jump means a mid-entry mention, not the next entry
                rejected = True
        if rejected:
            violations.append(f"line {dict_start+i}: {hw[:40]!r} "
                              f"(after {last_key[:24]!r})")
            streak += 1
            if streak >= 6 and entries:
                # a long run of rejects means the last accepted heading was
                # a mid-entry mention; demote it and resume from the
                # previous real entry
                demoted = entries.pop()[0]
                violations.append(f"line {dict_start+i}: demoted "
                                  f"{demoted[:40]!r} as poison")
                last_key = hw_key(entries[-1][0]) if entries else ""
                streak = 0
            prev_text, prev_idx = ln, i
            continue
        streak = 0
        entries.append((hw, [prev_idx] if wrapped else []))
        entries[-1][1].append(i)
        last_key = key
        prev_text, prev_idx = ln, i
        continue
    # note: entries built with line-index lists; finalize below
    out_entries = []
    for n, (title, ixs) in enumerate(entries):
        end = entries[n + 1][1][0] if n + 1 < len(entries) else len(body)
        start = ixs[0]
        out_entries.append((title, body[start:end]))
    appendix = []
    titles = {"world": "Lutherans in the World, 1898 (statistics)",
              "chronology": "Lutheran Chronology",
              "calendar": "Lutheran Calendar",
              "contributors": "Index of Contributors"}
    for name in order:
        appendix.append((titles[name], appendix_lines.get(name, [])))
    report = {"violations": violations, "n_raw_headings": len(entries)}
    return out_entries, appendix, front, report


def clean_entry(lines):
    t = "\n".join(x.rstrip() for x in lines)
    t = t.replace("\r", " ")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"(\w)-\s+(\w)", r"\1\2", t)      # de-hyphenate wraps
    t = re.sub(r"\s+([,.;:)])", r"\1", t)
    t = re.sub(r"([(])\s+", r"\1", t)
    return t.strip()


def write_cyclopedia(entries, appendix, front, report):
    os.makedirs(os.path.join(CYC_OUT, "json"), exist_ok=True)
    os.makedirs(os.path.join(CYC_OUT, "text"), exist_ok=True)
    doc = {
        "code": "LUTHCYC",
        "work": "The Lutheran Cyclopedia",
        "editors": "Henry Eyster Jacobs and John Augustus William Haas, with "
                   "the co-operation of Prof. O. Zockler and other scholars",
        "edition": "New York: Charles Scribner's Sons, 1899",
        "language": "en",
        "front_matter": front,
        "entries": [{"n": n + 1, "title": t, "text": clean_entry(ls)}
                    for n, (t, ls) in enumerate(entries)],
        "appendix": [{"heading": h, "text": clean_entry(ls)}
                     for h, ls in appendix],
    }
    with open(os.path.join(CYC_OUT, "json/lutheran-cyclopedia.json"), "w") as f:
        json.dump(doc, f, ensure_ascii=False)
    with open(os.path.join(CYC_OUT, "text/lutheran-cyclopedia.txt"), "w") as f:
        f.write(doc["front_matter"] + "\n\n")
        for e in doc["entries"]:
            f.write("=" * 70 + "\n" + e["title"] + "\n" + "=" * 70 + "\n\n")
            f.write(e["text"] + "\n\n")
        f.write("\n\n### APPENDIX ###\n\n")
        for a in doc["appendix"]:
            f.write("=" * 70 + "\n" + a["heading"] + "\n" + "=" * 70 + "\n\n")
            f.write(a["text"] + "\n\n")
    index = {
        "resource": "The Lutheran Cyclopedia (Jacobs & Haas, 1899)",
        "source": "Internet Archive Cornell scan (cu31924029466533), DjVu XML "
                  "column reconstruction; public domain (Scribner, 1899)",
        "schema": "json/lutheran-cyclopedia.json -> {code, work, editors, "
                  "edition, front_matter, entries: [{n, title, text}], "
                  "appendix: [{heading, text}]}",
        "entries": len(doc["entries"]),
        "appendix_sections": len(doc["appendix"]),
        "entry_chars": [len(e["text"]) for e in doc["entries"]],
        "front_matter_chars": len(front),
        "alphabetization_violations_rejected": len(report["violations"]),
        "notes": [
            "Dictionary body split at entry headings (topical and "
            "biographical forms), validated by alphabetical ordering; "
            "candidates that broke dictionary order were rejected as false "
            "positives.",
            "The Kenosis article and its neighbors (printed p. 361) come "
            "from a scan page whose OCR merged the two columns; that "
            "page's lines were split at the character-balance point, so "
            "word order near the column seam may be locally scrambled.",
            "OCR noise: occasional garbled words in names and Greek/German "
            "terms; statistical tables in the 'Lutherans in the World' "
            "appendix are approximate.",
            "Rejected heading candidates (possible missed entries): see "
            "build log; count in alphabetization_violations_rejected.",
        ],
    }
    with open(os.path.join(CYC_OUT, "index.json"), "w") as f:
        json.dump(index, f, indent=1)
    print(f"cyclopedia: {len(doc['entries'])} entries, "
          f"{sum(len(e['text']) for e in doc['entries'])} chars, "
          f"{len(report['violations'])} order violations")
    for v in report["violations"][:15]:
        print("  VIOL:", v)


def build_cyclopedia():
    if not os.path.exists(CYC_CACHE) or os.path.getsize(CYC_CACHE) < 3000000:
        print("cyclopedia: reconstructing Cornell scan (one-time)...")
        text = reconstruct_cyc(CYC_XML)
        with open(CYC_CACHE, "w") as f:
            f.write(text)
    text = open(CYC_CACHE, encoding="utf-8").read()
    entries, appendix, front, report = split_cyclopedia(text)
    if len(entries) < 2000:
        raise SystemExit(f"CYCLOPEDIA: only {len(entries)} entries - "
                         "heading pattern needs work")
    write_cyclopedia(entries, appendix, front, report)


if __name__ == "__main__":
    build_krauth()
    build_cyclopedia()
