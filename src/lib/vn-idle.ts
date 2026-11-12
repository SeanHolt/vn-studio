import { IdleUpgrade } from './vn-schema';

export type IdlePresetId = 'SPACE_MINING' | 'ARCANE_MANA' | 'GALACTIC_BAKERY';

const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];

export function formatIdleNumber(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0';
  if (value < 1000) {
    return Math.floor(value).toLocaleString();
  }

  const tier = Math.min(
    NUMBER_SUFFIXES.length - 1,
    Math.floor(Math.log10(value) / 3)
  );
  const scaled = value / Math.pow(1000, tier);
  const suffix = NUMBER_SUFFIXES[tier] ?? '';
  return `${scaled.toFixed(2)}${suffix}`;
}

export function getSingleUpgradeCost(
  upgrade: IdleUpgrade,
  ownedCount: number
): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, ownedCount)
  );
}

export function computeBulkPurchase(
  upgrade: IdleUpgrade,
  ownedCount: number,
  currentCurrency: number,
  mode: 1 | 10 | 'MAX'
): { quantity: number; totalCost: number } {
  const r = upgrade.costMultiplier;
  const firstPrice = upgrade.baseCost * Math.pow(r, ownedCount);

  if (mode === 1) {
    const cost = Math.floor(firstPrice);
    return { quantity: 1, totalCost: cost };
  }

  if (mode === 10) {
    const total = Math.floor((firstPrice * (Math.pow(r, 10) - 1)) / (r - 1));
    return { quantity: 10, totalCost: total };
  }

  if (currentCurrency < Math.floor(firstPrice)) {
    return { quantity: 1, totalCost: Math.floor(firstPrice) };
  }

  const maxExact = Math.floor(
    Math.log((currentCurrency * (r - 1)) / firstPrice + 1) / Math.log(r)
  );
  const safeQty = Math.max(1, maxExact);
  const totalCost = Math.floor(
    (firstPrice * (Math.pow(r, safeQty) - 1)) / (r - 1)
  );

  return { quantity: safeQty, totalCost };
}

interface PresetBundle {
  label: string;
  title: string;
  currencyName: string;
  clickerLabel: string;
  clickerIcon: string;
  goalAmount: number;
  variableKey: string;
  tiers: Omit<IdleUpgrade, 'id'>[];
}

export const IDLE_PRESETS: Record<IdlePresetId, PresetBundle> = {
  SPACE_MINING: {
    label: '🚀 Space Mining Empire (10 Tiers)',
    title: 'Asteroid Belt Refinery',
    currencyName: 'Star Credits',
    clickerLabel: 'Extract Ore',
    clickerIcon: '💎',
    goalAmount: 10000,
    variableKey: 'credits',
    tiers: [
      { name: 'Laser Pickaxe', icon: '⛏️', kind: 'CLICK_POWER', baseCost: 15, costMultiplier: 1.18, power: 1 },
      { name: 'Mining Drone', icon: '🤖', kind: 'AUTO_CPS', baseCost: 25, costMultiplier: 1.15, power: 2 },
      { name: 'Plasma Rig', icon: '⚡', kind: 'AUTO_CPS', baseCost: 150, costMultiplier: 1.15, power: 12 },
      { name: 'Quantum Core', icon: '🔮', kind: 'CLICK_POWER', baseCost: 500, costMultiplier: 1.2, power: 25 },
      { name: 'Orbital Smelter', icon: '🛰️', kind: 'AUTO_CPS', baseCost: 1200, costMultiplier: 1.15, power: 95 },
      { name: 'Moon Outpost', icon: '🌔', kind: 'AUTO_CPS', baseCost: 8500, costMultiplier: 1.15, power: 620 },
      { name: 'Warp Harvester', icon: '🛸', kind: 'AUTO_CPS', baseCost: 55000, costMultiplier: 1.15, power: 4100 },
      { name: 'Solar Collector', icon: '☀️', kind: 'AUTO_CPS', baseCost: 380000, costMultiplier: 1.15, power: 28000 },
      { name: 'Dyson Swarm', icon: '🌌', kind: 'AUTO_CPS', baseCost: 2500000, costMultiplier: 1.15, power: 195000 },
      { name: 'Singularity Engine', icon: '🕳️', kind: 'AUTO_CPS', baseCost: 20000000, costMultiplier: 1.15, power: 1500000 },
    ],
  },
  ARCANE_MANA: {
    label: '🧙 Arcane Mana Citadel (10 Tiers)',
    title: 'Grand Tower of Alchemy',
    currencyName: 'Mana',
    clickerLabel: 'Channel Mana',
    clickerIcon: '✨',
    goalAmount: 10000,
    variableKey: 'mana',
    tiers: [
      { name: 'Enchanted Wand', icon: '🪄', kind: 'CLICK_POWER', baseCost: 15, costMultiplier: 1.18, power: 1 },
      { name: 'Apprentice Scribe', icon: '📜', kind: 'AUTO_CPS', baseCost: 25, costMultiplier: 1.15, power: 2 },
      { name: 'Bubbling Cauldron', icon: '🧪', kind: 'AUTO_CPS', baseCost: 150, costMultiplier: 1.15, power: 12 },
      { name: 'Crystal Staff', icon: '🔮', kind: 'CLICK_POWER', baseCost: 500, costMultiplier: 1.2, power: 25 },
      { name: 'Leyline Obelisk', icon: '🗿', kind: 'AUTO_CPS', baseCost: 1200, costMultiplier: 1.15, power: 95 },
      { name: 'Elemental Golem', icon: '🔥', kind: 'AUTO_CPS', baseCost: 8500, costMultiplier: 1.15, power: 620 },
      { name: 'Astral Library', icon: '📚', kind: 'AUTO_CPS', baseCost: 55000, costMultiplier: 1.15, power: 4100 },
      { name: 'Dragon Sanctuary', icon: '🐉', kind: 'AUTO_CPS', baseCost: 380000, costMultiplier: 1.15, power: 28000 },
      { name: 'Celestial Observatory', icon: '🔭', kind: 'AUTO_CPS', baseCost: 2500000, costMultiplier: 1.15, power: 195000 },
      { name: 'Archmage Nexus', icon: '👑', kind: 'AUTO_CPS', baseCost: 20000000, costMultiplier: 1.15, power: 1500000 },
    ],
  },
  GALACTIC_BAKERY: {
    label: '🍪 Galactic Bakery Tycoon (10 Tiers)',
    title: 'Cosmic Cookie Kitchen',
    currencyName: 'Cookies',
    clickerLabel: 'Bake Cookie',
    clickerIcon: '🍪',
    goalAmount: 10000,
    variableKey: 'cookies',
    tiers: [
      { name: 'Golden Spatula', icon: '🥄', kind: 'CLICK_POWER', baseCost: 15, costMultiplier: 1.18, power: 1 },
      { name: 'Helper Grandma', icon: '👵', kind: 'AUTO_CPS', baseCost: 25, costMultiplier: 1.15, power: 2 },
      { name: 'Turbo Oven', icon: '🔥', kind: 'AUTO_CPS', baseCost: 150, costMultiplier: 1.15, power: 12 },
      { name: 'Sugar Mixer', icon: '🥣', kind: 'CLICK_POWER', baseCost: 500, costMultiplier: 1.2, power: 25 },
      { name: 'Cookie Farm', icon: '🌾', kind: 'AUTO_CPS', baseCost: 1200, costMultiplier: 1.15, power: 95 },
      { name: 'Chocolate Mine', icon: '🍫', kind: 'AUTO_CPS', baseCost: 8500, costMultiplier: 1.15, power: 620 },
      { name: 'Pastry Factory', icon: '🏭', kind: 'AUTO_CPS', baseCost: 55000, costMultiplier: 1.15, power: 4100 },
      { name: 'Flavor Portal', icon: '🌀', kind: 'AUTO_CPS', baseCost: 380000, costMultiplier: 1.15, power: 28000 },
      { name: 'Time Oven', icon: '⏳', kind: 'AUTO_CPS', baseCost: 2500000, costMultiplier: 1.15, power: 195000 },
      { name: 'Cookie Planet', icon: '🪐', kind: 'AUTO_CPS', baseCost: 20000000, costMultiplier: 1.15, power: 1500000 },
    ],
  },
};

export function instantiateIdlePreset(presetId: IdlePresetId): {
  title: string;
  currencyName: string;
  clickerLabel: string;
  clickerIcon: string;
  goalAmount: number;
  variableKey: string;
  upgrades: IdleUpgrade[];
} {
  const preset = IDLE_PRESETS[presetId];
  return {
    title: preset.title,
    currencyName: preset.currencyName,
    clickerLabel: preset.clickerLabel,
    clickerIcon: preset.clickerIcon,
    goalAmount: preset.goalAmount,
    variableKey: preset.variableKey,
    upgrades: preset.tiers.map((tier) => ({
      ...tier,
      id: `iu_${crypto.randomUUID()}`,
    })),
  };
}
