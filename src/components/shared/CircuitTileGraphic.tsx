'use client';

import React from 'react';
import { CircuitTile } from '@/lib/vn-schema';
import { getTilePorts } from '@/lib/vn-circuit';

interface CircuitTileGraphicProps {
  tile: CircuitTile;
  energized: boolean;
  activeColor: string;
  inactiveColor: string;
}

export default function CircuitTileGraphic({
  tile,
  energized,
  activeColor,
  inactiveColor,
}: CircuitTileGraphicProps) {
  if (tile.kind === 'BLOCKER') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950/90 text-xs text-slate-700">
        ■
      </div>
    );
  }

  const ports = getTilePorts(tile);
  const stroke = energized ? activeColor : inactiveColor;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {ports.top && (
        <line
          x1="50"
          y1="0"
          x2="50"
          y2="50"
          stroke={stroke}
          strokeWidth="16"
          strokeLinecap="round"
        />
      )}
      {ports.right && (
        <line
          x1="50"
          y1="50"
          x2="100"
          y2="50"
          stroke={stroke}
          strokeWidth="16"
          strokeLinecap="round"
        />
      )}
      {ports.bottom && (
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="100"
          stroke={stroke}
          strokeWidth="16"
          strokeLinecap="round"
        />
      )}
      {ports.left && (
        <line
          x1="0"
          y1="50"
          x2="50"
          y2="50"
          stroke={stroke}
          strokeWidth="16"
          strokeLinecap="round"
        />
      )}
      <circle cx="50" cy="50" r="12" fill={stroke} />
    </svg>
  );
}
