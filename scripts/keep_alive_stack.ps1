$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$startScript = Join-Path $root "scripts\start_ai_stack.ps1"

try {
  & $startScript -FromWatchdog
} catch {
  $logDir = Join-Path $root "runtime-logs"
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $errLog = Join-Path $logDir "watchdog-errors.log"
  "[$(Get-Date -Format o)] $($_.Exception.Message)" | Add-Content -Path $errLog
}
