'use client';

import React, { useState } from 'react';
import { BattleElement, BattleWaveEnemy } from '@/lib/vn-schema';
import { ELEMENT_BADGES, computeSkillDamage } from '@/lib/vn-battle';
import { playSynthSound } from '@/lib/vn-audio';
import StageArtwork from '@/components/shared/StageArtwork';
import { Swords, Shield, Sparkles, HeartPulse } from 'lucide-react';

interface BattleStageOverlayProps {
  backgroundUrl: string;
  enemyName: string;
  enemySpriteUrl: string;
  enemyMaxHp: number;
  enemyAttack: number;
  enemyWeakness?: BattleElement;
  extraWaves?: BattleWaveEnemy[];
  playerMaxHp: number;
  playerAttack: number;
  skillName: string;
  skillElement?: BattleElement;
  skillStatusEffect?: 'NONE' | 'BURN' | 'FREEZE';
  healItemName: string;
  hasHealItem: boolean;
  isMuted: boolean;
  onConsumeHealItem: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export default function BattleStageOverlay({
  backgroundUrl,
  enemyName,
  enemySpriteUrl,
  enemyMaxHp,
  enemyAttack,
  enemyWeakness = 'NEUTRAL',
  extraWaves = [],
  playerMaxHp,
  playerAttack,
  skillName,
  skillElement = 'FIRE',
  skillStatusEffect = 'BURN',
  healItemName,
  hasHealItem,
  isMuted,
  onConsumeHealItem,
  onVictory,
  onDefeat,
}: BattleStageOverlayProps) {
  const allWaves: BattleWaveEnemy[] = [
    ...extraWaves,
    {
      id: 'final_boss',
      name: enemyName,
      spriteUrl: enemySpriteUrl,
      maxHp: enemyMaxHp,
      attack: enemyAttack,
      weakness: enemyWeakness,
    },
  ];

  const firstEnemy = allWaves.at(0)!;

  const [waveIndex, setWaveIndex] = useState(0);
  const [enemyHp, setEnemyHp] = useState(firstEnemy.maxHp);
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [sp, setSp] = useState(2);
  const [burnTurns, setBurnTurns] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [battleLog, setBattleLog] = useState(
    `Wave 1/${allWaves.length}: ${firstEnemy.name} appears!`
  );
  const [isBusy, setIsBusy] = useState(false);
  const [enemyHitShake, setEnemyHitShake] = useState(false);

  const activeEnemy = allWaves.at(waveIndex) ?? firstEnemy;
  const weaknessCfg = ELEMENT_BADGES[activeEnemy.weakness];
  const skillElemCfg = ELEMENT_BADGES[skillElement];

  const advanceOrWin = (msgPrefix: string) => {
    const nextWaveIdx = waveIndex + 1;
    const nextEnemy = allWaves.at(nextWaveIdx);

    if (nextEnemy) {
      setBattleLog(
        `${msgPrefix} Wave ${nextWaveIdx + 1}/${allWaves.length}: ${nextEnemy.name} enters!`
      );
      window.setTimeout(() => {
        setWaveIndex(nextWaveIdx);
        setEnemyHp(nextEnemy.maxHp);
        setBurnTurns(0);
        setIsFrozen(false);
        setIsBusy(false);
      }, 750);
      return;
    }

    setBattleLog(`${msgPrefix} Victory!`);
    if (!isMuted) playSynthSound('synth:chime');
    window.setTimeout(() => onVictory(), 850);
  };

  const runEnemyTurn = (
    afterDamageHp: number,
    defending: boolean,
    prefixMsg: string,
    frozenNow: boolean,
    burnNow: number
  ) => {
    let currHp = afterDamageHp;
    let statusNote = '';

    if (burnNow > 0 && currHp > 0) {
      const burnDmg = Math.max(2, Math.round(playerAttack * 0.35));
      currHp = Math.max(0, currHp - burnDmg);
      setEnemyHp(currHp);
      setBurnTurns(burnNow - 1);
      statusNote = ` 🔥 Burn deals ${burnDmg}!`;
      if (currHp <= 0) {
        advanceOrWin(`${prefixMsg}${statusNote} ${activeEnemy.name} fell!`);
        return;
      }
    }

    if (frozenNow) {
      setIsFrozen(false);
      setBattleLog(`${prefixMsg}${statusNote} ❄️ ${activeEnemy.name} is frozen and skips its turn!`);
      setIsBusy(false);
      return;
    }

    window.setTimeout(() => {
      const rawEnemyDmg = Math.max(
        1,
        activeEnemy.attack + Math.floor(Math.random() * 3) - 1
      );
      const finalEnemyDmg = defending
        ? Math.max(1, Math.floor(rawEnemyDmg * 0.4))
        : rawEnemyDmg;

      const nextPlayerHp = Math.max(0, playerHp - finalEnemyDmg);
      setPlayerHp(nextPlayerHp);

      if (nextPlayerHp <= 0) {
        setBattleLog(`${activeEnemy.name} strikes for ${finalEnemyDmg}! You fell...`);
        window.setTimeout(() => onDefeat(), 850);
      } else {
        setBattleLog(
          `${prefixMsg}${statusNote} ${activeEnemy.name} hits for ${finalEnemyDmg} HP!`
        );
        setIsBusy(false);
      }
    }, 600);
  };

  const handleAction = (mode: 'ATTACK' | 'SKILL' | 'DEFEND' | 'HEAL') => {
    if (isBusy || playerHp <= 0 || enemyHp <= 0) return;
    setIsBusy(true);

    if (mode === 'ATTACK') {
      const dmg = Math.max(1, playerAttack + Math.floor(Math.random() * 3) - 1);
      const nextHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextHp);
      setSp((prev) => Math.min(3, prev + 1));
      setEnemyHitShake(true);
      window.setTimeout(() => setEnemyHitShake(false), 350);
      if (!isMuted) playSynthSound('synth:alert');

      if (nextHp <= 0) {
        advanceOrWin(`You strike for ${dmg} dmg! ${activeEnemy.name} defeated!`);
      } else {
        runEnemyTurn(nextHp, false, `You attack for ${dmg} dmg!`, isFrozen, burnTurns);
      }
      return;
    }

    if (mode === 'SKILL') {
      if (sp < 2) {
        setIsBusy(false);
        return;
      }
      const { damage, isSuperEffective } = computeSkillDamage(
        playerAttack,
        skillElement,
        activeEnemy.weakness
      );
      const nextHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextHp);
      setSp((prev) => prev - 2);
      setEnemyHitShake(true);
      window.setTimeout(() => setEnemyHitShake(false), 350);
      if (!isMuted) playSynthSound('synth:chime');

      let nextBurn = burnTurns;
      let nextFreeze = isFrozen;
      let appliedTag = '';

      if (skillStatusEffect === 'BURN') {
        nextBurn = 2;
        setBurnTurns(2);
        appliedTag = ' (Burned!)';
      } else if (skillStatusEffect === 'FREEZE') {
        nextFreeze = true;
        setIsFrozen(true);
        appliedTag = ' (Frozen!)';
      }

      const effLabel = isSuperEffective ? ' SUPER EFFECTIVE!' : '';
      const msg = `${skillName} hits for ${damage} dmg!${effLabel}${appliedTag}`;

      if (nextHp <= 0) {
        advanceOrWin(`${msg} ${activeEnemy.name} defeated!`);
      } else {
        runEnemyTurn(nextHp, false, msg, nextFreeze, nextBurn);
      }
      return;
    }

    if (mode === 'DEFEND') {
      setSp((prev) => Math.min(3, prev + 1));
      runEnemyTurn(enemyHp, true, 'You raise your guard (+1 SP)!', isFrozen, burnTurns);
      return;
    }

    if (mode === 'HEAL' && hasHealItem) {
      onConsumeHealItem();
      const healAmt = Math.max(12, Math.round(playerMaxHp * 0.5));
      setPlayerHp((prev) => Math.min(playerMaxHp, prev + healAmt));
      if (!isMuted) playSynthSound('synth:pickup');
      runEnemyTurn(
        enemyHp,
        false,
        `Used ${healItemName} (+${healAmt} HP)!`,
        isFrozen,
        burnTurns
      );
    }
  };
  const enemyPct = Math.max(0, Math.round((enemyHp / activeEnemy.maxHp) * 100));
  const playerPct = Math.max(0, Math.round((playerHp / playerMaxHp) * 100));

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col justify-between overflow-hidden select-none"
    >
      <StageArtwork
        assetUrl={backgroundUrl}
        alt="Battle Arena"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/55" />

      <div className="relative z-10 mx-auto mt-3 w-full max-w-md px-4">
        <div className="rounded-xl border border-rose-500/40 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-xs font-bold">
            <span className="text-rose-300">
              {activeEnemy.name}{' '}
              {allWaves.length > 1 && (
                <span className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                  Wave {waveIndex + 1}/{allWaves.length}
                </span>
              )}
            </span>
            <span className="font-mono text-slate-300">
              HP {enemyHp} / {activeEnemy.maxHp}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              style={{ width: `${enemyPct}%` }}
              className="h-full bg-rose-500 transition-all duration-300"
            />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
            <span
              className={`rounded-full border px-2 py-0.5 ${weaknessCfg.badgeClass}`}
            >
              Weakness: {weaknessCfg.icon} {weaknessCfg.label}
            </span>
            {burnTurns > 0 && (
              <span className="rounded-full border border-orange-500/50 bg-orange-950/70 px-2 py-0.5 text-orange-200">
                🔥 Burned ({burnTurns}t)
              </span>
            )}
            {isFrozen && (
              <span className="rounded-full border border-cyan-500/50 bg-cyan-950/70 px-2 py-0.5 text-cyan-200">
                ❄️ Frozen
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="h-40 w-32 sm:h-48 sm:w-40">
          <StageArtwork
            assetUrl={activeEnemy.spriteUrl}
            alt={activeEnemy.name}
            animation={enemyHitShake ? 'shake' : 'none'}
            className="h-full w-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)]"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto mb-3 w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/92 p-3.5 shadow-2xl backdrop-blur-md">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
            <span className="font-medium text-amber-200">{battleLog}</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-emerald-400">
                Hero HP: {playerHp}/{playerMaxHp} ({playerPct}%)
              </span>
              <span className="text-indigo-400">SP: {sp}/3</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleAction('ATTACK')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-40"
            >
              <Swords className="h-4 w-4" /> Attack
            </button>

            <button
              type="button"
              disabled={isBusy || sp < 2}
              onClick={() => handleAction('SKILL')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> {skillElemCfg.icon} {skillName} (2 SP)
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleAction('DEFEND')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              <Shield className="h-4 w-4 text-sky-400" /> Guard (+1 SP)
            </button>

            <button
              type="button"
              disabled={isBusy || !hasHealItem}
              onClick={() => handleAction('HEAL')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-40"
            >
              <HeartPulse className="h-4 w-4" /> {healItemName}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
