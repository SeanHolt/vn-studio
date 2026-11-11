'use client';

import React, { useMemo } from 'react';
import { SceneBlock, HotspotZone, CharacterEmotion, StageAnimation } from '@/lib/vn-schema';
import StageArtwork from '@/components/shared/StageArtwork';
import { Eye } from 'lucide-react';
import { getThemeConfig, VNThemeId } from '@/lib/vn-themes';

interface LiveStagePreviewProps {
    blocks: SceneBlock[];
    selectedBlockId: string | null;
    theme?: VNThemeId;
}

interface PreviewChar {
    name: string;
    spriteUrl: string;
    position: 'left' | 'center' | 'right';
    emotion: CharacterEmotion;
    animation: StageAnimation;
}

export default function LiveStagePreview({
    blocks,
    selectedBlockId,
    theme,
}: LiveStagePreviewProps) {
    const activeTheme = getThemeConfig(theme);
    const stageState = useMemo(() => {
        const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
        const limitIndex = selectedIndex === -1 ? blocks.length - 1 : selectedIndex;

        let bgUrl = '';
        const chars: Record<string, PreviewChar> = {};
        let activeDialogue: { speaker: string; text: string } | null = null;
        let activeChoice: { prompt?: string; labels: string[] } | null = null;
        let activeHotspots: { promptText: string; zones: HotspotZone[] } | null = null;

        for (let i = 0; i <= limitIndex && i < blocks.length; i++) {
            const blk = blocks[i];
            if (!blk) continue;

            if (blk.type === 'BACKGROUND') {
                bgUrl = blk.assetUrl;
            } else if (blk.type === 'HOTSPOT_ROOM') {
                bgUrl = blk.backgroundUrl;
            } else if (blk.type === 'CHARACTER') {
                if (blk.action === 'exit') {
                    delete chars[blk.name];
                } else {
                    chars[blk.name] = {
                        name: blk.name,
                        spriteUrl: blk.spriteUrl,
                        position: blk.position,
                        emotion: blk.emotion,
                        animation: blk.animation,
                    };
                }
            }

            if (i === limitIndex) {
                if (blk.type === 'DIALOGUE') {
                    activeDialogue = { speaker: blk.speaker, text: blk.text };
                } else if (blk.type === 'CHOICE') {
                    activeChoice = {
                        prompt: blk.prompt,
                        labels: blk.options.map((o) => o.label),
                    };
                } else if (blk.type === 'HOTSPOT_ROOM') {
                    activeHotspots = {
                        promptText: blk.promptText,
                        zones: blk.hotspots,
                    };
                }
            }
        }

        return {
            bgUrl,
            chars: Object.values(chars),
            activeDialogue,
            activeChoice,
            activeHotspots,
        };
    }, [blocks, selectedBlockId]);
    const posMap: Record<'left' | 'center' | 'right', string> = {
        left: 'left-6',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-6',
    };

    return (
        <div className="mb-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-400">
                    <Eye className="h-3.5 w-3.5" /> Live Stage Preview
                </span>
                <span>Updates as you select or edit blocks</span>
            </div>

            <div className={`relative aspect-video w-full overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 ${activeTheme.fontClass}`}>
                {stageState.bgUrl && (
                    <StageArtwork
                        assetUrl={stageState.bgUrl}
                        alt="Preview background"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}

                {stageState.chars.map((c) => (
                    <div
                        key={c.name}
                        className={`absolute bottom-14 transition-all duration-200 ${posMap[c.position]}`}
                    >
                        <StageArtwork
                            assetUrl={c.spriteUrl}
                            alt={c.name}
                            className="h-32 w-20 object-contain drop-shadow-md"
                            emotion={c.emotion}
                            animation={c.animation}
                        />
                    </div>
                ))}

                {stageState.activeHotspots && (
                    <div className="absolute inset-0 z-10">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full border border-slate-700/80 bg-slate-950/85 px-3 py-0.5 text-[10px] font-medium text-slate-200">
                            {stageState.activeHotspots.promptText}
                        </div>

                        {stageState.activeHotspots.zones.map((zone) => (
                            <div
                                key={zone.id}
                                style={{
                                    left: `${zone.x}%`,
                                    top: `${zone.y}%`,
                                    width: `${zone.width}%`,
                                    height: `${zone.height}%`,
                                }}
                                className="absolute flex items-center justify-center rounded border-2 border-dashed border-amber-400 bg-amber-400/20"
                            >
                                <span className="truncate rounded bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200">
                                    {zone.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {stageState.activeChoice && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 bg-slate-950/70 p-4">
                        {stageState.activeChoice.prompt && (
                            <div className="text-xs font-semibold text-white">
                                {stageState.activeChoice.prompt}
                            </div>
                        )}
                        {stageState.activeChoice.labels.map((lbl, idx) => (
                            <div
                                key={idx}
                                className={`w-full max-w-xs px-3 py-1.5 text-center text-[11px] ${activeTheme.choiceButtonClass}`}
                            >
                                {lbl}
                            </div>
                        ))}                    </div>
                )}

                {stageState.activeDialogue && (
                    <div className={`absolute inset-x-3 bottom-3 z-10 p-3 ${activeTheme.dialogueBoxClass}`}>
                        <div className={`text-[11px] ${activeTheme.speakerClass}`}>
                            {stageState.activeDialogue.speaker}
                        </div>
                        <p className={`mt-0.5 line-clamp-2 text-xs ${activeTheme.dialogueTextClass}`}>
                            {stageState.activeDialogue.text}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
