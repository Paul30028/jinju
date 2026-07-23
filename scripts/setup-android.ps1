# 金句日 · 一键准备 Android 工程（Windows PowerShell）
# 用法：在项目根目录执行  powershell -ExecutionPolicy Bypass -File .\scripts\setup-android.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== 金句日 Android 打包准备 ===" -ForegroundColor Cyan

# 1. 依赖
Write-Host "`n[1/5] 安装 npm 依赖（含 Capacitor）..." -ForegroundColor Yellow
npm install

# 2. 构建 Web
Write-Host "`n[2/5] 构建 Web (vite build)..." -ForegroundColor Yellow
npm run build

# 3. 添加 Android 平台（若尚无）
if (-not (Test-Path ".\android")) {
  Write-Host "`n[3/5] 添加 android 平台..." -ForegroundColor Yellow
  npx cap add android
} else {
  Write-Host "`n[3/5] android 目录已存在，跳过 add" -ForegroundColor DarkGray
}

# 4. 同步
Write-Host "`n[4/5] cap sync android..." -ForegroundColor Yellow
npx cap sync android

# 5. 打开 Android Studio
Write-Host "`n[5/5] 打开 Android Studio..." -ForegroundColor Yellow
npx cap open android

Write-Host "`n完成。" -ForegroundColor Green
Write-Host "在 Android Studio 中：连接手机或启动模拟器 → 点击 Run (绿色三角)。" -ForegroundColor Green
Write-Host "若首次打开，请等待 Gradle 同步结束。" -ForegroundColor Green
