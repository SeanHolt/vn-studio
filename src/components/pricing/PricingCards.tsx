'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, Loader2 } from 'lucide-react';

interface PricingCardsProps {
  isLoggedIn: boolean;
  currentPlan: string;
}

export default function PricingCards({ isLoggedIn, currentPlan }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<'PACK_10' | 'PRO' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async (planType: 'PACK_10' | 'PRO') => {
    setErrorMsg(null);
    setLoadingPlan(planType);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || 'Could not start Stripe Checkout.');
        setLoadingPlan(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setErrorMsg('Network error connecting to payment server.');
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      {errorMsg && (
        <div className="mx-auto mb-6 max-w-xl rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-center text-sm text-rose-200">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Free Tier */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-7">
          <div>
            <h3 className="text-lg font-bold text-white">Starter</h3>
            <p className="mt-1 text-sm text-slate-400">Great for trying out VN Studio.</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-sm text-slate-400">/ forever</span>
            </div>

            <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> Up to 3 game projects
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> Simple &amp; Node Graph editors
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> Built-in art &amp; Web Audio SFX
              </li>
            </ul>
          </div>

          <Link
            href={isLoggedIn ? '/dashboard' : '/login'}
            className="mt-8 block rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
        </div>

        {/* One-Time +10 Pack */}
        <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/50 bg-slate-900 p-7 shadow-xl shadow-indigo-950/30">
          <div>
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-indigo-950 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Zap className="h-3.5 w-3.5" /> One-Time Purchase
            </div>
            <h3 className="text-lg font-bold text-white">+10 Project Slots</h3>
            <p className="mt-1 text-sm text-slate-400">Pay once, keep your extra slots forever.</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$9</span>
              <span className="text-sm text-slate-400">one-time</span>
            </div>

            <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-indigo-400" /> Adds +10 permanent project slots
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-indigo-400" /> Stackable anytime you need more
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-indigo-400" /> No monthly subscription required
              </li>
            </ul>
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout('PACK_10')}
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loadingPlan === 'PACK_10' && <Loader2 className="h-4 w-4 animate-spin" />}
              Buy +10 Slots ($9)
            </button>
          ) : (
            <Link
              href="/login"
              className="mt-8 block rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Sign In to Purchase
            </Link>
          )}
        </div>

        {/* Pro Unlimited Subscription */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/40 bg-slate-900 p-7 shadow-xl">
          <div>
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-950/70 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Unlimited Studio
            </div>
            <h3 className="text-lg font-bold text-white">Pro Creator</h3>
            <p className="mt-1 text-sm text-slate-400">For prolific game makers &amp; classrooms.</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$12</span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>

            <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Unlimited game projects
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Full access to all future genres
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400" /> Priority support &amp; early features
              </li>
            </ul>
          </div>

          {currentPlan === 'PRO' ? (
            <div className="mt-8 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-3 text-center text-sm font-semibold text-emerald-300">
              Current Plan (Active)
            </div>
          ) : isLoggedIn ? (
            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout('PRO')}
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {loadingPlan === 'PRO' && <Loader2 className="h-4 w-4 animate-spin" />}
              Upgrade to Pro ($12/mo)
            </button>
          ) : (
            <Link
              href="/login"
              className="mt-8 block rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              Sign In to Upgrade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
