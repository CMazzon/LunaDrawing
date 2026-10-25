import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { UI } from '../theme';

type Props = {
  icon?: string;
  children?: ReactNode;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  dimmed?: boolean;
  size?: number;
  label: string;
  style?: ViewStyle;
};

/** A big, squishy, round button. Kids tap with whole fingers. */
export function RoundButton({ icon, children, onPress, selected, disabled, dimmed, size = 52, label, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.selected,
        (disabled || dimmed) && styles.dimmed,
        { transform: [{ scale: pressed ? 0.88 : selected ? 1.08 : 1 }] },
        style,
      ]}
    >
      {icon ? <Text style={{ fontSize: size * 0.52 }}>{icon}</Text> : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.panel,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  selected: {
    backgroundColor: '#E6DEFF',
    borderWidth: 3,
    borderColor: UI.ink,
  },
  dimmed: {
    opacity: 0.35,
  },
});
