$apk = "C:\Users\holyx\jinju-ri\android\app\build\outputs\apk\debug\app-debug.apk"
$root = "C:\Users\holyx\jinju-ri\jinju-ri-debug.apk"
Write-Host "源 APK 存在? $(Test-Path $apk)  -> $apk"
Write-Host "根目录 APK 存在? $(Test-Path $root)  -> $root"
if (-not (Test-Path $apk)) {
  Write-Host ""
  Write-Host "结论: 还没有打包成功，不要再运行 Copy-Item。" -ForegroundColor Red
  Write-Host "请双击: C:\Users\holyx\jinju-ri\RUN-BUILD-APK.bat" -ForegroundColor Yellow
}
