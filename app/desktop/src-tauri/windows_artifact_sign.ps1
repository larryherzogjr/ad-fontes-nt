param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$File
)

$ErrorActionPreference = 'Stop'
foreach ($name in @(
  'AZURE_ARTIFACT_SIGNING_ENDPOINT',
  'AZURE_ARTIFACT_SIGNING_ACCOUNT',
  'AZURE_ARTIFACT_SIGNING_CERTIFICATE_PROFILE',
  'AZURE_ARTIFACT_SIGNING_SIGNTOOL',
  'AZURE_ARTIFACT_SIGNING_DLIB'
)) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Required Artifact Signing setting is missing: $name"
  }
}

$resolved = (Resolve-Path -LiteralPath $File).Path
$dlib = (Resolve-Path -LiteralPath $env:AZURE_ARTIFACT_SIGNING_DLIB).Path
$signTool = (Resolve-Path -LiteralPath $env:AZURE_ARTIFACT_SIGNING_SIGNTOOL).Path
if (-not (Test-Path -LiteralPath $dlib)) {
  throw "Artifact Signing dlib is unavailable at the configured path: $dlib"
}
if (-not (Test-Path -LiteralPath $signTool)) {
  throw "Artifact Signing SignTool is unavailable at the configured path: $signTool"
}

$correlation = if ($env:GITHUB_RUN_ID) {
  "github-$($env:GITHUB_RUN_ID)-$($env:GITHUB_RUN_ATTEMPT)"
} else {
  "local-$([Guid]::NewGuid().ToString('N'))"
}
$metadata = Join-Path ([IO.Path]::GetTempPath()) "ad-fontes-artifact-signing-$([Guid]::NewGuid().ToString('N')).json"
@{
  Endpoint = $env:AZURE_ARTIFACT_SIGNING_ENDPOINT
  CodeSigningAccountName = $env:AZURE_ARTIFACT_SIGNING_ACCOUNT
  CertificateProfileName = $env:AZURE_ARTIFACT_SIGNING_CERTIFICATE_PROFILE
  CorrelationId = $correlation
  # azure/login establishes the short-lived OIDC session used by AzureCliCredential.
  ExcludeCredentials = @(
    'EnvironmentCredential',
    'WorkloadIdentityCredential',
    'ManagedIdentityCredential',
    'SharedTokenCacheCredential',
    'VisualStudioCredential',
    'VisualStudioCodeCredential',
    'AzurePowerShellCredential',
    'AzureDeveloperCliCredential',
    'InteractiveBrowserCredential'
  )
} | ConvertTo-Json | Set-Content -LiteralPath $metadata -Encoding utf8

try {
  & $signTool sign /v /debug /fd SHA256 `
    /tr 'http://timestamp.acs.microsoft.com' /td SHA256 `
    /dlib $dlib /dmdf $metadata $resolved
  if ($LASTEXITCODE -ne 0) {
    throw "Azure Artifact Signing failed with exit code $LASTEXITCODE"
  }

  & $signTool verify /pa /all /v $resolved
  if ($LASTEXITCODE -ne 0) {
    throw "Authenticode verification failed with exit code $LASTEXITCODE"
  }
} finally {
  Remove-Item -LiteralPath $metadata -Force -ErrorAction SilentlyContinue
}
