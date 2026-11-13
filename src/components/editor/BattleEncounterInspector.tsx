'use client';

import React from 'react';
import {
  SceneBlock,
  BattleElement,
  BattleWaveEnemy,
} from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import AssetPicker from './AssetPicker';
import { Plus, Trash2 } from 'lucide-react';

interface BattleInspectorProps {
  block: Extract<SceneBlock, { type: 'BATTLE_ENCOUNTER' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function BattleInspector({
  block,
  allScenes,
  onChange,
}: BattleInspectorProps) {
  const extraWaves = block.extraWaves ?? [];

  const handleAddWave = () => {
    const newEnemy: BattleWaveEnemy = {
      id: `wv_${crypto.randomUUID()}`,
      name: `Forest Slime #${extraWaves.length + 1}`,
      spriteUrl: 'css:char-slime',
      maxHp: 24,
      attack: 5,
      weakness: 'FIRE',
    };
    onChange({ ...block, extraWaves: [...extraWaves, newEnemy] });
  };

  const updateWave = (id: string, patch: Partial<BattleWaveEnemy>) => {
    onChange({
      ...block,
      extraWaves: extraWaves.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <AssetPicker
        category="BACKGROUND"
        currentUrl={block.backgroundUrl}
        onSelectUrl={(url) => onChange({ ...block, backgroundUrl: url })}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rose-400">Final Boss Name</span>
          <input
            type="text"
            value={block.enemyName}
            onChange={(e) => onChange({ ...block, enemyName: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-amber-400">Boss Weakness</span>
          <select
            value={block.enemyWeakness ?? 'NEUTRAL'}
            onChange={(e) =>
              onChange({
                ...block,
                enemyWeakness: e.target.value as BattleElement,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-amber-200"
          >
            <option value="NEUTRAL">None (Neutral)</option>
            <option value="FIRE">🔥 Weak to Fire</option>
            <option value="ICE">❄️ Weak to Ice</option>
            <option value="LIGHTNING">⚡ Weak to Lightning</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Boss Max HP</span>
          <input
            type="number"
            min={5}
            value={block.enemyMaxHp}
            onChange={(e) =>
              onChange({ ...block, enemyMaxHp: Number(e.target.value) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-rose-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Boss Attack</span>
          <input
            type="number"
            min={1}
            value={block.enemyAttack}
            onChange={(e) =>
              onChange({ ...block, enemyAttack: Number(e.target.value) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-rose-300"
          />
        </label>
      </div>

      <AssetPicker
        category="CHARACTER"
        currentUrl={block.enemySpriteUrl}
        onSelectUrl={(url) => onChange({ ...block, enemySpriteUrl: url })}
      />
      <div className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Pre-Boss Waves ({extraWaves.length})
          </span>
          <button
            type="button"
            onClick={handleAddWave}
            className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="h-3 w-3" /> Add Minion
          </button>
        </div>

        {extraWaves.map((wave, idx) => (
          <div
            key={wave.id}
            className="flex flex-col gap-1.5 rounded border border-slate-800 bg-slate-900 p-2 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-500">
                W{idx + 1}
              </span>
              <input
                type="text"
                value={wave.name}
                onChange={(e) => updateWave(wave.id, { name: e.target.value })}
                className="flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-white"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...block,
                    extraWaves: extraWaves.filter((w) => w.id !== wave.id),
                  })
                }
                className="text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <input
                type="number"
                min={5}
                title="Wave HP"
                value={wave.maxHp}
                onChange={(e) =>
                  updateWave(wave.id, { maxHp: Number(e.target.value) })
                }
                className="rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-rose-300"
              />
              <input
                type="number"
                min={1}
                title="Wave ATK"
                value={wave.attack}
                onChange={(e) =>
                  updateWave(wave.id, { attack: Number(e.target.value) })
                }
                className="rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-amber-300"
              />
              <select
                value={wave.weakness}
                onChange={(e) =>
                  updateWave(wave.id, {
                    weakness: e.target.value as BattleElement,
                  })
                }
                className="rounded border border-slate-700 bg-slate-950 px-1 py-1 text-slate-200"
              >
                <option value="NEUTRAL">Neutral</option>
                <option value="FIRE">Fire</option>
                <option value="ICE">Ice</option>
                <option value="LIGHTNING">Lightning</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-emerald-400">Hero Max HP</span>
          <input
            type="number"
            min={10}
            value={block.playerMaxHp}
            onChange={(e) =>
              onChange({ ...block, playerMaxHp: Number(e.target.value) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-emerald-400">Hero Attack</span>
          <input
            type="number"
            min={1}
            value={block.playerAttack}
            onChange={(e) =>
              onChange({ ...block, playerAttack: Number(e.target.value) })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-300"
          />
        </label>

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
          <span className="text-xs text-slate-400">Skill Element</span>
          <select
            value={block.skillElement ?? 'FIRE'}
            onChange={(e) =>
              onChange({
                ...block,
                skillElement: e.target.value as BattleElement,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="NEUTRAL">⚔️ Neutral</option>
            <option value="FIRE">🔥 Fire</option>
            <option value="ICE">❄️ Ice</option>
            <option value="LIGHTNING">⚡ Lightning</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Skill Status Effect</span>
          <select
            value={block.skillStatusEffect ?? 'BURN'}
            onChange={(e) =>
              onChange({
                ...block,
                skillStatusEffect: e.target.value as
                  | 'NONE'
                  | 'BURN'
                  | 'FREEZE',
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-amber-200"
          >
            <option value="NONE">None</option>
            <option value="BURN">🔥 Burn (Damage Over Time)</option>
            <option value="FREEZE">❄️ Freeze (Skips Enemy Turn)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Heal Item Name</span>
          <input
            type="text"
            value={block.healItemName}
            onChange={(e) =>
              onChange({ ...block, healItemName: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-amber-300"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Victory → Jump to Scene
        </span>
        <select
          value={block.victorySceneId}
          onChange={(e) =>
            onChange({ ...block, victorySceneId: e.target.value })
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
        <span className="text-xs text-rose-400">
          On Defeat → Jump to Scene
        </span>
        <select
          value={block.defeatSceneId ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              defeatSceneId: e.target.value || undefined,
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
    </div>
  );
}
