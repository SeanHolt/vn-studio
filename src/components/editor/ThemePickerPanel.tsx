'use client';

import React from 'react';
import { VN_THEMES, VNThemeId } from '@/lib/vn-themes';
import { Palette, Clock } from 'lucide-react';

interface ThemePickerPanelProps {
  currentTheme: VNThemeId;
  onSelectTheme: (theme: VNThemeId) => void;
  enableClock: boolean;
  onToggleClock: (enabled: boolean) => void;
}

export default function ThemePickerPanel({
  currentTheme,
  onSelectTheme,
  enableClock,
  onToggleClock,
}: ThemePickerPanelProps) {
  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 text-xs font-bold tracking-wider text-indigo-400 uppercase">
        <Palette className="h-3.5 w-3.5" /> Game Theme &amp; Settings
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.values(VN_THEMES).map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-950/50 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className={`text-xs font-semibold ${theme.fontClass}`}>
                {theme.label}
              </span>
              <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                {theme.description}
              </span>
            </button>
          );
        })}
      </div>

      <label className="mt-1 flex cursor-pointer items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <div>
            <div className="text-xs font-semibold text-white">Day &amp; Time Clock</div>
            <div className="text-[10px] text-slate-400">
              Show Day / Morning–Night HUD &amp; lighting
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={enableClock}
          onChange={(e) => onToggleClock(e.target.checked)}
          className="h-4 w-4 accent-indigo-500"
        />
      </label>
    </div>
  );
}
