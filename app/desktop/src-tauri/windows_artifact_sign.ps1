param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$File
)

$ErrorActionPreference = 'Stop'
foreach ($name in @(
  'AZURE_CLIENT_ID',
  'AZURE_CLIENT_SECRET',
  'AZURE_TENANT_ID',
  'AZURE_ARTIFACT_SIGNING_ENDPOINT',
  'AZURE_ARTIFACT_SIGNING_ACCOUNT',
  'AZURE_ARTIFACT_SIGNING_CERTIFICATE_PROFILE'
)) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Required Artifact Signing setting is missing: $name"
  }
}

$resolved = (Resolve-Path -LiteralPath $File).Path
& artifact-signing-cli `
  -e $env:AZURE_ARTIFACT_SIGNING_ENDPOINT `
  -a $env:AZURE_ARTIFACT_SIGNING_ACCOUNT `
  -c $env:AZURE_ARTIFACT_SIGNING_CERTIFICATE_PROFILE `
  -d 'Ad Fontes NT' `
  $resolved
if ($LASTEXITCODE -ne 0) {
  throw "Azure Artifact Signing failed with exit code $LASTEXITCODE"
}

& signtool.exe verify /pa /all /v $resolved
if ($LASTEXITCODE -ne 0) {
  throw "Authenticode verification failed with exit code $LASTEXITCODE"
}
