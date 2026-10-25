import { Canvas, Image as SkiaImage, Picture } from '@shopify/react-native-skia';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  PixelRatio,
  StyleSheet,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Celebration } from '../components/Celebration';
import { ColorPalette } from '../components/ColorPalette';
import { LiveStroke, type LiveStrokeHandle } from '../components/LiveStroke';
import { RoundButton } from '../components/RoundButton';
import { StampIcon } from '../components/StampIcon';
import type { Drawing } from '../drawings';
import { distance } from '../engine/geometry';
import { add, canUndo, clear, emptyHistory, undo, type History } from '../engine/history';
import { fitPage, hitTest, preparePage } from '../engine/page';
import { newSeed } from '../engine/random';
import { flatten } from '../engine/raster';
import { backgroundColor, recordOutline, recordScene, recordSymmetryGuide } from '../engine/render';
import { BACKGROUND, type Point, type StampId, type Stroke, type Symmetry } from '../engine/types';
import { bump, cheer, tick } from '../haptics';
import { useDisposeReplaced } from '../hooks';
import { savePicture } from '../save';
import { PALETTE, SIZES, STAMPS, TOOLS, UI, type Tool } from '../theme';

type Props = {
  /** A coloring page, or null for a blank page. */
  drawing: Drawing | null;
  paper: string;
  onHome: () => void;
};

const SYMMETRY_ICONS: Record<Symmetry, string> = { 1: '🦋', 2: '🦋', 6: '❄️' };
const NEXT_SYMMETRY: Record<Symmetry, Symmetry> = { 1: 2, 2: 6, 6: 1 };

export function DrawScreen({ drawing, paper, onHome }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [history, setHistory] = useState<History>(emptyHistory);
  const [tool, setTool] = useState<Tool>(drawing ? 'fill' : 'crayon');
  const [color, setColor] = useState(paper === '#FFFFFF' ? PALETTE[0] : PALETTE[2]);
  const [size, setSize] = useState(SIZES[1]);
  const [stamp, setStamp] = useState<StampId>('star');
  const [symmetry, setSymmetry] = useState<Symmetry>(1);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [party, setParty] = useState(0);

  // The stroke under the finger. Touch moves only add points here; the
  // LiveStroke layer repaints at most once per screen refresh, so a slow
  // device drops frames instead of falling behind the finger.
  const current = useRef<Stroke | null>(null);
  const live = useRef<LiveStrokeHandle | null>(null);
  const frameRequest = useRef<number | null>(null);
  const redraw = () => {
    if (frameRequest.current !== null) return;
    frameRequest.current = requestAnimationFrame(() => {
      frameRequest.current = null;
      live.current?.redraw();
    });
  };
  const cancelRedraw = () => {
    if (frameRequest.current !== null) cancelAnimationFrame(frameRequest.current);
    frameRequest.current = null;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onHome();
      return true;
    });
    return () => {
      sub.remove();
      cancelRedraw();
    };
  }, [onHome]);

  const { width, height } = box;
  const ready = width > 0 && height > 0;
  const page = useMemo(() => (drawing ? preparePage(drawing) : null), [drawing]);
  const fit = useMemo(() => (page && ready ? fitPage(page.drawing, width, height) : null), [page, ready, width, height]);
  const background = backgroundColor(history.actions, paper);

  const scene = useMemo(
    () => (ready ? recordScene(history.actions, width, height, paper, page, fit) : null),
    [history.actions, ready, width, height, paper, page, fit],
  );
  const outline = useMemo(
    () => (page && fit ? recordOutline(page, fit, width, height) : null),
    [page, fit, width, height],
  );
  const guide = useMemo(
    () => (ready ? recordSymmetryGuide(symmetry, width, height, background) : null),
    [symmetry, ready, width, height, background],
  );
  // Finished strokes and the outlines are flattened into images: one cheap
  // draw per frame instead of replaying everything.
  const sceneImage = useMemo(() => (scene ? flatten([scene], width, height) : null), [scene, width, height]);
  const outlineImage = useMemo(
    () => (outline ? flatten([outline], width, height) : null),
    [outline, width, height],
  );
  useDisposeReplaced(scene);
  useDisposeReplaced(sceneImage);
  useDisposeReplaced(outline);
  useDisposeReplaced(outlineImage);
  useDisposeReplaced(guide);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setBox({ width: Math.round(w), height: Math.round(h) });
  };

  const pointOf = (e: GestureResponderEvent): Point => ({
    x: e.nativeEvent.locationX,
    y: e.nativeEvent.locationY,
  });

  const onTouchStart = (e: GestureResponderEvent) => {
    const p = pointOf(e);
    if (tool === 'fill') {
      const region = page && fit ? hitTest(page, fit, p) : BACKGROUND;
      setHistory((h) => add(h, { kind: 'fill', region, color }));
      bump();
      return;
    }
    current.current = {
      kind: 'stroke',
      brush: tool,
      stamp,
      color,
      size,
      symmetry,
      points: [p],
      center: { x: width / 2, y: height / 2 },
      seed: newSeed(),
    };
    redraw();
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    const stroke = current.current;
    if (!stroke) return;
    const p = pointOf(e);
    if (distance(p, stroke.points[stroke.points.length - 1]) < 2) return;
    stroke.points.push(p);
    redraw();
  };

  const onTouchEnd = () => {
    const stroke = current.current;
    if (!stroke) return;
    cancelRedraw();
    current.current = null;
    setHistory((h) => add(h, stroke));
  };

  const save = async () => {
    if (!scene) return;
    const image = flatten(outline ? [scene, outline] : [scene], width, height, PixelRatio.get());
    if (!image) return;
    try {
      if (await savePicture(image)) {
        cheer();
        setParty((n) => n + 1);
      }
    } catch (err) {
      console.warn('Could not save the picture', err);
    } finally {
      image.dispose();
    }
  };

  const pick = <T,>(set: (v: T) => void) => (v: T) => {
    tick();
    set(v);
  };

  const narrow = screenWidth < 420;
  const toolSize = narrow ? Math.floor((screenWidth - 24) / TOOLS.length) - 6 : 56;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topBar}>
        <RoundButton icon="🏠" label="home" onPress={onHome} />
        <View style={styles.row}>
          <RoundButton
            icon="↩️"
            label="undo"
            disabled={!canUndo(history)}
            onPress={() => {
              tick();
              setHistory(undo);
            }}
          />
          <RoundButton
            icon="🗑️"
            label="clear"
            disabled={history.actions.length === 0}
            onPress={() => {
              bump();
              setHistory(clear);
            }}
          />
          <RoundButton icon="📸" label="save picture" onPress={save} />
        </View>
      </View>

      <View
        style={[styles.paper, { backgroundColor: background }]}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={onTouchStart}
        onResponderMove={onTouchMove}
        onResponderRelease={onTouchEnd}
        onResponderTerminate={onTouchEnd}
      >
        {ready && (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {sceneImage && <SkiaImage image={sceneImage} x={0} y={0} width={width} height={height} fit="fill" />}
            {guide && <Picture picture={guide} />}
            <LiveStroke stroke={current} handle={live} width={width} height={height} background={background} />
            {outlineImage && (
              <SkiaImage image={outlineImage} x={0} y={0} width={width} height={height} fit="fill" />
            )}
          </Canvas>
        )}
      </View>

      <View style={styles.panel}>
        <View style={styles.tools}>
          {TOOLS.map((t) => (
            <RoundButton
              key={t.id}
              icon={t.icon}
              label={t.id}
              size={toolSize}
              selected={tool === t.id}
              onPress={() => pick(setTool)(t.id)}
            />
          ))}
        </View>

        <View style={styles.options}>
          {tool === 'stamp'
            ? STAMPS.map((s) => (
                <RoundButton key={s} label={`stamp ${s}`} size={46} selected={stamp === s} onPress={() => pick(setStamp)(s)}>
                  <StampIcon stamp={s} color={color} size={34} />
                </RoundButton>
              ))
            : SIZES.map((s) => (
                <RoundButton
                  key={s}
                  label={`size ${s}`}
                  size={46}
                  selected={size === s}
                  disabled={tool === 'fill'}
                  onPress={() => pick(setSize)(s)}
                >
                  <View style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: color === '#FFFFFF' ? '#DDD' : color }} />
                </RoundButton>
              ))}
          <View style={styles.spacer} />
          <RoundButton
            icon={SYMMETRY_ICONS[symmetry]}
            label={symmetry === 1 ? 'mirror off' : symmetry === 2 ? 'mirror' : 'kaleidoscope'}
            size={46}
            selected={symmetry !== 1}
            dimmed={symmetry === 1}
            onPress={() => pick(setSymmetry)(NEXT_SYMMETRY[symmetry])}
          />
        </View>

        <ColorPalette value={color} onChange={pick(setColor)} width={Math.min(screenWidth, 560)} />
      </View>

      <Celebration trigger={party} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: UI.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  paper: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  panel: {
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
    alignItems: 'center',
  },
  tools: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 560,
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
});
