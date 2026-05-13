; Proyecto EliosMind 2B - Windows Installer
; NSIS Script v3.0

;--------------------------------
; Configuración General
;--------------------------------

Name "Proyecto EliosMind 2B"
OutFile "..\proyecto_eliosmind2b_installer.exe"
InstallDir "$PROGRAMFILES\EliosMind2B"
InstallDirRegKey HKCU "Software\EliosMind2B" "InstallLocation"

; Requerir privilegios de administrador
RequestExecutionLevel admin

; Configuración de interfaz
!include "MUI2.nsh"
!insertmacro MUI_LANGUAGE "Spanish"

;--------------------------------
; Propiedades del Instalador
;--------------------------------

VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "Proyecto EliosMind 2B"
VIAddVersionKey "CompanyName" "EliosMind"
VIAddVersionKey "FileDescription" "Cerebro GGUF Launcher para IA Juris"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "ProductVersion" "1.0.0.0"

;--------------------------------
; Páginas del Instalador
;--------------------------------

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

;--------------------------------
; Secciones de Instalación
;--------------------------------

Section "Instalar Proyecto EliosMind 2B" SecInstall

  SetOutPath "$INSTDIR"
  
  ; Crear directorios
  CreateDirectory "$INSTDIR"
  CreateDirectory "$INSTDIR\config"
  CreateDirectory "$INSTDIR\logs"
  CreateDirectory "$INSTDIR\scripts"
  
  ; Copiar el launcher ejecutable
  File "..\public\..\scripts\proyecto_eliosmind2b_launcher.cs.exe"
  
  ; Copiar archivos de configuración
  File "..\\.env.local"
  File "..\\.env.development.local"
  File "..\public\..\proyecto_eliosmind2b.config.json"
  
  ; Copiar scripts de utilidad
  File "..\scripts\start_ai_stack.ps1"
  File "..\scripts\start_ai_stack_loop.ps1"
  File "..\scripts\secure_ollama_proxy.js"
  
  ; Crear archivo README de instalación
  FileOpen $0 "$INSTDIR\README.txt" w
  FileWrite $0 "Proyecto EliosMind 2B - Launcher del Cerebro GGUF$\r$\n"
  FileWrite $0 "========================================$\r$\n$\r$\n"
  FileWrite $0 "Instalación completada.$\r$\n"
  FileWrite $0 "Ejecute 'proyecto_eliosmind2b_launcher.cs.exe' para iniciar.$\r$\n$\r$\n"
  FileWrite $0 "Archivos de configuración:$\r$\n"
  FileWrite $0 "- .env.local$\r$\n"
  FileWrite $0 "- .env.development.local$\r$\n"
  FileWrite $0 "- proyecto_eliosmind2b.config.json$\r$\n$\r$\n"
  FileWrite $0 "Ubicación de instalación: $INSTDIR$\r$\n"
  FileClose $0
  
  ; Guardar ubicación de instalación en registro
  WriteRegStr HKCU "Software\EliosMind2B" "InstallLocation" "$INSTDIR"
  
  ; Crear entrada de desinstalación
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "DisplayName" "Proyecto EliosMind 2B"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "DisplayVersion" "1.0.0.0"
  
  ; Crear desinstalador
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; Crear acceso directo en el Menú Inicio
  CreateDirectory "$SMPROGRAMS\EliosMind2B"
  CreateShortCut "$SMPROGRAMS\EliosMind2B\Proyecto EliosMind 2B.lnk" "$INSTDIR\proyecto_eliosmind2b_launcher.cs.exe" "" "$INSTDIR\proyecto_eliosmind2b_launcher.cs.exe" 0
  CreateShortCut "$SMPROGRAMS\EliosMind2B\Desinstalar.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortCut "$SMPROGRAMS\EliosMind2B\Carpeta de Instalación.lnk" "$INSTDIR"
  
  ; Crear acceso directo en el Escritorio
  CreateShortCut "$DESKTOP\Proyecto EliosMind 2B.lnk" "$INSTDIR\proyecto_eliosmind2b_launcher.cs.exe" "" "$INSTDIR\proyecto_eliosmind2b_launcher.cs.exe" 0
  
  DetailPrint "Instalación completada en: $INSTDIR"

SectionEnd

;--------------------------------
; Sección de Desinstalación
;--------------------------------

Section "Uninstall"

  ; Eliminar accesos directos
  RMDir /r "$SMPROGRAMS\EliosMind2B"
  Delete "$DESKTOP\Proyecto EliosMind 2B.lnk"
  
  ; Eliminar archivos
  RMDir /r "$INSTDIR"
  
  ; Eliminar entradas de registro
  DeleteRegKey HKCU "Software\EliosMind2B"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B"
  
  DetailPrint "Desinstalación completada"

SectionEnd

;--------------------------------
; Descripciones de Secciones
;--------------------------------

LangString DESC_SecInstall ${LANG_SPANISH} "Instala Proyecto EliosMind 2B con todos sus componentes"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecInstall} $(DESC_SecInstall)
!insertmacro MUI_FUNCTION_DESCRIPTION_END
