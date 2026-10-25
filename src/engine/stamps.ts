import { PaintStyle, Skia, type SkCanvas, type SkPath } from '@shopify/react-native-skia';

import { lighten } from './color';
import type { StampId } from './types';

// Stamp shapes are drawn around (0, 0) with a radius of about 1,
// then moved and scaled into place. They are built lazily because
// Skia is loaded asynchronously on web.

let cache: Record<string, SkPath> | null = null;

function shapes() {
  if (cache) return cache;
  const svg = (d: string) => Skia.Path.MakeFromSVGString(d)!;

  const star: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 0.45 : 1;
    star.push(`${i === 0 ? 'M' : 'L'}${(r * Math.cos(a)).toFixed(3)} ${(r * Math.sin(a)).toFixed(3)}`);
  }

  cache = {
    star: svg(star.join(' ') + ' Z'),
    heart: svg(
      'M0 0.85 C-0.6 0.45 -1.05 0.05 -1 -0.4 C-0.95 -0.9 -0.3 -1 0 -0.5 ' +
        'C0.3 -1 0.95 -0.9 1 -0.4 C1.05 0.05 0.6 0.45 0 0.85 Z',
    ),
    twinkle: svg('M0 -1 Q0.15 -0.15 1 0 Q0.15 0.15 0 1 Q-0.15 0.15 -1 0 Q-0.15 -0.15 0 -1 Z'),
  };
  return cache;
}

export const twinklePath = () => shapes().twinkle;

function paint(color: string, style = PaintStyle.Fill, width = 0) {
  const p = Skia.Paint();
  p.setAntiAlias(true);
  p.setColor(Skia.Color(color));
  p.setStyle(style);
  p.setStrokeWidth(width);
  return p;
}

export function paintStamp(
  canvas: SkCanvas,
  stamp: StampId,
  x: number,
  y: number,
  radius: number,
  tiltDegrees: number,
  color: string,
) {
  canvas.save();
  canvas.translate(x, y);
  canvas.rotate(tiltDegrees, 0, 0);
  canvas.scale(radius, radius);
  switch (stamp) {
    case 'star':
    case 'heart':
      canvas.drawPath(shapes()[stamp], paint(color));
      // a little shine makes stamps look like stickers
      canvas.drawCircle(-0.35, -0.3, 0.14, paint(lighten(color, 0.7)));
      break;
    case 'flower': {
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5;
        canvas.drawCircle(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0.45, paint(color));
      }
      canvas.drawCircle(0, 0, 0.38, paint(color === '#FFD60A' ? '#FF8A00' : '#FFD60A'));
      break;
    }
    case 'bubble':
      canvas.drawCircle(0, 0, 0.92, paint(lighten(color, 0.75)));
      canvas.drawCircle(0, 0, 0.92, paint(color, PaintStyle.Stroke, 0.14));
      canvas.drawCircle(-0.35, -0.35, 0.18, paint('#FFFFFF'));
      break;
  }
  canvas.restore();
}
