"""Create NEW evaluation config; optionally copy only Google client values from a selected legacy env."""
import getpass,os,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2];target=root/'deployment/evaluation/.env'
if target.exists():raise SystemExit('Evaluation configuration already exists; refusing to overwrite.')
values={}
if '--reuse-google' in sys.argv:
 # Explicit operator action; do not read/export old notes, DB passwords or other app credentials.
 source=root/'deployment/.env'
 for line in source.read_text().splitlines():
  m=re.fullmatch(r'(GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET)=(.*)',line)
  if m:values[m[1]]=m[2].strip().strip('"\'')
for key in ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET']:
 if not values.get(key):values[key]=getpass.getpass(key+': ')
 if not re.fullmatch(r'[A-Za-z0-9_.:/-]+',values[key]):raise SystemExit('Unexpected credential format; no file written.')
fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f:
 for k,v in values.items():f.write(k+'='+v+'\n')
print('Dedicated evaluation configuration created. Register https://eval.ad-fontes.app/api/evaluation/callback on the Google Web client. No legacy configuration or data changed.')
