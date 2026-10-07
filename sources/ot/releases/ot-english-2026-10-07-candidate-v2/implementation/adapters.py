"""Candidate-only OT adapters. TXT wording and original structure stay distinct."""
import copy, difflib, json, re, zipfile
import xml.etree.ElementTree as ET
from audit_sources import ROOT, CODES, NAMES, authoritative, norm, plain

HEADINGS = {'s1','s2','r','ms','mr','qa'}
ALLOWED = HEADINGS | {'d','p','b','q1','q2','qr','li1','li2','pc','pmo','lf'}

def align(original, target, runs):
    """Distribute authority onto source text runs, preserving original run bytes."""
    owners = [i for i,r in enumerate(runs) for _ in r['text']]
    assert original == ''.join(r['text'] for r in runs)
    assert owners, 'No structured text owner for nonempty authority'
    aligned = [''] * len(runs)
    for tag,a,b,c,d in difflib.SequenceMatcher(None, original, target, autojunk=False).get_opcodes():
        if tag == 'equal':
            for offset,char in enumerate(target[c:d]): aligned[owners[a+offset]] += char
        elif tag in ['insert','replace']: aligned[owners[min(a,len(owners)-1)]] += target[c:d]
    for run,t in zip(runs,aligned): run['originalText'] = run['text']; run['text'] = t
    assert ''.join(r['text'] for r in runs) == target

class Builder:
    def __init__(self, code):
        self.code=code; self.chapters=[]; self.current=None; self.anchor=None; self.block=None; self.segments={}
    def chapter(self, c):
        assert c == len(self.chapters)+1
        self.current={'book':self.code,'chapter':c,'blocks':[],'segments':[],'notes':[],'coverage':[]}
        self.chapters.append(self.current); self.anchor=None; self.block=None
    def paragraph(self, marker, role, path):
        self.block={'marker':marker,'role':role,'sourceId':path,'runs':[]}; self.current['blocks'].append(self.block)
        if role in ['scripture','scripture-title'] and self.anchor and marker != 'verse':
            self.block['runs'].append({'text':'\n','anchor':self.anchor,'marks':[],'layoutSeparator':True})
    def verse(self, v, path):
        assert str(v).isdigit()
        a=f"{self.code}.{self.current['chapter']}.{v}"; assert a not in self.segments
        self.anchor=a; s={'id':a,'sourceRef':a,'sourceId':path,'sourceLabel':str(v),'anchors':[a],'mappingType':'exact','text':''}
        self.segments[a]=s; self.current['segments'].append(s); self.block['runs'].append({'verse':str(v),'anchor':a})
    def text(self,t,marks=None):
        if not t: return
        istext=self.block['role'] in ['scripture','scripture-title']
        assert not (istext and t.strip() and self.anchor is None), (self.code,t)
        self.block['runs'].append({'text':t,'anchor':self.anchor if istext else None,'marks':marks or []})
    def note(self, original, path):
        assert self.anchor and self.block['role'] in ['scripture','scripture-title']
        notes=self.current['notes']; nid=f'{self.anchor}.note.{len(notes)+1}'
        n={'id':nid,'anchor':self.anchor,'type':'publisher-note','sourceId':path,'body':plain(original),'original':copy.deepcopy(original)}
        refs=[]
        def visit(x):
            if isinstance(x,dict):
                if x.get('marker')=='fr': refs.append(plain(x).strip())
                for c in x.get('content',[]): visit(c)
        visit(original); n['originalReferences']=refs
        notes.append(n); self.block['runs'].append({'noteId':nid,'anchor':self.anchor})
    def finish(self,authority):
        differences=[]
        for ch in self.chapters:
            for s in ch['segments']:
                runs=[r for b in ch['blocks'] for r in b['runs'] if r.get('anchor')==s['id'] and 'text' in r]
                # Block separation is layout, not source text; retained in block sequence.
                original=''.join(r['text'] for r in runs); target=authority[s['id']]
                s['originalStructuredText']=original
                if original != target:
                    differences.append({'ref':s['id'],'structured':original,'authoritative':target,
                                        'kind':'layout-whitespace' if re.sub(r'\s','',original)==re.sub(r'\s','',target) else 'source-discrepancy'})
                align(original,target,runs); s['text']=target
                s['textSourceId']=s['id']+'@official-TXT'  # caller replaces with exact source line/path
            for n in ch['notes']:
                offset=0; found=False
                for b in ch['blocks']:
                    for r in b['runs']:
                        if r.get('noteId')==n['id']: found=True; break
                        if r.get('anchor')==n['anchor']: offset+=len(r.get('text',''))
                    if found: break
                assert found; n['textOffset']=offset
                assert offset<=len(self.segments[n['anchor']]['text'])
            for s in ch['segments']:
                ch['coverage'].append({'anchor':s['id'],'dataState':'available','textState':'present','publisherNoteIds':[n['id'] for n in ch['notes'] if n['anchor']==s['id']]})
        assert set(self.segments)=={r for r in authority if r.startswith(self.code+'.')}
        return self.chapters,differences

def source_lines(ed):
    if ed=='ylt':
        with zipfile.ZipFile(ROOT/'sources/ylt/raw/engylt_vpl.zip') as z: lines=z.read('engylt_vpl.txt').decode('utf-8-sig').splitlines()
        prefix='sources/ylt/raw/engylt_vpl.zip!engylt_vpl.txt'
    else:
        lines=(ROOT/f'sources/{ed}/raw/{ed}.txt').read_bytes().decode('cp1252' if ed=='msb' else 'utf-8-sig').splitlines(); prefix=f'sources/{ed}/raw/{ed}.txt'
    from audit_sources import BYNAME
    result={}
    for i,line in enumerate(lines,1):
        m=re.match(r'^(.+?) (\d+):(\d+)\s+(.*)$',line)
        if not m: continue
        code={'SOL':'SNG','EZE':'EZK','JOE':'JOL','NAH':'NAM'}.get(m[1],m[1]) if ed=='ylt' else BYNAME.get(m[1])
        if code in CODES: result[f'{code}.{m[2]}.{m[3]}']=f'{prefix}#line={i}'
    return result

def berean(ed):
    authority=authoritative(ed); chapters=[]; differences=[]; roles=[]
    filename='sources/bsb/raw/bsb_usj.zip' if ed=='bsb' else 'sources/msb/raw/MSB_usj-v5.9.zip'
    with zipfile.ZipFile(ROOT/filename) as z:
        for code in CODES:
            member=f'bsb_usj/{code}.usj' if ed=='bsb' else f'{code}.usj'
            doc=json.loads(z.read(member)); b=Builder(code)
            def visit(n,path,marks=None):
                if isinstance(n,str): b.text(n,marks); return
                typ=n['type']
                if typ=='verse': b.verse(n['number'],path); return
                if typ=='note': b.note(n,path); return
                assert typ in ['char','ref'], (typ,path)
                for i,c in enumerate(n.get('content',[])): visit(c,f'{path}/content/{i}',(marks or [])+[n.get('marker',typ)])
            for i,n in enumerate(doc['content']):
                if n['type']=='chapter': b.chapter(int(n['number'])); continue
                if b.current is None: continue
                assert n['type']=='para'; marker=n['marker']; assert marker in ALLOWED,marker
                path=f'{filename}!{member}#content/{i}'
                role='publisher-heading' if marker in HEADINGS else 'scripture'
                if marker=='d' or (marker=='mr' and code=='HAB'):
                    hasverse=any(isinstance(c,dict) and c.get('type')=='verse' for c in n['content'])
                    if hasverse: role='scripture-title'
                    elif code=='HAB' and b.current['chapter']==3 and b.anchor=='HAB.3.19':
                        assert norm(authority[b.anchor]).endswith(norm(plain(n))); role='scripture-title'
                    else:
                        assert code=='PSA' and norm(plain(n)) in ['Psalms 1–41','Psalms 42–72','Psalms 73–89','Psalms 90–106','Psalms 107–150'],(ed,path,plain(n))
                        role='publisher-heading'
                if marker in ['d','qa','mr']:
                    roles.append({'sourceId':path,'marker':marker,'role':role,'text':plain(n),'chapter':b.current['chapter'],'book':code})
                b.paragraph(marker,role,path)
                for j,c in enumerate(n.get('content',[])): visit(c,f'{path}/content/{j}')
            cs,ds=b.finish(authority); chapters+=cs; differences+=ds
    return chapters,differences,roles

def literal(ed):
    authority=authoritative(ed); chapters=[]
    if ed=='blb':
        for code in CODES:
            b=Builder(code)
            for ref,t in authority.items():
                book,c,v=ref.split('.')
                if book!=code: continue
                c=int(c)
                if not b.current or b.current['chapter']!=c: b.chapter(c)
                b.paragraph('verse','scripture',ref); b.verse(v,ref); b.text(t)
            cs,ds=b.finish(authority); assert not ds; chapters+=cs
    else:
        with zipfile.ZipFile(ROOT/'sources/ylt/raw/engylt_usfx.zip') as z: root=ET.fromstring(z.read('engylt_usfx.xml'))
        for book in root.findall('book'):
            code=book.attrib['id']
            if code not in CODES: continue
            b=Builder(code)
            def visit(e,path):
                tag=e.tag
                if tag=='c': b.chapter(int(e.attrib['id'])); return
                if b.current is None: return
                if tag=='v': b.verse(e.attrib['id'],path); return
                if tag=='ve': return
                assert tag=='p', (code,tag)
                b.paragraph(e.attrib.get('style','p'),'scripture',path); b.text(e.text)
                for j,c in enumerate(e): visit(c,f'{path}/{c.tag}[{j}]'); b.text(c.tail)
            for i,e in enumerate(book): visit(e,f'sources/ylt/raw/engylt_usfx.zip!engylt_usfx.xml#book[@id="{code}"]/{e.tag}[{i}]')
            cs,ds=b.finish(authority); assert all(d['kind']=='layout-whitespace' for d in ds); chapters+=cs
    return chapters,[],[]

def build(ed):
    cs,ds,roles=berean(ed) if ed in ['bsb','msb'] else literal(ed)
    lines=source_lines(ed)
    for ch in cs:
        for s in ch['segments']: s['textSourceId']=lines[s['id']]
    return cs,ds,roles
