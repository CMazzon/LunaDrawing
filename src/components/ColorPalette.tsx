import { Pressable, StyleSheet, View } from 'react-native';

import { PALETTE } from '../theme';

type Props = { value: string; onChange: (color: string) => void; width: number };

/** Two rows of fat color dots. */
export function ColorPalette({ value, onChange, width }: Props) {
  const perRow = PALETTE.length / 2;
  const gap = 8;
  const dot = Math.min(48, Math.floor((width - 16) / perRow) - gap);
  return (
    <View style={[styles.grid, { gap, width: perRow * dot + (perRow - 1) * gap }]}>
      {PALETTE.map((color) => {
        const selected = color === value;
        return (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityLabel={`color ${color}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(color)}
            style={({ pressed }) => [
              styles.dot,
              {
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                backgroundColor: color,
                transform: [{ scale: pressed ? 0.85 : selected ? 1.18 : 1 }],
              },
              selected && styles.selected,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    borderWidth: 2,
    borderColor: '#00000026',
  },
  selected: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
});
