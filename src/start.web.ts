import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { registerRootComponent } from 'expo';

// On the web, Skia runs as WebAssembly that must load before any drawing code.
export function start() {
  LoadSkiaWeb({ locateFile: (file: string) => file }).then(() => {
    registerRootComponent(require('../App').default);
  });
}
