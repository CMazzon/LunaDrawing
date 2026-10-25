import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DrawingThumb } from '../components/DrawingThumb';
import { drawings, type Drawing } from '../drawings';
import { tick } from '../haptics';
import { FEATURES, PAPERS, TITLE_COLORS, UI } from '../theme';

type Props = {
  onOpen: (drawing: Drawing | null, paper: string) => void;
};

export function HomeScreen({ onOpen }: Props) {
  const { width } = useWindowDimensions();
  const columns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const gap = 16;
  const tile = Math.floor((Math.min(width, 1000) - gap * (columns + 1)) / columns);

  const open = (drawing: Drawing | null, paper: string) => {
    tick();
    onOpen(drawing, paper);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { gap }]}>
        <Title text="Luna Drawing" />
        <View style={[styles.grid, { gap, width: tile * columns + gap * (columns - 1) }]}>
          <Tile size={tile} label="blank page" color={PAPERS.white} onPress={() => open(null, PAPERS.white)}>
            <Text style={{ fontSize: tile * 0.4 }}>🖍️</Text>
          </Tile>
          {FEATURES.nightPage && (
            <Tile size={tile} label="night page" color={PAPERS.night} onPress={() => open(null, PAPERS.night)}>
              <Text style={{ fontSize: tile * 0.4 }}>🌙</Text>
            </Tile>
          )}
          {drawings.map((d) => (
            <Tile key={d.id} size={tile} label={d.name} color={PAPERS.white} onPress={() => open(d, PAPERS.white)}>
              <DrawingThumb drawing={d} size={tile - 16} />
            </Tile>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Title({ text }: { text: string }) {
  return (
    <Text style={styles.title} accessibilityRole="header">
      {text.split('').map((ch, i) => (
        <Text key={i} style={{ color: TITLE_COLORS[i % TITLE_COLORS.length] }}>
          {ch}
        </Text>
      ))}
    </Text>
  );
}

type TileProps = { size: number; label: string; color: string; onPress: () => void; children: ReactNode };

function Tile({ size, label, color, onPress, children }: TileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size, backgroundColor: color, transform: [{ scale: pressed ? 0.93 : 1 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: UI.background,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowRadius: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
