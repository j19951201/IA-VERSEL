$ErrorActionPreference = "Continue"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$startScript = Join-Path $root "scripts\start_ai_stack.ps1"
$watchdogScript = Join-Path $root "scripts\keep_alive_stack.ps1"
$stackLoopScript = Join-Path $root "scripts\start_ai_stack_loop.ps1"
$startupFolder = [Environment]::GetFolderPath("Startup")
$startupFallbackCmd = Join-Path $startupFolder "IAJuris-Stack-Startup.cmd"

function Install-StartupFallback {
	$cmdLines = @(
		'@echo off',
		('start "IAJuris-Stack" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $stackLoopScript),
		'exit /b 0'
	)
	Set-Content -Path $startupFallbackCmd -Value $cmdLines -Encoding ASCII
	Write-Host "[INFO] Fallback de inicio creado en: $startupFallbackCmd"
}

$startupPersistenceMode = ""

Write-Host "[1/4] Configurando energia para NO dormir al cerrar tapa..."
powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /SETACTIVE SCHEME_CURRENT

Write-Host "[2/4] Registrando tarea de inicio del stack al arrancar Windows..."
$startupTaskName = "IAJuris-Stack-Startup"
$startupAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`""
$startupTrigger = New-ScheduledTaskTrigger -AtStartup
$startupPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
try {
	Unregister-ScheduledTask -TaskName $startupTaskName -Confirm:$false -ErrorAction SilentlyContinue
} catch {}
$startupTaskRegistered = $false
try {
	Register-ScheduledTask -TaskName $startupTaskName -Action $startupAction -Trigger $startupTrigger -Principal $startupPrincipal -Description "Inicia Ollama + Proxy + Tunnel al arrancar Windows" -ErrorAction Stop | Out-Null
	$startupTaskRegistered = $true
	$startupPersistenceMode = "tarea programada de inicio"
} catch {
	Write-Host "[WARN] No se pudo registrar la tarea de inicio: $($_.Exception.Message)"
	Install-StartupFallback
	$startupPersistenceMode = "carpeta Inicio del usuario"
}

Write-Host "[3/4] Registrando watchdog cada 2 minutos..."
$watchdogTaskName = "IAJuris-Stack-Watchdog"
$watchdogAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$watchdogScript`""
$watchdogTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 2)
$watchdogPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
try {
	Unregister-ScheduledTask -TaskName $watchdogTaskName -Confirm:$false -ErrorAction SilentlyContinue
} catch {}
$watchdogTaskRegistered = $false
try {
	Register-ScheduledTask -TaskName $watchdogTaskName -Action $watchdogAction -Trigger $watchdogTrigger -Principal $watchdogPrincipal -Description "Watchdog de IA Juris: reinicia stack si se cae" -ErrorAction Stop | Out-Null
	$watchdogTaskRegistered = $true
} catch {
	Write-Host "[WARN] No se pudo registrar la tarea watchdog: $($_.Exception.Message)"
	if (-not (Test-Path $startupFallbackCmd)) {
		Install-StartupFallback
	}
	if (-not $startupPersistenceMode) {
		$startupPersistenceMode = "carpeta Inicio del usuario"
	}
}

Write-Host "[4/4] Ejecutando arranque inmediato del stack..."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $startScript

Write-Host ""
Write-Host "[OK] Modo permanente configurado."
Write-Host "- Tapa cerrada: no suspende"
if ($startupTaskRegistered) {
	Write-Host "- Ollama/proxy/tunnel: inician con Windows mediante tarea programada"
} else {
	Write-Host "- Ollama/proxy/tunnel: inician al iniciar sesion mediante carpeta Inicio"
}
if ($watchdogTaskRegistered) {
	Write-Host "- Watchdog: reinicia servicios caidos automaticamente"
} else {
	Write-Host "- Watchdog: cubierto por start_ai_stack_loop.ps1 desde la carpeta Inicio"
}
if ($startupPersistenceMode) {
	Write-Host "- Modo de persistencia activo: $startupPersistenceMode"
}
