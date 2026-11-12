'use client';

import React, { useState } from 'react';
import { CircuitTile } from '@/lib/vn-schema';
import {
  CIRCUIT_THEMES,
  CircuitThemeId,
  GridDimension,
  rotateTileClockwise,
  computeEnergizedState,
} from '@/lib/vn-circuit';
import { playSynthSound } from '@/lib/vn-audio';
import CircuitTileGraphic from '@/components/shared/CircuitTileGraphic';
import { Zap, Lock, Unlock } from 'lucide-react';

interface CircuitStageOverlayProps {
  title: string;
  theme: CircuitThemeId;
  gridSize: GridDimension;
  sourceRow: number;
  targetRow: number;
  maxMoves: number;
  initialTiles: CircuitTile[];
  isMuted: boolean;
  onUnlock: () => void;
  onFailOut: () => void;
}

export default function CircuitStageOverlay({
  title,
  theme,
  gridSize,
  sourceRow,
  targetRow,
  maxMoves,
  initialTiles,
  isMuted,
  onUnlock,
  onFailOut,
}: CircuitStageOverlayProps) {
  const themeCfg = CIRCUIT_THEMES[theme] ?? CIRCUIT_THEMES.SCIFI_CIRCUIT;
  const [tiles, setTiles] = useState(initialTiles);
  const [movesUsed, setMovesUsed] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const { energizedIndices, isSolved } = computeEnergizedState(
    gridSize,
    sourceRow,
    targetRow,
    tiles
  );
  const energizedSet = new Set(energizedIndices);

  const handleRotateTile = (idx: number) => {
    if (isSolved || statusBanner) return;
    const targetTile = tiles[idx];
    if (!targetTile || targetTile.kind === 'BLOCKER') return;

    const nextTiles = [...tiles];
    nextTiles[idx] = rotateTileClockwise(targetTile);
    const nextMoves = movesUsed + 1;

    setTiles(nextTiles);
    setMovesUsed(nextMoves);

    const check = computeEnergizedState(
      gridSize,
      sourceRow,
      targetRow,
      nextTiles
    );

    if (check.isSolved) {
      setStatusBanner('CIRCUIT ENERGIZED — UNLOCKED!');
      if (!isMuted) playSynthSound('synth:chime');
      window.setTimeout(() => onUnlock(), 750);
      return;
    }

    if (maxMoves > 0 && nextMoves >= maxMoves) {
      setStatusBanner('OUT OF MOVES — CIRCUIT LOCKED!');
      if (!isMuted) playSynthSound('synth:alert');
      window.setTimeout(() => onFailOut(), 750);
    }
  };

  const rows = Array.from({ length: gridSize }, (_, i) => i);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm select-none"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl">
        <div className="flex w-full items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Zap className="h-4 w-4" /> {title}
          </span>
          <span className="font-mono text-slate-300">
            {maxMoves > 0
              ? `Moves: ${movesUsed} / ${maxMoves}`
              : `Rotations: ${movesUsed}`}
          </span>
        </div>

        {/* Board with Left Source & Right Exit Indicators */}
        <div className="flex items-center gap-1.5">
          {/* Left Power Source Column */}
          <div
            style={{ gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))` }}
            className="grid h-64 w-6 sm:h-72"
          >
            {rows.map((r) => (
              <div key={r} className="flex items-center justify-center">
                {r === sourceRow && (
                  <span
                    title="Power Source"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs text-cyan-300 ring-1 ring-cyan-400"
                  >
                    ⚡
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Circuit Grid */}
          <div
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
            className={`grid h-64 w-64 gap-1 rounded-xl border p-2 sm:h-72 sm:w-72 ${themeCfg.boardBg}`}
          >
            {tiles.map((tile, idx) => {
              const isLit = energizedSet.has(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRotateTile(idx)}
                  className={`aspect-square overflow-hidden rounded-md border transition ${
                    isLit
                      ? 'border-cyan-400/70 bg-cyan-950/30 shadow-inner'
                      : themeCfg.tileBg
                  }`}
                >
                  <CircuitTileGraphic
                    tile={tile}
                    energized={isLit}
                    activeColor={themeCfg.activeStroke}
                    inactiveColor={themeCfg.inactiveStroke}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Exit Lock Column */}
          <div
            style={{ gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))` }}
            className="grid h-64 w-6 sm:h-72"
          >
            {rows.map((r) => (
              <div key={r} className="flex items-center justify-center">
                {r === targetRow && (
                  <span
                    title="Exit Lock"
                    className={`flex h-6 w-6 items-center justify-center rounded-full ring-1 ${
                      isSolved
                        ? 'bg-emerald-500/25 text-emerald-300 ring-emerald-400'
                        : 'bg-slate-800 text-slate-400 ring-slate-600'
                    }`}
                  >
                    {isSolved ? (
                      <Unlock className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Click wire tiles to rotate them 90° and connect ⚡ to the lock!
        </p>

        {statusBanner && (
          <div
            className={`w-full rounded-lg py-1.5 text-center font-mono text-xs font-bold ${
              isSolved
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}
          >
            {statusBanner}
          </div>
        )}
      </div>
    </div>
  );
}
