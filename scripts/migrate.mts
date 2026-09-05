import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { database, closeDatabase } from "../app/server/db.ts";
const db = await database().connect();
try {
  await db.query("SELECT pg_advisory_lock(74192831)");
  await db.query(
    "CREATE TABLE IF NOT EXISTS afnt_migrations(name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of (await readdir(new URL("../migrations/", import.meta.url)))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const sql = await readFile(new URL("../migrations/" + name, import.meta.url), "utf8"),
      hash = createHash("sha256").update(sql).digest("hex");
    const existing = await db.query("SELECT sha256 FROM afnt_migrations WHERE name=$1", [name]);
    if (existing.rowCount) {
      if (existing.rows[0].sha256 !== hash) throw Error("Applied migration was modified: " + name);
      continue;
    }
    await db.query("BEGIN");
    try {
      await db.query(sql);
      await db.query("INSERT INTO afnt_migrations(name,sha256) VALUES($1,$2)", [name, hash]);
      await db.query("COMMIT");
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
    console.log("Applied", name);
  }
} finally {
  await db.query("SELECT pg_advisory_unlock(74192831)");
  db.release();
  await closeDatabase();
}
