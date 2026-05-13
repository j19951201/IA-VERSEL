$ErrorActionPreference = "Continue"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$startScript = Join-Path $root "scripts\start_ai_stack.ps1"
$logDir = Join-Path $root "runtime-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$loopLog = Join-Path $logDir "stack-loop.log"

while ($true) {
  try {
    & $startScript
    "[$(Get-Date -Format o)] Watchdog tick OK" | Add-Content -Path $loopLog
  } catch {
    "[$(Get-Date -Format o)] Watchdog error: $($_.Exception.Message)" | Add-Content -Path $loopLog
  }

  Start-Sleep -Seconds 120
}
