@echo off
REM Lanzador del IA Juris Control Comercial
cd /d "C:\Users\joanc\Downloads\Nueva carpeta (6)"

REM Cerrar instancias previas
taskkill /F /IM powershell.exe /T /FI "WINDOWTITLE eq *Control Comercial*" >nul 2>&1

REM Lanzar PowerShell en background con START
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Normal -File "C:\Users\joanc\Downloads\Nueva carpeta (6)\scripts\compile_and_run_launcher_v2.ps1"

REM Esperar que se abra la ventana
timeout /t 2 /nobreak >nul

exit /b 0


