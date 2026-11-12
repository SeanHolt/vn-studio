'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSynthSound } from '@/lib/vn-audio';
import { Zap } from 'lucide-react';

interface QteStageOverlayProps {
  promptText: string;
  speed: 'SLOW' | 'NORMAL' | 'FAST';
  zoneStart: number;
  zoneWidth: number;
  isMuted: boolean;
  onComplete: (succeeded: boolean) => void;
}

const SPEED_STEP: Record<'SLOW' | 'NORMAL' | 'FAST', number> = {
  SLOW: 0.9,
  NORMAL: 1.55,
  FAST: 2.35,
};

export default function QteStageOverlay({
  promptText,
  speed,
  zoneStart,
  zoneWidth,
  isMuted,
  onComplete,
}: QteStageOverlayProps) {
  const [cursorPos, setCursorPos] = useState(0);
  const [lockedResult, setLockedResult] = useState<'HIT' | 'MISS' | null>(null);

  const posRef = useRef(0);
  const dirRef = useRef(1);
  const lockedRef = useRef(false);

  const zoneEnd = Math.min(98, zoneStart + zoneWidth);

  const triggerLock = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    const current = posRef.current;
    const isHit = current >= zoneStart && current <= zoneEnd;

    setLockedResult(isHit ? 'HIT' : 'MISS');
    if (!isMuted) {
      playSynthSound(isHit ? 'synth:chime' : 'synth:alert');
    }

    window.setTimeout(() => {
      onComplete(isHit);
    }, 650);
  }, [zoneStart, zoneEnd, isMuted, onComplete]);

  useEffect(() => {
    let frameId = 0;
    const step = SPEED_STEP[speed] ?? 1.55;

    const tick = () => {
      if (lockedRef.current) return;

      let next = posRef.current + dirRef.current * step;
      if (next >= 100) {
        next = 100;
        dirRef.current = -1;
      } else if (next <= 0) {
        next = 0;
        dirRef.current = 1;
      }

      posRef.current = next;
      setCursorPos(next);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [speed]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        triggerLock();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerLock]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        triggerLock();
      }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm select-none"
    >
      <div className="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-amber-500/40 bg-slate-900 p-6 text-center shadow-2xl">
        <div className="mx-auto flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/50 px-3 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase">
          <Zap className="h-3.5 w-3.5" /> Reflex Challenge
        </div>

        <h3 className="text-lg font-bold text-white">{promptText}</h3>

        {/* Sliding Timing Bar */}
        <div className="relative h-9 w-full overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-950 p-1">
          {/* Green Target Zone */}
          <div
            style={{
              left: `${zoneStart}%`,
              width: `${zoneWidth}%`,
            }}
            className="absolute inset-y-0 border-x-2 border-emerald-400 bg-emerald-500/35"
          />

          {/* Moving Marker */}
          <div
            style={{ left: `calc(${cursorPos}% - 4px)` }}
            className="absolute inset-y-0 w-2 rounded-full bg-white shadow-[0_0_12px_#ffffff]"
          />
        </div>

        {lockedResult === null ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerLock();
            }}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-amber-400"
          >
            STRIKE NOW! (or Press SPACE)
          </button>
        ) : (
          <div
            className={`rounded-xl py-2.5 text-sm font-extrabold tracking-wide uppercase ${
              lockedResult === 'HIT'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}
          >
            {lockedResult === 'HIT' ? 'PERFECT TIMING!' : 'MISSED THE ZONE!'}
          </div>
        )}
      </div>
    </div>
  );
}
