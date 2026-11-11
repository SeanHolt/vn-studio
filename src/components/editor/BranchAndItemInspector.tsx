'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { GameVariables } from '@/lib/vn-engine';

interface BranchAndItemInspectorProps {
  block: Extract<SceneBlock, { type: 'INVENTORY' | 'BRANCH' }>;
  allScenes: ScenePayload[];
  variables: GameVariables;
  onChange: (updated: SceneBlock) => void;
}

export default function BranchAndItemInspector({
  block,
  allScenes,
  variables,
  onChange,
}: BranchAndItemInspectorProps) {
  if (block.type === 'INVENTORY') {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-400">Action</span>
          <select
            value={block.action}
            onChange={(e) =>
              onChange({ ...block, action: e.target.value as 'give' | 'remove' })
            }
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          >
            <option value="give">Give Item to Player</option>
            <option value="remove">Remove Item from Player</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-400">Item Name</span>
          <input
            type="text"
            placeholder="e.g., Golden Key"
            value={block.itemName}
            onChange={(e) => onChange({ ...block, itemName: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          />
        </label>
      </div>
    );
  }

  const varKeys = Object.keys(variables);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Condition Type</span>
        <select
          value={block.checkType}
          onChange={(e) =>
            onChange({
              ...block,
              checkType: e.target.value as 'VARIABLE' | 'HAS_ITEM',
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        >
          <option value="HAS_ITEM">Player Has Inventory Item</option>
          <option value="VARIABLE">Check Global Variable</option>
        </select>
      </label>

      {block.checkType === 'HAS_ITEM' ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-400">Required Item Name</span>
          <input
            type="text"
            placeholder="e.g., Golden Key"
            value={block.itemName ?? ''}
            onChange={(e) => onChange({ ...block, itemName: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
          />
        </label>
      ) : (
        <div className="grid grid-cols-12 gap-1.5">
          <select
            value={block.variableKey ?? ''}
            onChange={(e) => onChange({ ...block, variableKey: e.target.value })}
            className="col-span-5 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-white"
          >
            {varKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={block.operator ?? '=='}
            onChange={(e) =>
              onChange({
                ...block,
                operator: e.target.value as '==' | '!=' | '>' | '<' | '>=' | '<=',
              })
            }
            className="col-span-3 rounded border border-slate-700 bg-slate-950 px-1 py-1.5 text-center font-mono text-xs text-amber-300"
          >
            <option value="==">==</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
          </select>
          <input
            type="text"
            value={String(block.value ?? '')}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed =
                raw === 'true' ? true : raw === 'false' ? false : !Number.isNaN(Number(raw)) && raw !== '' ? Number(raw) : raw;
              onChange({ ...block, value: parsed });
            }}
            className="col-span-4 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-400"
          />
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-emerald-400">IF TRUE → Jump to Scene</span>
        <select
          value={block.trueSceneId}
          onChange={(e) => onChange({ ...block, trueSceneId: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
        >
          {allScenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-rose-400">ELSE (FALSE) → Jump to Scene</span>
        <select
          value={block.falseSceneId}
          onChange={(e) => onChange({ ...block, falseSceneId: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white"
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
