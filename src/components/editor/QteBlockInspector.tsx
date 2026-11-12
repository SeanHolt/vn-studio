'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';

interface QteBlockInspectorProps {
  block: Extract<SceneBlock, { type: 'QTE_ACTION' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function QteBlockInspector({
  block,
  allScenes,
  onChange,
}: QteBlockInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Action Prompt</span>
        <input
          type="text"
          value={block.promptText}
          onChange={(e) => onChange({ ...block, promptText: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Bar Speed</span>
        <select
          value={block.speed}
          onChange={(e) =>
            onChange({
              ...block,
              speed: e.target.value as 'SLOW' | 'NORMAL' | 'FAST',
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        >
          <option value="SLOW">Slow (Relaxed)</option>
          <option value="NORMAL">Normal (Standard)</option>
          <option value="FAST">Fast (Expert Reflexes)</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <label>
          Zone Start ({block.zoneStart}%)
          <input
            type="range"
            min={10}
            max={70}
            value={block.zoneStart}
            onChange={(e) =>
              onChange({ ...block, zoneStart: Number(e.target.value) })
            }
            className="w-full"
          />
        </label>

        <label>
          Zone Width ({block.zoneWidth}%)
          <input
            type="range"
            min={10}
            max={50}
            value={block.zoneWidth}
            onChange={(e) =>
              onChange({ ...block, zoneWidth: Number(e.target.value) })
            }
            className="w-full"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Success → Jump to Scene
        </span>
        <select
          value={block.successSceneId}
          onChange={(e) =>
            onChange({ ...block, successSceneId: e.target.value })
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

      <label className="flex flex-col gap-1">
        <span className="text-xs text-rose-400">On Miss → Jump to Scene</span>
        <select
          value={block.failSceneId}
          onChange={(e) => onChange({ ...block, failSceneId: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
        >
          {allScenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
