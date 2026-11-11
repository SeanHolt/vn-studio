'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SceneBlock } from '@/lib/vn-schema';
import {
    GripVertical,
    Image as ImageIcon,
    User,
    MessageSquare,
    GitBranch,
    Sliders,
    Trash2,
    Split,
    Backpack,
    Volume2,
    TextCursorInput,
    MousePointerClick,
    Timer,
    Heart,
    Clock,
    Trophy,
} from 'lucide-react';

interface SortableBlockCardProps {
    block: SceneBlock;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

export default function SortableBlockCard({
    block,
    isSelected,
    onSelect,
    onDelete,
}: SortableBlockCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: block.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const renderSummary = () => {
        switch (block.type) {
            case 'BACKGROUND':
                return <span className="text-slate-300">Set Background: {block.assetUrl || 'None'}</span>;
            case 'CHARACTER':
                return (
                    <span className="text-slate-300">
                        {block.name} ({block.action} • {block.position} • {block.emotion ?? 'neutral'})
                    </span>
                );
            case 'DIALOGUE':
                return (
                    <div>
                        <span className="font-semibold text-indigo-400">{block.speaker}: </span>
                        <span className="text-slate-200">{block.text}</span>
                    </div>
                );
            case 'SET_VARIABLE':
                return (
                    <span className="font-mono text-xs text-emerald-400">
                        {block.variableKey} {block.operation} {String(block.value)}
                    </span>
                );
            case 'CHOICE':
                return (
                    <span className="text-amber-300">
                        Choice: {block.options.length} option(s)
                    </span>
                );
            case 'INVENTORY':
                return (
                    <span className="text-amber-300">
                        {block.action === 'give' ? '+ Give Item:' : '- Remove Item:'}{' '}
                        <strong>{block.itemName}</strong>
                    </span>
                );
            case 'BRANCH':
                return (
                    <span className="text-rose-300">
                        IF{' '}
                        {block.checkType === 'HAS_ITEM'
                            ? `Has "${block.itemName || '?'}"`
                            : `${block.variableKey || '?'} ${block.operator || '=='} ${String(block.value ?? '')}`}
                    </span>
                );
            case 'PLAY_AUDIO':
                return (
                    <span className="text-pink-300">
                        {block.audioType}: {block.action === 'stop' ? 'Stop Audio' : block.soundUrl}
                    </span>
                );
            case 'INPUT_TEXT':
                return (
                    <span className="text-cyan-300">
                        Ask &ldquo;{block.prompt}&rdquo; → {`{{${block.targetVariable}}}`}
                    </span>
                );
            case 'HOTSPOT_ROOM':
                return (
                    <span className="text-sky-300">
                        Sandbox Room: {block.hotspots.length} clickable hotspot(s)
                    </span>
                );
            case 'TIMER':
                return (
                    <span className="text-orange-300">
                        {block.action === 'stop'
                            ? 'Stop Active Timer'
                            : `Timer: ${block.label} (${block.durationSeconds}s)`}
                    </span>
                );
            case 'AFFINITY':
                return (
                    <span className={block.delta >= 0 ? 'text-rose-300' : 'text-slate-400'}>
                        Affinity: {block.characterName}{' '}
                        <strong>{block.delta >= 0 ? `+${block.delta}` : block.delta}</strong>
                    </span>
                );
            case 'ADVANCE_TIME':
                return (
                    <span className="text-amber-200">
                        {block.mode === 'NEXT_SLOT'
                            ? 'Time: Advance to Next Slot'
                            : `Time: Set to ${block.targetTime}`}
                        {block.dayDelta > 0 ? ` (+${block.dayDelta} day)` : ''}
                    </span>
                );
            case 'UNLOCK_ACHIEVEMENT':
                return (
                    <span className="text-amber-300">
                        {block.icon} Achievement: <strong>{block.title}</strong>
                    </span>
                );
        }
    };

    const badgeIcon: Record<SceneBlock['type'], React.ReactNode> = {
        BACKGROUND: <ImageIcon className="h-4 w-4 text-sky-400" />,
        CHARACTER: <User className="h-4 w-4 text-purple-400" />,
        DIALOGUE: <MessageSquare className="h-4 w-4 text-indigo-400" />,
        SET_VARIABLE: <Sliders className="h-4 w-4 text-emerald-400" />,
        CHOICE: <GitBranch className="h-4 w-4 text-amber-400" />,
        INVENTORY: <Backpack className="h-4 w-4 text-amber-400" />,
        BRANCH: <Split className="h-4 w-4 text-rose-400" />,
        PLAY_AUDIO: <Volume2 className="h-4 w-4 text-pink-400" />,
        INPUT_TEXT: <TextCursorInput className="h-4 w-4 text-cyan-400" />,
        HOTSPOT_ROOM: <MousePointerClick className="h-4 w-4 text-sky-400" />,
        TIMER: <Timer className="h-4 w-4 text-orange-400" />,
        AFFINITY: <Heart className="h-4 w-4 text-rose-400" />,
        ADVANCE_TIME: <Clock className="h-4 w-4 text-amber-300" />,
        UNLOCK_ACHIEVEMENT: <Trophy className="h-4 w-4 text-amber-400" />,

    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
            className={`flex items-center gap-3 rounded-lg border p-3 transition cursor-pointer ${isSelected
                ? 'border-indigo-500 bg-slate-800/90 shadow-md'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="cursor-grab text-slate-500 hover:text-slate-300"
            >
                <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-950">
                {badgeIcon[block.type]}
            </div>

            <div className="min-w-0 flex-1 truncate text-sm">{renderSummary()}</div>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="rounded p-1.5 text-slate-500 hover:bg-red-950/50 hover:text-red-400"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}
