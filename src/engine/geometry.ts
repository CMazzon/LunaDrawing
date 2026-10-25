import type { Point } from './types';

/**
 * Walks along a polyline and calls `visit` every `spacing` pixels,
 * starting at the first point. Used to place sparkles and stamps.
 */
export function walk(points: Point[], spacing: number, visit: (p: Point, angle: number) => void) {
  if (points.length === 0) return;
  visit(points[0], 0);
  let carried = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    const angle = Math.atan2(dy, dx);
    let d = spacing - carried;
    while (d <= len) {
      visit({ x: a.x + (dx * d) / len, y: a.y + (dy * d) / len }, angle);
      d += spacing;
    }
    carried = len - (d - spacing);
  }
}

export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
