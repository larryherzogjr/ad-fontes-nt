import test from "node:test";
import assert from "node:assert/strict";
import { noteInput, importNotes, notesOverlap } from "../app/lib/domain/notes.ts";
import { hashPassword, checkPassword, csrfValid } from "../app/server/security.ts";
const note = {
  id: "10000000-0000-4000-8000-000000000001",
  title: "A note",
  body: "<script>private text</script>",
  ranges: [{ start: "ROM.3.23", end: "ROM.3.24" }],
  quotation: null,
  version: 1,
  createdAt: "2026-09-05T00:00:00Z",
  updatedAt: "2026-09-05T00:00:00Z",
};
test("notes preserve plain text and canonical ranges; imports validate before mutation", () => {
  assert.equal(noteInput(note).body, note.body);
  assert(notesOverlap(note, [{ start: "ROM.3.24", end: "ROM.3.24" }]));
  assert(!notesOverlap(note, [{ start: "ROM.3.25", end: "ROM.3.25" }]));
  assert.throws(() => noteInput({ ...note, ranges: [{ start: "GEN.1.1", end: "GEN.1.2" }] }));
  assert.throws(() => importNotes({ schemaVersion: 1, notes: [note, note] }));
  assert.throws(() => importNotes({ schemaVersion: 2, notes: [note] }));
  assert.throws(() => importNotes({ schemaVersion: 1, notes: [{ ...note, updatedAt: "bad" }] }));
  assert.equal(importNotes({ schemaVersion: 1, notes: [note] })[0].body, note.body);
});
test("registration stores salted scrypt only; mutations require exact origin and session CSRF", async () => {
  const hash = await hashPassword("long sample registration password");
  assert(!hash.includes("sample"));
  assert(await checkPassword("long sample registration password", hash));
  assert(!(await checkPassword("incorrect", hash)));
  assert(!(await checkPassword("x", undefined)));
  process.env.APP_ORIGIN = "http://localhost:3000";
  assert(
    csrfValid(
      new Request("http://localhost:3000/api/notes", {
        headers: { Origin: "http://localhost:3000", "X-CSRF-Token": "secret" },
      }),
      "secret",
    ),
  );
  assert(
    !csrfValid(
      new Request("http://localhost:3000/api/notes", {
        headers: { Origin: "https://evil.example", "X-CSRF-Token": "secret" },
      }),
      "secret",
    ),
  );
});
