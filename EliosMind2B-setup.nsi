; Script NSIS para instalar y desinstalar Proyecto EliosMind 2B

Outfile "EliosMind2B-Setup.exe"
InstallDir "$PROGRAMFILES\EliosMind2B"
RequestExecutionLevel admin

Section "Instalar"
  SetOutPath "$INSTDIR"
  File /r "C:\Users\joanc\Downloads\Nueva carpeta (6)\public\*"
  File /r "C:\Users\joanc\Downloads\Nueva carpeta (6)\scripts\*"
  File "C:\Users\joanc\Downloads\Nueva carpeta (6)\package.json"
  File "C:\Users\joanc\Downloads\Nueva carpeta (6)\scripts\proyecto eliosmind2b.exe"
  ; Agrega aquí otros archivos clave si los necesitas
  SetShellVarContext all
  CreateShortCut "$DESKTOP\EliosMind 2B.lnk" "$INSTDIR\scripts\proyecto eliosmind2b.exe"
  ; Registrar desinstalador en Windows
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "DisplayName" "EliosMind 2B"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "DisplayIcon" "$INSTDIR\scripts\proyecto eliosmind2b.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "Publisher" "TuEmpresa"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B" "InstallLocation" "$INSTDIR"
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\EliosMind 2B.lnk"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EliosMind2B"
SectionEnd
