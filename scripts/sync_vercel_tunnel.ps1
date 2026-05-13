param(
  [Parameter(Mandatory = $true)]
  [string]$TunnelUrl
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$stateDir = Join-Path $root "runtime-state"
$logDir = Join-Path $root "runtime-logs"
$stateFile = Join-Path $stateDir "current_tunnel_url.txt"
$syncLog = Join-Path $logDir "vercel-sync.log"

New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$cleanUrl = $TunnelUrl.Trim().TrimEnd("/")
if ($cleanUrl -notmatch "^https://[a-z0-9-]+\.trycloudflare\.com$") {
  "[$(Get-Date -Format o)] URL invalida omitida: $cleanUrl" | Add-Content -Path $syncLog
  exit 0
}

$apiUrl = "$cleanUrl/api/generate"
$current = ""
if (Test-Path $stateFile) {
  $current = (Get-Content $stateFile -Raw).Trim()
}

if ($current -eq $apiUrl) {
  "[$(Get-Date -Format o)] Sin cambios de tunnel: $apiUrl" | Add-Content -Path $syncLog
  exit 0
}

Push-Location $root
try {
  "[$(Get-Date -Format o)] Actualizando Vercel a: $apiUrl" | Add-Content -Path $syncLog

  try {
    npx vercel env rm INTERNAL_AI_API_URL production --yes | Out-Null
  } catch {
    # Si no existe, continuamos.
  }

  $apiUrl | npx vercel env add INTERNAL_AI_API_URL production | Out-Null
  npx vercel --prod --yes | Out-Null

  Set-Content -Path $stateFile -Value $apiUrl
  "[$(Get-Date -Format o)] Vercel actualizado correctamente: $apiUrl" | Add-Content -Path $syncLog
} catch {
  "[$(Get-Date -Format o)] Error actualizando Vercel: $($_.Exception.Message)" | Add-Content -Path $syncLog
} finally {
  Pop-Location
}
