import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolveLookup, type LookupBundle } from '../app/lib/domain/lexical.ts';
const data = JSON.parse(readFileSync('app/public/lexical/dodson-2010-v2/lookup.json', 'utf8')) as LookupBundle;
test('Dodson reproduces pinned source and output checksums offline', () => {
  execFileSync('python3', ['scripts/import_lexicon.py']);
  const manifest = JSON.parse(readFileSync('sources/dodson/manifest-v2.json', 'utf8'));
  for (const [path, hash] of Object.entries(manifest.artifacts)) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), hash);
  assert.equal(createHash('sha256').update(readFileSync('app/public/lexical/dodson-2010-v2/lookup.json')).digest('hex'), manifest.outputSha256);
});
test('Lexicon requires headword and source number, preserves accent distinctions and rejects ambiguity', () => {
  const logos = resolveLookup(data, { lemma: 'λόγος', strongs: '3056' });
  assert.equal(logos.definition?.headword, 'λόγος');
  assert.equal(logos.links[0]?.url, 'https://larryherzogjr.com/greek/logos/');
  assert.equal(resolveLookup(data, {lemma:'λόγος', strongs:'1234'}).definition, null);
  assert.equal(resolveLookup(data, {lemma:'λογος', strongs:'3056'}).definition, null);
  assert.equal(resolveLookup(data, {lemma:'nonexistent', strongs:'3056'}).links.length, 0);
  assert.ok(resolveLookup(data, {lemma:'εἰμί', strongs:'1510&5707'}).definition);
  const duplicate = structuredClone(data); duplicate.entries['λόγος'].push(duplicate.entries['λόγος'][0]);
  assert.equal(resolveLookup(duplicate, {lemma:'λόγος', strongs:'3056'}).definition, null);
});
test('Word Explorer targets preserve the published metadata and access labels', () => {
  const source = JSON.parse(readFileSync('sources/word-explorer/words-2026-09-06.json','utf8'));
  const links = Object.values(data.links).flat();
  assert.equal(links.length, source.length);
  for (const link of links) {
    const original = source.find((w: {url:string}) => w.url === link.url);
    assert.ok(original); assert.equal(link.headword, original.greek); assert.equal(link.access, original.access);
    assert.match(link.url, /^https:\/\/larryherzogjr\.com\/greek\/[a-z0-9-]+\/$/);
  }
});
test('September 6 update preserves all original definitions and links and adds 97 articles', () => {
  const original = JSON.parse(readFileSync('app/public/lexical/dodson-2010-v1/lookup.json', 'utf8')) as LookupBundle;
  assert.deepEqual(data.entries, original.entries);
  for (const [key, links] of Object.entries(original.links)) for (const link of links) assert.ok(data.links[key].some(next => next.url === link.url && next.headword === link.headword && next.access === link.access && next.title === link.title));
  assert.equal(Object.values(data.links).flat().length, 211);
  assert.equal(Object.values(data.links).flat().length - Object.values(original.links).flat().length, 97);
  assert.equal(resolveLookup(data, {lemma:'ἀλήθεια', strongs:'225'}).links[0].url, 'https://larryherzogjr.com/greek/aletheia/');
});
test('Explicit article-only headword variants reach the intended new studies', () => {
  for (const [lemma, slug] of [['δοῦλος (II)','doulos'],['ἔξεστι(ν)','exestin'],['σπλάγχνον','splanchna'],['στοιχεῖον','stoicheia'],['ζῳοποιέω','zoopoieo']]) {
    assert.equal(resolveLookup(data,{lemma,strongs:''}).links[0].url, `https://larryherzogjr.com/greek/${slug}/`);
    assert.equal(resolveLookup(data,{lemma,strongs:''}).definition, null);
  }
});
