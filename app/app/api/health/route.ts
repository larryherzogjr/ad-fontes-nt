import { database } from "@/server/db";
export async function GET() {
  try {
    if (process.env.DATABASE_URL) await database().query("SELECT 1");
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
