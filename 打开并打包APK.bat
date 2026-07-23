@echo off
cd /d "%~dp0"
title Jinju Day APK
echo.
echo  Starting APK build...
echo  (window stays open; progress shows below)
echo.
call "%~dp0build-apk.bat"
exit /b %ERRORLEVEL%
