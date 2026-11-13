"""
Rocio Mio - Portfolio PDF (10 paginas A4).
Lenguaje editorial Swiss / ficha Zoen: papel gris, tinta, acento rojo,
Archivo Black, Courier, marcas de registro.
"""

from io import BytesIO
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# Paths - raiz del sitio, fuentes y salida.
ROOT = Path(__file__).resolve().parents[2]
FONT_DIR = Path(__file__).resolve().parent / "fonts"
OUT = Path(__file__).resolve().parent / "rociomio-portfolio.pdf"
PREVIEW = Path(__file__).resolve().parent / "preview"

# Page - A4 retrato, portfolio para enviar / imprimir.
PAGE_W = 210 * mm
PAGE_H = 297 * mm
M = 14 * mm
G = 5 * mm
TOTAL = 10

# Palette - misma ficha que zoen-studio / tintas.
BG = HexColor("#f4f4f2")
BG_ALT = HexColor("#efefed")
INK = HexColor("#0a0a0a")
MUTE = HexColor("#6a6a6a")
ACCENT = HexColor("#e10600")
LINE = HexColor("#0a0a0a")


def register_fonts():
    pdfmetrics.registerFont(TTFont("Display", str(FONT_DIR / "ArchivoBlack-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Body", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("BodyBold", r"C:\Windows\Fonts\arialbd.ttf"))
    pdfmetrics.registerFont(TTFont("Sub", r"C:\Windows\Fonts\cour.ttf"))
    pdfmetrics.registerFont(TTFont("SubBold", r"C:\Windows\Fonts\courbd.ttf"))


def open_rgb(path):
    im = Image.open(path)
    if im.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", im.size, (244, 244, 242))
        bg.paste(im.convert("RGBA"), mask=im.convert("RGBA").split()[-1])
        return bg
    return im.convert("RGB")


def cover_crop(path, w, h, focus=(0.5, 0.45), quality=88):
    im = open_rgb(path)
    iw, ih = im.size
    target = w / h
    src = iw / ih
    if src > target:
        nw = ih * target
        left = max(0, min(iw - nw, (iw - nw) * focus[0]))
        im = im.crop((int(left), 0, int(left + nw), ih))
    else:
        nh = iw / target
        top = max(0, min(ih - nh, (ih - nh) * focus[1]))
        im = im.crop((0, int(top), iw, int(top + nh)))
    px = (max(2, int(w / mm * 6.5)), max(2, int(h / mm * 6.5)))
    if im.size[0] > px[0]:
        im = im.resize(px, Image.Resampling.LANCZOS)
    buf = BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    buf.seek(0)
    return ImageReader(buf)


def img(rel):
    p = ROOT / rel
    if not p.exists():
        raise FileNotFoundError(rel)
    return p


def draw_bg(c, color=BG):
    c.setFillColor(color)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def draw_marks(c):
    size = 3.4 * mm
    inset = 5.5 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(0.35)
    pts = [
        (inset, PAGE_H - inset),
        (PAGE_W - inset, PAGE_H - inset),
        (inset, inset),
        (PAGE_W - inset, inset),
    ]
    for x, y in pts:
        c.line(x, y - size / 2, x, y + size / 2)
        c.line(x - size / 2, y, x + size / 2, y)


def draw_folio(c, n):
    c.setFillColor(MUTE)
    c.setFont("Sub", 7.5)
    c.drawString(M, 7 * mm, f"{n:02d} / {TOTAL:02d}")
    c.drawRightString(PAGE_W - M, 7 * mm, "RM")


def kicker(c, text, x, y):
    c.setFillColor(MUTE)
    c.setFont("SubBold", 7)
    c.drawString(x, y, text.upper())


def hairline(c, x, y, w, alpha=0.3):
    c.setStrokeColor(Color(0.04, 0.04, 0.04, alpha=alpha))
    c.setLineWidth(0.45)
    c.line(x, y, x + w, y)


def title_lines(c, lines, x, y, size=28, leading=None, color=INK):
    leading = leading or size * 0.86
    c.setFillColor(color)
    c.setFont("Display", size)
    yy = y
    for line in lines:
        c.drawString(x, yy, line)
        yy -= leading
    return yy


def body(c, text, x, y, w, size=10.2, leading=14, color=INK):
    """Simple word-wrap body - returns y after last line."""
    c.setFillColor(color)
    c.setFont("Body", size)
    words = text.split()
    line = ""
    yy = y
    for word in words:
        test = (line + " " + word).strip()
        if c.stringWidth(test, "Body", size) <= w:
            line = test
        else:
            c.drawString(x, yy, line)
            yy -= leading
            line = word
    if line:
        c.drawString(x, yy, line)
        yy -= leading
    return yy


def draw_image(c, path, x, y, w, h, focus=(0.5, 0.45)):
    c.drawImage(cover_crop(path, w, h, focus), x, y, width=w, height=h, mask="auto")


def caption(c, text, x, y):
    c.setFillColor(MUTE)
    c.setFont("Sub", 6.5)
    c.drawString(x, y, text.upper())


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------

def page_01_cover(c):
    draw_bg(c)
    draw_marks(c)

    # Full-bleed hero under top band.
    hero_h = PAGE_H * 0.58
    draw_image(
        c,
        img("live at the bottom of the sea/portada.jpg"),
        0,
        PAGE_H - hero_h - 28 * mm,
        PAGE_W,
        hero_h,
        focus=(0.5, 0.42),
    )

    # Top meta band.
    kicker(c, "01 — Portfolio 2026", M, PAGE_H - 16 * mm)
    c.setFillColor(MUTE)
    c.setFont("Sub", 7)
    c.drawRightString(PAGE_W - M, PAGE_H - 16 * mm, "ROCIO MIO")

    # Brand block over lower paper.
    y = 58 * mm
    title_lines(c, ["ROCIO", "MIO"], M, y, size=54, leading=46)
    c.setFillColor(ACCENT)
    c.setFont("SubBold", 8)
    c.drawString(M, 28 * mm, "ARTISTA MULTIMEDIA  ·  DIRECCION DE ARTE  ·  GESTION CULTURAL")

    c.setFillColor(MUTE)
    c.setFont("Body", 9.5)
    c.drawString(M, 18 * mm, "Video · glitch analogico · textiles · pigmentos · BosqueGracias · onchain")
    draw_folio(c, 1)


def page_02_perfil(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "02 — Perfil", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["TRABAJO CON", "EL ERROR COMO", "LENGUAJE"], M, PAGE_H - 36 * mm, size=30)
    hairline(c, M, y - 4 * mm, PAGE_W - 2 * M)

    col_w = (PAGE_W - 2 * M - G) / 2
    left = M
    right = M + col_w + G
    top = y - 14 * mm

    body(
        c,
        "Artista multimedia, directora de arte y gestora cultural. Trabajo con video, "
        "instalaciones y performance, sonido, glitch, gifs, bordados y textiles, "
        "maquinas mecanicas y tecnicas analogicas que atraviesan multiples procesos "
        "de digitalizacion para convertirse en obra fisica y digital.",
        left,
        top,
        col_w,
        size=10.5,
        leading=15,
    )
    body(
        c,
        "Exploro poesia, territorios, materialidad y el error como lenguaje. "
        "Mi practica se mueve entre el laboratorio del bosque nativo, la senal "
        "analogica de monitores CRT y la publicacion onchain.",
        right,
        top,
        col_w,
        size=10.5,
        leading=15,
    )

    # Image strip.
    strip_y = 28 * mm
    strip_h = 88 * mm
    w1 = (PAGE_W - 2 * M - G) * 0.58
    w2 = PAGE_W - 2 * M - G - w1
    draw_image(c, img("videopoetry/portada videopoetry.webp"), M, strip_y, w1, strip_h, (0.5, 0.4))
    draw_image(
        c,
        img("collabs/zoen calega/Decentraland/web/casa-futuro-buenos-aires.webp"),
        M + w1 + G,
        strip_y,
        w2,
        strip_h,
        (0.5, 0.65),
    )
    caption(c, "Videopoetry  /  Mucha Tele · Zoen Calega", M, strip_y - 5 * mm)
    draw_folio(c, 2)


def page_03_timeline(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "03 — Linea de tiempo", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["CARRERA", "EN EL TIEMPO"], M, PAGE_H - 32 * mm, size=26, leading=23)
    hairline(c, M, y - 2 * mm, PAGE_W - 2 * M)

    # Timeline rows - year + text. Accent on recent pivots.
    entries = [
        (
            "2013-17",
            "Fotografia experimental, videopoesia, fotografia de eventos culturales, laboratorio analogico, "
            "camaras estenopeicas, grafica experimental. Formacion en libro de artista, marmolados y tecnicas "
            "de papeleria; bases de datos, planillas, sistematizaciones y digitalizacion de archivo.",
        ),
        (
            "2017+",
            "Diseno y registro permacultural de BosqueGracias junto a Mariano Montini: chacra forestal cultural "
            "de 4 ha en Epuyen. Tintas textiles y estampas con hojas del ecosistema; produccion a mano y maquina.",
        ),
        (
            "Talleres",
            "Epuyen y Chubut; Salta, La Pampa, Buenos Aires, Mendoza, Cordoba, Valencia, Berlin, Bruselas, Lisboa.",
        ),
        (
            "Residencias",
            "9 ediciones internacionales en Epuyen. Mas de 120 artistas, gestores e investigadores.",
        ),
        (
            "2023",
            "Marca de ropa unica BosqueGracias: bordados y estampas bajo el eje del suprareciclaje.",
        ),
        (
            "2024",
            "Instalaciones de TV y visuales en vivo con Zoen Calega: CRT, mapping y direccion de arte para eventos.",
        ),
        (
            "Feb 2025",
            "Residencia con 17 artistas brasileros y 6 argentinos. Estados correlacionados en Dunepark.",
        ),
        (
            "2025",
            "Exposicion RGB Montreal. Curaduria para Art on Tezos Berlin. Live at the bottom of the sea: "
            "cortometrajes CRT + pocket operator (Mar del Plata / Patagonia).",
        ),
        (
            "Ene 2026",
            "Incendio en estudios y talleres de BosqueGracias. Reinicio a pequena escala, mismos compromisos.",
        ),
        (
            "2026",
            "Exhibicion Estados correlacionados (BsAs): obras unicas de residencias, proyecciones de diapositivas "
            "e instalacion CRT. Curaduria de 180 artistas latinoamericanos para Newtro Arts.",
        ),
    ]

    accent_years = {"2024", "2025", "Ene 2026", "2026", "Feb 2025"}
    yy = y - 10 * mm
    year_w = 26 * mm
    text_x = M + year_w + 3 * mm
    text_w = PAGE_W - text_x - M

    for year, text in entries:
        c.setFillColor(ACCENT if year in accent_years else INK)
        c.setFont("SubBold", 7.2)
        c.drawString(M, yy, year.upper())
        end_y = body(c, text, text_x, yy, text_w, size=8.7, leading=11.5)
        yy = end_y - 3.2 * mm
        if yy < 18 * mm:
            break

    draw_folio(c, 3)


def page_04_series(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "04 — Series", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["ARCHIVO", "DE SERIES"], M, PAGE_H - 34 * mm, size=32)
    hairline(c, M, y - 3 * mm, PAGE_W - 2 * M)

    series = [
        ("live at the bottom of the sea/portada.jpg", "Live at the bottom of the sea", "Video · pocket operator · CRT · oceano"),
        ("videopoetry/portada videopoetry.webp", "Videopoetry", "Video · poesia · codigo · glitch analogico"),
        ("ruedas de energia/Energy wheels.webp", "Energy Wheels", "Cianotipo · bordado · archivo familiar"),
        ("mixed faces/Holy Mother and Lamb.webp", "Mixed Faces", "Diapositivas · collage · archivo encontrado"),
        ("still a moment/portada.webp", "Still a Moment", "Live glitch · .jpg · 1/24s"),
        ("typemachine/typmachine01.webp", "TypeMachine", "Maquina de escribir · scanner · IA"),
    ]

    cols = 3
    rows = 2
    gap = G
    top = y - 12 * mm
    cell_w = (PAGE_W - 2 * M - gap * (cols - 1)) / cols
    cell_h = 72 * mm
    img_h = 52 * mm

    for i, (rel, name, tag) in enumerate(series):
        col = i % cols
        row = i // cols
        x = M + col * (cell_w + gap)
        yy = top - row * (cell_h + 8 * mm) - img_h
        draw_image(c, img(rel), x, yy, cell_w, img_h, (0.5, 0.45))
        c.setFillColor(INK)
        c.setFont("BodyBold", 8.5)
        c.drawString(x, yy - 5 * mm, name)
        c.setFillColor(MUTE)
        c.setFont("Sub", 6.2)
        c.drawString(x, yy - 9.5 * mm, tag.upper())

    # Footer note for maquinas.
    c.setFillColor(MUTE)
    c.setFont("Sub", 7)
    c.drawString(M, 18 * mm, "TAMBIEN: MAQUINAS SENSIBLES · MEMORIAS · MAQUINAS · ARCHIVO")
    draw_folio(c, 4)


def page_05_seleccion_a(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "05 — Seleccion", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["VIDEO Y", "SENAL"], M, PAGE_H - 34 * mm, size=32)
    hairline(c, M, y - 3 * mm, PAGE_W - 2 * M)

    # Live sea block.
    top = y - 12 * mm
    c.setFillColor(ACCENT)
    c.setFont("SubBold", 7.5)
    c.drawString(M, top, "LIVE AT THE BOTTOM OF THE SEA  ·  SEP 2025")
    body(
        c,
        "Cortometrajes experimentales que mezclan el fondo del oceano con el fondo de los deseos. "
        "Audio con pocket operator arcade. Visuales de la expedicion en Mar del Plata, "
        "glitcheados con maquinas analogicas y filmados en CRT en Patagonia.",
        M,
        top - 8 * mm,
        PAGE_W - 2 * M,
        size=10,
        leading=13.5,
    )

    thumbs = [
        "live at the bottom of the sea/thumbs/02-make-the-seaweed-dance.jpg",
        "live at the bottom of the sea/thumbs/03-going-backward-is-also-moving-forward.jpg",
        "live at the bottom of the sea/thumbs/05-all-that-darkness-made-us-shine.jpg",
    ]
    tw = (PAGE_W - 2 * M - 2 * G) / 3
    th = 42 * mm
    ty = 148 * mm
    for i, rel in enumerate(thumbs):
        draw_image(c, img(rel), M + i * (tw + G), ty, tw, th, (0.5, 0.5))

    # Videopoetry block.
    c.setFillColor(INK)
    c.setFont("SubBold", 7.5)
    c.drawString(M, 132 * mm, "VIDEOPOETRY")
    body(
        c,
        "El video como poesia, codigo e investigacion en tiempo real. Maquinas analogicas, "
        "instalaciones CRT, direccion visual en vivo, experiencias espaciales y colaborativas.",
        M,
        124 * mm,
        PAGE_W - 2 * M,
        size=10,
        leading=13.5,
    )
    draw_image(
        c,
        img("videopoetry/portada videopoetry.webp"),
        M,
        28 * mm,
        PAGE_W - 2 * M,
        78 * mm,
        (0.5, 0.35),
    )
    caption(c, "collect at objkt · videopoetry / live at the bottom of the sea", M, 22 * mm)
    draw_folio(c, 5)


def page_06_seleccion_b(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "06 — Seleccion", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["ARCHIVO,", "GLITCH,", "OBJETO"], M, PAGE_H - 34 * mm, size=30)
    hairline(c, M, y - 3 * mm, PAGE_W - 2 * M)

    blocks = [
        (
            "ruedas de energia/Energy wheels.webp",
            "ENERGY WHEELS",
            "Fotos familiares bordadas con energia. Negativos de Manuel (1960) revelados en cianotipo. "
            "Serie fisica perdida en el incendio de enero 2026; permanece el archivo digital y onchain.",
            (0.5, 0.4),
        ),
        (
            "mixed faces/Holy Mother and Lamb.webp",
            "MIXED FACES",
            "Diapositivas, collage y archivo encontrado. Escenas reconstruidas donde lo sagrado, "
            "lo domestico y lo absurdo comparten el mismo fotograma.",
            (0.5, 0.45),
        ),
        (
            "still a moment/portada.webp",
            "STILL A MOMENT",
            "Live glitch detenido en 1/24s. El instante de la imagen digital como superficie tactile.",
            (0.5, 0.5),
        ),
        (
            "typemachine/typmachine01.webp",
            "TYPEMACHINE",
            "Maquina de escribir, scanner e IA. Texto mecanico convertido en paisaje visual.",
            (0.5, 0.45),
        ),
    ]

    cols = 2
    gap = G
    cell_w = (PAGE_W - 2 * M - gap) / 2
    img_h = 58 * mm
    start = y - 12 * mm

    for i, (rel, title, text, focus) in enumerate(blocks):
        col = i % cols
        row = i // cols
        x = M + col * (cell_w + gap)
        top = start - row * 110 * mm
        draw_image(c, img(rel), x, top - img_h, cell_w, img_h, focus)
        c.setFillColor(ACCENT if i == 0 else INK)
        c.setFont("SubBold", 7)
        c.drawString(x, top - img_h - 5 * mm, title)
        body(c, text, x, top - img_h - 12 * mm, cell_w - 2 * mm, size=8.8, leading=12)

    draw_folio(c, 6)


def page_07_procesos(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "07 — Procesos", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["LABORATORIO", "VIVO"], M, PAGE_H - 34 * mm, size=32)
    hairline(c, M, y - 3 * mm, PAGE_W - 2 * M)

    body(
        c,
        "Una observacion atenta de los ciclos del bosque nativo. A traves de la recoleccion etica "
        "de pigmentos botanicos, la fotogrametria, la cianotipia y la digitalizacion sensible de "
        "texturas organicas: un laboratorio vivo de archivo, luz y materia.",
        M,
        y - 14 * mm,
        PAGE_W - 2 * M,
        size=10.5,
        leading=14.5,
    )

    grid = [
        ("pigmento/pigmentos/Maqui_002__Everyday_Color-bosquegracias.webp", "Pigmentos"),
        ("pigmento/ECOPRINTS/Ecoprint_Maqui_003-23.webp", "Ecoprints"),
        ("pigmento/post incendio/cipres0625.webp", "Post incendio"),
        ("tintas textiles/cyanotipia y tintas vegetales.webp", "Tintas vegetales"),
        ("tintas textiles/manos en ecoprint.png", "Ecoprint / manos"),
        ("tintas textiles/serigrafia shablon (1).jpeg", "Serigrafia shablon"),
    ]

    cols = 3
    gap = 3.5 * mm
    cell_w = (PAGE_W - 2 * M - gap * (cols - 1)) / cols
    img_h = 58 * mm
    top = y - 42 * mm

    for i, (rel, label) in enumerate(grid):
        path = ROOT / rel
        if not path.exists():
            # Fallback within tintas if serigrafia missing encoding.
            alt = list((ROOT / "tintas textiles").glob("serigrafia*"))
            path = alt[0] if alt and "serigrafia" in rel else path
        col = i % cols
        row = i // cols
        x = M + col * (cell_w + gap)
        yy = top - row * (img_h + 14 * mm) - img_h
        draw_image(c, path, x, yy, cell_w, img_h, (0.5, 0.45))
        caption(c, label, x, yy - 5 * mm)

    draw_folio(c, 7)


def page_08_bosque(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "08 — BosqueGracias", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["ORGANISMO", "VIVO"], M, PAGE_H - 34 * mm, size=32, color=ACCENT)
    hairline(c, M, y - 3 * mm, PAGE_W - 2 * M)

    body(
        c,
        "Desde 2017, diseno y registro permacultural de BosqueGracias junto a Mariano Montini: "
        "chacra forestal cultural de 4 ha en Epuyen, Patagonia. Plataforma de investigacion artistica, "
        "gestion independiente y diseno regenerativo — un organismo vivo de ecologia de procesos, "
        "materialidades del territorio y tecnologias analogicas y digitales.",
        M,
        y - 14 * mm,
        PAGE_W - 2 * M,
        size=10.2,
        leading=14,
    )

    draw_image(
        c,
        img("portada index bosquegracias.png"),
        M,
        122 * mm,
        PAGE_W - 2 * M,
        68 * mm,
        (0.5, 0.4),
    )

    # Stats / modules.
    stats = [
        ("4 ha", "Chacra forestal cultural"),
        ("9", "Ediciones de residencias"),
        ("120+", "Artistas e investigadores"),
    ]
    sw = (PAGE_W - 2 * M - 2 * G) / 3
    for i, (num, label) in enumerate(stats):
        x = M + i * (sw + G)
        c.setFillColor(INK)
        c.setFont("Display", 20)
        c.drawString(x, 104 * mm, num)
        c.setFillColor(MUTE)
        c.setFont("Sub", 6.2)
        c.drawString(x, 96 * mm, label.upper())

    mods = [
        "Laboratorio de pigmentos naturales y tintas botanicas",
        "Procesos analogicos y fotografia no toxica",
        "Digitalizacion sensible y error mecanico",
        "Archivos territoriales y cartografias sensibles",
        "2023 — Marca de ropa unica: bordados, estampas, suprareciclaje",
    ]
    yy = 84 * mm
    c.setFillColor(INK)
    c.setFont("SubBold", 7)
    c.drawString(M, yy, "MODULOS, TALLERES Y MARCA")
    yy -= 7.5 * mm
    for m in mods:
        c.setFillColor(MUTE)
        c.setFont("Body", 9.2)
        c.drawString(M, yy, "·  " + m)
        yy -= 6.5 * mm

    body(
        c,
        "Tras los incendios territoriales, BosqueGracias reafirma su vocacion como archivo abierto "
        "y practica de remediacion poetica y material.",
        M,
        28 * mm,
        PAGE_W - 2 * M,
        size=9.5,
        leading=13,
    )
    draw_folio(c, 8)


def page_09_collabs(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "09 — Colaboraciones", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["CONEXIONES", "EN VIVO"], M, PAGE_H - 34 * mm, size=32)
    hairline(c, M, y - 3 * mm, PAGE_W - 2 * M)

    body(
        c,
        "Rocio (Arg) y Zoen (Peru) gestaron mas de 10 anos de producciones audiovisuales. "
        "En 2024, instalaciones de TV y visuales en vivo: CRT, mapping e imagenes generativas "
        "para musicos, empresas y eventos. Tambien: Clara Ohde, Ale Piovano, Teztones, Jade Sivori.",
        M,
        y - 14 * mm,
        PAGE_W - 2 * M,
        size=10.2,
        leading=14,
    )

    # Large collab image.
    draw_image(
        c,
        img("collabs/zoen calega/Decentraland/web/casa-futuro-buenos-aires.webp"),
        M,
        112 * mm,
        PAGE_W - 2 * M,
        72 * mm,
        (0.5, 0.7),
    )
    caption(c, "2024 · Mucha Tele · Zoen Calega · instalaciones CRT", M, 106 * mm)

    # Small grid of more images.
    extras = [
        ("collabs/zoen calega/exhibiciones/web/rgb-montreal.webp", "RGB Montreal 2025"),
        ("collabs/zoen calega/Decentraland/web/decentraland-instalacion-digital.webp", "Decentraland"),
        ("collabs/zoen calega/Decentraland/web/decentraland-metaverso.webp", "Metaverso"),
    ]
    ew = (PAGE_W - 2 * M - 2 * G) / 3
    eh = 44 * mm
    for i, (rel, label) in enumerate(extras):
        x = M + i * (ew + G)
        draw_image(c, img(rel), x, 48 * mm, ew, eh, (0.5, 0.45))
        caption(c, label, x, 42 * mm)

    c.setFillColor(MUTE)
    c.setFont("Sub", 6.5)
    c.drawString(
        M,
        24 * mm,
        "ART ON TEZOS BERLIN  ·  NEWTRO ARTS 2026  ·  ESTADOS CORRELACIONADOS BSAS  ·  ATRAKO  ·  NITELITE",
    )
    draw_folio(c, 9)


def page_10_contacto(c):
    draw_bg(c)
    draw_marks(c)
    kicker(c, "10 — Contacto", M, PAGE_H - 18 * mm)
    y = title_lines(c, ["OPEN FOR", "COLLABORATIONS"], M, PAGE_H - 36 * mm, size=30, color=ACCENT)
    hairline(c, M, y - 4 * mm, PAGE_W - 2 * M)

    body(
        c,
        "Disponible para direccion visual en vivo, instalaciones CRT, proyectos curatoriales, "
        "colaboraciones sonoras y consultas sobre la coleccion o residencias BosqueGracias.",
        M,
        y - 16 * mm,
        PAGE_W - 2 * M,
        size=11,
        leading=15,
    )
    body(
        c,
        "Abierta a obras comisionadas, piezas fisicas, desarrollo de proyectos web y editoriales, "
        "e invitaciones para dictar talleres en otros espacios creativos.",
        M,
        y - 48 * mm,
        PAGE_W - 2 * M,
        size=11,
        leading=15,
    )

    # Contact block.
    box_y = 118 * mm
    c.setFillColor(BG_ALT)
    c.rect(M, box_y - 52 * mm, PAGE_W - 2 * M, 58 * mm, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("SubBold", 8)
    c.drawString(M + 6 * mm, box_y, "CONTACTO")
    c.setFont("BodyBold", 14)
    c.drawString(M + 6 * mm, box_y - 12 * mm, "bosquegracias@gmail.com")
    c.setFillColor(MUTE)
    c.setFont("Sub", 7.5)
    links = [
        "rociomio.github.io/rociomio",
        "objkt.com/@bosquegracias  ·  objkt.com/@rociomio",
        "instagram.com/bosquegracias  ·  x.com/BosqueGracias",
        "linktr.ee/rociomio",
    ]
    yy = box_y - 24 * mm
    for line in links:
        c.drawString(M + 6 * mm, yy, line.upper())
        yy -= 7 * mm

    # Closing image strip.
    draw_image(
        c,
        img("live at the bottom of the sea/thumbs/06-transcendental-nature-of-this-point-of-view.jpg"),
        M,
        28 * mm,
        (PAGE_W - 2 * M - G) * 0.55,
        52 * mm,
        (0.5, 0.5),
    )
    draw_image(
        c,
        img("tintas textiles/maqui self.png"),
        M + (PAGE_W - 2 * M - G) * 0.55 + G,
        28 * mm,
        (PAGE_W - 2 * M - G) * 0.45,
        52 * mm,
        (0.5, 0.35),
    )

    c.setFillColor(MUTE)
    c.setFont("Sub", 7)
    c.drawString(M, 16 * mm, "ROCIO MIO  ·  PORTFOLIO 2026  ·  EPUYEN / PATAGONIA / ONCHAIN")
    draw_folio(c, 10)


def build():
    register_fonts()
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
    pages = [
        page_01_cover,
        page_02_perfil,
        page_03_timeline,
        page_04_series,
        page_05_seleccion_a,
        page_06_seleccion_b,
        page_07_procesos,
        page_08_bosque,
        page_09_collabs,
        page_10_contacto,
    ]
    for fn in pages:
        fn(c)
        c.showPage()
    c.save()
    print("wrote", OUT, "pages", TOTAL, "bytes", OUT.stat().st_size)


def render_previews():
    import pymupdf

    PREVIEW.mkdir(exist_ok=True)
    doc = pymupdf.open(OUT)
    mat = pymupdf.Matrix(1.15, 1.15)
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out = PREVIEW / f"p{i:02d}.png"
        pix.save(str(out))
        print("preview", out.name, pix.width, pix.height)
    doc.close()


if __name__ == "__main__":
    build()
    try:
        render_previews()
    except Exception as e:
        print("preview skip:", e)
