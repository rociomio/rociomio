# Regenera la galeria estatica en videopoetry_index.html desde videopoetry-data.js
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Split-Path -Parent $scriptDir
$dataPath = Join-Path $webRoot "js\videopoetry-data.js"
$htmlPath = Join-Path $webRoot "videopoetry\videopoetry_index.html"

$content = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8
$matches = [regex]::Matches($content, 'name:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"[\s\S]*?thumb:\s*"([^"]+)"')

$items = @()
foreach ($m in $matches) {
    $items += [PSCustomObject]@{
        Name  = $m.Groups[1].Value
        Url   = $m.Groups[2].Value
        Thumb = $m.Groups[3].Value
    }
}

if (-not $items.Count) { throw "No se encontraron obras en videopoetry-data.js" }

$gallery = ($items | ForEach-Object {
    $name = [System.Security.SecurityElement]::Escape($_.Name)
    @"
        <a href="$($_.Url)" class="item-media item-objkt" target="_blank" rel="noopener" aria-label="$name - ver en objkt">
            <img src="$($_.Thumb)" alt="$name" decoding="async" loading="eager">
            <span class="item-caption">$name</span>
            <span class="item-objkt-hint" data-i18n="verEnObjkt">ver en objkt -></span>
        </a>
"@
}) -join "`n"

$html = Get-Content -LiteralPath $htmlPath -Raw -Encoding UTF8
$pattern = '(?s)<!-- GALLERY_START -->.*?<!-- GALLERY_END -->'
$replacement = "<!-- GALLERY_START -->`n$gallery`n        <!-- GALLERY_END -->"
$newHtml = [regex]::Replace($html, $pattern, $replacement)

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($htmlPath, $newHtml, $utf8)
Write-Host "Galeria actualizada: $($items.Count) obras"
