"""Draws the app icon (rainbow + star) and the PWA icons. Run: python3 scripts/make-icons.py"""
import math
from PIL import Image, ImageDraw

S = 2048  # draw big, scale down for smooth edges
BG = (255, 244, 214)
RAINBOW = [(255, 59, 48), (255, 138, 0), (255, 214, 10), (39, 174, 96), (47, 107, 255), (142, 92, 246)]


def draw(size, safe=1.0):
    """safe < 1 shrinks the art into the middle (Android masks icons to a circle)."""
    im = Image.new('RGB', (S, S), BG)
    d = ImageDraw.Draw(im)
    k = safe
    cx, cy = S / 2, S * (0.5 + 0.12 * k)
    band = S * 0.06 * k
    outer = S * 0.40 * k
    for i, color in enumerate(RAINBOW):
        r = outer - i * band
        d.pieslice([cx - r, cy - r, cx + r, cy + r], 180, 360, fill=color)
    r = outer - len(RAINBOW) * band
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 180, 360, fill=BG)
    # a big yellow star sitting under the rainbow
    sr, sx, sy = S * 0.17 * k, cx, cy + S * 0.06 * k
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = sr if i % 2 == 0 else sr * 0.45
        pts.append((sx + rr * math.cos(a), sy + rr * math.sin(a)))
    d.polygon(pts, fill=(255, 214, 10), outline=(59, 46, 90), width=int(S * 0.018 * k))
    return im.resize((size, size), Image.LANCZOS)


draw(1024).save('assets/icon.png')
draw(192).save('public/icon-192.png')
draw(512).save('public/icon-512.png')
draw(512, safe=0.8).save('public/icon-maskable-512.png')
draw(180).save('public/apple-touch-icon.png')
draw(48).save('assets/favicon.png')
print('icons written')
