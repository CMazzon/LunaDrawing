import { useEffect, useRef } from 'react';

type Disposable = { dispose(): void } | null;

/**
 * Frees a Skia object once a newer one has replaced it on screen, and on unmount.
 * On native the garbage collector does this; on web (WebAssembly) nothing does.
 */
export function useDisposeReplaced(value: Disposable) {
  const previous = useRef<Disposable>(value);
  useEffect(() => {
    if (previous.current && previous.current !== value) previous.current.dispose();
    previous.current = value;
  }, [value]);
  useEffect(() => () => previous.current?.dispose(), []);
}
