@echo off
chcp 65001 >nul
REM 会话高清图标 → 工程 public\brand
set "SRC=C:\Users\holyx\.grok\sessions\C%%3A%%5CUsers%%5Cholyx%%5C.grok%%5Cbin\019f6465-756a-7411-b758-139423547cba\images"
REM 上面路径在 cmd 里 %% 会变成 %；若失败请改用下方字面路径
if not exist "%SRC%\3.jpg" (
  set "SRC=C:\Users\holyx\.grok\sessions\C%3A%5CUsers%5Cholyx%5C.grok%5Cbin\019f6465-756a-7411-b758-139423547cba\images"
)
set "DST=C:\Users\holyx\jinju-ri\public\brand"
if not exist "%SRC%\3.jpg" (
  echo [ERROR] 找不到: 会话 images\3.jpg
  echo 完整目录应为:
  echo   C:\Users\holyx\.grok\sessions\C%%3A%%5CUsers%%5Cholyx%%5C.grok%%5Cbin\019f6465-756a-7411-b758-139423547cba\images
  pause
  exit /b 1
)
mkdir "%DST%" 2>nul
copy /Y "%SRC%\3.jpg" "%DST%\serein-icon-cn.jpg" >nul
copy /Y "%SRC%\4.jpg" "%DST%\serein-icon-intl.jpg" >nul
copy /Y "%SRC%\3.jpg" "%DST%\store-cn-1024.jpg" >nul
copy /Y "%SRC%\4.jpg" "%DST%\store-intl-1024.jpg" >nul
echo [OK] CN  ^> %DST%\serein-icon-cn.jpg  ^(from 3.jpg^)
echo [OK] Intl ^> %DST%\serein-icon-intl.jpg ^(from 4.jpg^)
dir /b "%DST%"
pause
