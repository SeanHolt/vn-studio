'use client';

import React, { useState } from 'react';
import { SceneBlock, TopDownEntity } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import {
  TOPDOWN_THEMES,
  TopDownThemeId,
  MAP_COLS,
  MAP_ROWS,
  tileKey,
} from '@/lib/vn-topdown';
import { Trash2 } from 'lucide-react';

interface TopDownRoomInspectorProps {
  block: Extract<SceneBlock, { type: 'TOPDOWN_ROOM' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

type BrushTool = 'WALL' | 'SPAWN' | 'NPC' | 'CHEST' | 'DOOR' | 'ERASE';

export default function TopDownRoomInspector({
  block,
  allScenes,
  onChange,
}: TopDownRoomInspectorProps) {
  const [brush, setBrush] = useState<BrushTool>('WALL');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    block.entities.at(0)?.id ?? null
  );

  const theme = TOPDOWN_THEMES[block.mapTheme] ?? TOPDOWN_THEMES.GRASSLAND;
  const selectedEntity = block.entities.find((e) => e.id === selectedEntityId);

  const handleTileClick = (x: number, y: number) => {
    const key = tileKey(x, y);

    if (brush === 'ERASE') {
      onChange({
        ...block,
        walls: block.walls.filter((w) => w !== key),
        entities: block.entities.filter((e) => !(e.x === x && e.y === y)),
      });
      return;
    }

    if (brush === 'WALL') {
      const exists = block.walls.includes(key);
      onChange({
        ...block,
        walls: exists
          ? block.walls.filter((w) => w !== key)
          : [...block.walls, key],
        entities: block.entities.filter((e) => !(e.x === x && e.y === y)),
      });
      return;
    }

    if (brush === 'SPAWN') {
      onChange({
        ...block,
        spawnX: x,
        spawnY: y,
        walls: block.walls.filter((w) => w !== key),
      });
      return;
    }

    const iconMap: Record<'NPC' | 'CHEST' | 'DOOR', string> = {
      NPC: '🧙',
      CHEST: '🧰',
      DOOR: '🚪',
    };

    const newEntity: TopDownEntity = {
      id: `td_${crypto.randomUUID()}`,
      label: `${brush} ${block.entities.length + 1}`,
      kind: brush,
      icon: iconMap[brush],
      x,
      y,
      dialogueText: brush === 'NPC' ? 'Hello, adventurer!' : undefined,
      itemName: brush === 'CHEST' ? 'Golden Key' : undefined,
      targetSceneId: brush === 'DOOR' ? allScenes.at(0)?.id ?? '' : undefined,
    };

    onChange({
      ...block,
      walls: block.walls.filter((w) => w !== key),
      entities: [
        ...block.entities.filter((e) => !(e.x === x && e.y === y)),
        newEntity,
      ],
    });
    setSelectedEntityId(newEntity.id);
  };

  const updateEntity = (id: string, patch: Partial<TopDownEntity>) => {
    onChange({
      ...block,
      entities: block.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Map Theme</span>
          <select
            value={block.mapTheme}
            onChange={(e) =>
              onChange({
                ...block,
                mapTheme: e.target.value as TopDownThemeId,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            {Object.values(TOPDOWN_THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Player Avatar</span>
          <select
            value={block.playerIcon}
            onChange={(e) => onChange({ ...block, playerIcon: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="🧑">Explorer 🧑</option>
            <option value="🧝">Elf Ranger 🧝</option>
            <option value="🤖">Bot Unit 🤖</option>
            <option value="🐱">Cat Hero 🐱</option>
          </select>
        </label>
      </div>

      {/* Tile Painter Brush Selector */}
      <div className="flex flex-wrap gap-1">
        {(
          [
            { id: 'WALL', label: `${theme.wallEmoji} Wall` },
            { id: 'SPAWN', label: '🚩 Spawn' },
            { id: 'NPC', label: '🧙 NPC' },
            { id: 'CHEST', label: '🧰 Chest' },
            { id: 'DOOR', label: '🚪 Door' },
            { id: 'ERASE', label: '🧹 Erase' },
          ] as const
        ).map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setBrush(tool.id)}
            className={`rounded px-2 py-1 text-[11px] font-semibold ${
              brush === tool.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Clickable 12x8 Mini Tile Map */}
      <div
        style={{
          gridTemplateColumns: `repeat(${MAP_COLS}, minmax(0, 1fr))`,
        }}
        className="grid aspect-video w-full overflow-hidden rounded border border-slate-700"
      >
        {Array.from({ length: MAP_ROWS }).map((_, y) =>
          Array.from({ length: MAP_COLS }).map((__, x) => {
            const key = tileKey(x, y);
            const isWall = block.walls.includes(key);
            const isSpawn = block.spawnX === x && block.spawnY === y;
            const entity = block.entities.find((e) => e.x === x && e.y === y);

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (entity && brush !== 'ERASE' && brush !== 'WALL') {
                    setSelectedEntityId(entity.id);
                  } else {
                    handleTileClick(x, y);
                  }
                }}
                className={`flex items-center justify-center border text-xs ${
                  isWall ? theme.wallClass : theme.floorClass
                } ${
                  entity && entity.id === selectedEntityId
                    ? 'ring-2 ring-amber-400'
                    : ''
                }`}
              >
                {isWall
                  ? theme.wallEmoji
                  : entity
                    ? entity.icon
                    : isSpawn
                      ? block.playerIcon
                      : ''}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Entity Settings */}
      {selectedEntity && (
        <div className="flex flex-col gap-2 rounded-lg border border-indigo-500/30 bg-slate-950 p-2.5">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={selectedEntity.label}
              onChange={(e) =>
                updateEntity(selectedEntity.id, { label: e.target.value })
              }
              className="w-40 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...block,
                  entities: block.entities.filter(
                    (e) => e.id !== selectedEntity.id
                  ),
                })
              }
              className="text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {selectedEntity.kind === 'CHEST' && (
            <input
              type="text"
              placeholder="Item inside chest (e.g., Golden Key)"
              value={selectedEntity.itemName ?? ''}
              onChange={(e) =>
                updateEntity(selectedEntity.id, { itemName: e.target.value })
              }
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-amber-300"
            />
          )}

          {(selectedEntity.kind === 'NPC' || selectedEntity.kind === 'DOOR') && (
            <select
              value={selectedEntity.targetSceneId ?? ''}
              onChange={(e) =>
                updateEntity(selectedEntity.id, {
                  targetSceneId: e.target.value || undefined,
                })
              }
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
            >
              <option value="">(No Scene Jump — Pop-up Text Only)</option>
              {allScenes.map((s) => (
                <option key={s.id} value={s.id}>
                  Trigger Scene: {s.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Pop-up dialogue / message..."
            value={selectedEntity.dialogueText ?? ''}
            onChange={(e) =>
              updateEntity(selectedEntity.id, { dialogueText: e.target.value })
            }
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
          />

          <input
            type="text"
            placeholder="Optional Required Item to unlock..."
            value={selectedEntity.requiredItem ?? ''}
            onChange={(e) =>
              updateEntity(selectedEntity.id, {
                requiredItem: e.target.value.trim() || undefined,
              })
            }
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-300"
          />
        </div>
      )}
    </div>
  );
}
