'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { GameVariables } from '@/lib/vn-engine';

interface InputBlockInspectorProps {
  block: Extract<SceneBlock, { type: 'INPUT_TEXT' }>;
  variables: GameVariables;
  onChange: (updated: SceneBlock) => void;
}

export default function InputBlockInspector({
  block,
  variables,
  onChange,
}: InputBlockInspectorProps) {
  const varKeys = Object.keys(variables);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Question / Prompt</span>
        <input
          type="text"
          value={block.prompt}
          onChange={(e) => onChange({ ...block, prompt: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Save Answer Into Variable</span>
        <input
          type="text"
          list="vn-var-suggestions"
          value={block.targetVariable}
          onChange={(e) =>
            onChange({
              ...block,
              targetVariable: e.target.value.trim().replace(/\s+/g, '_'),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400"
        />
        <datalist id="vn-var-suggestions">
          {varKeys.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Default Fallback Name</span>
        <input
          type="text"
          value={block.defaultValue}
          onChange={(e) => onChange({ ...block, defaultValue: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        />
      </label>

      <p className="rounded bg-slate-950 p-2 text-[11px] text-slate-400">
        Tip: Use <code className="text-indigo-400">{`{{${block.targetVariable || 'playerName'}}}`}</code> in any Dialogue block to display the player&apos;s answer!
      </p>
    </div>
  );
}
