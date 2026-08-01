# Descarga thumbnails de Videopoetry desde objkt CDN (sin referer).
# Uso: powershell -ExecutionPolicy Bypass -File js/build-videopoetry-thumbs.ps1

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Split-Path -Parent $scriptDir
$dataPath = Join-Path $webRoot "js\videopoetry-data.js"
$thumbsDir = Join-Path $webRoot "videopoetry\thumbs"

if (-not (Test-Path $thumbsDir)) {
    New-Item -ItemType Directory -Path $thumbsDir | Out-Null
}

$content = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8
$matches = [regex]::Matches($content, '\{\s*name:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*thumb:\s*"([^"]+)"')

function Get-Slug([string]$name) {
    $s = $name.ToLower() -replace '[^a-z0-9]+', '-'
    $s = $s.Trim('-')
    if ($s.Length -gt 48) { $s = $s.Substring(0, 48).Trim('-') }
    return $s
}

$i = 0
$newItems = @()

foreach ($m in $matches) {
    $i++
    $name = $m.Groups[1].Value
    $url = $m.Groups[2].Value
    $thumbUrl = $m.Groups[3].Value
    $slug = Get-Slug $name
    Write-Host "Descargando: $name"
    $resp = Invoke-WebRequest -Uri $thumbUrl -UseBasicParsing
    $ext = switch -Regex ($resp.Headers['Content-Type']) {
        'gif' { 'gif' }
        'png' { 'png' }
        'jpeg|jpg' { 'jpg' }
        default { 'webp' }
    }
    $fileName = "{0:D2}-{1}.$ext" -f $i, $slug
    $outPath = Join-Path $thumbsDir $fileName
    [System.IO.File]::WriteAllBytes($outPath, $resp.Content)

    $localThumb = "thumbs/$fileName"
    $newItems += "  {`n    name: `"$name`",`n    url: `"$url`",`n    thumb: `"$localThumb`",`n  }"
}

$js = @"
window.VIDEOPOETRY_ITEMS = [
$($newItems -join ",`n")
];
"@

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($dataPath, $js, $utf8)
Write-Host "Listo: $($matches.Count) thumbnails en videopoetry/thumbs/"
