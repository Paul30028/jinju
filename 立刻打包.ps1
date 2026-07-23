# 金句日：一键打 Debug APK（在项目根目录用 PowerShell 运行）
# 用法：  powershell -ExecutionPolicy Bypass -File .\立刻打包.ps1

$ErrorActionPreference = "Stop"
$Root = "C:\Users\holyx\jinju-ri"
Set-Location $Root

Write-Host "==== 金句日 APK 打包 ====" -ForegroundColor Cyan
Write-Host "目录: $Root"

$env:JAVA_HOME = "D:\软件\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\holyx\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
  throw "找不到 JDK: $env:JAVA_HOME"
}
if (-not (Test-Path $env:ANDROID_HOME)) {
  throw "找不到 SDK: $env:ANDROID_HOME"
}

Set-Content -Path "android\local.properties" -Value "sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk" -Encoding ASCII
Write-Host "JAVA: $env:JAVA_HOME"
Write-Host "SDK:  $env:ANDROID_HOME"

Write-Host "`n[1/4] npm run build ..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build 失败" }

Write-Host "`n[2/4] npx cap sync android ..." -ForegroundColor Yellow
npx cap sync android
# sync 可能覆盖 local.properties
Set-Content -Path "android\local.properties" -Value "sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk" -Encoding ASCII

if (-not (Test-Path "android\capacitor.settings.gradle")) {
  throw "缺少 android\capacitor.settings.gradle，请先确保 Capacitor 文件齐全"
}
if (-not (Test-Path "android\gradlew.bat")) {
  throw "缺少 android\gradlew.bat"
}

Write-Host "`n[3/4] Gradle assembleDebug（首次较久）..." -ForegroundColor Yellow
Push-Location android
try {
  & .\gradlew.bat assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "Gradle 失败，exit=$LASTEXITCODE" }
} finally {
  Pop-Location
}

$src = "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $src)) {
  throw "Gradle 结束但未找到 APK: $src"
}

Write-Host "`n[4/4] 复制 APK ..." -ForegroundColor Yellow
Copy-Item $src "jinju-ri-debug.apk" -Force
New-Item -ItemType Directory -Force -Path "release" | Out-Null
Copy-Item $src "release\jinju-ri-debug.apk" -Force

Write-Host "`n==== 成功 ====" -ForegroundColor Green
Write-Host (Resolve-Path "jinju-ri-debug.apk")
Write-Host (Resolve-Path "release\jinju-ri-debug.apk")
explorer.exe /select,(Resolve-Path "jinju-ri-debug.apk").Path
