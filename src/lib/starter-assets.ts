export type AssetCategory = 'BACKGROUND' | 'CHARACTER';

export interface StarterAsset {
  id: string;
  label: string;
  category: AssetCategory;
  url: string;
}

export const STARTER_ASSETS: StarterAsset[] = [
  {
    id: 'bg-starry-night',
    label: 'Starry Night',
    category: 'BACKGROUND',
    url: 'css:starry-night',
  },
  {
    id: 'bg-sunset-coast',
    label: 'Sunset Coast',
    category: 'BACKGROUND',
    url: 'css:sunset-coast',
  },
  {
    id: 'bg-emerald-woods',
    label: 'Emerald Woods',
    category: 'BACKGROUND',
    url: 'css:emerald-woods',
  },
  {
    id: 'bg-cyber-grid',
    label: 'Neon Cyber Grid',
    category: 'BACKGROUND',
    url: 'css:cyber-grid',
  },
  {
    id: 'bg-starship-bridge',
    label: 'Starship Deck',
    category: 'BACKGROUND',
    url: 'css:starship-bridge',
  },
  {
    id: 'bg-volcano-forge',
    label: 'Magma Cavern',
    category: 'BACKGROUND',
    url: 'css:volcano-forge',
  },
  {
    id: 'bg-crystal-cove',
    label: 'Crystal Lagoon',
    category: 'BACKGROUND',
    url: 'css:crystal-cove',
  },
  {
    id: 'bg-royal-throne',
    label: 'Royal Hall',
    category: 'BACKGROUND',
    url: 'css:royal-throne',
  },
  {
    id: 'bg-stormy-moor',
    label: 'Stormy Moor',
    category: 'BACKGROUND',
    url: 'css:stormy-moor',
  },
  {
    id: 'bg-alchemy-lab',
    label: 'Potion Study',
    category: 'BACKGROUND',
    url: 'css:alchemy-lab',
  },
  {
    id: 'char-explorer',
    label: 'Explorer',
    category: 'CHARACTER',
    url: 'css:char-explorer',
  },
  {
    id: 'char-keeper',
    label: 'Mystic Keeper',
    category: 'CHARACTER',
    url: 'css:char-keeper',
  },
  {
    id: 'char-cyborg',
    label: 'Cyber Android',
    category: 'CHARACTER',
    url: 'css:char-cyborg',
  },
  {
    id: 'char-knight',
    label: 'Solar Knight',
    category: 'CHARACTER',
    url: 'css:char-knight',
  },
  {
    id: 'char-shadow',
    label: 'Shadow Wraith',
    category: 'CHARACTER',
    url: 'css:char-shadow',
  },
  {
    id: 'char-alchemist',
    label: 'Alchemist',
    category: 'CHARACTER',
    url: 'css:char-alchemist',
  },
  {
    id: 'char-captain',
    label: 'Star Captain',
    category: 'CHARACTER',
    url: 'css:char-captain',
  },
  {
    id: 'char-slime',
    label: 'Forest Slime',
    category: 'CHARACTER',
    url: 'css:char-slime',
  },
];
