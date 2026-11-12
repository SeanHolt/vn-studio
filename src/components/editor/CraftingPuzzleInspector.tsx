'use client';

import React, { useState } from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { CRAFTING_PRESETS, getIngredientEmoji } from '@/lib/vn-crafting';
import { Plus, Sparkles, X } from 'lucide-react';

interface CraftingPuzzleInspectorProps {
  block: Extract<SceneBlock, { type: 'CRAFTING_PUZZLE' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function CraftingPuzzleInspector({
  block,
  allScenes,
  onChange,
}: CraftingPuzzleInspectorProps) {
  const [newIngredient, setNewIngredient] = useState('');

  const toggleRequired = (ingName: string) => {
    const isReq = block.requiredIngredients.includes(ingName);
    if (isReq && block.requiredIngredients.length <= 2) return;
    if (!isReq && block.requiredIngredients.length >= 4) return;

    const nextReq = isReq
      ? block.requiredIngredients.filter((item) => item !== ingName)
      : [...block.requiredIngredients, ingName];

    onChange({ ...block, requiredIngredients: nextReq });
  };

  const handleAddIngredient = () => {
    const clean = newIngredient.trim();
    if (!clean || block.availableIngredients.length >= 8) return;
    if (block.availableIngredients.includes(clean)) return;

    onChange({
      ...block,
      availableIngredients: [...block.availableIngredients, clean],
    });
    setNewIngredient('');
  };

  const handleRemoveIngredient = (ingName: string) => {
    if (block.availableIngredients.length <= 3) return;
    const nextAvail = block.availableIngredients.filter((i) => i !== ingName);
    const nextReq = block.requiredIngredients.filter((i) => i !== ingName);
    if (nextReq.length < 2) return;

    onChange({
      ...block,
      availableIngredients: nextAvail,
      requiredIngredients: nextReq,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* One-Click Recipe Presets */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
          <Sparkles className="h-3 w-3" /> Load Recipe Preset:
        </span>
        <div className="flex flex-col gap-1">
          {Object.entries(CRAFTING_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                onChange({
                  ...block,
                  title: preset.title,
                  recipePrompt: preset.recipePrompt,
                  hintText: preset.hintText,
                  availableIngredients: [...preset.availableIngredients],
                  requiredIngredients: [...preset.requiredIngredients],
                  craftedItemName: preset.craftedItemName,
                })
              }
              className="rounded bg-slate-900 px-2.5 py-1.5 text-left text-[11px] text-slate-200 hover:bg-emerald-600 hover:text-white"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Station Title</span>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-amber-400">Crafted Item Reward</span>
          <input
            type="text"
            value={block.craftedItemName}
            onChange={(e) =>
              onChange({ ...block, craftedItemName: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-semibold text-amber-300"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Prompt Instruction</span>
        <input
          type="text"
          value={block.recipePrompt}
          onChange={(e) =>
            onChange({ ...block, recipePrompt: e.target.value })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Alchemist Hint / Riddle</span>
        <input
          type="text"
          value={block.hintText ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              hintText: e.target.value || undefined,
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300"
        />
      </label>

      {/* Ingredient Shelf & Secret Recipe Checkboxes */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2.5">
        <span className="text-[11px] font-semibold text-slate-300">
          Shelf Ingredients (Check 2–4 for Secret Formula):
        </span>

        <div className="flex flex-col gap-1">
          {block.availableIngredients.map((ing) => {
            const isRequired = block.requiredIngredients.includes(ing);
            return (
              <div
                key={ing}
                className="flex items-center justify-between rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={() => toggleRequired(ing)}
                    className="accent-emerald-500"
                  />
                  <span>{getIngredientEmoji(ing)}</span>
                  <span
                    className={
                      isRequired ? 'font-bold text-emerald-300' : 'text-slate-300'
                    }
                  >
                    {ing}
                  </span>
                </label>

                {block.availableIngredients.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {block.availableIngredients.length < 8 && (
          <div className="mt-1 flex gap-1.5">
            <input
              type="text"
              placeholder="Add custom ingredient..."
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Max Brew Attempts (0 = Unlimited)
        </span>
        <input
          type="number"
          min={0}
          max={15}
          value={block.maxAttempts}
          onChange={(e) =>
            onChange({
              ...block,
              maxAttempts: Math.max(0, Number(e.target.value)),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Potion Brewed → Jump to Scene
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

      {block.maxAttempts > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rose-400">
            On Cauldron Explodes → Jump to Scene
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
