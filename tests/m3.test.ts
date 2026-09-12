import { transliterateGreek, dictionaryReading } from '../app/lib/domain/greek-reading.ts';
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createLocalAdapter } from "../app/lib/domain/corpus.ts";
import { resolveReference } from "../app/lib/domain/references.ts";
import {
  validateVariant,
  validatePublication,
  reviewPayload,
  type Variant,
} from "../app/lib/domain/variants.ts";
import { getAnalysis, getOccurrences, getLexicon, describeMorph, highlightOccurrences } from "../app/lib/domain/greek.ts";
const root = new URL("../", import.meta.url),
  read = async (p: string) => JSON.parse(await readFile(new URL(p, root), "utf8"));
const candidates: Variant[] = await read("content/editorial/variants.json");
const auditCandidates = await Promise.all([
  read("sources/om-studies/om-studies-2026-09-11-v6/evidence/CANDIDATE-MANIFEST.json"),
  read("sources/om-studies/om-studies-2026-09-11-v7/evidence/CANDIDATE-MANIFEST.json"),
]);
const auditReviewByUnit = new Map<string, {previousReviewPayloadSha256:string}>();
for (const candidate of auditCandidates) for (const row of candidate.comparisonReviewHashes) {
  if (!auditReviewByUnit.has(row.unitId)) auditReviewByUnit.set(row.unitId, row);
}
const applyAuditSignificance = (id: string, sourceObservation: string, interpretation: string) => {
  for (const change of auditCandidates.flatMap(candidate => candidate.comparisonChanges).filter((row: {unitId:string}) => row.unitId === id)) {
    if (!['sourceObservation','interpretation'].includes(change.field)) continue;
    const current = change.field === 'sourceObservation' ? sourceObservation : interpretation;
    assert.equal(current.split(change.old).length - 1, 1, `${change.id} ${id}`);
    if (change.field === 'sourceObservation') sourceObservation = sourceObservation.replace(change.old, change.new);
    else interpretation = interpretation.replace(change.old, change.new);
  }
  return {sourceObservation, interpretation};
};
const expectedContributionHash = (id: string, currentHash: string) =>
  (auditReviewByUnit.get(id) as {previousReviewPayloadSha256:string} | undefined)?.previousReviewPayloadSha256 ?? currentHash;
const adapters = new Map<string, ReturnType<typeof createLocalAdapter>>();
const adapter = (id: string) => {
  if (!adapters.has(id))
    adapters.set(
      id,
      createLocalAdapter((p) => read("app/public" + p), id),
    );
  return adapters.get(id)!;
};
const hash = (v: Variant) => createHash("sha256").update(reviewPayload(v)).digest("hex");
test("editorial candidates reconcile; only content with matching approval is shipped", async () => {
  assert(candidates.length > 0);
  const reviews = await read("content/editorial/reviews.json");
  const reviewerIds = new Set<string>((await read("content/editorial/reviewers.json")).map((r: {id: string}) => r.id));
  for (const v of candidates) {
    assert(reviewerIds.has(v.assignedReviewerId));
    await validateVariant(v, adapter);
    if (v.status === "approved")
      validatePublication(v, reviews, reviewerIds, hash(v));
    else assert.throws(() => validatePublication(v, reviews, reviewerIds, hash(v)));
  }
  assert.deepEqual((await read("app/public/editorial/variants.json")).units, candidates.filter((v) => v.status === "approved"));
});
test("reject changed quotations, orphan spans, stale release and false absence", async () => {
  for (const change of [
    (v: Variant) => {
      v.readings[0].spans[0].text += "!";
    },
    (v: Variant) => {
      v.readings[0].spans[0].segmentId = "GEN.1.1";
    },
    (v: Variant) => {
      v.readings[0].releaseId = "unknown";
    },
    (v: Variant) => {
      v.readings[0].state = "absent";
      v.readings[0].spans = [];
    },
  ]) {
    const v = structuredClone(candidates[0]);
    change(v);
    await assert.rejects(() => validateVariant(v, adapter));
  }
});
test("first approved note preserves corrected prose, source distinctions and citation integrity", async () => {
  const v = candidates.find(v => v.id === 'candidate-18')!;
  assert.equal(v.status, 'approved');
  assert.equal(v.byline, 'Ordinary Means');
  assert.equal(v.author, 'Larry Herzog Jr.');
  assert.match(v.significance!.interpretation, /hearing the gospel from Philip/);
  assert.doesNotMatch(v.significance!.interpretation, /for the first time/);
  assert.match(v.significance!.sourceObservation, /In BSB and MSB, the main text skips verse number 37/);
  assert.match(v.significance!.sourceObservation, /Boyd’s compilation draws on the Stephanus, Elzevir, and Scrivener editions \[C7\]/);
  assert.doesNotMatch(v.significance!.sourceObservation, /began with Erasmus in 1516/);
  assert.equal(v.readings.filter(r => r.state === 'absent').length, 5);
  assert.equal(v.attestations.length, 0);
  const invalid = structuredClone(v);
  invalid.explanationSources = invalid.explanationSources!.filter(c => c.id !== 'C6');
  await assert.rejects(() => validateVariant(invalid, adapter), /Unresolved explanation citation/);
  const modified = structuredClone(v);
  modified.explanationSources![0].locator += ' Changed';
  assert.throws(() => validatePublication(modified, [{unitId:v.id, reviewerId:v.assignedReviewerId, contentHash:hash(v), reviewedAt:'2026-09-05', decision:'approved'}], new Set([v.assignedReviewerId]), hash(modified)));
});
test("related notes and mixed ranges retain exact verse states", async () => {
  const published = (await read('app/public/editorial/variants.json')).units as Variant[];
  for (const id of ['candidate-02','candidate-03','candidate-06','candidate-07','candidate-08','candidate-18'])
    assert(published.some(v => v.id === id));
  for (const v of published) for (const id of v.relatedUnits || [])
    assert(published.some(other => other.id === id));
  assert.deepEqual(candidates.find(v => v.id === 'candidate-07')!.relatedUnits, ['candidate-08']);
  assert.deepEqual(candidates.find(v => v.id === 'candidate-08')!.relatedUnits, ['candidate-07']);
  for (const id of ['candidate-16','candidate-20']) {
    const unit = candidates.find(v => v.id === id)!;
    assert.equal(unit.status, 'approved');
    await validateVariant(unit, adapter);
    const bsb = unit.readings.find(r => r.editionId === 'BSB')!;
    assert.equal(bsb.state, 'mixed');
    assert.equal(bsb.coverage!.find(c => c.anchor === (id === 'candidate-16' ? 'JHN.5.4' : 'ACT.24.7'))!.textState, 'absent');
    const flattened = structuredClone(unit);
    flattened.readings.find(r => r.editionId === 'BSB')!.state = 'present';
    await assert.rejects(() => validateVariant(flattened, adapter), /Mixed range/);
    const wrong = structuredClone(unit);
    wrong.readings.find(r => r.editionId === 'BSB')!.coverage![1].textState = 'present';
    await assert.rejects(() => validateVariant(wrong, adapter), /coverage does not match/);
  }
  const nestle = candidates.find(v => v.id === 'candidate-16')!.readings.find(r => r.editionId === 'N1904')!;
  assert.equal(nestle.state, 'mixed');
  assert.equal(nestle.coverage!.find(c => c.anchor === 'JHN.5.4')!.textState, 'bracketed');
  const updated = candidates.find(v => v.id === 'candidate-18')!;
  assert.match(updated.significance!.interpretation, /As Larry Herzog Jr. argues/);
  const prior = await read('content/editorial/contributions/history/candidate-18-rev2-corrected-unit.json');
  const reviews = await read('content/editorial/reviews.json');
  assert.throws(() => validatePublication(prior, reviews, new Set(['larry-herzog-jr']), hash(prior)));
  assert.doesNotThrow(() => validatePublication(updated, reviews, new Set(['larry-herzog-jr']), hash(updated)));
});
test("batch source comparisons use the complete local NT and preserve punctuation", async () => {
  for (const id of ['BSB','BLB','MSB','YLT','N1904','RP2018','TR-BOYD']) {
    const a = adapter(id);
    const refrain = await a.getPassage(resolveReference('Mark 9:43-48'));
    const state = (verse: number) => refrain.coverage.find(c => c.anchor === `MRK.9.${verse}`)!.textState;
    assert.equal(state(44), state(46));
    for (const verse of [43,45,47,48]) assert.equal(state(verse), 'present');
    if (state(44) === 'present') {
      const text = (verse: number) => refrain.segments.find(s => s.sourceRef === `MRK.9.${verse}`)!.text;
      const words = (s: string) => s.replace(/[.;]+$/u, '');
      assert.equal(words(text(44)), words(text(48)));
      assert.equal(words(text(46)), words(text(48)));
      if (id === 'YLT') { assert(text(44).endsWith('.')); assert(text(48).endsWith(';')); }
    }
    for (const ref of ['Luke 19:10','Mark 4:9','Mark 4:23','Mark 9:29']) {
      const p = await a.getPassage(resolveReference(ref));
      assert(p.coverage.every(c => c.dataState === 'available' && c.textState === 'present'));
      assert(p.segments.length > 0);
    }
  }
});
test("approval is bound to exact content; rights and significance remain independent gates", () => {
  const v = structuredClone(candidates[0]);
  v.status = "approved";
  v.assignedReviewerId = "test-reviewer";
  v.author = "Test fixture only";
  v.rights = "cleared";
  v.significance = {
    sourceObservation: "Validation fixture only.",
    interpretation: "Validation fixture only.",
  };
  const r = {
    unitId: v.id,
    reviewerId: "test-reviewer",
    contentHash: hash(v),
    reviewedAt: "2026-09-05",
    decision: "approved" as const,
  };
  assert.doesNotThrow(() => validatePublication(v, [r], new Set(["test-reviewer"]), hash(v)));
  assert.throws(() => validatePublication(v, [r, { ...r, decision: "rejected", reviewedAt: "2026-09-06" }], new Set(["test-reviewer"]), hash(v)));
  v.title += " changed";
  assert.throws(() => validatePublication(v, [r], new Set(["test-reviewer"]), hash(v)));
  v.title = candidates[0].title;
  v.rights = "unresolved";
  assert.throws(() => validatePublication(v, [r], new Set(["test-reviewer"]), hash(v)));
});
test("Greek surface tokens, same-lemma occurrences, real dictionary and explicit mismatches", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (input) => {
    try {
      return new Response(await readFile(new URL("app/public" + String(input), root), "utf8"), {
        status: 200,
      });
    } catch {
      return new Response("", { status: 404 });
    }
  };
  try {
    const data = await getAnalysis(resolveReference("John 1:1"));
    assert.equal(data.length, 1);
    const s = data[0],
      t = s.tokens.find((t) => t.lemma.normalize("NFC") === "λόγος")!;
    assert(t);
    assert.equal(s.text.slice(t.start, t.end), t.surface);
    assert.equal(t.functional, "N-NSM");
    assert.equal(t.gloss, "Word");
    const o = await getOccurrences(t.lemmaId);
    assert(o.hits.length > 100);
    assert(o.hits.every((h) => h.tokenId.includes("!")));
    assert(o.hits.some((h) => h.sourceRef === "JHN.1.1"));
    const lex = await getLexicon(t.strongs);
    assert.equal(lex?.id, "G3056");
    assert(lex?.text.includes("something said"));
    assert.equal(lex?.transliteration, "lógos");
    assert.equal(lex?.pronunciation, "log'-os");
    const repeated = await highlightOccurrences(o.hits.filter(h => h.sourceRef === "JHN.1.1"));
    assert.equal(repeated.length, 3);
    assert.equal(new Set(repeated.map(h => h.start)).size, 3);
    for (const h of repeated) assert.equal(h.text.slice(h.start, h.end), h.surface);
    await assert.rejects(() => highlightOccurrences([{...o.hits[0], text: "changed"}]));
    await assert.rejects(() => highlightOccurrences([{...o.hits[0], tokenId: "JHN.1.1!999"}]));
    const mismatch = await getAnalysis(resolveReference("2 Thessalonians 2:13"));
    assert.equal(mismatch[0].status, "unavailable");
    assert.equal(mismatch[0].tokens.length, 0);
    assert.equal((await getAnalysis(resolveReference("Acts 8:37"))).length, 0);
    assert.throws(() => getOccurrences("bad-path"));
    assert.equal(await getLexicon("99999"), null);
  } finally {
    globalThis.fetch = original;
  }
});
test("readable morphology retains form/functional distinctions and unknown tags", () => {
  assert.equal(describeMorph("N-NSM"), "noun · nominative · singular · masculine");
  assert.equal(
    describeMorph("V-IAI-3S"),
    "verb · imperfect · active · indicative · 3rd person · singular",
  );
  assert.match(describeMorph("V-PEI-3S"), /middle or passive/);
  assert.match(describeMorph("UNRECOGNIZED"), /Unrecognized/);
});

test("Greek reading aids handle Unicode, breathings and inflected forms without changing text", () => {
  const examples = { 'Λόγος':'Logos', 'λόγου':'logou', 'ἀρχῇ':'archē', 'ἥμαρτον':'hēmarton', 'Θεῷ':'Theō', 'ἄγγελος':'angelos', 'ῥῆμα':'rhēma', 'υἱός':'huios', 'Ἅιδῃ':'Haidē', 'αἱρέσεων':'haireseōn', 'ὑϊκὸν':'hyikon' };
  for (const [greek, latin] of Object.entries(examples)) {
    assert.equal(transliterateGreek(greek), latin);
    assert.equal(transliterateGreek(greek.normalize('NFD')), latin);
  }
  assert.deepEqual(dictionaryReading('<entry/>'), {transliteration:null,pronunciation:null});
  assert.deepEqual(dictionaryReading('<greek translit="a&amp;b"/><pronunciation strongs="a&apos;-b"/>'), {transliteration:'a&b',pronunciation:"a'-b"});
});

test('batch-2 source checks distinguish full verses, note types and edition-specific Amen', async () => {
  const ids = ['BSB', 'BLB', 'MSB', 'YLT', 'N1904', 'RP2018', 'TR-BOYD'];
  for (const id of ids) {
    for (const ref of ['MRK.11.26', 'MRK.15.28', 'LUK.23.17', 'ACT.28.29', 'ROM.16.24']) {
      const result = await adapter(id).getPassage(resolveReference(ref));
      assert.equal(result.coverage[0].textState, ['BSB', 'BLB', 'N1904'].includes(id) ? 'absent' : 'present');
      assert.equal(result.coverage[0].dataState, 'available');
    }
    for (const ref of ['MAT.6.15', 'MRK.15.6', 'LUK.22.37', 'ACT.28.28', 'ACT.28.30', 'ROM.16.20']) {
      const result = await adapter(id).getPassage(resolveReference(ref));
      assert.equal(result.coverage[0].textState, 'present');
      assert(result.segments.length);
    }
  }
  const mattNotes = await adapter('MSB').getPublisherNotes('MAT', 6);
  assert.deepEqual(mattNotes.filter(n => n.anchor === 'MAT.6.15').map(n => n.id), ['MAT.6.15.note.67', 'MAT.6.15.note.68']);
  for (const id of ['BSB', 'MSB']) {
    const markNotes = await adapter(id).getPublisherNotes('MRK', 15);
    assert.match(markNotes.find(n => n.anchor === 'MRK.15.6')!.body, /Literally/);
    const actsNotes = await adapter(id).getPublisherNotes('ACT', 28);
    const note = actsNotes.find(n => n.id === (id === 'BSB' ? 'ACT.28.note.156' : 'ACT.28.29.note.406'))!;
    assert(note); assert.doesNotMatch(note.body, /see /i);
  }
  for (const id of ['RP2018', 'TR-BOYD']) {
    const verse = async (ref: string) => (await adapter(id).getPassage(resolveReference(ref))).segments[0].text;
    const clause = 'Καὶ μετὰ ἀνόμων ἐλογίσθη';
    assert((await verse('LUK.22.37')).includes(clause));
    assert((await verse('MRK.15.28')).includes(clause));
    assert((await verse('ROM.16.24')).includes('πάντων'));
    assert.equal((await verse('ROM.16.20')).includes('Ἀμήν'), id === 'TR-BOYD');
  }
});

test('publisher note labels require exact release, identity, anchor and source body', async () => {
  const { publisherNoteType } = await import('../app/lib/domain/publisher-note-types.ts');
  const annotations = await read('app/lib/domain/publisher-note-types.json');
  for (const entry of annotations) {
    const [book, chapter] = entry.anchor.split('.');
    const source = await read(`app/public/corpus/${entry.releaseId}/${book}/${chapter}.json`);
    const note = source.notes.find(n => n.id === entry.noteId);
    const before = JSON.stringify(note);
    assert.equal(publisherNoteType(entry.releaseId, note)?.label, entry.label);
    assert.equal(JSON.stringify(note), before);
    assert.equal(publisherNoteType('a-different-release', note), undefined);
    for (const field of ['id', 'anchor', 'body']) {
      assert.equal(publisherNoteType(entry.releaseId, {...note, [field]: note[field] + '!'}), undefined);
    }
  }
  const notes = await adapter('BSB').getPublisherNotes('MRK', 15);
  assert.equal(publisherNoteType(adapter('BSB').releaseId, notes.find(n => n.id === 'MRK.15.note.117')!)?.label, 'Rendering alternative');
  assert.equal(publisherNoteType(adapter('BSB').releaseId, notes.find(n => n.id === 'MRK.15.note.118')!)?.label, 'Textual note');
});

test('reviewed partial-verse units preserve continuous source spans and unchanged verse coverage', async () => {
  for (const id of ['candidate-16', 'candidate-20']) {
    const v = candidates.find(v => v.id === id)!;
    await validateVariant(v, adapter);
    for (const r of v.readings) {
      assert(r.focus);
      if (r.focus.state === 'absent') { assert.equal(r.focus.spans.length, 0); continue; }
      assert(r.focus.spans[0].start > 0);
      assert.equal(r.focus.spans.length, id === 'candidate-16' ? 2 : 3);
      if (id === 'candidate-20') {
        const last = r.focus.spans.at(-1)!;
        const p = await adapter(r.editionId).getPassage(v.ranges);
        assert(last.end < p.segments.find(s => s.id === last.segmentId)!.text.length);
      }
    }
    for (const edit of [
      (v: Variant) => { v.readings.find(r => r.editionId === 'TR-BOYD')!.focus!.spans.reverse(); },
      (v: Variant) => { v.readings.find(r => r.editionId === 'TR-BOYD')!.focus!.spans[0].text += '!'; },
      (v: Variant) => { v.readings.find(r => r.editionId === 'TR-BOYD')!.focus!.spans[0].end -= 1; },
    ]) {
      const changed = structuredClone(v); edit(changed); await assert.rejects(() => validateVariant(changed, adapter));
    }
  }
  const nestle = candidates.find(v => v.id === 'candidate-16')!.readings.find(r => r.editionId === 'N1904')!;
  assert.equal(nestle.focus!.state, 'bracketed');
  assert(nestle.focus!.spans[0].text.startsWith('<'));
  assert(nestle.focus!.spans[1].text.includes('>'));
  assert.equal(nestle.coverage![0].textState, 'present');
});

test('batch 3 edition exceptions, doxology wording and reciprocal approved links reconcile', async () => {
  for (const id of ['BSB','BLB','MSB','YLT','N1904','RP2018','TR-BOYD']) {
    for (const ref of ['LUK.17.36','ACT.15.34','ACT.24.7']) {
      const p = await adapter(id).getPassage(resolveReference(ref));
      assert.equal(p.coverage[0].textState, ['YLT','TR-BOYD'].includes(id) ? 'present' : 'absent');
    }
    for (const ref of ['LUK.17.35','LUK.17.37','MAT.24.40','JHN.5.7','JHN.5.8','JHN.5.9','ACT.15.40','ROM.15.1']) {
      const p = await adapter(id).getPassage(resolveReference(ref)); assert.equal(p.coverage[0].textState,'present');
    }
    const p = await adapter(id).getPassage(resolveReference('ROM.16.25-27'));
    assert.equal(p.segments.length,3);
    assert(p.coverage.every(c=>c.textState === (['MSB','RP2018'].includes(id)?'relocated':'present')));
  }
  const n = await adapter('N1904').getPassage(resolveReference('ROM.16.27'));
  const rp = await adapter('RP2018').getPassage(resolveReference('ROM.16.27'));
  assert(n.segments[0].text.includes('τῶν αἰώνων')); assert(!rp.segments[0].text.includes('τῶν αἰώνων'));
  for (const [a,b] of [['candidate-07','candidate-08'],['candidate-12','candidate-23'],['candidate-23','candidate-24']]) {
    assert(candidates.find(v=>v.id===a)!.relatedUnits!.includes(b));
    assert(candidates.find(v=>v.id===b)!.relatedUnits!.includes(a));
  }
});

test('batch 4 distinguishes partial-verse markers, inclusion, English renderings and Greek readings', async () => {
  for (const id of ['BSB','BLB','MSB','YLT','N1904','RP2018','TR-BOYD']) {
    for (const ref of ['MAT.6.13','MRK.1.1','MRK.1.11','MRK.15.39','LUK.22.39-53','ROM.5.1','1CO.13.3']) {
      const p = await adapter(id).getPassage(resolveReference(ref));
      assert(p.coverage.every(c => c.dataState === 'available' && c.textState === 'present'));
    }
  }
  const matt = candidates.find(v => v.id === 'candidate-01')!;
  for (const r of matt.readings) {
    assert.equal(r.state, 'present');
    assert.equal(r.focus!.state, ['BSB','BLB','N1904'].includes(r.editionId) ? 'absent' : 'present');
    if (r.focus!.state === 'present') assert(r.focus!.spans[0].start > 0);
  }
  const mark = candidates.find(v => v.id === 'candidate-05')!;
  const n = mark.readings.find(r => r.editionId === 'N1904')!;
  assert.equal(n.state, 'present'); assert.equal(n.focus!.state, 'bracketed');
  assert.equal(n.focus!.spans[0].text, '<Υἱοῦ Θεοῦ>');
  await validateVariant(mark, adapter);
  const bad = structuredClone(mark);
  bad.readings.find(r => r.editionId === 'BSB')!.focus!.state = 'bracketed';
  await assert.rejects(() => validateVariant(bad, adapter), /bracket claim/);
  const verse = async (id: string, ref: string) => (await adapter(id).getPassage(resolveReference(ref))).segments[0].text;
  assert((await verse('N1904','LUK.22.44')).includes('καὶ ἐγένετο'));
  assert((await verse('RP2018','LUK.22.44')).includes('Ἐγένετο δὲ'));
  for (const id of ['N1904','RP2018','TR-BOYD']) {
    assert((await verse(id,'ROM.5.1')).includes(id === 'N1904' ? 'ἔχωμεν' : 'ἔχομεν'));
    const text = await verse(id,'1CO.13.3');
    assert(text.includes(id === 'N1904' ? 'καυθήσομαι' : 'καυθήσωμαι'));
    assert(!text.includes('καυχήσωμαι'));
  }
});

test('publisher-note studies remain separate from comparisons and bind exact publisher evidence', async () => {
  const { selectStudyUnits } = await import('../app/lib/domain/variants.ts');
  const note = candidates.find(v => v.id === 'candidate-13')!;
  const other = candidates.find(v => v.id === 'candidate-14')!;
  assert.equal(note.presentation, 'publisher-note');
  assert.equal(note.publisherNotes!.length, 2);
  for (const notesMode of [false,true]) {
    const result = selectStudyUnits([other,note],note.id,notesMode);
    assert.equal(result.noteOnly,true); assert.deepEqual(result.selected,[note]);
  }
  assert.equal(selectStudyUnits([note],null,false).noteOnly,true);
  const mixed = selectStudyUnits([other,note],null,false);
  assert.equal(mixed.noteOnly,false); assert.deepEqual(mixed.selected,[other]); assert.deepEqual(mixed.noteLinks,[note]);
  assert.throws(() => selectStudyUnits([other],other.id,true));
  assert.throws(() => selectStudyUnits([other],note.id,false));
  await validateVariant(note,adapter);
  for (const field of ['body','releaseId','noteId']) {
    const bad = structuredClone(note); bad.publisherNotes![0][field] += '!';
    await assert.rejects(() => validateVariant(bad,adapter));
  }
  const bad = structuredClone(note); bad.publisherNotes=[];
  await assert.rejects(() => validateVariant(bad,adapter));
  const notice = candidates.find(v => v.id === 'candidate-25')!;
  const changed = structuredClone(notice); changed.comparisonNotice += '!';
  assert.notEqual(hash(changed),hash(notice));
});

test('batch 5 reconciles YLT scroll, Greek word order, joined numbering and separate publisher matters', async () => {
  const verse = async (id: string, ref: string) => (await adapter(id).getPassage(resolveReference(ref))).segments.map(s=>s.text).join(' ');
  for (const id of ['BSB','BLB','MSB','YLT','N1904','RP2018','TR-BOYD']) {
    const rev = await verse(id,'REV.22.19');
    assert(rev.includes(id === 'YLT' ? 'scroll of the life' : id === 'TR-BOYD' ? 'Βίβλου τῆς ζωῆς' : ['N1904','RP2018'].includes(id) ? 'ξύλου τῆς ζωῆς' : 'tree of life'));
    const cor = await adapter(id).getPassage(resolveReference('2CO.13.12-14'));
    assert.equal(cor.segments.length,id === 'N1904' ? 2 : 3);
    assert.equal(/Amen|Ἀμήν/.test(cor.segments.at(-1)!.text),['MSB','YLT','RP2018','TR-BOYD'].includes(id));
    const john = await adapter(id).getPassage(resolveReference('3JN.1.14-15'));
    assert.equal(john.segments.length,id === 'N1904' ? 2 : 1);
    assert(john.coverage.every(c=>c.dataState==='available' && c.textState==='present'));
  }
  assert((await verse('YLT','1TI.3.16')).includes('God was manifested'));
  assert((await verse('N1904','3JN.1.14')).includes('σε ἰδεῖν'));
  for (const id of ['RP2018','TR-BOYD']) assert((await verse(id,'3JN.1.14')).includes('ἰδεῖν σε'));
  const n = await adapter('N1904').getPassage(resolveReference('2CO.13.14'));
  assert.equal(n.segments[0].id,'2CO.13.13');
  const notes = await adapter('MSB').getPublisherNotes('2CO',13);
  assert.equal(notes.find(n=>n.id==='2CO.13.14.note.88')!.body,'13:14 F35 our');
  assert.match(notes.find(n=>n.id==='2CO.13.14.note.89')!.body,/numbering.*Amen/);
});

test('batch 5 public prose matches returned A-C plus exact approved corrections and reciprocal links', async () => {
  const dir='docs/editorial-review/returns/2026-09-05/batch-5/';
  const corrections=await read(dir+'proposed-corrections.json');
  for (const id of ['candidate-15','candidate-26','candidate-28','candidate-29','candidate-30']) {
    const returned=await readFile(new URL(dir+id+'-RETURNED-2026-09-05.md',root),'utf8');
    const section=(letter:string)=>returned.match(new RegExp('### '+letter+'\\. .*?\\n([\\s\\S]*?)(?=\\n### )'))![1].trim();
    const v=candidates.find(v=>v.id===id)!;
    assert.equal(v.title,section('A').replace(/^\*\*|\*\*$/g,''));
    let b=section('B'),c=section('C');
    for (const [old,replacement] of corrections[id]) {
      assert.equal(Number(b.includes(old))+Number(c.includes(old)),1);
      b=b.replace(old,replacement);c=c.replace(old,replacement);
    }
    assert.deepEqual(v.significance,applyAuditSignificance(id,b,c));
    assert.equal(v.status,'approved');
    assert.equal(v.attestations.length,0);
    const contribution=await read('content/editorial/contributions/'+id+'.json');
    assert.equal(contribution.returnedSha256,createHash('sha256').update(returned).digest('hex'));
    assert.equal(contribution.approvedContentHash,expectedContributionHash(id,hash(v)));
  }
  for (const [a,b] of [['candidate-15','candidate-26'],['candidate-29','candidate-30']]) {
    assert(candidates.find(v=>v.id===a)!.relatedUnits!.includes(b));
    assert(candidates.find(v=>v.id===b)!.relatedUnits!.includes(a));
  }
  const account=candidates.find(v=>v.id==='candidate-26')!;
  assert(account.significance!.interpretation.includes('have not been independently checked for this note'));
  assert(!account.significance!.interpretation.includes('Bezae'));
  assert(account.explanationSources!.find(s=>s.id==='C7')!.locator.includes('Not independently verified'));
});

test('batch 6 public prose matches returned A-C plus exact approved corrections and reciprocal links', async () => {
  const dir='docs/editorial-review/returns/2026-09-05/batch-6/';
  const corrections=await read(dir+'proposed-corrections.json');
  for (const id of ['candidate-04','candidate-11','candidate-17','candidate-27']) {
    const returned=await readFile(new URL(dir+id+'-RETURNED-2026-09-05.md',root),'utf8');
    const section=(letter:string)=>returned.match(new RegExp('### '+letter+'\\. .*?\\n([\\s\\S]*?)(?=\\n### )'))![1].trim();
    const v=candidates.find(v=>v.id===id)!;
    assert.equal(v.title,section('A').replace(/^\*\*|\*\*$/g,''));
    let b=section('B'),c=section('C');
    for (const [old,replacement] of corrections[id] ?? []) {
      assert.equal(Number(b.includes(old))+Number(c.includes(old)),1);
      b=b.replace(old,replacement);c=c.replace(old,replacement);
    }
    assert.deepEqual(v.significance,applyAuditSignificance(id,b,c));
    assert.equal(v.status,'approved');
    assert.equal(v.attestations.length,0);
    const contribution=await read('content/editorial/contributions/'+id+'.json');
    assert.equal(contribution.returnedSha256,createHash('sha256').update(returned).digest('hex'));
    assert.equal(contribution.approvedContentHash,expectedContributionHash(id,hash(v)));
  }
  for (const id of ['candidate-04','candidate-12','candidate-23']) {
    for(const other of ['candidate-04','candidate-12','candidate-23'].filter(x=>x!==id))
      assert(candidates.find(v=>v.id===id)!.relatedUnits!.includes(other));
  }
  assert(candidates.find(v=>v.id==='candidate-23')!.relatedUnits!.includes('candidate-24'));
});

test('batch 6 preserves mixed Matthew coverage and paired cross-verse square-bracket focus', async () => {
  const m=candidates.find(v=>v.id==='candidate-04')!;
  assert.deepEqual(m.ranges,[{start:'MAT.23.13',end:'MAT.23.14'}]);
  for(const r of m.readings){
    assert.equal(r.coverage!.length,2);
    assert.equal(r.state,['BSB','BLB','N1904'].includes(r.editionId)?'mixed':'present');
  }
  const j=candidates.find(v=>v.id==='candidate-27')!;
  const y=j.readings.find(r=>r.editionId==='YLT')!;
  assert.equal(y.state,'present');assert.equal(y.focus!.state,'bracketed');
  assert.equal(y.focus!.spans.length,2);
  assert(y.focus!.spans[0].text.startsWith('['));assert(y.focus!.spans[1].text.endsWith(']'));
  for(const r of j.readings.filter(r=>!['YLT','TR-BOYD'].includes(r.editionId))){assert.equal(r.state,'present');assert.equal(r.focus!.state,'absent');}
  const bad=structuredClone(j),span=bad.readings.find(r=>r.editionId==='YLT')!.focus!.spans[1];
  span.end--;span.text=span.text.slice(0,-1);
  await assert.rejects(()=>validateVariant(bad,adapter),/bracket claim/);
});

test('batch 4 public prose matches returned A-C plus exact approved corrections and reciprocal links', async () => {
  const dir='docs/editorial-review/returns/2026-09-05/batch-4/';
  const corrections=await read(dir+'proposed-corrections.json');
  for (const id of ['candidate-05','candidate-13','candidate-22','candidate-25']) {
    const returned=await readFile(new URL(dir+id+'-RETURNED-2026-09-05.md',root),'utf8');
    const section=(letter:string)=>returned.match(new RegExp('### '+letter+'\\. .*?\\n([\\s\\S]*?)(?=\\n### )'))![1].trim();
    const v=candidates.find(v=>v.id===id)!;
    assert.equal(v.title,section('A').replace(/^\*\*|\*\*$/g,''));
    let b=section('B'),c=section('C');
    for (const [old,replacement] of corrections[id] ?? []) {
      assert.equal(Number(b.includes(old))+Number(c.includes(old)),1);
      b=b.replace(old,replacement).replace('editors ;','editors;');c=c.replace(old,replacement).replace('editors ;','editors;');
    }
    assert.deepEqual(v.significance,applyAuditSignificance(id,b,c));
    assert.equal(v.status,'approved');
    assert.equal(v.attestations.length,0);
    const contribution=await read('content/editorial/contributions/'+id+'.json');
    assert.equal(contribution.returnedSha256,createHash('sha256').update(returned).digest('hex'));
    assert.equal(contribution.approvedContentHash,expectedContributionHash(id,hash(v)));
  }
});

test('inline commentary routes all 30 units through source mappings or explicit absent-verse notices', async () => {
  const { reviewedAt, verseAnchors } = await import('../app/lib/domain/reviewed-markers.ts');
  for (const unit of candidates) {
    for (const reading of unit.readings) {
      const chapters = await adapter(reading.editionId).getReadingChapters(unit.ranges);
      const reachable = chapters.flatMap(ch => [
        ...ch.blocks.filter(b => !['publisher-heading','publisher-alternative'].includes(b.role)).flatMap(b => b.runs.filter(r=>r.verse).flatMap(r=>reviewedAt(candidates,verseAnchors(ch,r)))),
        ...ch.coverage.filter(c=>c.textState==='absent').flatMap(c=>reviewedAt(candidates,[c.anchor])),
      ]);
      assert(reachable.some(v=>v.id===unit.id),`${unit.id} ${reading.editionId}`);
    }
  }
  const cross = candidates.find(v=>v.id==='candidate-17')!;
  for (const ref of ['JHN.7.53','JHN.8.1','JHN.8.11']) assert(reviewedAt([cross],[ref]).includes(cross));
  assert.equal(reviewedAt([cross],['JHN.8.12']).length,0);
  assert.equal(reviewedAt([{...cross,status:'draft'}],['JHN.8.1']).length,0);
  const ch = await adapter('N1904').getChapter('3JN',1);
  const runs = ch.blocks.flatMap(b=>b.runs).filter(r=>r.verse);
  assert(runs.some(r=>verseAnchors(ch,r).includes('3JN.1.15')));
});
