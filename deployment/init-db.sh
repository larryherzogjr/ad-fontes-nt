#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username postgres --dbname adfontes --set=app_password="$AFNT_DATABASE_PASSWORD" <<'SQL'
CREATE ROLE afnt LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
ALTER DATABASE adfontes OWNER TO afnt;
ALTER SCHEMA public OWNER TO afnt;
SQL
