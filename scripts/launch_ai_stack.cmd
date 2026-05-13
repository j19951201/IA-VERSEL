@echo off
set ROOT=C:\Users\joanc\Downloads\Nueva carpeta (6)
start "IAJuris-Stack" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\start_ai_stack_loop.ps1"
exit /b 0
