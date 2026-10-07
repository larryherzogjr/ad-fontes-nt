import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getAnalysis, getOccurrences, highlightOccurrences } from '../app/lib/domain/greek.ts';
import { resolveReference } from '../app/lib/domain/references.ts';
import { resolveLookup } from '../app/lib/domain/lexical.ts';
import { describeLxxMorph, lxxRelease, loadLxx } from '../app/lib/domain/lxx.ts';
const original = globalThis.fetch;
globalThis.fetch = async input => {
  assert.equal(typeof input, 'string');
  assert.ok((input as string).startsWith('/analysis/'));
  return new Response(await readFile('app/public'+input, 'utf8'), {status:200});
};
test.after(() => { globalThis.fetch = original; });
test('LXX Greek surfaces, raw grammar, exact glosses and repeated token offsets are preserved', async () => {
  const data = await getAnalysis(resolveReference('Genesis 1:1'));
  assert.equal(data.length,1);
  assert.equal(data[0].sourceLabel, 'Gen 1:1 (LXX)');
  assert.equal(data[0].text, 'ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν');
  assert.equal(data[0].tokens[1].form,'fem dat sg');
  assert.equal(describeLxxMorph('fem dat sg'),'feminine · dative · singular');
  assert.equal(describeLxxMorph('unknown'), 'unknown');
  assert.equal(data[0].tokens[0].gloss,'in');
  const token = data[0].tokens.find(t=>t.lemma==='θεός')!;
  const occurrences = await getOccurrences(token.lemmaId);
  assert.equal(occurrences.releaseId,lxxRelease);
  const selected = occurrences.hits.filter(h => h.sourceRef === data[0].sourceRef);
  const highlighted = await highlightOccurrences(selected);
  assert.equal(highlighted[0].text.slice(highlighted[0].start,highlighted[0].end),token.surface);
  const lookup=JSON.parse(await readFile('app/public/lexical/dodson-2010-v5/lookup.json','utf8'));
  assert.ok(resolveLookup(lookup,token).links.length > 0, 'An existing OM study is linked by verified lemma');
});
test('Psalms, reordered Jeremiah and combined Esdras use source correspondences rather than guessed numbering', async () => {
  const ps=await getAnalysis(resolveReference('Psalm 23:1'));
  assert.ok(ps.some(s=>s.sourceLabel==='Ps 22:1 (LXX)'));
  assert.ok(ps.every(s=>s.anchors.includes('PSA.23.1')));
  const jer=await getAnalysis(resolveReference('Jeremiah 31:31'));
  assert.ok(jer.some(s=>s.sourceRef==='jeremiah-lxx/38:31'));
  assert.ok((await getAnalysis(resolveReference('Nehemiah 1:1'))).some(s=>s.sourceRef.startsWith('2-esdras/')));
  assert.ok((await getAnalysis(resolveReference('Joshua 1:1'))).some(s=>s.status==='available' && s.sourceRef.startsWith('joshua-vaticanus-b/')));
  await assert.rejects(getAnalysis([{start:'MAL.4.6',end:'MAT.1.1'}]), /one Testament/);
});
test('unmatched glosses and unpaired source verses remain explicit and preserved', async () => {
  const manifest = await loadLxx<{counts:{exactGlossVerses:number;unmatchedGlossVerses:number;unpairedSourceVerses:number}}>('manifest.json');
  assert.equal(manifest.counts.unmatchedGlossVerses,19);
  assert.equal(manifest.counts.unpairedSourceVerses,342);
  const data=await loadLxx<{segments: {anchors:string[]; text:string; tokens:unknown[]}[]}>('unpaired.json');
  assert.equal(data.segments.length,342);
  assert.ok(data.segments.every(s=>s.anchors.length===0 && s.text && s.tokens.length));
});

test('missing and corrupt Greek files report unavailable data and can retry safely', async () => {
  const saved = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({releaseId:lxxRelease,segments:[]}), {status:200});
    await assert.rejects(loadLxx('MAL/4.json'), /incomplete or invalid/);
    globalThis.fetch = async () => new Response(JSON.stringify({releaseId:'wrong',segments:[]}), {status:200});
    await assert.rejects(loadLxx('MAL/4.json'), /release mismatch/);
    globalThis.fetch = async () => new Response('', {status:404});
    await assert.rejects(loadLxx('MAL/4.json'), /could not be loaded/);
  } finally { globalThis.fetch = saved; }
  assert.ok((await getAnalysis(resolveReference('Malachi 4:1'))).some(s=>s.status==='available'));
  const missing = await getAnalysis(resolveReference('Genesis 31:51'));
  assert.equal(missing[0].status,'unavailable');
  assert.match(missing[0].reason!,/does not indicate textual absence/);
});
