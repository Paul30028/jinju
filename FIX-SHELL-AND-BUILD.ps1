# Fix Grok powershell.exe + rebuild APK (run in PowerShell)
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\FIX-SHELL-AND-BUILD.ps1

$ErrorActionPreference = "Continue"
$Dest = "C:\Users\holyx\.grok\bin\powershell.exe"
$Src  = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
$Root = "C:\Users\holyx\jinju-ri"

Write-Host "=== 1) Fix Grok shell host ===" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path (Split-Path $Dest) | Out-Null

if (Test-Path -LiteralPath $Dest) {
  Write-Host "Already exists: $Dest"
} else {
  # Hardlink via cmd (mklink is not a PowerShell cmdlet)
  $mklink = cmd.exe /c "mklink /H `"$Dest`" `"$Src`""
  Write-Host $mklink
  if (-not (Test-Path -LiteralPath $Dest)) {
    Write-Host "Hardlink failed, copying..."
    Copy-Item -LiteralPath $Src -Destination $Dest -Force
  }
}

if (Test-Path -LiteralPath $Dest) {
  Write-Host "OK: $Dest" -ForegroundColor Green
  Get-Item -LiteralPath $Dest | Format-List FullName, Length, LinkType
} else {
  Write-Host "FAIL: could not create powershell.exe" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 2) Build APK ===" -ForegroundColor Cyan
Set-Location -LiteralPath $Root

$javaCandidates = @(
  "D:\软件\Android Studio\jbr",
  "$env:LOCALAPPDATA\Programs\Android Studio\jbr",
  "${env:ProgramFiles}\Android\Android Studio\jbr"
)
$javaHome = $null
foreach ($j in $javaCandidates) {
  if (Test-Path (Join-Path $j "bin\java.exe")) { $javaHome = $j; break }
}
if (-not $javaHome) {
  Get-ChildItem "D:\" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $jbr = Join-Path $_.FullName "Android Studio\jbr"
    if ((-not $javaHome) -and (Test-Path (Join-Path $jbr "bin\java.exe"))) { $javaHome = $jbr }
  }
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"

if (-not $env:JAVA_HOME) {
  Write-Host "FAIL: JAVA_HOME not found" -ForegroundColor Red
  exit 1
}

Set-Content -Path "android\local.properties" -Value "sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk" -Encoding ASCII

node scripts\build-apk-node.mjs
$code = $LASTEXITCODE

Write-Host ""
if ($code -eq 0 -and (Test-Path "jinju-ri-debug.apk")) {
  $apk = Get-Item "jinju-ri-debug.apk"
  Write-Host "SUCCESS: $($apk.FullName) ($([math]::Round($apk.Length/1MB,2)) MB)" -ForegroundColor Green
} else {
  Write-Host "Build exit code: $code  (see build-apk-run.log)" -ForegroundColor Yellow
}
exit $code
