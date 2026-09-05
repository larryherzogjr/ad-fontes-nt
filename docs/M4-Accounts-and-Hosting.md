# M4 account-backed notes and Ubuntu hosting

## Authorized change

The user chose account-backed notes before M4 implementation, replacing the earlier browser-local-only recommendation and bringing AFNT-101 into this slice. Reading/study remains public. Google establishes individual identity; a shared password is required **once at initial registration**, for identity-linked features. Returning admitted users use Google alone. Apps remain siloed: no NFL/Uno credentials, database, users, sessions or volumes are reused.

Host inspection used trusted `lherzog@larryherzogjr.com`: Ubuntu 24.04, Nginx, substantial free RAM/disk. NFL files configure PostgreSQL 16 with Docker Compose; both games use Authlib independently. Docker runtime inspection was denied without sudo. No remote configuration or service changed. Intended domain: `ad-fontes.app`; DNS resolved to 135.181.78.84 and port 8135 was free during the read-only check on 2026-09-05. Recheck before installation. TLS, dedicated Google credentials and privileged installation access remain prerequisites.

## Implementation

The existing Vinext reader now uses its Node runtime. Unused Cloudflare runtime packages were removed; the Sites metadata plugin and existing scaffold metadata remain. PostgreSQL, Google's official `google-auth-library`, and ordinary route handlers fit the existing TypeScript application. Corpus and Greek JSON remain immutable, separate from personal data.

Google authorization-code flow uses state bound to an opaque server-side browser session, PKCE and nonce. The official library verifies ID-token signature, issuer, expiry and audience; the callback additionally checks nonce, subject and verified email. Accounts are keyed by Google subject, never automatically linked by email. Only identity scopes are requested; Google access/refresh tokens are not stored. See [Google OIDC documentation](https://developers.google.com/identity/openid-connect/openid-connect).

New Google identities receive a temporary pending session without note access. A successful scrypt password check admits the account and rotates the session. Only a salted hash is configured; changing the password affects future registrations, not existing admissions. Attempts are limited per Google subject across sessions (10/hour), plus an application-wide cap (200/hour); Nginx adds an account-endpoint rate limit. Registration must remain closed if its hash/config is missing.

Production cookies are host-only, HttpOnly, Secure and SameSite=Lax; development HTTP cookies are allowed only for localhost/127.0.0.1. All account/note responses are no-store. Mutations check exact configured Origin and session CSRF. Sessions last 30 days for admitted users, 30 minutes before admission; logout deletes the session. No note body, registration password or session token enters passage links/public bundles. Server errors do not echo credentials or note text.

Notes carry owner, UUID, canonical ranges, title/body, optional verified edition/release quotation, version and timestamps. Every database access scopes ownership. Optimistic versions prevent stale updates/deletes from silently succeeding. Original drafts survive failed saves. Imports validate fully before an atomic transaction: identical IDs/content skip; differing same-ID content rejects the whole import. Imported ownership always comes from the current account. Export/import preserves ranges, original timestamps, version and quotation metadata. Plain text is rendered as text, not HTML.

Current limits: 1,000 notes/account, 8 MB compact JSON export, 10 MB import request, 50,000 characters per note body. A transactional per-account size check keeps exported files within the import limit. The UI makes the limits visible; quota errors preserve the draft. Export contains saved notes, not unsaved changes. The browser holds unsaved drafts only in memory and warns on leaving; no offline editing or background synchronization is claimed. Saved notes load from the server on another device, with explicit reload and conflict handling. Resources AFNT-024/025 still need a verified inventory.

## Isolated deployment files

`deployment/compose.yml` defines a dedicated PostgreSQL volume and internal database network, plus a Node app with outbound Google access and only `127.0.0.1:8135` exposed. The database has no host port. Initialization creates a non-superuser `afnt` database owner; no privileges over other applications. The Docker runtime runs as non-root with dropped capabilities. Production schema migrations are checksum-tracked and serialized; never edit an applied migration.

`deployment/nginx.conf` is a reviewable template, not an installed host change. It requires a certificate and DNS first; it omits request-query logging and restricts body sizes. Reuse the host's Nginx/TLS administration conventions. Check the proposed port before installing it.

`deployment/backup.sh` makes private-format PostgreSQL dumps with restrictive filesystem permissions. These backups contain private notes and identities. Keep encrypted off-host backups and the secret file separately; a persistent Docker volume alone is not a backup. Rehearse restoration into a separate database before admitting real users. Do not run a destructive restore against the live database.

## Google and secret setup

Create a **dedicated Web application OAuth client** in your Google Cloud project:

- Production origin: `https://ad-fontes.app`
- Production authorized redirect: `https://ad-fontes.app/api/account/callback`
- Optional local redirect: `http://localhost:3000/api/account/callback` (must exactly match the configured local APP_ORIGIN).
- Configure the consent screen, audience/test users as appropriate. The sign-in page requests only OpenID/email/profile. Review [Google setup requirements](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

From the project root run `python3 scripts/configure-hosting.py` interactively. It prompts for the dedicated client ID, hidden client secret and hidden registration password, generates isolated database passwords and writes ignored `deployment/.env` as mode 0600. It refuses to overwrite an existing file. Do not paste secrets into chat. Do not copy either game's secret file.

After reviewing and approving a host installation, copying the project and setting DNS/TLS:

```sh
cd deployment
docker compose --env-file .env -f compose.yml config --quiet
docker compose --env-file .env -f compose.yml build
docker compose --env-file .env -f compose.yml up -d
```

Do not run `docker compose config` without `--quiet` when sharing its output: it can print secrets. Run the first backup/restore rehearsal and a real Google registration/return-login test before opening access. Retain the preceding app image for rollback; never delete the database volume as part of an application rollback. No deployment is performed by these documents.

## Local verification setup

Use a separate PostgreSQL database named `afnt_m4_test`; the integration suite refuses any other database name and truncates **only that test database's Ad Fontes tables**. Supply DATABASE_URL through your local environment, then run `npm run migrate` and `npm run test:accounts`. The ordinary `npm test`, `npm run typecheck` and `npm run build` do not require a database or OAuth secrets.

Integration tests seed identities only inside the test database, through internal helpers; there is no fake-login route or authentication bypass in the application. These tests do not certify a live Google consent screen/callback. Live sign-in and actual-host Docker/Nginx/TLS verification remain separate checks requiring configuration/access.

## Local verification — 2026-09-05

- 36 Node test groups, 11 Python fidelity tests, TypeScript checking and production compilation passed. Frozen corpora and all 30 approved explanations reproduce.
- Four integration groups passed against disposable PostgreSQL 16: admission/return identity, owner isolation, CSRF, concurrent version conflicts, atomic imports, logout, browser-bound OAuth state/replay, registration throttling, exact quotation round trips and 1,000-note quota rejection.
- Production account page/API returned 200. Browser checks used a temporary external identity fixture, not real Google: registration, keyboard verse selection → My note, save with BSB quotation, reload/deep-link into YLT and reopening the note. Original BSB quotation/release remained intact. Both export controls were exercised. At 320px, fields were readable with no horizontal overflow. File-picker import/download-content QA remains open; API round trips passed.
- A PostgreSQL custom-format dump restored into a separate disposable database, including the browser-created note and quotation. The Compose backup script still needs container rehearsal.
- Compose configuration validation and shell/Python syntax checks passed. Docker build/run remains unverified: local daemon stopped, remote Docker needs privilege.
- Dependency updates removed the audit findings: npm reported zero vulnerabilities. This is not a security certification. Google's library is external in the Node build to avoid incorrect CommonJS bundling.

No host files/services changed. Real Google consent/token verification, HTTPS cookies through Nginx, container health/restart, privileged installation and off-host backups remain acceptance gates. Test identities are not production accounts. M4 is incomplete; AFNT-024/025 still need actual approved resources.

## Approved installation handoff

The user explicitly approved live installation after credential setup. The private source directory is `~/ad-fontes-nt` on `lherzog@larryherzogjr.com`. Run `bash deployment/install-host.sh` there interactively. It uses sudo prompts, never a stored sudo password; builds and health-checks the isolated Compose stack; creates a private backup and restores it into a uniquely named disposable database in that container; then obtains the domain certificate using webroot Certbot and installs only the dedicated Nginx site. The ACME webroot remains reachable for certificate renewals. Nginx is tested before reload; unexpected existing site configurations and port conflicts stop installation. Certbot may prompt for email/terms. No sudoers or Docker-group changes are needed.

The installation remains pending until that privileged command completes. Then verify real Google registration, return sign-in, private notes, HTTPS cookies and container restart behavior before M4 acceptance. The initial local backup is not an off-host backup.

### Live verification update

Initial installation reached certificate issuance and Nginx reload. The immediate HTTPS probe saw a transient hostname mismatch; subsequent host/external probes verified the correct certificate and HTTP 200. The installer now retries the final HTTPS health probe without weakening certificate validation. Live health, reader deep link, enabled account state and secure host-only session attributes passed. Real Google registration/return sign-in is still pending; the site is now publicly reachable.
