import { CustomDuelCard } from './vn-schema';

export type CardElement = 'BLAZE' | 'TIDE' | 'VINE';
export type DeckThemeId = 'ELEMENTAL' | 'CYBER_HACK' | 'PIRATE_FLEET' | 'CUSTOM';

export interface DuelCard {
  id: string;
  name: string;
  icon: string;
  element: CardElement;
  power: number;
}

export interface DeckConfig {
  label: string;
  cards: DuelCard[];
}

export const DUEL_DECKS: Record<Exclude<DeckThemeId, 'CUSTOM'>, DeckConfig> = {
  ELEMENTAL: {
    label: '🔥 Elemental Sorcery',
    cards: [
      { id: 'el_1', name: 'Phoenix Flare', icon: '🔥', element: 'BLAZE', power: 6 },
      { id: 'el_2', name: 'Tidal Surge', icon: '🌊', element: 'TIDE', power: 6 },
      { id: 'el_3', name: 'Thorn Tempest', icon: '🌿', element: 'VINE', power: 6 },
      { id: 'el_4', name: 'Meteor Spark', icon: '☄️', element: 'BLAZE', power: 4 },
      { id: 'el_5', name: 'Glacier Shield', icon: '❄️', element: 'TIDE', power: 4 },
    ],
  },
  CYBER_HACK: {
    label: '💻 Cyber Netrunner',
    cards: [
      { id: 'cy_1', name: 'Overclock Virus', icon: '⚡', element: 'BLAZE', power: 6 },
      { id: 'cy_2', name: 'Quantum Firewall', icon: '🛡️', element: 'TIDE', power: 6 },
      { id: 'cy_3', name: 'Rootkit Worm', icon: '🦠', element: 'VINE', power: 6 },
      { id: 'cy_4', name: 'Pulse Exploit', icon: '📡', element: 'BLAZE', power: 4 },
      { id: 'cy_5', name: 'Ice Breaker', icon: '🧊', element: 'TIDE', power: 4 },
    ],
  },
  PIRATE_FLEET: {
    label: '🏴‍☠️ Sky Pirate Fleet',
    cards: [
      { id: 'pi_1', name: 'Broadside Cannon', icon: '💣', element: 'BLAZE', power: 6 },
      { id: 'pi_2', name: 'Kraken Whirlpool', icon: '🐙', element: 'TIDE', power: 6 },
      { id: 'pi_3', name: 'Grapple Boarding', icon: '🪝', element: 'VINE', power: 6 },
      { id: 'pi_4', name: 'Flintlock Volley', icon: '🔥', element: 'BLAZE', power: 4 },
      { id: 'pi_5', name: 'Harpoon Net', icon: '🔱', element: 'VINE', power: 4 },
    ],
  },
};

export function resolveDeckCards(
  theme: DeckThemeId,
  customCards?: CustomDuelCard[]
): DuelCard[] {
  if (theme === 'CUSTOM' && customCards && customCards.length >= 3) {
    return customCards;
  }
  const safeTheme = theme === 'CUSTOM' ? 'ELEMENTAL' : theme;
  return DUEL_DECKS[safeTheme].cards;
}

export function evaluateCardClash(
  playerCard: DuelCard,
  enemyCard: DuelCard,
  manaBoostActive: boolean
): {
  outcome: 'WIN' | 'LOSE' | 'TIE';
  playerEffective: number;
  enemyEffective: number;
  reason: string;
} {
  const playerBeatsEnemy =
    (playerCard.element === 'BLAZE' && enemyCard.element === 'VINE') ||
    (playerCard.element === 'VINE' && enemyCard.element === 'TIDE') ||
    (playerCard.element === 'TIDE' && enemyCard.element === 'BLAZE');

  const enemyBeatsPlayer =
    (enemyCard.element === 'BLAZE' && playerCard.element === 'VINE') ||
    (enemyCard.element === 'VINE' && playerCard.element === 'TIDE') ||
    (enemyCard.element === 'TIDE' && playerCard.element === 'BLAZE');

  const bonus = manaBoostActive ? 4 : 0;
  const playerEffective = playerCard.power + (playerBeatsEnemy ? 3 : 0) + bonus;
  const enemyEffective = enemyCard.power + (enemyBeatsPlayer ? 3 : 0);

  if (playerEffective > enemyEffective) {
    const tag = manaBoostActive
      ? '✨ Ultimate Surge (+4)!'
      : playerBeatsEnemy
        ? 'Elemental Advantage (+3)!'
        : 'Higher Power!';
    return { outcome: 'WIN', playerEffective, enemyEffective, reason: tag };
  }
  if (enemyEffective > playerEffective) {
    return {
      outcome: 'LOSE',
      playerEffective,
      enemyEffective,
      reason: enemyBeatsPlayer ? 'Countered by Enemy Element!' : 'Outpowered!',
    };
  }
  return {
    outcome: 'TIE',
    playerEffective,
    enemyEffective,
    reason: 'Equal Clash — Draw!',
  };
}
