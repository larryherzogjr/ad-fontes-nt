import unittest,json,zipfile,csv,io,re,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
RELEASE='nestle-analysis-1.3-m3-v1'
class GreekFidelity(unittest.TestCase):
 def test_every_token_roundtrips_and_occurrence_inventory_matches(self):
  z=zipfile.ZipFile(ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip');p=z.namelist()[0];rows=list(csv.DictReader(io.StringIO(z.read(p+'morph/Nestle1904.csv').decode('utf-8-sig')),delimiter='\t'))
  tokens={};unavailable=[];glossMissing=0
  for file in (ROOT/'app/public/analysis'/RELEASE).glob('[A-Z0-9]*/*.json'):
   if file.parent.name in ['lemmas','lexicon']:continue
   for segment in json.loads(file.read_text())['segments']:
    if segment['status']=='unavailable':unavailable.append(segment['sourceRef']);self.assertEqual(segment['tokens'],[])
    for t in segment['tokens']:
     self.assertEqual(segment['text'][t['start']:t['end']],t['surface']);self.assertNotIn(t['id'],tokens);tokens[t['id']]=t
     row=rows[int(t['sourceId'].split('=')[-1])-2]
     for a,b in [('sourceText','text'),('lemma','lemma'),('functional','func_morph'),('form','form_morph'),('strongs','strongs')]:self.assertEqual(t[a],row[b])
     if t['gloss'] is None:glossMissing+=1
  self.assertEqual(len(tokens),137694);self.assertEqual(set(unavailable),{'2TH.2.13','1TI.1.16'});self.assertGreater(glossMissing,0)
  seen=[]
  for file in (ROOT/'app/public/analysis'/RELEASE/'lemmas').glob('*.json'):
   entry=json.loads(file.read_text())
   for hit in entry['hits']:
    t=tokens[hit['tokenId']];self.assertEqual(t['lemmaId'],entry['lemmaId']);self.assertEqual(t['surface'],hit['surface']);seen.append(t['id'])
  self.assertEqual(len(seen),len(tokens));self.assertEqual(set(seen),set(tokens))
 def test_independent_rp_morphology_spot_checks(self):
  z=zipfile.ZipFile(ROOT/'sources/rp2018/raw/rp-v3.3.2.zip');prefix=z.namelist()[0]
  samples=[('JHN','JOH',1,1,'λόγος','3056','N-NSM'),('ROM','ROM',3,23,'ἥμαρτον','264','V-2AAI-3P'),('PHP','PHP',2,6,'μορφῇ','3444','N-DSF'),('PHM','PHM',1,4,'Εὐχαριστῶ','2168','V-PAI-1S')]
  plain=lambda s:''.join(c for c in unicodedata.normalize('NFD',s) if not unicodedata.combining(c)).lower()
  for book,external,c,v,word,strong,tag in samples:
   rows=list(csv.DictReader(io.StringIO(z.read(prefix+f'csv-unicode/strongs/with-parsing/{external}.csv').decode())))
   raw=next(r['text'] for r in rows if int(r['chapter'])==c and int(r['verse'])==v)
   self.assertIn(f'{plain(word)} {strong} {{{tag}}}',raw)
   ch=json.loads((ROOT/f'app/public/analysis/{RELEASE}/{book}/{c}.json').read_text());s=next(s for s in ch['segments'] if s['sourceRef']==f'{book}.{c}.{v}');t=next(t for t in s['tokens'] if plain(t['surface'])==plain(word));self.assertEqual(t['functional'],tag);self.assertEqual(t['strongs'].split('&')[0],strong)
if __name__=='__main__':unittest.main()
