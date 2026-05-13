@echo off
REM Proyecto EliosMind 2B - Windows Installer Batch
REM Este script instala la aplicación como cualquier software de Windows

setlocal enabledelayedexpansion

color 0B
cls

REM Verificar permisos de administrador
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if errorlevel 1 (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║                 ERROR: PERMISOS INSUFICIENTES                 ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Este instalador requiere permisos de administrador.
    echo.
    echo Por favor, ejecute como administrador:
    echo 1. Haz clic derecho en este archivo
    echo 2. Selecciona "Ejecutar como administrador"
    echo.
    pause
    exit /b 1
)

setlocal

set "APP_NAME=Proyecto EliosMind 2B"
set "APP_VERSION=1.0.0"
set "INSTALL_DIR=%ProgramFiles%\EliosMind2B"
set "SOURCE_DIR=%~dp0"
set "PROJECT_ROOT=%SOURCE_DIR%.."
set "DESKTOP=%USERPROFILE%\Desktop"

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          Proyecto EliosMind 2B - Cerebro GGUF                 ║
echo ║                      Instalador v%APP_VERSION%                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set /p "CHOICE=¿Deseas INSTALAR o DESINSTALAR? (I/D): "

if /i "%CHOICE%"=="I" goto INSTALL
if /i "%CHOICE%"=="D" goto UNINSTALL
if /i "%CHOICE%"=="i" goto INSTALL
if /i "%CHOICE%"=="d" goto UNINSTALL

echo Opción inválida.
pause
exit /b 1

:INSTALL
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    INICIANDO INSTALACIÓN                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/6] Creando directorios de instalación...
if exist "%INSTALL_DIR%" (
    echo   ! Directorio existente, eliminando...
    rmdir /s /q "%INSTALL_DIR%" >nul 2>&1
)
mkdir "%INSTALL_DIR%" >nul 2>&1
mkdir "%INSTALL_DIR%\config" >nul 2>&1
mkdir "%INSTALL_DIR%\logs" >nul 2>&1
mkdir "%INSTALL_DIR%\scripts" >nul 2>&1
echo   [OK] Directorios creados

echo [2/6] Copiando launcher ejecutable...
if exist "%DESKTOP%\proyecto eliosmind2b.exe" (
    copy "%DESKTOP%\proyecto eliosmind2b.exe" "%INSTALL_DIR%\EliosMind2B.exe" >nul 2>&1
    echo   [OK] Launcher copiado
) else (
    echo   [ADVERTENCIA] Launcher no encontrado en escritorio
)

echo [3/6] Copiando archivos de configuración...
if exist "%PROJECT_ROOT%\.env.local" copy "%PROJECT_ROOT%\.env.local" "%INSTALL_DIR%\.env.local" >nul 2>&1
if exist "%PROJECT_ROOT%\.env.development.local" copy "%PROJECT_ROOT%\.env.development.local" "%INSTALL_DIR%\.env.development.local" >nul 2>&1
if exist "%PROJECT_ROOT%\proyecto_eliosmind2b.config.json" copy "%PROJECT_ROOT%\proyecto_eliosmind2b.config.json" "%INSTALL_DIR%\proyecto_eliosmind2b.config.json" >nul 2>&1
echo   [OK] Archivos de configuración copiados

echo [4/6] Copiando scripts auxiliares...
if exist "%SOURCE_DIR%start_ai_stack.ps1" copy "%SOURCE_DIR%start_ai_stack.ps1" "%INSTALL_DIR%\scripts\" >nul 2>&1
if exist "%SOURCE_DIR%start_ai_stack_loop.ps1" copy "%SOURCE_DIR%start_ai_stack_loop.ps1" "%INSTALL_DIR%\scripts\" >nul 2>&1
if exist "%SOURCE_DIR%secure_ollama_proxy.js" copy "%SOURCE_DIR%secure_ollama_proxy.js" "%INSTALL_DIR%\scripts\" >nul 2>&1
echo   [OK] Scripts copiados

echo [5/6] Creando documentación...
(
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║         Proyecto EliosMind 2B - Cerebro GGUF Launcher        ║
    echo ║                        v%APP_VERSION%                            ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo [OK] INSTALACIÓN COMPLETADA
    echo.
    echo Ubicación: %INSTALL_DIR%
    echo.
    echo CÓMO USAR:
    echo ─────────────────────────────────────────────────────────────────
    echo 1. Haz clic en el acceso directo "EliosMind 2B" en el Escritorio
    echo 2. O busca "Proyecto EliosMind 2B" en el Menú Inicio
    echo 3. O ejecuta: %INSTALL_DIR%\EliosMind2B.exe
    echo.
    echo ARCHIVOS DE CONFIGURACIÓN:
    echo ─────────────────────────────────────────────────────────────────
    echo - .env.local                    [Variables de entorno locales]
    echo - .env.development.local        [Variables de desarrollo]
    echo - proyecto_eliosmind2b.config.json [Configuración de monitoreo]
    echo.
    echo DESINSTALAR:
    echo ─────────────────────────────────────────────────────────────────
    echo 1. Panel de Control ^> Programas ^> Desinstalar un programa
    echo 2. Busca "Proyecto EliosMind 2B" y haz clic en "Desinstalar"
    echo.
) > "%INSTALL_DIR%\README.txt"
echo   [OK] Documentación creada

echo [6/6] Registrando aplicación en Windows...
reg add "HKCU\Software\EliosMind2B" /v "InstallLocation" /d "%INSTALL_DIR%" /f >nul 2>&1
reg add "HKCU\Software\EliosMind2B" /v "DisplayName" /d "%APP_NAME%" /f >nul 2>&1
reg add "HKCU\Software\EliosMind2B" /v "DisplayVersion" /d "%APP_VERSION%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" /v "DisplayName" /d "%APP_NAME%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" /v "DisplayVersion" /d "%APP_VERSION%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" /v "InstallLocation" /d "%INSTALL_DIR%" /f >nul 2>&1
echo   [OK] Aplicación registrada

echo.
echo Creando accesos directos...

REM Crear acceso directo en Escritorio usando PowerShell
powershell -NoProfile -ExecutionPolicy Bypass ^
  -Command "^
    $shell = New-Object -ComObject WScript.Shell; ^
    $shortcut = $shell.CreateShortCut('%DESKTOP%\Proyecto EliosMind 2B.lnk'); ^
    $shortcut.TargetPath = '%INSTALL_DIR%\EliosMind2B.exe'; ^
    $shortcut.WorkingDirectory = '%INSTALL_DIR%'; ^
    $shortcut.Description = 'Launcher del Cerebro GGUF para IA Juris'; ^
    $shortcut.Save(); ^
    Write-Output 'OK'
  " >nul 2>&1

REM Crear carpeta en Menú Inicio
mkdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EliosMind2B" >nul 2>&1

REM Crear acceso directo en Menú Inicio
powershell -NoProfile -ExecutionPolicy Bypass ^
  -Command "^
    $shell = New-Object -ComObject WScript.Shell; ^
    $shortcut = $shell.CreateShortCut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\EliosMind2B\Proyecto EliosMind 2B.lnk'); ^
    $shortcut.TargetPath = '%INSTALL_DIR%\EliosMind2B.exe'; ^
    $shortcut.WorkingDirectory = '%INSTALL_DIR%'; ^
    $shortcut.Description = 'Launcher del Cerebro GGUF para IA Juris'; ^
    $shortcut.Save(); ^
    Write-Output 'OK'
  " >nul 2>&1

echo   [OK] Acceso directo en Escritorio
echo   [OK] Acceso directo en Menú Inicio

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     [OK] INSTALACIÓN COMPLETADA EXITOSAMENTE                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Ubicación: %INSTALL_DIR%
echo.
echo Encuentra el acceso directo en:
echo   - Escritorio: "Proyecto EliosMind 2B"
echo   - Menú Inicio: Busca "Proyecto EliosMind 2B"
echo.
pause
exit /b 0

:UNINSTALL
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  INICIANDO DESINSTALACIÓN                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set /p "CONFIRM=¿Estás seguro de que deseas desinstalar %APP_NAME%? (S/N): "

if /i not "%CONFIRM%"=="S" (
    if /i not "%CONFIRM%"=="s" (
        echo Desinstalación cancelada.
        pause
        exit /b 0
    )
)

echo [1/4] Eliminando accesos directos...
del "%DESKTOP%\Proyecto EliosMind 2B.lnk" >nul 2>&1
rmdir /s /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\EliosMind2B" >nul 2>&1
echo   [OK] Accesos directos eliminados

echo [2/4] Eliminando archivos de instalación...
rmdir /s /q "%INSTALL_DIR%" >nul 2>&1
echo   [OK] Archivos eliminados

echo [3/4] Eliminando entradas de registro...
reg delete "HKCU\Software\EliosMind2B" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" /f >nul 2>&1
echo   [OK] Entradas de registro eliminadas

echo [4/4] Limpieza final...
echo   [OK] Limpieza completada

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║    [OK] DESINSTALACIÓN COMPLETADA EXITOSAMENTE               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
exit /b 0
