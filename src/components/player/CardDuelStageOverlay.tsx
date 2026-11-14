'use client';

import React, { useState } from 'react';
import { CustomDuelCard } from '@/lib/vn-schema';
import {
  DeckThemeId,
  DuelCard,
  resolveDeckCards,
  evaluateCardClash,
} from '@/lib/vn-card-duel';
import { playSynthSound } from '@/lib/vn-audio';
import { Flame, Shield, Zap } from 'lucide-react';

interface CardDuelStageOverlayProps {
  title: string;
  opponentName: string;
  deckTheme: DeckThemeId;
  customCards?: CustomDuelCard[];
  enableManaUltimate?: boolean;
  ultimateName?: string;
  roundsToWin: number;
  isMuted: boolean;
  onVictory: () => void;
  onDefeat: () => void;
}

export default function CardDuelStageOverlay({
  title,
  opponentName,
  deckTheme,
  customCards = [],
  enableManaUltimate = true,
  ultimateName = 'Astral Overdrive',
  roundsToWin,
  isMuted,
  onVictory,
  onDefeat,
}: CardDuelStageOverlayProps) {
  const deckCards = resolveDeckCards(deckTheme, customCards);

  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [manaCharge, setManaCharge] = useState(0);
  const [manaSurgeArmed, setManaSurgeArmed] = useState(false);
  const [lastClash, setLastClash] = useState<{
    playerCard: DuelCard;
    enemyCard: DuelCard;
    playerEff: number;
    enemyEff: number;
    reason: string;
  } | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handlePlayCard = (chosen: DuelCard, cardIdx: number) => {
    if (isLocked) return;

    const pickIdx =
      (playerWins + enemyWins * 2 + cardIdx + 1) % deckCards.length;
    const enemyPick = deckCards.at(pickIdx) ?? deckCards.at(0)!;

    const result = evaluateCardClash(chosen, enemyPick, manaSurgeArmed);

    if (manaSurgeArmed) {
      setManaCharge(0);
      setManaSurgeArmed(false);
    } else if (enableManaUltimate) {
      setManaCharge((prev) => Math.min(2, prev + 1));
    }

    setLastClash({
      playerCard: chosen,
      enemyCard: enemyPick,
      playerEff: result.playerEffective,
      enemyEff: result.enemyEffective,
      reason: result.reason,
    });

    const nextPlayerWins =
      result.outcome === 'WIN' ? playerWins + 1 : playerWins;
    const nextEnemyWins =
      result.outcome === 'LOSE' ? enemyWins + 1 : enemyWins;

    setPlayerWins(nextPlayerWins);
    setEnemyWins(nextEnemyWins);

    if (result.outcome === 'WIN' && !isMuted) {
      playSynthSound('synth:pickup');
    } else if (result.outcome === 'LOSE' && !isMuted) {
      playSynthSound('synth:alert');
    }

    if (nextPlayerWins >= roundsToWin) {
      setIsLocked(true);
      if (!isMuted) playSynthSound('synth:chime');
      window.setTimeout(() => onVictory(), 950);
    } else if (nextEnemyWins >= roundsToWin) {
      setIsLocked(true);
      window.setTimeout(() => onDefeat(), 950);
    }
  };
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col justify-between bg-slate-950/88 p-4 backdrop-blur-md select-none"
    >
      {/* Top Scoreboard */}
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-2.5 text-xs shadow-lg">
        <div className="font-bold text-emerald-400">
          You: {playerWins} / {roundsToWin} Wins
        </div>
        <div className="font-bold tracking-wide text-amber-300">{title}</div>
        <div className="font-bold text-rose-400">
          {opponentName}: {enemyWins} / {roundsToWin} Wins
        </div>
      </div>

      {/* Center Clash Arena */}
      <div className="my-auto flex flex-col items-center justify-center gap-2">
        {lastClash ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-6">
              <div className="flex h-28 w-24 flex-col items-center justify-center rounded-xl border-2 border-emerald-400 bg-slate-900 p-2 text-center shadow-lg">
                <span className="text-2xl">{lastClash.playerCard.icon}</span>
                <span className="mt-1 line-clamp-1 text-[10px] font-bold text-white">
                  {lastClash.playerCard.name}
                </span>
                <span className="mt-0.5 font-mono text-xs font-extrabold text-emerald-300">
                  PWR {lastClash.playerEff}
                </span>
              </div>

              <span className="text-sm font-black text-slate-500">VS</span>

              <div className="flex h-28 w-24 flex-col items-center justify-center rounded-xl border-2 border-rose-400 bg-slate-900 p-2 text-center shadow-lg">
                <span className="text-2xl">{lastClash.enemyCard.icon}</span>
                <span className="mt-1 line-clamp-1 text-[10px] font-bold text-white">
                  {lastClash.enemyCard.name}
                </span>
                <span className="mt-0.5 font-mono text-xs font-extrabold text-rose-300">
                  PWR {lastClash.enemyEff}
                </span>
              </div>
            </div>

            <div className="rounded-full border border-amber-500/40 bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-200">
              {lastClash.reason}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>
              Blaze beats Vine • Vine beats Tide • Tide beats Blaze (+3 Power)
            </span>
          </div>
        )}
      </div>

      {/* Bottom Hand & Mana Ultimate Bar */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
        {enableManaUltimate && (
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-slate-900/90 px-3 py-1.5 text-xs">
            <span className="font-mono text-indigo-300">
              Mana Charge: {manaCharge} / 2
            </span>
            <button
              type="button"
              disabled={manaCharge < 2 || isLocked}
              onClick={() => setManaSurgeArmed((prev) => !prev)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 font-bold transition ${
                manaSurgeArmed
                  ? 'bg-amber-500 text-slate-950'
                  : manaCharge >= 2
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              {manaSurgeArmed
                ? `${ultimateName} ARMED (+4 PWR)!`
                : `Unleash ${ultimateName}`}
            </button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {deckCards.slice(0, 5).map((card, idx) => (
            <button
              key={card.id}
              type="button"
              disabled={isLocked}
              onClick={() => handlePlayCard(card, idx)}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/95 p-2 text-center transition hover:-translate-y-1 hover:border-indigo-400 disabled:opacity-40"
            >
              <span className="text-xl sm:text-2xl">{card.icon}</span>
              <span className="mt-1 line-clamp-1 text-[10px] font-bold text-white">
                {card.name}
              </span>
              <span className="mt-0.5 flex items-center gap-0.5 font-mono text-[10px] text-amber-300">
                <Flame className="h-2.5 w-2.5" /> {card.power}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
