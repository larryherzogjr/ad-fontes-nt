import { address, compare, type PassageRange } from './references.ts';
export const connectionRelease = 'bsb-testament-connections-2026-10-07-v1';
export type TestamentConnection = {
  id: string; kind: 'publisher-cross-reference'|'publisher-heading-reference'; sourceEdition: 'BSB'|'MSB'; sourceRelease: string;
  sourceRanges: PassageRange[]; targetRanges: PassageRange[]; noteId: string; noteSourceId: string;
  publisherNote: string; originalReference: {loc: string; path: string; content: unknown[]};
};
export type ConnectionIndex = {schemaVersion: number; releaseId: string; coverage: string; connections: TestamentConnection[]};
export function connectionMatches(connection: TestamentConnection, ranges: PassageRange[]) {
  const overlap = (a: PassageRange,b: PassageRange) => compare(a.start,b.end)<=0 && compare(b.start,a.end)<=0;
  return ranges.some(r => [...connection.sourceRanges,...connection.targetRanges].some(c => overlap(r,c)));
}
export async function loadConnections(load = async (path: string) => {
  const response=await fetch(path); if(!response.ok) throw Error('NT/OT connections could not be loaded.'); return response.json();
}): Promise<ConnectionIndex> {
  const data=await load(`/connections/${connectionRelease}/index.json`) as ConnectionIndex;
  const validRanges = (ranges: PassageRange[]) => {
    try { return Array.isArray(ranges) && ranges.length > 0 && ranges.every(r => compare(r.start,r.end)<=0 && (address(r.start).book.order<39)===(address(r.end).book.order<39)); } catch { return false; }
  };
  if(!data || data.schemaVersion!==1 || data.releaseId!==connectionRelease || !Array.isArray(data.connections) || data.connections.length!==698
    || data.connections.some(c=>!c || c.kind!=='publisher-cross-reference' || c.sourceEdition!=='BSB' || !validRanges(c.sourceRanges) || !validRanges(c.targetRanges) || !c.noteId || !c.originalReference?.loc
      || !['bsb-2026-09-05-m2-v1','bsb-ot-2026-10-07-v1'].includes(c.sourceRelease)
      || typeof c.publisherNote!=='string' || !c.id || c.targetRanges.some(r=>(address(r.start).book.order<39)===(address(c.sourceRanges[0].start).book.order<39)))
    || new Set(data.connections.map(c=>c.id)).size!==data.connections.length
    || typeof data.coverage!=='string')
    throw Error('NT/OT connections data is incomplete.');
  return data;
}

export const supplementRelease='msb-testament-connections-2026-10-07-v1';
export function connectionPairKey(c:TestamentConnection){return [JSON.stringify(c.sourceRanges),JSON.stringify(c.targetRanges)].sort().join('|');}
export async function loadConnectionCatalog(){
 const base=await loadConnections(),r=await fetch(`/connections/${supplementRelease}/index.json`);if(!r.ok)throw Error('MSB connection source unavailable');const supplement=await r.json() as ConnectionIndex;
 if(supplement.releaseId!==supplementRelease||supplement.connections.length!==698||supplement.connections.some(c=>c.sourceEdition!=='MSB'||!['msb-ot-2026-10-07-v1','msb-2026-09-05-m2-v2'].includes(c.sourceRelease)||c.kind!=='publisher-cross-reference'||!c.noteId||!c.publisherNote||[...c.sourceRanges,...c.targetRanges].some(r=>compare(r.start,r.end)>0)||c.targetRanges.some(r=>(address(r.start).book.order<39)===(address(c.sourceRanges[0].start).book.order<39))))throw Error('MSB connection inventory mismatch');
 const hr=await fetch('/connections/publisher-heading-connections-2026-10-07-v2/index.json');if(!hr.ok)throw Error('Publisher heading references unavailable');const headings=await hr.json() as ConnectionIndex;if(headings.releaseId!=='publisher-heading-connections-2026-10-07-v2'||headings.connections.length!==552||headings.connections.some(c=>c.kind!=='publisher-heading-reference'||!['BSB','MSB'].includes(c.sourceEdition)||!['bsb-ot-2026-10-07-v1','msb-ot-2026-10-07-v1','bsb-2026-09-05-m2-v1','msb-2026-09-05-m2-v2'].includes(c.sourceRelease)||!c.originalReference?.loc||!c.sourceRanges.length||!c.targetRanges.length||c.targetRanges.some(r=>(address(r.start).book.order<39)===(address(c.sourceRanges[0].start).book.order<39))))throw Error('Publisher heading inventory mismatch');return {...base,connections:[...base.connections,...supplement.connections,...headings.connections]};
}
