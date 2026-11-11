function svgToDataUri(svg: string): string {
  const cleaned = svg.trim().replace(/\s+/g, ' ');
  const encoded = encodeURIComponent(cleaned)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}


export interface StarterAsset {
  id: string;
  label: string;
  category: 'BACKGROUND' | 'CHARACTER';
  url: string;
}

export const STARTER_ASSETS: StarterAsset[] = [
  {
    id: 'bg_night_sky',
    label: 'Starry Night',
    category: 'BACKGROUND',
    url: '/assets/bg-night-sky.svg',
  },
  {
    id: 'bg_sunset_bay',
    label: 'Sunset Coast',
    category: 'BACKGROUND',
    url: '/assets/bg-sunset-bay.svg',
  },
  {
    id: 'bg_forest_mist',
    label: 'Emerald Woods',
    category: 'BACKGROUND',
    url: '/assets/bg-forest-mist.svg',
  },
  {
    id: 'char_hero_blue',
    label: 'Explorer (Blue)',
    category: 'CHARACTER',
    url: '/assets/char-hero-blue.svg',
  },
  {
    id: 'char_mage_violet',
    label: 'Keeper (Violet)',
    category: 'CHARACTER',
    url: '/assets/char-mage-violet.svg',
  },
];

