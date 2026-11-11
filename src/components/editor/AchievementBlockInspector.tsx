'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';

interface AchievementBlockInspectorProps {
  block: Extract<SceneBlock, { type: 'UNLOCK_ACHIEVEMENT' }>;
  onChange: (updated: SceneBlock) => void;
}

const ICON_PRESETS = ['🏆', '⭐', '🔑', '❤️', '🕵️', '👑', '🔥', '💎'];

export default function AchievementBlockInspector({
  block,
  onChange,
}: AchievementBlockInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Trophy Icon</span>
        <div className="flex flex-wrap gap-1.5">
          {ICON_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange({ ...block, icon: emoji })}
              className={`flex h-8 w-8 items-center justify-center rounded border text-base transition ${
                block.icon === emoji
                  ? 'border-amber-400 bg-amber-950/60'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Achievement Title</span>
        <input
          type="text"
          placeholder="e.g., Master Detective"
          value={block.title}
          onChange={(e) => {
            const nextTitle = e.target.value;
            const autoId =
              nextTitle
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '_') || block.achievementId;
            onChange({ ...block, title: nextTitle, achievementId: autoId });
          }}
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Description</span>
        <input
          type="text"
          placeholder="e.g., Found the Brass Key in the woods"
          value={block.description}
          onChange={(e) => onChange({ ...block, description: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        />
      </label>
    </div>
  );
}
