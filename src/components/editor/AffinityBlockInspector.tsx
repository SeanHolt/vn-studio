'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';

interface AffinityBlockInspectorProps {
  block: Extract<SceneBlock, { type: 'AFFINITY' }>;
  onChange: (updated: SceneBlock) => void;
}

export default function AffinityBlockInspector({
  block,
  onChange,
}: AffinityBlockInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Character Name</span>
        <input
          type="text"
          placeholder="e.g., Keeper Clara"
          value={block.characterName}
          onChange={(e) => onChange({ ...block, characterName: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Affinity Change (+ or -)</span>
        <div className="flex items-center gap-1.5">
          {[-2, -1, 1, 2, 5].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ ...block, delta: preset })}
              className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                block.delta === preset
                  ? 'border-pink-400 bg-pink-950/60 text-pink-200'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              {preset > 0 ? `+${preset}` : preset}
            </button>
          ))}
          <input
            type="number"
            value={block.delta}
            onChange={(e) => onChange({ ...block, delta: Number(e.target.value) })}
            className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-right text-xs text-white"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Toast Note (Optional)</span>
        <input
          type="text"
          placeholder="e.g., Trusted you with the key"
          value={block.reason ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              reason: e.target.value || undefined,
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        />
      </label>
    </div>
  );
}
