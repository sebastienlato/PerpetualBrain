#!/usr/bin/env python3
from __future__ import annotations

import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
ICONSET = BUILD / "icon.iconset"


def hex_to_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def gradient_color(t: float) -> tuple[int, int, int, int]:
    stops = [
        (0.0, hex_to_rgba("#31c8ff")),
        (0.26, hex_to_rgba("#4486ff")),
        (0.48, hex_to_rgba("#7c5cff")),
        (0.72, hex_to_rgba("#ff4fd8")),
        (1.0, hex_to_rgba("#ff7a3d")),
    ]

    for index, (stop, color) in enumerate(stops[:-1]):
        next_stop, next_color = stops[index + 1]
        if stop <= t <= next_stop:
            local = (t - stop) / (next_stop - stop)
            return tuple(int(lerp(color[channel], next_color[channel], local)) for channel in range(4))

    return stops[-1][1]


def add_linear_gradient(draw: ImageDraw.ImageDraw, points: list[tuple[float, float]], width: int, alpha: int) -> None:
    for step in range(160):
        t0 = step / 160
        t1 = (step + 1) / 160
        x0 = lerp(points[0][0], points[-1][0], t0)
        y0 = lerp(points[0][1], points[-1][1], t0)
        x1 = lerp(points[0][0], points[-1][0], t1)
        y1 = lerp(points[0][1], points[-1][1], t1)
        color = gradient_color(t0)
        draw.line((x0, y0, x1, y1), fill=color[:3] + (alpha,), width=width)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def create_icon(size: int = 1024) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = rounded_mask(size, 226)

    base = Image.new("RGBA", (size, size), "#050506")
    image.alpha_composite(base)

    draw = ImageDraw.Draw(image, "RGBA")
    for y in range(size):
        shade = int(5 + (y / size) * 12)
        draw.line((0, y, size, y), fill=(shade, shade + 1, shade + 4, 255))

    grid = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid, "RGBA")
    for pos in range(128, size, 128):
        grid_draw.line((pos, 112, pos, size - 112), fill=(255, 255, 255, 13), width=2)
        grid_draw.line((112, pos, size - 112, pos), fill=(255, 255, 255, 10), width=2)
    image.alpha_composite(grid)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    ring_box = (96, 96, size - 96, size - 96)
    for width, alpha in ((42, 70), (24, 85), (10, 150)):
        for step in range(220):
            start = 200 + step * 0.95
            color = gradient_color(step / 220)
            glow_draw.arc(ring_box, start=start, end=start + 2.1, fill=color[:3] + (alpha,), width=width)
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    image.alpha_composite(glow)

    draw = ImageDraw.Draw(image, "RGBA")
    for width, alpha in ((8, 230), (4, 255)):
        for step in range(260):
            start = 200 + step * 0.95
            color = gradient_color(step / 260)
            draw.arc(ring_box, start=start, end=start + 1.8, fill=color[:3] + (alpha,), width=width)

    # Central command mark: a sharp neural/codex node grid inside a subtle brain-like loop.
    motif = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    motif_draw = ImageDraw.Draw(motif, "RGBA")
    nodes = [
        (370, 392),
        (512, 318),
        (654, 392),
        (420, 536),
        (512, 640),
        (604, 536),
    ]
    lines = [(0, 1), (1, 2), (0, 3), (2, 5), (3, 4), (4, 5), (1, 4), (3, 5)]
    for a, b in lines:
        add_linear_gradient(motif_draw, [nodes[a], nodes[b]], 10, 190)
    for index, (x, y) in enumerate(nodes):
        color = gradient_color(index / (len(nodes) - 1))
        motif_draw.ellipse((x - 24, y - 24, x + 24, y + 24), fill=(5, 5, 7, 255), outline=color, width=8)
        motif_draw.ellipse((x - 7, y - 7, x + 7, y + 7), fill=color)
    motif = motif.filter(ImageFilter.GaussianBlur(0.25))
    image.alpha_composite(motif)

    # Horizontal reference edge, tuned for small Dock sizes.
    edge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    edge_draw = ImageDraw.Draw(edge, "RGBA")
    add_linear_gradient(edge_draw, [(210, 758), (size - 210, 758)], 11, 245)
    edge = edge.filter(ImageFilter.GaussianBlur(0.3))
    image.alpha_composite(edge)

    shine = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shine_draw = ImageDraw.Draw(shine, "RGBA")
    shine_draw.rounded_rectangle((148, 132, size - 148, size - 132), radius=172, outline=(255, 255, 255, 28), width=2)
    image.alpha_composite(shine)

    image.putalpha(mask)
    return image


def save_iconset(source: Image.Image) -> None:
    if ICONSET.exists():
        shutil.rmtree(ICONSET)
    ICONSET.mkdir(parents=True)

    sizes = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]

    for name, target_size in sizes:
        resized = source.resize((target_size, target_size), Image.Resampling.LANCZOS)
        resized.save(ICONSET / name)


def main() -> None:
    BUILD.mkdir(exist_ok=True)
    icon = create_icon()
    icon.save(BUILD / "icon.png")
    icon.resize((512, 512), Image.Resampling.LANCZOS).save(BUILD / "icon-512.png")
    icon.resize((256, 256), Image.Resampling.LANCZOS).save(BUILD / "icon-256.png")
    save_iconset(icon)

    subprocess.run(["iconutil", "-c", "icns", str(ICONSET), "-o", str(BUILD / "icon.icns")], check=True)
    print(f"Wrote {BUILD / 'icon.png'}")
    print(f"Wrote {BUILD / 'icon.icns'}")


if __name__ == "__main__":
    main()
