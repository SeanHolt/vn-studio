'use client';

import React, { useState } from 'react';
import { HotspotZone } from '@/lib/vn-schema';
import StageArtwork from '@/components/shared/StageArtwork';
import { Search, Lock } from 'lucide-react';

interface HotspotStageOverlayProps {
  backgroundUrl: string;
  promptText: string;
  hotspots: HotspotZone[];
  inventory: string[];
  onTriggerHotspot: (zone: HotspotZone) => string | null;
}

export default function HotspotStageOverlay({
  backgroundUrl,
  promptText,
  hotspots,
  inventory,
  onTriggerHotspot,
}: HotspotStageOverlayProps) {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleZoneClick = (zone: HotspotZone) => {
    if (zone.requiredItem && !inventory.includes(zone.requiredItem)) {
      setFeedbackMsg(`Locked! You need "${zone.requiredItem}" to interact with ${zone.label}.`);
      return;
    }

    const message = onTriggerHotspot(zone);
    if (message) {
      setFeedbackMsg(message);
    }
  };

  return (
    <div className="absolute inset-0 z-10 select-none">
      {backgroundUrl && (
        <StageArtwork
          assetUrl={backgroundUrl}
          alt="Sandbox room"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Top Exploration Prompt */}
      <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-slate-700/80 bg-slate-950/85 px-4 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
        {promptText}
      </div>

      {/* Clickable Hotspot Regions */}
      {hotspots.map((zone) => {
        const isLocked = Boolean(zone.requiredItem && !inventory.includes(zone.requiredItem));
        return (
          <button
            key={zone.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleZoneClick(zone);
            }}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
            className="group absolute flex items-center justify-center rounded-lg border-2 border-dashed border-amber-400/50 bg-amber-400/10 transition hover:border-amber-300 hover:bg-amber-400/25"
          >
            <span className="flex items-center gap-1 rounded bg-slate-950/90 px-2 py-0.5 text-[11px] font-semibold text-amber-200 opacity-0 shadow transition group-hover:opacity-100">
              {isLocked ? <Lock className="h-3 w-3 text-rose-400" /> : <Search className="h-3 w-3" />}
              {zone.label}
            </span>
          </button>
        );
      })}

      {/* Bottom Inspection Feedback Banner */}
      {feedbackMsg && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setFeedbackMsg(null);
          }}
          className="absolute inset-x-4 bottom-4 z-20 cursor-pointer rounded-xl border border-amber-500/40 bg-slate-950/95 p-4 shadow-xl backdrop-blur-md"
        >
          <p className="text-sm text-slate-100">{feedbackMsg}</p>
          <div className="mt-1 text-right text-[11px] text-slate-400">Click to dismiss</div>
        </div>
      )}
    </div>
  );
}
