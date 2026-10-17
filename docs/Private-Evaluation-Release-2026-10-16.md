# Private evaluation 4.3.4 release — October 16, 2026

AF-EVAL-001–003. Deployed at https://eval.ad-fontes.app with Google sign-in, manual resource admission, signed Mac/Windows downloads and protected two-platform updater publication. Larry explicitly confirms his active Logos subscription covers the supplied resources and authorizes his grant; the normal administration UI grants his real Google account access. Public production 4.3.4 remains separate. [Implementation and source limitations](Private-Evaluation-Implementation-2026-10-16.md).

## Source and isolation

Frozen common website/native source: 73c4cff3d77b70f2fe2b25c16c4266eb59d46a4e on codex/private-evaluation. Evaluation identifier: app.ad-fontes.evaluation; product: Ad Fontes Evaluation. Resource release: evaluation-resources-2026-10-16-v1, 85 resources / 2,716 sections. Both Book of Concord editions and Luther’s Works are under Confessional Resources; supplied Concordia volumes are under Commentaries. Immutable source/search pins and extraction limitations remain preserved.

Larry runs the AGENTS.md-required own-terminal host installation successfully. The dedicated checkout, Docker project, loopback port 8136, access database volume, private read-only mounts, Nginx site and automatically renewing TLS certificate are installed. Existing Google client fields are reused only in the dedicated mode-0600 configuration. No legacy database, volume, public account/note API or other application’s secrets are used. Public host checkout stays at 2b56fbf.

The Google-console screenshot exposes a saved retired account callback; Larry corrects it to https://eval.ad-fontes.app/api/evaluation/callback. Real Google authentication then succeeds. Administrator status alone leaves admission pending; the subsequent explicit eligibility confirmation and ordinary UI grant enable reading/download access without database edits.

## Exact signed artifacts

Both platforms use native source 73c4cff above. Frozen local Mac artifacts are under artifacts/desktop/evaluation/mac/signed-4.3.4-73c4cff/. Verified Windows output is under artifacts/desktop/evaluation/windows/run-38967937464/signed/. Complete local verification record: artifacts/desktop/evaluation/release-4.3.4-73c4cff.json.

| Artifact | SHA-256 |
| --- | --- |
| Mac Apple Silicon installer | 6cebb9a96d7f04b20248231750747c0d749d55da1afe1a9eaaa53ffde3a00bdc |
| Mac updater archive | 1e8a53da9d802cc402681c5fb0fbe229f31816eb0d4cc2c01c645feebb319a70 |
| Mac updater signature | f256496d886a15921bcf4abdf747854cdfc0ca28ea673dde9648b66246d36f1e |
| Windows x64 installer/updater | ebf45ec1d7e3d85b47285be12912406b9d0e36ae8cc4da9165e55475c57e7395 |
| Windows updater signature | 38241c76ffaf769637c054942617aada0ad1ebde7d6f6783a42f14743a0195f8 |

Mac uses the established Developer ID/updater credentials, evaluation platform overlays and minimum macOS 14. App notarization 7930d779-3dd2-4cf5-aa35-2463649c1a69 and DMG notarization b8811b69-b3cf-41d7-bb3f-63ae790b15be are accepted. Strict/deep codesign, Gatekeeper, both staples, read-only mounted DMG, separately extracted updater app, exact executable identity comparisons and updater payload/trusted-comment signatures pass. The existing installed public app identifier/executable remain unchanged.

Successful [Windows run 38967937464](https://github.com/larryherzogjr/ad-fontes-nt/actions/runs/38967937464) uses main workflow control c285ed49d04b93c2ff7ba0eda9c594502c590a4c with the exact evaluation source. Exact frontend/pin checks, four evaluation security groups, existing main-bound Azure OIDC federation, pinned official signing tools, Azure signing, Authenticode and disposable Windows install/reinstall/uninstall isolation checks pass. The latter preserve a separate hash-pinned public installation and device-data sentinel.

Independent local verification checks the GitHub ZIP digest fd666133eacab2be2af9f11ec0ac7729fbe0de77bec94819ad314eac8612300c, authenticated AES-GCM decryption, exact four-file output allowlist, every output hash and source/workflow/run provenance. Both platform updater signatures and trusted comments independently verify against the established public key.

## Protected publication

Private publication index SHA-256: 7625ac2f5b0735e620447a6b320512b11e6b1ecc39d384fcb057a782d8cdf4aa. Local assembly creates four payload files and two-platform latest metadata. The first-publication helper now creates its releases parent before the immutable version directory; actual assembly verifies this delivery-only fix without altering frozen application bytes.

The host independently checks all source payload sizes/hashes, signatures in metadata, exact private API URLs and output copies. Latest metadata and publication index are replaced only after all payloads are present. No service restart, public destination or public updater change is required. Served files are in the dedicated private evaluation downloads mount.

Real admitted portal verification shows both installer links with the exact hashes above. Anonymous content, both installer URLs and updater return 403 with private/no-store; direct private static paths and public-site evaluation API return 404. Evaluation/public health return 200. An extra authenticated browser installer-download check stalls in browser automation and provides no result; direct updater-JSON navigation is blocked by the browser client. No successful end-to-end native pairing, future-version update installation or completed browser installer transfer is inferred. Published files, signatures, access boundaries, native updater configuration and compiled delivery behavior are independently verified.

## Verification and remaining boundaries

Official Node 24 typecheck, 189 application checks, 51 Python/source checks, four evaluation security groups, two evaluation packaging groups, public desktop checks, full public/evaluation website/offline builds, exact 75,937 evaluation payload inventory and both native release builds pass. Actual signed Mac smoke covers both BoC Small Catechisms/cross-edition navigation, Concordia catalog, quoted search (271 matching sections), Greek/context highlights, Escape return and unpaired update guidance. Live admitted reader checks cover Luther Volume 1 Chapter One, 390px reading without horizontal overflow, the same Concordia search/context and Escape return. Captured reading-browser warnings/errors are empty.

Evidence: artifacts/review/evaluation-2026-10-16/live-published-downloads.png, live-publication-verification.json, live-access-approved.png, live-luther-phone.png, live-concordia-context.png and signed-mac-context.png. No new physical Windows 11 or Intel Mac acceptance is claimed. Users pair the evaluation app from the portal’s five-minute code; desktop access lasts 30 days before renewal. Revocation blocks future delivery, while already received offline resources remain usable. Current-release/MVP acceptance stays closed.

## Encrypted CI and cleanup

GitHub API inspection proves the repository is PUBLIC, superseding historical private-repository assumptions. Larry explicitly approves the signing workflow on main and ciphertext-only AES-256-GCM input/output transfer, with a dedicated temporary Actions secret and local mode-0600 recovery key. No restricted plaintext or usable installer is uploaded to GitHub. Main changes only the approved workflow; evaluation application code stays on its own branch.

Portable frontend archive SHA-256: ad5bdfaf8f816b787edff1d6b7e29c17308de61ec7ba671a8c17680968948952. All 75,943 regular entries (75,937 payloads plus six frontend/inventory files) match frozen bytes. Earlier runs stop before producing a release candidate: draft visibility, AppleDouble metadata and expected server-test directory staging. Corrected transport/staging preserves source bytes and unchanged validation rules.

After successful private publication, both task-owned ciphertext input prereleases/tags and output artifact 12076238945 are removed; run artifact count is zero. Dedicated EVALUATION_BUILD_KEY Actions secret is deleted and absence verified; local recovery key is removed. Existing signing secrets remain untouched. Verified signed output and private source data are retained. The release-control worktree is archived recoverably. Native source remains frozen; final delivery helper/documentation changes do not require application rebuilds.
