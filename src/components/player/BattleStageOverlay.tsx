'use client';

import React, { useState } from 'react';
import StageArtwork from '@/components/shared/StageArtwork';
import { Sword, Shield, Sparkles, HeartPulse } from 'lucide-react';

interface BattleStageOverlayProps {
  backgroundUrl: string;
  enemyName: string;
  enemySpriteUrl: string;
  enemyMaxHp: number;
  enemyAttack: number;
  playerMaxHp: number;
  playerAttack: number;
  skillName: string;
  healItemName: string;
  inventory: string[];
  onConsumeItem: (itemName: string) => void;
  onBattleEnd: (won: boolean, remainingPlayerHp: number) => void;
}

export default function BattleStageOverlay({
  backgroundUrl,
  enemyName,
  enemySpriteUrl,
  enemyMaxHp,
  enemyAttack,
  playerMaxHp,
  playerAttack,
  skillName,
  healItemName,
  inventory,
  onConsumeItem,
  onBattleEnd,
}: BattleStageOverlayProps) {
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [enemyHitAnim, setEnemyHitAnim] = useState<'none' | 'shake'>('none');
  const [combatLog, setCombatLog] = useState(`A wild ${enemyName} blocks your path!`);
  const [outcome, setOutcome] = useState<'ACTIVE' | 'VICTORY' | 'DEFEAT'>('ACTIVE');

  const hasHealItem = inventory.includes(healItemName);

  const runTurn = (action: 'ATTACK' | 'SKILL' | 'DEFEND' | 'HEAL') => {
    if (outcome !== 'ACTIVE') return;

    let nextEnemyHp = enemyHp;
    let nextPlayerHp = playerHp;
    let logLine = '';
    const isDefending = action === 'DEFEND';

    if (action === 'ATTACK') {
      const dmg = Math.max(1, playerAttack + Math.floor(Math.random() * 4) - 1);
      nextEnemyHp = Math.max(0, enemyHp - dmg);
      logLine = `You strike ${enemyName} for ${dmg} damage!`;
      setEnemyHitAnim('shake');
      window.setTimeout(() => setEnemyHitAnim('none'), 450);
      setSkillCooldown((c) => Math.max(0, c - 1));
    } else if (action === 'SKILL') {
      const dmg = Math.max(2, Math.round(playerAttack * 1.8));
      nextEnemyHp = Math.max(0, enemyHp - dmg);
      logLine = `You unleash ${skillName} for ${dmg} massive damage!`;
      setEnemyHitAnim('shake');
      window.setTimeout(() => setEnemyHitAnim('none'), 450);
      setSkillCooldown(2);
    } else if (action === 'DEFEND') {
      logLine = 'You raise your guard to brace for impact!';
      setSkillCooldown((c) => Math.max(0, c - 1));
    } else if (action === 'HEAL' && hasHealItem) {
      const healAmt = Math.max(5, Math.round(playerMaxHp * 0.5));
      nextPlayerHp = Math.min(playerMaxHp, playerHp + healAmt);
      onConsumeItem(healItemName);
      logLine = `You used ${healItemName} and recovered ${healAmt} HP!`;
      setSkillCooldown((c) => Math.max(0, c - 1));
    }

    setEnemyHp(nextEnemyHp);

    if (nextEnemyHp === 0) {
      setCombatLog(`${logLine} ${enemyName} is defeated!`);
      setOutcome('VICTORY');
      return;
    }

    const rawEnemyDmg = Math.max(1, enemyAttack + Math.floor(Math.random() * 3) - 1);
    const finalEnemyDmg = isDefending ? Math.max(1, Math.floor(rawEnemyDmg / 2)) : rawEnemyDmg;
    nextPlayerHp = Math.max(0, nextPlayerHp - finalEnemyDmg);
    setPlayerHp(nextPlayerHp);

    if (nextPlayerHp === 0) {
      setCombatLog(`${logLine} ${enemyName} hits for ${finalEnemyDmg} — you collapsed!`);
      setOutcome('DEFEAT');
      return;
    }

    setCombatLog(`${logLine} ${enemyName} counterattacks for ${finalEnemyDmg} damage!`);
  };

  const enemyPct = Math.round((enemyHp / enemyMaxHp) * 100);
  const playerPct = Math.round((playerHp / playerMaxHp) * 100);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col justify-between bg-slate-950 p-4 select-none"
    >
      {backgroundUrl && (
        <StageArtwork
          assetUrl={backgroundUrl}
          alt="Battle arena"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
      )}

      {/* Top Enemy Status HUD */}
      <div className="relative z-10 mx-auto w-full max-w-md rounded-xl border border-rose-500/40 bg-slate-950/90 p-3 shadow-lg backdrop-blur-md">
        <div className="mb-1 flex items-center justify-between text-xs font-bold">
          <span className="text-rose-300">{enemyName}</span>
          <span className="font-mono text-white">
            {enemyHp} / {enemyMaxHp} HP
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            style={{ width: `${enemyPct}%` }}
            className="h-full bg-rose-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Center Enemy Sprite */}
      <div className="relative z-10 my-auto flex items-center justify-center">
        <StageArtwork
          assetUrl={enemySpriteUrl}
          alt={enemyName}
          animation={enemyHitAnim}
          className="h-44 w-32 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Bottom Player HUD, Combat Log, & Action Buttons */}
      <div className="relative z-10 flex flex-col gap-2.5 rounded-xl border border-slate-700/80 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="w-48">
            <div className="mb-1 flex justify-between text-xs font-bold">
              <span className="text-emerald-400">Your HP</span>
              <span className="font-mono text-white">
                {playerHp} / {playerMaxHp}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                style={{ width: `${playerPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
            </div>
          </div>

          <p className="flex-1 text-right text-xs text-slate-200">{combatLog}</p>
        </div>

        {outcome === 'ACTIVE' ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => runTurn('ATTACK')}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500"
            >
              <Sword className="h-3.5 w-3.5" /> Attack
            </button>

            <button
              type="button"
              disabled={skillCooldown > 0}
              onClick={() => runTurn('SKILL')}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {skillCooldown > 0 ? `${skillName} (${skillCooldown})` : skillName}
            </button>

            <button
              type="button"
              onClick={() => runTurn('DEFEND')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Shield className="h-3.5 w-3.5 text-sky-400" /> Defend
            </button>

            <button
              type="button"
              disabled={!hasHealItem}
              onClick={() => runTurn('HEAL')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 disabled:opacity-40"
            >
              <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
              {hasHealItem ? healItemName : `No ${healItemName}`}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBattleEnd(outcome === 'VICTORY', playerHp)}
            className={`w-full rounded-lg py-2.5 text-xs font-bold text-white ${
              outcome === 'VICTORY'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {outcome === 'VICTORY' ? 'Continue Story (Victory) →' : 'Continue (Defeat) →'}
          </button>
        )}
      </div>
    </div>
  );
}
