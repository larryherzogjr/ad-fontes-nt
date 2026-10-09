import unittest,sys,json,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from scripts.original_languages.import_originals import outputs,ROOT,RAW,RELEASE,OC,NS
PUB=ROOT/'app/public/corpus'/RELEASE
def read(path):return json.loads((PUB/path).read_text())
class OriginalLanguages(unittest.TestCase):
 def test_full_reproduction(self):
  for name,data in outputs().items():self.assertEqual((PUB/name).read_bytes(),data,name)
 def test_every_hebrew_word_matches_original_xml_and_analysis(self):
  count=0
  with zipfile.ZipFile(RAW/'morphhb.zip') as z:
   for osis,code in OC.items():
    root=ET.fromstring(z.read(f'morphhb-master/wlc/{osis}.xml'));book=read(f'WLC/books/{code}.json')
    for chapter in book['chapters']:
     cn=chapter['chapter'];anal=read(f'analysis/{code}/{cn}.json')
     for verse,row in zip(chapter['verses'],anal['verses']):
      src=root.find(f'.//o:verse[@osisID="{osis}.{cn}.{verse["verse"]}"]',NS)
      words=src.findall('o:w',NS)
      self.assertEqual(len(words),len(row['tokens']))
      self.assertEqual(''.join(p['prefix']+p['text'] for p in verse['parts']),verse['text'])
      for w,t in zip(words,row['tokens']):
       self.assertEqual(''.join(w.itertext()),t['sourceSurface']);self.assertEqual(t['sourceSurface'].replace('/',''),t['surface']);self.assertEqual(w.get('lemma',''),t['lemma']);self.assertEqual(w.get('morph',''),t['morph']);count+=1
  self.assertEqual(count,305507)
 def test_numbering_titles_and_chapter_boundaries(self):
  def verse(b,c,v):return next(x for x in read(f'WLC/books/{b}.json')['chapters'] if x['chapter']==c)['verses'][v-1]
  self.assertEqual(verse('PSA',51,1)['englishReferences'],[])
  self.assertEqual(verse('PSA',51,2)['englishReferences'],[])
  self.assertEqual(verse('PSA',51,3)['englishReferences'][0]['reference'],'PSA.51.1')
  self.assertEqual(verse('JOL',3,1)['englishReferences'][0]['reference'],'JOL.2.28')
  self.assertEqual(verse('MAL',3,19)['englishReferences'][0]['reference'],'MAL.4.1')
  self.assertEqual(verse('GEN',32,1)['englishReferences'][0]['reference'],'GEN.31.55')
 def test_punctuation_and_variants_are_not_flattened(self):
  gen=read('WLC/books/GEN.json');vs=gen['chapters'][0]['verses']
  self.assertTrue(vs[0]['text'].endswith('׃'));self.assertIn('־',vs[1]['text']);self.assertNotIn('/',vs[0]['text'])
  notes=[n for c in gen['chapters'] for v in c['verses'] for n in v['notes']]
  self.assertTrue(any(any(r['type']=='x-qere' for r in n['readings']) for n in notes))
 def test_latin_and_all_patches_match_supplied_export(self):
  with zipfile.ZipFile(RAW/'vulgate-clementine-handoff.zip') as z:
   for b in read('CVUL/manifest.json')['books']:
    expected=json.loads(z.read('vulgate-clementine/json/'+b['code']+'.json'))['chapters']
    actual={str(c['chapter']):{str(v['verse']):v['text'] for v in c['verses']} for c in read('CVUL/books/'+b['code']+'.json')['chapters']}
    self.assertEqual(expected,actual)
 def test_article_lemma_keys_and_occurrences_resolve(self):
  index=read('hebrew-index.json');self.assertEqual(len(index['articles']),7)
  for article in index['articles']:
   for key in article['keys']:
    rows=read('lemmas/'+key+'.json')['occurrences'];self.assertGreater(len(rows),0)
    for row in rows:
     b,c,v=row['reference'].split('.');tokens=next(x for x in read(f'analysis/{b}/{c}.json')['verses'] if x['verse']==int(v))['tokens'];token=next(t for t in tokens if t['id']==row['token']);self.assertIn(key,token['keys']);self.assertEqual(row['surface'],token['surface'])
if __name__=='__main__':unittest.main()
