/** Index only explicit publisher ref objects; never infer quotation/allusion categories. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolveReference, address, books } from '../app/lib/domain/references.ts';
import { isOtBook } from '../app/lib/domain/ot-release.ts';
const releaseId = 'bsb-testament-connections-2026-10-07-v1';
const pins = `sources/testament-connections/${releaseId}`;
const out = `app/public/connections/${releaseId}`;
const encoded = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const inputs: Record<string,string> = {};
const connections: any[] = [], excluded: any[] = [];
async function input(path: string) {
  const raw = await readFile(path); inputs[path] = sha(raw); return JSON.parse(raw.toString());
}
function refs(node: any, path = 'original'): any[] {
  if (Array.isArray(node)) return node.flatMap((value,i) => refs(value,`${path}/${i}`));
  if (!node || typeof node !== 'object') return [];
  return [...(node.type === 'ref' ? [{ loc: node.loc, content: node.content, path }] : []),
    ...Object.entries(node).flatMap(([key,value]) => refs(value,`${path}/${key}`))];
}
for (const book of books) {
  const sourceRelease = isOtBook(book.code) ? 'bsb-ot-2026-10-07-v1' : 'bsb-2026-09-05-m2-v1';
  for (let c=1;c<=book.verses.length;c++) {
    const ch = await input(`app/public/corpus/${sourceRelease}/${book.code}/${c}.json`);
    if (ch.releaseId !== sourceRelease || ch.book !== book.code || ch.chapter !== c) throw Error('Wrong source chapter');
    for (const note of ch.notes) for (const ref of refs(note.original)) {
      let targets;
      try { targets = resolveReference(ref.loc); } catch {
        excluded.push({ noteId: note.id, sourceRelease, sourceAnchor: note.anchor, ...ref, reason: 'Explicit reference not resolvable in the current English registry; no canonical mapping inferred.' });
        continue;
      }
      // References within one Testament stay in the original publisher note, not this index.
      targets = targets.filter(r => isOtBook(address(r.start).book.code) !== isOtBook(book.code)
        && isOtBook(address(r.end).book.code) !== isOtBook(book.code));
      if (!targets.length) continue;
      connections.push({ id: sha(`${sourceRelease}|${note.id}|${ref.path}|${ref.loc}`).slice(0,24),
        kind: 'publisher-cross-reference', sourceEdition: 'BSB', sourceRelease,
        sourceRanges: [{ start: note.anchor, end: note.anchor }], targetRanges: targets,
        noteId: note.id, noteSourceId: note.sourceId, publisherNote: note.body, originalReference: ref,
      });
    }
  }
}
const index = { schemaVersion: 1, releaseId, sourceEdition: 'BSB',
  coverage: 'Explicit cross-Testament ref objects in the pinned BSB publisher notes only. Plain-text mentions and heading references are not indexed. No exhaustive quotation/allusion coverage is claimed.',
  connections };
const manifest = { schemaVersion: 1, releaseId, kind: 'publisher-material index; no Ordinary Means commentary',
  implementationSha256: sha(await readFile(new URL(import.meta.url))), inputs,
  outputSha256: sha(encoded(index)), connections: connections.length, unresolvedReferences: excluded.length,
  sourceReleases: ['bsb-2026-09-05-m2-v1','bsb-ot-2026-10-07-v1'],
  transformations: ['Retain explicit publisher ref objects and original note identity/body.', 'Resolve publisher English reference labels against the current canonical registry.', 'Include cross-Testament references only; provide reciprocal navigation without inferring direction of quotation.', 'Do not infer NT quotation extent from a note attached to its closing verse.'],
};
async function pin(name: string,value: unknown) {
  const path=`${pins}/${name}`; const bytes=encoded(value);
  let existing: string | undefined;
  try { existing=await readFile(path,'utf8'); } catch (e: any) { if (e.code!=='ENOENT') throw e; }
  if (existing !== undefined) { if(existing!==bytes) throw Error(`Pinned connection release changed: ${name}`); }
  else { if(!process.argv.includes('--prepare')) throw Error(`Missing new-release metadata: ${path}`); await mkdir(pins,{recursive:true}); await writeFile(path,bytes); }
}
await pin('manifest.json',manifest); await pin('unresolved-references.json',excluded);
await mkdir(out,{recursive:true}); await writeFile(`${out}/index.json`,encoded(index)); await writeFile(`${out}/manifest.json`,encoded(manifest));
console.log(`Verified ${connections.length} publisher NT/OT connections; ${excluded.length} unresolved refs retained for review.`);
