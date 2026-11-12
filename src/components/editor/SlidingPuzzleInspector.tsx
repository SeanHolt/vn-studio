'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { SlidingGridSize, RuneThemeId } from '@/lib/vn-sliding-puzzle';
import AssetPicker from './AssetPicker';

interface SlidingPuzzleInspectorProps {
  block: Extract<SceneBlock, { type: 'SLIDING_PUZZLE' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function SlidingPuzzleInspector({
  block,
  allScenes,
  onChange,
}: SlidingPuzzleInspectorProps) {
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
          <span className="text-xs text-slate-400">Puzzle Style</span>
          <select
            value={block.puzzleMode}
            onChange={(e) =>
              onChange({
                ...block,
                puzzleMode: e.target.value as 'IMAGE' | 'RUNES',
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="IMAGE">Image Slice Puzzle</option>
            <option value="RUNES">Rune / Number Tiles</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Grid Size</span>
          <select
            value={block.gridSize}
            onChange={(e) =>
              onChange({
                ...block,
                gridSize: Number(e.target.value) as SlidingGridSize,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value={3}>3 × 3 (8 Tiles)</option>
            <option value={4}>4 × 4 (15 Tiles)</option>
            <option value={5}>5 × 5 (24 Tiles)</option>
          </select>
        </label>
      </div>

      {block.puzzleMode === 'IMAGE' ? (
        <AssetPicker
          category="BACKGROUND"
          currentUrl={block.imageUrl}
          onSelectUrl={(url) => onChange({ ...block, imageUrl: url })}
        />
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Rune Symbol Theme</span>
          <select
            value={block.runeTheme}
            onChange={(e) =>
              onChange({
                ...block,
                runeTheme: e.target.value as RuneThemeId,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-purple-300"
          >
            <option value="ARCANE">Elder Arcane Runes (ᚠ ᚢ ᚦ)</option>
            <option value="NUMBERS">Classic Numbers (1 – 24)</option>
            <option value="CYBER">Hexadecimal Cyber Glyphs (01 – 18)</option>
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Max Slides Allowed (0 = Unlimited)
        </span>
        <input
          type="number"
          min={0}
          max={500}
          value={block.maxMoves}
          onChange={(e) =>
            onChange({
              ...block,
              maxMoves: Math.max(0, Number(e.target.value)),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Puzzle Solved → Jump to Scene
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
