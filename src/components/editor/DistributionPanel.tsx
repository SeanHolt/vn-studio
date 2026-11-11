'use client';

import React, { useState, useTransition } from 'react';
import { updateProjectDistribution } from '@/app/actions/arcade-actions';
import { GitFork, DollarSign, Check } from 'lucide-react';

interface DistributionPanelProps {
  projectId: string;
  initialAllowRemix: boolean;
  initialPriceCents: number;
}

export default function DistributionPanel({
  projectId,
  initialAllowRemix,
  initialPriceCents,
}: DistributionPanelProps) {
  const [allowRemix, setAllowRemix] = useState(initialAllowRemix);
  const [priceDollars, setPriceDollars] = useState(
    (initialPriceCents / 100).toFixed(2)
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    const cents = Math.max(0, Math.round(Number(priceDollars || 0) * 100));
    startTransition(async () => {
      const res = await updateProjectDistribution(projectId, allowRemix, cents);
      if (res.success) {
        setSavedNotice(true);
        window.setTimeout(() => setSavedNotice(false), 2000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-400 uppercase">
          <DollarSign className="h-3.5 w-3.5" /> Arcade &amp; Pricing
        </span>
        {savedNotice && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <Check className="h-3 w-3" /> Updated
          </span>
        )}
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
        <div className="flex items-center gap-2">
          <GitFork className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-slate-200">
            Allow Others to Remix
          </span>
        </div>
        <input
          type="checkbox"
          checked={allowRemix}
          onChange={(e) => setAllowRemix(e.target.checked)}
          className="h-4 w-4 accent-indigo-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Price to Play (USD — $0.00 for Free)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={99}
            step={0.5}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            className="w-28 rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-amber-300"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleApply}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </label>
    </div>
  );
}
