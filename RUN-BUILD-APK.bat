@echo off
REM Pure ASCII. No Chinese. No bare "powershell" (may be missing from PATH).
setlocal EnableExtensions
cd /d "%~dp0"
title Jinju Day APK Build
echo.
echo  Jinju Day APK build starting...
echo  Log: %~dp0build-apk-run.log
echo.

set "LOG=%~dp0build-apk-run.log"
echo === Jinju Day APK build %DATE% %TIME% ===> "%LOG%"
echo Root: %CD%>> "%LOG%"

REM ---- Find PowerShell (full path; bare name often missing) ----
set "PS="
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
  set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
)
if not defined PS if exist "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" (
  set "PS=%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"
)
if not defined PS if exist "%ProgramFiles%\PowerShell\7\pwsh.exe" (
  set "PS=%ProgramFiles%\PowerShell\7\pwsh.exe"
)

REM ---- Prefer Node runner (user already has npm) ----
where node >nul 2>&1
if not errorlevel 1 (
  echo  Using Node: scripts\build-apk-node.mjs
  echo  Using Node runner>> "%LOG%"
  call node "%~dp0scripts\build-apk-node.mjs"
  set "ERR=%ERRORLEVEL%"
  goto FINISH
)

REM ---- PowerShell full path ----
if defined PS (
  echo  Using PowerShell: %PS%
  echo  Using PS %PS%>> "%LOG%"
  "%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-build-apk-full.ps1"
  set "ERR=%ERRORLEVEL%"
  goto FINISH
)

REM ---- Pure CMD fallback ----
echo  PowerShell not found, using pure CMD fallback...
echo  Using CMD fallback>> "%LOG%"
call "%~dp0scripts\build-apk-cmd.bat"
set "ERR=%ERRORLEVEL%"
goto FINISH

:FINISH
echo.
if "%ERR%"=="0" (
  echo  [OK] Done. APK: %~dp0jinju-ri-debug.apk
  echo  SUCCESS>> "%LOG%"
) else (
  echo  [FAIL] exit code %ERR%
  echo  Open: %LOG%
  echo  FAIL %ERR%>> "%LOG%"
)
echo.
echo  Press any key to close...
pause >nul
exit /b %ERR%
