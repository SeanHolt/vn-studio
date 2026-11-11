'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

interface PaidGameGateProps {
  projectId: string;
  title: string;
  description: string | null;
  priceCents: number;
  isLoggedIn: boolean;
}

export default function PaidGameGate({
  projectId,
  title,
  description,
  priceCents,
  isLoggedIn,
}: PaidGameGateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formattedPrice = `$${(priceCents / 100).toFixed(2)}`;

  const handleBuy = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/stripe/buy-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || 'Could not start checkout.');
        setIsLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setErrorMsg('Network error starting checkout.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
          <Lock className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-extrabold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">
          {description || 'This creator game requires a one-time unlock pass to play.'}
        </p>

        <div className="my-6 rounded-xl border border-slate-800 bg-slate-950 py-3">
          <span className="text-3xl font-extrabold text-amber-300">
            {formattedPrice}
          </span>
          <span className="ml-1.5 text-xs text-slate-400">one-time unlock</span>
        </div>

        {errorMsg && (
          <p className="mb-3 text-xs text-rose-400">{errorMsg}</p>
        )}

        {isLoggedIn ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleBuy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Unlock &amp; Play Now ({formattedPrice})
          </button>
        ) : (
          <Link
            href="/login"
            className="block w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Sign In to Unlock ({formattedPrice})
          </Link>
        )}

        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Explore Arcade
        </Link>
      </div>
    </div>
  );
}
