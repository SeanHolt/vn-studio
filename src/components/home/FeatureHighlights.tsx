import React from 'react';
import { Blocks, Workflow, Sliders, Sparkles } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: <Blocks className="h-5 w-5 text-indigo-400" />,
    title: 'Kid-Friendly Drag & Drop',
    description:
      'Snap together dialogue, character sprites, backgrounds, and sound effects in a clean visual timeline.',
  },
  {
    icon: <Workflow className="h-5 w-5 text-emerald-400" />,
    title: 'Advanced Node Graph Mode',
    description:
      'Switch to a 2D node canvas anytime to map branching storylines and wire scenes together visually.',
  },
  {
    icon: <Sliders className="h-5 w-5 text-amber-400" />,
    title: 'Variables, Inventory & Logic',
    description:
      'Track player names, items, and custom variables with IF/ELSE branches and conditional choices.',
  },
  {
    icon: <Sparkles className="h-5 w-5 text-pink-400" />,
    title: 'Zero-Install Browser Studio',
    description:
      'Built-in art, Web Audio synth chimes, and instant playable links work right in your browser.',
  },
];

export default function FeatureHighlights() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Built for First-Time Creators &amp; Power Storytellers
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Start with simple blocks and unlock deeper game logic whenever you are ready.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800">
              {item.icon}
            </div>
            <h3 className="text-base font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
