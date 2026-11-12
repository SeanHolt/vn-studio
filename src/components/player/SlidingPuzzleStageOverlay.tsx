'use client';

import React, { useState } from 'react';
import {
  SlidingGridSize,
  RuneThemeId,
  createShuffledBoard,
  getAdjacentIndices,
  isSlidingBoardSolved,
  getRuneLabel,
} from '@/lib/vn-sliding-puzzle';
import { playSynthSound } from '@/lib/vn-audio';
import { Grid, Eye, RotateCcw } from 'lucide-react';

interface SlidingPuzzleStageOverlayProps {
  title: string;
  gridSize: SlidingGridSize;
  puzzleMode: 'IMAGE' | 'RUNES';
  imageUrl: string;
  runeTheme: RuneThemeId;
  maxMoves: number;
  isMuted: boolean;
  onUnlock: () => void;
  onFailOut: () => void;
}

const FALLBACK_SEAL_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' viewBox='0 0 300 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23312e81'/><stop offset='50%' stop-color='%230ea5e9'/><stop offset='100%' stop-color='%2310b981'/></linearGradient></defs><rect width='300' height='300' fill='url(%23g)'/><circle cx='150' cy='150' r='115' fill='none' stroke='%23fde047' stroke-width='8'/><polygon points='150,45 245,210 55,210' fill='none' stroke='%23ffffff' stroke-width='6'/><circle cx='150' cy='150' r='36' fill='%23f59e0b'/></svg>";

export default function SlidingPuzzleStageOverlay({
  title,
  gridSize,
  puzzleMode,
  imageUrl,
  runeTheme,
  maxMoves,
  isMuted,
  onUnlock,
  onFailOut,
}: SlidingPuzzleStageOverlayProps) {
  const [board, setBoard] = useState(() => createShuffledBoard(gridSize));
  const [movesUsed, setMovesUsed] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const emptyValue = gridSize * gridSize - 1;
  const resolvedImg =
    imageUrl && !imageUrl.startsWith('css:') ? imageUrl : FALLBACK_SEAL_SVG;

  const handleTileClick = (clickedIdx: number) => {
    if (statusBanner || isPeeking) return;

    const emptyIdx = board.indexOf(emptyValue);
    const neighbors = getAdjacentIndices(emptyIdx, gridSize);
    if (!neighbors.includes(clickedIdx)) return;

    const nextBoard = [...board];
    const movedTile = nextBoard[clickedIdx] ?? 0;
    nextBoard[emptyIdx] = movedTile;
    nextBoard[clickedIdx] = emptyValue;

    const nextMoves = movesUsed + 1;
    setBoard(nextBoard);
    setMovesUsed(nextMoves);

    if (isSlidingBoardSolved(nextBoard)) {
      setStatusBanner('SEAL RESTORED — UNLOCKED!');
      if (!isMuted) playSynthSound('synth:chime');
      window.setTimeout(() => onUnlock(), 750);
      return;
    }

    if (maxMoves > 0 && nextMoves >= maxMoves) {
      setStatusBanner('OUT OF MOVES — SEAL LOCKED!');
      if (!isMuted) playSynthSound('synth:alert');
      window.setTimeout(() => onFailOut(), 750);
    }
  };

  const displayBoard = isPeeking
    ? Array.from({ length: gridSize * gridSize }, (_, i) => i)
    : board;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm select-none"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl">
        <div className="flex w-full items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-bold text-amber-300">
            <Grid className="h-4 w-4" /> {title}
          </span>
          <span className="font-mono text-slate-300">
            {maxMoves > 0
              ? `Slides: ${movesUsed} / ${maxMoves}`
              : `Slides: ${movesUsed}`}
          </span>
        </div>

        {/* Sliding Grid */}
        <div
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
          className="grid h-64 w-64 gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1.5 sm:h-72 sm:w-72"
        >
          {displayBoard.map((tileId, slotIdx) => {
            const isEmptySlot = tileId === emptyValue && !isPeeking;
            if (isEmptySlot) {
              return (
                <div
                  key={slotIdx}
                  className="rounded-lg border border-dashed border-slate-800 bg-slate-950/60"
                />
              );
            }

            const origRow = Math.floor(tileId / gridSize);
            const origCol = tileId % gridSize;
            const posX =
              gridSize > 1 ? (origCol / (gridSize - 1)) * 100 : 0;
            const posY =
              gridSize > 1 ? (origRow / (gridSize - 1)) * 100 : 0;
            const inRightSpot = tileId === slotIdx;

            if (puzzleMode === 'IMAGE') {
              return (
                <button
                  key={slotIdx}
                  type="button"
                  onClick={() => handleTileClick(slotIdx)}
                  style={{
                    backgroundImage: `url("${resolvedImg}")`,
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: `${posX}% ${posY}%`,
                  }}
                  className={`relative overflow-hidden rounded-lg border transition-transform hover:scale-[1.02] ${
                    inRightSpot
                      ? 'border-emerald-400/70'
                      : 'border-slate-700'
                  }`}
                >
                  <span className="absolute right-1 bottom-0.5 rounded bg-slate-950/75 px-1 font-mono text-[9px] text-slate-300">
                    {tileId + 1}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={slotIdx}
                type="button"
                onClick={() => handleTileClick(slotIdx)}
                className={`flex items-center justify-center rounded-lg border font-bold transition ${
                  inRightSpot
                    ? 'border-emerald-400/70 bg-emerald-950/40 text-emerald-200'
                    : 'border-purple-500/40 bg-indigo-950/50 text-purple-200 hover:border-purple-400'
                } ${gridSize === 5 ? 'text-sm' : 'text-lg sm:text-xl'}`}
              >
                {getRuneLabel(tileId, runeTheme)}
              </button>
            );
          })}
        </div>

        {/* Helper Controls */}
        <div className="flex w-full items-center justify-between gap-2">
          <button
            type="button"
            onMouseDown={() => setIsPeeking(true)}
            onMouseUp={() => setIsPeeking(false)}
            onMouseLeave={() => setIsPeeking(false)}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
          >
            <Eye className="h-3 w-3 text-sky-400" /> Hold to Peek Goal
          </button>

          <button
            type="button"
            onClick={() => {
              setBoard(createShuffledBoard(gridSize));
              setMovesUsed(0);
              setStatusBanner(null);
            }}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Reshuffle
          </button>
        </div>

        {statusBanner && (
          <div
            className={`w-full rounded-lg border py-1.5 text-center font-mono text-xs font-bold ${
              isSlidingBoardSolved(board)
                ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/80 text-rose-300'
            }`}
          >
            {statusBanner}
          </div>
        )}
      </div>
    </div>
  );
}
