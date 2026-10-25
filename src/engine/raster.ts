import { PixelRatio } from 'react-native';
import { Skia, type SkImage, type SkPicture } from '@shopify/react-native-skia';

/** Pixel density for flattened layers: sharp on HiDPI screens, capped to save memory. */
export const LAYER_SCALE = Math.min(PixelRatio.get(), 2);

/**
 * Flattens pictures into one image. Drawing a single image every frame is much
 * cheaper than replaying hundreds of strokes (or the coloring page's clipped
 * outlines) while the finger moves.
 */
export function flatten(pictures: SkPicture[], width: number, height: number, scale = LAYER_SCALE): SkImage | null {
  const surface = Skia.Surface.Make(Math.ceil(width * scale), Math.ceil(height * scale));
  if (!surface) return null;
  const canvas = surface.getCanvas();
  canvas.scale(scale, scale);
  for (const picture of pictures) canvas.drawPicture(picture);
  surface.flush();
  const image = surface.makeImageSnapshot();
  surface.dispose();
  return image;
}
