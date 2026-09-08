import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, delimiter } from 'node:path';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const env = { ...process.env };
const localCargo = join(root, '.desktop-tools/cargo');
if (existsSync(join(localCargo, 'bin'))) {
  env.CARGO_HOME = localCargo;
  env.RUSTUP_HOME = join(root, '.desktop-tools/rustup');
  env.PATH = join(localCargo, 'bin') + delimiter + env.PATH;
}
const child = spawn(process.execPath, [join(root, 'app/node_modules/@tauri-apps/cli/tauri.js'), ...process.argv.slice(2)], {
  cwd: join(root, 'app/desktop'), env, stdio: 'inherit',
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
