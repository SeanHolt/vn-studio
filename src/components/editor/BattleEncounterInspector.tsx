'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import AssetPicker from './AssetPicker';

interface BattleEncounterInspectorProps {
  block: Extract<SceneBlock, { type: 'BATTLE_ENCOUNTER' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function BattleEncounterInspector({
  block,
  allScenes,
  onChange,
}: BattleEncounterInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <AssetPicker
        category="BACKGROUND"
        currentUrl={block.backgroundUrl}
        onSelectUrl={(url) => onChange({ ...block, backgroundUrl: url })}
      />

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Enemy Name</span>
        <input
          type="text"
          value={block.enemyName}
          onChange={(e) => onChange({ ...block, enemyName: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <AssetPicker
        category="CHARACTER"
        currentUrl={block.enemySpriteUrl}
        onSelectUrl={(url) => onChange({ ...block, enemySpriteUrl: url })}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Enemy Max HP</span>
          <input
            type="number"
            min={1}
            value={block.enemyMaxHp}
            onChange={(e) =>
              onChange({ ...block, enemyMaxHp: Math.max(1, Number(e.target.value)) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-rose-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Enemy Attack</span>
          <input
            type="number"
            min={1}
            value={block.enemyAttack}
            onChange={(e) =>
              onChange({ ...block, enemyAttack: Math.max(1, Number(e.target.value)) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-rose-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Player Max HP</span>
          <input
            type="number"
            min={1}
            value={block.playerMaxHp}
            onChange={(e) =>
              onChange({ ...block, playerMaxHp: Math.max(1, Number(e.target.value)) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Player Attack</span>
          <input
            type="number"
            min={1}
            value={block.playerAttack}
            onChange={(e) =>
              onChange({ ...block, playerAttack: Math.max(1, Number(e.target.value)) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-300"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Special Skill Name</span>
          <input
            type="text"
            value={block.skillName}
            onChange={(e) => onChange({ ...block, skillName: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-indigo-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Healing Item Name</span>
          <input
            type="text"
            value={block.healItemName}
            onChange={(e) => onChange({ ...block, healItemName: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-amber-300"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">On Victory → Jump to Scene</span>
        <select
          value={block.victorySceneId}
          onChange={(e) => onChange({ ...block, victorySceneId: e.target.value })}
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
        <span className="text-xs text-rose-400">On Defeat → Jump to Scene</span>
        <select
          value={block.defeatSceneId}
          onChange={(e) => onChange({ ...block, defeatSceneId: e.target.value })}
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
