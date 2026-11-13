'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TopDownEntity } from '@/lib/vn-schema';
import { playSynthSound } from '@/lib/vn-audio';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TopDownStageOverlayProps {
  mapTheme: 'GRASSLAND' | 'DUNGEON' | 'CASTLE' | 'SPACE';
  playerIcon: string;
  spawnX: number;
  spawnY: number;
  walls: string[];
  entities: TopDownEntity[];
  inventory: string[];
  isMuted: boolean;
  onGiveItem: (itemName: string) => void;
  onJumpScene: (targetSceneId: string) => void;
}

const BIOME_STYLES: Record<
  'GRASSLAND' | 'DUNGEON' | 'CASTLE' | 'SPACE',
  { floor: string; wall: string; label: string }
> = {
  GRASSLAND: {
    floor: 'bg-emerald-950/90 border-emerald-900/40',
    wall: 'bg-emerald-800 border-emerald-600 text-emerald-200',
    label: '🌲',
  },
  DUNGEON: {
    floor: 'bg-stone-900/95 border-stone-800/50',
    wall: 'bg-stone-700 border-stone-500 text-stone-300',
    label: '🧱',
  },
  CASTLE: {
    floor: 'bg-indigo-950/90 border-indigo-900/50',
    wall: 'bg-slate-700 border-amber-500/40 text-amber-200',
    label: '🏰',
  },
  SPACE: {
    floor: 'bg-slate-900/95 border-cyan-950/50',
    wall: 'bg-slate-700 border-cyan-500/40 text-cyan-300',
    label: '🔩',
  },
};

export default function TopdownStageOverlay({
  mapTheme,
  playerIcon,
  spawnX,
  spawnY,
  walls,
  entities,
  inventory,
  isMuted,
  onGiveItem,
  onJumpScene,
}: TopDownStageOverlayProps) {
  const [pos, setPos] = useState({ x: spawnX, y: spawnY });
  const [openedChestIds, setOpenedChestIds] = useState<string[]>([]);
  const [activatedSwitchIds, setActivatedSwitchIds] = useState<string[]>([]);
  const [openedWallKeys, setOpenedWallKeys] = useState<string[]>([]);
  const [patrolTick, setPatrolTick] = useState(0);
  const [bannerText, setBannerText] = useState<string | null>(
    'Use Arrow Keys / WASD to explore!'
  );

  const biome = BIOME_STYLES[mapTheme] ?? BIOME_STYLES.GRASSLAND;

  const getPatrolCoords = (ent: TopDownEntity, tick: number) => {
    const range = ent.patrolRange ?? 2;
    const cycle = range * 2;
    const step = tick % cycle;
    const offset = step <= range ? step : cycle - step;
    if (ent.patrolAxis === 'H') {
      return { x: Math.min(11, ent.x + offset), y: ent.y };
    }
    return { x: ent.x, y: Math.min(7, ent.y + offset) };
  };

  useEffect(() => {
    const hasPatrols = entities.some((e) => e.kind === 'PATROL');
    if (!hasPatrols) return;

    const timer = window.setInterval(() => {
      setPatrolTick((prev) => prev + 1);
    }, 650);

    return () => window.clearInterval(timer);
  }, [entities]);

  const handlePatrolCollision = (patrolEnt: TopDownEntity) => {
    if (!isMuted) playSynthSound('synth:alert');
    setBannerText(
      patrolEnt.dialogueText || `${patrolEnt.label} spotted you!`
    );
    if (patrolEnt.targetSceneId) {
      window.setTimeout(() => onJumpScene(patrolEnt.targetSceneId!), 550);
    } else {
      setPos({ x: spawnX, y: spawnY });
    }
  };

  const tryMove = (dx: number, dy: number) => {
    const nx = Math.min(11, Math.max(0, pos.x + dx));
    const ny = Math.min(7, Math.max(0, pos.y + dy));
    const key = `${nx},${ny}`;

    if (walls.includes(key) && !openedWallKeys.includes(key)) {
      return;
    }

    const hitPatrol = entities.find((e) => {
      if (e.kind !== 'PATROL') return false;
      const pPos = getPatrolCoords(e, patrolTick);
      return pPos.x === nx && pPos.y === ny;
    });

    if (hitPatrol) {
      handlePatrolCollision(hitPatrol);
      return;
    }

    const hitEntity = entities.find(
      (e) => e.kind !== 'PATROL' && e.x === nx && e.y === ny
    );

    if (hitEntity) {
      if (hitEntity.kind === 'DOOR') {
        if (
          hitEntity.requiredItem &&
          !inventory.includes(hitEntity.requiredItem)
        ) {
          if (!isMuted) playSynthSound('synth:alert');
          setBannerText(
            `🔒 Locked! Requires "${hitEntity.requiredItem}" in your Backpack.`
          );
          return;
        }
        setPos({ x: nx, y: ny });
        if (!isMuted) playSynthSound('synth:chime');
        if (hitEntity.targetSceneId) {
          onJumpScene(hitEntity.targetSceneId);
        }
        return;
      }

      if (hitEntity.kind === 'SWITCH') {
        setPos({ x: nx, y: ny });
        if (!activatedSwitchIds.includes(hitEntity.id)) {
          setActivatedSwitchIds((prev) => [...prev, hitEntity.id]);
          const coords = (hitEntity.switchTargetCoords ?? '')
            .split(/\s+/)
            .map((c) => c.trim())
            .filter(Boolean);
          setOpenedWallKeys((prev) => Array.from(new Set([...prev, ...coords])));
          if (!isMuted) playSynthSound('synth:chime');
          setBannerText(
            hitEntity.dialogueText || 'Click! A hidden barrier slid open!'
          );
        }
        return;
      }

      if (hitEntity.kind === 'CHEST') {
        setPos({ x: nx, y: ny });
        if (!openedChestIds.includes(hitEntity.id)) {
          setOpenedChestIds((prev) => [...prev, hitEntity.id]);
          if (hitEntity.itemName) onGiveItem(hitEntity.itemName);
          if (!isMuted) playSynthSound('synth:pickup');
          setBannerText(
            hitEntity.dialogueText ||
              `Found ${hitEntity.itemName ?? 'treasure'}!`
          );
        } else {
          setBannerText('This chest is already empty.');
        }
        return;
      }

      setBannerText(hitEntity.dialogueText || `${hitEntity.label} greets you.`);
      return;
    }

    setPos({ x: nx, y: ny });
  };

  const moveRef = useRef(tryMove);
  useEffect(() => {
    moveRef.current = tryMove;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveRef.current(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveRef.current(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveRef.current(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveRef.current(1, 0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const cols = Array.from({ length: 12 }, (_, x) => x);
  const rows = Array.from({ length: 8 }, (_, y) => y);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-between bg-slate-950/90 p-3 select-none"
    >
      {/* Top Status Banner */}
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-2 text-center text-xs font-medium text-amber-200 shadow">
        {bannerText}
      </div>

      {/* 12x8 Playable Map Grid */}
      <div className="my-1 grid aspect-[12/8] w-full max-w-2xl grid-cols-12 gap-0.5 rounded-xl border-2 border-slate-700 bg-slate-950 p-1.5 shadow-2xl">
        {rows.map((y) =>
          cols.map((x) => {
            const key = `${x},${y}`;
            const isWall =
              walls.includes(key) && !openedWallKeys.includes(key);
            const isPlayer = pos.x === x && pos.y === y;

            const patrolHere = entities.find((e) => {
              if (e.kind !== 'PATROL') return false;
              const pPos = getPatrolCoords(e, patrolTick);
              return pPos.x === x && pPos.y === y;
            });

            const staticEnt = entities.find(
              (e) => e.kind !== 'PATROL' && e.x === x && e.y === y
            );

            let cellIcon = '';
            if (isPlayer) {
              cellIcon = playerIcon;
            } else if (patrolHere) {
              cellIcon = patrolHere.icon;
            } else if (staticEnt) {
              if (
                staticEnt.kind === 'CHEST' &&
                openedChestIds.includes(staticEnt.id)
              ) {
                cellIcon = '📭';
              } else if (
                staticEnt.kind === 'SWITCH' &&
                activatedSwitchIds.includes(staticEnt.id)
              ) {
                cellIcon = '🟢';
              } else if (
                staticEnt.kind === 'DOOR' &&
                staticEnt.requiredItem &&
                !inventory.includes(staticEnt.requiredItem)
              ) {
                cellIcon = '🔒';
              } else {
                cellIcon = staticEnt.icon;
              }
            } else if (isWall) {
              cellIcon = biome.label;
            }

            return (
              <div
                key={key}
                className={`flex items-center justify-center rounded border text-base sm:text-xl ${
                  isWall ? biome.wall : biome.floor
                }`}
              >
                {cellIcon}
              </div>
            );
          })
        )}
      </div>

      {/* On-Screen D-Pad */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => tryMove(-1, 0)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => tryMove(0, -1)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => tryMove(0, 1)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => tryMove(1, 0)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
