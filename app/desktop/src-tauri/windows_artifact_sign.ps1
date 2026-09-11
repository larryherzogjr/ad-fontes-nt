param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$File
)

$ErrorActionPreference = 'Stop'
foreach ($name in @(
  'AZURE_ARTIFACT_SIGNING_ENDPOINT',
  'AZURE_ARTIFACT_SIGNING_ACCOUNT',
  'AZURE_ARTIFACT_SIGNING_CERTIFICATE_PROFILE'
)) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Required Artifact Signing setting is missing: $name"
  }
}

$resolved = (Resolve-Path -LiteralPath $File).Path
$tools = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\ArtifactSigningClientTools\bin'
$dlib = Join-Path $tools 'Azure.CodeSigning.Dlib.dll'
$signTool = Join-Path $tools 'signtool.exe'
if (-not (Test-Path -LiteralPath $dlib)) {
  throw "Artifact Signing dlib is not installed at the expected path: $dlib"
}
if (-not (Test-Path -LiteralPath $signTool)) {
  $candidate = Get-ChildItem -LiteralPath $tools -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match '\\x64\\signtool\.exe$' } |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if ($candidate) {
    $signTool = $candidate.FullName
  } else {
    $command = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if (-not $command) { throw 'A compatible signtool.exe was not found' }
    $signTool = $command.Source
  }
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
