# Ad Fontes NT off-host Borg backups

This prepared design keeps backup authority in the home lab. Production creates a validated, short-lived PostgreSQL custom-format dump. A dedicated SSH public key is restricted to `export-latest-backup.sh`; the home VM initiates the connection and can only stream the newest dump. The production host receives no credential that can alter or delete the home repository.

The home VM stores the dump in a dedicated encrypted Borg repository, separate from zrxoa.org, then retains database archives for no more than 30 rolling days. This repository contains private account and note data, so it must not use weekly or monthly retention beyond that boundary. Temporary plaintext dumps use a private directory and are removed after the archive completes. Successful runs are silent at the notification layer; systemd invokes a failure notifier addressed to `larry@larryherzogjr.com`.

Longer-lived weekly or monthly history may be maintained in a second repository only for public immutable releases and non-secret configuration. That repository must exclude PostgreSQL dumps, account data, notes, session data, OAuth identifiers, secrets and logs that may identify a user.

Installation is intentionally not automatic. Before enabling it:

1. Inspect the existing Borg version, repository layout and mail-notification method on `sitepull@10.20.30.70`.
2. Create a dedicated Ed25519 pull key as `sitepull`. Add only its public half to the production `lherzog` account with `restrict,command="/home/lherzog/ad-fontes-nt/deployment/offsite/export-latest-backup.sh"`.
3. Initialize a new repository using Borg’s authenticated encryption. Store its passphrase outside the repository with mode 0600 and arrange a separate recovery copy; never commit either secret.
4. Install the production service/timer under `/etc/systemd/system/`. Install the home script under `/home/sitepull/bin/` and the home user service/timer under `/home/sitepull/.config/systemd/user/`.
5. Install `ad-fontes-backup.env.example` as private `/home/sitepull/.config/ad-fontes-backup.env`; it supplies only paths and public connection settings, while the generated repository passphrase remains in its separate mode-0600 file. Preserve the production SSH host key in `known_hosts` before unattended use.
6. Verify the script's failure email through the VM mail transport, enable both timers, and observe one scheduled run. Do not claim notification coverage if the test message fails.
7. Run `borg check --verify-data` and restore one archive into a disposable local PostgreSQL database. Compare migrations, user count and note count with the source-side release record without exposing note bodies. Confirm that the oldest private archive is no more than 30 days old.

Do not enable or claim this backup until the VM and production installation, failure mail and restore rehearsal have all passed. Account deletion removes live data immediately; rolling encrypted backups age out within 30 days under this retention policy.
