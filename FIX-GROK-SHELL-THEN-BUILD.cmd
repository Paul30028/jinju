@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Fix Grok shell + build Jinju Day APK

echo ========================================
echo  1) Fix Grok agent shell (powershell hardlink)
echo  2) Build Jinju Day debug APK
echo ========================================
echo.

set "GROK_BIN=%USERPROFILE%\.grok\bin"
set "PS_SRC=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
set "PS_DST=%GROK_BIN%\powershell.exe"

if not exist "%PS_SRC%" (
  echo [ERROR] Real PowerShell not found: %PS_SRC%
  goto END
)

if not exist "%GROK_BIN%" mkdir "%GROK_BIN%"

if exist "%PS_DST%" (
  echo [OK] Already present: %PS_DST%
) else (
  echo Creating hardlink: %PS_DST%
  mklink /H "%PS_DST%" "%PS_SRC%"
  if errorlevel 1 (
    echo Hardlink failed, copying instead...
    copy /Y "%PS_SRC%" "%PS_DST%" >nul
  )
  if exist "%PS_DST%" (echo [OK] powershell.exe ready for Grok agents) else (echo [WARN] could not place powershell.exe)
)

echo.
echo Building APK via Node runner...
call "%~dp0env-android.bat"
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] node not in PATH
  goto END
)
node "%~dp0scripts\build-apk-node.mjs"

:END
echo.
echo Log: %~dp0build-apk.log
echo APK if OK: %~dp0jinju-ri-debug.apk
echo.
pause
