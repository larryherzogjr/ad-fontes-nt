# Isolated GitHub runner acceptance: published 2.1.0 -> renamed signed candidate.
param([Parameter(Mandatory=$true)][string]$Installer)
$ErrorActionPreference = 'Stop'
$expectedVersion = (Get-Content (Join-Path $PSScriptRoot '../app/desktop/src-tauri/tauri.conf.json') -Raw | ConvertFrom-Json).version
if ($expectedVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid release version' }
if ($env:GITHUB_ACTIONS -ne 'true') { throw 'Run only on a disposable GitHub Actions runner.' }
$uninstallKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ad Fontes NT'
$installKey = 'HKCU:\Software\ad-fontes\Ad Fontes NT'
if ((Test-Path $uninstallKey) -or (Test-Path $installKey)) { throw 'Runner already contains an installation or saved install location; refusing to alter it.' }
$legacy = Join-Path $env:RUNNER_TEMP 'ad-fontes-2.1.0-verified.exe'
& curl.exe --fail --location --silent --show-error --retry 3 --max-time 300 --output $legacy 'https://ad-fontes.app/beta-downloads/2.1.0/Ad-Fontes-NT-Windows-x64-2.1.0.exe'
if ($LASTEXITCODE -ne 0) { throw 'Legacy installer download failed' }
if ((Get-FileHash $legacy -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'd9861a4c817550bd361b77ab120394a4ed425c454eb7b283762e802b0a0e691f') { throw 'Legacy installer hash mismatch' }
function Install([string]$Path, [string[]]$Arguments) {
  $process = Start-Process -FilePath $Path -ArgumentList $Arguments -Wait -PassThru
  if ($process.ExitCode -notin @(0,3010)) { throw "Installer failed: $($process.ExitCode)" }
}
Install $legacy @('/S')
$before = Get-ItemProperty $uninstallKey
if ($before.DisplayVersion -ne '2.1.0') { throw 'Legacy version mismatch' }
$location = (Get-Item $installKey).GetValue('')
$executable = Join-Path $location 'ad-fontes-nt-desktop.exe'
if (-not (Test-Path $executable)) { throw 'Legacy executable missing' }
$folders = @([Environment]::GetFolderPath('Programs'), [Environment]::GetFolderPath('Desktop'))
foreach ($folder in $folders) {
  if (-not (Test-Path (Join-Path $folder 'Ad Fontes NT.lnk'))) { throw 'Expected original shortcut missing' }
}
# Simulate existing device data and ensure installer leaves it intact.
$data = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'app.ad-fontes.desktop'
New-Item -ItemType Directory -Force $data | Out-Null
$sentinel = Join-Path $data 'rename-upgrade-test.txt'
Set-Content $sentinel 'preserve-existing-device-data'
Install (Resolve-Path $Installer).Path @('/S','/UPDATE')
$after = Get-ItemProperty $uninstallKey
if ($after.DisplayVersion -ne $expectedVersion -or $after.DisplayName -ne 'Ad Fontes') { throw "Renamed installed entry/version mismatch: expected $expectedVersion / Ad Fontes, got $($after.DisplayVersion) / $($after.DisplayName)" }
if ((Get-Item $installKey).GetValue('') -ne $location) { throw 'Existing installation moved unexpectedly' }
if (Test-Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ad Fontes') { throw 'Duplicate uninstall entry created' }
$wsh = New-Object -ComObject WScript.Shell
foreach ($folder in $folders) {
  $shortcut = Join-Path $folder 'Ad Fontes.lnk'
  if (-not (Test-Path $shortcut)) { throw 'Renamed shortcut missing' }
  if ((Test-Path (Join-Path $folder 'Ad Fontes NT.lnk'))) { throw 'Old shortcut remains' }
  if ($wsh.CreateShortcut($shortcut).TargetPath -ne $executable) { throw 'Renamed shortcut target changed' }
}
if ((Get-Content $sentinel) -ne 'preserve-existing-device-data') { throw 'Existing device data changed' }
$signature = Get-AuthenticodeSignature $executable
if ($signature.Status -ne 'Valid') { throw 'Installed executable signature invalid' }
if ((Get-Item $executable).VersionInfo.ProductName -ne 'Ad Fontes') { throw 'Executable product name mismatch' }
Write-Host "PASS: 2.1.0 -> $expectedVersion upgrade preserves location/data, uses one uninstall entry, and renames both shortcuts."
# Repeated updater execution must remain idempotent.
Install (Resolve-Path $Installer).Path @('/S','/UPDATE')
if ((Get-ItemProperty $uninstallKey).DisplayName -ne 'Ad Fontes') { throw 'Repeated upgrade failed' }
Install (Join-Path $location 'uninstall.exe') @('/S')
if (Test-Path $uninstallKey) { throw 'Uninstall registration remains' }
foreach ($folder in $folders) {
  if (Test-Path (Join-Path $folder 'Ad Fontes.lnk')) { throw 'Renamed shortcut remains after uninstall' }
}
Write-Host 'PASS: repeated upgrade and renamed shortcut/uninstall cleanup.'
# NSIS deliberately preserves the remembered folder unless app-data removal is selected.
# Clear only the location key this test created on the initially empty runner,
# so the fresh-install case represents a new user rather than a reinstall.
if (Test-Path $installKey) { Remove-Item -LiteralPath $installKey -Recurse }
# Fresh installs get the new folder and display name, with the same stable identity.
Install (Resolve-Path $Installer).Path @('/S')
$fresh = (Get-Item $installKey).GetValue('')
if ((Split-Path $fresh -Leaf) -ne 'Ad Fontes') { throw 'Fresh install folder name mismatch' }
if ((Get-ItemProperty $uninstallKey).DisplayName -ne 'Ad Fontes') { throw 'Fresh display name mismatch' }
Install (Join-Path $fresh 'uninstall.exe') @('/S')
Write-Host 'PASS: fresh Ad Fontes install/uninstall.'
