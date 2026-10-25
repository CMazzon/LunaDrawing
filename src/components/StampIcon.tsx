import { Canvas, Picture, Skia } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { paintStamp } from '../engine/stamps';
import type { StampId } from '../engine/types';

/** Shows a stamp exactly as it will be printed, in the current color. */
export function StampIcon({ stamp, color, size }: { stamp: StampId; color: string; size: number }) {
  const picture = useMemo(() => {
    const rec = Skia.PictureRecorder();
    const canvas = rec.beginRecording(Skia.XYWHRect(0, 0, size, size));
    paintStamp(canvas, stamp, size / 2, size / 2, size * 0.42, 0, color);
    return rec.finishRecordingAsPicture();
  }, [stamp, color, size]);
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}
