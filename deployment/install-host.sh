#!/usr/bin/env bash
# Run interactively on the Ubuntu host. Privileged commands use sudo, never stored passwords.
set -euo pipefail
cd "$(dirname "$0")"
if [[ $(id -u) == 0 ]]; then
  echo 'Run as lherzog, not root; this script prompts through sudo.' >&2
  exit 1
fi
[[ -f .env ]] || { echo 'Missing private deployment/.env' >&2; exit 1; }
chmod 600 .env
sudo -v
sudo nginx -t
compose=(sudo docker compose --env-file .env -f compose.yml)
"${compose[@]}" config --quiet
available=/etc/nginx/sites-available/ad-fontes.app
enabled=/etc/nginx/sites-enabled/ad-fontes.app
webroot=/var/www/ad-fontes-acme
bootstrap=$(mktemp)
trap 'rm -f "$bootstrap"' EXIT
cat > "$bootstrap" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name ad-fontes.app;
    access_log off;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/ad-fontes-acme;
    }
    location / { return 503; }
}
NGINX
# Do not replace an independently installed site or another domain's configuration.
if sudo test -e "$available"; then
  sudo cmp -s "$available" nginx.conf || sudo cmp -s "$available" "$bootstrap" || {
    echo 'An unexpected ad-fontes.app configuration exists. Stop for review.' >&2; exit 1;
  }
fi
if sudo test -e "$enabled" || sudo test -L "$enabled"; then
  [[ $(sudo readlink "$enabled") == "$available" ]] || { echo 'Unexpected enabled site; stop for review.' >&2; exit 1; }
fi
if sudo grep -rlE 'server_name[^;]*\bad-fontes\.app\b' /etc/nginx/sites-enabled/ | grep -vFx "$enabled"; then
  echo 'Another enabled site names ad-fontes.app; stop for review.' >&2; exit 1
fi
if ss -ltnH '( sport = :8135 )' | grep -q .; then
  [[ -n $("${compose[@]}" ps -q web) ]] || { echo 'Port 8135 is already occupied; stop for review.' >&2; exit 1; }
fi
"${compose[@]}" build
"${compose[@]}" up -d --wait --wait-timeout 180
curl --fail --silent --show-error http://127.0.0.1:8135/api/health
printf '\nApplication and database are healthy. Rehearsing backup restoration.\n'
umask 077
mkdir -p backups
backup="backups/adfontes-initial-$(date -u +%Y%m%dT%H%M%SZ).dump"
"${compose[@]}" exec -T db pg_dump -U afnt -d adfontes -Fc > "$backup.tmp"
mv "$backup.tmp" "$backup"
# A new, uniquely named database in this app's container only; no existing DB is overwritten.
restore_db="afnt_restore_$(date -u +%Y%m%d%H%M%S)_$$"
"${compose[@]}" exec -T db createdb -U postgres "$restore_db"
"${compose[@]}" exec -T db pg_restore -U postgres -d "$restore_db" --exit-on-error < "$backup"
"${compose[@]}" exec -T db psql -U postgres -d "$restore_db" -v ON_ERROR_STOP=1 -c 'SELECT count(*) AS migration_count FROM afnt_migrations; SELECT count(*) AS note_count FROM afnt_notes;'
"${compose[@]}" exec -T db dropdb -U postgres "$restore_db"
if ! sudo test -f /etc/letsencrypt/live/ad-fontes.app/fullchain.pem; then
  sudo install -d -m 755 "$webroot"
  sudo install -m 644 "$bootstrap" "$available"
  if ! sudo test -L "$enabled"; then sudo ln -s "$available" "$enabled"; fi
  sudo nginx -t
  sudo systemctl reload nginx
  # Certbot prompts for any required account details/terms in this terminal.
  sudo certbot certonly --webroot -w "$webroot" -d ad-fontes.app
fi
previous=$(mktemp)
sudo cat "$available" > "$previous" 2>/dev/null || true
sudo install -m 644 nginx.conf "$available"
if ! sudo test -L "$enabled"; then sudo ln -s "$available" "$enabled"; fi
if ! sudo nginx -t; then
  if [[ -s "$previous" ]]; then sudo install -m 644 "$previous" "$available"; else sudo rm -f "$enabled" "$available"; fi
  rm -f "$previous"
  echo 'Nginx validation failed; previous site configuration restored without reload.' >&2
  exit 1
fi
rm -f "$previous"
sudo systemctl reload nginx
# Reload is graceful: old workers can briefly serve the preceding TLS site.
# Retry with full certificate verification; never bypass hostname checks.
https_ready=false
for attempt in {1..15}; do
  if curl --fail --silent --show-error --connect-timeout 5 --max-time 10 https://ad-fontes.app/api/health; then
    https_ready=true
    break
  fi
  sleep 2
done
if [[ "$https_ready" != true ]]; then
  echo 'HTTPS health verification did not pass. Leave services intact for diagnosis.' >&2
  exit 1
fi
printf '\nAd Fontes NT is running at https://ad-fontes.app\nNext: verify real Google registration and returning sign-in.\n'
