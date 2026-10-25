import { ClipOp, PaintStyle, Skia, StrokeCap, StrokeJoin, type SkPicture } from '@shopify/react-native-skia';

import { fillPaint, paintStroke } from './brushes';
import { isDark } from './color';
import { DEFAULT_OUTLINE, type Fit, type Page } from './page';
import { BACKGROUND, type Action, type Stroke, type Symmetry } from './types';

export const OUTLINE_COLOR = '#222222';

/** The paper color: the last time the background was filled, or the starting paper. */
export function backgroundColor(actions: Action[], paper: string) {
  for (let i = actions.length - 1; i >= 0; i--) {
    const a = actions[i];
    if (a.kind === 'fill' && a.region === BACKGROUND) return a.color;
  }
  return paper;
}

function recorder(width: number, height: number) {
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording(Skia.XYWHRect(0, 0, width, height));
  return { rec, canvas };
}

/** Everything the child has done so far, as one picture. */
export function recordScene(
  actions: Action[],
  width: number,
  height: number,
  paper: string,
  page: Page | null,
  fit: Fit | null,
): SkPicture {
  const { rec, canvas } = recorder(width, height);
  const background = backgroundColor(actions, paper);
  canvas.drawColor(Skia.Color(background));
  for (const a of actions) {
    if (a.kind === 'stroke') {
      paintStroke(canvas, a, background);
    } else if (a.region !== BACKGROUND && page && fit) {
      const region = page.regions[a.region];
      if (!region) continue;
      canvas.save();
      canvas.translate(fit.dx, fit.dy);
      canvas.scale(fit.scale, fit.scale);
      canvas.drawPath(region, fillPaint(a.color));
      canvas.restore();
    }
  }
  return rec.finishRecordingAsPicture();
}

/** The stroke the finger is drawing right now. */
export function recordStroke(stroke: Stroke, width: number, height: number, background: string) {
  const { rec, canvas } = recorder(width, height);
  paintStroke(canvas, stroke, background);
  return rec.finishRecordingAsPicture();
}

/**
 * The black lines of a coloring page. Always drawn on top so they stay crisp.
 * Lines hidden behind a shape on top (the body behind the cat's head) are cut away,
 * just like in the SVG.
 */
export function recordOutline(page: Page, fit: Fit, width: number, height: number) {
  const { rec, canvas } = recorder(width, height);
  canvas.translate(fit.dx, fit.dy);
  canvas.scale(fit.scale, fit.scale);
  const { shapes } = page.drawing;
  shapes.forEach((shape, i) => {
    canvas.save();
    for (let j = i + 1; j < shapes.length; j++) {
      if (shapes[j].fillable) canvas.clipPath(page.shapes[j], ClipOp.Difference, true);
    }
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color(OUTLINE_COLOR));
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(shape.strokeWidth ?? DEFAULT_OUTLINE);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    canvas.drawPath(page.shapes[i], paint);
    canvas.restore();
  });
  return rec.finishRecordingAsPicture();
}

/**
 * Dashed lines showing the mirror / kaleidoscope axes, so it's obvious why
 * a stroke shows up twice. Only on screen: never part of the saved picture.
 */
export function recordSymmetryGuide(symmetry: Symmetry, width: number, height: number, background: string) {
  if (symmetry === 1) return null;
  const { rec, canvas } = recorder(width, height);
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(isDark(background) ? '#FFFFFF66' : '#3B2E5A55'));
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(3);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setPathEffect(Skia.PathEffect.MakeDash([12, 10], 0));
  const cx = width / 2;
  const cy = height / 2;
  if (symmetry === 2) {
    canvas.drawLine(cx, 0, cx, height, paint);
  } else {
    const reach = Math.hypot(width, height);
    for (let i = 0; i < symmetry; i++) {
      const a = ((-90 + (360 / symmetry) * i) * Math.PI) / 180;
      canvas.drawLine(cx, cy, cx + Math.cos(a) * reach, cy + Math.sin(a) * reach, paint);
    }
  }
  return rec.finishRecordingAsPicture();
}
