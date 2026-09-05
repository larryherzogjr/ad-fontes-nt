#!/usr/bin/env python3
"""Interactive local secret file creation; never prints credentials or the shared password."""
from pathlib import Path
import getpass, json, secrets, os, re, shutil, subprocess
path=Path(__file__).resolve().parent.parent/'deployment'/'.env'
if path.exists():raise SystemExit('deployment/.env already exists; preserve it and edit deliberately.')
node=shutil.which('node')
if not node:raise SystemExit('Node.js is required. Install the project Node runtime and try again; file not written.')
client=input('Dedicated Google OAuth client ID: ').strip()
secret=getpass.getpass('Google client secret (hidden): ').strip()
if not re.fullmatch(r'[A-Za-z0-9._-]+',client) or not re.fullmatch(r'[A-Za-z0-9._-]+',secret):raise SystemExit('Unexpected credential format; file not written.')
password=getpass.getpass('Shared registration password (at least 16 characters): ')
if len(password)<16 or len(password.encode('utf-16-le'))//2>512 or password!=getpass.getpass('Repeat registration password: '):raise SystemExit('Password must be 16–512 characters and match; file not written.')
salt=secrets.token_hex(16)
# Pass the password through stdin, never command arguments or the environment.
# Node is already required by the app; macOS Python may lack hashlib.scrypt.
try:
    result=subprocess.run([node,'-e',
        "const fs=require('node:fs'),crypto=require('node:crypto');"
        "const {password,salt}=JSON.parse(fs.readFileSync(0,'utf8'));"
        "process.stdout.write(crypto.scryptSync(password,salt,64,{N:16384,r:8,p:1}).toString('hex'));"],
        input=json.dumps({'password':password,'salt':salt}),text=True,
        capture_output=True,timeout=30)
except (OSError,subprocess.TimeoutExpired):
    raise SystemExit('Could not run Node password hashing; file not written.') from None
key=result.stdout.strip()
if result.returncode or not re.fullmatch(r'[0-9a-f]{128}',key):
    raise SystemExit('Node password hashing failed; file not written.')
content=f'POSTGRES_ADMIN_PASSWORD={secrets.token_hex(32)}\nAFNT_DATABASE_PASSWORD={secrets.token_hex(32)}\nGOOGLE_CLIENT_ID={client}\nGOOGLE_CLIENT_SECRET={secret}\nREGISTRATION_PASSWORD_HASH=scrypt:{salt}:{key}\n'
fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f:f.write(content)
print('Created deployment/.env with mode 0600. Keep it private and back it up separately.')
