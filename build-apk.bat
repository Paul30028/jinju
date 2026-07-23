@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Jinju Day APK

call "%~dp0env-android.bat"

set "LOG=%~dp0build-apk.log"
set "ERR=0"

echo ========================================
echo   Jinju Day - Android Debug APK
echo   %DATE% %TIME%
echo ========================================
echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo.

> "%LOG%" echo Jinju Day APK build log
>>"%LOG%" echo %DATE% %TIME%
>>"%LOG%" echo JAVA_HOME=%JAVA_HOME%
>>"%LOG%" echo ANDROID_HOME=%ANDROID_HOME%
>>"%LOG%" echo.

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] JAVA_HOME invalid. Set Android Studio jbr path.
  >>"%LOG%" echo [ERROR] bad JAVA_HOME
  set "ERR=1"
  goto FINISH
)

if not exist "%ANDROID_HOME%\platforms" (
  echo [ERROR] ANDROID_HOME invalid.
  >>"%LOG%" echo [ERROR] bad ANDROID_HOME
  set "ERR=1"
  goto FINISH
)

REM Always refresh local.properties
(
  echo sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk
) > "%~dp0android\local.properties"
echo Wrote android\local.properties
>>"%LOG%" echo wrote local.properties

echo [1/6] Node ...
>>"%LOG%" echo [1/6] Node
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node not in PATH
  >>"%LOG%" echo [ERROR] no node
  set "ERR=1"
  goto FINISH
)
node -v
npm -v
echo.

echo [2/6] npm install ...
>>"%LOG%" echo [2/6] npm install
call npm install
if errorlevel 1 (
  echo [ERROR] npm install failed
  >>"%LOG%" echo [ERROR] npm install failed
  set "ERR=1"
  goto FINISH
)
echo.

echo [3/6] npm run build ...
>>"%LOG%" echo [3/6] build
call npm run build
if errorlevel 1 (
  echo [ERROR] build failed
  >>"%LOG%" echo [ERROR] build failed
  set "ERR=1"
  goto FINISH
)
if not exist "dist\index.html" (
  echo [ERROR] no dist\index.html
  set "ERR=1"
  goto FINISH
)
echo.

echo [4/6] cap sync ...
>>"%LOG%" echo [4/6] cap sync
if not exist "android\gradlew.bat" (
  call npx cap add android
  if errorlevel 1 (
    echo [ERROR] cap add failed
    set "ERR=1"
    goto FINISH
  )
)
call npx cap sync android
if errorlevel 1 (
  echo [ERROR] cap sync failed
  set "ERR=1"
  goto FINISH
)
REM cap sync may wipe local.properties
(
  echo sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk
) > "%~dp0android\local.properties"
echo.

echo [5/6] Gradle assembleDebug ...
echo First time may take 10-20 minutes.
>>"%LOG%" echo [5/6] gradle
pushd android
call gradlew.bat assembleDebug --no-daemon
set "GERR=%ERRORLEVEL%"
popd
if not "%GERR%"=="0" (
  echo [ERROR] Gradle failed code %GERR%
  >>"%LOG%" echo [ERROR] gradle %GERR%
  set "ERR=1"
  goto FINISH
)
echo.

echo [6/6] Copy APK ...
set "APK_SRC=android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK_SRC%" (
  echo [ERROR] APK not found
  set "ERR=1"
  goto FINISH
)
copy /Y "%APK_SRC%" "jinju-ri-debug.apk" >nul
if not exist "release" mkdir release
copy /Y "%APK_SRC%" "release\jinju-ri-debug.apk" >nul
echo.
echo SUCCESS: %CD%\jinju-ri-debug.apk
>>"%LOG%" echo SUCCESS
if exist "jinju-ri-debug.apk" explorer /select,"%CD%\jinju-ri-debug.apk"

:FINISH
echo.
if "%ERR%"=="0" (echo [OK]) else (
  echo [FAIL] see %LOG%
  if exist "%LOG%" type "%LOG%"
)
echo.
echo Press any key...
pause >nul
exit /b %ERR%
