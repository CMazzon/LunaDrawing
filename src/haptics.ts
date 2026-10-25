import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS !== 'web';
const ignore = () => {};

/** Tiny click when picking a tool or color. */
export function tick() {
  if (enabled) Haptics.selectionAsync().catch(ignore);
}

/** A soft bump, e.g. when a fill lands. */
export function bump() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignore);
}

/** Happy buzz when a picture is saved. */
export function cheer() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore);
}
