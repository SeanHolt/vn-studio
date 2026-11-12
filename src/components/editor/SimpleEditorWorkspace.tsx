'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEditorStore } from '@/store/useEditorStore';
import {
    saveProjectScenes,
    toggleProjectPublish,
    ScenePayload,
} from '@/app/actions/editor-actions';
import { ProjectAsset } from '@/app/actions/asset-actions';
import { SceneBlock, SceneType } from '@/lib/vn-schema';
import { GameVariables } from '@/lib/vn-engine';
import { VNThemeId } from '@/lib/vn-themes';
import SortableBlockCard from './SortableBlockCard';
import BlockInspector from './BlockInspector';
import VariablesPanel from './VariablesPanel';
import ThemePickerPanel from './ThemePickerPanel';
import AssetLibraryPanel from './AssetLibraryPanel';
import LiveStagePreview from './LiveStagePreview';
import SceneNodeGraph from './SceneNodeGraph';
import {
    Play,
    Save,
    Plus,
    Layers,
    Trash2,
    ListTree,
    Workflow,
    Globe,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import { buildPresetQuestions } from '@/lib/vn-trivia-presets';
import DistributionPanel from './DistributionPanel';
import { validateProjectStory } from '@/lib/vn-validator';
import StoryValidatorModal from './StoryValidatorModal';
import { generateSolvableBoard } from '@/lib/vn-circuit';

function createUniqueId(prefix: string): string {
    return `${prefix}_${crypto.randomUUID()}`;
}

interface WorkspaceProps {
    projectId: string;
    projectTitle: string;
    initialScenes: ScenePayload[];
    initialVariables: GameVariables;
    initialIsPublished: boolean;
    isDemo: boolean;
    initialTheme: VNThemeId;
    initialEnableClock: boolean;
    initialAllowRemix: boolean;
    initialPriceCents: number;
    initialAssets: ProjectAsset[];
}
export default function SimpleEditorWorkspace({
    projectId,
    projectTitle,
    initialScenes,
    initialVariables,
    initialIsPublished,
    isDemo,
    initialTheme,
    initialEnableClock,
    initialAllowRemix,
    initialPriceCents,
    initialAssets,
}: WorkspaceProps) {
    const [isPending, startTransition] = useTransition();
    const [editorMode, setEditorMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');
    const [isPublished, setIsPublished] = useState<boolean>(initialIsPublished);
    const [isPublishing, startPublishTransition] = useTransition();
    const store = useEditorStore();
    const [showValidator, setShowValidator] = useState(false);
    const validationIssues = validateProjectStory(store.scenes);
    useEffect(() => {
        store.initProject(
            projectId,
            projectTitle,
            initialScenes,
            initialVariables,
            initialTheme,
            initialEnableClock
        );
        store.setAssets(initialAssets);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const activeScene = store.scenes.find((s) => s.id === store.activeSceneId);
    const selectedBlock = activeScene?.blocks.find(
        (b) => b.id === store.selectedBlockId
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            store.reorderBlocks(String(active.id), String(over.id));
        }
    };

    const handleCreateBlock = (type: SceneBlock['type']) => {
        const id = createUniqueId('blk');
        const fallbackScene = store.scenes.at(0)?.id ?? '';

        if (type === 'DIALOGUE') {
            store.addBlock({ id, type, speaker: 'Narrator', text: 'New dialogue line...' });
        } else if (type === 'BACKGROUND') {
            store.addBlock({ id, type, assetUrl: '/assets/bg-sunset-bay.svg', transition: 'fade' });
        } else if (type === 'CHARACTER') {
            store.addBlock({
                id,
                type,
                name: 'Character',
                spriteUrl: '/assets/char-hero-blue.svg',
                position: 'center',
                action: 'enter',
                emotion: 'neutral',
                animation: 'slide-in',
            });
        } else if (type === 'EVIDENCE_CHECK') {
            store.addBlock({
                id,
                type,
                speaker: 'Suspect',
                statement: 'I never went near the lighthouse tonight!',
                requiredItem: 'Brass Key',
                hintText: 'Check the item you found in the woods.',
                wrongItemReply: 'That does not prove anything!',
                maxStrikes: 3,
                successSceneId: fallbackScene,
            });
        } else if (type === 'SET_VARIABLE') {
            const firstVar = Object.keys(store.variables).at(0) ?? 'score';
            store.addBlock({ id, type, variableKey: firstVar, operation: 'set', value: true });
        } else if (type === 'INVENTORY') {
            store.addBlock({ id, type, action: 'give', itemName: 'Silver Key' });
        } else if (type === 'AFFINITY') {
            store.addBlock({
                id,
                type,
                characterName: 'Keeper Clara',
                delta: 1,
                reason: 'Appreciated your help',
            });
        } else if (type === 'CIRCUIT_PUZZLE') {
            store.addBlock({
                id,
                type,
                title: 'Bypass Security Relay',
                theme: 'SCIFI_CIRCUIT',
                gridSize: 5,
                sourceRow: 1,
                targetRow: 3,
                maxMoves: 0,
                tiles: generateSolvableBoard(5, 1, 3),
                unlockSceneId: fallbackScene,
            });
        } else if (type === 'BRANCH') {
            store.addBlock({
                id,
                type,
                checkType: 'HAS_ITEM',
                itemName: 'Silver Key',
                trueSceneId: fallbackScene,
                falseSceneId: fallbackScene,
            });
        } else if (type === 'TIMER') {
            store.addBlock({
                id,
                type,
                action: 'start',
                label: 'Escape Countdown',
                durationSeconds: 15,
                timeoutSceneId: fallbackScene,
            });
        } else if (type === 'ADVANCE_TIME') {
            store.addBlock({
                id,
                type,
                mode: 'NEXT_SLOT',
                targetTime: 'AFTERNOON',
                dayDelta: 0,
            });
        } else if (type === 'PLAY_AUDIO') {
            store.addBlock({
                id,
                type,
                audioType: 'SFX',
                soundUrl: 'synth:chime',
                loop: false,
                action: 'play',
            });
        } else if (type === 'INPUT_TEXT') {
            store.addBlock({
                id,
                type,
                prompt: 'What is your name, traveler?',
                placeholder: 'Enter your name...',
                targetVariable: 'playerName',
                defaultValue: 'Alex',
            });
        } else if (type === 'QTE_ACTION') {
            store.addBlock({
                id,
                type,
                promptText: 'Press SPACE or click inside the green zone!',
                speed: 'NORMAL',
                zoneStart: 38,
                zoneWidth: 24,
                successSceneId: fallbackScene,
                failSceneId: fallbackScene,
            });
        } else if (type === 'HOTSPOT_ROOM') {
            store.addBlock({
                id,
                type,
                backgroundUrl: '/assets/bg-forest-mist.svg',
                promptText: 'Explore the area and click objects to investigate.',
                hotspots: [
                    {
                        id: createUniqueId('hz'),
                        label: 'Mysterious Object',
                        x: 40,
                        y: 45,
                        width: 20,
                        height: 20,
                        actionType: 'INSPECT',
                        dialogueText: 'You inspect the object closely.',
                    },
                ],
            });
        } else if (type === 'CARD_DUEL') {
            store.addBlock({
                id,
                type,
                opponentName: 'Archmage Lyra',
                deckTheme: 'ELEMENTAL',
                roundsToWin: 2,
                victorySceneId: fallbackScene,
                defeatSceneId: fallbackScene,
            });
        } else if (type === 'CHOICE') {
            store.addBlock({
                id,
                type,
                prompt: 'What do you do?',
                options: [
                    {
                        id: createUniqueId('opt'),
                        label: 'Continue',
                        targetSceneId: fallbackScene,
                    },
                ],
            });
        } else if (type === 'UNLOCK_ACHIEVEMENT') {
            store.addBlock({
                id,
                type,
                achievementId: `ach_${Date.now()}`,
                title: 'Secret Finder',
                description: 'Discovered a hidden clue!',
                icon: '🏆',
            });
        } else if (type === 'TOPDOWN_ROOM') {
            store.addBlock({
                id,
                type,
                mapTheme: 'GRASSLAND',
                playerIcon: '🧑',
                spawnX: 1,
                spawnY: 3,
                walls: ['0,0', '1,0', '2,0', '3,0', '4,0', '5,0'],
                entities: [
                    {
                        id: createUniqueId('td'),
                        label: 'Village Elder',
                        kind: 'NPC',
                        icon: '🧙',
                        x: 5,
                        y: 3,
                        dialogueText: 'Welcome to the meadow! Check the chest to the north.',
                    },
                    {
                        id: createUniqueId('td'),
                        label: 'Oak Chest',
                        kind: 'CHEST',
                        icon: '🧰',
                        x: 8,
                        y: 2,
                        itemName: 'Forest Key',
                    },
                ],
            });
        } else if (type === 'BATTLE_ENCOUNTER') {
            store.addBlock({
                id,
                type,
                backgroundUrl: '/assets/bg-night-sky.svg',
                enemyName: 'Clockwork Golem',
                enemySpriteUrl: '/assets/char-mage-violet.svg',
                enemyMaxHp: 50,
                enemyAttack: 8,
                playerMaxHp: 40,
                playerAttack: 12,
                skillName: 'Starlight Strike',
                healItemName: 'Health Potion',
                victorySceneId: fallbackScene,
                defeatSceneId: fallbackScene,
            });
        } else if (type === 'KEYPAD_PUZZLE') {
            store.addBlock({
                id,
                type,
                lockMode: 'PIN',
                promptText: 'Enter the 4-digit safe combination:',
                hintText: 'Look for clues in the room!',
                secretCode: '1984',
                maxAttempts: 0,
                unlockSceneId: fallbackScene,
            });
        } else if (type === 'QUIZ_CHALLENGE') {
            store.addBlock({
                id,
                type,
                title: 'Sci-Fi & Fantasy Trial',
                passingScore: 3,
                questions: buildPresetQuestions('MIXED'),
                passSceneId: fallbackScene,
                failSceneId: fallbackScene,
            });
        }
    };

    const handleConnectScenes = (sourceSceneId: string, targetSceneId: string) => {
        const sourceScene = store.scenes.find((s) => s.id === sourceSceneId);
        const targetScene = store.scenes.find((s) => s.id === targetSceneId);
        if (!sourceScene || !targetScene) return;

        store.selectScene(sourceSceneId);
        const existingChoice = sourceScene.blocks.find((b) => b.type === 'CHOICE');

        if (existingChoice && existingChoice.type === 'CHOICE') {
            store.updateBlock(existingChoice.id, {
                ...existingChoice,
                options: [
                    ...existingChoice.options,
                    {
                        id: createUniqueId('opt'),
                        label: `Go to ${targetScene.name}`,
                        targetSceneId,
                    },
                ],
            });
        } else {
            store.addBlock({
                id: createUniqueId('blk'),
                type: 'CHOICE',
                prompt: 'Choose your path:',
                options: [
                    {
                        id: createUniqueId('opt'),
                        label: `Go to ${targetScene.name}`,
                        targetSceneId,
                    },
                ],
            });
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            await saveProjectScenes(
                store.projectId,
                store.scenes,
                store.variables,
                store.theme,
                store.enableClock
            );
            store.markClean();
        });
    };

    const handleTogglePublish = () => {
        const nextState = !isPublished;
        startPublishTransition(async () => {
            const res = await toggleProjectPublish(projectId, nextState);
            if (res.success && res.isPublished !== undefined) {
                setIsPublished(res.isPublished);
            }
        });
    };
    return (
        <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
            <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
                        ← Dashboard
                    </Link>
                    <span className="text-slate-700">|</span>
                    <span className="font-bold text-indigo-400">VN Studio</span>
                    <span className="text-slate-600">/</span>
                    <span className="font-medium">{store.projectTitle}</span>
                </div>

                <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
                    <button
                        type="button"
                        onClick={() => setEditorMode('SIMPLE')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${editorMode === 'SIMPLE'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <ListTree className="h-3.5 w-3.5" /> Simple Blocks
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditorMode('ADVANCED')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${editorMode === 'ADVANCED'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Workflow className="h-3.5 w-3.5" /> Node Graph
                    </button>
                </div>

                <div className="flex items-center gap-2.5">
                    {!isDemo && (
                        <button
                            type="button"
                            disabled={isPublishing}
                            onClick={handleTogglePublish}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${isPublished
                                ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {isPublished ? (
                                <>
                                    <Globe className="h-3.5 w-3.5 text-emerald-400" /> Published
                                </>
                            ) : (
                                <>
                                    <Lock className="h-3.5 w-3.5 text-slate-400" /> Private
                                </>
                            )}
                        </button>
                    )}

                    <Link
                        href={`/play/${isDemo ? 'demo' : store.projectId}`}
                        target="_blank"
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
                    >
                        <Play className="h-3.5 w-3.5 text-emerald-400" /> Test Play
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowValidator(true)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${validationIssues.length > 0
                            ? 'border-amber-500/40 bg-amber-950/50 text-amber-200 hover:bg-amber-900/60'
                            : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                    >
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                        {validationIssues.length > 0
                            ? `Check (${validationIssues.length})`
                            : 'Validate'}
                    </button>
                    <button
                        type="button"
                        disabled={isPending || !store.isDirty}
                        onClick={handleSave}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isPending ? 'Saving...' : store.isDirty ? 'Save Changes' : 'Saved'}
                    </button>
                </div>
            </header>

            <div className="grid flex-1 grid-cols-12 overflow-hidden">
                <aside className="col-span-3 flex flex-col border-r border-slate-800 bg-slate-900/50 p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            <Layers className="h-3.5 w-3.5" /> Scenes
                        </div>
                        <button
                            type="button"
                            onClick={() => store.addScene()}
                            className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                        >
                            <Plus className="h-3.5 w-3.5" /> New
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
                        {store.scenes.map((scene) => {
                            const isActive = scene.id === store.activeSceneId;
                            return (
                                <div
                                    key={scene.id}
                                    onClick={() => store.selectScene(scene.id)}
                                    className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition ${isActive
                                        ? 'border border-indigo-500/40 bg-indigo-600/20 font-medium text-indigo-300'
                                        : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="truncate pr-2">{scene.name}</span>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                                            {scene.sceneType}
                                        </span>

                                        {store.scenes.length > 1 && (
                                            <button
                                                type="button"
                                                title="Delete Scene"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    store.deleteScene(scene.id);
                                                }}
                                                className="rounded p-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-950/60 hover:text-red-400"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>
                <main className="col-span-6 flex flex-col overflow-hidden">
                    {editorMode === 'ADVANCED' ? (
                        <SceneNodeGraph
                            scenes={store.scenes}
                            activeSceneId={store.activeSceneId}
                            onSelectScene={store.selectScene}
                            onMoveSceneNode={store.updateNodePos}
                            onConnectScenes={handleConnectScenes}
                        />
                    ) : (
                        <div className="flex flex-1 flex-col overflow-y-auto p-6">
                            {activeScene && (
                                <>
                                    <div className="mb-4 flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={activeScene.name}
                                            onChange={(e) =>
                                                store.updateSceneMeta(
                                                    activeScene.id,
                                                    e.target.value,
                                                    activeScene.sceneType
                                                )
                                            }
                                            className="rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-base font-semibold text-white"
                                        />
                                        <select
                                            value={activeScene.sceneType}
                                            onChange={(e) =>
                                                store.updateSceneMeta(
                                                    activeScene.id,
                                                    activeScene.name,
                                                    e.target.value as SceneType
                                                )
                                            }
                                            className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300"
                                        >
                                            <option value="TITLE">TITLE</option>
                                            <option value="DIALOGUE">DIALOGUE</option>
                                            <option value="HOTSPOT">HOTSPOT (Sandbox)</option>
                                            <option value="ENDING">ENDING</option>
                                            <option value="TOPDOWN">TOPDOWN (2D Map)</option>
                                            <option value="BATTLE">BATTLE (RPG)</option>
                                        </select>
                                    </div>

                                    <LiveStagePreview
                                        blocks={activeScene.blocks}
                                        selectedBlockId={store.selectedBlockId}
                                        theme={store.theme}
                                    />

                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {(
                                            [
                                                'DIALOGUE',
                                                'BACKGROUND',
                                                'CHARACTER',
                                                'SET_VARIABLE',
                                                'INVENTORY',
                                                'AFFINITY',
                                                'UNLOCK_ACHIEVEMENT',
                                                'BRANCH',
                                                'TIMER',
                                                'ADVANCE_TIME',
                                                'PLAY_AUDIO',
                                                'INPUT_TEXT',
                                                'HOTSPOT_ROOM',
                                                'CHOICE',
                                                'TOPDOWN_ROOM',
                                                'BATTLE_ENCOUNTER'
                                            ] as const
                                        ).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => handleCreateBlock(type)}
                                                className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-indigo-500 hover:text-white"
                                            >
                                                <Plus className="h-3.5 w-3.5 text-indigo-400" /> {type}
                                            </button>
                                        ))}
                                    </div>

                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={activeScene.blocks.map((b) => b.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="flex flex-col gap-2.5">
                                                {activeScene.blocks.map((block) => (
                                                    <SortableBlockCard
                                                        key={block.id}
                                                        block={block}
                                                        isSelected={block.id === store.selectedBlockId}
                                                        onSelect={() => store.selectBlock(block.id)}
                                                        onDelete={() => store.deleteBlock(block.id)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </>
                            )}
                        </div>
                    )}
                </main>

                <aside className="col-span-3 flex flex-col divide-y divide-slate-800 overflow-y-auto border-l border-slate-800 bg-slate-900/50">
                    <BlockInspector
                        block={selectedBlock}
                        allScenes={store.scenes}
                        variables={store.variables}
                        onChange={(updated) => {
                            if (selectedBlock) store.updateBlock(selectedBlock.id, updated);
                        }}
                    />

                    <ThemePickerPanel
                        currentTheme={store.theme}
                        onSelectTheme={store.setTheme}
                        enableClock={store.enableClock}
                        onToggleClock={store.setEnableClock}
                    />

                    {!isDemo && (
                        <DistributionPanel
                            projectId={projectId}
                            initialAllowRemix={initialAllowRemix}
                            initialPriceCents={initialPriceCents}
                        />
                    )}

                    <VariablesPanel
                        variables={store.variables}
                        onSetVariable={store.setVariable}
                        onDeleteVariable={store.deleteVariable}
                    />

                    <AssetLibraryPanel />
                </aside>
            </div>
            {showValidator && (
                <StoryValidatorModal
                    issues={validationIssues}
                    onJumpToIssue={(sceneId, blockId) => {
                        setEditorMode('SIMPLE');
                        store.selectScene(sceneId);
                        if (blockId) store.selectBlock(blockId);
                    }}
                    onClose={() => setShowValidator(false)}
                />
            )}
        </div>
    );
}
