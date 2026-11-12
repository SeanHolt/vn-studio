'use client';

import React, { useState } from 'react';
import { PlayableScene } from './VNPlayer';
import { GameVariables } from '@/lib/vn-engine';
import {
  Bug,
  X,
  Compass,
  Variable,
  Backpack,
  Heart,
  Plus,
  Trash2,
} from 'lucide-react';

interface StoryDebuggerModalProps {
  scenes: PlayableScene[];
  currentSceneId: string;
  currentBlockIndex: number;
  variables: GameVariables;
  inventory: string[];
  affinity: Record<string, number>;
  onJumpToScene: (sceneId: string, blockIdx: number) => void;
  onUpdateVariable: (key: string, value: string | number | boolean) => void;
  onDeleteVariable: (key: string) => void;
  onAddItem: (itemName: string) => void;
  onRemoveItem: (itemName: string) => void;
  onSetAffinity: (characterName: string, score: number) => void;
  onClose: () => void;
}

export default function StoryDebuggerModal({
  scenes,
  currentSceneId,
  currentBlockIndex,
  variables,
  inventory,
  affinity,
  onJumpToScene,
  onUpdateVariable,
  onDeleteVariable,
  onAddItem,
  onRemoveItem,
  onSetAffinity,
  onClose,
}: StoryDebuggerModalProps) {
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarVal, setNewVarVal] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newCharName, setNewCharName] = useState('');

  const activeScene = scenes.find((s) => s.id === currentSceneId);

  const parseSmartValue = (raw: string): string | number | boolean => {
    const trimmed = raw.trim();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    return raw;
  };
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-3.5">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Bug className="h-5 w-5" />
            <span>Creator Story Debugger &amp; Live Inspector</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto p-5 text-xs md:grid-cols-2">
          {/* Scene & Block Warper */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-indigo-400 uppercase">
              <Compass className="h-4 w-4" /> Scene &amp; Block Warper
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-slate-400">Jump to Scene</span>
              <select
                value={currentSceneId}
                onChange={(e) => onJumpToScene(e.target.value, 0)}
                className="rounded border border-slate-700 bg-slate-900 px-2.5 py-2 text-white"
              >
                {scenes.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.sceneType})
                  </option>
                ))}
              </select>
            </label>

            {activeScene && (
              <label className="flex flex-col gap-1">
                <span className="text-slate-400">
                  Jump to Block (Current: #{currentBlockIndex + 1} of{' '}
                  {activeScene.blocks.length})
                </span>
                <select
                  value={currentBlockIndex}
                  onChange={(e) =>
                    onJumpToScene(currentSceneId, Number(e.target.value))
                  }
                  className="rounded border border-slate-700 bg-slate-900 px-2.5 py-2 text-white"
                >
                  {activeScene.blocks.map((blk, idx) => (
                    <option key={blk.id} value={idx}>
                      Block {idx + 1}: {blk.type}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Live Backpack Spawner */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400 uppercase">
              <Backpack className="h-4 w-4" /> Live Inventory Spawner
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newItemName.trim()) return;
                onAddItem(newItemName.trim());
                setNewItemName('');
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                placeholder="Item name (e.g. Brass Key)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-amber-600 px-2.5 py-1.5 font-semibold text-white hover:bg-amber-500"
              >
                <Plus className="h-3.5 w-3.5" /> Give
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {inventory.length === 0 ? (
                <span className="text-slate-500">Backpack is empty.</span>
              ) : (
                inventory.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/50 px-2.5 py-1 text-amber-200"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item)}
                      className="text-amber-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
          {/* Live Global Variables Editor */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-400 uppercase">
              <Variable className="h-4 w-4" /> Live Variables
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleanKey = newVarKey.trim();
                if (!cleanKey) return;
                onUpdateVariable(cleanKey, parseSmartValue(newVarVal));
                setNewVarKey('');
                setNewVarVal('');
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                placeholder="Key"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value)}
                className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-white"
              />
              <input
                type="text"
                placeholder="Value"
                value={newVarVal}
                onChange={(e) => setNewVarVal(e.target.value)}
                className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-emerald-300"
              />
              <button
                type="submit"
                className="rounded bg-emerald-600 px-2.5 py-1.5 font-semibold text-white hover:bg-emerald-500"
              >
                Set
              </button>
            </form>

            <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
              {Object.entries(variables).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-2.5 py-1.5"
                >
                  <span className="truncate font-mono text-slate-300">{k}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={String(v)}
                      onChange={(e) =>
                        onUpdateVariable(k, parseSmartValue(e.target.value))
                      }
                      className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-right font-mono text-emerald-300"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteVariable(k)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Character Affinity Editor */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase">
              <Heart className="h-4 w-4" /> Character Affinity
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCharName.trim()) return;
                onSetAffinity(newCharName.trim(), 1);
                setNewCharName('');
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                placeholder="Character name..."
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                className="flex-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white"
              />
              <button
                type="submit"
                className="rounded bg-rose-600 px-2.5 py-1.5 font-semibold text-white hover:bg-rose-500"
              >
                Track
              </button>
            </form>

            <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
              {Object.keys(affinity).length === 0 ? (
                <span className="text-slate-500">No active bonds tracked.</span>
              ) : (
                Object.entries(affinity).map(([charName, score]) => (
                  <div
                    key={charName}
                    className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900 px-2.5 py-1.5"
                  >
                    <span className="truncate font-semibold text-slate-200">
                      {charName}
                    </span>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) =>
                        onSetAffinity(charName, Number(e.target.value))
                      }
                      className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-right font-mono text-rose-300"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
