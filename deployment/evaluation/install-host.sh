#!/usr/bin/env bash
# Larry runs this in his own terminal AFTER reviewing the new isolated configuration.
set -euo pipefail
repo=$(cd "$(dirname "$0")/../.." && pwd)
cd "$repo"
[[ $repo != "$HOME/ad-fontes-nt" ]] || { echo 'Use a separate ~/ad-fontes-evaluation checkout, never the public hosting checkout.' >&2; exit 2; }
[[ $(git branch --show-current) == codex/private-evaluation ]] || { echo 'Expected the reviewed private evaluation branch.' >&2; exit 2; }
git diff --quiet && git diff --cached --quiet || { echo 'Review/commit checkout changes before installation.' >&2; exit 2; }
[[ -s deployment/evaluation/.env ]] || { echo 'Create the NEW evaluation env file with only its dedicated/reused Ad Fontes Google client values.' >&2; exit 2; }
[[ -d private/evaluation/content/evaluation-resources-2026-10-16-v1 ]] || { echo 'Transfer the verified restricted content privately before installation.' >&2; exit 2; }
node scripts/evaluation/verify_payloads.mts
mkdir -p private/evaluation/downloads
sudo docker compose --env-file deployment/evaluation/.env -f deployment/evaluation/compose.yml config --quiet
conf=/etc/nginx/sites-available/ad-fontes-evaluation
link=/etc/nginx/sites-enabled/ad-fontes-evaluation
if sudo test -e "$conf"; then
  if ! sudo cmp -s deployment/evaluation/nginx.conf "$conf" && ! sudo cmp -s deployment/evaluation/nginx-http.conf "$conf"; then
    echo 'Unexpected existing evaluation Nginx edits. Review them; nothing overwritten.' >&2; exit 2
  fi
fi
if sudo test -e "$link" || sudo test -L "$link"; then
  [[ $(sudo readlink "$link") == "$conf" ]] || { echo 'Unexpected enabled-site entry; nothing overwritten.' >&2; exit 2; }
fi
# Refuse an occupied port unless this exact dedicated evaluation service is already running.
if sudo ss -ltn '( sport = :8136 )' | tail -n +2 | grep -q .; then
  [[ -n $(sudo docker compose --env-file deployment/evaluation/.env -f deployment/evaluation/compose.yml ps -q web) ]] || { echo 'Port 8136 belongs to an unexpected service.' >&2; exit 2; }
fi
sudo docker compose --env-file deployment/evaluation/.env -f deployment/evaluation/compose.yml build web
sudo docker compose --env-file deployment/evaluation/.env -f deployment/evaluation/compose.yml up -d web
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:8136/api/health >/dev/null; then break; fi
  [[ $attempt -lt 30 ]] || { echo 'Evaluation service is not healthy; existing public service is unchanged.' >&2; exit 2; }
  sleep 2
done
sudo install -d -m 0755 /var/www/ad-fontes-acme
if ! sudo test -s /etc/letsencrypt/live/eval.ad-fontes.app/fullchain.pem; then
  sudo install -m 0644 deployment/evaluation/nginx-http.conf "$conf"
  if ! sudo test -L "$link"; then sudo ln -s "$conf" "$link"; fi
  sudo nginx -t
  sudo systemctl reload nginx
  sudo certbot certonly --webroot -w /var/www/ad-fontes-acme -d eval.ad-fontes.app
fi
sudo install -m 0644 deployment/evaluation/nginx.conf "$conf"
if ! sudo test -L "$link"; then sudo ln -s "$conf" "$link"; fi
sudo nginx -t
sudo systemctl reload nginx
curl --fail --silent --retry 8 --retry-delay 2 https://eval.ad-fontes.app/api/health >/dev/null
echo 'Dedicated evaluation service installed. Verify real Google sign-in, manual grants/revocation and protected resource delivery before distributing installers.'
