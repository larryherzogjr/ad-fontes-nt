# Disposable runner only: verify side-by-side install, repeated update and uninstall.
param([Parameter(Mandatory=$true)][string]$Installer)
$ErrorActionPreference = 'Stop'
if ($env:GITHUB_ACTIONS -ne 'true') { throw 'Disposable GitHub runner required' }
$version = (Get-Content app/desktop/src-tauri/tauri.evaluation.conf.json | ConvertFrom-Json).version
$publicKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ad Fontes NT'
$publicLocationKey = 'HKCU:\Software\ad-fontes\Ad Fontes NT'
if ((Test-Path $publicKey) -or (Test-Path $publicLocationKey)) { throw 'Public installation already exists' }
function Install([string]$Path,[string[]]$Arguments) {
  $p = Start-Process -FilePath $Path -ArgumentList $Arguments -Wait -PassThru
  if ($p.ExitCode -notin @(0,3010)) { throw "Installer exit code $($p.ExitCode)" }
}
$publicInstaller = Join-Path $env:RUNNER_TEMP 'ad-fontes-public-2.1.0.exe'
curl.exe --fail --location --silent --show-error --retry 3 --max-time 300 --output $publicInstaller 'https://ad-fontes.app/beta-downloads/2.1.0/Ad-Fontes-NT-Windows-x64-2.1.0.exe'
if ($LASTEXITCODE -ne 0) { throw 'Public fixture download failed' }
if ((Get-FileHash $publicInstaller -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'd9861a4c817550bd361b77ab120394a4ed425c454eb7b283762e802b0a0e691f') { throw 'Public fixture hash mismatch' }
Install $publicInstaller @('/S')
$publicLocation = (Get-Item $publicLocationKey).GetValue('')
$publicExe = Join-Path $publicLocation 'ad-fontes-nt-desktop.exe'
$publicHash = (Get-FileHash $publicExe -Algorithm SHA256).Hash
$publicRegistration = Get-ItemProperty $publicKey | ConvertTo-Json -Compress
$publicData = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'app.ad-fontes.desktop'
New-Item -ItemType Directory -Force $publicData | Out-Null
$sentinel = Join-Path $publicData 'evaluation-isolation-test.txt'
Set-Content $sentinel 'public-device-data'
$location = Join-Path $env:RUNNER_TEMP 'Ad-Fontes-Evaluation-isolation'
$evaluationExe = Join-Path $location 'ad-fontes-nt-desktop.exe'
Install (Resolve-Path $Installer).Path @('/S',"/D=$location")
$entries = @(Get-ChildItem 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall' | Get-ItemProperty | Where-Object DisplayName -eq 'Ad Fontes Evaluation')
if ($entries.Count -ne 1 -or $entries[0].DisplayVersion -ne $version) { throw 'Evaluation uninstall identity/version mismatch' }
if (-not (Test-Path $evaluationExe)) { throw 'Separate evaluation executable missing' }
if ((Get-AuthenticodeSignature $evaluationExe).Status -ne 'Valid') { throw 'Installed evaluation executable signature invalid' }
if ((Get-Item $evaluationExe).VersionInfo.ProductName -ne 'Ad Fontes Evaluation') { throw 'Installed evaluation product identity mismatch' }
function CheckPublic {
  if ((Get-FileHash $publicExe -Algorithm SHA256).Hash -ne $publicHash) { throw 'Public executable changed' }
  if ((Get-ItemProperty $publicKey | ConvertTo-Json -Compress) -ne $publicRegistration) { throw 'Public registration changed' }
  if ((Get-Item $publicLocationKey).GetValue('') -ne $publicLocation) { throw 'Public location changed' }
  if ((Get-Content $sentinel) -ne 'public-device-data') { throw 'Public device data changed' }
}
CheckPublic
Install (Resolve-Path $Installer).Path @('/S','/UPDATE')
if (-not (Test-Path $evaluationExe)) { throw 'Evaluation update moved its installation' }
CheckPublic
Install (Join-Path $location 'uninstall.exe') @('/S')
CheckPublic
if (Test-Path $entries[0].PSPath) { throw 'Evaluation uninstall registration remains' }
if (Test-Path $evaluationExe) { throw 'Evaluation executable remains after uninstall' }
Write-Host 'PASS: signed evaluation install, repeated update and uninstall preserve the separate public installation and device data.'
Install (Join-Path $publicLocation 'uninstall.exe') @('/S')
