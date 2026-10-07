"""Independent whole-OT text, structural-role and provenance verification."""
import hashlib, json, re, sys, tempfile, unittest, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/ot/ot-english-2026-10-07-candidate-v3'
PINS=ROOT/'sources/ot/releases/ot-english-2026-10-07-candidate-v3'
sys.path.insert(0,str(ROOT/'scripts/ot'))
from adapters import align
from prepare_candidates import pin, explain

class OtFidelity(unittest.TestCase):
    def load(self,ed,book,chapter):
        return json.loads((OUT/f'{ed}-ot-2026-10-07-candidate-v3'/book/f'{chapter}.json').read_text())
    def test_all_authoritative_rows_and_run_text(self):
        registry=json.loads((PINS/'ot-registry.json').read_text()); names={b['name']:b['code'] for b in registry};names['Psalm']='PSA'
        for ed in ['bsb','blb','msb','ylt']:
            if ed=='ylt':
                with zipfile.ZipFile(ROOT/'sources/ylt/raw/engylt_vpl.zip') as z: text=z.read('engylt_vpl.txt').decode('utf-8-sig')
            else: text=(ROOT/f'sources/{ed}/raw/{ed}.txt').read_bytes().decode('cp1252' if ed=='msb' else 'utf-8-sig')
            rows={}
            for line in text.splitlines():
                m=re.match(r'^(.+?) (\d+):(\d+)\s+(.*)$',line)
                if not m:continue
                code={'SOL':'SNG','EZE':'EZK','JOE':'JOL','NAH':'NAM'}.get(m[1],m[1]) if ed=='ylt' else names.get(m[1])
                if code not in names.values():continue
                ref=f'{code}.{m[2]}.{m[3]}';self.assertNotIn(ref,rows);rows[ref]=m[4]
            rawRows=rows.copy()
            if ed=='blb':
                for change in json.loads((PINS/'blb-source-transforms.json').read_text()):
                    self.assertEqual(rows[change['ref']],change['original'])
                    rows[change['ref']]=change['display']
            actual={}
            for p in (OUT/f'{ed}-ot-2026-10-07-candidate-v3').glob('*/*.json'):
                ch=json.loads(p.read_text())
                for s in ch['segments']:
                    self.assertNotIn(s['id'],actual);actual[s['id']]=s['text']
                    if ed=='blb' and rows[s['id']]!=rawRows[s['id']]:self.assertEqual(s['sourceOriginalText'],rawRows[s['id']])
                    runs=[r for b in ch['blocks'] for r in b['runs'] if r.get('anchor')==s['id'] and 'text' in r]
                    self.assertEqual(''.join(r['text'] for r in runs),s['text'])
                self.assertEqual({c['anchor'] for c in ch['coverage']},{s['id'] for s in ch['segments']})
            self.assertEqual(actual,rows,ed);self.assertEqual(len(actual),23145)
    def test_psalm_titles_acrostics_and_habakkuk_instruction(self):
        for ed in ['bsb','msb']:
            ch=self.load(ed,'PSA',3);titles=[b for b in ch['blocks'] if b['role']=='scripture-title']
            self.assertEqual(len(titles),1);self.assertIn('fled from his son Absalom',''.join(r.get('text','') for r in titles[0]['runs']))
            self.assertTrue(ch['segments'][0]['text'].startswith('A Psalm of David,'))
            ch=self.load(ed,'PSA',1);ranges=[b for b in ch['blocks'] if b['marker']=='d'];self.assertEqual(ranges[0]['role'],'publisher-heading')
            self.assertNotIn('Psalms 1–41',ch['segments'][0]['text'])
            ch=self.load(ed,'PSA',119);acrostics=[b for b in ch['blocks'] if b['marker']=='qa']
            self.assertEqual(len(acrostics),44);self.assertTrue(all(b['role']=='publisher-heading' for b in acrostics))
            self.assertTrue(all(r.get('anchor') is None for b in acrostics for r in b['runs']))
            self.assertNotIn('BETH',ch['segments'][7]['text'])
            ch=self.load(ed,'HAB',3);self.assertTrue(ch['segments'][-1]['text'].endswith('For the choirmaster. With stringed instruments.'))
            self.assertEqual(ch['blocks'][-1]['role'],'scripture-title')
            self.assertTrue(all(int(s['sourceLabel'])>0 for s in ch['segments']))
    def test_blb_exporter_markup_is_reviewed_without_losing_words_or_brackets(self):
        changes=json.loads((PINS/'blb-source-transforms.json').read_text());self.assertEqual(len(changes),119)
        for d in changes:
            self.assertNotIn('<',d['display']);self.assertNotIn('>',d['display'])
            self.assertEqual(d['original'].count('['),d['display'].count('['))
            self.assertEqual(d['original'].count(']'),d['display'].count(']'))
        ch=self.load('blb','PSA',3);self.assertEqual(ch['blocks'][0]['role'],'scripture-title')
        self.assertIn('O YHWH',ch['segments'][0]['text'])

    def test_original_notes_and_offsets(self):
        for ed,filename,prefix in [('bsb','sources/bsb/raw/bsb_usj.zip','bsb_usj/'),('msb','sources/msb/raw/MSB_usj-v5.9.zip','')]:
            count=0
            with zipfile.ZipFile(ROOT/filename) as z:
                for p in (OUT/f'{ed}-ot-2026-10-07-candidate-v3').glob('*/*.json'):
                    ch=json.loads(p.read_text());book=ch['book'];original=json.loads(z.read(prefix+book+'.usj'))
                    for note in ch['notes']:
                        count+=1; pointer=note['sourceId'].split('#',1)[1].split('/'); node=original
                        for part in pointer:node=node[int(part)] if part.isdigit() else node[part]
                        self.assertEqual(node,note['original'])
                        for ref in note['originalReferences']:
                            m=re.match(r'^(\d+):(\d+)',ref);self.assertIsNotNone(m)
                            self.assertEqual([m[1],m[2]],note['anchor'].split('.')[1:])
                        offset=0;found=False
                        for block in ch['blocks']:
                            for run in block['runs']:
                                if run.get('noteId')==note['id']:found=True;break
                                if run.get('anchor')==note['anchor']:offset+=len(run.get('text',''))
                            if found:break
                        self.assertTrue(found);self.assertEqual(offset,note['textOffset'])
                        s=next(s for s in ch['segments'] if s['id']==note['anchor']);self.assertLessEqual(offset,len(s['text']))
            self.assertEqual(count,3542)
    def test_candidates_are_pinned_and_nt_registry_preserved(self):
        implementation=json.loads((PINS/'implementation-checksums.json').read_text())
        for path,digest in implementation.items():self.assertEqual(hashlib.sha256((ROOT/path).read_bytes()).hexdigest(),digest,path)
        checks=json.loads((PINS/'output-checksums.json').read_text())
        self.assertEqual(set(checks),{str(p.relative_to(OUT)) for p in OUT.rglob('*.json')})
        for path,digest in checks.items():self.assertEqual(hashlib.sha256((OUT/path).read_bytes()).hexdigest(),digest,path)
        nt=json.loads((ROOT/'app/lib/domain/canonical-registry.json').read_text());union=json.loads((PINS/'whole-bible-registry.json').read_text())
        self.assertEqual([{**b,'order':b['order']+39} for b in nt],union[39:]);self.assertEqual(len(union),66)
        for ed in ['bsb','blb','msb','ylt']:
            m=json.loads((PINS/f'{ed}-manifest.json').read_text());self.assertIn('not public',m['status']);self.assertTrue(m['ntGroupNotApplicableToOt'])
            self.assertFalse((ROOT/'app/public/corpus'/m['releaseId']).exists())
    def test_review_gates_reject_unknown_changes_and_pin_replacement(self):
        with self.assertRaises(AssertionError):explain({'ref':'GEN.1.1','structured':'different wording','authoritative':'original wording'})
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)/'pin.json';pin(p,{'approved':'original'},True)
            with self.assertRaises(AssertionError):pin(p,{'approved':'replacement'},True)
            self.assertEqual(json.loads(p.read_text()),{'approved':'original'})

    def test_alignment_rejects_no_owner_and_preserves_runs(self):
        with self.assertRaises(AssertionError):align('','new',[])
        runs=[{'text':'A title.'},{'text':' body[’’]'}];align('A title. body[’’]','A title. body',runs)
        self.assertEqual([r['originalText'] for r in runs],['A title.',' body[’’]'])
        self.assertEqual(''.join(r['text'] for r in runs),'A title. body')

if __name__=='__main__':unittest.main()
