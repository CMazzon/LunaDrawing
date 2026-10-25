export type Point = { x: number; y: number };

export type BrushId = 'crayon' | 'rainbow' | 'neon' | 'sparkle' | 'stamp' | 'eraser';
export type StampId = 'star' | 'heart' | 'flower' | 'bubble';
/** 1 = normal, 2 = mirror left/right, 6 = kaleidoscope */
export type Symmetry = 1 | 2 | 6;

export type Stroke = {
  kind: 'stroke';
  brush: BrushId;
  stamp: StampId;
  color: string;
  size: number;
  points: Point[];
  symmetry: Symmetry;
  /** Symmetry center: the middle of the canvas when the stroke was drawn. */
  center: Point;
  /** Makes sparkles/stamps look the same every time the stroke is re-drawn. */
  seed: number;
};

export type Fill = {
  kind: 'fill';
  /** Index into the coloring page regions, or BACKGROUND for the paper. */
  region: number;
  color: string;
};

export type Action = Stroke | Fill;

export const BACKGROUND = -1;
