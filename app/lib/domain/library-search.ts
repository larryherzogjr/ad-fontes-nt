/** Shared, deterministic word/phrase matching. Display always uses original text. */
export const searchRelease = 'library-search-2026-10-14-v1';
export const searchBase = `/library/search/${searchRelease}`;
export const collectionLabels: Record<string, string> = { greek: 'Ordinary Means Greek studies', hebrew: 'Ordinary Means Hebrew studies', comparisons: 'Textual comparisons', lenski: 'Lenski', kd: 'Keil & Delitzsch' };
export type Token = { value: string; start: number; end: number };
export function tokenize(text: string): Token[] {
  return [...text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu)].map(m => ({ value: m[0].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(), start: m.index!, end: m.index! + m[0].length }));
}
export function parseQuery(query: string): string[][] {
  if (query.length > 250) throw Error('Use a search of 250 characters or fewer.');
  if ((query.match(/"/g) || []).length % 2) throw Error('Close the quotation marks around your phrase.');
  const clauses = [...query.matchAll(/"([^"]*)"|([^"\s]+)/g)].map(m => tokenize(m[1] ?? m[2]).map(t => t.value)).filter(c => c.length);
  if (clauses.flat().length > 20) throw Error('Use up to 20 search words.');
  return clauses;
}
export function matchRanges(text: string, query: string): [number, number][] {
  const tokens = tokenize(text), clauses = parseQuery(query), spans: [number, number][] = [];
  for (const clause of clauses) for (let i = 0; i <= tokens.length - clause.length; i++) {
    if (clause.every((word, j) => tokens[i+j].value === word)) spans.push([tokens[i].start, tokens[i+clause.length-1].end]);
  }
  spans.sort((a,b) => a[0]-b[0]);
  return spans.reduce<[number,number][]>((all, span) => { const last = all[all.length-1]; if (last && span[0] <= last[1]) last[1] = Math.max(last[1],span[1]); else all.push([...span]); return all; }, []);
}
export function textMatches(text: string, clauses: string[][]): boolean {
  const words = tokenize(text).map(t => t.value);
  return clauses.every(c => words.some((_,i) => c.every((w,j) => words[i+j] === w)));
}
export type SearchDoc = { id: string; collection: string; title: string; author: string; release: string; book: string; sourceUrl: string; shard: string; blocks: number; notice: string };
export type SearchIndex = { schemaVersion: 1; releaseId: string; collection: string; documents: SearchDoc[]; blocks: [number,number][]; postings: Record<string,string>; postingShards?: string[] };
export type PostingShard = { schemaVersion: 1; releaseId: string; collection: string; bucket: number; postings: Record<string,string> };
export function tokenBucket(word:string):number { let hash=2166136261;for(const char of word){hash=Math.imul(hash^char.codePointAt(0)!,16777619);}return (hash>>>0)%32; }
export type SearchBlock = { text: string; markdown?: string };
export type TextShard = { schemaVersion: 1; releaseId: string; documents: Record<string,SearchBlock[]> };
export type SearchGroup = { doc: SearchDoc; matches: number[]; score: number };
export type SearchManifest = { schemaVersion: 1; releaseId: string; inputs: Record<string,string>; implementation: Record<string,string>; files: Record<string,string>; counts: Record<string,{documents:number;blocks:number}> };

/** Delta-coded block/position pairs; positions reset on each new block. */
export function encodePostings(pairs: [number,number][]): string {
  const bytes: number[] = []; let previousBlock = 0, previousPosition = 0;
  const write = (n: number) => { while(n >= 128) { bytes.push((n % 128) + 128); n = Math.floor(n/128); } bytes.push(n); };
  for (const [block,position] of pairs) { const delta = block-previousBlock; write(delta); write(delta ? position : position-previousPosition); previousBlock=block; previousPosition=position; }
  return Buffer.from(bytes).toString('base64');
}
export function decodePostings(value: string, blockCount: number): Map<number,Set<number>> {
  const bytes = Uint8Array.from(atob(value), c => c.charCodeAt(0)); let cursor=0, block=0, position=0;
  const read = () => { let n=0, factor=1, count=0; while(true) { if(cursor>=bytes.length || ++count>5) throw Error('Invalid search postings.'); const b=bytes[cursor++]; n+=(b%128)*factor; if(b<128)return n; factor*=128; } };
  const result = new Map<number,Set<number>>();
  while(cursor<bytes.length) { const delta=read(), offset=read(); block+=delta; position=delta?offset:position+offset; if(block>=blockCount)throw Error('Invalid search block.'); const positions=result.get(block)||new Set<number>(); positions.add(position);result.set(block,positions); }
  return result;
}
export function queryIndex(index: SearchIndex, query: string, book = ''): SearchGroup[] {
  const clauses = parseQuery(query); if(!clauses.length)return [];
  const postings = new Map<string,Map<number,Set<number>>>();
  for(const word of new Set(clauses.flat())) postings.set(word,decodePostings(Object.hasOwn(index.postings,word)?index.postings[word]:'',index.blocks.length));
  const rarest = clauses.flat().sort((a,b)=>postings.get(a)!.size-postings.get(b)!.size)[0];
  const groups = new Map<number,SearchGroup>();
  for(const block of postings.get(rarest)!.keys()) {
    if(!clauses.every(clause => [...(postings.get(clause[0])!.get(block)||[])].some(position => clause.every((word,j)=>postings.get(word)!.get(block)?.has(position+j)))))continue;
    const [docId, locator] = index.blocks[block], doc=index.documents[docId];
    if(book && doc.book !== book)continue;
    const group=groups.get(docId)||{doc,matches:[],score:textMatches(doc.title,clauses)?100:0};
    const ordered=clauses.flat();
    if(ordered.length>1&&[...(postings.get(ordered[0])!.get(block)||[])].some(position=>ordered.every((word,j)=>postings.get(word)!.get(block)?.has(position+j))))group.score=Math.max(group.score,50);
    group.matches.push(locator);groups.set(docId,group);
  }
  return [...groups.values()];
}
export function sortGroups(groups: SearchGroup[]): SearchGroup[] {
  return groups.sort((a,b)=>b.score-a.score || a.doc.collection.localeCompare(b.doc.collection) || a.doc.id.localeCompare(b.doc.id,'en',{numeric:true}));
}
export function excerpt(text: string, query: string): string {
  const spans=matchRanges(text,query);const start=Math.max(0,(spans[0]?.[0]||0)-90), end=Math.min(text.length,start+360);
  return (start?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
}
export async function checkedJson<T>(path: string, hash: string, signal?: AbortSignal): Promise<T> {
  const response=await fetch(`${searchBase}/${path}`,{signal}); if(!response.ok)throw Error('Library search data could not be loaded. Please retry.');
  const bytes=await response.arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(digest!==hash)throw Error('Library search data does not match this release. Please reload.');
  const decoded=path.endsWith('.bin')?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():bytes;
  return JSON.parse(new TextDecoder().decode(decoded)) as T;
}
export async function loadSearchManifest(signal?: AbortSignal): Promise<SearchManifest> {
  const response=await fetch(`${searchBase}/manifest.json`,{signal,cache:'no-store'});if(!response.ok)throw Error('The Library search index is unavailable.');
  const m=await response.json() as SearchManifest;
  if(m.schemaVersion!==1||m.releaseId!==searchRelease||!m.files||!m.counts||Object.keys(collectionLabels).some(c=>!m.files[`${c}.bin`]||!m.counts[c]))throw Error('The Library search release is incomplete.');
  return m;
}
