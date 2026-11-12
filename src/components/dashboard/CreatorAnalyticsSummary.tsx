'use client';

import React from 'react';
import {
  Eye,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

export interface ProjectAnalyticsRow {
  id: string;
  title: string;
  isPublished: boolean;
  playCount: number;
  likesCount: number;
  dislikesCount: number;
  priceCents: number;
  salesCount: number;
  earningsCents: number;
}

interface CreatorAnalyticsSummaryProps {
  rows: ProjectAnalyticsRow[];
}

export default function CreatorAnalyticsSummary({
  rows,
}: CreatorAnalyticsSummaryProps) {
  const totalViews = rows.reduce((sum, r) => sum + r.playCount, 0);
  const totalLikes = rows.reduce((sum, r) => sum + r.likesCount, 0);
  const totalDislikes = rows.reduce((sum, r) => sum + r.dislikesCount, 0);
  const totalVotes = totalLikes + totalDislikes;
  const approvalPct =
    totalVotes === 0 ? 100 : Math.round((totalLikes / totalVotes) * 100);

  const totalSales = rows.reduce((sum, r) => sum + r.salesCount, 0);
  const totalEarningsCents = rows.reduce((sum, r) => sum + r.earningsCents, 0);
  const formattedEarnings = `$${(totalEarningsCents / 100).toFixed(2)}`;

  if (rows.length === 0) return null;

  return (
    <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
          <TrendingUp className="h-4 w-4" />
          <span>Creator Analytics &amp; Earnings Summary</span>
        </div>
        <span className="text-xs text-slate-400">
          Across {rows.length} {rows.length === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Game Views</span>
            <Eye className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {totalViews.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Approval Rating</span>
            <ThumbsUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {approvalPct}%
            </span>
            <span className="text-[11px] text-slate-500">
              ({totalLikes} 👍 / {totalDislikes} 👎)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Game Passes Sold</span>
            <ShoppingBag className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {totalSales.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-300">
            {formattedEarnings}
          </div>
        </div>
      </div>

      {/* Per-Project Breakdown Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-2.5">Project</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Views</th>
              <th className="px-4 py-2.5 text-right">Votes</th>
              <th className="px-4 py-2.5 text-right">Price</th>
              <th className="px-4 py-2.5 text-right">Unlocks</th>
              <th className="px-4 py-2.5 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/60">
                <td className="px-4 py-2.5 font-semibold text-white">
                  {row.title}
                </td>
                <td className="px-4 py-2.5">
                  {row.isPublished ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                      Private
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                  {row.playCount}
                </td>
                <td className="px-4 py-2.5 text-right font-mono">
                  <span className="text-emerald-400">{row.likesCount}</span>
                  <span className="mx-1 text-slate-600">/</span>
                  <span className="text-rose-400">{row.dislikesCount}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                  {row.priceCents === 0
                    ? 'Free'
                    : `$${(row.priceCents / 100).toFixed(2)}`}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-amber-300">
                  {row.salesCount}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-300">
                  ${(row.earningsCents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
