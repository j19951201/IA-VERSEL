$root = 'C:\Users\joanc\Downloads\Nueva carpeta (6)'
$scriptFile = Join-Path $root 'scripts\compile_and_run_launcher_v2.ps1'

# Cerrar instancias previas
Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match 'Control Comercial' } | ForEach-Object { 
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue 
}

# Lanzar en un job separado para que no bloquee
Start-Job -Name "IAJurisLauncher" -ScriptBlock {
    param($script, $root)
    Set-Location $root
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File $script
} -ArgumentList $scriptFile, $root | Out-Null

# Esperar un poco para que la ventana se abra
Start-Sleep -Milliseconds 500
