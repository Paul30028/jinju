@echo off
REM Pure CMD build - no PowerShell required. ASCII only.
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0\.."
set "ROOT=%CD%"
set "LOG=%ROOT%\build-apk-run.log"

echo.>> "%LOG%"
echo === CMD fallback build ===>> "%LOG%"

REM ---- JAVA_HOME: scan D:\ * \Android Studio\jbr (no Chinese in this file) ----
set "JAVA_HOME="
if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
)
if not defined JAVA_HOME if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr"
)
if not defined JAVA_HOME (
  for /d %%D in ("D:\*") do (
    if exist "%%D\Android Studio\jbr\bin\java.exe" (
      set "JAVA_HOME=%%D\Android Studio\jbr"
      goto :got_java
    )
  )
)
:got_java

if not defined JAVA_HOME (
  echo [FAIL] JAVA_HOME not found. Install Android Studio.
  echo [FAIL] JAVA_HOME not found>> "%LOG%"
  exit /b 1
)

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not exist "%ANDROID_HOME%" (
  echo [FAIL] Android SDK not at %ANDROID_HOME%
  echo [FAIL] no SDK>> "%LOG%"
  exit /b 1
)

set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo JAVA_HOME=%JAVA_HOME%>> "%LOG%"
echo ANDROID_HOME=%ANDROID_HOME%>> "%LOG%"

echo sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk> "%ROOT%\android\local.properties"

where node >nul 2>&1
if errorlevel 1 (
  echo [FAIL] node not in PATH
  echo [FAIL] no node>> "%LOG%"
  exit /b 1
)

echo [1/5] npm install
call npm install
if errorlevel 1 (
  echo [FAIL] npm install
  exit /b 1
)

echo [2/5] npm run build
call npm run build
if errorlevel 1 (
  echo [FAIL] npm run build
  exit /b 1
)

echo [3/5] npx cap sync android
call npx cap sync android
echo sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk> "%ROOT%\android\local.properties"

if not exist "%ROOT%\android\capacitor.settings.gradle" (
  echo [FAIL] missing capacitor.settings.gradle
  exit /b 1
)

echo [4/5] Gradle assembleDebug - wait...
pushd "%ROOT%\android"
call gradlew.bat assembleDebug --stacktrace --no-daemon
set "GERR=!ERRORLEVEL!"
popd
if not "!GERR!"=="0" (
  echo [FAIL] Gradle code !GERR!
  echo [FAIL] Gradle !GERR!>> "%LOG%"
  exit /b !GERR!
)

set "APK=%ROOT%\android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" (
  echo [FAIL] APK missing: %APK%
  exit /b 1
)

echo [5/5] Copy APK
copy /Y "%APK%" "%ROOT%\jinju-ri-debug.apk" >nul
if not exist "%ROOT%\release" mkdir "%ROOT%\release"
copy /Y "%APK%" "%ROOT%\release\jinju-ri-debug.apk" >nul

echo SUCCESS: %ROOT%\jinju-ri-debug.apk
echo SUCCESS %ROOT%\jinju-ri-debug.apk>> "%LOG%"
explorer /select,"%ROOT%\jinju-ri-debug.apk"
exit /b 0
