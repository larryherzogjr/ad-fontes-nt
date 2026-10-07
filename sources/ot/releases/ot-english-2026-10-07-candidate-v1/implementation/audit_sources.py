"""Offline OT selection audit; writes review evidence, never corpus releases."""
import collections, hashlib, json, re, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
NAMES = 'Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi'.split('|')
CODES = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL'.split()
BYNAME = dict(zip(NAMES, CODES))
BYNAME["Psalm"] = "PSA"
def norm(t): return ' '.join(t.split())
def plain(n): return n if isinstance(n, str) else ''.join(plain(c) for c in n.get('content', []))
def authoritative(ed):
    if ed == 'ylt':
        with zipfile.ZipFile(ROOT/'sources/ylt/raw/engylt_vpl.zip') as z: text = z.read('engylt_vpl.txt').decode('utf-8-sig')
    else: text = (ROOT/f'sources/{ed}/raw/{ed}.txt').read_bytes().decode('cp1252' if ed == 'msb' else 'utf-8-sig')
    rows = {}
    for line in text.splitlines():
        m = re.match(r'^(.+?) (\d+):(\d+)\s+(.*)$', line)
        if not m: continue
        code = {'SOL':'SNG','EZE':'EZK','JOE':'JOL','NAH':'NAM'}.get(m[1], m[1]) if ed == 'ylt' else BYNAME.get(m[1])
        if code not in CODES: continue
        ref = f'{code}.{m[2]}.{m[3]}'
        assert ref not in rows, f'Duplicate {ed} {ref}'
        assert m[4].strip(), ref
        rows[ref] = m[4]
    assert {r.split('.')[0] for r in rows} == set(CODES), (ed, set(CODES)-{r.split('.')[0] for r in rows})
    return rows

def usj(ed):
    path = 'sources/bsb/raw/bsb_usj.zip' if ed == 'bsb' else 'sources/msb/raw/MSB_usj-v5.9.zip'
    rows, special, notes, markers = {}, [], [], collections.Counter()
    with zipfile.ZipFile(ROOT/path) as z:
        for code in CODES:
            filename = f'bsb_usj/{code}.usj' if ed == 'bsb' else f'{code}.usj'
            doc = json.loads(z.read(filename)); chapter = 0; anchor = None
            def walk(n, location, heading=False):
                nonlocal anchor
                if isinstance(n, str):
                    if anchor and not heading: rows[anchor] += n
                    elif n.strip() and not heading: special.append({'book':code,'chapter':chapter,'kind':'unanchored-text','text':n,'source':location})
                    return
                typ = n['type']
                if typ == 'verse':
                    assert re.fullmatch(r'\d+', n['number']), n
                    anchor = f"{code}.{chapter}.{n['number']}"; assert anchor not in rows, anchor; rows[anchor] = ''; return
                if typ == 'note':
                    notes.append({'anchor':anchor,'source':location,'original':n}); return
                assert typ in ['char','ref'], (typ, location)
                for i,c in enumerate(n.get('content', [])): walk(c, f'{location}/content/{i}', heading)
            for i,n in enumerate(doc['content']):
                if n['type'] == 'chapter': chapter = int(n['number']); anchor = None; continue
                if not chapter: continue
                assert n['type'] == 'para', n
                marker = n['marker']; markers[marker] += 1
                heading = marker in ['s1','s2','r','ms','mr','d']
                if heading: special.append({'book':code,'chapter':chapter,'kind':marker,'text':plain(n),'source':f'{filename}#content/{i}'})
                elif anchor: rows[anchor] += '\n'
                for j,c in enumerate(n.get('content', [])): walk(c, f'{filename}#content/{i}/content/{j}', heading)
    return rows, special, notes, dict(sorted(markers.items()))

def usfx():
    with zipfile.ZipFile(ROOT/'sources/ylt/raw/engylt_usfx.zip') as z: root = ET.fromstring(z.read('engylt_usfx.xml'))
    rows, special, notes, markers = {}, [], [], collections.Counter()
    for book in root.findall('book'):
        code = book.attrib['id']
        if code not in CODES: continue
        chapter = 0; anchor = None
        def walk(e, path, heading=False):
            nonlocal chapter, anchor
            tag = e.tag; markers[tag] += 1
            if tag == 'c': chapter = int(e.attrib['id']); anchor = None; return
            if not chapter: return
            if tag == 'v':
                assert re.fullmatch(r'\d+', e.attrib['id']), e.attrib
                anchor = f"{code}.{chapter}.{e.attrib['id']}"; assert anchor not in rows, anchor; rows[anchor] = ''; return
            if tag == 've': return
            if tag == 'f': notes.append({'anchor':anchor,'source':path,'originalXml':ET.tostring(e, encoding='unicode')}); return
            if tag == 'd': special.append({'book':code,'chapter':chapter,'kind':'d','text':''.join(e.itertext()),'source':path}); heading = True
            def text(t):
                if not t: return
                if anchor and not heading: rows[anchor] += t
                elif t.strip() and not heading: special.append({'book':code,'chapter':chapter,'kind':'unanchored-text','text':t,'source':path})
            if tag in ['p','q','b'] and anchor and not heading: rows[anchor] += '\n'
            text(e.text)
            for i,c in enumerate(e): walk(c, f'{path}/{c.tag}[{i}]', heading); text(c.tail)
        for i,e in enumerate(book): walk(e, f'engylt_usfx.xml#book[@id="{code}"]/{e.tag}[{i}]')
    return rows, special, notes, dict(sorted(markers.items()))

def main():
    result = {'scope':'review-only; no release approval', 'artifacts':[], 'editions':{}}
    authorities = {}
    for ed in ['bsb','blb','msb','ylt']:
        manifest = json.loads((ROOT/f'sources/{ed}/m2-manifest.json').read_text())
        for a in manifest['artifacts'] + manifest.get('evidence', []):
            digest = hashlib.sha256((ROOT/a['path']).read_bytes()).hexdigest(); assert digest == a['sha256'], a['path']
            result['artifacts'].append({'path':a['path'],'sha256':digest})
        authority = authoritative(ed); authorities[ed] = authority
        inventory = []
        for name,code in zip(NAMES,CODES):
            chapters = collections.defaultdict(list)
            for ref in authority:
                b,c,v = ref.split('.')
                if b == code: chapters[int(c)].append(int(v))
            assert sorted(chapters) == list(range(1,max(chapters)+1)), code
            maxima = []
            for c in sorted(chapters):
                vs = sorted(chapters[c]); assert vs == list(range(1,max(vs)+1)), (code,c); maxima.append(max(vs))
            inventory.append({'code':code,'name':name,'verses':maxima})
        record = {'inventory':inventory,'authoritativeRows':len(authority)}
        if ed != 'blb':
            rows,special,notes,markers = usfx() if ed == 'ylt' else usj(ed)
            record.update({'structuredRows':len(rows),'missingStructured':sorted(authority.keys()-rows.keys()),'extraStructured':sorted(rows.keys()-authority.keys()),'markers':markers,'specialBlocks':special,'notes':notes,'differences':[]})
            for ref in sorted(authority.keys() & rows.keys()):
                a,b = authority[ref],rows[ref]
                if norm(a) != norm(b): record['differences'].append({'ref':ref,'authoritative':a,'structured':b,'kind':'spacing-only' if re.sub(r'\s','',a)==re.sub(r'\s','',b) else 'wording-or-punctuation'})
        result['editions'][ed.upper()] = record
    assert authorities['bsb'] == authorities['msb']
    assert all(r['inventory'] == result['editions']['BSB']['inventory'] for r in result['editions'].values())
    path = ROOT/'docs/OT-Reference-Reconciliation-2026-10-07.json'
    path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    for ed,r in result['editions'].items(): print(ed, json.dumps({k:len(r[k]) for k in ['differences','missingStructured','extraStructured','notes','specialBlocks'] if k in r}))
if __name__ == '__main__': main()
