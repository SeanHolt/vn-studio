import { BonusPotionRecipe } from './vn-schema';

export interface CraftingPreset {
  label: string;
  title: string;
  recipePrompt: string;
  hintText: string;
  availableIngredients: string[];
  requiredIngredients: string[];
  craftedItemName: string;
  bonusRecipes: Omit<BonusPotionRecipe, 'id'>[];
}

const INGREDIENT_ICONS: Record<string, string> = {
  moonpetal: '🌸',
  'phoenix ash': '🔥',
  'crystal dew': '💧',
  'shadow root': '🌿',
  'stardust vial': '✨',
  'dragon scale': '🐉',
  'glowing moss': '🍄',
  'sunstone dust': '☀️',
  'plasma core': '⚡',
  'cryo gel': '❄️',
  'copper coil': '🧲',
  'void shard': '🔮',
};

export function getIngredientEmoji(name: string): string {
  const key = name.trim().toLowerCase();
  return INGREDIENT_ICONS[key] ?? '🧪';
}

export function checkRecipeMatch(
  selected: string[],
  required: string[]
): boolean {
  if (selected.length !== required.length) return false;
  const normSelected = selected.map((s) => s.trim().toLowerCase()).sort();
  const normRequired = required.map((r) => r.trim().toLowerCase()).sort();
  return normSelected.every((val, idx) => val === normRequired.at(idx));
}

export const CRAFTING_PRESETS: Record<
  'TRUE_SIGHT' | 'ANTIDOTE' | 'PLASMA_CELL',
  CraftingPreset
> = {
  TRUE_SIGHT: {
    label: '🔮 Elixir of True Sight + 2 Bonus Potions',
    title: 'Arcane Alchemy Cauldron',
    recipePrompt:
      'Mix 2 ingredients to brew the Elixir of True Sight (or discover bonus potions in your Grimoire)!',
    hintText:
      'Main Formula: Pair the flower that blooms at night with the dust of a blazing bird.',
    availableIngredients: [
      'Moonpetal',
      'Phoenix Ash',
      'Crystal Dew',
      'Shadow Root',
      'Glowing Moss',
      'Dragon Scale',
    ],
    requiredIngredients: ['Moonpetal', 'Phoenix Ash'],
    craftedItemName: 'Elixir of True Sight',
    bonusRecipes: [
      {
        potionName: 'Dragonfire Tonic',
        ingredients: ['Dragon Scale', 'Phoenix Ash'],
        clue: 'Combine the scales of a wyrm with blazing ashes.',
      },
      {
        potionName: 'Forest Mist Salve',
        ingredients: ['Crystal Dew', 'Glowing Moss'],
        clue: 'Mix pure morning dew with luminous cavern moss.',
      },
    ],
  },
  ANTIDOTE: {
    label: '🌿 Forest Starlight Antidote + Bonus Tonic',
    title: 'Herbalist Mortar & Cauldron',
    recipePrompt:
      'Combine 3 purifying ingredients to cure the Whispering Curse!',
    hintText:
      'Main Formula: Pure water, forest moss, and stardust neutralize the shadow.',
    availableIngredients: [
      'Crystal Dew',
      'Glowing Moss',
      'Stardust Vial',
      'Shadow Root',
      'Sunstone Dust',
      'Phoenix Ash',
    ],
    requiredIngredients: ['Crystal Dew', 'Glowing Moss', 'Stardust Vial'],
    craftedItemName: 'Starlight Antidote',
    bonusRecipes: [
      {
        potionName: 'Solar Flare Draught',
        ingredients: ['Sunstone Dust', 'Phoenix Ash'],
        clue: 'Two fiery ingredients bottled together.',
      },
    ],
  },
  PLASMA_CELL: {
    label: '⚡ Overcharged Plasma Cell + Bonus Coolant',
    title: 'Molecular Synthesis Bench',
    recipePrompt:
      'Synthesize 2 energy compounds to stabilize a Plasma Cell!',
    hintText:
      'Main Formula: Pair raw plasma energy with cooling cryo gel.',
    availableIngredients: [
      'Plasma Core',
      'Cryo Gel',
      'Copper Coil',
      'Void Shard',
      'Sunstone Dust',
      'Stardust Vial',
    ],
    requiredIngredients: ['Plasma Core', 'Cryo Gel'],
    craftedItemName: 'Overcharged Plasma Cell',
    bonusRecipes: [
      {
        potionName: 'Magnetic Flux Relay',
        ingredients: ['Copper Coil', 'Plasma Core'],
        clue: 'Wrap copper coils around a live plasma core.',
      },
    ],
  },
};
