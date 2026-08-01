#!/usr/bin/env python3
"""Extrae títulos personalizados de procesos.html a JSON."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "procesos.html").read_text(encoding="utf-8")

titles: dict[str, str] = {}
for match in re.finditer(
    r'<article class="item-imagen"[^>]*>.*?<img src="([^"]+)"[^>]*>.*?<h3>([^<]+)</h3>',
    html,
    re.S,
):
    titles[match.group(1).replace("\\", "/")] = match.group(2).strip()

out = ROOT / "js" / "procesos-titles.json"
out.write_text(json.dumps(titles, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Guardados {len(titles)} títulos en {out.relative_to(ROOT)}")
