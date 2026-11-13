import { Suspense } from 'react';
import Link from 'next/link';
import FeaturedGames from '@/components/home/FeaturedGames';
import FeatureHighlights from '@/components/home/FeatureHighlights';
import { Gamepad2, Play, Plus, Sparkles } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Top Navbar */}
            <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <Gamepad2 className="h-5 w-5" />
                        </div>
                        <span>VN Studio</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/explore"
                            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                        >
                            Explore Arcade
                        </Link>
                        <Link
                            href="/play/demo"
                            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                        >
                            Play Demo
                        </Link>
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Open Studio
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-slate-800/80 bg-linear-to-b from-indigo-950/30 via-slate-950 to-slate-950 px-6 py-20 text-center">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3.5 py-1 text-xs font-medium text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5" /> No-Code Game &amp; Story Creator
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Create Interactive Games &amp; Visual Novels in Your Browser
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                        Design scenes, stage characters, track player choices, and share playable games
                        instantly—whether you are 9 years old making your first story or an adult wiring
                        complex branching logic.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
                        >
                            <Plus className="h-4 w-4" /> Start Creating Free
                        </Link>

                        <Link
                            href="/play/demo"
                            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800"
                        >
                            <Play className="h-4 w-4 text-emerald-400" /> Play Featured Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <FeatureHighlights />

            {/* Featured Community & Demo Projects */}
            <section className="mx-auto max-w-6xl border-t border-slate-800/80 px-6 py-16">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Play &amp; Remix Projects</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Jump straight into a playable game or open its scenes in the editor to see how it works.
                        </p>
                    </div>

                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                        View All Projects →
                    </Link>
                </div>

                <Suspense
                    fallback={
                        <div className="grid gap-6 md:grid-cols-3">
                            {[1, 2, 3].map((n) => (
                                <div
                                    key={n}
                                    className="h-52 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
                                />
                            ))}
                        </div>
                    }
                >
                    <FeaturedGames />
                </Suspense>
            </section>
        </div>
    );
}
