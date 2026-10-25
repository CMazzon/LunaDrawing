import type { BrushId, StampId } from './engine/types';

/** Bright crayon-box colors, including skin tones for drawing people. */
export const PALETTE = [
  '#FF3B30', '#FF8A00', '#FFD60A', '#8BE04E', '#27AE60', '#2ED1C4', '#4FC3F7', '#2F6BFF',
  '#8E5CF6', '#FF5FB4', '#FFC2A1', '#C68642', '#8B5A2B', '#9E9E9E', '#222222', '#FFFFFF',
];

export type Tool = BrushId | 'fill';

/**
 * Switch features on or off without deleting their code.
 * Turned-off tools and pages just don't show up on screen.
 */
export const FEATURES = {
  neon: false,
  stamps: false,
  nightPage: false,
};

const HIDDEN_TOOLS: Tool[] = [...(FEATURES.neon ? [] : ['neon' as const]), ...(FEATURES.stamps ? [] : ['stamp' as const])];

/** The tool bar, left to right. Emoji keep the UI picture-only: no reading needed. */
const ALL_TOOLS: { id: Tool; icon: string }[] = [
  { id: 'crayon', icon: '🖍️' },
  { id: 'rainbow', icon: '🌈' },
  { id: 'neon', icon: '💡' },
  { id: 'sparkle', icon: '✨' },
  { id: 'stamp', icon: '⭐' },
  { id: 'fill', icon: '🪣' },
  { id: 'eraser', icon: '🧽' },
];

export const TOOLS = ALL_TOOLS.filter((t) => !HIDDEN_TOOLS.includes(t.id));

export const STAMPS: StampId[] = ['star', 'heart', 'flower', 'bubble'];

/** Brush sizes in screen points: small, medium, big. */
export const SIZES = [8, 16, 30];

export const PAPERS = {
  white: '#FFFFFF',
  night: '#14123A',
};

export const UI = {
  background: '#FFF4D6',
  panel: '#FFFFFF',
  ink: '#3B2E5A',
  accent: '#FF5FB4',
  shadow: '#00000022',
};

export const TITLE_COLORS = ['#FF3B30', '#FF8A00', '#FFD60A', '#27AE60', '#2F6BFF', '#8E5CF6', '#FF5FB4'];
