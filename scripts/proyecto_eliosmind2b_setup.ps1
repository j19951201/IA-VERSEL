# Proyecto EliosMind 2B - Windows Installer PowerShell Script
# Este script instala la aplicación como cualquier software de Windows

param(
    [ValidateSet('install', 'uninstall')]
    [string]$Action = 'install'
)

$ErrorActionPreference = 'Stop'

# Configuración
$AppName = "Proyecto EliosMind 2B"
$AppVersion = "1.0.0"
$InstallDir = "$env:ProgramFiles\EliosMind2B"
$SourceDir = Split-Path -Parent $PSCommandPath
$ProjectRoot = Split-Path -Parent $SourceDir

# Requiere elevación de privilegios
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Este instalador requiere permisos de administrador." -ForegroundColor Red
    exit 1
}

function Install-App {
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Instalando $AppName" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    
    # Crear directorio de instalación
    Write-Host "[1/6] Creando directorios de instalación..."
    if (Test-Path $InstallDir) {
        Remove-Item $InstallDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    New-Item -ItemType Directory -Path "$InstallDir\config" -Force | Out-Null
    New-Item -ItemType Directory -Path "$InstallDir\logs" -Force | Out-Null
    New-Item -ItemType Directory -Path "$InstallDir\scripts" -Force | Out-Null
    Write-Host "   ✓ Directorios creados en: $InstallDir" -ForegroundColor Green
    
    # Copiar launcher ejecutable
    Write-Host "[2/6] Copiando launcher ejecutable..."
    $launcherExe = "$env:USERPROFILE\Desktop\proyecto eliosmind2b.exe"
    if (Test-Path $launcherExe) {
        Copy-Item -Path $launcherExe -Destination "$InstallDir\EliosMind2B.exe" -Force
        Write-Host "   ✓ Launcher copiado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Launcher no encontrado en escritorio (verificar compilación)" -ForegroundColor Yellow
    }
    
    # Copiar archivos de configuración
    Write-Host "[3/6] Copiando archivos de configuración..."
    $configFiles = @(
        @{ Source = "$ProjectRoot\.env.local"; Dest = "$InstallDir\.env.local" },
        @{ Source = "$ProjectRoot\.env.development.local"; Dest = "$InstallDir\.env.development.local" },
        @{ Source = "$ProjectRoot\proyecto_eliosmind2b.config.json"; Dest = "$InstallDir\proyecto_eliosmind2b.config.json" }
    )
    
    foreach ($file in $configFiles) {
        if (Test-Path $file.Source) {
            Copy-Item -Path $file.Source -Destination $file.Dest -Force
        }
    }
    Write-Host "   ✓ Archivos de configuración copiados" -ForegroundColor Green
    
    # Copiar scripts
    Write-Host "[4/6] Copiando scripts auxiliares..."
    $scriptFiles = @(
        "start_ai_stack.ps1",
        "start_ai_stack_loop.ps1",
        "secure_ollama_proxy.js"
    )
    
    foreach ($script in $scriptFiles) {
        $srcScript = "$SourceDir\$script"
        if (Test-Path $srcScript) {
            Copy-Item -Path $srcScript -Destination "$InstallDir\scripts\" -Force
        }
    }
    Write-Host "   ✓ Scripts copiados" -ForegroundColor Green
    
    # Crear archivo README
    Write-Host "[5/6] Creando documentación..."
    $readmeContent = @"
╔═══════════════════════════════════════════════════════════════╗
║         Proyecto EliosMind 2B - Cerebro GGUF Launcher        ║
║                        v$AppVersion                              ║
╚═══════════════════════════════════════════════════════════════╝

✓ INSTALACIÓN COMPLETADA

Ubicación: $InstallDir

CÓMO USAR:
─────────────────────────────────────────────────────────────────
1. Haz clic en el acceso directo "EliosMind 2B" en el Menú Inicio
2. O ejecuta: $InstallDir\EliosMind2B.exe

ARCHIVOS DE CONFIGURACIÓN:
─────────────────────────────────────────────────────────────────
• .env.local                    - Variables de entorno locales
• .env.development.local        - Variables de desarrollo
• proyecto_eliosmind2b.config.json - Configuración de monitoreo

DESINSTALAR:
─────────────────────────────────────────────────────────────────
• Panel de Control > Programas > Desinstalar un programa
• Busca "Proyecto EliosMind 2B" y haz clic en "Desinstalar"
• O ejecuta: "$InstallDir\uninstall.ps1" con permisos de admin

COMPONENTES INSTALADOS:
─────────────────────────────────────────────────────────────────
✓ Launcher EliosMind 2B.exe      - Aplicación principal
✓ Scripts de inicialización      - Stack de IA automático
✓ Configuración del cerebro GGUF - Modelos y tokens
✓ Acceso directo en Escritorio   - Inicio rápido

SOPORTE:
─────────────────────────────────────────────────────────────────
Los logs de monitoreo se guardan en: $InstallDir\logs\

NOTA IMPORTANTE:
─────────────────────────────────────────────────────────────────
Requiere:
• Windows 10/11 (64-bit)
• .NET Framework 4.0+
• PowerShell 5.0+
• Node.js (para Vercel dev)

"@
    Set-Content -Path "$InstallDir\README.txt" -Value $readmeContent -Encoding UTF8
    Write-Host "   ✓ Documentación creada" -ForegroundColor Green
    
    # Crear entradas de registro
    Write-Host "[6/6] Registrando aplicación en Windows..."
    $regPath = "HKCU:\Software\EliosMind2B"
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    
    Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value $InstallDir
    Set-ItemProperty -Path $regPath -Name "DisplayName" -Value $AppName
    Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value $AppVersion
    
    # Entradas de desinstalación en registro
    $uninstallPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B"
    if (-not (Test-Path $uninstallPath)) {
        New-Item -Path $uninstallPath -Force | Out-Null
    }
    
    Set-ItemProperty -Path $uninstallPath -Name "DisplayName" -Value $AppName
    Set-ItemProperty -Path $uninstallPath -Name "DisplayVersion" -Value $AppVersion
    Set-ItemProperty -Path $uninstallPath -Name "InstallLocation" -Value $InstallDir
    Set-ItemProperty -Path $uninstallPath -Name "UninstallString" -Value "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$InstallDir\uninstall.ps1`""
    
    Write-Host "   ✓ Aplicación registrada en Windows" -ForegroundColor Green
    
    # Crear accesos directos
    Write-Host ""
    Write-Host "Creando accesos directos..."
    
    # Menú Inicio
    $startMenuDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\EliosMind2B"
    New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null
    
    $shell = New-Object -ComObject WScript.Shell
    
    # Acceso directo principal
    $shortcut = $shell.CreateShortCut("$startMenuDir\Proyecto EliosMind 2B.lnk")
    $shortcut.TargetPath = "$InstallDir\EliosMind2B.exe"
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.Description = "Launcher del Cerebro GGUF para IA Juris"
    $shortcut.Save()
    
    # Acceso directo a carpeta de instalación
    $shortcut = $shell.CreateShortCut("$startMenuDir\Carpeta de Instalación.lnk")
    $shortcut.TargetPath = $InstallDir
    $shortcut.Save()
    
    # Acceso directo a desinstalar
    $shortcut = $shell.CreateShortCut("$startMenuDir\Desinstalar.lnk")
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$InstallDir\uninstall.ps1`""
    $shortcut.Description = "Desinstalar Proyecto EliosMind 2B"
    $shortcut.Save()
    
    # Escritorio
    $shortcut = $shell.CreateShortCut("$env:USERPROFILE\Desktop\Proyecto EliosMind 2B.lnk")
    $shortcut.TargetPath = "$InstallDir\EliosMind2B.exe"
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.Description = "Launcher del Cerebro GGUF para IA Juris"
    $shortcut.Save()
    
    Write-Host "   ✓ Acceso directo en Escritorio creado" -ForegroundColor Green
    Write-Host "   ✓ Acceso directo en Menú Inicio creado" -ForegroundColor Green
    
    # Copiar script de desinstalación
    Copy-Item -Path $PSCommandPath -Destination "$InstallDir\uninstall.ps1" -Force
    
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✓ INSTALACIÓN COMPLETADA EXITOSAMENTE                      ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ubicación de instalación: $InstallDir" -ForegroundColor Cyan
    Write-Host "Encuentra el acceso directo en: Escritorio y Menú Inicio" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para iniciar la aplicación, haz doble clic en el icono del Escritorio" -ForegroundColor Yellow
    Write-Host ""
}

function Uninstall-App {
    Write-Host "================================" -ForegroundColor Red
    Write-Host "Desinstalando $AppName" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Confirmar desinstalación
    $confirm = Read-Host "¿Estás seguro de que deseas desinstalar $AppName? (S/N)"
    if ($confirm -ne 'S' -and $confirm -ne 's') {
        Write-Host "Desinstalación cancelada." -ForegroundColor Yellow
        return
    }
    
    Write-Host "[1/4] Eliminando accesos directos..."
    Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\EliosMind2B" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:USERPROFILE\Desktop\Proyecto EliosMind 2B.lnk" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Accesos directos eliminados" -ForegroundColor Green
    
    Write-Host "[2/4] Eliminando archivos de instalación..."
    Remove-Item $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Archivos eliminados" -ForegroundColor Green
    
    Write-Host "[3/4] Eliminando entradas de registro..."
    Remove-Item "HKCU:\Software\EliosMind2B" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Entradas de registro eliminadas" -ForegroundColor Green
    
    Write-Host "[4/4] Limpieza final..."
    Write-Host "   ✓ Limpieza completada" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✓ DESINSTALACIÓN COMPLETADA EXITOSAMENTE                   ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
}

# Ejecutar acción
if ($Action -eq 'install') {
    Install-App
} elseif ($Action -eq 'uninstall') {
    Uninstall-App
}
