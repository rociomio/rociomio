$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Split-Path -Parent $scriptDir
$root = Join-Path $webRoot 'pigmento'
$titlesPath = Join-Path $webRoot 'js\procesos-titles.json'
$items = @()
$titles = @{}

if (Test-Path -LiteralPath $titlesPath) {
    $json = Get-Content -LiteralPath $titlesPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $titles = @{}
    foreach ($prop in $json.PSObject.Properties) {
        $titles[$prop.Name] = [string]$prop.Value
    }
}

function Get-RelPath($fullPath) {
    $rel = $fullPath.Substring($webRoot.Length + 1) -replace '\\', '/'
    return $rel
}

function Get-Title($path, $name) {
    if ($titles.ContainsKey($path)) { return $titles[$path] }

    $candidates = @(
        ($path -replace '\.(jpg|jpeg|png)$', '.webp'),
        ($path -replace '\.webp$', '_resized.webp'),
        ($path -replace '_resized\.webp$', '.webp')
    )

    foreach ($candidate in $candidates) {
        if ($titles.ContainsKey($candidate)) { return $titles[$candidate] }
    }

    return ($name -replace '_', ' ' -replace '-', ' ' -replace '  +', ' ').Trim()
}

function Add-FromDir($dir, $tag) {
    if (-not (Test-Path -LiteralPath $dir)) { return }
    Get-ChildItem -LiteralPath $dir -File | Where-Object { $_.Extension -match '\.(webp)$' } | ForEach-Object {
        $rel = Get-RelPath $_.FullName
        $script:items += [PSCustomObject]@{
            Tag   = $tag
            Path  = $rel
            Name  = $_.BaseName
            Title = Get-Title $rel $_.BaseName
        }
    }
}

function Add-Preferred($dir, $tag) {
    if (-not (Test-Path -LiteralPath $dir)) { return }
    $all = Get-ChildItem -LiteralPath $dir -File | Where-Object { $_.Extension -eq '.webp' }
    $groups = $all | ForEach-Object {
        $base = $_.BaseName -replace '_resized_resized$', '' -replace '_resized$', ''
        [PSCustomObject]@{ Base = $base; File = $_ }
    } | Group-Object Base

    foreach ($g in $groups) {
        $pick = ($g.Group | Where-Object { $_.File.Name -notlike '*_resized*' } | Select-Object -First 1).File
        if (-not $pick) { $pick = $g.Group[0].File }
        $rel = Get-RelPath $pick.FullName
        $script:items += [PSCustomObject]@{
            Tag   = $tag
            Path  = $rel
            Name  = $pick.BaseName
            Title = Get-Title $rel $pick.BaseName
        }
    }
}

Add-FromDir (Join-Path $root 'post incendio') 'post incendio'
Add-FromDir (Join-Path $root 'ECOPRINTS') 'ecoprints'
Add-FromDir (Join-Path $root 'ECOPRINTS\original') 'original'
Add-Preferred (Join-Path $root 'pigmentos') 'pigmentos'
Add-Preferred (Join-Path $root 'revelados') 'revelados'

$tags = @('todos') + ($items.Tag | Sort-Object -Unique)

$filterButtons = ($tags | ForEach-Object {
    if ($_ -eq 'todos') {
        "                <button class=`"etiqueta-filtro activa`" data-filtro=`"todos`" data-i18n=`"filtros.todos`">todos</button>"
    } else {
        "                <button class=`"etiqueta-filtro`" data-filtro=`"$_`">$_</button>"
    }
}) -join "`n"

$articles = ($items | ForEach-Object {
    $title = [System.Security.SecurityElement]::Escape($_.Title)
    @"
            <article class="item-imagen" data-categoria="$($_.Tag)">
                <img src="$($_.Path)" alt="$title" loading="lazy">
                <div class="info-hover">
                    <h3>$title</h3>
                    <span data-carpeta-tag="$($_.Tag)"></span>
                </div>
            </article>
"@
}) -join "`n"

$html = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Procesos e Investigacion | Rocio Mio</title>
    <meta name="description" content="Bitacora de pigmentos naturales - post incendio, ecoprints, revelados y mas.">
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body class="procesos-body">

    <header>
        <nav>
            <a href="index.html" class="logo-nav">Rocio Mio</a>
            <a href="index.html#series">Series</a>
            <a href="index.html#procesos" data-i18n="nav.procesos">Procesos</a>
            <a href="procesos.html" class="activo" data-i18n="nav.bitacora">Bitacora</a>
            <a href="index.html#bosquegracias">BosqueGracias</a>
            <a href="collabs/index.html" data-i18n="nav.colaboraciones">Colaboraciones</a>
            <a href="index.html#contacto" data-i18n="nav.contacto">Contacto</a>
            <div class="landing-lang-toggle" role="group" aria-label="Idioma">
                <button type="button" data-lang-btn="es" aria-pressed="true">ES</button>
                <span class="landing-lang-sep">|</span>
                <button type="button" data-lang-btn="en" aria-pressed="false">EN</button>
            </div>
        </nav>
    </header>

    <main class="pagina-interna procesos-layout">
        <section class="cabecera-interna">
            <h1 data-i18n="titulo">Procesos e investigacion</h1>
            <div class="procesos-descripcion">
            <p data-i18n="parrafos.0">Una observacion atenta de los ciclos del bosque nativo. A traves de la recoleccion etica de pigmentos botanicos, la fotogrametria, la cianotipia y la digitalizacion sensible de texturas organicas, un laboratorio vivo de archivo, luz y materia.</p>
            <p data-i18n="parrafos.1">Guiada por la curiosidad, genere un registro en papel y tintas textiles de Epuyen, Santa Cruz, Jujuy, Salta, Buenos Aires, Berlin y Valencia. Durante 2022 y 2026 dicte talleres en esos territorios bajo el nombre "Junta de Tintes".</p>
            <p data-i18n="parrafos.2">Todos estos registros resultaron quemados en el incendio de 2026 donde perdimos nuestra casa, estudio y galeria de arte. Los unicos registros que permanecen son los que fueron digitalizados y los nuevos colores.</p>
            </div>

            <div class="contenedor-etiquetas" id="filtros">
$filterButtons
            </div>
        </section>

        <div id="procesos-source">
$articles
        </div>

        <section class="procesos-galeria" id="galeria">
            <div id="procesosGrid"></div>
        </section>
    </main>

    <script src="js/procesos-content.js"></script>
    <script src="js/site-i18n.js"></script>
    <script src="js/procesos-masonry.js"></script>

</body>
</html>
"@

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $webRoot 'procesos.html'), $html, $utf8)
Write-Output "Generated $($items.Count) items"
