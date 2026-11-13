'use client';

import React, { useMemo, useRef, useState } from 'react';
import { SceneBlock, HotspotZone } from '@/lib/vn-schema';
import { VN_THEMES, VNThemeId } from '@/lib/vn-themes';
import StageArtwork from '@/components/shared/StageArtwork';
import StageFxOverlay, {
  WeatherType,
  WeatherIntensity,
} from '@/components/shared/StageFxOverlay';
import { Eye, Sparkles, MousePointer2 } from 'lucide-react';

interface LiveStagePreviewProps {
  blocks: SceneBlock[];
  selectedBlockId: string | null;
  theme: VNThemeId;
  onUpdateBlock?: (updated: SceneBlock) => void;
}

interface StagedChar {
  name: string;
  spriteUrl: string;
  position: 'left' | 'center' | 'right';
}

interface DragSession {
  mode: 'DRAW_NEW' | 'MOVE_EXISTING';
  startX: number;
  startY: number;
  currX: number;
  currY: number;
  zoneId?: string;
  origX?: number;
  origY?: number;
}

export default function LiveStagePreview({
  blocks,
  selectedBlockId,
  theme,
  onUpdateBlock,
}: LiveStagePreviewProps) {
  const themeCfg = VN_THEMES[theme] ?? VN_THEMES.MODERN;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;
  const activeHotspotBlock =
    selectedBlock?.type === 'HOTSPOT_ROOM' ? selectedBlock : null;

  const previewState = useMemo(() => {
    let bgUrl = 'css:starry-night';
    let speaker = '';
    let dialogueText = '';
    let activeHotspots: HotspotZone[] = [];
    let weather: WeatherType = 'CLEAR';
    let intensity: WeatherIntensity = 'NORMAL';
    const chars: Record<string, StagedChar> = {};

    const stopIndex = selectedBlockId
      ? blocks.findIndex((b) => b.id === selectedBlockId)
      : blocks.length - 1;
    const limit = stopIndex >= 0 ? stopIndex : blocks.length - 1;

    for (let i = 0; i <= limit; i += 1) {
      const blk = blocks.at(i);
      if (!blk) continue;

      if (blk.type === 'BACKGROUND') {
        bgUrl = blk.assetUrl;
      } else if (blk.type === 'WEATHER_FX') {
        weather = blk.weather;
        intensity = blk.intensity;
      } else if (blk.type === 'CHARACTER') {
        if (blk.action === 'exit') {
          delete chars[blk.name];
        } else {
          chars[blk.name] = {
            name: blk.name,
            spriteUrl: blk.spriteUrl,
            position: blk.position,
          };
        }
      } else if (blk.type === 'DIALOGUE') {
        speaker = blk.speaker;
        dialogueText = blk.text;
      } else if (blk.type === 'HOTSPOT_ROOM') {
        bgUrl = blk.backgroundUrl;
        activeHotspots = blk.hotspots;
      }
    }

    return {
      bgUrl,
      speaker,
      dialogueText,
      activeHotspots,
      weather,
      intensity,
      chars: Object.values(chars),
    };
  }, [blocks, selectedBlockId]);

  const getStagePercent = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return { x: 0, y: 0 };
    }
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.round(Math.min(100, Math.max(0, rawX))),
      y: Math.round(Math.min(100, Math.max(0, rawY))),
    };
  };

  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeHotspotBlock || !onUpdateBlock) return;
    const pt = getStagePercent(e.clientX, e.clientY);
    setDragSession({
      mode: 'DRAW_NEW',
      startX: pt.x,
      startY: pt.y,
      currX: pt.x,
      currY: pt.y,
    });
  };

  const handleZoneMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    zone: HotspotZone
  ) => {
    if (!activeHotspotBlock || !onUpdateBlock) return;
    e.stopPropagation();
    const pt = getStagePercent(e.clientX, e.clientY);
    setDragSession({
      mode: 'MOVE_EXISTING',
      startX: pt.x,
      startY: pt.y,
      currX: pt.x,
      currY: pt.y,
      zoneId: zone.id,
      origX: zone.x,
      origY: zone.y,
    });
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragSession || !activeHotspotBlock || !onUpdateBlock) return;
    const pt = getStagePercent(e.clientX, e.clientY);

    if (dragSession.mode === 'DRAW_NEW') {
      setDragSession({ ...dragSession, currX: pt.x, currY: pt.y });
      return;
    }

    if (
      dragSession.mode === 'MOVE_EXISTING' &&
      dragSession.zoneId &&
      dragSession.origX !== undefined &&
      dragSession.origY !== undefined
    ) {
      const dx = pt.x - dragSession.startX;
      const dy = pt.y - dragSession.startY;
      const nextHotspots = activeHotspotBlock.hotspots.map((hz) => {
        if (hz.id !== dragSession.zoneId) return hz;
        const clampedX = Math.min(
          100 - hz.width,
          Math.max(0, (dragSession.origX ?? 0) + dx)
        );
        const clampedY = Math.min(
          100 - hz.height,
          Math.max(0, (dragSession.origY ?? 0) + dy)
        );
        return { ...hz, x: clampedX, y: clampedY };
      });
      onUpdateBlock({ ...activeHotspotBlock, hotspots: nextHotspots });
    }
  };

  const handleStageMouseUp = () => {
    if (!dragSession || !activeHotspotBlock || !onUpdateBlock) {
      setDragSession(null);
      return;
    }

    if (dragSession.mode === 'DRAW_NEW') {
      const left = Math.min(dragSession.startX, dragSession.currX);
      const top = Math.min(dragSession.startY, dragSession.currY);
      const width = Math.abs(dragSession.currX - dragSession.startX);
      const height = Math.abs(dragSession.currY - dragSession.startY);

      if (width >= 5 && height >= 5) {
        const newZone: HotspotZone = {
          id: `hz_${crypto.randomUUID()}`,
          label: `Zone ${activeHotspotBlock.hotspots.length + 1}`,
          x: left,
          y: top,
          width: Math.min(95, width),
          height: Math.min(95, height),
          actionType: 'INSPECT',
          dialogueText: 'You inspect the area closely.',
        };
        onUpdateBlock({
          ...activeHotspotBlock,
          hotspots: [...activeHotspotBlock.hotspots, newZone],
        });
      }
    }

    setDragSession(null);
  };
  const posClass = (pos: 'left' | 'center' | 'right') => {
    if (pos === 'left') return 'left-6';
    if (pos === 'right') return 'right-6';
    return 'left-1/2 -translate-x-1/2';
  };

  const draftRect =
    dragSession?.mode === 'DRAW_NEW'
      ? {
          left: Math.min(dragSession.startX, dragSession.currX),
          top: Math.min(dragSession.startY, dragSession.currY),
          width: Math.abs(dragSession.currX - dragSession.startX),
          height: Math.abs(dragSession.currY - dragSession.startY),
        }
      : null;

  return (
    <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
          <Eye className="h-3.5 w-3.5" /> Live Stage Preview
        </span>

        {activeHotspotBlock ? (
          <span className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-950/60 px-2 py-0.5 font-medium text-amber-300">
            <MousePointer2 className="h-3 w-3" /> Drag on stage to draw or move
            hotspots!
          </span>
        ) : (
          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
            <Sparkles className="h-3 w-3 text-indigo-400" /> {themeCfg.label}
          </span>
        )}
      </div>

      <div
        ref={stageRef}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
        className={`relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 select-none ${
          themeCfg.fontClass
        } ${activeHotspotBlock ? 'cursor-crosshair' : ''}`}
      >
        <StageArtwork
          assetUrl={previewState.bgUrl}
          alt="Stage Preview"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <StageFxOverlay
          weather={previewState.weather}
          intensity={previewState.intensity}
        />

        {previewState.chars.map((char) => (
          <div
            key={char.name}
            className={`pointer-events-none absolute bottom-14 z-10 h-28 w-20 transition-all ${posClass(
              char.position
            )}`}
          >
            <StageArtwork
              assetUrl={char.spriteUrl}
              alt={char.name}
              className="h-full w-full object-contain"
            />
          </div>
        ))}

        {previewState.activeHotspots.map((hz) => (
          <div
            key={hz.id}
            onMouseDown={(e) => handleZoneMouseDown(e, hz)}
            style={{
              left: `${hz.x}%`,
              top: `${hz.y}%`,
              width: `${hz.width}%`,
              height: `${hz.height}%`,
            }}
            className={`absolute z-10 flex items-center justify-center rounded border-2 border-dashed border-amber-400 bg-amber-500/20 text-[9px] font-bold text-amber-100 shadow ${
              activeHotspotBlock ? 'cursor-move hover:bg-amber-500/35' : ''
            }`}
          >
            <span className="truncate px-1">{hz.label}</span>
          </div>
        ))}

        {draftRect && draftRect.width > 1 && draftRect.height > 1 && (
          <div
            style={{
              left: `${draftRect.left}%`,
              top: `${draftRect.top}%`,
              width: `${draftRect.width}%`,
              height: `${draftRect.height}%`,
            }}
            className="pointer-events-none absolute z-20 rounded border-2 border-emerald-400 bg-emerald-500/25"
          />
        )}

        {previewState.dialogueText && !activeHotspotBlock && (
          <div
            className={`pointer-events-none absolute inset-x-3 bottom-2 z-20 rounded-lg border p-2.5 backdrop-blur-md ${themeCfg.dialogueBoxClass}`}
          >
            {previewState.speaker && (
              <div
                className={`mb-0.5 text-[10px] font-bold ${themeCfg.speakerClass}`}
              >
                {previewState.speaker}
              </div>
            )}
            <p className="line-clamp-2 text-xs leading-snug text-slate-100">
              {previewState.dialogueText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
