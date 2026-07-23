# Jinju Day - Build Debug APK (PowerShell, Chinese messages OK)
# Usage: right-click -> Run with PowerShell
#    or: powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "package.json"))) {
  $Root = Get-Location
}
Set-Location $Root
$Log = Join-Path $Root "build-apk.log"
function Log([string]$m) {
  $line = $m
  Write-Host $line
  Add-Content -LiteralPath $Log -Value $line -Encoding UTF8
}

"" | Set-Content -LiteralPath $Log -Encoding UTF8
Log "========================================"
Log "  金句日 · 生成 Android Debug APK"
Log "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Log "  目录: $Root"
Log "========================================"

try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "未找到 Node.js。请安装 https://nodejs.org/ 后重开终端。"
  }
  Log "[1/6] node $(node -v) / npm $(npm -v)"

  Log "[2/6] npm install ..."
  npm install 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "npm install 失败" }

  Log "[3/6] npm run build ..."
  npm run build 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "前端构建失败" }
  if (-not (Test-Path "dist\index.html")) { throw "缺少 dist\index.html" }

  if (-not (Test-Path "android\gradlew.bat")) {
    Log "[4/6] cap add android ..."
    npx cap add android 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "cap add android 失败" }
  } else {
    Log "[4/6] android 工程已存在"
  }

  Log "[5/6] cap sync android ..."
  npx cap sync android 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "cap sync 失败" }

  Log "[6/6] Gradle assembleDebug ..."
  Push-Location android
  try {
    & .\gradlew.bat assembleDebug --no-daemon 2>&1 | Tee-Object -FilePath $Log -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Gradle 打包失败 (exit $LASTEXITCODE)" }
  } finally {
    Pop-Location
  }

  $src = "android\app\build\outputs\apk\debug\app-debug.apk"
  if (-not (Test-Path $src)) { throw "未找到 $src" }

  Copy-Item $src "jinju-ri-debug.apk" -Force
  New-Item -ItemType Directory -Force -Path "release" | Out-Null
  Copy-Item $src "release\jinju-ri-debug.apk" -Force
  Copy-Item $src "金句日-debug.apk" -Force -ErrorAction SilentlyContinue

  Log "========================================"
  Log "  成功！"
  Log "  $Root\jinju-ri-debug.apk"
  Log "  $Root\release\jinju-ri-debug.apk"
  Log "========================================"
  Log "传到手机安装即可（允许未知来源）。"
  explorer.exe /select,"$Root\jinju-ri-debug.apk"
}
catch {
  Log "[错误] $($_.Exception.Message)"
  Log "完整日志: $Log"
  Write-Host ""
  Write-Host "失败原因: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "请打开: $Log" -ForegroundColor Yellow
  exit 1
}
finally {
  Write-Host ""
  Write-Host "按 Enter 关闭..."
  try { [void](Read-Host) } catch {}
}
