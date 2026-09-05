import { Pool } from "pg";
let pool: Pool | undefined;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("Account storage is not configured");
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 8,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
  }));
}
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
