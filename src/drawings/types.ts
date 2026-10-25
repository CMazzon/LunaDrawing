export type DrawingShape = {
  /** SVG path data, in viewBox coordinates. */
  d: string;
  /** false for decoration lines (whiskers, smiles…) that can't be filled. */
  fillable: boolean;
  /** Outline thickness in viewBox units. Defaults to 8. */
  strokeWidth?: number;
};

export type Drawing = {
  id: string;
  name: string;
  /** [minX, minY, width, height] */
  viewBox: number[];
  /** Painted in order: later shapes sit on top of earlier ones. */
  shapes: DrawingShape[];
};
