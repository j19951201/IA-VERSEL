param(
  [switch]$FromWatchdog
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$LogsDir = Join-Path $Root "runtime-logs"
$PidsDir = Join-Path $Root "runtime-pids"

New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null
New-Item -ItemType Directory -Force -Path $PidsDir | Out-Null

$SecureProxyPort = "11436"
$SecureProxyToken = "corvinus-hard-token"
$SecureProxyAllowedIps = "0.0.0.0/0"
$OllamaUpstream = "http://127.0.0.1:11434"
$CloudflaredExe = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

function Test-PortOpen {
  param([int]$Port)
  try {
    $test = Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -WarningAction SilentlyContinue
    return [bool]$test.TcpTestSucceeded
  } catch {
    return $false
  }
}

function Ensure-Process {
  param(
    [string]$Name,
    [scriptblock]$TestBlock,
    [scriptblock]$StartBlock
  )

  if (& $TestBlock) {
    Write-Host "[OK] $Name ya esta corriendo"
    return
  }

  Write-Host "[START] iniciando $Name"
  & $StartBlock
  Start-Sleep -Seconds 2

  if (& $TestBlock) {
    Write-Host "[OK] $Name iniciado"
  } else {
    Write-Host "[WARN] $Name no pudo iniciar correctamente"
  }
}

Ensure-Process -Name "Ollama" -TestBlock {
  try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 8
    return $true
  } catch {
    return $false
  }
} -StartBlock {
  $log = Join-Path $LogsDir "ollama.log"
  $proc = Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -PassThru -RedirectStandardOutput $log -RedirectStandardError $log
  Set-Content -Path (Join-Path $PidsDir "ollama.pid") -Value $proc.Id
}

# Validar que el modelo Ollama exista y recrearlo si hace falta para el cerebro unico
function Ensure-OllamaModel {
  param(
    [string]$ModelName = "corvinus-unico:latest",
    [string]$ModelfilePath = $null
  )

  if ($null -eq $ModelfilePath) {
    $ModelfilePath = Join-Path $Root "models\Modelfile.corvinus-unico"
  }
  
  try {
    $tags = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 8
    $exists = $tags.models | Where-Object { $_.name -eq $ModelName }

    if ($exists) {
      Write-Host "[OK] Modelo Ollama '$ModelName' disponible" -ForegroundColor Green
      return
    }
    if (-not (Test-Path $ModelfilePath)) {
      Write-Host "[WARN] Modelfile no encontrado en: $ModelfilePath" -ForegroundColor Yellow
      return
    }

    Write-Host "[INFO] Registrando modelo Ollama: $ModelName" -ForegroundColor Cyan
    & ollama create $ModelName -f $ModelfilePath 2>&1 | Tee-Object -FilePath (Join-Path $LogsDir "ollama_create.log") -Append

    if ($LASTEXITCODE -eq 0) {
      Write-Host "[OK] Modelo Ollama registrado: $ModelName" -ForegroundColor Green
    } else {
      Write-Host "[WARN] Error al registrar modelo: codigo $LASTEXITCODE" -ForegroundColor Yellow
    }
    return
  } catch {
    Write-Host "[WARN] No se pudo verificar modelos en Ollama: $_" -ForegroundColor Yellow
  }
}

Ensure-OllamaModel -ModelName "corvinus-unico:latest" -ModelfilePath (Join-Path $Root "models\Modelfile.corvinus-unico")

Ensure-Process -Name "Secure Proxy" -TestBlock {
  try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:11436/health" -TimeoutSec 8
    return [bool]$health.ok
  } catch {
    return $false
  }
} -StartBlock {
  $log = Join-Path $LogsDir "secure_proxy.log"
  $proxyScript = Join-Path $Root "scripts\secure_ollama_proxy.js"

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "node"
  $psi.Arguments = ('"{0}"' -f $proxyScript)
  $psi.WorkingDirectory = $Root
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  $psi.Environment["SECURE_PROXY_PORT"] = $SecureProxyPort
  $psi.Environment["SECURE_PROXY_TOKEN"] = $SecureProxyToken
  $psi.Environment["SECURE_PROXY_ALLOWED_IPS"] = $SecureProxyAllowedIps
  $psi.Environment["OLLAMA_UPSTREAM"] = $OllamaUpstream

  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  $null = $proc.Start()

  try {
    $stdWriter = [System.IO.StreamWriter]::new($log, $true)
  } catch {
    $fallbackLog = Join-Path $LogsDir ("secure_proxy_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")
    $stdWriter = [System.IO.StreamWriter]::new($fallbackLog, $true)
    Write-Host "[WARN] secure_proxy.log bloqueado; usando $fallbackLog"
  }
  Register-ObjectEvent -InputObject $proc -EventName OutputDataReceived -Action {
    if ($EventArgs.Data) { $Event.MessageData.WriteLine($EventArgs.Data); $Event.MessageData.Flush() }
  } -MessageData $stdWriter | Out-Null
  Register-ObjectEvent -InputObject $proc -EventName ErrorDataReceived -Action {
    if ($EventArgs.Data) { $Event.MessageData.WriteLine($EventArgs.Data); $Event.MessageData.Flush() }
  } -MessageData $stdWriter | Out-Null
  $proc.BeginOutputReadLine()
  $proc.BeginErrorReadLine()

  Set-Content -Path (Join-Path $PidsDir "secure_proxy.pid") -Value $proc.Id
}

Ensure-Process -Name "Cloudflare Tunnel" -TestBlock {
  try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:20241/metrics" -TimeoutSec 5
    return [bool]($resp -match "cloudflared")
  } catch {
    $running = Get-CimInstance Win32_Process -Filter "name = 'powershell.exe'" -ErrorAction SilentlyContinue | Where-Object {
      $_.CommandLine -like "*run_cloudflared_forever.ps1*"
    }
    return [bool]$running
  }
} -StartBlock {
  $runnerScript = Join-Path $Root "scripts\run_cloudflared_forever.ps1"
  $args = "-NoProfile -ExecutionPolicy Bypass -File `"$runnerScript`""
  $proc = Start-Process -FilePath "powershell.exe" -ArgumentList $args -WindowStyle Hidden -PassThru
  Set-Content -Path (Join-Path $PidsDir "cloudflared.pid") -Value $proc.Id
}

Write-Host "[DONE] Stack revisado y levantado"
