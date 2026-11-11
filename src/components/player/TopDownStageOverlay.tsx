'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TopDownEntity } from '@/lib/vn-schema';
import {
  TopDownThemeId,
  MAP_COLS,
  MAP_ROWS,
  tileKey,
  buildMapTiles,
} from '@/lib/vn-topdown';
import TopDownDpad from './TopDownDpad';

interface TopDownStageOverlayProps {
  mapTheme: TopDownThemeId;
  playerIcon: string;
  spawnX: number;
  spawnY: number;
  walls: string[];
  entities: TopDownEntity[];
  inventory: string[];
  onCollectItem: (itemName: string) => void;
  onJumpScene: (targetSceneId: string) => void;
}

export default function TopDownStageOverlay({
  mapTheme,
  playerIcon,
  spawnX,
  spawnY,
  walls,
  entities,
  inventory,
  onCollectItem,
  onJumpScene,
}: TopDownStageOverlayProps) {
  const [posX, setPosX] = useState(spawnX);
  const [posY, setPosY] = useState(spawnY);
  const [openedChestIds, setOpenedChestIds] = useState(['']);
  const [bannerText, setBannerText] = useState(
    'Use Arrow Keys or WASD to move and interact!'
  );

  const handleEntityInteract = useCallback(
    (entity: TopDownEntity) => {
      if (entity.requiredItem && !inventory.includes(entity.requiredItem)) {
        setBannerText(
          `${entity.label}: Locked! Requires "${entity.requiredItem}".`
        );
        return;
      }

      if (entity.kind === 'CHEST') {
        if (openedChestIds.includes(entity.id)) {
          setBannerText(`${entity.label} is empty.`);
          return;
        }
        setOpenedChestIds((prev) => [...prev, entity.id]);
        if (entity.itemName) {
          onCollectItem(entity.itemName);
          setBannerText(
            entity.dialogueText ||
              `Opened ${entity.label} and found ${entity.itemName}!`
          );
        } else {
          setBannerText(entity.dialogueText || `Opened ${entity.label}!`);
        }
        return;
      }

      if (
        (entity.kind === 'DOOR' || entity.kind === 'NPC') &&
        entity.targetSceneId
      ) {
        onJumpScene(entity.targetSceneId);
        return;
      }

      setBannerText(
        entity.dialogueText
          ? `${entity.label}: "${entity.dialogueText}"`
          : `You inspect ${entity.label}.`
      );
    },
    [inventory, openedChestIds, onCollectItem, onJumpScene]
  );

  const tryMove = useCallback(
    (dx: number, dy: number) => {
      const nextX = posX + dx;
      const nextY = posY + dy;

      const outOfBounds =
        nextX === -1 ||
        nextX === MAP_COLS ||
        nextY === -1 ||
        nextY === MAP_ROWS;

      if (outOfBounds || walls.includes(tileKey(nextX, nextY))) {
        return;
      }

      const hitEntity = entities.find((e) => e.x === nextX && e.y === nextY);
      if (hitEntity) {
        handleEntityInteract(hitEntity);
        if (hitEntity.kind !== 'DOOR') {
          return;
        }
      }

      setPosX(nextX);
      setPosY(nextY);
    },
    [posX, posY, walls, entities, handleEntityInteract]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        tryMove(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        tryMove(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        tryMove(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        tryMove(1, 0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tryMove]);

  const tiles = buildMapTiles(
    mapTheme,
    playerIcon,
    posX,
    posY,
    walls,
    entities,
    openedChestIds
  );

  const tileNodes = tiles.map((tile) =>
    React.createElement(
      'div',
      { key: tile.key, title: tile.title, className: tile.className },
      tile.symbol
    )
  );

  return React.createElement(
    'div',
    {
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      className:
        'absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-3 select-none',
    },
    React.createElement(
      'div',
      {
        style: {
          gridTemplateColumns: `repeat(${MAP_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${MAP_ROWS}, minmax(0, 1fr))`,
        },
        className:
          'grid h-full w-full overflow-hidden rounded-lg border border-slate-700',
      },
      ...tileNodes
    ),
    React.createElement(TopDownDpad, { onMove: tryMove }),
    bannerText
      ? React.createElement(
          'div',
          {
            onClick: () => setBannerText(''),
            className:
              'absolute inset-x-4 bottom-3 z-20 flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-950/95 px-4 py-2 text-xs text-slate-100 shadow-lg',
          },
          React.createElement('span', null, bannerText),
          React.createElement(
            'span',
            { className: 'text-[10px] text-slate-400' },
            'Click to hide'
          )
        )
      : null
  );
}
