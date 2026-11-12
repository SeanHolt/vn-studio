'use client';

import React, { useState } from 'react';
import { getIngredientEmoji, checkRecipeMatch } from '@/lib/vn-crafting';
import { playSynthSound } from '@/lib/vn-audio';
import { FlaskConical, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';

interface CraftingStageOverlayProps {
  title: string;
  recipePrompt: string;
  hintText?: string;
  availableIngredients: string[];
  requiredIngredients: string[];
  craftedItemName: string;
  maxAttempts: number;
  isMuted: boolean;
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
  maxAttempts,
  isMuted,
  onCraftSuccess,
  onCraftFailOut,
}: CraftingStageOverlayProps) {
  const [cauldron, setCauldron] = useState<string[]>([]);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWrongShake, setIsWrongShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const slotsNeeded = requiredIngredients.length;

  const toggleIngredientInCauldron = (ing: string) => {
    if (isSuccess) return;
    setStatusBanner(null);

    if (cauldron.includes(ing)) {
      setCauldron((prev) => prev.filter((item) => item !== ing));
      return;
    }

    if (cauldron.length >= slotsNeeded) return;
    setCauldron((prev) => [...prev, ing]);
    if (!isMuted) playSynthSound('synth:pickup');
  };

  const handleBrew = () => {
    if (cauldron.length !== slotsNeeded || isSuccess) return;

    if (checkRecipeMatch(cauldron, requiredIngredients)) {
      setIsSuccess(true);
      setStatusBanner(`BREWED: ${craftedItemName.toUpperCase()}!`);
      if (!isMuted) playSynthSound('synth:chime');
      window.setTimeout(() => onCraftSuccess(craftedItemName), 900);
      return;
    }

    if (!isMuted) playSynthSound('synth:alert');
    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);
    setIsWrongShake(true);
    window.setTimeout(() => setIsWrongShake(false), 450);

    if (maxAttempts > 0 && nextAttempts >= maxAttempts) {
      setStatusBanner('CAULDRON OVERLOADED — OUT OF ATTEMPTS!');
      window.setTimeout(() => onCraftFailOut(), 850);
    } else {
      setCauldron([]);
      setStatusBanner('Purple smoke rises! Wrong ingredient combination.');
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm select-none"
    >
      <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <FlaskConical className="h-4 w-4" /> {title}
          </span>
          <div className="flex items-center gap-3">
            {maxAttempts > 0 && (
              <span className="font-mono text-amber-300">
                Tries Left: {Math.max(0, maxAttempts - attemptsUsed)} /{' '}
                {maxAttempts}
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

        {/* Ingredient Shelf */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableIngredients.map((ing) => {
            const inPot = cauldron.includes(ing);
            return (
              <button
                key={ing}
                type="button"
                onClick={() => toggleIngredientInCauldron(ing)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                  inPot
                    ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-400'
                    : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-indigo-400'
                }`}
              >
                <span className="text-lg">{getIngredientEmoji(ing)}</span>
                <span className="truncate">{ing}</span>
              </button>
            );
          })}
        </div>

        {/* Cauldron Mixing Slots & Brew Button */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 ${
            isWrongShake ? 'animate-vn-shake border-rose-500' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚗️</span>
            <div className="flex gap-1.5">
              {Array.from({ length: slotsNeeded }, (_, slotIdx) => {
                const filledItem = cauldron[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg ${
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

          <div className="flex items-center gap-2">
            {cauldron.length > 0 && !isSuccess && (
              <button
                type="button"
                onClick={() => {
                  setCauldron([]);
                  setStatusBanner(null);
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            )}

            <button
              type="button"
              disabled={cauldron.length !== slotsNeeded || isSuccess}
              onClick={handleBrew}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {cauldron.length === slotsNeeded
                ? 'Brew Formula!'
                : `Pick ${slotsNeeded - cauldron.length} more`}
            </button>
          </div>
        </div>

        {statusBanner && (
          <div
            className={`rounded-lg border py-1.5 text-center font-mono text-xs font-bold ${
              isSuccess
                ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/80 text-rose-300'
            }`}
          >
            {statusBanner}
          </div>
        )}
      </div>
    </div>
  );
}
