@echo off
REM ============================================================
REM  Double-click THIS file to build APK
REM  Window NEVER auto-closes (cmd /k)
REM ============================================================
cd /d "%~dp0"
title Jinju-Day APK Build - DO NOT CLOSE

echo.
echo  ============================================
echo   Jinju Day APK Builder
echo   Window stays open. Log: build-apk.log
echo  ============================================
echo.

call "%~dp0env-android.bat"

echo  JAVA_HOME=%JAVA_HOME%
echo  ANDROID_HOME=%ANDROID_HOME%
echo.

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo  [ERROR] Java not found.
  echo  Expected: D:\软件\Android Studio\jbr
  echo.
  goto END
)

if not exist "%ANDROID_HOME%\platforms" (
  echo  [ERROR] Android SDK not found.
  echo  Expected: %LOCALAPPDATA%\Android\Sdk
  echo.
  goto END
)

REM Write local.properties every time (fixes missing sdk.dir)
(
  echo sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk
) > "%~dp0android\local.properties"
echo  Wrote android\local.properties
echo.

REM Prefer Node runner if available (more reliable logging)
where node >nul 2>&1
if not errorlevel 1 (
  echo  Running via Node: scripts\build-apk-node.mjs
  echo.
  node "%~dp0scripts\build-apk-node.mjs"
  goto END
)

echo  Node not in PATH, running build-apk.bat ...
echo.
call "%~dp0build-apk.bat"

:END
echo.
echo  ============================================
echo   Finished. Read build-apk.log if failed.
echo   APK if OK: jinju-ri-debug.apk
echo  ============================================
echo.
echo  Type exit  then Enter  to close this window.
cmd /k
