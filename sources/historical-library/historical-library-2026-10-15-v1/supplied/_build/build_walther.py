#!/usr/bin/env python3
"""Build C. F. W. Walther, 'The Proper Distinction Between Law and Gospel'
(Thirty-Nine Evening Lectures, trans. W. H. T. Dau, Concordia Publishing House,
St. Louis, 1929) from archive.org OCR.

Public-domain basis: published 1929 with copyright notice; US term of 95 years
from publication expired at the end of 2024.

Structure: front matter (Preface and Introduction) + 39 lectures. Each lecture
begins at the FIRST occurrence of its ordinal heading ('FIRST EVENING
LECTURE.' ... 'THIRTY-NINTH EVENING LECTURE.'); later occurrences are running
heads and are dropped from the body text.
"""
import json, os, re

SRC = '/tmp/pdlib_src/ia/walther.txt'
OUT = '/Users/lherzog/Documents/kimi/tasks/2026-10-09/07-25-13-9358ceac/ad-fontes-pd-library/walther-law-and-gospel'

ORDS = ['FIRST','SECOND','THIRD','FOURTH','FIFTH','SIXTH','SEVENTH','EIGHTH','NINTH','TENTH',
 'ELEVENTH','TWELFTH','THIRTEENTH','FOURTEENTH','FIFTEENTH','SIXTEENTH','SEVENTEENTH','EIGHTEENTH','NINETEENTH','TWENTIETH',
 'TWENTY-FIRST','TWENTY-SECOND','TWENTY-THIRD','TWENTY-FOURTH','TWENTY-FIFTH','TWENTY-SIXTH','TWENTY-SEVENTH','TWENTY-EIGHTH','TWENTY-NINTH','THIRTIETH',
 'THIRTY-FIRST','THIRTY-SECOND','THIRTY-THIRD','THIRTY-FOURTH','THIRTY-FIFTH','THIRTY-SIXTH','THIRTY-SEVENTH','THIRTY-EIGHTH','THIRTY-NINTH']

HEAD = re.compile(r'^\s*(?:' + '|'.join(ORDS) + r')\s+EVENING\s+LECTURE\.?\s*$')
PAGE_ONLY = re.compile(r'^\s*[0-9]{1,4}\s*$')
INDEX_START = re.compile(r'^\s*INDEXES\.?\s*$')

def clean(lines):
    out = []
    for l in lines:
        s = l.rstrip()
        if not s.strip():
            if out and out[-1] != '':
                out.append('')
            continue
        if HEAD.match(s) or PAGE_ONLY.match(s):
            continue
        out.append(s)
    text, buf = [], ''
    for s in out:
        if s == '':
            if buf:
                text.append(buf)
                buf = ''
            continue
        if buf:
            buf = (buf[:-1] + s.strip()) if buf.endswith('-') else (buf + ' ' + s.strip())
        else:
            buf = s.strip()
    if buf:
        text.append(buf)
    return '\n\n'.join(text).strip()

def main():
    os.makedirs(f'{OUT}/json', exist_ok=True)
    os.makedirs(f'{OUT}/text', exist_ok=True)
    lines = open(SRC).read().split('\n')
    idx_line = next((i for i, l in enumerate(lines) if INDEX_START.match(l)), len(lines))
    lines = lines[:idx_line]
    firsts = []
    for o in ORDS:
        pat = re.compile(r'^\s*' + o + r'\s+EVENING\s+LECTURE')
        hits = [i for i, l in enumerate(lines) if pat.match(l)]
        firsts.append(hits[0])
    assert all(firsts[i] < firsts[i + 1] for i in range(len(firsts) - 1)), 'lecture headings out of order'
    front = clean(lines[:firsts[0]])
    sections = []
    for k, o in enumerate(ORDS):
        lo = firsts[k]
        hi = firsts[k + 1] if k + 1 < len(ORDS) else len(lines)
        sections.append({'n': k + 1, 'heading': f'{o.title()} Evening Lecture', 'text': clean(lines[lo + 1:hi])})
    doc = {'code': 'WALTH-LG', 'author': 'C. F. W. Walther',
           'work': 'The Proper Distinction Between Law and Gospel (Thirty-Nine Evening Lectures, trans. W. H. T. Dau, 1929; public domain)',
           'front_matter': front,
           'sections': sections}
    with open(f'{OUT}/json/walther-law-and-gospel.json', 'w') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
    with open(f'{OUT}/text/walther-law-and-gospel.txt', 'w') as f:
        f.write(doc['work'] + '\n\n=== Preface and Introduction ===\n\n' + front + '\n\n')
        for s in sections:
            f.write(f"=== {s['heading']} ===\n\n{s['text']}\n\n")
    with open(f'{OUT}/index.json', 'w') as f:
        json.dump({'resource': 'Walther, The Proper Distinction Between Law and Gospel',
                   'source': 'Internet Archive OCR of the 1929 Dau translation (Concordia Publishing House); US copyright expired end of 2024',
                   'schema': 'json/walther-law-and-gospel.json -> {code, author, work, front_matter, sections: [{n, heading, text}]}',
                   'lectures': len(sections),
                   'lecture_chars': [len(s['text']) for s in sections],
                   'front_matter_chars': len(front)}, f, indent=1)
    print(f"front: {len(front)} chars; lectures: {len(sections)}")
    for s in sections:
        print(f"  {s['n']:2d} {len(s['text']):7d} {s['heading']}")

if __name__ == '__main__':
    main()
