// Browsers have no taptic engine, but Android Chrome can buzz the phone.
// (iPhone/iPad Safari ignores this; nothing breaks.)
function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // not supported
  }
}

/** Tiny click when picking a tool or color. */
export function tick() {
  vibrate(10);
}

/** A soft bump, e.g. when a fill lands. */
export function bump() {
  vibrate(25);
}

/** Happy buzz when a picture is saved. */
export function cheer() {
  vibrate([30, 60, 30]);
}
