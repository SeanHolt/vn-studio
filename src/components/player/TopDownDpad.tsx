'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TopDownDpadProps {
  onMove: (dx: number, dy: number) => void;
}

export default function TopDownDpad({ onMove }: TopDownDpadProps) {
  return (
    <div className="absolute right-4 bottom-16 z-20 grid grid-cols-3 gap-1 rounded-xl border border-slate-700/80 bg-slate-950/85 p-1.5 backdrop-blur-sm">
      <div />
      <button
        type="button"
        aria-label="Move Up"
        onClick={() => onMove(0, -1)}
        className="rounded bg-slate-800 p-1.5 text-white hover:bg-indigo-600"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <div />

      <button
        type="button"
        aria-label="Move Left"
        onClick={() => onMove(-1, 0)}
        className="rounded bg-slate-800 p-1.5 text-white hover:bg-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Move Down"
        onClick={() => onMove(0, 1)}
        className="rounded bg-slate-800 p-1.5 text-white hover:bg-indigo-600"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Move Right"
        onClick={() => onMove(1, 0)}
        className="rounded bg-slate-800 p-1.5 text-white hover:bg-indigo-600"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
