#!/usr/bin/env python3
"""Convierte y comprime imágenes a WebP para el portfolio."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git", "__pycache__"}
SOURCE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}

GALLERY_DIRS = {
    "typemachine",
    "ruedas de energia",
    "still a moment",
    "EXPORTED",
    "intro",
    "mixed faces",
}


def folder_settings(path: Path) -> tuple[int, int]:
    parts = set(path.parts)
    if parts & GALLERY_DIRS:
        return 1920, 85
    return 1400, 82


def save_webp(src: Path, dst: Path, max_edge: int, quality: int) -> int:
    with Image.open(src) as img:
        img.load()
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

        w, h = img.size
        if max(w, h) > max_edge:
            scale = max_edge / max(w, h)
            img = img.resize(
                (max(1, int(w * scale)), max(1, int(h * scale))),
                Image.Resampling.LANCZOS,
            )

        tmp = dst.with_suffix(".webp.tmp")
        img.save(tmp, format="WEBP", quality=quality, method=6)
        size = tmp.stat().st_size
        tmp.replace(dst)
        return size


def main() -> int:
    targets = [
        ROOT / "typemachine",
        ROOT / "pigmento",
        ROOT / "ruedas de energia",
        ROOT / "still a moment",
        ROOT / "EXPORTED",
        ROOT / "intro",
        ROOT / "mixed faces",
    ]

    report: list[dict] = []
    seen_stems: set[str] = set()

    # 1) Convertir JPG/PNG → WebP
    for base in targets:
        if not base.exists():
            continue
        for path in sorted(base.rglob("*")):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"}:
                continue
            if any(part in SKIP_DIRS for part in path.parts):
                continue

            stem_key = str(path.relative_to(ROOT)).lower()
            max_edge, quality = folder_settings(path.relative_to(ROOT))
            out = path.with_suffix(".webp")
            before = path.stat().st_size

            try:
                after = save_webp(path, out, max_edge, quality)
                path.unlink()
                seen_stems.add(stem_key)
                report.append(
                    {
                        "action": "converted",
                        "src": str(path.relative_to(ROOT)),
                        "out": str(out.relative_to(ROOT)),
                        "before_mb": round(before / 1048576, 2),
                        "after_mb": round(after / 1048576, 2),
                    }
                )
            except Exception as exc:  # noqa: BLE001
                report.append({"src": str(path.relative_to(ROOT)), "error": str(exc)})

    # 2) Recomprimir WebP pesados (>350 KB)
    for base in targets:
        if not base.exists():
            continue
        for path in sorted(base.rglob("*.webp")):
            if not path.is_file() or path.name.endswith(".webp.tmp"):
                continue
            if any(part in SKIP_DIRS for part in path.parts):
                continue
            if path.stat().st_size <= 350_000:
                continue

            max_edge, quality = folder_settings(path.relative_to(ROOT))
            before = path.stat().st_size
            try:
                after = save_webp(path, path, max_edge, quality)
                if after < before * 0.98:
                    report.append(
                        {
                            "action": "recompressed",
                            "src": str(path.relative_to(ROOT)),
                            "before_mb": round(before / 1048576, 2),
                            "after_mb": round(after / 1048576, 2),
                        }
                    )
            except Exception as exc:  # noqa: BLE001
                report.append({"src": str(path.relative_to(ROOT)), "error": str(exc)})

    # 3) Eliminar duplicados *_resized.webp si existe la versión base
    for base in targets:
        if not base.exists():
            continue
        for path in sorted(base.rglob("*_resized.webp")):
            base_name = path.name.replace("_resized.webp", ".webp")
            canonical = path.with_name(base_name)
            if canonical.exists() and canonical != path:
                size = path.stat().st_size
                path.unlink()
                report.append(
                    {
                        "action": "removed_duplicate",
                        "src": str(path.relative_to(ROOT)),
                        "before_mb": round(size / 1048576, 2),
                    }
                )

    report_path = ROOT / "js" / "optimize-report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    converted = sum(1 for r in report if r.get("action") == "converted")
    recompressed = sum(1 for r in report if r.get("action") == "recompressed")
    errors = sum(1 for r in report if "error" in r)
    saved = sum(
        r.get("before_mb", 0) - r.get("after_mb", 0)
        for r in report
        if r.get("action") in {"converted", "recompressed"}
    )

    print(f"Convertidas: {converted}")
    print(f"Recomprimidas: {recompressed}")
    print(f"Errores: {errors}")
    print(f"Ahorro aprox: {saved:.1f} MB")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
