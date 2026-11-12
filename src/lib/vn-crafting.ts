export interface CraftingPreset {
  label: string;
  title: string;
  recipePrompt: string;
  hintText: string;
  availableIngredients: string[];
  requiredIngredients: string[];
  craftedItemName: string;
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
    label: '🔮 Elixir of True Sight (Fantasy)',
    title: 'Arcane Alchemy Cauldron',
    recipePrompt:
      'Mix 2 glowing ingredients to brew the Elixir of True Sight!',
    hintText:
      'Combine the flower that blooms at night with the dust of a blazing bird.',
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
  },
  ANTIDOTE: {
    label: '🌿 Forest Starlight Antidote (Fantasy)',
    title: 'Herbalist Mortar & Cauldron',
    recipePrompt:
      'Combine 3 purifying ingredients to cure the Whispering Curse!',
    hintText:
      'You need pure water, forest moss, and stardust to neutralize the shadow.',
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
  },
  PLASMA_CELL: {
    label: '⚡ Overcharged Plasma Cell (Sci-Fi)',
    title: 'Molecular Synthesis Bench',
    recipePrompt:
      'Synthesize 2 energy compounds to stabilize a Plasma Cell!',
    hintText:
      'Pair raw plasma energy with cooling cryo gel so it does not overheat.',
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
  },
};
