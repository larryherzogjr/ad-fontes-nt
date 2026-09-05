import type { PoolClient } from "pg";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { database } from "./db.ts";
import { findSession, reply } from "./accounts.ts";
import { csrfValid, jsonBody } from "./security.ts";
import { noteInput, importNotes, uuidPattern, type Note } from "../lib/domain/notes.ts";
import { createLocalAdapter } from "../lib/domain/corpus.ts";
const record = (r: Record<string, unknown>) => ({
  id: r.id,
  title: r.title,
  body: r.body,
  ranges: r.ranges,
  quotation: r.quotation,
  version: r.version,
  createdAt: (r.created_at as Date).toISOString(),
  updatedAt: (r.updated_at as Date).toISOString(),
});
async function fitsQuota(client: PoolClient, owner: string, changes: Note[]) {
  const rows = await client.query("SELECT * FROM afnt_notes WHERE owner_id=$1", [owner]);
  const map = new Map(rows.rows.map((r) => [r.id, record(r)]));
  for (const n of changes) map.set(n.id, n);
  return (
    map.size <= 1000 &&
    Buffer.byteLength(JSON.stringify({ schemaVersion: 1, notes: [...map.values()] }), "utf8") <=
      8_000_000
  );
}
const quotaRecord = (n: ReturnType<typeof noteInput>, version = 1): Note => ({
  ...n,
  version,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
async function checkQuote(note: ReturnType<typeof noteInput>) {
  if (!note.quotation) return;
  const adapter = createLocalAdapter(
    async (p) => JSON.parse(await readFile(resolve(process.cwd(), "public" + p), "utf8")),
    note.quotation.editionId,
  );
  const passage = await adapter.getPassage(note.ranges);
  if (passage.segments.map((s) => s.text).join("\n") !== note.quotation.text)
    throw Error("Quotation does not match the stored source passage");
}
export async function handleNotes(request: Request): Promise<Response> {
  try {
    const session = await findSession(request);
    if (!session?.user_id)
      return reply({ error: "An admitted account is required for private notes." }, 401);
    const owner = session.user_id,
      path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/api/notes") {
      const rows = await database().query(
        "SELECT * FROM afnt_notes WHERE owner_id=$1 ORDER BY updated_at DESC,id",
        [owner],
      );
      return reply({ schemaVersion: 1, notes: rows.rows.map(record) });
    }
    if (!csrfValid(request, session.csrf))
      return reply({ error: "Request could not be verified. Reload and try again." }, 403);
    let input: unknown;
    try {
      input = await jsonBody(request, 10_000_000);
    } catch {
      return reply({ error: "Invalid or oversized JSON request." }, 400);
    }
    if (path === "/api/notes/import" && request.method === "POST") {
      let notes: Note[];
      try {
        notes = importNotes(input);
        for (const n of notes) await checkQuote(n);
      } catch {
        return reply(
          {
            error:
              "Import is invalid or its quotations do not match the stored edition. No notes were changed.",
          },
          400,
        );
      }
      const client = await database().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT id FROM afnt_users WHERE id=$1 FOR UPDATE", [owner]);
        const existing = await client.query("SELECT * FROM afnt_notes WHERE owner_id=$1", [owner]);
        const map = new Map(existing.rows.map((r) => [r.id, record(r)]));
        const conflicts = notes
          .filter(
            (n) =>
              map.has(n.id) &&
              JSON.stringify(noteInput(map.get(n.id))) !== JSON.stringify(noteInput(n)),
          )
          .map((n) => n.id);
        if (conflicts.length) {
          await client.query("ROLLBACK");
          return reply(
            {
              error:
                "Some imported IDs already have different content. Nothing was changed; keep both exports and reconcile those notes.",
              conflicts,
            },
            409,
          );
        }
        const additions = notes.filter((n) => !map.has(n.id));
        if (!(await fitsQuota(client, owner, additions))) {
          await client.query("ROLLBACK");
          return reply(
            { error: "This account supports 1,000 notes and an 8 MB export. Nothing was changed." },
            400,
          );
        }
        for (const n of additions)
          await client.query(
            "INSERT INTO afnt_notes(owner_id,id,ranges,title,body,quotation,version,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
            [
              owner,
              n.id,
              JSON.stringify(n.ranges),
              n.title,
              n.body,
              n.quotation,
              n.version,
              n.createdAt,
              n.updatedAt,
            ],
          );
        await client.query("COMMIT");
        return reply({ imported: additions.length, skipped: notes.length - additions.length });
      } catch {
        await client.query("ROLLBACK");
        throw Error("Import failed");
      } finally {
        client.release();
      }
    }
    const n = input as Note;
    if (path === "/api/notes" && request.method === "POST") {
      let data;
      try {
        data = noteInput(n);
        await checkQuote(data);
      } catch {
        return reply({ error: "Invalid note or source quotation." }, 400);
      }
      const client = await database().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT id FROM afnt_users WHERE id=$1 FOR UPDATE", [owner]);
        if (!(await fitsQuota(client, owner, [quotaRecord(data)]))) {
          await client.query("ROLLBACK");
          return reply({ error: "This account supports 1,000 notes and an 8 MB export." }, 400);
        }
        const result = await client.query(
          "INSERT INTO afnt_notes(owner_id,id,ranges,title,body,quotation) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING RETURNING *",
          [owner, data.id, JSON.stringify(data.ranges), data.title, data.body, data.quotation],
        );
        await client.query("COMMIT");
        return result.rowCount
          ? reply({ note: record(result.rows[0]) }, 201)
          : reply(
              {
                error:
                  "This note ID already exists. Reload to check whether the earlier save succeeded.",
              },
              409,
            );
      } catch {
        await client.query("ROLLBACK");
        throw Error("Save failed");
      } finally {
        client.release();
      }
    }
    const id = path.slice("/api/notes/".length);
    if (!uuidPattern.test(id) || !["PUT", "DELETE"].includes(request.method))
      return reply({ error: "Not found" }, 404);
    if (!Number.isSafeInteger(n?.version) || n.version < 1)
      return reply({ error: "A current note version is required." }, 400);
    let result;
    if (request.method === "DELETE")
      result = await database().query(
        "DELETE FROM afnt_notes WHERE owner_id=$1 AND id=$2 AND version=$3 RETURNING id",
        [owner, id, n.version],
      );
    else {
      let data;
      try {
        data = noteInput({ ...n, id });
        await checkQuote(data);
      } catch {
        return reply({ error: "Invalid note or source quotation." }, 400);
      }
      const client = await database().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT id FROM afnt_users WHERE id=$1 FOR UPDATE", [owner]);
        if (!(await fitsQuota(client, owner, [quotaRecord(data, n.version + 1)]))) {
          await client.query("ROLLBACK");
          return reply(
            {
              error:
                "This account supports 1,000 notes and an 8 MB export. Your draft has been kept.",
            },
            400,
          );
        }
        result = await client.query(
          "UPDATE afnt_notes SET ranges=$1,title=$2,body=$3,quotation=$4,version=version+1,updated_at=now() WHERE owner_id=$5 AND id=$6 AND version=$7 RETURNING *",
          [
            JSON.stringify(data.ranges),
            data.title,
            data.body,
            data.quotation,
            owner,
            id,
            n.version,
          ],
        );
        await client.query("COMMIT");
      } catch {
        await client.query("ROLLBACK");
        throw Error("Update failed");
      } finally {
        client.release();
      }
    }
    if (!result.rowCount) {
      const exists = await database().query(
        "SELECT id FROM afnt_notes WHERE owner_id=$1 AND id=$2",
        [owner, id],
      );
      return reply(
        {
          error: exists.rowCount
            ? "This note changed on another device. Your draft is still here; reload saved notes before reconciling."
            : "Note not found.",
        },
        exists.rowCount ? 409 : 404,
      );
    }
    return reply(request.method === "DELETE" ? { ok: true } : { note: record(result.rows[0]) });
  } catch {
    return reply(
      {
        error:
          "Notes could not be saved or loaded. Your draft has not been discarded. Please try again.",
      },
      503,
    );
  }
}
