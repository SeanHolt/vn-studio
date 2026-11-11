import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface UsageMeterProps {
  usedCount: number;
  maxProjects: number;
  planTier: string;
}

export default function UsageMeter({
  usedCount,
  maxProjects,
  planTier,
}: UsageMeterProps) {
  const isUnlimited = planTier === 'PRO' || maxProjects >= 999;
  const pct = isUnlimited ? 15 : Math.min(100, Math.round((usedCount / maxProjects) * 100));
  const isAtLimit = !isUnlimited && usedCount >= maxProjects;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-4">
      <div className="flex-1 min-w-[220px]">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Project Slots Used:{' '}
            <strong className={isAtLimit ? 'text-amber-400' : 'text-white'}>
              {usedCount} / {isUnlimited ? 'Unlimited' : maxProjects}
            </strong>
          </span>
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-indigo-300">
            {planTier} PLAN
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
          <div
            style={{ width: `${pct}%` }}
            className={`h-full transition-all ${
              isAtLimit ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
          />
        </div>
      </div>

      <Link
        href="/pricing"
        className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3.5 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-600 hover:text-white"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {isAtLimit ? 'Unlock More Slots' : 'Upgrade Plan'}
      </Link>
    </div>
  );
}
