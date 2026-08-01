# Rocio Mio — Portfolio

Sitio estatico del portfolio de Rocio Mio: series digitales, procesos con pigmentos naturales y archivo BosqueGracias.

**Live:** despues de publicar, la URL sera `https://<tu-usuario>.github.io/<nombre-repo>/`

## Estructura

```
index.html              Landing (series, procesos, BosqueGracias, contacto)
procesos.html           Bitacora de pigmentos y tecnicas
bosquegracias.html      Archivo de residencias y colaboraciones
css/                    Estilos globales
js/                     Scripts, i18n (ES|EN) y herramientas de build
videopoetry/            Serie Videopoetry
ruedas de energia/      Serie Energy Wheels
mixed faces/            Serie Mixed Faces
still a moment/         Serie Still a Moment
typemachine/            Serie TypeMachine
pigmento/               Imagenes de procesos (fuente del build)
residencias/            Imagenes y videos de BosqueGracias (fuente del build)
```

## Preview local

Desde la raiz del proyecto:

```powershell
# Python 3
python -m http.server 8080
```

Abrir `http://localhost:8080`

## Regenerar paginas

Si agregas imagenes nuevas en `pigmento/` o `residencias/`:

```powershell
# Procesos (procesos.html)
powershell -ExecutionPolicy Bypass -File js/build-procesos.ps1

# BosqueGracias (js/bosquegracias-data.js)
python js/build-bosquegracias.py
```

Optimizar imagenes nuevas (requiere Pillow):

```powershell
pip install pillow
python js/optimize-images.py
```

## Publicar en GitHub

### 1. Instalar Git

Descargar desde [git-scm.com](https://git-scm.com/download/win) e instalar con las opciones por defecto.

### 2. Crear repositorio en GitHub

1. Ir a [github.com/new](https://github.com/new)
2. Nombre sugerido: `rociomio-portfolio` (o el que prefieras)
3. **Public** o **Private** segun prefieras
4. **No** marcar "Add a README" (ya existe uno en la carpeta)
5. Crear repositorio y copiar la URL (ej. `https://github.com/tu-usuario/rociomio-portfolio.git`)

### 3. Subir la carpeta

En PowerShell, desde esta carpeta:

```powershell
# Solo la primera vez: tu nombre y email de GitHub
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

git commit -m "Publicacion inicial del portfolio Rocio Mio"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Si ya ejecutaste `git init` y `git add .` (como en esta carpeta), solo necesitas los pasos de arriba desde `git config`.

### 4. Activar GitHub Pages

1. En GitHub: **Settings** → **Pages**
2. **Source:** seleccionar **GitHub Actions**
3. Al hacer push a `main`, el workflow `.github/workflows/pages.yml` publica el sitio automaticamente
4. En unos minutos aparecera la URL en **Settings → Pages**

### Dominio propio (opcional)

Si tienes un dominio (ej. `rociomio.com`):

1. Crear archivo `CNAME` en la raiz con una sola linea: `rociomio.com`
2. En el DNS del dominio, agregar registro **CNAME** apuntando a `tu-usuario.github.io`
3. En GitHub Pages → **Custom domain**, ingresar el dominio

## Idioma

El toggle **ES | EN** guarda la preferencia en `localStorage` (`site-lang`) y funciona en index, procesos, BosqueGracias y todas las series.

## Tamano del repo

~200–250 MB (imagenes webp y algunos videos). Todos los archivos estan por debajo del limite de 100 MB de GitHub.
