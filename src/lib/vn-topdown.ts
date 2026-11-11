import { TopDownEntity } from "./vn-schema";

export type TopDownThemeId = 'GRASSLAND' | 'DUNGEON' | 'CASTLE' | 'SPACE';

export interface TopDownThemeConfig {
  id: TopDownThemeId;
  label: string;
  floorClass: string;
  wallClass: string;
  wallEmoji: string;
}

export const TOPDOWN_THEMES: Record<TopDownThemeId, TopDownThemeConfig> = {
  GRASSLAND: {
    id: 'GRASSLAND',
    label: 'Forest Meadow',
    floorClass: 'bg-emerald-900/80 border-emerald-800/60',
    wallClass: 'bg-emerald-950 border-emerald-700/60',
    wallEmoji: '🌲',
  },
  DUNGEON: {
    id: 'DUNGEON',
    label: 'Stone Dungeon',
    floorClass: 'bg-stone-800 border-stone-700/60',
    wallClass: 'bg-stone-950 border-stone-600/60',
    wallEmoji: '🧱',
  },
  CASTLE: {
    id: 'CASTLE',
    label: 'Royal Hall',
    floorClass: 'bg-indigo-950/90 border-indigo-900/60',
    wallClass: 'bg-slate-950 border-amber-500/40',
    wallEmoji: '🏛️',
  },
  SPACE: {
    id: 'SPACE',
    label: 'Starship Deck',
    floorClass: 'bg-slate-900 border-cyan-900/50',
    wallClass: 'bg-slate-950 border-cyan-500/50',
    wallEmoji: '🛰️',
  },
};

export const MAP_COLS = 12;
export const MAP_ROWS = 8;

export function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}
export interface RenderedTile {
  key: string;
  title?: string;
  className: string;
  symbol: string;
}

export function buildMapTiles(
  mapTheme: TopDownThemeId,
  playerIcon: string,
  posX: number,
  posY: number,
  walls: string[],
  entities: TopDownEntity[],
  openedChestIds: string[]
): RenderedTile[] {
  const theme = TOPDOWN_THEMES[mapTheme] ?? TOPDOWN_THEMES.GRASSLAND;
  const rows = Array.from({ length: MAP_ROWS }, (_, i) => i);
  const cols = Array.from({ length: MAP_COLS }, (_, i) => i);

  return rows.flatMap((y) =>
    cols.map((x) => {
      const key = tileKey(x, y);
      const isWall = walls.includes(key);
      const isPlayer = posX === x && posY === y;
      const entity = entities.find((e) => e.x === x && e.y === y);

      let symbol = '';
      if (isPlayer) {
        symbol = playerIcon;
      } else if (isWall) {
        symbol = theme.wallEmoji;
      } else if (entity) {
        const isOpened =
          entity.kind === 'CHEST' && openedChestIds.includes(entity.id);
        symbol = isOpened ? '📭' : entity.icon;
      }

      return {
        key,
        title: entity?.label,
        className: `flex items-center justify-center border text-xl sm:text-2xl ${
          isWall ? theme.wallClass : theme.floorClass
        }`,
        symbol,
      };
    })
  );
}