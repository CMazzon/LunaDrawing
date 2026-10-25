import { Picture } from '@shopify/react-native-skia';
import { useEffect, useState, type RefObject } from 'react';

import { recordStroke } from '../engine/render';
import type { Stroke } from '../engine/types';
import { useDisposeReplaced } from '../hooks';

export type LiveStrokeHandle = { redraw: () => void };

type Props = {
  stroke: RefObject<Stroke | null>;
  handle: RefObject<LiveStrokeHandle | null>;
  width: number;
  height: number;
  background: string;
};

/**
 * The stroke under the finger. It re-renders on its own (through `handle`),
 * so the toolbar, palette and finished picture stay untouched while drawing.
 */
export function LiveStroke({ stroke, handle, width, height, background }: Props) {
  const [, setFrame] = useState(0);

  useEffect(() => {
    handle.current = { redraw: () => setFrame((f) => f + 1) };
    return () => {
      handle.current = null;
    };
  }, [handle]);

  const s = stroke.current;
  const picture = s ? recordStroke(s, width, height, background) : null;
  useDisposeReplaced(picture);

  return picture ? <Picture picture={picture} /> : null;
}
