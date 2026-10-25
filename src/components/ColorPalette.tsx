import { Pressable, StyleSheet, View } from 'react-native';

import { PALETTE } from '../theme';

type Props = { value: string; onChange: (color: string) => void; width: number };

const WOOD = '#F2C98B';

/**
 * Two rows of big colored pencils. The chosen pencil pops up out of the row,
 * like pulling a crayon out of the box.
 */
export function ColorPalette({ value, onChange, width }: Props) {
  const perRow = PALETTE.length / 2;
  const gap = 8;
  const pencil = Math.min(56, Math.floor((width - 16) / perRow) - gap);
  const lift = Math.round(pencil * 0.35);
  return (
    <View style={[styles.grid, { columnGap: gap, rowGap: 4, width: perRow * pencil + (perRow - 1) * gap }]}>
      {PALETTE.map((color) => {
        const selected = color === value;
        return (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityLabel={`color ${color}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(color)}
            hitSlop={4}
            style={({ pressed }) => ({
              paddingTop: lift,
              transform: [{ translateY: selected ? -lift : pressed ? -lift / 2 : 0 }],
            })}
          >
            <Pencil color={color} width={pencil} selected={selected} />
          </Pressable>
        );
      })}
    </View>
  );
}

function Pencil({ color, width, selected }: { color: string; width: number; selected: boolean }) {
  const tip = Math.round(width * 0.85);
  const lead = Math.round(tip * 0.38);
  const leadWidth = (width * lead) / tip;
  const body = Math.round(width * 1.35);
  const light = color === '#FFFFFF';
  return (
    <View style={[styles.pencil, selected && styles.selected]}>
      {/* sharpened wood with the colored lead on top */}
      <View
        style={[
          styles.triangle,
          { borderLeftWidth: width / 2, borderRightWidth: width / 2, borderBottomWidth: tip, borderBottomColor: WOOD },
        ]}
      />
      <View
        style={[
          styles.triangle,
          styles.lead,
          {
            left: (width - leadWidth) / 2,
            borderLeftWidth: leadWidth / 2,
            borderRightWidth: leadWidth / 2,
            borderBottomWidth: lead,
            borderBottomColor: light ? '#D9D9D9' : color,
          },
        ]}
      />
      <View style={[styles.body, { width, height: body, backgroundColor: color }, light && styles.lightBody]}>
        <View style={[styles.shine, { width: width * 0.2 }]} />
        <View style={[styles.band, { top: body * 0.12 }]} />
        <View style={[styles.band, { bottom: body * 0.12 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pencil: {
    alignItems: 'center',
  },
  selected: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  lead: {
    position: 'absolute',
    top: 0,
  },
  body: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  lightBody: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#CFCFCF',
  },
  shine: {
    position: 'absolute',
    left: '18%',
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF4D',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0000001F',
  },
});
