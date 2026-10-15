"""Independent XML inventory, text retention and checksum audit."""
from pathlib import Path
import hashlib,json,re,unittest
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'sources/abbott-smith'; RELEASE='abbott-smith-1922-2026-10-14-v1'
PUBLIC=ROOT/'app/public/lexical'/RELEASE
NS={'t':'http://www.crosswire.org/2013/TEIOSIS/namespace'}
class AbbottAudit(unittest.TestCase):
 def test_all_pinned_inputs_and_outputs(self):
  pin=BASE/'releases'/RELEASE;inputs=json.loads((pin/'inputs.json').read_text())
  for name,digest in inputs['files'].items():self.assertEqual(hashlib.sha256((BASE/'raw'/name).read_bytes()).hexdigest(),digest)
  self.assertEqual(hashlib.sha256((ROOT/'scripts/abbott_smith/import_abbott.py').read_bytes()).hexdigest(),inputs['importer'])
  for name,digest in json.loads((pin/'outputs.json').read_text()).items():self.assertEqual(hashlib.sha256((PUBLIC/name).read_bytes()).hexdigest(),digest,name)
 def test_every_source_entry_and_prose_segment_is_retained(self):
  root=ET.fromstring((BASE/'raw/abbott-smith.tei.xml').read_bytes());entries=root.findall('.//t:entry',NS)
  rows={}
  for path in (PUBLIC/'entries').glob('*.json'):rows.update(json.loads(path.read_text())['entries'])
  self.assertEqual(len(rows),len(entries));self.assertEqual(len(rows),6153)
  clean=lambda s:re.sub(r'\s+',' ',s or '').strip()
  for i,e in enumerate(entries):
   row=rows[f'a{i+1:05}'];self.assertEqual(row['sourceKey'],e.get('n',''))
   self.assertEqual(row['historicalNtCounts'],[clean(''.join(n.itertext())) for n in e.findall('t:note',NS) if n.get('type')=='occurrencesNT'])
   body=clean(' '.join(row['paragraphs']))
   def check(node):
    if node.tag.endswith('}note') and node.get('type')=='occurrencesNT':return
    if clean(node.text):self.assertIn(clean(node.text),body,row['id'])
    if node.tag.endswith('}sense') and node.get('n'):self.assertIn(node.get('n'),body)
    for child in node:
     check(child)
     if clean(child.tail):self.assertIn(clean(child.tail),body,row['id'])
   check(e)
 def test_public_projection_has_no_pdf_or_foreign_corpus(self):
  self.assertEqual(json.loads((PUBLIC/'reviewed-differences.json').read_text())['unindexedEntries'],[])
  self.assertTrue(all(p.suffix in ['.json','.txt','.md'] for p in PUBLIC.rglob('*') if p.is_file()))
if __name__=='__main__':unittest.main()
