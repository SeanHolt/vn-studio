'use client';

import React, { useState } from 'react';
import { SceneBlock, TopDownEntity } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { Trash2 } from 'lucide-react';

interface TopdownInspectorProps {
    block: Extract<SceneBlock, { type: 'TOPDOWN_ROOM' }>;
    allScenes: ScenePayload[];
    onChange: (updated: SceneBlock) => void;
}

type PaintTool = 'WALL' | 'SPAWN' | 'NPC' | 'CHEST' | 'DOOR' | 'SWITCH' | 'PATROL';

export default function TopdownInspector({
    block,
    allScenes,
    onChange,
}: TopdownInspectorProps) {
    const [tool, setTool] = useState<PaintTool>('WALL');

    const cols = Array.from({ length: 12 }, (_, x) => x);
    const rows = Array.from({ length: 8 }, (_, y) => y);

    const handleCellClick = (x: number, y: number) => {
        const key = `${x},${y}`;

        if (tool === 'SPAWN') {
            onChange({ ...block, spawnX: x, spawnY: y });
            return;
        }

        if (tool === 'WALL') {
            const exists = block.walls.includes(key);
            const nextWalls = exists
                ? block.walls.filter((w) => w !== key)
                : [...block.walls, key];
            onChange({ ...block, walls: nextWalls });
            return;
        }

        const filteredEntities = block.entities.filter(
            (e) => !(e.x === x && e.y === y)
        );

        const presets: Record<
            Exclude<PaintTool, 'WALL' | 'SPAWN'>,
            TopDownEntity
        > = {
            NPC: {
                id: `ent_${crypto.randomUUID()}`,
                label: 'Villager',
                kind: 'NPC',
                icon: '🧙',
                x,
                y,
                dialogueText: 'Watch out for the patrolling guards!',
            },
            CHEST: {
                id: `ent_${crypto.randomUUID()}`,
                label: 'Treasure Chest',
                kind: 'CHEST',
                icon: '🧰',
                x,
                y,
                itemName: 'Gate Key',
                dialogueText: 'You opened the chest and found a Gate Key!',
            },
            DOOR: {
                id: `ent_${crypto.randomUUID()}`,
                label: 'Locked Gate',
                kind: 'DOOR',
                icon: '🚪',
                x,
                y,
                requiredItem: '',
                targetSceneId: allScenes.at(0)?.id ?? '',
            },
            SWITCH: {
                id: `ent_${crypto.randomUUID()}`,
                label: 'Floor Switch',
                kind: 'SWITCH',
                icon: '🔘',
                x,
                y,
                switchTargetCoords: '8,3 8,4',
                dialogueText: 'Click! Heavy stone barriers slid open nearby!',
            },
            PATROL: {
                id: `ent_${crypto.randomUUID()}`,
                label: 'Shadow Guard',
                kind: 'PATROL',
                icon: '👾',
                x,
                y,
                patrolAxis: 'V',
                patrolRange: 2,
                dialogueText: 'A Shadow Guard spotted you!',
            },
        };

        onChange({
            ...block,
            entities: [...filteredEntities, presets[tool]],
        });
    };

    const updateEntity = (id: string, patch: Partial<TopDownEntity>) => {
        onChange({
            ...block,
            entities: block.entities.map((ent) =>
                ent.id === id ? { ...ent, ...patch } : ent
            ),
        });
    };
    const toolButtons: { id: PaintTool; label: string }[] = [
        { id: 'WALL', label: '🧱 Wall' },
        { id: 'SPAWN', label: '🚩 Spawn' },
        { id: 'NPC', label: '🧙 NPC' },
        { id: 'CHEST', label: '🧰 Chest' },
        { id: 'DOOR', label: '🚪 Door' },
        { id: 'SWITCH', label: '🔘 Switch' },
        { id: 'PATROL', label: '👾 Patrol' },
    ];

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Map Biome</span>
                    <select
                        value={block.mapTheme}
                        onChange={(e) =>
                            onChange({
                                ...block,
                                mapTheme: e.target.value as
                                    | 'GRASSLAND'
                                    | 'DUNGEON'
                                    | 'CASTLE'
                                    | 'SPACE',
                            })
                        }
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
                    >
                        <option value="GRASSLAND">Emerald Grassland</option>
                        <option value="DUNGEON">Stone Dungeon</option>
                        <option value="CASTLE">Royal Castle</option>
                        <option value="SPACE">Space Station</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Player Avatar</span>
                    <input
                        type="text"
                        value={block.playerIcon}
                        onChange={(e) => onChange({ ...block, playerIcon: e.target.value })}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm"
                    />
                </label>
            </div>

            {/* Paint Palette */}
            <div className="flex flex-wrap gap-1">
                {toolButtons.map((btn) => (
                    <button
                        key={btn.id}
                        type="button"
                        onClick={() => setTool(btn.id)}
                        className={`rounded px-2 py-1 text-[11px] font-medium ${tool === btn.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Interactive 12x8 Grid */}
            <div className="grid grid-cols-12 gap-0.5 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                {rows.map((y) =>
                    cols.map((x) => {
                        const key = `${x},${y}`;
                        const isWall = block.walls.includes(key);
                        const isSpawn = block.spawnX === x && block.spawnY === y;
                        const ent = block.entities.find((e) => e.x === x && e.y === y);

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleCellClick(x, y)}
                                className={`flex aspect-square items-center justify-center rounded text-[11px] ${isWall
                                        ? 'bg-slate-700 text-slate-300'
                                        : 'bg-slate-900 hover:bg-slate-800'
                                    }`}
                            >
                                {ent ? ent.icon : isSpawn ? block.playerIcon : isWall ? '▪' : ''}
                            </button>
                        );
                    })
                )}
            </div>

            {/* Placed Entities List */}
            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
                {block.entities.map((ent) => (
                    <div
                        key={ent.id}
                        className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs"
                    >
                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                value={ent.icon}
                                onChange={(e) => updateEntity(ent.id, { icon: e.target.value })}
                                className="w-8 rounded border border-slate-800 bg-slate-900 py-0.5 text-center"
                            />
                            <input
                                type="text"
                                value={ent.label}
                                onChange={(e) => updateEntity(ent.id, { label: e.target.value })}
                                className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-white"
                            />
                            <span className="font-mono text-[10px] text-slate-500">
                                ({ent.x},{ent.y})
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...block,
                                        entities: block.entities.filter((i) => i.id !== ent.id),
                                    })
                                }
                                className="text-slate-500 hover:text-rose-400"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {ent.kind === 'CHEST' && (
                            <input
                                type="text"
                                placeholder="Item granted (e.g. Gate Key)"
                                value={ent.itemName ?? ''}
                                onChange={(e) =>
                                    updateEntity(ent.id, { itemName: e.target.value })
                                }
                                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-amber-300"
                            />
                        )}

                        {ent.kind === 'DOOR' && (
                            <div className="grid grid-cols-2 gap-1.5">
                                <input
                                    type="text"
                                    placeholder="Required Key (optional)"
                                    value={ent.requiredItem ?? ''}
                                    onChange={(e) =>
                                        updateEntity(ent.id, {
                                            requiredItem: e.target.value || undefined,
                                        })
                                    }
                                    className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-amber-300"
                                />
                                <select
                                    value={ent.targetSceneId ?? ''}
                                    onChange={(e) =>
                                        updateEntity(ent.id, { targetSceneId: e.target.value })
                                    }
                                    className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-[11px] text-white"
                                >
                                    {allScenes.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {ent.kind === 'SWITCH' && (
                            <input
                                type="text"
                                placeholder="Opens walls (e.g. 8,3 8,4)"
                                value={ent.switchTargetCoords ?? ''}
                                onChange={(e) =>
                                    updateEntity(ent.id, { switchTargetCoords: e.target.value })
                                }
                                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[11px] text-emerald-300"
                            />
                        )}

                        {ent.kind === 'PATROL' && (
                            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                                <select
                                    value={ent.patrolAxis ?? 'V'}
                                    onChange={(e) =>
                                        updateEntity(ent.id, {
                                            patrolAxis: e.target.value as 'H' | 'V',
                                        })
                                    }
                                    className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-slate-200"
                                >
                                    <option value="V">Vertical</option>
                                    <option value="H">Horizontal</option>
                                </select>
                                <input
                                    type="number"
                                    min={1}
                                    max={6}
                                    title="Patrol Tiles"
                                    value={ent.patrolRange ?? 2}
                                    onChange={(e) =>
                                        updateEntity(ent.id, {
                                            patrolRange: Math.max(1, Math.min(6, Number(e.target.value))),
                                        })
                                    }
                                    className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-rose-300"
                                />
                                <select
                                    value={ent.targetSceneId ?? ''}
                                    onChange={(e) =>
                                        updateEntity(ent.id, {
                                            targetSceneId: e.target.value || undefined,
                                        })
                                    }
                                    className="rounded border border-slate-800 bg-slate-900 px-1 py-1 text-white"
                                >
                                    <option value="">Reset Spawn</option>
                                    {allScenes.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {ent.kind !== 'DOOR' && (
                            <input
                                type="text"
                                placeholder="Banner message..."
                                value={ent.dialogueText ?? ''}
                                onChange={(e) =>
                                    updateEntity(ent.id, { dialogueText: e.target.value })
                                }
                                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
