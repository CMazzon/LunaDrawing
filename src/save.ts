import type { SkImage } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

/** Saves the picture to the device's photo library. Returns false if not allowed. */
export async function savePicture(image: SkImage): Promise<boolean> {
  const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
  if (!permission.granted) return false;
  const file = new File(Paths.cache, `luna-drawing-${Date.now()}.png`);
  await file.write(image.encodeToBytes());
  await MediaLibrary.Asset.create(file.uri);
  file.delete();
  return true;
}
