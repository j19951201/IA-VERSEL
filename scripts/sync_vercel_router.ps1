param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  [string]$Token = "",

  [switch]$SkipConnectivityTest
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$cleanBase = $BaseUrl.Trim().TrimEnd("/")
$apiUrl = "$cleanBase/api/generate"

if ($cleanBase -notmatch "^https?://") {
  throw "BaseUrl invalida. Usa formato http://host:puerto o https://dominio"
}

if (-not $SkipConnectivityTest) {
  Write-Host "[INFO] Validando conectividad del endpoint antes de tocar Vercel..."
  $testScript = Join-Path $root "scripts\test_router_endpoint.ps1"
  $testParams = @{
    BaseUrl = $cleanBase
  }
  if ($Token) { $testParams.Token = $Token }
  & $testScript @testParams
}

Push-Location $root
try {
  Write-Host "[INFO] Actualizando INTERNAL_AI_API_URL => $apiUrl"
  try {
    npx vercel env rm INTERNAL_AI_API_URL production --yes | Out-Null
  } catch {
    # Continuar si no existia.
  }

  $apiUrl | npx vercel env add INTERNAL_AI_API_URL production | Out-Null

  if ($Token) {
    Write-Host "[INFO] Actualizando INTERNAL_AI_API_KEY"
    try {
      npx vercel env rm INTERNAL_AI_API_KEY production --yes | Out-Null
    } catch {
      # Continuar si no existia.
    }

    $Token | npx vercel env add INTERNAL_AI_API_KEY production | Out-Null
  }

  Write-Host "[INFO] Desplegando a produccion..."
  npx vercel --prod --yes | Out-Null

  Write-Host "[OK] Vercel sincronizado con endpoint router: $apiUrl"
} finally {
  Pop-Location
}
