"""Offline Abbott-Smith XML projection, independent of Scripture/analysis releases."""
from pathlib import Path
import argparse, collections, hashlib, json, re, unicodedata
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'sources/abbott-smith'; RAW=BASE/'raw'
RELEASE='abbott-smith-1922-2026-10-14-v1'; PIN=BASE/'releases'/RELEASE
NS={'t':'http://www.crosswire.org/2013/TEIOSIS/namespace'}
def sha(b):return hashlib.sha256(b).hexdigest()
def enc(v):return (json.dumps(v,ensure_ascii=False,separators=(',',':'))+'\n').encode()
def plain(e):return re.sub(r'\s+',' ',''.join(e.itertext())).strip() if e is not None else ''
def key(s):return unicodedata.normalize('NFC',s).lower()
def text(e):
 tag=e.tag.split('}')[-1]
 if tag=='note' and e.get('type')=='occurrencesNT':return ''
 if tag in ('pb','lb'):return ' '
 value=e.text or ''
 if tag in ('sense','form','etym','re','note'):value='\n'+(e.get('n','')+' ' if tag=='sense' and e.get('n') else '')+value
 for c in e:value+=text(c)+(c.tail or '')
 return value

def outputs():
 root=ET.fromstring((RAW/'abbott-smith.tei.xml').read_bytes());entries=root.findall('.//t:entry',NS)
 assert len(entries)==6153
 out={};buckets=collections.defaultdict(dict);index=collections.defaultdict(list)
 def put(path,value):out[path]=enc({'releaseId':RELEASE,**value})
 extended=set();duplicates=collections.Counter();unkeyed=[]
 for position,e in enumerate(entries):
  ident=f'a{position+1:05}';shard=f'{position//100:02}'
  n=e.get('n','');parts=n.split('|') if n else []
  numbers=list(dict.fromkeys('G'+str(int(m.group(1)))+m.group(2) for p in parts[1:] for m in [re.fullmatch(r'G(\d+)([a-z]?)',p)] if m))
  assert not parts or all(re.fullmatch(r'G\d+[a-z]?',p) for p in parts[1:]),n
  for number in numbers:
   duplicates[number]+=1
   if number[-1].isalpha():extended.add(number)
  orth=[plain(o) for f in e.findall('t:form',NS) for o in f.findall('t:orth',NS)]
  explicit=[plain(f) for f in e.findall('t:form/t:form',NS) if f.get('type')=='lemma']
  headwords=list(dict.fromkeys(([parts[0]] if parts and parts[0] else [])+orth+explicit))
  if not headwords:unkeyed.append(ident)
  paragraphs=[re.sub(r'\s+',' ',p).strip() for p in text(e).split('\n') if p.strip()]
  historical=[plain(note) for note in e.findall('t:note',NS) if note.get('type')=='occurrencesNT']
  row={'id':ident,'sourceKey':n,'headwords':headwords,'strongs':numbers,'paragraphs':paragraphs,'historicalNtCounts':historical}
  buckets[shard][ident]=row
  for headword in headwords:
   k=key(headword)
   ref={'id':ident,'shard':shard,'headword':headwords[0],'strongs':numbers}
   if ref not in index[k]:index[k].append(ref)
 for shard,rows in buckets.items():put('entries/'+shard+'.json',{'entries':rows})
 put('index.json',{'entryCount':len(entries),'headwords':dict(index)})
 put('reviewed-differences.json',{'sourceEntries':len(entries),'preparedHandoffEntries':6143,'decisions':['Use complete source XML, not a dictionary keyed only by Strong’s number.', 'NFC/case headword matching only; no accent stripping, hyphen removal, inferred synonyms or article-only aliases.', 'Preserve extended Strong’s suffixes, multi-number identifiers and separate entries with shared numbers.', 'Retain literal historical citations, sense labels and abbreviations. Layout whitespace/page breaks normalized; source NT count notes stored separately from prose.', 'No Tischendorf text, morphology or frequency data is attached to current Scripture. No current analysis/corpus release changes.'], 'extendedStrongs':sorted(extended),'sharedNumberEntries':{k:v for k,v in duplicates.items() if v>1},'unindexedEntries':unkeyed})
 out['SOURCE-README.md']=(RAW/'README.md').read_bytes()
 out['NOTICE.txt']=('G. Abbott-Smith, A Manual Greek Lexicon of the New Testament, first edition, Charles Scribner’s Sons, New York, 1922. Electronic transcription and markup: the Abbott-Smith project, https://github.com/translatable-exegetical-tools/Abbott-Smith . The supplied source README dedicates the lexicon XML, including its markup, to the public domain. Contributor credits are retained in SOURCE-README.md and the archived XML header. Ad Fontes derives JSON, exact headword lookup and reading layout. Historical sense divisions, source abbreviations and reference wording are preserved. The lexicon’s NT frequency notes belong to its historical source; they are not Ad Fontes corpus occurrence totals. No scanned PDF or editor software is distributed.\n').encode()
 return out

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--freeze-new',action='store_true');args=parser.parse_args()
 inputs={'files':{f.name:sha(f.read_bytes()) for f in sorted(RAW.iterdir()) if f.is_file()},'importer':sha(Path(__file__).read_bytes())}
 if not args.freeze_new:assert json.loads((PIN/'inputs.json').read_text())==inputs,'Source/importer drift requires reviewed successor release'
 result=outputs();hashes={p:sha(b) for p,b in sorted(result.items())}
 if args.freeze_new:
  assert not PIN.exists(),'Never replace existing release pins'
  PIN.mkdir(parents=True);(PIN/'inputs.json').write_bytes(enc(inputs));(PIN/'outputs.json').write_bytes(enc(hashes));(PIN/'reviewed-differences.json').write_bytes(result['reviewed-differences.json'])
 else:assert json.loads((PIN/'outputs.json').read_text())==hashes,'Dictionary output drift'
 for path,b in result.items():
  target=ROOT/'app/public/lexical'/RELEASE/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b)
 print(f'{RELEASE}: {len(result)} verified files; 6153 source entries')
if __name__=='__main__':main()
