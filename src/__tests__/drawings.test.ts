import { Skia } from '@shopify/react-native-skia';
import fs from 'fs';

import { drawings } from '../drawings';

const { buildAll, render, convertSvg, OUT_FILE } = require('../../scripts/build-drawings');

describe('coloring pages', () => {
  it('src/drawings/generated.ts matches the SVGs (run `npm run drawings`)', () => {
    expect(fs.readFileSync(OUT_FILE, 'utf8')).toBe(render(buildAll()));
  });

  it.each(drawings.map((d) => [d.id, d]))('%s has valid shapes', (_id, drawing) => {
    expect(drawing.viewBox).toHaveLength(4);
    expect(drawing.shapes.some((s) => s.fillable)).toBe(true);
    for (const shape of drawing.shapes) {
      expect(Skia.Path.MakeFromSVGString(shape.d)).not.toBeNull();
    }
  });

  it('has unique ids', () => {
    const ids = drawings.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('SVG converter', () => {
  const svg = (body: string) => `<svg viewBox="0 0 100 100" stroke-width="4"><title>Test</title>${body}</svg>`;

  it('converts basic shapes and reads fill="none" as a line', () => {
    const d = convertSvg(
      svg(`
        <circle cx="50" cy="50" r="10"/>
        <rect x="0" y="0" width="10" height="10" rx="2"/>
        <polygon points="0,0 10,0 5,8"/>
        <path fill="none" d="M0 0 L10 10"/>
        <line x1="0" y1="0" x2="5" y2="5"/>
        <ellipse cx="5" cy="5" rx="3" ry="2" style="fill:none; stroke-width: 2"/>
      `),
      'test.svg',
    );
    expect(d.id).toBe('test');
    expect(d.name).toBe('Test');
    expect(d.viewBox).toEqual([0, 0, 100, 100]);
    expect(d.shapes.map((s: { fillable: boolean }) => s.fillable)).toEqual([true, true, true, false, false, false]);
    expect(d.shapes[0].strokeWidth).toBe(4);
    expect(d.shapes[5].strokeWidth).toBe(2);
    for (const s of d.shapes) expect(Skia.Path.MakeFromSVGString(s.d)).not.toBeNull();
  });

  it('rejects transforms and missing viewBox', () => {
    expect(() => convertSvg(svg('<rect transform="rotate(4)" width="1" height="1"/>'), 'x.svg')).toThrow(/transform/);
    expect(() => convertSvg('<svg><circle r="1"/></svg>', 'x.svg')).toThrow(/viewBox/);
  });
});
