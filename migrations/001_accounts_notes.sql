CREATE TABLE IF NOT EXISTS afnt_users (
 id uuid PRIMARY KEY, google_sub text UNIQUE NOT NULL, email text NOT NULL,
 name text NOT NULL, admitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS afnt_sessions (
 token_hash text PRIMARY KEY, user_id uuid REFERENCES afnt_users(id) ON DELETE CASCADE,
 pending_identity jsonb, csrf text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS afnt_sessions_expiry ON afnt_sessions(expires_at);
CREATE TABLE IF NOT EXISTS afnt_oauth (
 state_hash text PRIMARY KEY, session_hash text NOT NULL REFERENCES afnt_sessions(token_hash) ON DELETE CASCADE,
 nonce text NOT NULL, verifier text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS afnt_registration_attempts (
 key text PRIMARY KEY, attempts integer NOT NULL, window_start timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS afnt_notes (
 owner_id uuid NOT NULL REFERENCES afnt_users(id) ON DELETE CASCADE,
 id uuid NOT NULL, ranges jsonb NOT NULL, title text NOT NULL, body text NOT NULL,
 quotation jsonb, version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (owner_id,id)
);
CREATE INDEX IF NOT EXISTS afnt_notes_owner_updated ON afnt_notes(owner_id,updated_at DESC);
