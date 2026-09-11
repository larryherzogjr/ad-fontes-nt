#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

type Options = Record<string, string>;
function options(args: string[]): Options {
  const result: Options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    if (!key?.startsWith('--') || !args[index + 1]) throw Error(`Invalid argument: ${key || ''}`);
    result[key.slice(2)] = args[index + 1];
  }
  return result;
}

const args = options(process.argv.slice(2));
const version = args.version;
const output = args.output;
const baseUrl = args['base-url']?.replace(/\/$/, '');
if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw Error('A valid --version is required');
if (!output) throw Error('--output is required');
if (!baseUrl || !baseUrl.startsWith('https://')) throw Error('An HTTPS --base-url is required');

const platforms: Record<string, { signature: string; url: string }> = {};
const checksums: string[] = [];
const releaseDirectory = join(output, 'releases', version);
await mkdir(join(output, 'releases'), { recursive: true });
await mkdir(releaseDirectory, { recursive: false });

async function addPlatform(target: string, bundleKey: string, signatureKey: string, suffix: string) {
  const bundle = args[bundleKey];
  const signaturePath = args[signatureKey];
  if (!bundle && !signaturePath) return;
  if (!bundle || !signaturePath) throw Error(`${target} requires both bundle and signature`);
  if (!basename(bundle).endsWith(suffix)) throw Error(`${target} bundle must end in ${suffix}`);
  const name = `ad-fontes-nt-${version}-${target}${suffix}`;
  const bytes = await readFile(bundle);
  if (!(await stat(bundle)).isFile() || bytes.length === 0) throw Error(`Empty bundle: ${bundle}`);
  const signature = (await readFile(signaturePath, 'utf8')).trim();
  if (!signature || signature.includes('\n')) throw Error(`Invalid updater signature: ${signaturePath}`);
  await copyFile(bundle, join(releaseDirectory, name));
  platforms[target] = {
    signature,
    url: `${baseUrl}/releases/${encodeURIComponent(version)}/${encodeURIComponent(name)}`,
  };
  checksums.push(`${createHash('sha256').update(bytes).digest('hex')}  releases/${version}/${name}`);
}

await addPlatform('darwin-aarch64', 'mac-bundle', 'mac-signature', '.app.tar.gz');
await addPlatform('windows-x86_64', 'windows-bundle', 'windows-signature', '.exe');
if (!Object.keys(platforms).length) throw Error('At least one platform artifact is required');

let notes = args.notes || '';
if (args['notes-file']) notes = (await readFile(args['notes-file'], 'utf8')).trim();
const pubDate = args['pub-date'] || new Date().toISOString();
if (!Number.isFinite(Date.parse(pubDate))) throw Error('Invalid --pub-date');
const manifest = { version, notes, pub_date: pubDate, platforms };
await mkdir(join(output, 'stable'), { recursive: true });
const temporary = join(output, 'stable', 'latest.json.tmp');
await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx', mode: 0o644 });
await rename(temporary, join(output, 'stable', 'latest.json'));
await writeFile(join(output, 'SHA256SUMS'), `${checksums.sort().join('\n')}\n`, { flag: 'wx', mode: 0o644 });
console.log(`Prepared signed desktop update ${version} for ${Object.keys(platforms).join(', ')}`);
