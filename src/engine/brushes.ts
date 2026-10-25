import {
  BlurStyle,
  PaintStyle,
  Skia,
  StrokeCap,
  StrokeJoin,
  type SkCanvas,
  type SkPaint,
  type SkPath,
} from '@shopify/react-native-skia';

import { hslToHex, lighten } from './color';
import { walk } from './geometry';
import { seededRandom } from './random';
import { paintStamp, twinklePath } from './stamps';
import type { Point, Stroke } from './types';

function strokePaint(color: string, width: number): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(width);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  return paint;
}

export function fillPaint(color: string): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  paint.setStyle(PaintStyle.Fill);
  return paint;
}

/** A smooth line through the points (quadratic curves between midpoints). */
function smoothPath(points: Point[]): SkPath {
  const b = Skia.PathBuilder.Make();
  b.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const next = points[i + 1];
    b.quadTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
  }
  const last = points[points.length - 1];
  b.lineTo(last.x, last.y);
  return b.detach();
}

function solidLine(canvas: SkCanvas, points: Point[], color: string, width: number) {
  if (points.length === 1) {
    canvas.drawCircle(points[0].x, points[0].y, width / 2, fillPaint(color));
    return;
  }
  canvas.drawPath(smoothPath(points), strokePaint(color, width));
}

function rainbow(canvas: SkCanvas, s: Stroke) {
  const width = s.size * 1.3;
  const startHue = s.seed % 360;
  if (s.points.length === 1) {
    canvas.drawCircle(s.points[0].x, s.points[0].y, width / 2, fillPaint(hslToHex(startHue, 90, 55)));
    return;
  }
  const paint = strokePaint('#000000', width);
  let travelled = 0;
  for (let i = 1; i < s.points.length; i++) {
    const a = s.points[i - 1];
    const b = s.points[i];
    travelled += Math.hypot(b.x - a.x, b.y - a.y);
    paint.setColor(Skia.Color(hslToHex((startHue + travelled * 0.8) % 360, 90, 55)));
    canvas.drawLine(a.x, a.y, b.x, b.y, paint);
  }
}

function neon(canvas: SkCanvas, s: Stroke) {
  const glow = strokePaint(s.color, s.size * 1.6);
  glow.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, s.size * 0.6, true));
  if (s.points.length === 1) {
    const { x, y } = s.points[0];
    canvas.drawCircle(x, y, s.size, fillPaint(s.color));
    canvas.drawCircle(x, y, s.size * 0.3, fillPaint(lighten(s.color, 0.75)));
    return;
  }
  const path = smoothPath(s.points);
  canvas.drawPath(path, glow);
  canvas.drawPath(path, strokePaint(lighten(s.color, 0.75), s.size * 0.4));
}

function sparkle(canvas: SkCanvas, s: Stroke) {
  const rand = seededRandom(s.seed);
  const colors = [s.color, s.color, lighten(s.color, 0.5), '#FFD60A', '#FFFFFF'];
  const twinkle = twinklePath();
  const paint = fillPaint(s.color);
  walk(s.points, Math.max(4, s.size * 0.6), (p) => {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * s.size * 1.1;
    const x = p.x + Math.cos(angle) * dist;
    const y = p.y + Math.sin(angle) * dist;
    paint.setColor(Skia.Color(colors[Math.floor(rand() * colors.length)]));
    if (rand() < 0.35) {
      canvas.drawCircle(x, y, Math.max(1.5, s.size * 0.12), paint);
      return;
    }
    const r = s.size * (0.25 + rand() * 0.45);
    canvas.save();
    canvas.translate(x, y);
    canvas.rotate(rand() * 45, 0, 0);
    canvas.scale(r, r);
    canvas.drawPath(twinkle, paint);
    canvas.restore();
  });
}

function stamps(canvas: SkCanvas, s: Stroke) {
  const rand = seededRandom(s.seed);
  const radius = s.size * 1.2 + 6;
  walk(s.points, radius * 2.3, (p) => {
    const scale = radius * (0.85 + rand() * 0.3);
    const tilt = (rand() - 0.5) * 50;
    paintStamp(canvas, s.stamp, p.x, p.y, scale, tilt, s.color);
  });
}

function paintOnce(canvas: SkCanvas, s: Stroke, background: string) {
  switch (s.brush) {
    case 'crayon':
      return solidLine(canvas, s.points, s.color, s.size);
    case 'eraser':
      return solidLine(canvas, s.points, background, s.size * 2);
    case 'rainbow':
      return rainbow(canvas, s);
    case 'neon':
      return neon(canvas, s);
    case 'sparkle':
      return sparkle(canvas, s);
    case 'stamp':
      return stamps(canvas, s);
  }
}

/** Paints a stroke, repeated for mirror / kaleidoscope symmetry. */
export function paintStroke(canvas: SkCanvas, s: Stroke, background: string) {
  if (s.points.length === 0) return;
  const { x: cx, y: cy } = s.center;
  for (let i = 0; i < s.symmetry; i++) {
    canvas.save();
    if (s.symmetry === 2 && i === 1) {
      canvas.translate(cx, 0);
      canvas.scale(-1, 1);
      canvas.translate(-cx, 0);
    } else if (i > 0) {
      canvas.rotate((360 / s.symmetry) * i, cx, cy);
    }
    paintOnce(canvas, s, background);
    canvas.restore();
  }
}
