'use client';

import React, { useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    NodeChange,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ScenePayload } from '@/app/actions/editor-actions';
import { SceneBlock } from '@/lib/vn-schema';

interface SceneNodeGraphProps {
    scenes: ScenePayload[];
    activeSceneId: string;
    onSelectScene: (sceneId: string) => void;
    onMoveSceneNode: (sceneId: string, pos: { x: number; y: number }) => void;
    onConnectScenes: (sourceSceneId: string, targetSceneId: string) => void;
}

export default function SceneNodeGraph({
    scenes,
    activeSceneId,
    onSelectScene,
    onMoveSceneNode,
    onConnectScenes,
}: SceneNodeGraphProps) {
    const nodes: Node[] = useMemo(
        () =>
            scenes.map((scene) => {
                const isSelected = scene.id === activeSceneId;
                const dialogueCount = scene.blocks.filter((b) => b.type === 'DIALOGUE').length;
                return {
                    id: scene.id,
                    position: scene.nodePos ?? { x: scene.order * 320, y: 150 },
                    data: {
                        label: `${scene.name} (${scene.sceneType}) • ${dialogueCount} line(s)`,
                    },
                    style: {
                        background: isSelected ? '#312e81' : '#0f172a',
                        color: '#f8fafc',
                        border: isSelected ? '2px solid #818cf8' : '1px solid #334155',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        width: 240,
                    },
                };
            }),
        [scenes, activeSceneId]
    );

    const edges: Edge[] = useMemo(() => {
        const result: Edge[] = [];

        scenes.forEach((scene) => {
            scene.blocks.forEach((block: SceneBlock) => {
                if (block.type === 'CHOICE') {
                    block.options.forEach((opt) => {
                        if (!opt.targetSceneId) return;
                        result.push({
                            id: `${scene.id}_${opt.id}_${opt.targetSceneId}`,
                            source: scene.id,
                            target: opt.targetSceneId,
                            label: opt.condition
                                ? `${opt.label} [${opt.condition.variableKey}]`
                                : opt.label,
                            animated: true,
                            style: { stroke: opt.condition ? '#fbbf24' : '#818cf8', strokeWidth: 2 },
                            labelStyle: { fill: '#e2e8f0', fontSize: 10, fontWeight: 500 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
                        });
                    });
                } else if (block.type === 'BRANCH') {
                    if (block.trueSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_true_${block.trueSceneId}`,
                            source: scene.id,
                            target: block.trueSceneId,
                            label: 'IF TRUE',
                            animated: true,
                            style: { stroke: '#34d399', strokeWidth: 2 },
                            labelStyle: { fill: '#6ee7b7', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
                        });
                    }
                    if (block.falseSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_false_${block.falseSceneId}`,
                            source: scene.id,
                            target: block.falseSceneId,
                            label: 'ELSE',
                            animated: true,
                            style: { stroke: '#fb7185', strokeWidth: 2 },
                            labelStyle: { fill: '#fda4af', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' },
                        });
                    }
                } else if (block.type === 'TOPDOWN_ROOM') {
                    block.entities.forEach((entity) => {
                        if (!entity.targetSceneId) return;
                        result.push({
                            id: `${scene.id}_${entity.id}_${entity.targetSceneId}`,
                            source: scene.id,
                            target: entity.targetSceneId,
                            label: `${entity.icon} ${entity.label}`,
                            animated: true,
                            style: { stroke: '#2dd4bf', strokeWidth: 2 },
                            labelStyle: { fill: '#99f6e4', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#2dd4bf' },
                        });
                    });
                } else if (block.type === 'HOTSPOT_ROOM') {
                    block.hotspots.forEach((zone) => {
                        if (zone.actionType !== 'JUMP_SCENE' || !zone.targetSceneId) return;
                        result.push({
                            id: `${scene.id}_${zone.id}_${zone.targetSceneId}`,
                            source: scene.id,
                            target: zone.targetSceneId,
                            label: `Click: ${zone.label}`,
                            animated: true,
                            style: { stroke: '#38bdf8', strokeWidth: 2 },
                            labelStyle: { fill: '#bae6fd', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
                        });
                    });
                } else if (block.type === 'TIMER') {
                    if (block.action === 'start' && block.timeoutSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_timeout_${block.timeoutSceneId}`,
                            source: scene.id,
                            target: block.timeoutSceneId,
                            label: `Timeout (${block.durationSeconds}s)`,
                            animated: true,
                            style: { stroke: '#fb923c', strokeWidth: 2, strokeDasharray: '5,5' },
                            labelStyle: { fill: '#fed7aa', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb923c' },
                        });
                    }
                } else if (block.type === 'BATTLE_ENCOUNTER') {
                    if (block.victorySceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_win_${block.victorySceneId}`,
                            source: scene.id,
                            target: block.victorySceneId,
                            label: `Win vs ${block.enemyName}`,
                            animated: true,
                            style: { stroke: '#34d399', strokeWidth: 2 },
                            labelStyle: { fill: '#6ee7b7', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
                        });
                    }
                    if (block.defeatSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_lose_${block.defeatSceneId}`,
                            source: scene.id,
                            target: block.defeatSceneId,
                            label: `Lose vs ${block.enemyName}`,
                            animated: true,
                            style: { stroke: '#fb7185', strokeWidth: 2, strokeDasharray: '4,4' },
                            labelStyle: { fill: '#fda4af', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' },
                        });
                    }
                } else if (block.type === 'KEYPAD_PUZZLE') {
                    if (block.unlockSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_unlock_${block.unlockSceneId}`,
                            source: scene.id,
                            target: block.unlockSceneId,
                            label: `Unlocked (${block.secretCode})`,
                            animated: true,
                            style: { stroke: '#34d399', strokeWidth: 2 },
                            labelStyle: { fill: '#6ee7b7', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
                        });
                    }
                    if (block.failSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_fail_${block.failSceneId}`,
                            source: scene.id,
                            target: block.failSceneId,
                            label: 'Lockout Failed',
                            animated: true,
                            style: { stroke: '#fb7185', strokeWidth: 2, strokeDasharray: '4,4' },
                            labelStyle: { fill: '#fda4af', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' },
                        });
                    }
                } else if (block.type === 'QUIZ_CHALLENGE') {
                    if (block.passSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_pass_${block.passSceneId}`,
                            source: scene.id,
                            target: block.passSceneId,
                            label: `Pass (${block.passingScore}+)`,
                            animated: true,
                            style: { stroke: '#34d399', strokeWidth: 2 },
                            labelStyle: { fill: '#6ee7b7', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
                        });
                    }
                    if (block.failSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_fail_${block.failSceneId}`,
                            source: scene.id,
                            target: block.failSceneId,
                            label: 'Quiz Failed',
                            animated: true,
                            style: { stroke: '#fb7185', strokeWidth: 2, strokeDasharray: '4,4' },
                            labelStyle: { fill: '#fda4af', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' },
                        });
                    }
                } else if (block.type === 'QTE_ACTION') {
                    if (block.successSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_hit_${block.successSceneId}`,
                            source: scene.id,
                            target: block.successSceneId,
                            label: 'QTE Hit',
                            animated: true,
                            style: { stroke: '#34d399', strokeWidth: 2 },
                            labelStyle: { fill: '#6ee7b7', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
                        });
                    }
                    if (block.failSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_miss_${block.failSceneId}`,
                            source: scene.id,
                            target: block.failSceneId,
                            label: 'QTE Miss',
                            animated: true,
                            style: { stroke: '#fb7185', strokeWidth: 2, strokeDasharray: '4,4' },
                            labelStyle: { fill: '#fda4af', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' },
                        });
                    }
                } else if (block.type === 'CARD_DUEL') {
                    if (block.victorySceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_win_${block.victorySceneId}`,
                            source: scene.id,
                            target: block.victorySceneId,
                            label: `Duel Win vs ${block.opponentName}`,
                            animated: true,
                            style: { stroke: '#34d399', strokeWidth: 2 },
                            labelStyle: { fill: '#6ee7b7', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#34d399' },
                        });
                    }
                    if (block.defeatSceneId) {
                        result.push({
                            id: `${scene.id}_${block.id}_lose_${block.defeatSceneId}`,
                            source: scene.id,
                            target: block.defeatSceneId,
                            label: `Duel Loss vs ${block.opponentName}`,
                            animated: true,
                            style: { stroke: '#fb7185', strokeWidth: 2, strokeDasharray: '4,4' },
                            labelStyle: { fill: '#fda4af', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#020617', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#fb7185' },
                        });
                    }
                }
            });
        });

        return result;
    }, [scenes]);



    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            changes.forEach((change) => {
                if (change.type === 'position' && change.position) {
                    onMoveSceneNode(change.id, change.position);
                }
            });
        },
        [onMoveSceneNode]
    );

    const handleConnect = useCallback(
        (params: Connection) => {
            if (params.source && params.target) {
                onConnectScenes(params.source, params.target);
            }
        },
        [onConnectScenes]
    );

    return (
        <div className="h-full w-full bg-slate-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onConnect={handleConnect}
                onNodeClick={(_, node) => onSelectScene(node.id)}
                fitView
            >
                <Background color="#1e293b" gap={20} />
                <Controls />
                <MiniMap nodeColor="#4f46e5" maskColor="rgba(2, 6, 23, 0.75)" />
            </ReactFlow>
        </div>
    );
}
