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

const ANIMATION_CLASS: Record<StageAnimation, string> = {
  none: '',
  bounce: 'animate-bounce',
  shake: 'animate-vn-shake',
  pulse: 'animate-pulse',
  'slide-in': 'animate-vn-slide-in',
};

const EMOTION_BADGE: Record<CharacterEmotion, { icon: string; ring: string }> = {
  neutral: { icon: '', ring: '' },
  happy: { icon: '✨', ring: 'ring-2 ring-amber-300/70' },
  angry: { icon: '💢', ring: 'ring-2 ring-rose-500/80' },
  shocked: { icon: '❗', ring: 'ring-2 ring-yellow-300/90' },
  sad: { icon: '💧', ring: 'ring-2 ring-sky-400/70' },
};


export default function StageArtwork({
  assetUrl,
  alt,
  className = '',
  emotion = 'neutral',
  animation = 'none',
}: StageArtworkProps) {
  const animCls = ANIMATION_CLASS[animation];
  const badge = EMOTION_BADGE[emotion];

  if (assetUrl.includes('bg-night-sky')) {
    return (
      <div
        aria-label={alt}
        className={`relative overflow-hidden bg-gradient-to-b from-[#090d16] to-[#1e1b4b] ${className}`}
      >
        <div className="absolute top-[14%] right-[16%] h-12 w-12 rounded-full bg-yellow-200/90 shadow-[0_0_24px_rgba(254,240,138,0.6)]" />
        <div className="absolute top-[18%] left-[18%] h-1 w-1 rounded-full bg-white" />
        <div className="absolute top-[26%] left-[40%] h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    );
  }

  if (assetUrl.includes('bg-sunset-bay')) {
    return (
      <div
        aria-label={alt}
        className={`relative overflow-hidden bg-gradient-to-b from-[#4c1d95] via-[#db2777] to-[#f59e0b] ${className}`}
      >
        <div className="absolute bottom-[28%] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-yellow-300 shadow-[0_0_32px_rgba(253,224,71,0.7)]" />
        <div className="absolute inset-x-0 bottom-0 h-[31%] bg-slate-900" />
      </div>
    );
  }

  if (assetUrl.includes('bg-forest-mist')) {
    return (
      <div
        aria-label={alt}
        className={`relative overflow-hidden bg-emerald-950 ${className}`}
      >
        <div
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          className="absolute bottom-0 left-[12%] h-[68%] w-[24%] bg-emerald-900"
        />
        <div
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          className="absolute bottom-0 left-[38%] h-[76%] w-[26%] bg-emerald-800"
        />
      </div>
    );
  }

  if (assetUrl.includes('char-hero-blue') || assetUrl.includes('char-mage-violet')) {
    const isMage = assetUrl.includes('char-mage-violet');
    return (
      <div
        aria-label={alt}
        className={`relative flex flex-col items-center justify-end ${animCls} ${className}`}
      >
        {badge.icon && (
          <span className="absolute -top-2 right-1 z-10 rounded-full bg-slate-950/90 px-1.5 py-0.5 text-sm shadow">
            {badge.icon}
          </span>
        )}
        {isMage && (
          <div
            style={{ clipPath: 'polygon(50% 0%, 10% 100%, 90% 100%)' }}
            className="-mb-2 h-[22%] w-[56%] bg-violet-700"
          />
        )}
        <div
          className={`relative h-[25%] aspect-square rounded-full shadow-md ${
            isMage ? 'bg-amber-200' : 'bg-orange-200'
          } ${badge.ring}`}
        >
          {!isMage && (
            <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-slate-800" />
          )}
        </div>
        <div
          className={`mt-1 h-[56%] w-[58%] rounded-t-3xl shadow-lg ${
            isMage ? 'bg-violet-600' : 'bg-blue-500'
          }`}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${animCls}`}>
      {badge.icon && (
        <span className="absolute -top-2 right-1 z-10 rounded-full bg-slate-950/90 px-1.5 py-0.5 text-sm shadow">
          {badge.icon}
        </span>
      )}
      <img src={assetUrl} alt={alt} className={className} />
    </div>
  );
}
