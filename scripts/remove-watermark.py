"""Remove the Gemini sparkle watermark from the island scroll frames.

The sparkle sits at a fixed spot in every frame. Its shape is read from the near-black
end frames, then in every frame the sparkle area is replaced with:
  - a smooth fill interpolated from the surrounding pixels (colour / shading), plus
  - fine texture borrowed from the patch just to the right (so clouds don't look blurred).

Usage: python scripts/remove-watermark.py [--out DIR] [--only 1,60,120]
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

FRAMES = Path(__file__).resolve().parent.parent / "public" / "island_frames"
# Watermark centre / search radius in the 1280x720 frames; scaled for other sizes.
CENTER_720 = (1150, 599)
RADIUS_720 = 42
DARK_FRAMES = range(225, 239)  # near-black end frames used to measure the mask


def load(p: Path) -> np.ndarray:
    return np.asarray(Image.open(p).convert("RGB")).astype(np.float32)


def build_mask(res_dir: Path, box):
    """Soft 0..1 mask covering the sparkle (slightly dilated)."""
    x0, y0, x1, y1 = box
    # Per-pixel minimum over the dark frames drops any stars that move/twinkle.
    stack = np.stack([load(res_dir / f"f_{i:05d}.webp")[y0:y1, x0:x1] for i in DARK_FRAMES])
    m = stack.min(axis=0).mean(axis=2)
    border = np.concatenate([m[0], m[-1], m[:, 0], m[:, -1]])
    hard = (m - np.median(border)) > 6
    img = Image.fromarray((hard * 255).astype(np.uint8))
    img = img.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    return np.asarray(img).astype(np.float32) / 255.0


def harmonic_fill(region: np.ndarray, hole: np.ndarray, iters: int = 400) -> np.ndarray:
    """Fill hole pixels by repeatedly averaging neighbours (Laplace interpolation)."""
    out = region.copy()
    out[hole] = region[~hole].mean(axis=0)
    for _ in range(iters):
        avg = (np.roll(out, 1, 0) + np.roll(out, -1, 0) + np.roll(out, 1, 1) + np.roll(out, -1, 1)) / 4
        out[hole] = avg[hole]
    return out


def blur(a: np.ndarray, r: float) -> np.ndarray:
    chans = [np.asarray(Image.fromarray(np.clip(a[..., c], 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))) for c in range(3)]
    return np.stack(chans, axis=2).astype(np.float32)


def process(res: str, out_dir: Path | None, only: set[int] | None):
    res_dir = FRAMES / res
    w = Image.open(res_dir / "f_00001.webp").width
    s = w / 1280
    cx, cy, r = round(CENTER_720[0] * s), round(CENTER_720[1] * s), round(RADIUS_720 * s)
    box = (cx - r, cy - r, cx + r, cy + r)
    mask = build_mask(res_dir, box)
    print(f"{res}: mask covers {(mask > 0.5).sum()} px, box {box}")

    files = sorted(res_dir.glob("f_*.webp"))
    for f in files:
        idx = int(f.stem[2:])
        if only and idx not in only:
            continue
        img = load(f)
        x0, y0, x1, y1 = box
        region = img[y0:y1, x0:x1]
        smooth = harmonic_fill(region, mask > 0.05)
        # Texture donor: same-size patch immediately to the right (clamped to the frame).
        dx = min(x1 - x0, img.shape[1] - x1)
        donor = img[y0:y1, x0 + dx:x1 + dx]
        detail = donor - blur(donor, 2.0)
        filled = smooth + detail
        a = mask[..., None]
        img[y0:y1, x0:x1] = np.clip(region * (1 - a) + filled * a, 0, 255)
        dest = (out_dir / res / f.name) if out_dir else f
        dest.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(img.round().astype(np.uint8)).save(dest, "WEBP", quality=75, method=6)
    print(f"{res}: done")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, help="write here instead of overwriting in place")
    ap.add_argument("--only", help="comma-separated frame numbers (for testing)")
    args = ap.parse_args()
    only = {int(x) for x in args.only.split(",")} if args.only else None
    for res in ("720", "480"):
        process(res, args.out, only)
