'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import {
  WeatherType,
  WeatherIntensity,
  CameraEffectType,
} from '@/components/shared/StageFxOverlay';

interface StageFxInspectorProps {
  block: Extract<SceneBlock, { type: 'WEATHER_FX' | 'CAMERA_FX' }>;
  onChange: (updated: SceneBlock) => void;
}

export default function StageFxInspector({
  block,
  onChange,
}: StageFxInspectorProps) {
  if (block.type === 'WEATHER_FX') {
    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Weather Atmosphere</span>
          <select
            value={block.weather}
            onChange={(e) =>
              onChange({
                ...block,
                weather: e.target.value as WeatherType,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
          >
            <option value="RAIN">🌧️ Falling Rain</option>
            <option value="SNOW">❄️ Drifting Snow</option>
            <option value="FIREFLIES">✨ Floating Fireflies</option>
            <option value="EMBERS">🔥 Rising Embers</option>
            <option value="CLEAR">☀️ Clear Weather (Stop)</option>
          </select>
        </label>

        {block.weather !== 'CLEAR' && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Particle Intensity</span>
            <select
              value={block.intensity}
              onChange={(e) =>
                onChange({
                  ...block,
                  intensity: e.target.value as WeatherIntensity,
                })
              }
              className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-sky-300"
            >
              <option value="LIGHT">Light</option>
              <option value="NORMAL">Normal</option>
              <option value="HEAVY">Heavy Storm</option>
            </select>
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Camera Effect</span>
        <select
          value={block.effect}
          onChange={(e) =>
            onChange({
              ...block,
              effect: e.target.value as CameraEffectType,
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        >
          <option value="SHAKE">📳 Screen Shake (Earthquake / Impact)</option>
          <option value="FLASH_WHITE">⚡ Lightning / White Flash</option>
          <option value="FLASH_RED">🚨 Red Alert / Damage Flash</option>
          <option value="ZOOM_PULSE">🔍 Dramatic Zoom Pulse</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Effect Strength</span>
        <select
          value={block.intensity}
          onChange={(e) =>
            onChange({
              ...block,
              intensity: e.target.value as 'SUBTLE' | 'STRONG',
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300"
        >
          <option value="SUBTLE">Subtle</option>
          <option value="STRONG">Strong</option>
        </select>
      </label>
    </div>
  );
}
