import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { database, closeDatabase } from "../app/server/db.ts";
import { handleAccount, completeIdentity, findSession } from "../app/server/accounts.ts";
import { handleNotes } from "../app/server/notes.ts";
import { hashPassword } from "../app/server/security.ts";
if (new URL(process.env.DATABASE_URL || "http://invalid").pathname !== "/afnt_m4_test")
  throw Error("Use a dedicated afnt_m4_test database.");
process.env.APP_ORIGIN = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client";
process.env.GOOGLE_CLIENT_SECRET = "test-secret";
process.env.REGISTRATION_PASSWORD_HASH = await hashPassword("correct registration test password");
process.chdir(new URL("../app/", import.meta.url).pathname);
await database().query(
  "TRUNCATE afnt_users,afnt_sessions,afnt_oauth,afnt_registration_attempts,afnt_notes CASCADE",
);
after(closeDatabase);
type Browser = { cookie: string; csrf: string };
const request = (
  path: string,
  b: Browser,
  method = "GET",
  data?: unknown,
  origin = "http://localhost:3000",
) =>
  new Request("http://localhost:3000" + path, {
    method,
    headers: {
      cookie: b.cookie,
      origin,
      "x-csrf-token": b.csrf,
      "content-type": "application/json",
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
async function account(b: Browser) {
  const r = await handleAccount(request("/api/account", b));
  if (r.headers.has("set-cookie")) b.cookie = r.headers.get("set-cookie")!.split(";")[0];
  const data = (await r.json()) as { csrf: string; user: unknown; pending: boolean };
  b.csrf = data.csrf;
  return data;
}
async function pending(sub: string) {
  const b = { cookie: "", csrf: "" };
  await account(b);
  const session = await findSession(request("/api/account", b));
  const fresh = await completeIdentity(session!, {
    sub,
    email: sub + "@example.test",
    name: "Test reader",
  });
  b.cookie = fresh.header.split(";")[0];
  await account(b);
  return b;
}
async function register(b: Browser) {
  const r = await handleAccount(
    request("/api/account/register", b, "POST", { password: "correct registration test password" }),
  );
  assert.equal(r.status, 200);
  b.cookie = r.headers.get("set-cookie")!.split(";")[0];
  await account(b);
}
const sample = () => ({
  id: randomUUID(),
  title: "My note",
  body: "Private <img src=x onerror=alert(1)>",
  ranges: [{ start: "ROM.3.23", end: "ROM.3.23" }],
  quotation: null,
});
test("registration, per-owner notes, conflicts, imports, logout and returning identity against real PostgreSQL", async () => {
  const a = await pending("reader-a");
  assert.equal((await handleNotes(request("/api/notes", a))).status, 401);
  assert.equal(
    (await handleAccount(request("/api/account/register", a, "POST", { password: "wrong" })))
      .status,
    403,
  );
  assert.equal(
    (
      await handleAccount(
        request(
          "/api/account/register",
          a,
          "POST",
          { password: "correct registration test password" },
          "https://evil.example",
        ),
      )
    ).status,
    403,
  );
  await register(a);
  assert((await account(a)).user);
  const b = await pending("reader-b");
  await register(b);
  const input = sample();
  let r = await handleNotes(request("/api/notes", a, "POST", input));
  assert.equal(r.status, 201);
  const saved = ((await r.json()) as { note: Record<string, unknown> }).note;
  assert.equal((await handleNotes(request("/api/notes", b))).status, 200);
  assert.equal(
    ((await (await handleNotes(request("/api/notes", b))).json()) as { notes: unknown[] }).notes
      .length,
    0,
  );
  for (const method of ["PUT", "DELETE"])
    assert.equal(
      (await handleNotes(request("/api/notes/" + input.id, b, method, { ...input, version: 1 })))
        .status,
      404,
    );
  assert.equal(
    (
      await handleNotes(
        request(
          "/api/notes/" + input.id,
          a,
          "PUT",
          { ...input, version: 1 },
          "https://evil.example",
        ),
      )
    ).status,
    403,
  );
  const edits = await Promise.all(
    ["one", "two"].map((body) =>
      handleNotes(request("/api/notes/" + input.id, a, "PUT", { ...input, body, version: 1 })),
    ),
  );
  assert.deepEqual(edits.map((r) => r.status).sort(), [200, 409]);
  const exported = (await (await handleNotes(request("/api/notes", a))).json()) as {
    schemaVersion: number;
    notes: Record<string, unknown>[];
  };
  assert.equal(exported.notes[0].version, 2);
  r = await handleNotes(request("/api/notes/import", a, "POST", exported));
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { skipped: number }).skipped, 1);
  const additional = { ...saved, id: randomUUID() },
    conflict = { ...exported.notes[0], body: "different" };
  assert.equal(
    (
      await handleNotes(
        request("/api/notes/import", a, "POST", {
          schemaVersion: 1,
          notes: [additional, conflict],
        }),
      )
    ).status,
    409,
  );
  assert.equal(
    ((await (await handleNotes(request("/api/notes", a))).json()) as { notes: unknown[] }).notes
      .length,
    1,
  );
  assert.equal(
    (
      await handleNotes(
        request("/api/notes/import", a, "POST", {
          schemaVersion: 1,
          notes: [{ ...saved, ranges: [{ start: "GEN.1.1", end: "GEN.1.1" }] }],
        }),
      )
    ).status,
    400,
  );
  assert.equal((await handleNotes(request("/api/notes/import", b, "POST", exported))).status, 200);
  assert.equal(
    (await handleNotes(request("/api/notes/" + input.id, b, "DELETE", { version: 2 }))).status,
    200,
  );
  assert.equal(
    ((await (await handleNotes(request("/api/notes", a))).json()) as { notes: unknown[] }).notes
      .length,
    1,
  );
  assert.equal(
    (await handleNotes(request("/api/notes/" + input.id, a, "DELETE", { version: 1 }))).status,
    409,
  );
  const stolen = { ...a };
  assert.equal((await handleAccount(request("/api/account/logout", a, "POST", {}))).status, 200);
  assert.equal((await handleNotes(request("/api/notes", stolen))).status, 401);
  const returning = await pending("reader-a");
  assert((await account(returning)).user);
  assert.equal((await account(returning)).pending, false);
  assert.equal(
    (await handleNotes(request("/api/notes/" + input.id, returning, "DELETE", { version: 2 })))
      .status,
    200,
  );
});
test("OAuth state binds the browser; invalid or replayed callback is rejected", async () => {
  const a = { cookie: "", csrf: "" };
  await account(a);
  const login = await handleAccount(request("/api/account/login", a, "POST", {}));
  assert.equal(login.status, 200);
  const url = new URL(((await login.json()) as { url: string }).url);
  assert.equal(url.hostname, "accounts.google.com");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert(url.searchParams.get("nonce"));
  const b = { cookie: "", csrf: "" };
  await account(b);
  assert.equal(
    (
      await handleAccount(
        request("/api/account/callback?state=" + url.searchParams.get("state"), b),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handleAccount(
        request("/api/account/callback?state=" + url.searchParams.get("state"), a),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handleAccount(
        request("/api/account/callback?state=" + url.searchParams.get("state"), a),
      )
    ).status,
    400,
  );
});

test("account deletion removes the identity, notes and sessions", async () => {
  const owner = await pending("delete-reader");
  await register(owner);
  const note = sample();
  assert.equal((await handleNotes(request("/api/notes", owner, "POST", note))).status, 201);
  const stolen = { ...owner };
  const deletion = await handleAccount(
    request("/api/account/delete", owner, "POST", {}),
  );
  assert.equal(deletion.status, 200);
  assert.match(deletion.headers.get("set-cookie") || "", /Max-Age=0/);
  assert.equal((await handleNotes(request("/api/notes", stolen))).status, 401);
  const counts = await database().query(
    `SELECT
       (SELECT count(*)::int FROM afnt_users WHERE google_sub='delete-reader') AS users,
       (SELECT count(*)::int FROM afnt_notes WHERE id=$1) AS notes`,
    [note.id],
  );
  assert.deepEqual(counts.rows[0], { users: 0, notes: 0 });
  const returning = await pending("delete-reader");
  const state = await account(returning);
  assert.equal(state.user, null);
  assert.equal(state.pending, true);
});
test("registration throttling survives a new session for the same Google identity", async () => {
  let b = await pending("rate-limited");
  for (let i = 0; i < 10; i++)
    assert.equal(
      (await handleAccount(request("/api/account/register", b, "POST", { password: "wrong" })))
        .status,
      403,
    );
  b = await pending("rate-limited");
  assert.equal(
    (
      await handleAccount(
        request("/api/account/register", b, "POST", {
          password: "correct registration test password",
        }),
      )
    ).status,
    429,
  );
});

test("source quotations survive export/import; altered text and account quota are rejected", async () => {
  const a = await pending("quotation-reader"), b = await pending("quotation-recipient");
  await register(a); await register(b);
  const { createLocalAdapter } = await import('../app/lib/domain/corpus.ts');
  const { readFile } = await import('node:fs/promises');
  const adapter = createLocalAdapter(async p => JSON.parse(await readFile('public' + p, 'utf8')), 'BSB');
  const ranges = [{ start: 'JHN.1.1', end: 'JHN.1.1' }];
  const passage = await adapter.getPassage(ranges);
  const input = { ...sample(), ranges, quotation: { editionId: 'BSB', releaseId: 'bsb-2026-09-05-m2-v1', text: passage.segments.map(s => s.text).join('\n') } };
  assert.equal((await handleNotes(request('/api/notes', a, 'POST', { ...input, quotation: { ...input.quotation, text: 'Altered source text' } }))).status, 400);
  assert.equal((await handleNotes(request('/api/notes', a, 'POST', input))).status, 201);
  const exported = await (await handleNotes(request('/api/notes', a))).json();
  assert.equal((await handleNotes(request('/api/notes/import', b, 'POST', exported))).status, 200);
  assert.deepEqual(await (await handleNotes(request('/api/notes', b))).json(), exported);
  const session = await findSession(request('/api/account', a));
  await database().query(`INSERT INTO afnt_notes(owner_id,id,ranges,title,body)
    SELECT $1,gen_random_uuid(),$2::jsonb,'Quota fixture','test' FROM generate_series(1,999)`, [session!.user_id, JSON.stringify(ranges)]);
  assert.equal((await handleNotes(request('/api/notes', a, 'POST', sample()))).status, 400);
  const count = await database().query('SELECT count(*)::int AS n FROM afnt_notes WHERE owner_id=$1', [session!.user_id]);
  assert.equal(count.rows[0].n, 1000);
});
