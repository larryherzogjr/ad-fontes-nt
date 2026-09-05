import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createLocalAdapter, editions } from "../app/lib/domain/corpus.ts";
import { books, resolveReference, passageUrl } from "../app/lib/domain/references.ts";
const load = async (path: string) =>
  JSON.parse(await readFile(new URL("../app/public" + path, import.meta.url), "utf8"));
const corpus = (id: string) => createLocalAdapter(load, id);
test("all seven editions load every source chapter with complete, valid mapping targets", async () => {
  for (const e of editions) {
    const a = corpus(e.editionId);
    let count = 0;
    for (const b of books)
      for (let c = 1; c <= b.verses.length; c++) {
        const ch = await a.getChapter(b.code, c);
        count += ch.segments.length;
        assert.equal(ch.coverage.length, b.verses[c - 1]);
        for (const coverage of ch.coverage)
          for (const p of coverage.placements || []) {
            const target = await a.getChapter(p.book, p.chapter);
            assert(
              target.segments.some(
                (s) => s.id === p.segmentId && s.anchors.includes(coverage.anchor),
              ),
              `${e.editionId} ${coverage.anchor}`,
            );
          }
      }
    assert.equal(count, e.inventory.segments);
  }
});
test("real split, joined and renumbered source references preserve canonical passage", async () => {
  assert.equal(resolveReference("3 John 15")[0].start, "3JN.1.15");
  const bsb = await corpus("BSB").getPassage(resolveReference("3 John 15"));
  assert.equal(bsb.segments[0].sourceRef, "3JN.1.14");
  assert.equal(bsb.segments[0].mappingType, "join");
  const n = corpus("N1904");
  const greeting = await n.getPassage(resolveReference("3 John 15"));
  assert.equal(greeting.segments[0].sourceRef, "3JN.1.15");
  const joined = await n.getPassage(resolveReference("2 Corinthians 13:13"));
  assert.equal(joined.segments[0].sourceRef, "2CO.13.12");
  const renumbered = await n.getPassage(resolveReference("2 Corinthians 13:14"));
  assert.equal(renumbered.segments[0].sourceRef, "2CO.13.13");
  const split = await n.getPassage(resolveReference("Revelation 13:1"));
  assert.deepEqual(
    new Set(split.segments.map((s) => s.sourceRef)),
    new Set(["REV.12.18", "REV.13.1"]),
  );
  const acts = await n.getPassage(resolveReference("Acts 19:41"));
  assert.equal(acts.segments[0].sourceRef, "ACT.19.40");
  const url = passageUrl(resolveReference("John 7:53-8:11"), "TR-BOYD");
  assert(url.includes("translation=TR-BOYD"));
  assert(url.includes("JHN.7.53-JHN.8.11"));
});
test("Romans doxology placement works in both directions without missing or duplicated text", async () => {
  for (const id of ["MSB", "RP2018"]) {
    const a = corpus(id),
      r = await a.getPassage(resolveReference("Romans 16:25-27"));
    assert.deepEqual(
      r.segments.map((s) => s.sourceRef),
      ["ROM.14.24", "ROM.14.25", "ROM.14.26"],
    );
    assert(r.coverage.every((c) => c.textState === "relocated"));
    assert.deepEqual(
      (await a.getReadingChapters(resolveReference("Romans 16:25-27"))).map((c) => c.chapter),
      [16, 14],
    );
  }
  const b = await corpus("BSB").getPassage(resolveReference("Romans 14:24-26"));
  assert.deepEqual(
    b.segments.map((s) => s.sourceRef),
    ["ROM.16.25", "ROM.16.26", "ROM.16.27"],
  );
});
test("verified absences, full bracketed units and edition alternatives are distinct", async () => {
  for (const id of ["BLB", "MSB", "RP2018", "N1904"]) {
    const r = await corpus(id).getPassage(resolveReference("Acts 8:37"));
    assert.equal(r.coverage[0].textState, "absent");
    assert.equal(r.coverage[0].dataState, "available");
    assert.equal(r.segments.length, 0);
  }
  for (const id of ["YLT", "TR-BOYD"])
    assert.equal(
      (await corpus(id).getPassage(resolveReference("Acts 8:37"))).coverage[0].textState,
      "present",
    );
  const n = corpus("N1904");
  for (const ref of ["Mark 16:9-20", "John 7:53-8:11"])
    assert(
      (await n.getPassage(resolveReference(ref))).coverage.every(
        (c) => c.textState === "bracketed",
      ),
    );
  const mark = await n.getChapter("MRK", 16);
  assert(mark.blocks.some((b) => b.role === "publisher-alternative"));
  assert(!mark.segments.at(-1)!.text.includes("Πάντα δὲ"));
  const rp = await corpus("RP2018").getChapter("ACT", 24);
  assert.equal(rp.coverage[6].textState, "absent");
  assert(rp.alternatives?.some((a) => a.sourceRef === "ACT.24.7"));
});
test("selected English search, Greek capability and failed relocation loading are explicit", async () => {
  for (const id of ["BSB", "BLB", "MSB", "YLT"]) {
    const a = corpus(id),
      r = await a.searchText("grace", "ROM");
    assert(r.total > 0);
    assert(r.hits.every((h) => h.book === "ROM"));
    assert.equal((await a.searchText("zzzznonexistent")).total, 0);
  }
  await assert.rejects(() => corpus("RP2018").searchText("θεός"), {
    code: "unsupported-capability",
  });
  const failed = createLocalAdapter(async (path) => {
    if (path.endsWith("/ROM/14.json")) throw Error("missing");
    return load(path);
  }, "MSB");
  await assert.rejects(() => failed.getPassage(resolveReference("Romans 16:25")), {
    code: "unavailable-data",
  });
});
