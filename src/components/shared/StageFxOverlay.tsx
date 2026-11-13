'use client';

import React from 'react';

export type WeatherType = 'CLEAR' | 'RAIN' | 'SNOW' | 'FIREFLIES' | 'EMBERS';
export type WeatherIntensity = 'LIGHT' | 'NORMAL' | 'HEAVY';
export type CameraEffectType = 'SHAKE' | 'FLASH_WHITE' | 'FLASH_RED' | 'ZOOM_PULSE';

interface StageFxOverlayProps {
  weather: WeatherType;
  intensity: WeatherIntensity;
  flashColor?: 'WHITE' | 'RED' | null;
  flashKey?: number;
}

const PARTICLE_COUNTS: Record<WeatherIntensity, number> = {
  LIGHT: 16,
  NORMAL: 32,
  HEAVY: 54,
};

export default function StageFxOverlay({
  weather,
  intensity,
  flashColor = null,
  flashKey = 0,
}: StageFxOverlayProps) {
  const count = weather === 'CLEAR' ? 0 : PARTICLE_COUNTS[intensity];
  const particles = Array.from({ length: count }, (_, idx) => {
    const leftPct = (idx * 37 + 13) % 100;
    const topPct = (idx * 53 + 7) % 90;
    const delaySec = ((idx * 19) % 30) / 10;
    const durationSec = 1.1 + ((idx * 11) % 18) / 10;
    return { idx, leftPct, topPct, delaySec, durationSec };
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {weather === 'RAIN' &&
        particles.map((p) => (
          <span
            key={p.idx}
            style={{
              left: `${p.leftPct}%`,
              top: '-12px',
              animationDelay: `${p.delaySec}s`,
              animationDuration: `${Math.max(0.65, p.durationSec * 0.55)}s`,
            }}
            className="animate-vn-rain absolute h-5 w-0.5 rounded-full bg-sky-300/70"
          />
        ))}

      {weather === 'SNOW' &&
        particles.map((p) => (
          <span
            key={p.idx}
            style={{
              left: `${p.leftPct}%`,
              top: '-10px',
              animationDelay: `${p.delaySec}s`,
              animationDuration: `${p.durationSec + 1.4}s`,
            }}
            className="animate-vn-snow absolute h-2 w-2 rounded-full bg-white/85 shadow-[0_0_6px_#ffffff]"
          />
        ))}

      {weather === 'FIREFLIES' &&
        particles.map((p) => (
          <span
            key={p.idx}
            style={{
              left: `${p.leftPct}%`,
              top: `${p.topPct}%`,
              animationDelay: `${p.delaySec}s`,
              animationDuration: `${p.durationSec + 1.8}s`,
            }}
            className="animate-vn-firefly absolute h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_10px_#bef264]"
          />
        ))}

      {weather === 'EMBERS' &&
        particles.map((p) => (
          <span
            key={p.idx}
            style={{
              left: `${p.leftPct}%`,
              top: '0px',
              animationDelay: `${p.delaySec}s`,
              animationDuration: `${p.durationSec + 0.6}s`,
            }}
            className="animate-vn-ember absolute h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fb923c]"
          />
        ))}

      {flashColor && (
        <div
          key={flashKey}
          className={`animate-vn-cam-flash absolute inset-0 ${
            flashColor === 'RED' ? 'bg-rose-600' : 'bg-white'
          }`}
        />
      )}
    </div>
  );
}
