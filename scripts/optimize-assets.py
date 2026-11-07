"""One-time asset optimizer: writes compressed copies next to the originals in public/.

Usage: python scripts/optimize-assets.py
Needs: Pillow, fonttools + brotli (for woff2), ffmpeg on PATH (for the loader video).
"""
import base64
import io
import re
import subprocess
from pathlib import Path

from PIL import Image

PUBLIC = Path(__file__).resolve().parent.parent / "public"

# (source, max width) -> written as .webp beside the source
IMAGES = [
    ("Island_frontPage.png", 1433),
    ("Building.png", 1600),
    ("Relax_bento.png", 900),
    ("frame1.png", 1024),
    ("frame2.png", 1024),
]

FONTS = [
    "fonts/FrenchVP Black.ttf",
    "fonts/Fontspring-DEMO-armingrotesk-semibold.otf",
    "fonts/Kefir-Regular.otf",
    "fonts/InstrumentSerif-Regular.ttf",
    "fonts/art-grootfontein-bangel-black-wave.otf",
    "fonts/AsgardTrial-FitXbold.ttf",
    "fonts/IncompleetaRegular.ttf",
    "fonts/IncompleetaLight.ttf",
    "fonts/Minecraft.ttf",
]


def kb(p: Path) -> str:
    return f"{p.stat().st_size / 1024:.0f} KB"


def save_webp(im: Image.Image, out: Path, max_w: int) -> None:
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(out, "WEBP", quality=82, method=6)


def optimize_images() -> None:
    for name, max_w in IMAGES:
        src = PUBLIC / name
        out = src.with_suffix(".webp")
        save_webp(Image.open(src), out, max_w)
        print(f"{name}: {kb(src)} -> {out.name} {kb(out)}")

    # me-01.svg is just a base64 PNG wrapped in an <svg>; pull it out as a WebP.
    svg = PUBLIC / "fonts/me-01.svg"
    data = re.search(rb'href="data:image/png;base64,([^"]+)"', svg.read_bytes()).group(1)
    out = PUBLIC / "fonts/me-01.webp"
    save_webp(Image.open(io.BytesIO(base64.b64decode(data))), out, 974)
    print(f"me-01.svg: {kb(svg)} -> {out.name} {kb(out)}")


def optimize_fonts() -> None:
    from fontTools.ttLib import TTFont

    for name in FONTS:
        src = PUBLIC / name
        out = src.with_suffix(".woff2")
        font = TTFont(src)
        font.flavor = "woff2"
        font.save(out)
        print(f"{name}: {kb(src)} -> {out.name} {kb(out)}")


def optimize_loader_video() -> None:
    src = PUBLIC / "Video Project 1.mp4"
    # Shown at most 14rem (224px) wide, so 448px covers 2x displays. No audio (it's muted).
    scale = ["-vf", "scale=448:448", "-an"]
    outs = {
        "loader.mp4": ["-c:v", "libx264", "-crf", "30", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],
        "loader.webm": ["-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-row-mt", "1"],
    }
    for name, codec in outs.items():
        out = PUBLIC / name
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), *scale, *codec, str(out)], check=True)
        print(f"{src.name}: {kb(src)} -> {name} {kb(out)}")
    poster = PUBLIC / "loader-poster.webp"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-frames:v", "1", "-vf", "scale=448:448", "-c:v", "libwebp", "-quality", "75", str(poster)], check=True)
    print(f"poster -> {poster.name} {kb(poster)}")


if __name__ == "__main__":
    optimize_images()
    optimize_fonts()
    optimize_loader_video()
