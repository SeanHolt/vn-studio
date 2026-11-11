'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';

interface KeypadPuzzleInspectorProps {
  block: Extract<SceneBlock, { type: 'KEYPAD_PUZZLE' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function KeypadPuzzleInspector({
  block,
  allScenes,
  onChange,
}: KeypadPuzzleInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Lock Type</span>
          <select
            value={block.lockMode}
            onChange={(e) =>
              onChange({
                ...block,
                lockMode: e.target.value as 'PIN' | 'PASSWORD',
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="PIN">Numeric PIN Pad</option>
            <option value="PASSWORD">Secret Password</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Secret Code</span>
          <input
            type="text"
            placeholder={block.lockMode === 'PIN' ? 'e.g. 1984' : 'e.g. OPEN'}
            value={block.secretCode}
            onChange={(e) => onChange({ ...block, secretCode: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-emerald-300"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Lock Prompt</span>
        <input
          type="text"
          value={block.promptText}
          onChange={(e) => onChange({ ...block, promptText: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Optional Clue / Hint</span>
        <input
          type="text"
          placeholder="e.g. Check the date on the lighthouse painting"
          value={block.hintText ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              hintText: e.target.value || undefined,
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Max Attempts (0 = Unlimited)
        </span>
        <input
          type="number"
          min={0}
          max={20}
          value={block.maxAttempts}
          onChange={(e) =>
            onChange({
              ...block,
              maxAttempts: Math.max(0, Number(e.target.value)),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Code Unlocked → Jump to Scene
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

      {block.maxAttempts > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rose-400">
            On Out of Attempts → Jump to Scene
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
