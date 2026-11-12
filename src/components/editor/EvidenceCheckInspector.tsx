'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';

interface EvidenceCheckInspectorProps {
  block: Extract<SceneBlock, { type: 'EVIDENCE_CHECK' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function EvidenceCheckInspector({
  block,
  allScenes,
  onChange,
}: EvidenceCheckInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Speaker / Witness</span>
          <input
            type="text"
            value={block.speaker}
            onChange={(e) => onChange({ ...block, speaker: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-amber-400">Required Item Name</span>
          <input
            type="text"
            placeholder="e.g. Brass Key"
            value={block.requiredItem}
            onChange={(e) =>
              onChange({ ...block, requiredItem: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-amber-300"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Witness Testimony Statement
        </span>
        <textarea
          rows={2}
          value={block.statement}
          onChange={(e) => onChange({ ...block, statement: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 p-2 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Reply When Wrong Item Presented
        </span>
        <input
          type="text"
          value={block.wrongItemReply}
          onChange={(e) =>
            onChange({ ...block, wrongItemReply: e.target.value })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Optional Clue Hint</span>
          <input
            type="text"
            placeholder="e.g. Check your key..."
            value={block.hintText ?? ''}
            onChange={(e) =>
              onChange({
                ...block,
                hintText: e.target.value || undefined,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">
            Max Strikes (0 = ∞)
          </span>
          <input
            type="number"
            min={0}
            max={10}
            value={block.maxStrikes}
            onChange={(e) =>
              onChange({
                ...block,
                maxStrikes: Math.max(0, Number(e.target.value)),
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-rose-300"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Contradiction Proven → Jump to Scene
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

      {block.maxStrikes > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rose-400">
            On Out of Strikes → Jump to Scene
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
