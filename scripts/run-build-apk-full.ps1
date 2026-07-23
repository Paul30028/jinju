# Full APK build - PowerShell handles Unicode paths fine
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "package.json"))) {
  $Root = "C:\Users\holyx\jinju-ri"
}
Set-Location $Root
$Log = Join-Path $Root "build-apk-run.log"

function L([string]$m) {
  $line = "$(Get-Date -Format 'HH:mm:ss') $m"
  Write-Host $line
  Add-Content -LiteralPath $Log -Value $line -Encoding UTF8
}

"" | Set-Content -LiteralPath $Log -Encoding UTF8
L "=== Jinju Day APK build ==="
L "Root: $Root"

function Find-JavaHome {
  $candidates = @(
    $env:JAVA_HOME,
    "D:\软件\Android Studio\jbr",
    "D:\Program Files\Android\Android Studio\jbr",
    "C:\Program Files\Android\Android Studio\jbr",
    (Join-Path $env:LOCALAPPDATA "Programs\Android Studio\jbr"),
    (Join-Path ${env:ProgramFiles} "Android\Android Studio\jbr")
  ) | Where-Object { $_ }

  foreach ($c in $candidates) {
    $java = Join-Path $c "bin\java.exe"
    if (Test-Path -LiteralPath $java) {
      return $c
    }
  }

  # Scan D:\ top-level folders for "Android Studio\jbr"
  try {
    foreach ($dir in (Get-ChildItem -Path "D:\" -Directory -ErrorAction SilentlyContinue)) {
      $jbr = Join-Path $dir.FullName "Android Studio\jbr"
      $java = Join-Path $jbr "bin\java.exe"
      if (Test-Path -LiteralPath $java) {
        return $jbr
      }
    }
  } catch {}

  # Full path java from Studio if PATH empty
  $studioJava = "D:\软件\Android Studio\jbr\bin\java.exe"
  if (Test-Path -LiteralPath $studioJava) {
    return "D:\软件\Android Studio\jbr"
  }

  $where = Get-Command java -ErrorAction SilentlyContinue
  if ($where) {
    $bin = Split-Path $where.Source -Parent
    return (Split-Path $bin -Parent)
  }
  return $null
}

function Find-AndroidSdk {
  $candidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA "Android\Sdk"),
    "C:\Android\Sdk"
  ) | Where-Object { $_ }

  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) { return $c }
  }
  return $null
}

$javaHome = Find-JavaHome
$sdk = Find-AndroidSdk
L "JAVA_HOME=$javaHome"
L "ANDROID_HOME=$sdk"

if (-not $javaHome) {
  L "[FAIL] JDK not found. Install Android Studio or set JAVA_HOME."
  exit 1
}
if (-not $sdk) {
  L "[FAIL] Android SDK not found under %LOCALAPPDATA%\Android\Sdk"
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:Path = "$(Join-Path $javaHome 'bin');$(Join-Path $sdk 'platform-tools');$env:Path"

# local.properties (forward slashes)
$sdkProp = $sdk -replace '\\', '/'
$lp = Join-Path $Root "android\local.properties"
Set-Content -LiteralPath $lp -Value "sdk.dir=$sdkProp" -Encoding ASCII
L "Wrote local.properties sdk.dir=$sdkProp"

function Run-Cmd([string]$name, [string]$cmd) {
  L "[STEP] $name"
  L "  > $cmd"
  cmd.exe /c $cmd 2>&1 | ForEach-Object {
    $t = "$_"
    Write-Host $t
    Add-Content -LiteralPath $Log -Value $t -Encoding UTF8
  }
  $code = $LASTEXITCODE
  if ($null -eq $code) { $code = 0 }
  L "  exit=$code"
  return $code
}

$code = Run-Cmd "node -v" "node -v"
if ($code -ne 0) { L "[FAIL] node not in PATH"; exit 1 }

$code = Run-Cmd "npm install" "npm install"
if ($code -ne 0) { L "[FAIL] npm install"; exit $code }

$code = Run-Cmd "npm run build" "npm run build"
if ($code -ne 0) { L "[FAIL] npm run build"; exit $code }

$code = Run-Cmd "cap sync" "npx cap sync android"
# rewrite local.properties after sync
Set-Content -LiteralPath $lp -Value "sdk.dir=$sdkProp" -Encoding ASCII

$settings = Join-Path $Root "android\capacitor.settings.gradle"
if (-not (Test-Path -LiteralPath $settings)) {
  L "[FAIL] missing capacitor.settings.gradle"
  exit 1
}

$gradlew = Join-Path $Root "android\gradlew.bat"
if (-not (Test-Path -LiteralPath $gradlew)) {
  L "[FAIL] missing gradlew.bat"
  exit 1
}

L "[STEP] Gradle assembleDebug (first time may take 10-20 min)"
Push-Location (Join-Path $Root "android")
try {
  & cmd.exe /c "gradlew.bat assembleDebug --stacktrace --no-daemon" 2>&1 | ForEach-Object {
    $t = "$_"
    Write-Host $t
    Add-Content -LiteralPath $Log -Value $t -Encoding UTF8
  }
  $gcode = $LASTEXITCODE
} finally {
  Pop-Location
}
L "  gradle exit=$gcode"
if ($gcode -ne 0) {
  L "[FAIL] Gradle failed. Open build-apk-run.log and search for FAILURE"
  exit $gcode
}

$src = Join-Path $Root "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path -LiteralPath $src)) {
  L "[FAIL] APK not found: $src"
  exit 1
}

$dst = Join-Path $Root "jinju-ri-debug.apk"
$relDir = Join-Path $Root "release"
New-Item -ItemType Directory -Force -Path $relDir | Out-Null
Copy-Item -LiteralPath $src -Destination $dst -Force
Copy-Item -LiteralPath $src -Destination (Join-Path $relDir "jinju-ri-debug.apk") -Force

L "=== SUCCESS ==="
L $dst
L (Join-Path $relDir "jinju-ri-debug.apk")
try {
  explorer.exe /select,$dst
} catch {}
exit 0
