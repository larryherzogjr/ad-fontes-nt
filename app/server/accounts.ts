import { randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { database } from "./db.ts";
import {
  opaque,
  digest,
  origin,
  cookie,
  sessionToken,
  csrfValid,
  checkPassword,
  jsonBody,
} from "./security.ts";
export type Identity = { sub: string; email: string; name: string };
export type Session = {
  token_hash: string;
  user_id: string | null;
  pending_identity: Identity | null;
  csrf: string;
};
export const ready = () =>
  !!(
    process.env.DATABASE_URL &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    /^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/.test(process.env.REGISTRATION_PASSWORD_HASH || "")
  );
export function reply(value: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
export async function findSession(request: Request): Promise<Session | undefined> {
  const token = sessionToken(request);
  if (!/^[\w-]{43}$/.test(token)) return;
  return (
    await database().query(
      "SELECT token_hash,user_id,pending_identity,csrf FROM afnt_sessions WHERE token_hash=$1 AND expires_at>now()",
      [digest(token)],
    )
  ).rows[0];
}
async function newSession(userId: string | null = null, pending: Identity | null = null) {
  const token = opaque(),
    csrf = opaque(),
    seconds = userId ? 2592000 : 1800;
  await database().query("DELETE FROM afnt_sessions WHERE expires_at<now()");
  await database().query(
    "INSERT INTO afnt_sessions(token_hash,user_id,pending_identity,csrf,expires_at) VALUES($1,$2,$3,$4,now()+$5*interval '1 second')",
    [digest(token), userId, pending, csrf, seconds],
  );
  return { token, csrf, header: cookie(token, seconds) };
}
/** Called only after Google's signed ID token and nonce have been verified. No public identity-input endpoint. */
export async function completeIdentity(session: Session, identity: Identity) {
  const found = await database().query("SELECT id FROM afnt_users WHERE google_sub=$1", [
    identity.sub,
  ]);
  const fresh = await newSession(found.rows[0]?.id || null, found.rowCount ? null : identity);
  await database().query("DELETE FROM afnt_sessions WHERE token_hash=$1", [session.token_hash]);
  return fresh;
}
function google() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    origin() + "/api/account/callback",
  );
}
export async function handleAccount(request: Request): Promise<Response> {
  try {
    const path = new URL(request.url).pathname;
    if (path === "/api/account" && request.method === "GET") {
      if (!ready()) return reply({ enabled: false, user: null, pending: false });
      const session = await findSession(request);
      if (!session) {
        const fresh = await newSession();
        return reply({ enabled: true, user: null, pending: false, csrf: fresh.csrf }, 200, {
          "Set-Cookie": fresh.header,
        });
      }
      const user = session.user_id
        ? (
            await database().query("SELECT id,email,name FROM afnt_users WHERE id=$1", [
              session.user_id,
            ])
          ).rows[0]
        : null;
      return reply({
        enabled: true,
        user,
        pending: !!session.pending_identity,
        pendingEmail: session.pending_identity?.email,
        csrf: session.csrf,
      });
    }
    if (!ready())
      return reply(
        { error: "Account features are not configured yet. Reading remains available." },
        503,
      );
    const session = await findSession(request);
    if (!session) return reply({ error: "Sign in again to continue." }, 401);
    if (path === "/api/account/callback" && request.method === "GET") {
      const url = new URL(request.url),
        state = url.searchParams.get("state") || "",
        code = url.searchParams.get("code");
      const result = await database().query(
        "DELETE FROM afnt_oauth WHERE state_hash=$1 AND session_hash=$2 AND expires_at>now() RETURNING nonce,verifier",
        [digest(state), session.token_hash],
      );
      if (!code || !result.rows[0])
        return reply(
          {
            error: "Sign-in expired or could not be verified. Return to My account and try again.",
          },
          400,
        );
      const client = google(),
        { tokens } = await client.getToken({ code, codeVerifier: result.rows[0].verifier });
      if (!tokens.id_token) throw Error("Missing ID token");
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (
        !payload ||
        (payload as unknown as { nonce: string }).nonce !== result.rows[0].nonce ||
        !payload.sub ||
        !payload.email ||
        !payload.email_verified
      )
        throw Error("Invalid identity");
      const fresh = await completeIdentity(session, {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
      });
      return new Response(null, {
        status: 303,
        headers: {
          Location: origin() + "/account",
          "Set-Cookie": fresh.header,
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    if (request.method !== "POST") return reply({ error: "Not found" }, 404);
    if (!csrfValid(request, session.csrf))
      return reply({ error: "Request could not be verified. Reload and try again." }, 403);
    if (path === "/api/account/login") {
      const state = opaque(),
        nonce = opaque(),
        client = google();
      const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
      await database().query("DELETE FROM afnt_oauth WHERE session_hash=$1 OR expires_at<now()", [
        session.token_hash,
      ]);
      await database().query(
        "INSERT INTO afnt_oauth VALUES($1,$2,$3,$4,now()+interval '10 minutes')",
        [digest(state), session.token_hash, nonce, codeVerifier],
      );
      return reply({
        url: client.generateAuthUrl({
          scope: ["openid", "email", "profile"],
          state,
          nonce,
          code_challenge: codeChallenge,
          code_challenge_method: "S256" as never,
          prompt: "select_account",
        }),
      });
    }
    if (path === "/api/account/register") {
      if (session.user_id) return reply({ ok: true });
      if (!session.pending_identity) return reply({ error: "Sign in with Google first." }, 401);
      const identity = session.pending_identity;
      for (const [key, limit] of [
        [digest(identity.sub), 10],
        ["all", 200],
      ] as const) {
        const r = await database().query(
          `INSERT INTO afnt_registration_attempts VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN afnt_registration_attempts.window_start<now()-interval '1 hour' THEN 1 ELSE afnt_registration_attempts.attempts+1 END, window_start=CASE WHEN afnt_registration_attempts.window_start<now()-interval '1 hour' THEN now() ELSE afnt_registration_attempts.window_start END RETURNING attempts`,
          [key],
        );
        if (r.rows[0].attempts > limit)
          return reply({ error: "Too many registration attempts. Try again in an hour." }, 429);
      }
      let body;
      try {
        body = (await jsonBody(request)) as { password: unknown };
      } catch {
        return reply({ error: "Invalid registration request" }, 400);
      }
      if (!(await checkPassword(body?.password, process.env.REGISTRATION_PASSWORD_HASH)))
        return reply({ error: "The registration password is incorrect." }, 403);
      const r = await database().query(
        "INSERT INTO afnt_users(id,google_sub,email,name) VALUES($1,$2,$3,$4) ON CONFLICT(google_sub) DO UPDATE SET google_sub=EXCLUDED.google_sub RETURNING id",
        [randomUUID(), identity.sub, identity.email, identity.name],
      );
      const fresh = await newSession(r.rows[0].id);
      await database().query("DELETE FROM afnt_sessions WHERE token_hash=$1", [session.token_hash]);
      return reply({ ok: true }, 200, { "Set-Cookie": fresh.header });
    }
    if (path === "/api/account/logout") {
      await database().query("DELETE FROM afnt_sessions WHERE token_hash=$1", [session.token_hash]);
      return reply({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    return reply({ error: "Not found" }, 404);
  } catch {
    return reply({ error: "Account service is temporarily unavailable. Please try again." }, 503);
  }
}
