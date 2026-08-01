#!/usr/bin/env python3
"""Quita acentos de textos UI (no modifica rutas src con nombres de archivo reales)."""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    out = []
    for ch in normalized:
        if unicodedata.combining(ch):
            continue
        if ch in "\u2014\u2013\u2018\u2019\u201c\u201d":
            out.append("-")
            continue
        out.append(ch)
    return "".join(out)


def strip_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = strip_accents(original)
    if updated != original:
        path.write_text(updated, encoding="utf-8", newline="\n")
        return True
    return False


def strip_json_titles(path: Path) -> bool:
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = False
    new_data = {}
    for key, value in data.items():
        new_value = strip_accents(value) if isinstance(value, str) else value
        if new_value != value:
            changed = True
        new_data[key] = new_value
    if changed:
        path.write_text(
            json.dumps(new_data, ensure_ascii=True, indent=2) + "\n",
            encoding="utf-8",
        )
    return changed


def strip_data_alts(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    payload = json.loads(text.split("=", 1)[1].rsplit(";", 1)[0].strip())
    changed = False
    for key in ("media", "ohdeCollab", "ohdeProceso"):
        for entry in payload[key]:
            alt = entry.get("alt", "")
            new_alt = strip_accents(alt)
            if new_alt != alt:
                entry["alt"] = new_alt
                changed = True
            est = entry.get("estacion")
            if isinstance(est, str):
                new_est = strip_accents(est)
                if new_est != est:
                    entry["estacion"] = new_est
                    changed = True
    if changed:
        path.write_text(
            "window.BOSQUE_DATA = "
            + json.dumps(payload, ensure_ascii=True, indent=2)
            + ";\n",
            encoding="utf-8",
        )
    return changed


def main() -> None:
    patterns = [
        "**/*.html",
        "css/*.css",
        "js/*.js",
        "js/*.ps1",
        "js/*.json",
    ]
    skip = {
        "strip-accents.py",
        "build-bosquegracias.py",
        "optimize-images.py",
        "extract-procesos-titles.py",
        "optimize-report.json",
    }

    touched = []
    for pattern in patterns:
        for path in ROOT.glob(pattern):
            if path.name in skip:
                continue
            if path.name == "procesos-titles.json":
                if strip_json_titles(path):
                    touched.append(path.relative_to(ROOT))
                continue
            if path.name == "bosquegracias-data.js":
                if strip_data_alts(path):
                    touched.append(path.relative_to(ROOT))
                continue
            if strip_file(path):
                touched.append(path.relative_to(ROOT))

    print(f"Updated {len(touched)} files:")
    for item in touched:
        print(f"  {item}")


if __name__ == "__main__":
    main()
