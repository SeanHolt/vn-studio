export type DeckThemeId = 'ELEMENTAL' | 'SCIFI' | 'KNIGHTS';

export interface DuelCard {
  index: number;
  name: string;
  icon: string;
  beatsIndex: number;
  accentClass: string;
}

export const DUEL_DECKS: Record<
  DeckThemeId,
  { label: string; cards: DuelCard[] }
> = {
  ELEMENTAL: {
    label: 'Elemental Magic (Fire / Water / Leaf)',
    cards: [
      {
        index: 0,
        name: 'Blaze Flare',
        icon: '🔥',
        beatsIndex: 2,
        accentClass: 'border-rose-500/60 bg-rose-950/50 text-rose-200',
      },
      {
        index: 1,
        name: 'Tidal Wave',
        icon: '💧',
        beatsIndex: 0,
        accentClass: 'border-sky-500/60 bg-sky-950/50 text-sky-200',
      },
      {
        index: 2,
        name: 'Vine Snare',
        icon: '🌿',
        beatsIndex: 1,
        accentClass: 'border-emerald-500/60 bg-emerald-950/50 text-emerald-200',
      },
    ],
  },
  SCIFI: {
    label: 'Sci-Fi Systems (Laser / Shield / Hack)',
    cards: [
      {
        index: 0,
        name: 'Plasma Laser',
        icon: '⚡',
        beatsIndex: 2,
        accentClass: 'border-amber-500/60 bg-amber-950/50 text-amber-200',
      },
      {
        index: 1,
        name: 'Aegis Shield',
        icon: '🛡️',
        beatsIndex: 0,
        accentClass: 'border-cyan-500/60 bg-cyan-950/50 text-cyan-200',
      },
      {
        index: 2,
        name: 'Cyber Override',
        icon: '👾',
        beatsIndex: 1,
        accentClass: 'border-purple-500/60 bg-purple-950/50 text-purple-200',
      },
    ],
  },
  KNIGHTS: {
    label: 'Royal Arena (Sword / Shield / Bow)',
    cards: [
      {
        index: 0,
        name: 'Heavy Strike',
        icon: '⚔️',
        beatsIndex: 2,
        accentClass: 'border-rose-500/60 bg-rose-950/50 text-rose-200',
      },
      {
        index: 1,
        name: 'Iron Guard',
        icon: '🛡️',
        beatsIndex: 0,
        accentClass: 'border-indigo-500/60 bg-indigo-950/50 text-indigo-200',
      },
      {
        index: 2,
        name: 'Swift Volley',
        icon: '🏹',
        beatsIndex: 1,
        accentClass: 'border-emerald-500/60 bg-emerald-950/50 text-emerald-200',
      },
    ],
  },
};

export function resolveDuelRound(
  playerCard: DuelCard,
  enemyCard: DuelCard
): 'PLAYER' | 'ENEMY' | 'TIE' {
  if (playerCard.index === enemyCard.index) return 'TIE';
  if (playerCard.beatsIndex === enemyCard.index) return 'PLAYER';
  return 'ENEMY';
}
