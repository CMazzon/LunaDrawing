import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const PARTY = ['🎉', '⭐', '🌈', '💖', '✨', '🎨'];

/** A big bouncy "yay!" that pops up and floats away. Change `trigger` to play it. */
export function Celebration({ trigger }: { trigger: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    progress.setValue(0);
    Animated.sequence([
      Animated.spring(progress, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(progress, { toValue: 2, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [trigger, progress]);

  if (trigger === 0) return null;
  const emoji = PARTY[trigger % PARTY.length];
  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.party,
        {
          opacity: progress.interpolate({ inputRange: [0, 0.2, 1, 2], outputRange: [0, 1, 1, 0] }),
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1, 2], outputRange: [0.2, 1, 1.4] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1, 2], outputRange: [40, 0, -80] }) },
          ],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  party: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    fontSize: 140,
  },
});
