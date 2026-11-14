import { GameClockState } from './vn-clock';
import { CharacterEmotion, StageAnimation } from './vn-schema';

export interface StagedCharacterSnapshot {
  name: string;
  spriteUrl: string;
  position: 'left' | 'center' | 'right';
  emotion: CharacterEmotion;
  animation: StageAnimation;
}

export interface SaveSlotData {
  savedAt: string;
  sceneName: string;
  currentSceneId: string;
  blockIndex: number;
  backgroundUrl: string;
  variables: Record<string, string | number | boolean>;
  inventory: string[];
  affinity: Record<string, number>;
  clock: GameClockState;
  characters: Record<string, StagedCharacterSnapshot>;
}

const SLOT_COUNT = 3;

function getSlotStorageKey(projectId: string, index: number): string {
  return `vn_save_${projectId}_slot_${index}`;
}

export function listSaveSlots(projectId: string): (SaveSlotData | null)[] {
  if (typeof window === 'undefined') {
    return Array.from({ length: SLOT_COUNT }, () => null);
  }

  return Array.from({ length: SLOT_COUNT }, (_, idx) => {
    try {
      const raw = window.localStorage.getItem(
        getSlotStorageKey(projectId, idx)
      );
      if (!raw) return null;
      return JSON.parse(raw) as SaveSlotData;
    } catch {
      return null;
    }
  });
}

export function writeSaveSlot(
  projectId: string,
  index: number,
  state: Omit<SaveSlotData, 'savedAt'>
): SaveSlotData {
  const payload: SaveSlotData = {
    ...state,
    savedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        getSlotStorageKey(projectId, index),
        JSON.stringify(payload)
      );
    } catch {
      // Ignore storage quota errors
    }
  }

  return payload;
}

export function deleteSaveSlot(projectId: string, index: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getSlotStorageKey(projectId, index));
}
