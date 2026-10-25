import type { Action } from './types';

/**
 * Undo history. Clearing the page is undoable too: a toddler
 * tapping the trash can by accident shouldn't lose their art.
 */
export type History = { actions: Action[]; cleared: Action[] | null };

export const emptyHistory: History = { actions: [], cleared: null };

export function add(h: History, action: Action): History {
  // Tapping the same spot with the same color again changes nothing on screen,
  // so it shouldn't need an extra undo either.
  const last = h.actions[h.actions.length - 1];
  if (action.kind === 'fill' && last?.kind === 'fill' && last.region === action.region && last.color === action.color) {
    return h;
  }
  return { actions: [...h.actions, action], cleared: null };
}

export function undo(h: History): History {
  if (h.actions.length > 0) return { ...h, actions: h.actions.slice(0, -1) };
  if (h.cleared) return { actions: h.cleared, cleared: null };
  return h;
}

export function clear(h: History): History {
  if (h.actions.length === 0) return h;
  return { actions: [], cleared: h.actions };
}

export const canUndo = (h: History) => h.actions.length > 0 || h.cleared !== null;
