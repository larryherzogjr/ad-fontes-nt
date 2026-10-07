import gzip,hashlib,json,pathlib,unittest,collections,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1];RELEASE='lxx-research-2026-10-07-v1';BASE=ROOT/'sources/lxx'/RELEASE;OUT=ROOT/'app/public/analysis'/RELEASE
class ResearchFidelity(unittest.TestCase):
 def test_immutable_inputs_outputs_and_every_original_token(self):
  pin=json.loads((BASE/'checksums.json').read_text());self.assertEqual(hashlib.sha256((ROOT/'scripts/research/build_lxx_research.py').read_bytes()).hexdigest(),pin['implementationSha256'])
  for path,digest in pin['inputs'].items():self.assertEqual(hashlib.sha256((ROOT/path).read_bytes()).hexdigest(),digest,path)
  for path,digest in pin['outputs'].items():self.assertEqual(hashlib.sha256((OUT/path).read_bytes()).hexdigest(),digest,path)
  inventory=json.loads((BASE/'source-manifest.json').read_text());lemmas=collections.Counter();count=0;verses=0
  for book,source in inventory['sourceFiles'].items():
   raw=gzip.decompress((BASE/'raw'/(book+'.json.gz')).read_bytes());self.assertEqual(hashlib.sha256(raw).hexdigest(),source['sha256']);rows=json.loads(raw);records=json.loads((OUT/'books'/(book+'.json')).read_text())['verses'];self.assertEqual(len(rows),len(records));verses+=len(rows)
   for row,record in zip(rows,records):
    self.assertEqual(record['text'],' '.join(w['surface'] for w in row['words']));self.assertEqual(record['sourceRef'],book+'/'+row['ref'].rsplit(' ',1)[1]);self.assertEqual(len(row['words']),len(record['tokens']))
    for word,t in zip(row['words'],record['tokens']):
     self.assertEqual(t[:4],[word['surface'],word.get('lemma') or '',word.get('pos') or '',word.get('parsing') or '']);self.assertEqual(record['text'][t[4]:t[5]],t[0]);count+=1
     if t[1]:lemmas[unicodedata.normalize('NFC',t[1])]+=1
  self.assertEqual((count,verses),(623440,30603));index=json.loads((OUT/'lemmas.json').read_text())['entries'];self.assertEqual({e['lemma']:e['lxx']['count'] for e in index if e['lxx']},dict(lemmas))
if __name__=='__main__':unittest.main()
