#!/usr/bin/env python3
"""Build Edersheim, Life and Times of Jesus the Messiah (CCEL ThML)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_fathers import sections_from, ln, norm
from lxml import etree

WS = "/Users/lherzog/Documents/kimi/tasks/2026-10-09/07-25-13-9358ceac/ad-fontes-pd-library"

BOOKS = [
    ("Introductory. The Preparation", "vol-1-the-preparation-for-the-gospel", "Book I — The Preparation for the Gospel: The Jewish World in the Days of Christ"),
    ("From the Manger in Bethlehem", "vol-2-from-the-manger-in-bethlehem-to-the-baptism-in-jordan", "Book II — From the Manger in Bethlehem to the Baptism in Jordan"),
    ("The Ascent: From the River Jordan", "vol-3-the-ascent-from-the-river-jordan-to-the-mount-of-transfiguration", "Book III — The Ascent: From the River Jordan to the Mount of Transfiguration"),
    ("The Descent: From the Mount", "vol-4-the-descent-from-the-mount-of-transfiguration-into-the-valley-of-humiliation-and-death", "Book IV — The Descent: From the Mount of Transfiguration into the Valley of Humiliation and Death"),
    ("The Cross and the Crown.", "vol-5-the-cross-and-the-crown", "Book V — The Cross and the Crown"),
]

def main():
    tree = etree.parse("/tmp/pdlib_src/ccel/edersheim_lifetimes.xml",
                       etree.XMLParser(recover=True, huge_tree=True))
    body = next(el for el in tree.getroot().iter() if ln(el.tag) == "body")
    outdir = f"{WS}/edersheim-life-and-times"
    os.makedirs(f"{outdir}/json", exist_ok=True)
    os.makedirs(f"{outdir}/text", exist_ok=True)
    index = []
    for d1 in body:
        if ln(d1.tag) != "div1":
            continue
        t1 = norm(d1.get("title") or "")
        if t1.startswith("APPENDICES"):
            slug, title = "appendices", "Appendices"
        else:
            slug = title = None
            for prefix, s2, t2 in BOOKS:
                if t1.startswith(prefix):
                    slug, title = s2, t2
                    break
            if slug is None:
                continue
        secs = sections_from(d1, strip_notes=False)
        # drop editorial sub-sections
        secs = [(h, tx) for h, tx in secs
                if not re.match(r"(?i)^(title page|preface|contents|list of|index)", h or "")]
        doc = {
            "work": "The Life and Times of Jesus the Messiah",
            "book": title,
            "author": "Alfred Edersheim",
            "source": "Public domain (1883); Christian Classics Ethereal Library digital edition",
            "sections": [{"n": i + 1, "heading": h, "text": tx} for i, (h, tx) in enumerate(secs)],
        }
        with open(f"{outdir}/json/{slug}.json", "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=1)
        txt = [title, "Alfred Edersheim — The Life and Times of Jesus the Messiah", ""]
        for s in doc["sections"]:
            if s["heading"]:
                txt += [s["heading"], ""]
            txt += [s["text"], ""]
        open(f"{outdir}/text/{slug}.txt", "w", encoding="utf-8").write("\n".join(txt))
        chars = sum(len(s["text"]) for s in doc["sections"])
        index.append({"slug": slug, "book": title, "sections": len(doc["sections"]), "characters": chars})
        print(f"  {slug[:52]:54s} {len(doc['sections']):3d} sec {chars:8d} ch")
    with open(f"{outdir}/index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
