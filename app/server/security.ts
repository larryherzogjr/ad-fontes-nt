import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const opaque = () => randomBytes(32).toString("base64url");
export const digest = (s: string) => createHash("sha256").update(s).digest("hex");
export function origin() {
  const url = new URL(process.env.APP_ORIGIN || "http://localhost:3000");
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname))
  )
    throw Error("Invalid APP_ORIGIN");
  return url.origin;
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function checkPassword(password: unknown, stored: string | undefined) {
  if (
    typeof password !== "string" ||
    password.length > 512 ||
    !stored ||
    !/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/.test(stored)
  )
    return false;
  const [, salt, hex] = stored.split(":");
  return timingSafeEqual((await scrypt(password, salt, 64)) as Buffer, Buffer.from(hex, "hex"));
}
export const cookieName = () =>
  origin().startsWith("https:") ? "__Host-afnt_session" : "afnt_session";
export function cookie(token: string, seconds = 2592000) {
  return `${cookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${origin().startsWith("https:") ? "; Secure" : ""}`;
}
export function sessionToken(request: Request) {
  return (
    (request.headers.get("cookie") || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(cookieName() + "="))
      ?.slice(cookieName().length + 1) || ""
  );
}
export function csrfValid(request: Request, csrf: string) {
  return request.headers.get("origin") === origin() && request.headers.get("x-csrf-token") === csrf;
}
export async function jsonBody(request: Request, limit = 2_000_000): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw Error("JSON required");
  const reader = request.body?.getReader();
  if (!reader) throw Error("Empty body");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw Error("Request too large");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
