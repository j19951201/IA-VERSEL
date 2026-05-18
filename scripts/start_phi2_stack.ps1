param()

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ConfigPath = Join-Path $Root "proyecto_eliosmind2b.config.json"

if (-not (Test-Path $ConfigPath)) {
  throw "No se encontro la configuracion: $ConfigPath"
}

$config = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json

$serverExe = if ($config.LlamaServerExe) { [string]$config.LlamaServerExe } else { "C:\\llama.cpp\\server.exe" }
$modelPath = if ($config.ModelPath) { [string]$config.ModelPath } else { "D:\\phi-2-GGUF\\phi-2.Q4_K_M.gguf" }
$proxyBaseUrl = if ($config.ProxyBaseUrl) { [string]$config.ProxyBaseUrl } else { "http://127.0.0.1:8000" }
$proxyUri = [Uri]$proxyBaseUrl
$port = if ($proxyUri.Port -gt 0) { $proxyUri.Port } else { 8000 }

if (-not (Test-Path $serverExe)) {
  throw "No se encontro llama.cpp server en: $serverExe"
}

if (-not (Test-Path $modelPath)) {
  throw "No se encontro el modelo GGUF en: $modelPath"
}

$alreadyRunning = $false
try {
  $test = Test-NetConnection -ComputerName "127.0.0.1" -Port $port -WarningAction SilentlyContinue
  $alreadyRunning = [bool]$test.TcpTestSucceeded
} catch {
  $alreadyRunning = $false
}

if ($alreadyRunning) {
  Write-Host "[OK] llama.cpp ya responde en el puerto $port" -ForegroundColor Green
  exit 0
}

$logsDir = Join-Path $Root "runtime-logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
$logPath = Join-Path $logsDir "phi2_llama_server.log"

$argumentList = @(
  "--model", $modelPath,
  "--host", "127.0.0.1",
  "--port", "$port"
)

$proc = Start-Process -FilePath $serverExe -ArgumentList $argumentList -WindowStyle Hidden -PassThru -RedirectStandardOutput $logPath -RedirectStandardError $logPath
Write-Host "[START] llama.cpp iniciado con PID $($proc.Id) usando $modelPath" -ForegroundColor Cyan
