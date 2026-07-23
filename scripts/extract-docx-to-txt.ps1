# Extract Word .doc/.docx to UTF-8 text for import-promises.mjs
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\extract-docx-to-txt.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$OutClarke = Join-Path $Root "scripts\promises-clarke-utf8.txt"
$OutCuv = Join-Path $Root "scripts\promises-cuv-utf8.txt"

$clarke = @(
  "$env:USERPROFILE\Downloads\《珍贵的圣经应许》撒母耳·克拉克Precious-Bible-Promises-Samuel-Clarke-1.docx",
  "$env:USERPROFILE\Downloads\*Precious*Bible*Promises*.docx",
  "$env:USERPROFILE\Downloads\*珍贵的圣经应许*.docx"
)
$cuv = @(
  "$env:USERPROFILE\Downloads\圣经应许合本.doc",
  "$env:USERPROFILE\Downloads\*圣经应许合本*"
)

function Resolve-One($patterns) {
  foreach ($p in $patterns) {
    $hits = @(Get-Item -LiteralPath $p -ErrorAction SilentlyContinue)
    if (-not $hits.Count) {
      $hits = @(Get-ChildItem -Path (Split-Path $p -Parent) -Filter (Split-Path $p -Leaf) -ErrorAction SilentlyContinue)
    }
    if ($hits.Count -gt 0) { return $hits[0].FullName }
  }
  return $null
}

function Extract-Word($path) {
  if (-not $path -or -not (Test-Path -LiteralPath $path)) { return $null }
  Write-Host "Opening: $path"
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  try {
    $doc = $word.Documents.Open($path)
    $text = $doc.Content.Text
    $doc.Close($false)
    return $text
  } finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  }
}

$c1 = Resolve-One $clarke
$c2 = Resolve-One $cuv

if ($c1) {
  $t = Extract-Word $c1
  if ($t) {
    [System.IO.File]::WriteAllText($OutClarke, $t, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Wrote $OutClarke ($($t.Length) chars)"
  }
} else {
  Write-Host "Clarke docx not found in Downloads"
}

if ($c2) {
  $t = Extract-Word $c2
  if ($t) {
    [System.IO.File]::WriteAllText($OutCuv, $t, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Wrote $OutCuv ($($t.Length) chars)"
  }
} else {
  Write-Host "圣经应许合本.doc not found in Downloads"
}

Write-Host ""
Write-Host "Next: cd $Root ; node scripts\import-promises.mjs"
