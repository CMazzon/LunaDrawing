import type { SkImage } from '@shopify/react-native-skia';

/** On the web, saving downloads a PNG. */
export async function savePicture(image: SkImage): Promise<boolean> {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${image.encodeToBase64()}`;
  link.download = `luna-drawing-${Date.now()}.png`;
  link.click();
  return true;
}
