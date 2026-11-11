import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import PricingCards from '@/components/pricing/PricingCards';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { connection } from 'next/server';

interface PricingPageProps {
    searchParams: Promise<{ reason?: string }>;
}

async function PricingLoader({ searchParams }: PricingPageProps) {
    await connection();
    const [{ reason }, session] = await Promise.all([searchParams, auth()]);

    let currentPlan = 'FREE';
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { planTier: true },
        });
        if (user?.planTier) currentPlan = user.planTier;
    }

    return (
        <>
            {reason === 'limit_reached' && (
                <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-amber-500/40 bg-amber-950/40 px-5 py-3.5 text-center text-sm text-amber-200">
                    You&apos;ve reached your current project limit! Choose a one-time slot pack or upgrade
                    to Pro below to keep creating.
                </div>
            )}

            <PricingCards isLoggedIn={Boolean(session?.user?.id)} currentPlan={currentPlan} />
        </>
    );
}

export default function PricingPage({ searchParams }: PricingPageProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-10 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Studio
                    </Link>

                    <Link href="/" className="flex items-center gap-2 font-bold text-white">
                        <Gamepad2 className="h-5 w-5 text-indigo-400" />
                        <span>VN Studio</span>
                    </Link>
                </div>

                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                        Simple, Flexible Plans for Every Creator
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
                        Start with 3 free games. Add extra project slots with a single one-time payment or
                        go unlimited with Pro.
                    </p>
                </div>

                <Suspense
                    fallback={
                        <div className="grid gap-8 md:grid-cols-3">
                            {[1, 2, 3].map((n) => (
                                <div
                                    key={n}
                                    className="h-96 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
                                />
                            ))}
                        </div>
                    }
                >
                    <PricingLoader searchParams={searchParams} />
                </Suspense>
            </div>
        </div>
    );
}
