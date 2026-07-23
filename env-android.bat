@echo off
REM ASCII-only. Detect JDK/SDK without Chinese literals in this file.
setlocal EnableExtensions

REM Prefer existing env
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" goto :sdk

REM Common English paths
if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
  goto :sdk
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr"
  goto :sdk
)

REM Let PowerShell resolve Unicode path to Android Studio jbr
for /f "usebackq delims=" %%J in (`powershell.exe -NoProfile -Command "$c=@($env:JAVA_HOME,'D:\软件\Android Studio\jbr','C:\Program Files\Android\Android Studio\jbr'); foreach($x in $c){ if($x -and (Test-Path (Join-Path $x 'bin\java.exe'))){ $x; break } }; Get-ChildItem D:\ -Directory -EA 0 | ForEach-Object { $p=Join-Path $_.FullName 'Android Studio\jbr'; if(Test-Path (Join-Path $p 'bin\java.exe')){ $p; break } }"`) do (
  set "JAVA_HOME=%%J"
)

:sdk
if not defined ANDROID_HOME (
  if exist "%LOCALAPPDATA%\Android\Sdk" set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)
if defined ANDROID_HOME set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
if defined ANDROID_HOME set "PATH=%ANDROID_HOME%\platform-tools;%PATH%"

endlocal & set "JAVA_HOME=%JAVA_HOME%" & set "ANDROID_HOME=%ANDROID_HOME%" & set "ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%" & set "PATH=%PATH%"
