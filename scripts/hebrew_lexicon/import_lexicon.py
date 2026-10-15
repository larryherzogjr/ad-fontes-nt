"""Pinned offline dictionary projection; never changes WLC text or analysis."""
from pathlib import Path
import argparse, collections, hashlib, json, re, zipfile
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'sources/hebrew-lexicon'
RAW = BASE/'raw'
RELEASE = 'hebrew-lexicon-2026-10-14-v1'
PIN = BASE/'releases'/RELEASE
NS = {'o': 'http://openscriptures.github.com/morphhb/namespace'}
LANG = '{http://www.w3.org/XML/1998/namespace}lang'
ORIGINAL_INDEX = ROOT/'app/public/corpus/original-languages-2026-10-09-v1/hebrew-index.json'
def enc(value): return (json.dumps(value, ensure_ascii=False, separators=(',', ':'))+'\n').encode()
def sha(data): return hashlib.sha256(data).hexdigest()
def plain(e): return re.sub(r'\s+', ' ', ''.join(e.itertext())).strip() if e is not None else ''
def text(e):
    """Keep sense labels and text/cross-references; omit transcription workflow status."""
    if e.tag.split('}')[-1] in ('status', 'page'): return ''
    result = e.text or ''
    if e.tag.split('}')[-1] == 'sense': result = '\n'+(e.get('n', '')+' ' if e.get('n') else '')+result
    for child in e:
        result += text(child)+(child.tail or '')
    return result

def outputs():
    out = {}
    def put(path, value): out[path] = enc({'releaseId': RELEASE, **value})
    with zipfile.ZipFile(RAW/'HebrewLexicon.zip') as z:
        def xml(name): return ET.fromstring(z.read('HebrewLexicon-master/'+name+'.xml'))
        strong = {}
        for e in xml('HebrewStrong').findall('o:entry', NS):
            w = e.find('o:w', NS)
            strong[e.get('id')] = {'id': e.get('id'), 'headword': plain(w), 'language': w.get(LANG), 'transliteration': w.get('xlit', ''), 'pronunciation': w.get('pron', ''), 'derivation': plain(e.find('o:source', NS)), 'definition': plain(e.find('o:meaning', NS)), 'usage': plain(e.find('o:usage', NS)), 'notes': [plain(n) for n in e.findall('.//o:note', NS)]}
        bdb = {}
        for e in xml('BrownDriverBriggs').findall('.//o:entry', NS):
            content = text(e)
            paragraphs = [re.sub(r'\s+', ' ', p).strip() for p in content.split('\n') if p.strip()]
            bdb[e.get('id')] = {'id': e.get('id'), 'headwords': [plain(w) for w in e.findall('o:w', NS)], 'paragraphs': paragraphs}
        lexical = {}
        for part in xml('LexicalIndex'):
            for e in part.findall('o:entry', NS):
                w = e.find('o:w', NS); x = e.find('o:xref', NS)
                lexical[e.get('id')] = {'id': e.get('id'), 'headword': plain(w), 'transliteration': w.get('xlit', ''), 'language': part.get(LANG), 'gloss': plain(e.find('o:def', NS)), 'bdb': x.get('bdb', ''), 'strong': 'H'+x.get('strong') if x.get('strong') else ''}
        aug = {e.get('aug'): plain(e) for e in xml('AugIndex')}
        assert len(strong) == 8674 and len(bdb) == 11845 and len(lexical) == 10221
        assert all(v in lexical for v in aug.values())
        assert all(not l['bdb'] or l['bdb'] in bdb for l in lexical.values())
        index = json.loads(ORIGINAL_INDEX.read_text())
        rows = []; unresolved = []
        for item in index['lemmas']:
            key = item['key']; language = 'heb' if key[0] == 'H' else 'arc'
            sid = 'H'+re.match(r'[HA](\d+)', key).group(1)
            s = strong.get(sid)
            if s and s['language'] != language: s = None
            l = lexical.get(aug.get(key[1:]))
            reason = ''
            if l is None: reason = 'No exact augmented-key mapping in the supplied lexical index.'
            elif l['language'] != language:
                reason = 'The lexical index language conflicts with the OSHB token language.'; l = None
            if reason: unresolved.append({'key': key, 'reason': reason})
            # No bare-number fallback for BDB, no default homograph, no surface-form guessing.
            row = {'key': key, 'strong': s['id'] if s else None, 'lexical': l['id'] if l else None, 'bdb': l['bdb'] if l and l['bdb'] else None, 'headword': l['headword'] if l else s['headword'] if s else '', 'transliteration': l['transliteration'] if l else s['transliteration'] if s else '', 'gloss': l['gloss'] if l else s['definition'] if s else '', 'language': language, 'mappingNote': reason}
            rows.append(row)
        for sid, value in strong.items(): put('strongs/'+sid+'.json', value)
        for bid, value in bdb.items(): put('bdb/'+bid+'.json', value)
        put('index.json', {'entries': rows})
        put('reviewed-differences.json', {'strongs': len(strong), 'bdb': len(bdb), 'lexical': len(lexical), 'sourceKeys': len(rows), 'unresolvedBdb': unresolved, 'decisions': ['Derived from retained upstream XML, not handoff flattened JSON or form index.', 'AugIndex exact key plus language match required for BDB; Strong’s base-number entry explicitly retains broader scope.', 'BDB is an abridged, unfinished transcription. Source sense labels retained; workflow status/page markers omitted.', 'No Scripture, morphology, occurrence counts or canonical mappings changed. No contextual English translation or English word alignment inferred.']})
        out['SOURCE-README.md'] = z.read('HebrewLexicon-master/readme.md')
        out['SOURCE-APP-README.md'] = z.read('HebrewLexicon-master/HomeFiles/readme.md')
    out['NOTICE.txt'] = ('Historical dictionary text: Strong’s Hebrew Dictionary (1890) and Brown–Driver–Briggs (1906), public domain. Electronic source: Open Scriptures Hebrew Bible Project, https://github.com/openscriptures/HebrewLexicon . Supplied XML, lexical mappings and corrections: Creative Commons Attribution 4.0, https://creativecommons.org/licenses/by/4.0/ . Ad Fontes derives JSON, source-key lookup and display from the supplied snapshot. BDB is an abridged transcription, still in progress. No endorsement is implied. Dictionary definitions describe possible meanings, not an automatic translation of a word in context. TWOT numbers in the source are references only; no TWOT prose is included.\n').encode()
    return out

def main():
    p = argparse.ArgumentParser(); p.add_argument('--freeze-new', action='store_true'); args = p.parse_args()
    inputs = {'files': {str(f.relative_to(RAW)): sha(f.read_bytes()) for f in sorted(RAW.iterdir()) if f.is_file()}, 'importer': sha(Path(__file__).read_bytes()), 'sourceIndex': sha(ORIGINAL_INDEX.read_bytes())}
    if not args.freeze_new:
        assert json.loads((PIN/'inputs.json').read_text()) == inputs, 'Source/importer drift requires a reviewed successor release'
    result = outputs(); hashes = {n: sha(b) for n,b in sorted(result.items())}
    if args.freeze_new:
        assert not PIN.exists(), 'Never replace existing release pins'
        PIN.mkdir(parents=True); (PIN/'inputs.json').write_bytes(enc(inputs)); (PIN/'outputs.json').write_bytes(enc(hashes)); (PIN/'reviewed-differences.json').write_bytes(result['reviewed-differences.json'])
    else: assert json.loads((PIN/'outputs.json').read_text()) == hashes, 'Dictionary output drift'
    target = ROOT/'app/public/lexical'/RELEASE
    for name, data in result.items():
        dest = target/name; dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
    print(f'{RELEASE}: {len(result)} verified files')
if __name__ == '__main__': main()
