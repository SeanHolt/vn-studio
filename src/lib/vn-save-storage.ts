import { GameVariables } from './vn-engine';
import { GameClockState } from './vn-clock';
import { BacklogEntry } from '@/components/player/DialogueBacklogModal';
import { CharacterEmotion, StageAnimation } from './vn-schema';

export interface SavedCharacterState {
  name: string;
  spriteUrl: string;
  position: 'left' | 'center' | 'right';
  emotion: CharacterEmotion;
  animation: StageAnimation;
}

export interface SaveSlotSnapshot {
  slotId: string;
  slotLabel: string;
  savedAt: string;
  sceneId: string;
  sceneName: string;
  blockIndex: number;
  variables: GameVariables;
  inventory: string[];
  affinity: Record<string, number>;
  clock: GameClockState;
  backgroundUrl: string;
  characters: Record<string, SavedCharacterState>;
  backlog: BacklogEntry[];
}

export type SaveSlotsMap = Record<string, SaveSlotSnapshot>;

const EMPTY_SLOTS: SaveSlotsMap = {};
let cachedKey = '';
let cachedRaw: string | null = null;
let cachedParsed: SaveSlotsMap = EMPTY_SLOTS;

const listeners = new Set<() => void>();

function emitSaveChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeSaves(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('vn_saves_')) {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function getSaveSlotsSnapshot(storageKey: string): SaveSlotsMap {
  if (typeof window === 'undefined') return EMPTY_SLOTS;
  const raw = window.localStorage.getItem(storageKey);
  if (storageKey === cachedKey && raw === cachedRaw) {
    return cachedParsed;
  }

  cachedKey = storageKey;
  cachedRaw = raw;

  if (!raw) {
    cachedParsed = EMPTY_SLOTS;
    return cachedParsed;
  }

  try {
    const parsed = JSON.parse(raw) as SaveSlotsMap;
    cachedParsed = parsed && typeof parsed === 'object' ? parsed : EMPTY_SLOTS;
  } catch {
    cachedParsed = EMPTY_SLOTS;
  }
  return cachedParsed;
}

export function getServerSaveSlotsSnapshot(): SaveSlotsMap {
  return EMPTY_SLOTS;
}

export function writeSaveSlot(
  storageKey: string,
  snapshot: SaveSlotSnapshot
): void {
  if (typeof window === 'undefined') return;
  const current = getSaveSlotsSnapshot(storageKey);
  const next: SaveSlotsMap = {
    ...current,
    [snapshot.slotId]: snapshot,
  };
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  emitSaveChange();
}

export function deleteSaveSlot(storageKey: string, slotId: string): void {
  if (typeof window === 'undefined') return;
  const current = getSaveSlotsSnapshot(storageKey);
  const next: SaveSlotsMap = { ...current };
  delete next[slotId];
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  emitSaveChange();
}
