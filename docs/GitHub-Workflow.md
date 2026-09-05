# Private GitHub workflow

Repository: https://github.com/larryherzogjr/ad-fontes-nt (private). Main branch: `main`.

The Mac pushes with the existing GitHub CLI login. The host pulls using a dedicated, read-only repository deploy key; it cannot push using that key. Its private key stays in the host's ~/.ssh directory. No existing application's keys or repositories are reused.

## From the Mac

In `~/Documents/Codex/ad-fonts-nt`, make changes and run the applicable checks, then:

```sh
git status
git add <files-you-changed>
git commit -m "Describe the change"
git push origin main
```

## On the host

```sh
ssh lherzog@larryherzogjr.com
cd ~/ad-fontes-nt
git pull --ff-only
bash deployment/update-host.sh
```

Pulling alone updates source files, not the running containers. The update script builds first, backs up the current database, then recreates only the Ad Fontes services and checks HTTPS health. Enter sudo credentials privately in the terminal. If Git reports conflicts or local edits, stop and reconcile; do not force-reset or clean the checkout. Nginx/TLS configuration changes need a separate reviewed installation. Migrations run when the app starts; never modify an already applied migration. Rollback across schema changes needs migration-specific review; retained local dumps are not off-host backups.

## Included and excluded

Tracked: app source, lockfile, migration/deployment scripts, pinned corpus originals, provenance, reference registries and approved editorial review history. The repository is private; it is not a public redistribution decision for archival review materials.

Excluded: deployment/.env, all environment secret files, private keys, backups, dependencies, build output, generated public corpus/analysis/editorial bundles, and the locally supplied review-book PDF. Generated bundles are reproduced and checksum-verified from pinned inputs by `npm run import:all` / the production build. No personal notes are stored in Git; those remain in the separate PostgreSQL volume. Keep private credentials and off-host database backups separately.

For a fresh developer clone: `npm --prefix app ci`, `npm run import:all`, then `npm run dev`. Build with `npm run typecheck` and `npm run build`.
