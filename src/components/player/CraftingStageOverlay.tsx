'use client';

import React, { useState } from 'react';
import { BonusPotionRecipe } from '@/lib/vn-schema';
import { getIngredientEmoji, checkRecipeMatch } from '@/lib/vn-crafting';
import { playSynthSound } from '@/lib/vn-audio';
import {
  FlaskConical,
  HelpCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface CraftingStageOverlayProps {
  title: string;
  recipePrompt: string;
  hintText?: string;
  availableIngredients: string[];
  requiredIngredients: string[];
  craftedItemName: string;
  bonusRecipes?: BonusPotionRecipe[];
  maxAttempts: number;
  isMuted: boolean;
  onBonusCrafted?: (bonusItem: string) => void;
  onCraftSuccess: (craftedItem: string) => void;
  onCraftFailOut: () => void;
}

export default function CraftingStageOverlay({
  title,
  recipePrompt,
  hintText,
  availableIngredients,
  requiredIngredients,
  craftedItemName,
  bonusRecipes = [],
  maxAttempts,
  isMuted,
  onBonusCrafted,
  onCraftSuccess,
  onCraftFailOut,
}: CraftingStageOverlayProps) {
  const [cauldron, setCauldron] = useState<string[]>([]);
  const [discoveredBonusIds, setDiscoveredBonusIds] = useState<string[]>([]);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [bannerTone, setBannerTone] = useState<'SUCCESS' | 'BONUS' | 'ERROR'>(
    'SUCCESS'
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWrongShake, setIsWrongShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const maxSlots = Math.max(
    requiredIngredients.length,
    ...bonusRecipes.map((b) => b.ingredients.length)
  );

  const toggleIngredientInCauldron = (ing: string) => {
    if (isSuccess) return;
    setStatusBanner(null);

    if (cauldron.includes(ing)) {
      setCauldron((prev) => prev.filter((item) => item !== ing));
      return;
    }

    if (cauldron.length >= maxSlots) return;
    setCauldron((prev) => [...prev, ing]);
    if (!isMuted) playSynthSound('synth:pickup');
  };

  const handleBrew = () => {
    if (cauldron.length < 2 || isSuccess) return;

    if (checkRecipeMatch(cauldron, requiredIngredients)) {
      setIsSuccess(true);
      setBannerTone('SUCCESS');
      setStatusBanner(`BREWED: ${craftedItemName.toUpperCase()}!`);
      if (!isMuted) playSynthSound('synth:chime');
      window.setTimeout(() => onCraftSuccess(craftedItemName), 900);
      return;
    }

    const matchedBonus = bonusRecipes.find((rec) =>
      checkRecipeMatch(cauldron, rec.ingredients)
    );

    if (matchedBonus) {
      const isNew = !discoveredBonusIds.includes(matchedBonus.id);
      if (isNew) {
        setDiscoveredBonusIds((prev) => [...prev, matchedBonus.id]);
        onBonusCrafted?.(matchedBonus.potionName);
      }
      setCauldron([]);
      setBannerTone('BONUS');
      setStatusBanner(
        isNew
          ? `✨ DISCOVERED BONUS POTION: ${matchedBonus.potionName} (Added to Backpack)!`
          : `Brewed another ${matchedBonus.potionName}! Now brew ${craftedItemName}.`
      );
      if (!isMuted) playSynthSound('synth:chime');
      return;
    }

    if (!isMuted) playSynthSound('synth:alert');
    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);
    setIsWrongShake(true);
    window.setTimeout(() => setIsWrongShake(false), 450);

    if (maxAttempts > 0 && nextAttempts >= maxAttempts) {
      setBannerTone('ERROR');
      setStatusBanner('CAULDRON OVERLOADED — OUT OF ATTEMPTS!');
      window.setTimeout(() => onCraftFailOut(), 850);
    } else {
      setCauldron([]);
      setBannerTone('ERROR');
      setStatusBanner('Purple smoke rises! Wrong ingredient combination.');
    }
  };
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-3 backdrop-blur-sm select-none"
    >
      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-4 shadow-2xl md:grid-cols-12">
        <div className="flex flex-col gap-2.5 md:col-span-8">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <FlaskConical className="h-4 w-4" /> {title}
            </span>
            <div className="flex items-center gap-3">
              {maxAttempts > 0 && (
                <span className="font-mono text-amber-300">
                  Tries: {Math.max(0, maxAttempts - attemptsUsed)}/{maxAttempts}
                </span>
              )}
              {hintText && (
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Hint
                </button>
              )}
            </div>
          </div>

          <p className="text-xs font-medium text-slate-200">{recipePrompt}</p>

          {showHint && hintText && (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 text-xs text-indigo-200">
              Grimoire Hint: {hintText}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {availableIngredients.map((ing) => {
              const inPot = cauldron.includes(ing);
              return (
                <button
                  key={ing}
                  type="button"
                  onClick={() => toggleIngredientInCauldron(ing)}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-semibold transition ${
                    inPot
                      ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-400'
                      : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <span className="text-base">{getIngredientEmoji(ing)}</span>
                  <span className="truncate">{ing}</span>
                </button>
              );
            })}
          </div>

          <div
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2.5 ${
              isWrongShake ? 'animate-vn-shake border-rose-500' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚗️</span>
              <div className="flex gap-1.5">
                {Array.from({ length: maxSlots }, (_, slotIdx) => {
                  const filledItem = cauldron[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base ${
                        filledItem
                          ? 'border-emerald-500/60 bg-emerald-950/40'
                          : 'border-dashed border-slate-700 bg-slate-900 text-xs text-slate-600'
                      }`}
                    >
                      {filledItem ? getIngredientEmoji(filledItem) : '+'}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {cauldron.length > 0 && !isSuccess && (
                <button
                  type="button"
                  onClick={() => {
                    setCauldron([]);
                    setStatusBanner(null);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" /> Clear
                </button>
              )}

              <button
                type="button"
                disabled={cauldron.length < 2 || isSuccess}
                onClick={handleBrew}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5" /> Brew Formula!
              </button>
            </div>
          </div>

          {statusBanner && (
            <div
              className={`rounded-lg border px-2 py-1.5 text-center font-mono text-[11px] font-bold ${
                bannerTone === 'SUCCESS'
                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                  : bannerTone === 'BONUS'
                    ? 'border-purple-500/40 bg-purple-950/80 text-purple-200'
                    : 'border-rose-500/40 bg-rose-950/80 text-rose-300'
              }`}
            >
              {statusBanner}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3 md:col-span-4">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 text-xs font-bold text-purple-300">
            <BookOpen className="h-3.5 w-3.5" /> Potion Grimoire
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-2 text-[11px]">
            <div className="font-bold text-amber-300">
              🎯 Quest Goal: {craftedItemName}
            </div>
            <div className="mt-0.5 text-slate-400">
              Requires {requiredIngredients.length} ingredients
            </div>
          </div>

          {bonusRecipes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                Bonus Discoveries ({discoveredBonusIds.length}/
                {bonusRecipes.length})
              </span>
              {bonusRecipes.map((rec) => {
                const found = discoveredBonusIds.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    className={`rounded-lg border p-2 text-[11px] ${
                      found
                        ? 'border-purple-500/40 bg-purple-950/30 text-purple-200'
                        : 'border-slate-800 bg-slate-900/70 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">
                      {found ? `✅ ${rec.potionName}` : '❓ Undiscovered Potion'}
                    </div>
                    <div className="mt-0.5 text-[10px]">
                      {found
                        ? rec.ingredients
                            .map((i) => `${getIngredientEmoji(i)} ${i}`)
                            .join(' + ')
                        : rec.clue || `Combine ${rec.ingredients.length} items`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
