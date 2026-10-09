import hashlib,json,re,sys,unittest,zipfile,xml.etree.ElementTree as E
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from scripts.lxx2012.import_lxx2012 import outputs,RAW,RELEASE,PIN,sha
NS={'x':'http://www.w3.org/1999/xhtml'}
class EnglishSeptuagint(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.files=outputs();cls.manifest=json.loads(cls.files['manifest.json']);cls.books={b['code']:json.loads(cls.files[f"books/{b['code']}.json"]) for b in cls.manifest['books']}
 def test_pinned_reproduction(self):
  pin=json.loads((PIN/'checksums.json').read_text());self.assertEqual(pin['sourceSha256'],sha(RAW.read_bytes()));self.assertEqual(pin['files'],{p:sha(d) for p,d in self.files.items()})
 def test_every_source_marker_and_note_survives(self):
  with zipfile.ZipFile(RAW) as z:
   for code,b in self.books.items():
    root=E.fromstring(z.read(f'OEBPS/{code}.xhtml'))
    expected=[re.sub(r'\s+',' ',''.join(e.itertext())).strip() for e in root.findall('.//x:span[@class="verse"]',NS)]
    actual=[v['label'] for c in b['chapters'] for v in c['verses']]
    self.assertEqual(expected,actual,code)
    self.assertEqual(len(root.findall('.//x:aside',NS)),len(b['otherNotes'])+sum(len(c['headingNotes']) for c in b['chapters'])+sum(len(v['notes']) for c in b['chapters'] for v in c['verses']),code)
    for c in b['chapters']:
     for v in c['verses']:
      self.assertEqual(v['text'],''.join(p['text'] for p in v['parts']))
      self.assertNotIn('anchors',v)
 def test_full_inventory_and_no_duplicate_esther_additions(self):
  self.assertEqual(len(self.books),54);self.assertEqual(self.manifest['verseCount'],28326)
  self.assertEqual(sum(b['apocrypha'] for b in self.manifest['books']),15)
  self.assertNotIn('ESG',self.books);self.assertNotIn('PS2',self.books)
  self.assertEqual(len(self.books['PSA']['chapters']),151)
  self.assertTrue(self.books['PSA']['chapters'][150]['headingNotes'])
  self.assertNotIn('*',self.books['PSA']['chapters'][150]['headings'][0])
  self.assertIn('Mardochaeus',self.books['EST']['chapters'][0]['verses'][0]['text'])
  self.assertIn('my grandfather Jesus',self.books['SIR']['preface'][1])
 def test_independent_handoff_apocrypha_transcription(self):
  expected=json.loads((PIN/'handoff-text-checksums.json').read_text())
  for code,digest in expected.items():
   b=self.books['PSA' if code=='PS2' else code]
   rows=[[str(c['chapter']),str(v['verse']),v['text']] for c in b['chapters'] if code!='PS2' or c['chapter']==151 for v in c['verses']]
   actual=hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
   self.assertEqual(digest,actual,code)
 def test_joined_labels_empty_labels_and_supplied_words(self):
  gen=self.books['GEN']['chapters'][36]['verses'][0]
  self.assertEqual((gen['verse'],gen['endVerse'],gen['label']),(1,2,'1-2'))
  self.assertEqual(self.books['1KI']['chapters'][6]['verses'][0]['textState'],'source-empty')
  dan=self.books['DAN']['chapters'][0]['verses'][4]
  self.assertIn('gave orders',[p['text'].strip() for p in dan['parts'] if p['kind']=='supplied'])
 def test_search_is_scripture_only(self):
  rows=json.loads(self.files['search.json'])['verses'];self.assertEqual(len(rows),28326)
  self.assertEqual(rows[0]['text'],'In the beginning God made the heaven and the earth.')
  self.assertTrue(any(r['book']=='MAN' for r in rows));self.assertFalse(any(r['book']=='ESG' for r in rows))
if __name__=='__main__':unittest.main()
