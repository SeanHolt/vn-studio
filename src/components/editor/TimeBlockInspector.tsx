'use client';

import React from 'react';
import { SceneBlock, TimeOfDay } from '@/lib/vn-schema';

interface TimeBlockInspectorProps {
  block: Extract<SceneBlock, { type: 'ADVANCE_TIME' }>;
  onChange: (updated: SceneBlock) => void;
}

export default function TimeBlockInspector({
  block,
  onChange,
}: TimeBlockInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Clock Mode</span>
        <select
          value={block.mode}
          onChange={(e) =>
            onChange({
              ...block,
              mode: e.target.value as 'NEXT_SLOT' | 'SET_EXACT',
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        >
          <option value="NEXT_SLOT">Advance to Next Time Slot</option>
          <option value="SET_EXACT">Set Specific Time of Day</option>
        </select>
      </label>

      {block.mode === 'SET_EXACT' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-400">Target Time of Day</span>
          <select
            value={block.targetTime}
            onChange={(e) =>
              onChange({
                ...block,
                targetTime: e.target.value as TimeOfDay,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          >
            <option value="MORNING">Morning 🌅</option>
            <option value="AFTERNOON">Afternoon ☀️</option>
            <option value="EVENING">Evening 🌇</option>
            <option value="NIGHT">Night 🌙</option>
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Extra Days to Add (Optional)</span>
        <input
          type="number"
          min={0}
          max={365}
          value={block.dayDelta}
          onChange={(e) =>
            onChange({
              ...block,
              dayDelta: Math.max(0, Number(e.target.value)),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-amber-300"
        />
      </label>
    </div>
  );
}
