import { SceneBlock } from './vn-schema';

export interface SceneGenreBadge {
  label: string;
  badgeClass: string;
}

export function detectSceneGenreBadge(
  blocks: SceneBlock[],
  sceneType?: string
): SceneGenreBadge {
  if (blocks.some((b) => b.type === 'BATTLE_ENCOUNTER')) {
    return {
      label: 'BATTLE',
      badgeClass: 'border-rose-500/40 bg-rose-950/70 text-rose-300',
    };
  }
  if (blocks.some((b) => b.type === 'TOPDOWN_ROOM')) {
    return {
      label: 'RPG',
      badgeClass: 'border-emerald-500/40 bg-emerald-950/70 text-emerald-300',
    };
  }
  if (blocks.some((b) => b.type === 'IDLE_TYCOON')) {
    return {
      label: 'IDLE',
      badgeClass: 'border-amber-500/40 bg-amber-950/70 text-amber-300',
    };
  }
  if (blocks.some((b) => b.type === 'CRAFTING_PUZZLE')) {
    return {
      label: 'CRAFT',
      badgeClass: 'border-lime-500/40 bg-lime-950/70 text-lime-300',
    };
  }
  if (blocks.some((b) => b.type === 'CIPHER_PUZZLE')) {
    return {
      label: 'CIPHER',
      badgeClass: 'border-cyan-500/40 bg-cyan-950/70 text-cyan-300',
    };
  }
  if (blocks.some((b) => b.type === 'CARD_DUEL')) {
    return {
      label: 'DUEL',
      badgeClass: 'border-purple-500/40 bg-purple-950/70 text-purple-300',
    };
  }
  if (blocks.some((b) => b.type === 'QUIZ_CHALLENGE')) {
    return {
      label: 'QUIZ',
      badgeClass: 'border-indigo-500/40 bg-indigo-950/70 text-indigo-300',
    };
  }
  if (blocks.some((b) => b.type === 'HOTSPOT_ROOM')) {
    return {
      label: 'ROOM',
      badgeClass: 'border-orange-500/40 bg-orange-950/70 text-orange-300',
    };
  }
  if (
    blocks.some(
      (b) =>
        b.type === 'KEYPAD_PUZZLE' ||
        b.type === 'SLIDING_PUZZLE' ||
        b.type === 'CIRCUIT_PUZZLE' ||
        b.type === 'EVIDENCE_CHECK'
    )
  ) {
    return {
      label: 'PUZZLE',
      badgeClass: 'border-teal-500/40 bg-teal-950/70 text-teal-300',
    };
  }
  if (sceneType === 'ENDING') {
    return {
      label: 'END',
      badgeClass: 'border-fuchsia-500/40 bg-fuchsia-950/70 text-fuchsia-300',
    };
  }
  return {
    label: 'STORY',
    badgeClass: 'border-slate-700 bg-slate-800/80 text-slate-300',
  };
}
