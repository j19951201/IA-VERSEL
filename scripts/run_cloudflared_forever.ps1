$ErrorActionPreference = "Continue"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$logDir = Join-Path $root "runtime-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "cloudflared.log"
$sessionLog = Join-Path $logDir "cloudflared-session.log"
$exe = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$syncScript = Join-Path $root "scripts\sync_vercel_tunnel.ps1"

if (-not (Test-Path $exe)) {
  "[$(Get-Date -Format o)] ERROR: cloudflared no encontrado en $exe" | Add-Content -Path $logFile
  exit 1
}

while ($true) {
  "[$(Get-Date -Format o)] Iniciando cloudflared..." | Add-Content -Path $logFile

  if (Test-Path $sessionLog) {
    Remove-Item $sessionLog -Force -ErrorAction SilentlyContinue
  }

  $args = "tunnel --url http://127.0.0.1:11436 --protocol auto --no-autoupdate"
  $proc = Start-Process -FilePath $exe -ArgumentList $args -PassThru -WindowStyle Hidden -RedirectStandardOutput $sessionLog

  $foundUrl = $null
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    if (-not (Test-Path $sessionLog)) {
      continue
    }

    $text = Get-Content $sessionLog -Raw -ErrorAction SilentlyContinue
    if ([string]::IsNullOrWhiteSpace($text)) {
      continue
    }

    Add-Content -Path $logFile -Value $text
    Clear-Content -Path $sessionLog -ErrorAction SilentlyContinue

    $matches = [regex]::Matches($text, "https://[a-z0-9-]+\\.trycloudflare\\.com")
    if ($matches.Count -gt 0) {
      $foundUrl = $matches[$matches.Count - 1].Value
      break
    }
  }

  if ($foundUrl) {
    try {
      & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $syncScript -TunnelUrl $foundUrl
      "[$(Get-Date -Format o)] URL detectada y sincronizada: $foundUrl" | Add-Content -Path $logFile
    } catch {
      "[$(Get-Date -Format o)] Error sincronizando Vercel: $($_.Exception.Message)" | Add-Content -Path $logFile
    }
  } else {
    "[$(Get-Date -Format o)] No se detecto URL de quick tunnel en los primeros 60s" | Add-Content -Path $logFile
  }

  try {
    Wait-Process -Id $proc.Id -ErrorAction SilentlyContinue
    $code = $proc.ExitCode
  } catch {
    $code = 1
  }

  if (Test-Path $sessionLog) {
    $remaining = Get-Content $sessionLog -Raw -ErrorAction SilentlyContinue
    if (-not [string]::IsNullOrWhiteSpace($remaining)) {
      Add-Content -Path $logFile -Value $remaining
    }
  }

  "[$(Get-Date -Format o)] cloudflared salio con codigo: $code. Reinicio en 8s" | Add-Content -Path $logFile
  Start-Sleep -Seconds 8
}
