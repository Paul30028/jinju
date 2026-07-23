Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
sh.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
' Run ASCII bat inside cmd that stays open
sh.Run "cmd.exe /k RUN-BUILD-APK.bat", 1, False
