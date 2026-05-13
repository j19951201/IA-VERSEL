Dim shell, exePath, workDir
Set shell = CreateObject("WScript.Shell")
exePath = "C:\Users\joanc\AppData\Local\EliosMind2BBusiness\IAJurisBusinessLauncher.exe"
workDir = "C:\Users\joanc\Downloads\Nueva carpeta (6)"
shell.CurrentDirectory = workDir
shell.Run """" & exePath & """", 1, False
