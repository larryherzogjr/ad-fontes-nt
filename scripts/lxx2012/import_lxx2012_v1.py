"""Offline, source-numbered LXX2012 adapter. Never assigns canonical anchors."""
from pathlib import Path
import hashlib, json, re, zipfile, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[2]
RELEASE = 'lxx2012-2026-10-09-v1'
RAW = ROOT / 'sources/lxx2012/raw/eng-lxx2012.epub'
PIN = ROOT / 'sources/lxx2012/releases' / RELEASE
NS = {'x':'http://www.w3.org/1999/xhtml', 'o':'http://www.idpf.org/2007/opf'}
EXTRA = {'1ES','TOB','JDT','WIS','SIR','BAR','LJE','S3Y','SUS','BEL','1MA','2MA','3MA','4MA','MAN'}
# Book identity only. Chapter/verse equivalence is deliberately not inferred here.
GREEK = dict(zip('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL 1ES TOB JDT WIS SIR BAR LJE S3Y SUS BEL 1MA 2MA 3MA 4MA MAN'.split(), 'genesis exodus leviticus numbers deuteronomy joshua-vaticanus-b judges ruth 1-samuel 2-samuel 1-kings 2-kings 1-chronicles 2-chronicles 2-esdras 2-esdras esther-greek job-lxx psalms-lxx proverbs ecclesiastes song-of-solomon isaiah jeremiah-lxx lamentations ezekiel daniel-theodotion hosea joel amos obadiah jonah micah nahum habakkuk zephaniah haggai zechariah malachi 1-esdras tobit judith wisdom sirach baruch letter-of-jeremiah daniel-theodotion susanna-theodotion bel-and-the-dragon-theodotion 1-maccabees 2-maccabees 3-maccabees 4-maccabees odes'.split()))
def normalized(s): return re.sub(r'\s+', ' ', s).strip()
def encoded(obj): return (json.dumps(obj, ensure_ascii=False, separators=(',',':'))+'\n').encode()
def sha(data): return hashlib.sha256(data).hexdigest()
def parse_book(data, code):
    root = ET.fromstring(data)
    main = root.find('.//x:div[@class="main"]', NS)
    if main is None: raise ValueError(code)
    title = root.find('.//x:ul[@class="tnav"]/x:li/x:a', NS)
    name = normalized(''.join(title.itertext()))
    notes = {}
    for aside in main.findall('.//x:aside', NS):
        copy = ET.fromstring(ET.tostring(aside))
        for parent in copy.iter():
            for child in list(parent):
                if child.get('class') == 'notebackref': parent.remove(child)
        notes[aside.get('id')] = normalized(''.join(copy.itertext()))
    prefix = re.escape(main.get('id')[:-3])
    chapters = {}; current = None; chapter = None; preface = []
    def text(value, kind='text'):
        if current is not None and value:
            parts = current['parts']
            if parts and parts[-1]['kind']==kind: parts[-1]['text'] += value
            else: parts.append({'kind':kind,'text':value})
    def walk(el, kind='text'):
        nonlocal current, chapter
        cls = el.get('class',''); tag = el.tag.split('}')[-1]
        if tag=='aside' or cls=='footnote': return
        if cls=='psalmlabel':
            chapter = int(re.fullmatch(prefix+r'(\d+)_0',el.get('id')).group(1))
            if chapter in chapters: raise ValueError('Duplicate chapter')
            chapters[chapter]={'chapter':chapter,'headings':[], 'verses':[]}
            current=None; return
        if cls=='verse':
            match=re.fullmatch(prefix+r'(\d+)_(\d+)(?:-(\d+))?',el.get('id',''))
            c,v=int(match[1]),int(match[2]); assert c==chapter and v>0
            current={'verse':v,'endVerse':int(match[3] or v),'label':normalized(''.join(el.itertext())), 'parts':[],'notes':[]}
            assert all(x['verse']!=v for x in chapters[c]['verses'])
            chapters[c]['verses'].append(current); return
        if cls=='noteref':
            assert current is not None
            key=el.get('href','').lstrip('#'); assert key in notes
            current['notes'].append({'id':key,'text':notes[key]}); return
        if cls in {'mt','mt2','d','ip','is','ib'}:
            value=normalized(''.join(el.itertext()))
            if value:
                (chapters[chapter]['headings'] if chapter is not None else preface).append(value)
            return
        if cls=='add': kind='supplied'
        if cls=='it': kind='italic'
        text(el.text,kind)
        for child in el:
            walk(child,kind); text(child.tail,kind)
        if tag in {'div','p','br'}: text(' ',kind)
    walk(main)
    for ch in chapters.values():
        for v in ch['verses']:
            for part in v['parts']: part['text']=re.sub(r'\s+',' ',part['text'])
            if v['parts']:
                v['parts'][0]['text']=v['parts'][0]['text'].lstrip()
                v['parts'][-1]['text']=v['parts'][-1]['text'].rstrip()
            v['text']=''.join(p['text'] for p in v['parts'])
            v['textState'] = 'present' if v['text'] else 'source-empty'
    markers=main.findall('.//x:span[@class="verse"]',NS)
    assert len(markers)==sum(len(c['verses']) for c in chapters.values())
    used={n['id'] for c in chapters.values() for v in c['verses'] for n in v['notes']}
    other_notes=[{'id':k,'text':v} for k,v in notes.items() if k not in used]
    return {'releaseId':RELEASE,'code':code,'name':name,'preface':preface,'otherNotes':other_notes,'chapters':list(chapters.values())}
def outputs():
    result={}; books=[]; search=[]
    with zipfile.ZipFile(RAW) as z:
        opf=ET.fromstring(z.read('OEBPS/content.opf'))
        items={i.get('id'):i.get('href') for i in opf.findall('o:manifest/o:item',NS)}
        for item in opf.findall('o:spine/o:itemref',NS):
            file=items[item.get('idref')]; code=file.removesuffix('.xhtml')
            if code not in GREEK: continue
            book=parse_book(z.read('OEBPS/'+file),code)
            result[f'books/{code}.json']=encoded(book)
            books.append({'code':code,'name':book['name'],'apocrypha':code in EXTRA,'greekBook':GREEK[code], 'chapters':[c['chapter'] for c in book['chapters']], 'verses':sum(len(c['verses']) for c in book['chapters'])})
            search.extend({'book':code,'chapter':c['chapter'],'verse':v['verse'],'text':v['text']} for c in book['chapters'] for v in c['verses'])
        assert len(books)==54 and len({b['code'] for b in books})==54
        notice=ET.fromstring(z.read('OEBPS/copyright.xhtml'))
        body=notice.find('x:body',NS)
        result['notice.json']=encoded({'releaseId':RELEASE,'text':normalized(' '.join(body.itertext()))})
    result['manifest.json']=encoded({'releaseId':RELEASE,'editionId':'LXX2012','name':'LXX2012 · English Septuagint','books':books,'verseCount':len(search),'sourceSha256':sha(RAW.read_bytes()),'numbering':'Source edition; not canonical English numbering.'})
    result['search.json']=encoded({'releaseId':RELEASE,'verses':search})
    return result

def main():
    pin=json.loads((PIN/'checksums.json').read_text())
    assert sha(RAW.read_bytes())==pin['sourceSha256'], 'Source changed'
    assert sha(Path(__file__).read_bytes())==pin['importerSha256'], 'Importer changed; needs a new reviewed release'
    files=outputs()
    assert {p:sha(data) for p,data in files.items()}==pin['files'], 'Output changed'
    public=ROOT/'app/public/corpus'/RELEASE
    for name,data in files.items():
        dest=public/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
    print(f'{RELEASE}: {len(files)} verified files')
if __name__=='__main__': main()
