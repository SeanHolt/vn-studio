'use client';

import React, { useState } from 'react';
import {
  DUEL_DECKS,
  DeckThemeId,
  DuelCard,
  resolveDuelRound,
} from '@/lib/vn-card-duel';
import { playSynthSound } from '@/lib/vn-audio';
import { Spade } from 'lucide-react';

interface CardDuelStageOverlayProps {
  opponentName: string;
  deckTheme: DeckThemeId;
  roundsToWin: number;
  isMuted: boolean;
  onDuelComplete: (playerWon: boolean) => void;
}

export default function CardDuelStageOverlay({
  opponentName,
  deckTheme,
  roundsToWin,
  isMuted,
  onDuelComplete,
}: CardDuelStageOverlayProps) {
  const deck = DUEL_DECKS[deckTheme] ?? DUEL_DECKS.ELEMENTAL;

  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [lastClash, setLastClash] = useState<{
    playerCard: DuelCard;
    enemyCard: DuelCard;
    resultText: string;
  } | null>(null);
  const [matchWinner, setMatchWinner] = useState<'PLAYER' | 'ENEMY' | null>(
    null
  );

  const handlePlayCard = (chosen: DuelCard) => {
    if (matchWinner) return;

    const enemyPick =
      deck.cards[Math.floor(Math.random() * deck.cards.length)] ?? deck.cards[0];
    const winner = resolveDuelRound(chosen, enemyPick);

    let nextPlayerWins = playerWins;
    let nextEnemyWins = enemyWins;
    let resultText = `Both played ${chosen.name} — Round Tied!`;

    if (winner === 'PLAYER') {
      nextPlayerWins += 1;
      resultText = `${chosen.name} beats ${enemyPick.name}! You win the round!`;
      if (!isMuted) playSynthSound('synth:chime');
    } else if (winner === 'ENEMY') {
      nextEnemyWins += 1;
      resultText = `${enemyPick.name} beats ${chosen.name}! ${opponentName} takes the round!`;
      if (!isMuted) playSynthSound('synth:alert');
    }

    setPlayerWins(nextPlayerWins);
    setEnemyWins(nextEnemyWins);
    setLastClash({ playerCard: chosen, enemyCard: enemyPick, resultText });

    if (nextPlayerWins >= roundsToWin) {
      setMatchWinner('PLAYER');
    } else if (nextEnemyWins >= roundsToWin) {
      setMatchWinner('ENEMY');
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm select-none"
    >
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-indigo-500/40 bg-slate-900 p-6 shadow-2xl">
        {/* Top Scoreboard */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold">
          <span className="text-emerald-400">
            You: {playerWins} / {roundsToWin}
          </span>
          <span className="flex items-center gap-1 text-indigo-300 uppercase">
            <Spade className="h-3.5 w-3.5" /> Card Showdown
          </span>
          <span className="text-rose-400">
            {opponentName}: {enemyWins} / {roundsToWin}
          </span>
        </div>

        {/* Center Clash Display */}
        {lastClash ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-center">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-3xl">{lastClash.playerCard.icon}</span>
                <span className="mt-1 text-xs font-semibold text-white">
                  {lastClash.playerCard.name}
                </span>
                <span className="text-[10px] text-slate-400">You</span>
              </div>

              <span className="text-sm font-extrabold text-slate-500">VS</span>

              <div className="flex flex-col items-center">
                <span className="text-3xl">{lastClash.enemyCard.icon}</span>
                <span className="mt-1 text-xs font-semibold text-white">
                  {lastClash.enemyCard.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {opponentName}
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs font-medium text-amber-300">
              {lastClash.resultText}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 py-6 text-center text-xs text-slate-400">
            Choose a card below to challenge <strong>{opponentName}</strong>!
            First to {roundsToWin} wins!
          </div>
        )}

        {/* Hand of 3 Cards or Match End Button */}
        {matchWinner === null ? (
          <div className="grid grid-cols-3 gap-2.5">
            {deck.cards.map((card) => {
              const beatsCard = deck.cards[card.beatsIndex];
              return (
                <button
                  key={card.index}
                  type="button"
                  onClick={() => handlePlayCard(card)}
                  className={`flex flex-col items-center rounded-xl border p-3 text-center transition hover:scale-105 ${card.accentClass}`}
                >
                  <span className="text-3xl">{card.icon}</span>
                  <span className="mt-1.5 text-xs font-bold text-white">
                    {card.name}
                  </span>
                  {beatsCard && (
                    <span className="mt-0.5 text-[10px] opacity-80">
                      Beats {beatsCard.icon} {beatsCard.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onDuelComplete(matchWinner === 'PLAYER')}
            className={`w-full rounded-xl py-3 text-sm font-bold text-white transition ${
              matchWinner === 'PLAYER'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {matchWinner === 'PLAYER'
              ? 'Victory! Continue Story →'
              : `Defeated by ${opponentName} — Continue →`}
          </button>
        )}
      </div>
    </div>
  );
}
