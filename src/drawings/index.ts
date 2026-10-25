import { drawings } from './generated';

export type { Drawing, DrawingShape } from './types';
export { drawings };

export function findDrawing(id: string) {
  return drawings.find((d) => d.id === id);
}
