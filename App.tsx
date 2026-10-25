import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Drawing } from './src/drawings';
import { DrawScreen } from './src/screens/DrawScreen';
import { HomeScreen } from './src/screens/HomeScreen';

type Screen = { name: 'home' } | { name: 'draw'; drawing: Drawing | null; paper: string; key: number };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const goHome = useCallback(() => setScreen({ name: 'home' }), []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen.name === 'home' ? (
        <HomeScreen onOpen={(drawing, paper) => setScreen({ name: 'draw', drawing, paper, key: Date.now() })} />
      ) : (
        <DrawScreen key={screen.key} drawing={screen.drawing} paper={screen.paper} onHome={goHome} />
      )}
    </SafeAreaProvider>
  );
}
