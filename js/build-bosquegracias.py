#!/usr/bin/env python3
"""Regenera js/bosquegracias-data.js desde la carpeta residencias/."""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESIDENCIAS = ROOT / "residencias"
OUT = ROOT / "js" / "bosquegracias-data.js"


def detect_season(name: str) -> str | None:
    low = name.lower()
    for season in ("primavera", "verano", "invierno"):
        if season in low:
            return season
    if "oto" in low:
        return "otono"
    return None


def clean_alt(name: str) -> str:
    stem = Path(name).stem
    text = stem.replace("_resized", "").strip()
    normalized = __import__("unicodedata").normalize("NFKD", text)
    return "".join(c for c in normalized if not __import__("unicodedata").combining(c))


def media_entry(src: str, alt: str | None = None) -> dict:
    name = Path(src).name
    low = name.lower()
    return {
        "src": src.replace("\\", "/"),
        "alt": clean_alt(alt or name),
        "estacion": detect_season(name),
        "type": "video" if low.endswith(".mp4") else "image",
        "ohde": "ohde" in low and "collab ohde" not in src.replace("\\", "/").lower(),
    }


def main() -> None:
    media: list[dict] = []

    for name in sorted(os.listdir(RESIDENCIAS)):
        path = RESIDENCIAS / name
        if not path.is_file():
            continue
        low = name.lower()
        if not low.endswith(".webp"):
            continue
        media.append(media_entry(f"residencias/{name}"))

    ohde_collab: list[dict] = []
    collab_dir = RESIDENCIAS / "ohde" / "collab ohde"
    if collab_dir.is_dir():
        for name in sorted(os.listdir(collab_dir)):
            if name.lower().endswith(".webp"):
                ohde_collab.append(
                    media_entry(f"residencias/ohde/collab ohde/{name}")
                )

    ohde_proceso: list[dict] = []
    ohde_dir = RESIDENCIAS / "ohde"
    if ohde_dir.is_dir():
        for name in sorted(os.listdir(ohde_dir)):
            path = ohde_dir / name
            if not path.is_file():
                continue
            low = name.lower()
            if low.endswith(".webp"):
                ohde_proceso.append(media_entry(f"residencias/ohde/{name}"))

    for name in sorted(os.listdir(RESIDENCIAS)):
        path = RESIDENCIAS / name
        if not path.is_file():
            continue
        low = name.lower()
        if "ohde" in low and low.endswith(".webp"):
            ohde_proceso.append(media_entry(f"residencias/{name}"))

    seen_proceso: set[str] = set()
    ohde_proceso_unique: list[dict] = []
    for entry in ohde_proceso:
        if entry["src"] in seen_proceso:
            continue
        seen_proceso.add(entry["src"])
        ohde_proceso_unique.append(entry)

    payload = {
        "media": media,
        "ohdeCollab": ohde_collab,
        "ohdeProceso": ohde_proceso_unique,
    }
    OUT.write_text(
        "window.BOSQUE_DATA = "
        + json.dumps(payload, ensure_ascii=True, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(
        f"OK: {len(media)} residencias, {len(ohde_collab)} collab, "
        f"{len(ohde_proceso_unique)} proceso -> {OUT}"
    )


if __name__ == "__main__":
    main()
