'use client';

import React from 'react';
import { SceneBlock, IdleUpgrade } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import {
  IDLE_PRESETS,
  IdlePresetId,
  instantiateIdlePreset,
} from '@/lib/vn-idle';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface IdleTycoonInspectorProps {
  block: Extract<SceneBlock, { type: 'IDLE_TYCOON' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function IdleTycoonInspector({
  block,
  allScenes,
  onChange,
}: IdleTycoonInspectorProps) {
  const handleLoadPreset = (presetId: IdlePresetId) => {
    const data = instantiateIdlePreset(presetId);
    onChange({
      ...block,
      ...data,
    });
  };

  const handleAddTier = () => {
    const last = block.upgrades.at(-1);
    const nextCost = last ? Math.round(last.baseCost * 5) : 50;
    const nextPower = last ? Math.round(last.power * 4) : 5;
    const newTier: IdleUpgrade = {
      id: `iu_${crypto.randomUUID()}`,
      name: `Generator Tier ${block.upgrades.length + 1}`,
      icon: '⚙️',
      kind: 'AUTO_CPS',
      baseCost: nextCost,
      costMultiplier: 1.15,
      power: nextPower,
    };
    onChange({ ...block, upgrades: [...block.upgrades, newTier] });
  };

  const updateTier = (id: string, patch: Partial<IdleUpgrade>) => {
    onChange({
      ...block,
      upgrades: block.upgrades.map((u) =>
        u.id === id ? { ...u, ...patch } : u
      ),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* One-Click 10-Tier Presets */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
          <Sparkles className="h-3 w-3" /> Load 10-Tier Preset Pack:
        </span>
        <div className="flex flex-col gap-1">
          {Object.entries(IDLE_PRESETS).map(([id, cfg]) => (
            <button
              key={id}
              type="button"
              onClick={() => handleLoadPreset(id as IdlePresetId)}
              className="rounded bg-slate-900 px-2.5 py-1.5 text-left text-[11px] text-slate-200 hover:bg-amber-600 hover:text-white"
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Stage Title</span>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Currency Name</span>
          <input
            type="text"
            value={block.currencyName}
            onChange={(e) =>
              onChange({ ...block, currencyName: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-amber-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Clicker Button Text</span>
          <input
            type="text"
            value={block.clickerLabel}
            onChange={(e) =>
              onChange({ ...block, clickerLabel: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Clicker Emoji</span>
          <input
            type="text"
            value={block.clickerIcon}
            onChange={(e) =>
              onChange({ ...block, clickerIcon: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">
            Goal Amount (0 = Endless)
          </span>
          <input
            type="number"
            min={0}
            value={block.goalAmount}
            onChange={(e) =>
              onChange({
                ...block,
                goalAmount: Math.max(0, Number(e.target.value)),
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-emerald-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Sync Variable Key</span>
          <input
            type="text"
            value={block.variableKey}
            onChange={(e) =>
              onChange({ ...block, variableKey: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-indigo-300"
          />
        </label>
      </div>

      {/* Unlimited Upgrades List */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-slate-300">
          Upgrade Tiers ({block.upgrades.length})
        </span>
        <button
          type="button"
          onClick={handleAddTier}
          className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
        >
          <Plus className="h-3 w-3" /> Add Tier
        </button>
      </div>

      <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
        {block.upgrades.map((tier, idx) => (
          <div
            key={tier.id}
            className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-500">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={tier.icon}
                onChange={(e) => updateTier(tier.id, { icon: e.target.value })}
                className="w-8 rounded border border-slate-800 bg-slate-900 py-0.5 text-center text-xs"
              />
              <input
                type="text"
                value={tier.name}
                onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-white"
              />
              {block.upgrades.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...block,
                      upgrades: block.upgrades.filter((u) => u.id !== tier.id),
                    })
                  }
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <select
                value={tier.kind}
                onChange={(e) =>
                  updateTier(tier.id, {
                    kind: e.target.value as 'AUTO_CPS' | 'CLICK_POWER',
                  })
                }
                className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-slate-200"
              >
                <option value="AUTO_CPS">/sec</option>
                <option value="CLICK_POWER">/click</option>
              </select>

              <input
                type="number"
                min={1}
                title="Base Cost"
                value={tier.baseCost}
                onChange={(e) =>
                  updateTier(tier.id, {
                    baseCost: Math.max(1, Number(e.target.value)),
                  })
                }
                className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-amber-300"
              />

              <input
                type="number"
                min={1}
                title="Output Power"
                value={tier.power}
                onChange={(e) =>
                  updateTier(tier.id, {
                    power: Math.max(1, Number(e.target.value)),
                  })
                }
                className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-emerald-300"
              />
            </div>
          </div>
        ))}
      </div>

      {block.goalAmount > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-emerald-400">
            On Goal Reached → Jump to Scene
          </span>
          <select
            value={block.goalSceneId ?? ''}
            onChange={(e) =>
              onChange({
                ...block,
                goalSceneId: e.target.value || undefined,
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
