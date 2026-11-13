/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { CharacterEmotion, StageAnimation } from '@/lib/vn-schema';

interface StageArtworkProps {
  assetUrl: string;
  alt: string;
  className?: string;
  emotion?: CharacterEmotion;
  animation?: StageAnimation;
}

const ANIM_CLASSES: Record<StageAnimation, string> = {
  none: '',
  'slide-in': 'animate-vn-slide-in',
  bounce: 'animate-vn-bounce',
  shake: 'animate-vn-shake',
  pulse: 'animate-vn-pulse',
};

const EMOTION_BADGES: Record<CharacterEmotion, string> = {
  neutral: '',
  happy: '😊',
  angry: '😠',
  shocked: '😲',
  sad: '😢',
};

const BG_STYLES: Record<string, string> = {
  'css:starry-night':
    'bg-[radial-gradient(circle_at_25%_20%,#312e81_0%,#0f172a_55%,#020617_100%)]',
  'css:sunset-coast':
    'bg-gradient-to-b from-amber-500 via-rose-600 to-indigo-950',
  'css:emerald-woods':
    'bg-gradient-to-b from-emerald-800 via-teal-950 to-slate-950',
  'css:cyber-grid':
    'bg-[linear-gradient(to_right,#06b6d422_1px,transparent_1px),linear-gradient(to_bottom,#06b6d422_1px,transparent_1px),radial-gradient(circle_at_50%_30%,#164e63_0%,#020617_85%)] bg-[size:24px_24px,24px_24px,100%_100%]',
  'css:starship-bridge':
    'bg-gradient-to-b from-slate-800 via-sky-950 to-slate-950',
  'css:volcano-forge':
    'bg-gradient-to-t from-orange-600 via-red-950 to-stone-950',
  'css:crystal-cove':
    'bg-gradient-to-b from-cyan-600 via-blue-900 to-slate-950',
  'css:royal-throne':
    'bg-gradient-to-b from-purple-900 via-indigo-950 to-amber-950',
  'css:stormy-moor':
    'bg-gradient-to-b from-slate-600 via-slate-800 to-zinc-950',
  'css:alchemy-lab':
    'bg-gradient-to-br from-emerald-900 via-purple-950 to-slate-950',
};

interface CharTheme {
  coat: string;
  hair: string;
  accent: string;
  isMonster?: boolean;
}

const CHAR_THEMES: Record<string, CharTheme> = {
  'css:char-explorer': {
    coat: 'bg-sky-600 border-sky-300',
    hair: 'bg-amber-800',
    accent: 'bg-amber-300',
  },
  'css:char-keeper': {
    coat: 'bg-purple-700 border-purple-300',
    hair: 'bg-slate-200',
    accent: 'bg-fuchsia-400',
  },
  'css:char-cyborg': {
    coat: 'bg-slate-700 border-cyan-400',
    hair: 'bg-cyan-500',
    accent: 'bg-cyan-300',
  },
  'css:char-knight': {
    coat: 'bg-amber-600 border-yellow-200',
    hair: 'bg-yellow-400',
    accent: 'bg-red-500',
  },
  'css:char-shadow': {
    coat: 'bg-zinc-900 border-rose-500',
    hair: 'bg-indigo-950',
    accent: 'bg-rose-500',
  },
  'css:char-alchemist': {
    coat: 'bg-emerald-700 border-lime-300',
    hair: 'bg-orange-700',
    accent: 'bg-lime-300',
  },
  'css:char-captain': {
    coat: 'bg-indigo-700 border-amber-300',
    hair: 'bg-stone-900',
    accent: 'bg-amber-400',
  },
  'css:char-slime': {
    coat: 'bg-emerald-500 border-emerald-200',
    hair: 'bg-emerald-400',
    accent: 'bg-white',
    isMonster: true,
  },
};

export default function StageArtwork({
  assetUrl,
  alt,
  className = '',
  emotion = 'neutral',
  animation = 'none',
}: StageArtworkProps) {
  const cleanUrl = assetUrl.trim();
  const animClass = ANIM_CLASSES[animation] ?? '';
  const emotionIcon = EMOTION_BADGES[emotion] ?? '';

  if (cleanUrl in BG_STYLES) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative overflow-hidden ${BG_STYLES[cleanUrl]} ${animClass} ${className}`}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/50 to-transparent" />
      </div>
    );
  }

  if (cleanUrl in CHAR_THEMES) {
    const style = CHAR_THEMES[cleanUrl];
    if (style.isMonster) {
      return (
        <div
          role="img"
          aria-label={alt}
          className={`relative flex flex-col items-center justify-end pb-2 ${animClass} ${className}`}
        >
          {emotionIcon && (
            <span className="mb-1 rounded-full bg-slate-950/80 px-1.5 py-0.5 text-sm shadow">
              {emotionIcon}
            </span>
          )}
          <div
            className={`relative flex h-24 w-28 items-center justify-center rounded-t-full rounded-b-2xl border-2 shadow-xl ${style.coat}`}
          >
            <div className="flex gap-4">
              <span className="h-3.5 w-3.5 rounded-full bg-slate-950 ring-2 ring-white" />
              <span className="h-3.5 w-3.5 rounded-full bg-slate-950 ring-2 ring-white" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-end ${animClass} ${className}`}
      >
        {emotionIcon && (
          <span className="mb-1 rounded-full bg-slate-950/80 px-1.5 py-0.5 text-sm shadow">
            {emotionIcon}
          </span>
        )}
        <div className="relative flex flex-col items-center">
          <div className={`h-6 w-14 rounded-t-full ${style.hair}`} />
          <div className="flex h-12 w-12 items-center justify-center rounded-b-2xl border border-amber-200/40 bg-amber-100 shadow-md">
            <div className="flex gap-2.5">
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              <span className="h-2 w-2 rounded-full bg-slate-900" />
            </div>
          </div>
          <div
            className={`mt-1 flex h-28 w-20 flex-col items-center rounded-t-2xl border-2 pt-3 shadow-xl ${style.coat}`}
          >
            <span className={`h-2.5 w-8 rounded-full ${style.accent}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${animClass} ${className}`}>
      {emotionIcon && (
        <span className="absolute -top-6 rounded-full bg-slate-950/80 px-1.5 py-0.5 text-sm shadow">
          {emotionIcon}
        </span>
      )}
      <img src={cleanUrl} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}
