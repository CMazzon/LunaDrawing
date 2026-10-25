import { PathOp, Skia, type SkPath } from '@shopify/react-native-skia';

import type { Drawing } from '../drawings';
import { BACKGROUND, type Point } from './types';

export const DEFAULT_OUTLINE = 8;

/** A coloring page turned into Skia paths, ready to paint and tap. */
export type Page = {
  drawing: Drawing;
  shapes: SkPath[];
  /**
   * What you see of each shape: the shape minus the fillable shapes on top
   * of it, so filling a face doesn't paint over its eyes. null = not fillable.
   */
  regions: (SkPath | null)[];
};

export type Fit = { scale: number; dx: number; dy: number };

const cache = new Map<string, Page>();

export function preparePage(drawing: Drawing): Page {
  const cached = cache.get(drawing.id);
  if (cached) return cached;

  const shapes = drawing.shapes.map((s) => {
    const path = Skia.Path.MakeFromSVGString(s.d);
    if (!path) throw new Error(`Drawing "${drawing.id}" has a bad path: ${s.d}`);
    return path;
  });

  const regions = drawing.shapes.map((s, i) => {
    if (!s.fillable) return null;
    let region = shapes[i];
    for (let j = i + 1; j < shapes.length; j++) {
      if (!drawing.shapes[j].fillable) continue;
      region = Skia.Path.MakeFromOp(region, shapes[j], PathOp.Difference) ?? region;
    }
    return region;
  });

  const page = { drawing, shapes, regions };
  cache.set(drawing.id, page);
  return page;
}

/** Centers the drawing in a width × height box, as big as fits. */
export function fitPage(drawing: Drawing, width: number, height: number, padding = 16): Fit {
  const [minX, minY, w, h] = drawing.viewBox;
  const scale = Math.max(0.01, Math.min((width - padding * 2) / w, (height - padding * 2) / h));
  return {
    scale,
    dx: (width - w * scale) / 2 - minX * scale,
    dy: (height - h * scale) / 2 - minY * scale,
  };
}

/** Which region is under the finger? BACKGROUND when it's the paper. */
export function hitTest(page: Page, fit: Fit, screen: Point): number {
  const x = (screen.x - fit.dx) / fit.scale;
  const y = (screen.y - fit.dy) / fit.scale;
  for (let i = page.regions.length - 1; i >= 0; i--) {
    if (page.regions[i]?.contains(x, y)) return i;
  }
  // Tapped right on an outline: pick the top shape there.
  for (let i = page.shapes.length - 1; i >= 0; i--) {
    if (page.regions[i] && page.shapes[i].contains(x, y)) return i;
  }
  return BACKGROUND;
}
