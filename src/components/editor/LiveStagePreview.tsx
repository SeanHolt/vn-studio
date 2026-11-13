'use client';

import React, { useMemo } from 'react';
import { SceneBlock, HotspotZone } from '@/lib/vn-schema';
import { VN_THEMES, VNThemeId } from '@/lib/vn-themes';
import StageArtwork from '@/components/shared/StageArtwork';
import StageFxOverlay, {
    WeatherType,
    WeatherIntensity,
} from '@/components/shared/StageFxOverlay';
import { Eye, Sparkles } from 'lucide-react';

interface LiveStagePreviewProps {
    blocks: SceneBlock[];
    selectedBlockId: string | null;
    theme: VNThemeId;
}

interface StagedChar {
    name: string;
    spriteUrl: string;
    position: 'left' | 'center' | 'right';
}

export default function LiveStagePreview({
    blocks,
    selectedBlockId,
    theme,
}: LiveStagePreviewProps) {
    const themeCfg = VN_THEMES[theme] ?? VN_THEMES.MODERN;

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

    const posClass = (pos: 'left' | 'center' | 'right') => {
        if (pos === 'left') return 'left-6';
        if (pos === 'right') return 'right-6';
        return 'left-1/2 -translate-x-1/2';
    };

    return (
        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
                    <Eye className="h-3.5 w-3.5" /> Live Stage Preview
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> {themeCfg.label}
                </span>
            </div>

            <div
                className={`relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 ${themeCfg.fontClass}`}
            >
                <StageArtwork
                    assetUrl={previewState.bgUrl}
                    alt="Stage Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <StageFxOverlay
                    weather={previewState.weather}
                    intensity={previewState.intensity}
                />

                {previewState.chars.map((char) => (
                    <div
                        key={char.name}
                        className={`absolute bottom-14 z-10 h-28 w-20 transition-all ${posClass(
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
                        style={{
                            left: `${hz.x}%`,
                            top: `${hz.y}%`,
                            width: `${hz.width}%`,
                            height: `${hz.height}%`,
                        }}
                        className="absolute z-10 flex items-center justify-center rounded border border-dashed border-amber-400/80 bg-amber-500/15 text-[9px] font-bold text-amber-200"
                    >
                        {hz.label}
                    </div>
                ))}

                {previewState.dialogueText && (
                    <div
                        className={`absolute inset-x-3 bottom-2 z-20 rounded-lg border p-2.5 backdrop-blur-md ${themeCfg.dialogueBoxClass}`}
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
