import { Canvas, Picture } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import type { Drawing } from '../drawings';
import { fitPage, preparePage } from '../engine/page';
import { recordOutline } from '../engine/render';

/** A little preview of a coloring page's lines. */
export function DrawingThumb({ drawing, size }: { drawing: Drawing; size: number }) {
  const picture = useMemo(() => {
    const page = preparePage(drawing);
    return recordOutline(page, fitPage(drawing, size, size, 10), size, size);
  }, [drawing, size]);
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}
