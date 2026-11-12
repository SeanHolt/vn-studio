'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IdleUpgrade } from '@/lib/vn-schema';
import { formatIdleNumber, computeBulkPurchase } from '@/lib/vn-idle';
import { playSynthSound } from '@/lib/vn-audio';
import { Coins, ArrowRight, Sparkles } from 'lucide-react';

interface IdleStageOverlayProps {
  title: string;
  currencyName: string;
  clickerLabel: string;
  clickerIcon: string;
  baseClickPower: number;
  goalAmount: number;
  initialCurrency: number;
  upgrades: IdleUpgrade[];
  isMuted: boolean;
  onCompleteGoal: (finalCurrency: number) => void;
}

export default function IdleStageOverlay({
  title,
  currencyName,
  clickerLabel,
  clickerIcon,
  baseClickPower,
  goalAmount,
  initialCurrency,
  upgrades,
  isMuted,
  onCompleteGoal,
}: IdleStageOverlayProps) {
  const [currency, setCurrency] = useState(Math.max(0, initialCurrency));
  const [ownedMap, setOwnedMap] = useState<Record<string, number>>({});
  const [buyMode, setBuyMode] = useState<1 | 10 | 'MAX'>(1);
  const [clickPop, setClickPop] = useState(false);

  const { totalCps, totalClickPower } = useMemo(() => {
    let cps = 0;
    let click = baseClickPower;

    upgrades.forEach((u) => {
      const count = ownedMap[u.id] ?? 0;
      if (count > 0) {
        if (u.kind === 'AUTO_CPS') {
          cps += u.power * count;
        } else {
          click += u.power * count;
        }
      }
    });

    return { totalCps: cps, totalClickPower: click };
  }, [upgrades, ownedMap, baseClickPower]);

  useEffect(() => {
    if (totalCps <= 0) return;
    const tickMs = 200;
    const perTick = totalCps * (tickMs / 1000);

    const timer = window.setInterval(() => {
      setCurrency((prev) => prev + perTick);
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [totalCps]);

  const handleManualClick = () => {
    setCurrency((prev) => prev + totalClickPower);
    setClickPop(true);
    window.setTimeout(() => setClickPop(false), 110);
  };

  const handleBuyUpgrade = (upgrade: IdleUpgrade) => {
    const currentOwned = ownedMap[upgrade.id] ?? 0;
    const { quantity, totalCost } = computeBulkPurchase(
      upgrade,
      currentOwned,
      currency,
      buyMode
    );

    if (currency < totalCost) return;

    setCurrency((prev) => prev - totalCost);
    setOwnedMap((prev) => ({
      ...prev,
      [upgrade.id]: currentOwned + quantity,
    }));
    if (!isMuted) playSynthSound('synth:pickup');
  };

  const goalReached = goalAmount > 0 && currency >= goalAmount;
  const progressPct =
    goalAmount > 0 ? Math.min(100, Math.round((currency / goalAmount) * 100)) : 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 grid grid-cols-1 gap-3 bg-slate-950/95 p-4 backdrop-blur-md select-none md:grid-cols-12"
    >
      {/* Left Clicker & Milestone Panel */}
      <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center md:col-span-5">
        <div className="w-full">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-amber-400 uppercase">
            <Coins className="h-3.5 w-3.5" /> {title}
          </div>
          <div className="mt-2 font-mono text-2xl font-extrabold text-white sm:text-3xl">
            {formatIdleNumber(currency)}{' '}
            <span className="text-xs font-normal text-amber-300">
              {currencyName}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="text-emerald-400">
              +{formatIdleNumber(totalCps)} / sec
            </span>
            <span>•</span>
            <span className="text-sky-400">
              +{formatIdleNumber(totalClickPower)} / click
            </span>
          </div>
        </div>

        {/* Big Generator Button */}
        <button
          type="button"
          onClick={handleManualClick}
          className={`my-2 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-amber-400/60 bg-gradient-to-b from-amber-500/25 to-indigo-950/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-transform ${
            clickPop ? 'scale-90' : 'hover:scale-105'
          }`}
        >
          <span className="text-4xl">{clickerIcon}</span>
          <span className="mt-1 text-[10px] font-bold tracking-wide text-amber-200 uppercase">
            {clickerLabel}
          </span>
        </button>

        {/* Goal Progress or Continue Button */}
        {goalAmount > 0 ? (
          <div className="w-full">
            {goalReached ? (
              <button
                type="button"
                onClick={() => onCompleteGoal(Math.floor(currency))}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500"
              >
                <Sparkles className="h-3.5 w-3.5" /> Goal Reached! Continue{' '}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div>
                <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                  <span>Target: {formatIdleNumber(goalAmount)}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    style={{ width: `${progressPct}%` }}
                    className="h-full bg-amber-400 transition-all duration-200"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onCompleteGoal(Math.floor(currency))}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            Cash Out &amp; Continue Story →
          </button>
        )}
      </div>

      {/* Right Scrollable Upgrade Shop */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-3 md:col-span-7">
        <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-200">
            Generator Upgrades ({upgrades.length})
          </span>

          <div className="flex items-center gap-1">
            {([1, 10, 'MAX'] as const).map((mode) => (
              <button
                key={String(mode)}
                type="button"
                onClick={() => setBuyMode(mode)}
                className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                  buyMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'MAX' ? 'MAX' : `${mode}x`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {upgrades.map((tier) => {
            const owned = ownedMap[tier.id] ?? 0;
            const { quantity, totalCost } = computeBulkPurchase(
              tier,
              owned,
              currency,
              buyMode
            );
            const canAfford = currency >= totalCost;

            return (
              <button
                key={tier.id}
                type="button"
                disabled={!canAfford}
                onClick={() => handleBuyUpgrade(tier)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${
                  canAfford
                    ? 'border-slate-700 bg-slate-950 hover:border-amber-400/60'
                    : 'border-slate-800/70 bg-slate-950/40 opacity-55'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl">{tier.icon}</span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-white">
                      {tier.name}{' '}
                      <span className="ml-1 font-mono text-[10px] text-indigo-400">
                        Lv.{owned}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      +{formatIdleNumber(tier.power)}{' '}
                      {tier.kind === 'AUTO_CPS' ? '/ sec' : '/ click'}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono">
                  <div className="text-xs font-bold text-amber-300">
                    {formatIdleNumber(totalCost)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Buy +{quantity}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
