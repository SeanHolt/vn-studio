'use client';

import React, { useState } from 'react';
import { playSynthSound } from '@/lib/vn-audio';
import { Scale, Backpack, HelpCircle, AlertCircle } from 'lucide-react';

interface EvidenceStageOverlayProps {
  speaker: string;
  statement: string;
  requiredItem: string;
  hintText?: string;
  wrongItemReply: string;
  maxStrikes: number;
  inventory: string[];
  isMuted: boolean;
  onSuccess: () => void;
  onFailOut: () => void;
}

export default function EvidenceStageOverlay({
  speaker,
  statement,
  requiredItem,
  hintText,
  wrongItemReply,
  maxStrikes,
  inventory,
  isMuted,
  onSuccess,
  onFailOut,
}: EvidenceStageOverlayProps) {
  const [selectedItem, setSelectedItem] = useState(inventory.at(0) ?? '');
  const [strikesUsed, setStrikesUsed] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isProven, setIsProven] = useState(false);
  const [isWrongShake, setIsWrongShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePresent = () => {
    if (!selectedItem || isProven) return;

    const match =
      selectedItem.trim().toLowerCase() === requiredItem.trim().toLowerCase();

    if (match) {
      setIsProven(true);
      setFeedbackMsg(`CONTRADICTION PROVEN WITH "${selectedItem.toUpperCase()}"!`);
      if (!isMuted) playSynthSound('synth:chime');
      window.setTimeout(() => onSuccess(), 850);
      return;
    }

    if (!isMuted) playSynthSound('synth:alert');
    const nextStrikes = strikesUsed + 1;
    setStrikesUsed(nextStrikes);
    setIsWrongShake(true);
    window.setTimeout(() => setIsWrongShake(false), 450);

    if (maxStrikes > 0 && nextStrikes >= maxStrikes) {
      setFeedbackMsg('OUT OF CREDIBILITY! The witness slips away...');
      window.setTimeout(() => onFailOut(), 850);
    } else {
      setFeedbackMsg(`${speaker}: "${wrongItemReply}"`);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-x-4 bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-amber-500/50 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md select-none"
    >
      {/* Top Interrogation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-300 uppercase">
            <Scale className="h-3.5 w-3.5" /> Cross-Examination
          </span>
          <span className="text-xs font-bold text-indigo-300">{speaker}</span>
        </div>

        <div className="flex items-center gap-3">
          {maxStrikes > 0 && (
            <span className="font-mono text-xs text-rose-400">
              Strikes Left: {Math.max(0, maxStrikes - strikesUsed)} / {maxStrikes}
            </span>
          )}
          {hintText && (
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Clue
            </button>
          )}
        </div>
      </div>

      {/* Witness Testimony */}
      <p
        className={`rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-sm italic text-slate-100 ${
          isWrongShake ? 'animate-vn-shake border-rose-500' : ''
        }`}
      >
        &ldquo;{statement}&rdquo;
      </p>

      {showHint && hintText && (
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 text-xs text-indigo-200">
          Detective Note: {hintText}
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
            isProven
              ? 'border-emerald-500/50 bg-emerald-950/70 text-emerald-300'
              : 'border-rose-500/40 bg-rose-950/60 text-rose-200'
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Backpack Evidence Selector */}
      {inventory.length === 0 ? (
        <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-4 py-2.5 text-xs text-slate-400">
          <span>Your Backpack is empty! You have no evidence to present.</span>
          <button
            type="button"
            onClick={onFailOut}
            className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-slate-700"
          >
            Back Down →
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs text-slate-400">
              <Backpack className="h-3.5 w-3.5 text-amber-400" /> Evidence:
            </span>
            {inventory.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSelectedItem(item);
                  setFeedbackMsg(null);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  selectedItem === item
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selectedItem || isProven}
            onClick={handlePresent}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-extrabold tracking-wide text-slate-950 uppercase shadow-lg transition hover:bg-amber-400 disabled:opacity-40"
          >
            Present Evidence!
          </button>
        </div>
      )}
    </div>
  );
}
