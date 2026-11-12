'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
    useSyncExternalStore,
} from 'react';
import {
    subscribeGallery,
    getGallerySnapshot,
    getGalleryServerSnapshot,
    saveAchievementToStorage,
    saveEndingToStorage,
} from '@/lib/vn-gallery-storage';
import {
    SceneBlock,
    SceneType,
    HotspotZone,
    CharacterEmotion,
    StageAnimation,
} from '@/lib/vn-schema';
import {
    GameVariables,
    evaluateCondition,
    applyVariableOperation,
    interpolateVariables,
} from '@/lib/vn-engine';
import { playSynthSound } from '@/lib/vn-audio';
import { getThemeConfig } from '@/lib/vn-themes';
import StageArtwork from '@/components/shared/StageArtwork';
import TypewriterText from './TypewriterText';
import TextInputOverlay from './TextInputOverlay';
import HotspotStageOverlay from './HotspotStageOverlay';
import {
    RotateCcw,
    Sparkles,
    Backpack,
    Volume2,
    VolumeX,
    Timer,
    Heart,
    Trophy,
    History,
    Save,
    Bug,
} from 'lucide-react';
import { advanceGameClock, GameClockState, TIME_DISPLAY } from '@/lib/vn-clock';
import GalleryModal, { AchievementDef, EndingDef } from './GalleryModal';
import DialogueBacklogModal, { BacklogEntry } from './DialogueBacklogModal';
import {
    subscribeSaves,
    getSaveSlotsSnapshot,
    getServerSaveSlotsSnapshot,
    writeSaveSlot,
    deleteSaveSlot,
    SaveSlotSnapshot,
} from '@/lib/vn-save-storage';
import SaveLoadModal from './SaveLoadModal';
import QuizStageOverlay from './QuizStageOverlay';
import KeypadStageOverlay from './KeypadStageOverlay';
import TopDownStageOverlay from './TopDownStageOverlay';
import BattleStageOverlay from './BattleStageOverlay';
import QteStageOverlay from './QteStageOverlay';
import CardDuelStageOverlay from './CardDuelStageOverlay';
import StoryDebuggerModal from './StoryDebuggerModal';
import { speakDialogueLine, stopSpeechNarration } from '@/lib/vn-tts';
import EvidenceStageOverlay from './EvidenceStageOverlay';
import CircuitStageOverlay from './CircuitStageOverlay';
import IdleStageOverlay from './IdleStageOverlay';
import SlidingPuzzleStageOverlay from './SlidingPuzzleStageOverlay';
import CraftingStageOverlay from './CraftingStageOverlay';

export interface PlayableScene {
    id: string;
    name: string;
    sceneType: SceneType;
    blocks: SceneBlock[];
}

interface ActiveCharacter {
    name: string;
    spriteUrl: string;
    position: 'left' | 'center' | 'right';
    emotion: CharacterEmotion;
    animation: StageAnimation;
}

interface VNPlayerProps {
    projectId?: string;
    title: string;
    startSceneId: string;
    initialVariables: GameVariables;
    scenes: PlayableScene[];
    theme?: string;
    enableClock?: boolean;
    canDebug?: boolean;
}

export default function VNPlayer({
    projectId,
    title,
    startSceneId,
    initialVariables,
    scenes,
    theme,
    enableClock = false,
    canDebug = false,
}: VNPlayerProps) {
    const activeTheme = getThemeConfig(theme);
    const [showDebugger, setShowDebugger] = useState(false);
    const [currentSceneId, setCurrentSceneId] = useState<string>(startSceneId);
    const [blockIndex, setBlockIndex] = useState<number>(0);
    const [variables, setVariables] = useState<GameVariables>(initialVariables);
    const [backgroundUrl, setBackgroundUrl] = useState<string>('');
    const [characters, setCharacters] = useState<Record<string, ActiveCharacter>>({});
    const [inventory, setInventory] = useState<string[]>([]);
    const [showBag, setShowBag] = useState<boolean>(false);
    const [clock, setClock] = useState<GameClockState>({
        day: 1,
        timeOfDay: 'MORNING',
    });
    const [affinity, setAffinity] = useState<Record<string, number>>({});
    const [showAffinity, setShowAffinity] = useState<boolean>(false);
    const [affinityToast, setAffinityToast] = useState<{
        id: number;
        characterName: string;
        delta: number;
        reason?: string;
    } | null>(null);

    const [isTypingDone, setIsTypingDone] = useState<boolean>(false);
    const [forceFinishKey, setForceFinishKey] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);
    const bgmCleanupRef = useRef<(() => void) | null>(null);

    const [activeTimer, setActiveTimer] = useState<{
        label: string;
        remaining: number;
        total: number;
        timeoutSceneId: string;
    } | null>(null);
    const storageKey = `vn_gallery_${projectId}`;
    const galleryData = useSyncExternalStore(
        subscribeGallery,
        () => getGallerySnapshot(storageKey),
        getGalleryServerSnapshot
    );
    const unlockedAchievements = galleryData.achievements;
    const discoveredEndings = galleryData.endings;
    const saveStorageKey = `vn_saves_${projectId}`;
    const saveSlots = useSyncExternalStore(
        subscribeSaves,
        () => getSaveSlotsSnapshot(saveStorageKey),
        getServerSaveSlotsSnapshot
    );
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveToast, setSaveToast] = useState<string | null>(null);

    const [showGallery, setShowGallery] = useState<boolean>(false);
    const [achievementToast, setAchievementToast] = useState<AchievementDef | null>(null);
    const [backlog, setBacklog] = useState<BacklogEntry[]>([]);
    const [showBacklog, setShowBacklog] = useState<boolean>(false);

    const currentScene = scenes.find((s) => s.id === currentSceneId);
    const currentBlock = currentScene?.blocks.at(blockIndex);
    const handleAdvanceDialogue = useCallback(() => {
        if (!currentScene || !currentBlock) return;
        if (currentBlock.type === 'DIALOGUE') {
            if (!isTypingDone) {
                setIsTypingDone(true);
                setForceFinishKey((prev) => prev + 1);
            } else {
                const entryId = `${currentScene.id}_${currentBlock.id}_${blockIndex}`;
                const resolvedSpeaker = interpolateVariables(currentBlock.speaker, variables);
                const resolvedText = interpolateVariables(currentBlock.text, variables);

                setBacklog((prev) =>
                    prev.some((item) => item.id === entryId)
                        ? prev
                        : [
                            ...prev,
                            {
                                id: entryId,
                                sceneName: currentScene.name,
                                speaker: resolvedSpeaker,
                                text: resolvedText,
                                kind: 'DIALOGUE',
                            },
                        ]
                );

                setIsTypingDone(false);
                setForceFinishKey(0);
                setBlockIndex((prev) => prev + 1);
            }
        }
    }, [currentScene, currentBlock, isTypingDone, blockIndex, variables]);
    useEffect(() => {
        const isModalOpen =
            showGallery || showBacklog || showSaveModal || showDebugger;
        const isTypingInput = currentBlock?.type === 'INPUT_TEXT';
        if (isModalOpen || isTypingInput) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control' || e.ctrlKey) {
                if (currentBlock?.type === 'DIALOGUE') {
                    e.preventDefault();
                    handleAdvanceDialogue();
                }
                return;
            }

            if (
                (e.key === 'Enter' || e.code === 'Space') &&
                !e.repeat &&
                currentBlock?.type === 'DIALOGUE'
            ) {
                e.preventDefault();
                handleAdvanceDialogue();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        currentBlock,
        showGallery,
        showBacklog,
        showSaveModal,
        handleAdvanceDialogue,
        showDebugger
    ]);
    useEffect(() => {
        if (!isTtsEnabled || isMuted || currentBlock?.type !== 'DIALOGUE') {
            stopSpeechNarration();
            return;
        }

        const spokenSpeaker = interpolateVariables(
            currentBlock.speaker,
            variables
        );
        const spokenText = interpolateVariables(currentBlock.text, variables);
        speakDialogueLine(spokenSpeaker, spokenText, currentBlock.voiceStyle);

        return () => {
            stopSpeechNarration();
        };
    }, [isTtsEnabled, isMuted, currentSceneId, blockIndex, currentBlock, variables]);

    const buildSnapshot = useCallback(
        (
            slotId: string,
            slotLabel: string,
            overrideSceneId?: string,
            overrideSceneName?: string,
            overrideBlockIndex?: number
        ): SaveSlotSnapshot => ({
            slotId,
            slotLabel,
            savedAt: new Date().toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            sceneId: overrideSceneId ?? currentSceneId,
            sceneName: overrideSceneName ?? currentScene?.name ?? 'Unknown Scene',
            blockIndex: overrideBlockIndex ?? blockIndex,
            variables,
            inventory,
            affinity,
            clock,
            backgroundUrl,
            characters,
            backlog,
        }),
        [
            currentSceneId,
            currentScene,
            blockIndex,
            variables,
            inventory,
            affinity,
            clock,
            backgroundUrl,
            characters,
            backlog,
        ]
    );

    const goToScene = useCallback(
        (targetId: string) => {
            const targetScene = scenes.find((s) => s.id === targetId);
            if (targetScene?.sceneType === 'ENDING') {
                saveEndingToStorage(storageKey, targetScene.id);
            }
            if (targetScene) {
                writeSaveSlot(
                    saveStorageKey,
                    buildSnapshot(
                        'slot_auto',
                        'Auto-Save Checkpoint',
                        targetScene.id,
                        targetScene.name,
                        0
                    )
                );
            }
            setCurrentSceneId(targetId);
            setBlockIndex(0);
        },
        [scenes, storageKey, saveStorageKey, buildSnapshot]
    );

    const handleManualSave = (slotId: string, slotLabel: string) => {
        writeSaveSlot(saveStorageKey, buildSnapshot(slotId, slotLabel));
        setSaveToast(`Saved to ${slotLabel}!`);
        window.setTimeout(() => setSaveToast(null), 2200);
    };

    const handleLoadSnapshot = (snap: SaveSlotSnapshot) => {
        bgmCleanupRef.current?.();
        bgmCleanupRef.current = null;
        setActiveTimer(null);
        setVariables(snap.variables);
        setInventory(snap.inventory);
        setAffinity(snap.affinity);
        setClock(snap.clock);
        setBackgroundUrl(snap.backgroundUrl);
        setCharacters(snap.characters);
        setBacklog(snap.backlog);
        setCurrentSceneId(snap.sceneId);
        setBlockIndex(snap.blockIndex);
        setIsTypingDone(false);
        setForceFinishKey(0);
        setSaveToast(`Loaded ${snap.slotLabel}!`);
        window.setTimeout(() => setSaveToast(null), 2200);
    };
    const handleSelectChoice = (targetSceneId: string, choiceLabel?: string) => {
        if (currentScene && choiceLabel) {
            setBacklog((prev) => [
                ...prev,
                {
                    id: `choice_${Date.now()}`,
                    sceneName: currentScene.name,
                    speaker: 'Your Choice',
                    text: interpolateVariables(choiceLabel, variables),
                    kind: 'CHOICE',
                },
            ]);
        }
        setIsTypingDone(false);
        setForceFinishKey(0);
        goToScene(targetSceneId);
    };
    useEffect(() => {
        if (!currentScene || !currentBlock) return;

        if (currentBlock.type === 'BACKGROUND') {
            setBackgroundUrl(currentBlock.assetUrl);
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'CHARACTER') {
            setCharacters((prev) => {
                const updated = { ...prev };
                if (currentBlock.action === 'exit') {
                    delete updated[currentBlock.name];
                } else {
                    updated[currentBlock.name] = {
                        name: currentBlock.name,
                        spriteUrl: currentBlock.spriteUrl,
                        position: currentBlock.position,
                        emotion: currentBlock.emotion ?? 'neutral',
                        animation: currentBlock.animation ?? 'none',
                    };
                }
                return updated;
            });
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'SET_VARIABLE') {
            setVariables((prev) =>
                applyVariableOperation(
                    prev,
                    currentBlock.variableKey,
                    currentBlock.operation,
                    currentBlock.value
                )
            );
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'INVENTORY') {
            setInventory((prev) => {
                if (currentBlock.action === 'give') {
                    return prev.includes(currentBlock.itemName)
                        ? prev
                        : [...prev, currentBlock.itemName];
                }
                return prev.filter((item) => item !== currentBlock.itemName);
            });
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'AFFINITY') {
            const nextScore =
                (affinity[currentBlock.characterName] ?? 0) + currentBlock.delta;
            const varKey = `affinity_${currentBlock.characterName.replace(/\s+/g, '_')}`;

            setAffinity((prev) => ({
                ...prev,
                [currentBlock.characterName]: nextScore,
            }));
            setVariables((prev) => ({
                ...prev,
                [varKey]: nextScore,
            }));
            setAffinityToast({
                id: Date.now(),
                characterName: currentBlock.characterName,
                delta: currentBlock.delta,
                reason: currentBlock.reason,
            });
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'BRANCH') {
            const passed =
                currentBlock.checkType === 'HAS_ITEM'
                    ? Boolean(
                        currentBlock.itemName && inventory.includes(currentBlock.itemName)
                    )
                    : evaluateCondition(
                        currentBlock.variableKey &&
                            currentBlock.operator &&
                            currentBlock.value !== undefined
                            ? {
                                variableKey: currentBlock.variableKey,
                                operator: currentBlock.operator,
                                value: currentBlock.value,
                            }
                            : undefined,
                        variables
                    );

            const nextScene = passed
                ? currentBlock.trueSceneId
                : currentBlock.falseSceneId;
            if (nextScene) {
                setCurrentSceneId(nextScene);
                setBlockIndex(0);
            } else {
                setBlockIndex((prev) => prev + 1);
            }
        } else if (currentBlock.type === 'TIMER') {
            if (currentBlock.action === 'stop') {
                setActiveTimer(null);
            } else {
                setActiveTimer({
                    label: currentBlock.label,
                    remaining: currentBlock.durationSeconds,
                    total: currentBlock.durationSeconds,
                    timeoutSceneId: currentBlock.timeoutSceneId,
                });
            }
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'PLAY_AUDIO') {
            if (currentBlock.audioType === 'BGM') {
                bgmCleanupRef.current?.();
                bgmCleanupRef.current = null;
                if (currentBlock.action === 'play' && !isMuted && currentBlock.soundUrl) {
                    if (currentBlock.soundUrl.startsWith('synth:')) {
                        bgmCleanupRef.current = playSynthSound(currentBlock.soundUrl);
                    } else {
                        const audio = new Audio(currentBlock.soundUrl);
                        audio.loop = true;
                        audio.volume = 0.4;
                        void audio.play();
                        bgmCleanupRef.current = () => {
                            audio.pause();
                            audio.currentTime = 0;
                        };
                    }
                }
            } else if (
                currentBlock.action === 'play' &&
                !isMuted &&
                currentBlock.soundUrl
            ) {
                if (currentBlock.soundUrl.startsWith('synth:')) {
                    playSynthSound(currentBlock.soundUrl);
                } else {
                    const sfx = new Audio(currentBlock.soundUrl);
                    sfx.volume = 0.6;
                    void sfx.play();
                }
            }
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'ADVANCE_TIME') {
            const nextClock = advanceGameClock(
                clock,
                currentBlock.mode,
                currentBlock.targetTime,
                currentBlock.dayDelta
            );
            setClock(nextClock);
            setVariables((prev) => ({
                ...prev,
                day: nextClock.day,
                timeOfDay: nextClock.timeOfDay,
            }));
            setBlockIndex((prev) => prev + 1);
        } else if (currentBlock.type === 'UNLOCK_ACHIEVEMENT') {
            const isNewlyUnlocked = saveAchievementToStorage(
                storageKey,
                currentBlock.achievementId
            );
            if (isNewlyUnlocked) {
                setAchievementToast({
                    achievementId: currentBlock.achievementId,
                    title: currentBlock.title,
                    description: currentBlock.description,
                    icon: currentBlock.icon,
                });
            }
            setBlockIndex((prev) => prev + 1);
        }
    }, [currentScene, currentBlock, affinity, inventory, variables, isMuted, clock, storageKey]);
    useEffect(() => {
        if (!activeTimer) return;

        const interval = window.setInterval(() => {
            setActiveTimer((prev) => {
                if (!prev) return null;
                if (prev.remaining <= 1) {
                    window.clearInterval(interval);
                    if (prev.timeoutSceneId) {
                        setCurrentSceneId(prev.timeoutSceneId);
                        setBlockIndex(0);
                    }
                    return null;
                }
                return { ...prev, remaining: prev.remaining - 1 };
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [activeTimer]);

    useEffect(() => {
        if (!affinityToast) return;
        const timer = window.setTimeout(() => {
            setAffinityToast(null);
        }, 2800);
        return () => window.clearTimeout(timer);
    }, [affinityToast]);

    useEffect(() => {
        return () => {
            bgmCleanupRef.current?.();
        };
    }, []);
    const { allAchievements, allEndings } = useMemo(() => {
        const achMap = new Map<string, AchievementDef>();
        const endings: EndingDef[] = [];

        scenes.forEach((scene) => {
            if (scene.sceneType === 'ENDING') {
                endings.push({ id: scene.id, name: scene.name });
            }
            scene.blocks.forEach((blk) => {
                if (blk.type === 'UNLOCK_ACHIEVEMENT' && !achMap.has(blk.achievementId)) {
                    achMap.set(blk.achievementId, {
                        achievementId: blk.achievementId,
                        title: blk.title,
                        description: blk.description,
                        icon: blk.icon,
                    });
                }
            });
        });

        return {
            allAchievements: Array.from(achMap.values()),
            allEndings: endings,
        };
    }, [scenes]);

    useEffect(() => {
        if (!achievementToast) return;
        const timer = window.setTimeout(() => {
            setAchievementToast(null);
        }, 3200);
        return () => window.clearTimeout(timer);
    }, [achievementToast]);
    const handleRestart = () => {
        bgmCleanupRef.current?.();
        bgmCleanupRef.current = null;
        stopSpeechNarration();
        setVariables(initialVariables);
        setInventory([]);
        setAffinity({});
        setAffinityToast(null);
        setActiveTimer(null);
        setCharacters({});
        setBacklog([]);
        setBackgroundUrl('');
        setCurrentSceneId(startSceneId);
        setBlockIndex(0);
        setIsTypingDone(false);
        setForceFinishKey(0);
    };
    const visibleBacklog: BacklogEntry[] = useMemo(() => {
        if (!currentScene || currentBlock?.type !== 'DIALOGUE') {
            return backlog;
        }
        const currentEntryId = `${currentScene.id}_${currentBlock.id}_${blockIndex}`;
        if (backlog.some((item) => item.id === currentEntryId)) {
            return backlog;
        }
        return [
            ...backlog,
            {
                id: currentEntryId,
                sceneName: currentScene.name,
                speaker: interpolateVariables(currentBlock.speaker, variables),
                text: interpolateVariables(currentBlock.text, variables),
                kind: 'DIALOGUE',
            },
        ];
    }, [backlog, currentScene, currentBlock, blockIndex, variables]);
    if (!currentScene) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                <p>Scene not found. Check your project&apos;s startSceneId.</p>
            </div>
        );
    }

    const isSceneFinished = blockIndex >= currentScene.blocks.length;
    const positionClasses: Record<'left' | 'center' | 'right', string> = {
        left: 'left-12',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-12',
    };
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-slate-100">
            {/* Top Header & HUD Controls */}
            <div className="mb-3 flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm">
                <div className="flex items-center gap-2 font-semibold text-indigo-400">
                    <Sparkles className="h-4 w-4" />
                    <span>{title}</span>
                    <span className="text-slate-500">/ {currentScene.name}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="hidden gap-1.5 text-xs text-slate-400 sm:flex">
                        {Object.entries(variables).map(([k, v]) => (
                            <span key={k} className="rounded bg-slate-800 px-2 py-0.5 font-mono">
                                {k}: <strong className="text-emerald-400">{String(v)}</strong>
                            </span>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowBag((prev) => !prev)}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-amber-300 hover:bg-slate-700"
                    >
                        <Backpack className="h-3.5 w-3.5" /> Bag ({inventory.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowAffinity((prev) => !prev)}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-rose-300 hover:bg-slate-700"
                    >
                        <Heart className="h-3.5 w-3.5 text-rose-400" /> Bonds (
                        {Object.keys(affinity).length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowGallery(true)}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-amber-300 hover:bg-slate-700"
                    >
                        <Trophy className="h-3.5 w-3.5 text-amber-400" /> Gallery (
                        {unlockedAchievements.length + discoveredEndings.length}/
                        {allAchievements.length + allEndings.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowBacklog(true)}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-indigo-300 hover:bg-slate-700"
                    >
                        <History className="h-3.5 w-3.5 text-indigo-400" /> Log (
                        {visibleBacklog.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-emerald-300 hover:bg-slate-700"
                    >
                        <Save className="h-3.5 w-3.5 text-emerald-400" /> Save / Load
                    </button>
                    {canDebug && (
                        <button
                            type="button"
                            onClick={() => setShowDebugger(true)}
                            className="flex items-center gap-1 rounded border border-amber-500/40 bg-amber-950/50 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-900/60"
                        >
                            <Bug className="h-3.5 w-3.5" /> Debug
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMuted((prev) => {
                                const nextMuted = !prev;
                                if (nextMuted) {
                                    bgmCleanupRef.current?.();
                                    bgmCleanupRef.current = null;
                                }
                                return nextMuted;
                            });
                        }}
                        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
                    >
                        {isMuted ? (
                            <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                        ) : (
                            <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const next = !isTtsEnabled;
                            if (!next) stopSpeechNarration();
                            setIsTtsEnabled(next);
                        }}
                        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition ${isTtsEnabled
                            ? 'border border-indigo-400/50 bg-indigo-950/70 text-indigo-200'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {isTtsEnabled ? '🗣️ Voice On' : '🗣️ Voice Off'}
                    </button>
                    <button
                        type="button"
                        onClick={handleRestart}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs hover:bg-slate-700"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Restart
                    </button>
                </div>
            </div>
            {enableClock && (
                <span className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                    <span>{TIME_DISPLAY[clock.timeOfDay].icon}</span>
                    <span>
                        Day {clock.day} • {TIME_DISPLAY[clock.timeOfDay].label}
                    </span>
                </span>
            )}
            {/* Collapsible Backpack Drawer */}
            {showBag && (
                <div className="mb-3 flex w-full max-w-4xl flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-slate-900 px-4 py-2.5 text-xs">
                    <span className="font-semibold text-amber-400">Inventory:</span>
                    {inventory.length === 0 ? (
                        <span className="text-slate-500">Your bag is empty.</span>
                    ) : (
                        inventory.map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-amber-500/40 bg-amber-950/50 px-3 py-0.5 font-medium text-amber-200"
                            >
                                {item}
                            </span>
                        ))
                    )}
                </div>
            )}

            {/* Collapsible Character Bonds Drawer */}
            {showAffinity && (
                <div className="mb-3 flex w-full max-w-4xl flex-wrap items-center gap-3 rounded-lg border border-rose-500/30 bg-slate-900 px-4 py-2.5 text-xs">
                    <span className="font-semibold text-rose-400">Character Bonds:</span>
                    {Object.keys(affinity).length === 0 ? (
                        <span className="text-slate-500">
                            No character relationships tracked yet.
                        </span>
                    ) : (
                        Object.entries(affinity).map(([charName, score]) => {
                            const clamped = Math.max(-10, Math.min(10, score));
                            const barPct = Math.round(((clamped + 10) / 20) * 100);
                            return (
                                <div
                                    key={charName}
                                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5"
                                >
                                    <span className="font-semibold text-slate-200">{charName}</span>
                                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-800">
                                        <div
                                            style={{ width: `${barPct}%` }}
                                            className={`h-full transition-all ${score >= 0 ? 'bg-rose-500' : 'bg-sky-500'
                                                }`}
                                        />
                                    </div>
                                    <span
                                        className={`font-mono font-bold ${score >= 0 ? 'text-rose-400' : 'text-sky-400'
                                            }`}
                                    >
                                        {score > 0 ? `+${score}` : score}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
            {/* 16:9 Visual Novel Stage */}
            <div
                onClick={handleAdvanceDialogue}
                className={`relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 shadow-2xl select-none ${activeTheme.fontClass}`}
            >
                {/* Background Layer */}
                {backgroundUrl && (
                    <StageArtwork
                        assetUrl={backgroundUrl}
                        alt="Scene background"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                {achievementToast && (
                    <div className="animate-vn-slide-in absolute bottom-36 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-amber-400/60 bg-slate-950/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
                        <span className="text-2xl">{achievementToast.icon}</span>
                        <div className="text-xs">
                            <div className="font-bold tracking-wider text-amber-400 uppercase">
                                Achievement Unlocked!
                            </div>
                            <div className="font-bold text-white">{achievementToast.title}</div>
                            <div className="text-[11px] text-slate-300">
                                {achievementToast.description}
                            </div>
                        </div>
                    </div>
                )}
                {showGallery && (
                    <GalleryModal
                        allAchievements={allAchievements}
                        unlockedIds={unlockedAchievements}
                        allEndings={allEndings}
                        discoveredEndingIds={discoveredEndings}
                        onClose={() => setShowGallery(false)}
                    />
                )}
                {showBacklog && (
                    <DialogueBacklogModal
                        entries={visibleBacklog}
                        onClose={() => setShowBacklog(false)}
                    />
                )}
                {enableClock && (
                    <div
                        className={`pointer-events-none absolute inset-0 transition-colors duration-700 ${TIME_DISPLAY[clock.timeOfDay].tintClass}`}
                    />
                )}
                {/* Character Layer */}
                {Object.values(characters).map((char) => (
                    <div
                        key={char.name}
                        className={`absolute bottom-28 flex flex-col items-center transition-all duration-300 ${positionClasses[char.position]}`}
                    >
                        <StageArtwork
                            assetUrl={char.spriteUrl}
                            alt={char.name}
                            emotion={char.emotion}
                            animation={char.animation}
                            className="h-64 w-40 object-contain drop-shadow-lg"
                        />
                    </div>
                ))}

                {/* Floating Affinity Toast */}
                {affinityToast && (
                    <div className="animate-vn-slide-in absolute top-3 left-3 z-30 flex items-center gap-2.5 rounded-xl border border-rose-500/50 bg-slate-950/90 px-3.5 py-2 shadow-xl backdrop-blur-md">
                        <span className="text-base">
                            {affinityToast.delta >= 0 ? '❤️' : '💔'}
                        </span>
                        <div className="text-xs">
                            <div className="font-bold text-white">
                                {affinityToast.characterName}{' '}
                                <span
                                    className={
                                        affinityToast.delta >= 0 ? 'text-rose-400' : 'text-sky-400'
                                    }
                                >
                                    {affinityToast.delta >= 0
                                        ? `+${affinityToast.delta}`
                                        : affinityToast.delta}
                                </span>
                            </div>
                            {affinityToast.reason && (
                                <div className="text-[11px] text-slate-400">
                                    {affinityToast.reason}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Countdown Timer HUD */}
                {activeTimer && (
                    <div className="absolute top-3 right-3 z-30 flex w-56 flex-col gap-1 rounded-lg border border-orange-500/60 bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-md">
                        <div className="flex items-center justify-between text-xs font-bold text-orange-300">
                            <span className="flex items-center gap-1 truncate">
                                <Timer className="h-3.5 w-3.5 animate-pulse text-orange-400" />
                                {activeTimer.label}
                            </span>
                            <span className="font-mono text-white">
                                {activeTimer.remaining}s
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                                style={{
                                    width: `${Math.max(0, (activeTimer.remaining / activeTimer.total) * 100)}%`,
                                }}
                                className="h-full bg-orange-500 transition-all duration-1000 linear"
                            />
                        </div>
                    </div>
                )}
                {saveToast && (
                    <div className="animate-vn-slide-in absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-emerald-400/50 bg-slate-950/90 px-4 py-1 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-md">
                        {saveToast}
                    </div>
                )}
                {showSaveModal && (
                    <SaveLoadModal
                        slots={saveSlots}
                        onSaveToSlot={handleManualSave}
                        onLoadFromSlot={handleLoadSnapshot}
                        onDeleteSlot={(slotId) => deleteSaveSlot(saveStorageKey, slotId)}
                        onClose={() => setShowSaveModal(false)}
                    />
                )}
                {showDebugger && (
                    <StoryDebuggerModal
                        scenes={scenes}
                        currentSceneId={currentSceneId}
                        currentBlockIndex={blockIndex}
                        variables={variables}
                        inventory={inventory}
                        affinity={affinity}
                        onJumpToScene={(sceneId, nextIdx) => {
                            setActiveTimer(null);
                            setIsTypingDone(false);
                            setForceFinishKey(0);
                            setCurrentSceneId(sceneId);
                            setBlockIndex(nextIdx);
                            setShowDebugger(false);
                        }}
                        onUpdateVariable={(key, value) =>
                            setVariables((prev) => ({ ...prev, [key]: value }))
                        }
                        onDeleteVariable={(key) =>
                            setVariables((prev) => {
                                const copy = { ...prev };
                                delete copy[key];
                                return copy;
                            })
                        }
                        onAddItem={(itemName) =>
                            setInventory((prev) =>
                                prev.includes(itemName) ? prev : [...prev, itemName]
                            )
                        }
                        onRemoveItem={(itemName) =>
                            setInventory((prev) => prev.filter((i) => i !== itemName))
                        }
                        onSetAffinity={(charName, score) => {
                            const varKey = `affinity_${charName.replace(/\s+/g, '_')}`;
                            setAffinity((prev) => ({ ...prev, [charName]: score }));
                            setVariables((prev) => ({ ...prev, [varKey]: score }));
                        }}
                        onClose={() => setShowDebugger(false)}
                    />
                )}
                {/* Sandbox Hotspot Room Overlay */}
                {currentBlock?.type === 'HOTSPOT_ROOM' && (
                    <HotspotStageOverlay
                        backgroundUrl={currentBlock.backgroundUrl}
                        promptText={interpolateVariables(currentBlock.promptText, variables)}
                        hotspots={currentBlock.hotspots}
                        inventory={inventory}
                        onTriggerHotspot={(zone: HotspotZone) => {
                            if (zone.actionType === 'INSPECT') {
                                return interpolateVariables(
                                    zone.dialogueText || `You examine ${zone.label}.`,
                                    variables
                                );
                            }
                            if (zone.actionType === 'GIVE_ITEM' && zone.itemName) {
                                const item = zone.itemName;
                                setInventory((prev) =>
                                    prev.includes(item) ? prev : [...prev, item]
                                );
                                return zone.dialogueText || `Obtained item: ${item}!`;
                            }
                            if (
                                zone.actionType === 'SET_VARIABLE' &&
                                zone.variableKey &&
                                zone.variableValue !== undefined
                            ) {
                                const key = zone.variableKey;
                                const val = zone.variableValue;
                                setVariables((prev) => ({ ...prev, [key]: val }));
                                return zone.dialogueText || `${zone.label} activated!`;
                            }
                            if (zone.actionType === 'JUMP_SCENE' && zone.targetSceneId) {
                                setCurrentSceneId(zone.targetSceneId);
                                setBlockIndex(0);
                            }
                            return null;
                        }}
                    />
                )}
                {/* Alchemy / Potion Mixing Lab Overlay */}
                {currentBlock?.type === 'CRAFTING_PUZZLE' && (
                    <CraftingStageOverlay
                        title={interpolateVariables(currentBlock.title, variables)}
                        recipePrompt={interpolateVariables(
                            currentBlock.recipePrompt,
                            variables
                        )}
                        hintText={currentBlock.hintText}
                        availableIngredients={currentBlock.availableIngredients}
                        requiredIngredients={currentBlock.requiredIngredients}
                        craftedItemName={currentBlock.craftedItemName}
                        maxAttempts={currentBlock.maxAttempts}
                        isMuted={isMuted}
                        onCraftSuccess={(craftedItem) => {
                            setInventory((prev) =>
                                prev.includes(craftedItem) ? prev : [...prev, craftedItem]
                            );
                            if (currentBlock.successSceneId) {
                                goToScene(currentBlock.successSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                        onCraftFailOut={() => {
                            if (currentBlock.failSceneId) {
                                goToScene(currentBlock.failSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'SLIDING_PUZZLE' && (
                    <SlidingPuzzleStageOverlay
                        title={interpolateVariables(currentBlock.title, variables)}
                        gridSize={currentBlock.gridSize}
                        puzzleMode={currentBlock.puzzleMode}
                        imageUrl={currentBlock.imageUrl}
                        runeTheme={currentBlock.runeTheme}
                        maxMoves={currentBlock.maxMoves}
                        isMuted={isMuted}
                        onUnlock={() => {
                            if (currentBlock.unlockSceneId) {
                                goToScene(currentBlock.unlockSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                        onFailOut={() => {
                            if (currentBlock.failSceneId) {
                                goToScene(currentBlock.failSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'IDLE_TYCOON' && (
                    <IdleStageOverlay
                        title={interpolateVariables(currentBlock.title, variables)}
                        currencyName={currentBlock.currencyName}
                        clickerLabel={currentBlock.clickerLabel}
                        clickerIcon={currentBlock.clickerIcon}
                        baseClickPower={currentBlock.baseClickPower}
                        goalAmount={currentBlock.goalAmount}
                        initialCurrency={Number(variables[currentBlock.variableKey] ?? 0)}
                        upgrades={currentBlock.upgrades}
                        isMuted={isMuted}
                        onCompleteGoal={(finalCurrency) => {
                            setVariables((prev) => ({
                                ...prev,
                                [currentBlock.variableKey]: finalCurrency,
                            }));
                            if (currentBlock.goalSceneId) {
                                goToScene(currentBlock.goalSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'CIRCUIT_PUZZLE' && (
                    <CircuitStageOverlay
                        title={interpolateVariables(currentBlock.title, variables)}
                        theme={currentBlock.theme}
                        gridSize={currentBlock.gridSize}
                        sourceRow={currentBlock.sourceRow}
                        targetRow={currentBlock.targetRow}
                        maxMoves={currentBlock.maxMoves}
                        initialTiles={currentBlock.tiles}
                        isMuted={isMuted}
                        onUnlock={() => {
                            if (currentBlock.unlockSceneId) {
                                goToScene(currentBlock.unlockSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                        onFailOut={() => {
                            if (currentBlock.failSceneId) {
                                goToScene(currentBlock.failSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {/* Escape Room Keypad / Password Lock Overlay */}
                {currentBlock?.type === 'KEYPAD_PUZZLE' && (
                    <KeypadStageOverlay
                        lockMode={currentBlock.lockMode}
                        promptText={interpolateVariables(currentBlock.promptText, variables)}
                        hintText={currentBlock.hintText}
                        secretCode={currentBlock.secretCode}
                        maxAttempts={currentBlock.maxAttempts}
                        isMuted={isMuted}
                        onUnlock={() => {
                            if (currentBlock.unlockSceneId) {
                                goToScene(currentBlock.unlockSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                        onFailOut={() => {
                            if (currentBlock.failSceneId) {
                                goToScene(currentBlock.failSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'QUIZ_CHALLENGE' && (
                    <QuizStageOverlay
                        title={interpolateVariables(currentBlock.title, variables)}
                        passingScore={currentBlock.passingScore}
                        questions={currentBlock.questions}
                        isMuted={isMuted}
                        onQuizComplete={(passed, score) => {
                            setVariables((prev) => ({ ...prev, quizScore: score }));
                            const nextScene = passed
                                ? currentBlock.passSceneId
                                : currentBlock.failSceneId;
                            if (nextScene) {
                                goToScene(nextScene);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'QTE_ACTION' && (
                    <QteStageOverlay
                        promptText={interpolateVariables(currentBlock.promptText, variables)}
                        speed={currentBlock.speed}
                        zoneStart={currentBlock.zoneStart}
                        zoneWidth={currentBlock.zoneWidth}
                        isMuted={isMuted}
                        onComplete={(succeeded) => {
                            const nextScene = succeeded
                                ? currentBlock.successSceneId
                                : currentBlock.failSceneId;
                            if (nextScene) {
                                goToScene(nextScene);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'CARD_DUEL' && (
                    <CardDuelStageOverlay
                        opponentName={interpolateVariables(
                            currentBlock.opponentName,
                            variables
                        )}
                        deckTheme={currentBlock.deckTheme}
                        roundsToWin={currentBlock.roundsToWin}
                        isMuted={isMuted}
                        onDuelComplete={(playerWon) => {
                            const nextScene = playerWon
                                ? currentBlock.victorySceneId
                                : currentBlock.defeatSceneId;
                            if (nextScene) {
                                goToScene(nextScene);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'TOPDOWN_ROOM' && (
                    <TopDownStageOverlay
                        mapTheme={currentBlock.mapTheme}
                        playerIcon={currentBlock.playerIcon}
                        spawnX={currentBlock.spawnX}
                        spawnY={currentBlock.spawnY}
                        walls={currentBlock.walls}
                        entities={currentBlock.entities}
                        inventory={inventory}
                        onCollectItem={(itemName) =>
                            setInventory((prev) =>
                                prev.includes(itemName) ? prev : [...prev, itemName]
                            )
                        }
                        onJumpScene={(targetId) => goToScene(targetId)}
                    />
                )}
                {currentBlock?.type === 'EVIDENCE_CHECK' && (
                    <EvidenceStageOverlay
                        speaker={interpolateVariables(currentBlock.speaker, variables)}
                        statement={interpolateVariables(currentBlock.statement, variables)}
                        requiredItem={currentBlock.requiredItem}
                        hintText={currentBlock.hintText}
                        wrongItemReply={interpolateVariables(
                            currentBlock.wrongItemReply,
                            variables
                        )}
                        maxStrikes={currentBlock.maxStrikes}
                        inventory={inventory}
                        isMuted={isMuted}
                        onSuccess={() => {
                            if (currentBlock.successSceneId) {
                                goToScene(currentBlock.successSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                        onFailOut={() => {
                            if (currentBlock.failSceneId) {
                                goToScene(currentBlock.failSceneId);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {currentBlock?.type === 'BATTLE_ENCOUNTER' && (
                    <BattleStageOverlay
                        backgroundUrl={currentBlock.backgroundUrl}
                        enemyName={currentBlock.enemyName}
                        enemySpriteUrl={currentBlock.enemySpriteUrl}
                        enemyMaxHp={currentBlock.enemyMaxHp}
                        enemyAttack={currentBlock.enemyAttack}
                        playerMaxHp={currentBlock.playerMaxHp}
                        playerAttack={currentBlock.playerAttack}
                        skillName={currentBlock.skillName}
                        healItemName={currentBlock.healItemName}
                        inventory={inventory}
                        onConsumeItem={(itemName) =>
                            setInventory((prev) => {
                                const idx = prev.indexOf(itemName);
                                if (idx === -1) return prev;
                                const copy = [...prev];
                                copy.splice(idx, 1);
                                return copy;
                            })
                        }
                        onBattleEnd={(won, remainingHp) => {
                            setVariables((prev) => ({ ...prev, playerHP: remainingHp }));
                            const nextScene = won
                                ? currentBlock.victorySceneId
                                : currentBlock.defeatSceneId;
                            if (nextScene) {
                                goToScene(nextScene);
                            } else {
                                setBlockIndex((prev) => prev + 1);
                            }
                        }}
                    />
                )}
                {/* Player Text Input Overlay */}
                {currentBlock?.type === 'INPUT_TEXT' && (
                    <TextInputOverlay
                        prompt={interpolateVariables(currentBlock.prompt, variables)}
                        placeholder={currentBlock.placeholder}
                        defaultValue={currentBlock.defaultValue}
                        onSubmitValue={(submittedText) => {
                            setVariables((prev) => ({
                                ...prev,
                                [currentBlock.targetVariable]: submittedText,
                            }));
                            setBlockIndex((prev) => prev + 1);
                        }}
                    />
                )}

                {/* Choice Overlay */}
                {currentBlock?.type === 'CHOICE' && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/70 p-6 backdrop-blur-xs">
                        {currentBlock.prompt && (
                            <h3 className="mb-2 text-lg font-semibold text-white">
                                {interpolateVariables(currentBlock.prompt, variables)}
                            </h3>
                        )}
                        <div className="flex w-full max-w-md flex-col gap-2.5">
                            {currentBlock.options
                                .filter(
                                    (opt) =>
                                        evaluateCondition(opt.condition, variables) &&
                                        (!opt.requiredItem || inventory.includes(opt.requiredItem))
                                )
                                .map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectChoice(opt.targetSceneId, opt.label);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm font-medium transition ${activeTheme.choiceButtonClass}`}
                                    >
                                        {interpolateVariables(opt.label, variables)}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {/* Dialogue Box */}
                {currentBlock?.type === 'DIALOGUE' && (
                    <div
                        className={`absolute inset-x-4 bottom-4 z-10 cursor-pointer p-5 ${activeTheme.dialogueBoxClass}`}
                    >
                        <div className={`mb-1.5 text-sm ${activeTheme.speakerClass}`}>
                            {interpolateVariables(currentBlock.speaker, variables)}
                        </div>
                        <p
                            className={`min-h-[3rem] text-base leading-relaxed ${activeTheme.dialogueTextClass}`}
                        >
                            {isTypingDone && forceFinishKey > 0 ? (
                                interpolateVariables(currentBlock.text, variables)
                            ) : (
                                <TypewriterText
                                    text={interpolateVariables(currentBlock.text, variables)}
                                    onCompleteChange={setIsTypingDone}
                                />
                            )}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>Hold Ctrl to fast-forward</span>
                            <span>
                                {isTypingDone
                                    ? 'Click or press Space to continue ▾'
                                    : 'Click to skip ▸'}
                            </span>
                        </div>
                    </div>
                )}

                {/* End of Scene / Ending Screen */}
                {isSceneFinished && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white">
                            {currentScene.sceneType === 'ENDING' ? 'The End' : 'End of Scene'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            You reached the end of {currentScene.name}.
                        </p>
                        <button
                            onClick={handleRestart}
                            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
