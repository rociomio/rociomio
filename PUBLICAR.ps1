# Script de ayuda para la primera publicacion en GitHub
# Uso: powershell -ExecutionPolicy Bypass -File PUBLICAR.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Test-Git {
    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) {
        Write-Host ""
        Write-Host "Git no esta instalado." -ForegroundColor Red
        Write-Host "Descargalo desde: https://git-scm.com/download/win" -ForegroundColor Yellow
        Write-Host "Despues de instalar, cierra y abre PowerShell, y vuelve a ejecutar este script."
        exit 1
    }
}

Test-Git

$fileCount = (Get-ChildItem -Recurse -File | Measure-Object).Count
$sizeMB = [math]::Round((Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 1)

Write-Host ""
Write-Host "Portfolio Rocio Mio - preparacion para GitHub" -ForegroundColor Cyan
Write-Host "Archivos: $fileCount | Tamano: ${sizeMB} MB"
Write-Host ""

if (-not (Test-Path ".git")) {
    git init
    Write-Host "Repositorio git inicializado." -ForegroundColor Green
} else {
    Write-Host "Ya existe un repositorio git en esta carpeta." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Configura tu identidad (solo la primera vez):"
Write-Host ""
Write-Host '   git config --global user.name "Tu Nombre"' -ForegroundColor White
Write-Host '   git config --global user.email "tu@email.com"' -ForegroundColor White
Write-Host ""
Write-Host "2. Crea un repo vacio en https://github.com/new"
Write-Host "3. Ejecuta estos comandos (reemplaza la URL):"
Write-Host ""
Write-Host '   git commit -m "Publicacion inicial del portfolio Rocio Mio"' -ForegroundColor White
Write-Host '   git branch -M main' -ForegroundColor White
Write-Host '   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git' -ForegroundColor White
Write-Host '   git push -u origin main' -ForegroundColor White
Write-Host ""
Write-Host "4. En GitHub: Settings > Pages > Source: GitHub Actions"
Write-Host ""
Write-Host "Mas detalle en README.md"
