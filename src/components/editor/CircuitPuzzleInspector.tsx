'use client';

import React from 'react';
import { SceneBlock, CircuitTile } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import {
  CIRCUIT_THEMES,
  CircuitThemeId,
  GridDimension,
  generateSolvableBoard,
} from '@/lib/vn-circuit';
import CircuitTileGraphic from '@/components/shared/CircuitTileGraphic';
import { Shuffle } from 'lucide-react';

interface CircuitPuzzleInspectorProps {
  block: Extract<SceneBlock, { type: 'CIRCUIT_PUZZLE' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

const TILE_CYCLE: CircuitTile['kind'][] = [
  'STRAIGHT',
  'CORNER',
  'TEE',
  'CROSS',
  'BLOCKER',
];

export default function CircuitPuzzleInspector({
  block,
  allScenes,
  onChange,
}: CircuitPuzzleInspectorProps) {
  const themeCfg =
    CIRCUIT_THEMES[block.theme] ?? CIRCUIT_THEMES.SCIFI_CIRCUIT;

  const handleSizeChange = (nextSize: GridDimension) => {
    const safeSource = Math.min(nextSize - 1, block.sourceRow);
    const safeTarget = Math.min(nextSize - 1, block.targetRow);
    onChange({
      ...block,
      gridSize: nextSize,
      sourceRow: safeSource,
      targetRow: safeTarget,
      tiles: generateSolvableBoard(nextSize, safeSource, safeTarget),
    });
  };

  const handleCycleTile = (idx: number) => {
    const current = block.tiles[idx];
    if (!current) return;
    const nextKind =
      TILE_CYCLE[(TILE_CYCLE.indexOf(current.kind) + 1) % TILE_CYCLE.length] ??
      'STRAIGHT';
    const nextTiles = [...block.tiles];
    nextTiles[idx] = { kind: nextKind, rotation: current.rotation };
    onChange({ ...block, tiles: nextTiles });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Puzzle Title</span>
        <input
          type="text"
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Grid Size</span>
          <select
            value={block.gridSize}
            onChange={(e) =>
              handleSizeChange(Number(e.target.value) as GridDimension)
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value={4}>4 × 4 (Quick)</option>
            <option value={5}>5 × 5 (Standard)</option>
            <option value={6}>6 × 6 (Deep)</option>
            <option value={7}>7 × 7 (Master)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Visual Theme</span>
          <select
            value={block.theme}
            onChange={(e) =>
              onChange({
                ...block,
                theme: e.target.value as CircuitThemeId,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            {Object.entries(CIRCUIT_THEMES).map(([id, cfg]) => (
              <option key={id} value={id}>
                {cfg.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">
            Power Start Row (1–{block.gridSize})
          </span>
          <input
            type="number"
            min={1}
            max={block.gridSize}
            value={block.sourceRow + 1}
            onChange={(e) => {
              const row = Math.min(
                block.gridSize - 1,
                Math.max(0, Number(e.target.value) - 1)
              );
              onChange({
                ...block,
                sourceRow: row,
                tiles: generateSolvableBoard(
                  block.gridSize,
                  row,
                  block.targetRow
                ),
              });
            }}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-cyan-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">
            Exit Lock Row (1–{block.gridSize})
          </span>
          <input
            type="number"
            min={1}
            max={block.gridSize}
            value={block.targetRow + 1}
            onChange={(e) => {
              const row = Math.min(
                block.gridSize - 1,
                Math.max(0, Number(e.target.value) - 1)
              );
              onChange({
                ...block,
                targetRow: row,
                tiles: generateSolvableBoard(
                  block.gridSize,
                  block.sourceRow,
                  row
                ),
              });
            }}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-300"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...block,
              tiles: generateSolvableBoard(
                block.gridSize,
                block.sourceRow,
                block.targetRow
              ),
            })
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          <Shuffle className="h-3.5 w-3.5" /> Generate Solvable Board
        </button>

        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Max Moves:</span>
          <input
            type="number"
            min={0}
            max={200}
            value={block.maxMoves}
            onChange={(e) =>
              onChange({
                ...block,
                maxMoves: Math.max(0, Number(e.target.value)),
              })
            }
            className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-amber-300"
          />
        </label>
      </div>

      {/* Interactive Mini Board Customizer */}
      <div>
        <span className="mb-1 block text-[11px] text-slate-400">
          Click any tile below to cycle shape:
        </span>
        <div
          style={{
            gridTemplateColumns: `repeat(${block.gridSize}, minmax(0, 1fr))`,
          }}
          className={`mx-auto grid aspect-square w-48 gap-0.5 rounded-lg border p-1.5 ${themeCfg.boardBg}`}
        >
          {block.tiles.map((tile, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleCycleTile(idx)}
              className={`aspect-square overflow-hidden rounded border ${themeCfg.tileBg}`}
            >
              <CircuitTileGraphic
                tile={tile}
                energized={false}
                activeColor={themeCfg.activeStroke}
                inactiveColor={themeCfg.inactiveStroke}
              />
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Circuit Powered → Jump to Scene
        </span>
        <select
          value={block.unlockSceneId}
          onChange={(e) =>
            onChange({ ...block, unlockSceneId: e.target.value })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
        >
          {allScenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      {block.maxMoves > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rose-400">
            On Out of Moves → Jump to Scene
          </span>
          <select
            value={block.failSceneId ?? ''}
            onChange={(e) =>
              onChange({
                ...block,
                failSceneId: e.target.value || undefined,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">(Continue to next block)</option>
            {allScenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
