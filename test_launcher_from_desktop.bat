@echo off
REM Script de prueba para simular el clic en el acceso directo del Desktop
REM Este script verifica que el acceso directo funciona correctamente

echo ===============================================
echo  IA Juris - Control Comercial
echo  Prueba de Acceso Directo
echo ===============================================
echo.

REM Obtener ruta del acceso directo
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\IA Juris Control Comercial.lnk"

echo [*] Buscando acceso directo en: %SHORTCUT%
if not exist "%SHORTCUT%" (
    echo [ERROR] Acceso directo no encontrado
    pause
    exit /b 1
)
echo [OK] Acceso directo encontrado

echo.
echo [*] Cerrando instancias previas del launcher...
taskkill /F /IM powershell.exe /T /FI "WINDOWTITLE eq *Control Comercial*" >nul 2>&1

echo [*] Lanzando acceso directo...
start "" "%SHORTCUT%"

echo [*] Esperando a que se abra la ventana...
timeout /t 6 /nobreak >nul

echo.
echo [OK] Launcher debería estar abierto en la pantalla
echo [*] Si no ves la ventana, verifica en la bandeja del sistema (taskbar)
echo.
pause
