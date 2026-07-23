# One-shot APK build — run: powershell -ExecutionPolicy Bypass -File scripts\do-build-apk.ps1
$ErrorActionPreference = "Continue"
$Root = "C:\Users\holyx\jinju-ri"
Set-Location $Root
$Log = Join-Path $Root "build-apk.log"
function L($m) {
  $t = "$(Get-Date -Format 'HH:mm:ss') $m"
  Write-Host $t
  Add-Content -LiteralPath $Log -Value $t -Encoding UTF8
}
"" | Set-Content -LiteralPath $Log -Encoding UTF8
L "=== START APK BUILD ==="
L "Dir: $Root"

$env:JAVA_HOME = "D:\软件\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\holyx\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
L "JAVA_HOME=$env:JAVA_HOME"
L "ANDROID_HOME=$env:ANDROID_HOME"

if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) { L "[FATAL] java missing"; exit 1 }
if (-not (Test-Path $env:ANDROID_HOME)) { L "[FATAL] SDK missing"; exit 1 }

$lp = Join-Path $Root "android\local.properties"
"sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk" | Set-Content -LiteralPath $lp -Encoding ASCII
L "Wrote local.properties"

# Ensure capacitor.settings.gradle exists
$cs = Join-Path $Root "android\capacitor.settings.gradle"
if (-not (Test-Path $cs)) {
  L "Creating capacitor.settings.gradle"
  @"
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor')
include ':capacitor-app'
project(':capacitor-app').projectDir = new File('../node_modules/@capacitor/app/android')
include ':capacitor-filesystem'
project(':capacitor-filesystem').projectDir = new File('../node_modules/@capacitor/filesystem/android')
include ':capacitor-share'
project(':capacitor-share').projectDir = new File('../node_modules/@capacitor/share/android')
include ':capacitor-splash-screen'
project(':capacitor-splash-screen').projectDir = new File('../node_modules/@capacitor/splash-screen/android')
include ':capacitor-status-bar'
project(':capacitor-status-bar').projectDir = new File('../node_modules/@capacitor/status-bar/android')
"@ | Set-Content -LiteralPath $cs -Encoding UTF8
}

function Run-Step($name, $cmd) {
  L "[STEP] $name"
  L "  $cmd"
  $out = cmd /c "$cmd 2>&1"
  $code = $LASTEXITCODE
  if ($out) { $out | ForEach-Object { L "  $_" } }
  L "  exit=$code"
  return $code
}

$code = Run-Step "npm install" "npm install"
if ($code -ne 0) { L "[FAIL] npm install"; exit $code }

$code = Run-Step "npm run build" "npm run build"
if ($code -ne 0) { L "[FAIL] build"; exit $code }

$code = Run-Step "cap sync" "npx cap sync android"
# rewrite local.properties after sync
"sdk.dir=C:/Users/holyx/AppData/Local/Android/Sdk" | Set-Content -LiteralPath $lp -Encoding ASCII

# ensure settings again if sync wiped nothing important
if (-not (Test-Path $cs)) { L "[FAIL] capacitor.settings.gradle still missing"; exit 1 }

L "[STEP] Gradle assembleDebug"
Push-Location (Join-Path $Root "android")
$gout = cmd /c "gradlew.bat assembleDebug --no-daemon 2>&1"
$gcode = $LASTEXITCODE
if ($gout) { $gout | ForEach-Object { L "  $_" } }
Pop-Location
L "  gradle exit=$gcode"
if ($gcode -ne 0) { L "[FAIL] Gradle"; exit $gcode }

$src = Join-Path $Root "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $src)) { L "[FAIL] APK not found: $src"; exit 1 }

$dst = Join-Path $Root "jinju-ri-debug.apk"
$rel = Join-Path $Root "release"
New-Item -ItemType Directory -Force -Path $rel | Out-Null
Copy-Item $src $dst -Force
Copy-Item $src (Join-Path $rel "jinju-ri-debug.apk") -Force
L "=== SUCCESS ==="
L $dst
L (Join-Path $rel "jinju-ri-debug.apk")
exit 0
