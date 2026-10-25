import { findDrawing } from '../drawings';
import { walk } from '../engine/geometry';
import { add, canUndo, clear, emptyHistory, undo } from '../engine/history';
import { fitPage, hitTest, preparePage } from '../engine/page';
import { isDark } from '../engine/color';
import { backgroundColor, recordOutline, recordScene, recordSymmetryGuide } from '../engine/render';
import { BACKGROUND, type Action, type BrushId, type Stroke, type Symmetry } from '../engine/types';

const cat = findDrawing('cat')!;
const shapeIndex = (d: string) => cat.shapes.findIndex((s) => s.d.startsWith(d));

describe('hitTest', () => {
  const page = preparePage(cat);
  // viewBox is 0 0 400 400; a 400x400 box with no padding maps 1:1
  const fit = fitPage(cat, 400, 400, 0);

  it('finds the head, the eyes inside it, and the paper around', () => {
    const head = shapeIndex('M120 162');
    const leftEye = shapeIndex('M157 150');
    expect(head).toBeGreaterThan(-1);
    expect(leftEye).toBeGreaterThan(-1);
    expect(hitTest(page, fit, { x: 200, y: 120 })).toBe(head);
    expect(hitTest(page, fit, { x: 170, y: 150 })).toBe(leftEye);
    expect(hitTest(page, fit, { x: 5, y: 5 })).toBe(BACKGROUND);
  });

  it("cuts the eyes out of the head, so filling the face keeps the eyes", () => {
    const head = shapeIndex('M120 162');
    expect(page.regions[head]!.contains(200, 120)).toBe(true);
    expect(page.regions[head]!.contains(170, 150)).toBe(false);
  });

  it('works when the page is scaled and centered', () => {
    const wide = fitPage(cat, 800, 400, 0); // scale 1, shifted right by 200
    expect(wide.scale).toBe(1);
    expect(hitTest(page, wide, { x: 400, y: 120 })).toBe(shapeIndex('M120 162'));
    expect(hitTest(page, wide, { x: 100, y: 200 })).toBe(BACKGROUND);
  });
});

describe('history', () => {
  const fill = (color: string): Action => ({ kind: 'fill', region: BACKGROUND, color });

  it('undoes one step at a time', () => {
    const h = add(add(emptyHistory, fill('#111111')), fill('#222222'));
    expect(undo(h).actions).toEqual([fill('#111111')]);
    expect(canUndo(undo(undo(h)))).toBe(false);
  });

  it('can undo a clear', () => {
    const h = clear(add(emptyHistory, fill('#111111')));
    expect(h.actions).toEqual([]);
    expect(canUndo(h)).toBe(true);
    expect(undo(h).actions).toEqual([fill('#111111')]);
  });

  it('ignores tapping the same spot with the same color again', () => {
    const h = add(add(emptyHistory, fill('#111111')), fill('#111111'));
    expect(h.actions).toHaveLength(1);
    expect(add(h, fill('#222222')).actions).toHaveLength(2);
  });

  it('forgets the cleared picture once you draw again', () => {
    const h = add(clear(add(emptyHistory, fill('#111111'))), fill('#222222'));
    expect(undo(undo(h)).actions).toEqual([]);
  });
});

describe('backgroundColor', () => {
  it('uses the last background fill, or the paper', () => {
    expect(backgroundColor([], '#FFFFFF')).toBe('#FFFFFF');
    expect(
      backgroundColor(
        [
          { kind: 'fill', region: BACKGROUND, color: '#000000' },
          { kind: 'fill', region: 3, color: '#FF0000' },
        ],
        '#FFFFFF',
      ),
    ).toBe('#000000');
  });
});

describe('walk', () => {
  it('visits points evenly along a line', () => {
    const seen: number[] = [];
    walk([{ x: 0, y: 0 }, { x: 25, y: 0 }, { x: 50, y: 0 }], 10, (p) => seen.push(Math.round(p.x)));
    expect(seen).toEqual([0, 10, 20, 30, 40, 50]);
  });
});

describe('rendering', () => {
  const brushes: BrushId[] = ['crayon', 'rainbow', 'neon', 'sparkle', 'stamp', 'eraser'];
  const symmetries: Symmetry[] = [1, 2, 6];
  const stroke = (brush: BrushId, symmetry: Symmetry, n: number): Stroke => ({
    kind: 'stroke',
    brush,
    stamp: 'heart',
    color: '#FF3B30',
    size: 16,
    symmetry,
    center: { x: 150, y: 150 },
    seed: 42,
    points: Array.from({ length: n }, (_, i) => ({ x: 20 + i * 7, y: 50 + Math.sin(i) * 20 })),
  });

  it('draws every brush, with and without symmetry, as dots and lines', () => {
    const page = preparePage(cat);
    const fit = fitPage(cat, 300, 300);
    const actions: Action[] = [{ kind: 'fill', region: 4, color: '#FFD60A' }];
    for (const b of brushes) for (const s of symmetries) for (const n of [1, 30]) actions.push(stroke(b, s, n));
    expect(recordScene(actions, 300, 300, '#FFFFFF', page, fit)).toBeTruthy();
    expect(recordOutline(page, fit, 300, 300)).toBeTruthy();
  });
});

describe('symmetry guide', () => {
  it('shows only when mirror or kaleidoscope is on', () => {
    expect(recordSymmetryGuide(1, 300, 300, '#FFFFFF')).toBeNull();
    expect(recordSymmetryGuide(2, 300, 300, '#FFFFFF')).toBeTruthy();
    expect(recordSymmetryGuide(6, 300, 300, '#14123A')).toBeTruthy();
  });

  it('picks a guide color that shows on the paper', () => {
    expect(isDark('#14123A')).toBe(true);
    expect(isDark('#FFFFFF')).toBe(false);
    expect(isDark('#FFD60A')).toBe(false);
  });
});
