"""Build a separately versioned analysis layer; never changes an M2 Scripture bundle."""
import sys,json,hashlib,zipfile,tempfile,shutil
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'m3'))
from greek import ROOT,RELEASE,TEXT_RELEASE,extract,lexicon
FREEZE='--freeze' in sys.argv
BASE=ROOT/'sources/m3'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n')
def check(p,obj):
 if FREEZE and not p.exists():write(p,obj)
 else:assert json.loads(p.read_text())==obj,f'Unreviewed analysis change: {p}'
if FREEZE:
 z=zipfile.ZipFile(ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip');prefix=z.namelist()[0]
 for name in ['morph/README.md','morph/parsing.txt','glosses/README.md']:
  p=BASE/'evidence'/name.replace('/','-')
  if not p.exists():p.write_bytes(z.read(prefix+name))
 lex,prologue=lexicon();p=BASE/'evidence/strongs-prologue.txt'
 if not p.exists():p.write_text(prologue)
 z=zipfile.ZipFile(BASE/'raw/StrongsGreekDictionaryXML_1.4.zip');p=BASE/'evidence/strongs-release-notes.txt'
 if not p.exists():p.write_bytes(z.read('README.txt'))
manifest={'releaseId':RELEASE,'editionId':'N1904','textReleaseId':TEXT_RELEASE,'morphology':'Ulrik Sandborg-Petersen, Nestle 1904 morphology v1.3 (2017-04-15), CC0; commit 713f28a3b7d4d66132f5aa809fa223fe79762e5d. Functional and form tags retained independently.','glosses':'Berean Interlinear glosses in the same pinned repository; public-domain dedication corroborated by Berean terms. Only complete matching Greek word sequences are attached. One unaddressed gloss is excluded.','lexicon':'James Strong, Greek Dictionary (1890); Ulrik Petersen XML v1.4 (2007-09-14), Public Domain prologue. Original XML version only; no merged GPL dictionary/software is used.','sourceUrls':['https://github.com/biblicalhumanities/Nestle1904/tree/713f28a3b7d4d66132f5aa809fa223fe79762e5d/morph','https://github.com/biblicalhumanities/Nestle1904/tree/713f28a3b7d4d66132f5aa809fa223fe79762e5d/glosses','https://berean.bible/terms.htm','https://github.com/openscriptures/strongs/tree/0acd2f251c2d35ff8db2dece4e0593979d3ac223/greek/StrongsGreekDictionaryXML_1.4'],'matching':'NFC equivalence only, complete Greek word sequence, source order and source verse ID; no English positional alignment. Original text/code-point spans retained.','scope':'7,940 matching Nestle source verses. Two apostrophe-shape mismatches are explicitly unavailable; source Mark 16:99 is appended material excluded from main-text analysis. Occurrence counts describe this indexed subset.','review':'Source-backed analysis, not Ordinary Means commentary. Independent sample reconciliation is engineering verification; qualified editorial review remains a release gate.'}
paths=[ROOT/'sources/nestle1904/raw/nestle1904-713f28a.zip',BASE/'raw/StrongsGreekDictionaryXML_1.4.zip',ROOT/'sources/bsb/evidence/terms.html']+sorted((BASE/'evidence').glob('*'))
manifest['artifacts']=[{'path':str(p.relative_to(ROOT)),'sha256':digest(p)} for p in paths if p.is_file()]
check(BASE/'manifest.json',manifest)
cs,occ,report=extract();lex,_=lexicon();report['lexiconEntries']=len(lex);check(BASE/'reconciliation.json',report)
tmp=tempfile.TemporaryDirectory(prefix='afnt-greek-');out=Path(tmp.name)/RELEASE;out.mkdir()
for c in cs:write(out/c['book']/f"{c['chapter']}.json",c)
for id,entry in occ.items():write(out/'lemmas'/f'{id}.json',entry)
for id,entry in lex.items():write(out/'lexicon'/f'{id}.json',entry)
write(out/'manifest.json',{**manifest,'coverage':{k:v for k,v in report.items() if k!='unavailable'}})
checksums={str(p.relative_to(out)):digest(p) for p in sorted(out.rglob('*.json'))};check(BASE/'output-checksums.json',checksums)
target=ROOT/'app/public/analysis'/RELEASE
if target.exists():assert checksums=={str(p.relative_to(target)):digest(p) for p in sorted(target.rglob('*.json'))},'Immutable analysis release differs'
else:shutil.copytree(out,target)
write(ROOT/'app/lib/domain/analysis-release.json',{'releaseId':RELEASE,'textReleaseId':TEXT_RELEASE,'editionId':'N1904','coverage':{k:v for k,v in report.items() if k!='unavailable'}})
print(json.dumps({k:v for k,v in report.items() if k!='unavailable'}));tmp.cleanup()
