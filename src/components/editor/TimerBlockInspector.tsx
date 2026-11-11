'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';

interface TimerBlockInspectorProps {
  block: Extract<SceneBlock, { type: 'TIMER' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function TimerBlockInspector({
  block,
  allScenes,
  onChange,
}: TimerBlockInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Timer Action</span>
        <select
          value={block.action}
          onChange={(e) =>
            onChange({ ...block, action: e.target.value as 'start' | 'stop' })
          }
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        >
          <option value="start">Start Countdown</option>
          <option value="stop">Stop / Clear Active Timer</option>
        </select>
      </label>

      {block.action === 'start' && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Timer Label</span>
            <input
              type="text"
              value={block.label}
              onChange={(e) => onChange({ ...block, label: e.target.value })}
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Duration (Seconds)</span>
            <input
              type="number"
              min={1}
              max={600}
              value={block.durationSeconds}
              onChange={(e) =>
                onChange({
                  ...block,
                  durationSeconds: Math.max(1, Number(e.target.value)),
                })
              }
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-amber-300"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-rose-400">On Time Out → Jump to Scene</span>
            <select
              value={block.timeoutSceneId}
              onChange={(e) =>
                onChange({ ...block, timeoutSceneId: e.target.value })
              }
              className="rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
            >
              {allScenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </div>
  );
}
