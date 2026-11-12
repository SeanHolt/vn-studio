'use client';

import React from 'react';
import { SceneBlock, ChoiceOption } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { Plus, X } from 'lucide-react';
import { GameVariables } from '@/lib/vn-engine';
import ChoiceConditionEditor from './ChoiceConditionEditor';
import AssetPicker from './AssetPicker';
import BranchAndItemInspector from './BranchAndItemInspector';
import AudioInspector from './AudioInspector';
import InputBlockInspector from './InputBlockInspector';
import HotspotRoomInspector from './HotspotRoomInspector';
import TimerBlockInspector from './TimerBlockInspector';
import AffinityBlockInspector from './AffinityBlockInspector';
import TimeBlockInspector from './TimeBlockInspector';
import AchievementBlockInspector from './AchievementBlockInspector';
import TopDownRoomInspector from './TopDownRoomInspector';
import BattleEncounterInspector from './BattleEncounterInspector';
import KeypadPuzzleInspector from './KeypadPuzzleInspector';
import QuizChallengeInspector from './QuizChallengeInspector';
import QteBlockInspector from './QteBlockInspector';

interface BlockInspectorProps {
    block: SceneBlock | undefined;
    variables: GameVariables;
    allScenes: ScenePayload[];
    onChange: (updated: SceneBlock) => void;
}
function createOptionId(): string {
    return `opt_${crypto.randomUUID()}`;
}
export default function BlockInspector({
    block,
    variables,
    allScenes,
    onChange,
}: BlockInspectorProps) {
    if (!block) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
                Select a block in the timeline to edit its properties.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4 text-sm">
            <div className="border-b border-slate-800 pb-2">
                <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                    {block.type.replace('_', ' ')} Block
                </span>
            </div>

            {block.type === 'AFFINITY' && (
                <AffinityBlockInspector block={block} onChange={onChange} />
            )}
            {block.type === 'ADVANCE_TIME' && (
                <TimeBlockInspector block={block} onChange={onChange} />
            )}
            {block.type === 'BACKGROUND' && (
                <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400">Image URL</span>
                    <AssetPicker
                        category="BACKGROUND"
                        currentUrl={block.assetUrl}
                        onSelectUrl={(url) => onChange({ ...block, assetUrl: url })}
                    />
                </label>
            )}
            {block.type === 'BATTLE_ENCOUNTER' && (
                <BattleEncounterInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'CHARACTER' && (
                <>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Character Name</span>
                        <input
                            type="text"
                            value={block.name}
                            onChange={(e) => onChange({ ...block, name: e.target.value })}
                            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Sprite URL</span>
                        <AssetPicker
                            category="CHARACTER"
                            currentUrl={block.spriteUrl}
                            onSelectUrl={(url) => onChange({ ...block, spriteUrl: url })}
                        />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-slate-400">Position</span>
                            <select
                                value={block.position}
                                onChange={(e) =>
                                    onChange({
                                        ...block,
                                        position: e.target.value as 'left' | 'center' | 'right',
                                    })
                                }
                                className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-slate-400">Action</span>
                            <select
                                value={block.action}
                                onChange={(e) =>
                                    onChange({
                                        ...block,
                                        action: e.target.value as 'enter' | 'exit',
                                    })
                                }
                                className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                            >
                                <option value="enter">Enter</option>
                                <option value="exit">Exit</option>
                            </select>
                        </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-slate-400">Emotion</span>
                            <select
                                value={block.emotion ?? 'neutral'}
                                onChange={(e) =>
                                    onChange({
                                        ...block,
                                        emotion: e.target.value as
                                            | 'neutral'
                                            | 'happy'
                                            | 'angry'
                                            | 'shocked'
                                            | 'sad',
                                    })
                                }
                                className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                            >
                                <option value="neutral">Neutral</option>
                                <option value="happy">Happy ✨</option>
                                <option value="angry">Angry 💢</option>
                                <option value="shocked">Shocked ❗</option>
                                <option value="sad">Sad 💧</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs text-slate-400">Animation</span>
                            <select
                                value={block.animation ?? 'none'}
                                onChange={(e) =>
                                    onChange({
                                        ...block,
                                        animation: e.target.value as
                                            | 'none'
                                            | 'bounce'
                                            | 'shake'
                                            | 'pulse'
                                            | 'slide-in',
                                    })
                                }
                                className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                            >
                                <option value="none">None</option>
                                <option value="slide-in">Slide In</option>
                                <option value="bounce">Bounce</option>
                                <option value="shake">Shake</option>
                                <option value="pulse">Pulse</option>
                            </select>
                        </label>
                    </div>
                </>
            )}
            {block.type === 'CHOICE' && (
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Prompt Question</span>
                        <input
                            type="text"
                            value={block.prompt ?? ''}
                            onChange={(e) => onChange({ ...block, prompt: e.target.value })}
                            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                        />
                    </label>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Choice Options</span>
                        <button
                            type="button"
                            onClick={() => {
                                const newOpt: ChoiceOption = {
                                    id: createOptionId(),
                                    label: 'New Choice',
                                    targetSceneId: allScenes[0]?.id ?? '',
                                };
                                onChange({ ...block, options: [...block.options, newOpt] });
                            }}
                            className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs text-white"
                        >
                            <Plus className="h-3 w-3" /> Add
                        </button>
                    </div>
                    {block.options.map((opt, idx) => (
                        <div key={opt.id} className="flex flex-col gap-2 rounded border border-slate-800 bg-slate-950 p-2.5">
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={opt.label}
                                    onChange={(e) => {
                                        const next = [...block.options];
                                        next[idx] = { ...opt, label: e.target.value };
                                        onChange({ ...block, options: next });
                                    }}
                                    className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange({
                                            ...block,
                                            options: block.options.filter((_, i) => i !== idx),
                                        })
                                    }
                                    className="text-slate-500 hover:text-red-400"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <select
                                value={opt.targetSceneId}
                                onChange={(e) => {
                                    const next = [...block.options];
                                    next[idx] = { ...opt, targetSceneId: e.target.value };
                                    onChange({ ...block, options: next });
                                }}
                                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-300"
                            >
                                {allScenes.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        Jump to: {s.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Requires Item (Optional, e.g. Golden Key)"
                                value={opt.requiredItem ?? ''}
                                onChange={(e) => {
                                    const next = [...block.options];
                                    next[idx] = {
                                        ...opt,
                                        requiredItem: e.target.value.trim() || undefined,
                                    };
                                    onChange({ ...block, options: next });
                                }}
                                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-amber-200 placeholder:text-slate-600"
                            />
                            <ChoiceConditionEditor
                                condition={opt.condition}
                                variables={variables}
                                onChange={(nextCondition) => {
                                    const next = [...block.options];
                                    next[idx] = { ...opt, condition: nextCondition };
                                    onChange({ ...block, options: next });
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
            {block.type === 'DIALOGUE' && (
                <>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Speaker</span>
                        <input
                            type="text"
                            value={block.speaker}
                            onChange={(e) => onChange({ ...block, speaker: e.target.value })}
                            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Dialogue Text</span>
                        <textarea
                            rows={4}
                            value={block.text}
                            onChange={(e) => onChange({ ...block, text: e.target.value })}
                            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                        />
                    </label>
                </>
            )}
            {block.type === 'HOTSPOT_ROOM' && (
                <HotspotRoomInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'INPUT_TEXT' && <InputBlockInspector block={block} variables={variables} onChange={onChange} />}
            {(block.type === 'INVENTORY' || block.type === 'BRANCH') && (
                <BranchAndItemInspector
                    block={block}
                    allScenes={allScenes}
                    variables={variables}
                    onChange={onChange}
                />
            )}
            {block.type === 'KEYPAD_PUZZLE' && (
                <KeypadPuzzleInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'QTE_ACTION' && (
                <QteBlockInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'PLAY_AUDIO' && (
                <AudioInspector block={block} onChange={onChange} />
            )}
            {block.type === 'QUIZ_CHALLENGE' && (
                <QuizChallengeInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'SET_VARIABLE' && (
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Target Variable</span>
                        <select
                            value={block.variableKey}
                            onChange={(e) => {
                                const nextKey = e.target.value;
                                const sample = variables[nextKey];
                                const defaultVal =
                                    typeof sample === 'boolean' ? true : typeof sample === 'number' ? 1 : '';
                                onChange({ ...block, variableKey: nextKey, value: defaultVal });
                            }}
                            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white"
                        >
                            {Object.keys(variables).map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">Operation</span>
                        <select
                            value={block.operation}
                            onChange={(e) =>
                                onChange({
                                    ...block,
                                    operation: e.target.value as 'set' | 'add' | 'subtract',
                                })
                            }
                            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                        >
                            <option value="set">Set (=)</option>
                            <option value="add">Add (+)</option>
                            <option value="subtract">Subtract (-)</option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-400">New Value</span>
                        {typeof variables[block.variableKey] === 'boolean' ? (
                            <select
                                value={String(block.value)}
                                onChange={(e) => onChange({ ...block, value: e.target.value === 'true' })}
                                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                            >
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </select>
                        ) : typeof variables[block.variableKey] === 'number' ? (
                            <input
                                type="number"
                                value={Number(block.value)}
                                onChange={(e) => onChange({ ...block, value: Number(e.target.value) })}
                                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                            />
                        ) : (
                            <input
                                type="text"
                                value={String(block.value)}
                                onChange={(e) => onChange({ ...block, value: e.target.value })}
                                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                            />
                        )}
                    </label>
                </div>
            )}
            {block.type === 'TIMER' && (
                <TimerBlockInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'TOPDOWN_ROOM' && (
                <TopDownRoomInspector
                    block={block}
                    allScenes={allScenes}
                    onChange={onChange}
                />
            )}
            {block.type === 'UNLOCK_ACHIEVEMENT' && (
                <AchievementBlockInspector block={block} onChange={onChange} />
            )}
        </div>
    );
}
