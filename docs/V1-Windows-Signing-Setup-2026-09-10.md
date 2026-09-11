# Ad Fontes NT Windows signing setup — 2026-09-10

Microsoft Azure Artifact Signing is configured for the Windows x64 public-release path. This record covers account and pipeline preparation; it does not claim that a signed package has been built or accepted on Windows 11.

## Azure configuration

- Paid SKU: Basic, USD $9.99/account/month.
- Resource group: `ad-fontes-signing`.
- Artifact Signing account: `adfontesntsigning`, Central US.
- Service endpoint: `https://cus.codesigning.azure.net`.
- Individual Public identity validation: completed for Larry Herzog Jr.
- Public Trust certificate profile: `AdFontesNTRelease`, active. Street address and postal code are not included in the certificate subject.
- Microsoft Entra application/service principal: `ad-fontes-windows-signing`.
- The service principal has `Artifact Signing Certificate Profile Signer` at the Artifact Signing account scope. It has no general Azure administrator role.

## GitHub authentication and updater custody

- The private `larryherzogjr/ad-fontes-nt` repository has an OIDC federated credential bound to the numeric repository identity and `refs/heads/main` only.
- No Azure client secret was created or stored.
- GitHub Actions contains the Azure client, tenant and subscription identifiers as encrypted secrets, following Microsoft's OIDC integration guidance.
- With Larry's explicit approval, the already-backed-up Tauri updater private key and password were copied directly from the trusted Mac/Keychain to encrypted GitHub Actions secrets. Their values were not printed. This permits the Windows runner to produce the same independently authenticated updater format as the Mac release.

## Prepared workflow

- `.github/workflows/windows-release.yml` is manual-only and refuses non-`main` refs.
- `azure/login` is pinned by full commit and requests only `contents: read` and `id-token: write`.
- The first live run proved GitHub-to-Azure OIDC authentication, but the official Artifact Signing Client Tools MSI remained blocked in `msiexec` for more than 16 minutes on the hosted Windows Server 2022 runner. That canceled run is `34554370479`; it produced no candidate artifact.
- The release workflow therefore uses Microsoft's documented manual toolchain instead of installing the MSI: `Microsoft.Windows.SDK.BuildTools` `10.0.28000.2705` (SHA-256 `8bfdfb6ca2633f531cf80b5fa22512ba61a394d7988f0970db83baadc67929ed`) and `Microsoft.ArtifactSigning.Client` `1.0.128` (SHA-256 `74bd7d27e6ce1051409c38d9b46bc8df0400ecd643d51ffbf2ac00869061e40b`). Both official NuGet packages are extracted into the ephemeral runner and the x64 tools are used directly; no package installer runs.
- Corrected run `34556033480` proved that replacement path: shared verification, GitHub OIDC, both package checksums and direct tool preparation passed. The clean Windows compilation also completed in 11 minutes 23 seconds. Tauri then reported only `failed to run powershell` while invoking the custom signer and suppressed its child-process diagnostics, so the run produced no candidate artifact.
- The next retry adds an early signing-service preflight whose SignTool/Azure output is visible in the job log, and places a generated command wrapper on `PATH` so Tauri does not rely on a relative PowerShell script path. This is a pipeline-diagnostics correction; it does not change application or corpus content.
- Tauri's custom sign command uses the official SignTool dlib with Azure CLI's short-lived OIDC session. It excludes other credential types, applies SHA-256 plus Microsoft's RFC 3161 timestamp service, and verifies each signed executable immediately.
- The workflow keeps the existing unsigned beta workflow intact. It builds the application executable, NSIS installer and `.nsis.zip` updater artifact, verifies Authenticode on the application and installer, and records artifact hashes and release identity.

## Verification and remaining gates

`npm run test:desktop` passed all five desktop groups after the workflow change. The workflow YAML parsed locally and `git diff --check` passed. The expected five GitHub secret names are present; secret values cannot be read back and were not exposed.

Still required: run the new workflow from `main`; inspect the exact GitHub/Azure evidence and artifact hashes; install on Windows 11 x64; verify the displayed publisher, offline reading, upgrade and uninstall; then rebuild both supported platforms at one new immutable version for the served Windows updater rehearsal. The already-published macOS-only `1.0.0-rc.2` directory remains immutable.
