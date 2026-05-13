Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strPath = "C:\Users\joanc\Downloads\Nueva carpeta (6)"
strScript = strPath & "\scripts\compile_and_run_launcher_v2.ps1"

If Not objFSO.FileExists(strScript) Then
    MsgBox "Script no encontrado: " & strScript, 16, "Error"
    WScript.Quit 1
End If

' Cerrar instancias previas
On Error Resume Next
objShell.Run "taskkill /F /IM powershell.exe /T /FI ""WINDOWTITLE eq *Control Comercial*""", 0, True
On Error Goto 0

' Lanzar el launcher en STA mode sin mostrar consola
strCmd = "powershell.exe -NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -STA -File """ & strScript & """"
objShell.CurrentDirectory = strPath
objShell.Run strCmd, 0, False

' Esperar un segundo para que se inicie
WScript.Sleep 1000
