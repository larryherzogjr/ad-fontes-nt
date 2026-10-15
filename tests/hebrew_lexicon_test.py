"""Independent source-mapping and pinned-output audit for the Hebrew dictionaries."""
from pathlib import Path
import hashlib, json, unittest, zipfile
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
RELEASE='hebrew-lexicon-2026-10-14-v1'
BASE=ROOT/'sources/hebrew-lexicon'
PUBLIC=ROOT/'app/public/lexical'/RELEASE
NS={'o':'http://openscriptures.github.com/morphhb/namespace'}
LANG='{http://www.w3.org/XML/1998/namespace}lang'
class DictionaryAudit(unittest.TestCase):
 def test_pinned_inputs_and_complete_outputs(self):
  pin=BASE/'releases'/RELEASE
  inputs=json.loads((pin/'inputs.json').read_text())
  for name,digest in inputs['files'].items():self.assertEqual(hashlib.sha256((BASE/'raw'/name).read_bytes()).hexdigest(),digest)
  self.assertEqual(hashlib.sha256((ROOT/'scripts/hebrew_lexicon/import_lexicon.py').read_bytes()).hexdigest(),inputs['importer'])
  for name,digest in json.loads((pin/'outputs.json').read_text()).items():self.assertEqual(hashlib.sha256((PUBLIC/name).read_bytes()).hexdigest(),digest,name)
 def test_every_join_preserves_source_language_and_augmented_identity(self):
  with zipfile.ZipFile(BASE/'raw/HebrewLexicon.zip') as z:
   aug={w.get('aug'):w.text for w in ET.fromstring(z.read('HebrewLexicon-master/AugIndex.xml'))}
   entries={e.get('id'):(p.get(LANG),e.find('o:xref',NS).get('bdb')) for p in ET.fromstring(z.read('HebrewLexicon-master/LexicalIndex.xml')) for e in p}
   for row in json.loads((PUBLIC/'index.json').read_text())['entries']:
    expected=entries.get(aug.get(row['key'][1:]))
    if expected and expected[0]==row['language']:
     self.assertEqual(row['lexical'],aug[row['key'][1:]])
     self.assertEqual(row['bdb'],expected[1] or None)
    else:self.assertIsNone(row['bdb']);self.assertTrue(row['mappingNote'])
 def test_strongs_transcription_matches_all_source_fields(self):
  with zipfile.ZipFile(BASE/'raw/HebrewLexicon.zip') as z:
   root=ET.fromstring(z.read('HebrewLexicon-master/HebrewStrong.xml'))
   for e in root.findall('o:entry',NS):
    row=json.loads((PUBLIC/'strongs'/(e.get('id')+'.json')).read_text())
    for target,source in [('derivation','source'),('definition','meaning'),('usage','usage')]:
     node=e.find('o:'+source,NS);expected=' '.join(''.join(node.itertext()).split()) if node is not None else ''
     self.assertEqual(row[target],expected)
if __name__=='__main__':unittest.main()
