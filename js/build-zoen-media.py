"""
Zoen Calega - convierte cada carpeta de proyecto a medios web y genera js/zoen-media.js.

Uso (desde la raiz del sitio):  python js/build-zoen-media.py

- Imagenes (jpg, jpeg, png, heic, webp) -> <carpeta>/web/<slug>.webp (lado mayor 1600px).
- Videos (mp4, mov) -> <carpeta>/web/<slug>.mp4 (max 1280x720) + <slug>-poster.webp.
- Solo reprocesa archivos nuevos o modificados.
"""

import json
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

SITE = Path(__file__).resolve().parent.parent
ROOT = SITE / "collabs" / "zoen calega"
MANIFEST = SITE / "js" / "zoen-media.js"

OUT_DIR = "web"
SKIP_DIRS = {"web", "webp", "bios"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".heic", ".webp"}
VIDEO_EXT = {".mp4", ".mov"}
MAX_EDGE = 1600
QUALITY = 78


def slugify(text, limit=48):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return (text[:limit].strip("-")) or "media"


def label_for(path, project_dir):
    rel = path.relative_to(project_dir)
    if len(rel.parts) > 1:
        return rel.parts[0]
    clean = re.sub(r"[_\-]+", " ", path.stem)
    return re.sub(r"\s+", " ", clean).strip()


def is_fresh(out, src):
    return out.exists() and out.stat().st_mtime >= src.stat().st_mtime


def save_webp(img, out):
    img = ImageOps.exif_transpose(img).convert("RGB")
    w, h = img.size
    scale = min(1.0, MAX_EDGE / max(w, h))
    if scale < 1:
        img = img.resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS)
    img.save(out, "WEBP", quality=QUALITY, method=6)
    return img.size


def convert_image(src, out):
    if not is_fresh(out, src):
        with Image.open(src) as img:
            return save_webp(img, out)
    with Image.open(out) as img:
        return img.size


def convert_video(src, out, poster):
    if not is_fresh(out, src):
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
                "-vf", "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-c:v", "libx264", "-preset", "slow", "-crf", "30",
                "-maxrate", "1200k", "-bufsize", "2400k", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(out),
            ],
            check=True,
        )
    if not is_fresh(poster, src):
        with tempfile.TemporaryDirectory() as tmp:
            frame = Path(tmp) / "frame.png"
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-ss", "1", "-i", str(src), "-frames:v", "1", str(frame)],
                check=True,
            )
            with Image.open(frame) as img:
                save_webp(img, poster)
    with Image.open(poster) as img:
        return img.size


def process_project(project_dir):
    out_dir = project_dir / OUT_DIR
    out_dir.mkdir(exist_ok=True)
    sources = sorted(
        (p for p in project_dir.rglob("*") if p.is_file() and OUT_DIR not in p.relative_to(project_dir).parts[:-1]),
        key=lambda p: str(p.relative_to(project_dir)).lower(),
    )
    images = [p for p in sources if p.suffix.lower() in IMAGE_EXT]
    videos = [p for p in sources if p.suffix.lower() in VIDEO_EXT]

    used, items = set(), []

    def unique_slug(path):
        base = slugify(path.stem)
        slug, n = base, 2
        while slug in used:
            slug, n = f"{base}-{n}", n + 1
        used.add(slug)
        return slug

    for src in images:
        slug = unique_slug(src)
        out = out_dir / f"{slug}.webp"
        w, h = convert_image(src, out)
        items.append({
            "type": "image",
            "src": out.relative_to(ROOT).as_posix(),
            "w": w,
            "h": h,
            "label": label_for(src, project_dir),
        })
        print(f"  img  {src.name[:60]} -> {out.name} {w}x{h} {out.stat().st_size // 1024}KB")

    for src in videos:
        slug = unique_slug(src)
        out = out_dir / f"{slug}.mp4"
        poster = out_dir / f"{slug}-poster.webp"
        w, h = convert_video(src, out, poster)
        items.append({
            "type": "video",
            "src": out.relative_to(ROOT).as_posix(),
            "poster": poster.relative_to(ROOT).as_posix(),
            "w": w,
            "h": h,
            "label": label_for(src, project_dir),
        })
        print(f"  vid  {src.name[:60]} -> {out.name} {out.stat().st_size // 1024}KB")

    return items


def main():
    manifest = {}
    for project_dir in sorted(p for p in ROOT.iterdir() if p.is_dir() and p.name.lower() not in SKIP_DIRS):
        print(f"[{project_dir.name}]")
        manifest[project_dir.name] = process_project(project_dir)

    body = json.dumps(manifest, ensure_ascii=False, indent=2)
    MANIFEST.write_text(
        "/**\n * Zoen Calega - medios por carpeta de proyecto.\n"
        " * GENERADO por js/build-zoen-media.py - no editar a mano.\n */\n"
        f"window.ZOEN_MEDIA = {body};\n",
        encoding="utf-8",
    )
    print(f"manifest -> {MANIFEST.relative_to(SITE)}")


if __name__ == "__main__":
    main()
