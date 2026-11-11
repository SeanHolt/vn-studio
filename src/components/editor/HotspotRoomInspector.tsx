'use client';

import React, { useState } from 'react';
import { SceneBlock, HotspotZone } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import AssetPicker from './AssetPicker';
import { Plus, Trash2 } from 'lucide-react';

interface HotspotRoomInspectorProps {
  block: Extract<SceneBlock, { type: 'HOTSPOT_ROOM' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function HotspotRoomInspector({
  block,
  allScenes,
  onChange,
}: HotspotRoomInspectorProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    block.hotspots.at(0)?.id ?? null
  );

  const selectedZone = block.hotspots.find((z) => z.id === selectedZoneId);

  const handleAddZone = () => {
    const newZone: HotspotZone = {
      id: `hz_${crypto.randomUUID()}`,
      label: `Object ${block.hotspots.length + 1}`,
      x: 35,
      y: 35,
      width: 22,
      height: 22,
      actionType: 'INSPECT',
      dialogueText: 'You found something interesting!',
    };
    onChange({ ...block, hotspots: [...block.hotspots, newZone] });
    setSelectedZoneId(newZone.id);
  };

  const updateZone = (zoneId: string, patch: Partial<HotspotZone>) => {
    onChange({
      ...block,
      hotspots: block.hotspots.map((z) => (z.id === zoneId ? { ...z, ...patch } : z)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <AssetPicker
        category="BACKGROUND"
        currentUrl={block.backgroundUrl}
        onSelectUrl={(url) => onChange({ ...block, backgroundUrl: url })}
      />

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Room Instruction Banner</span>
        <input
          type="text"
          value={block.promptText}
          onChange={(e) => onChange({ ...block, promptText: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-amber-300">
          Clickable Hotspots ({block.hotspots.length})
        </span>
        <button
          type="button"
          onClick={handleAddZone}
          className="flex items-center gap-1 rounded bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-500"
        >
          <Plus className="h-3 w-3" /> Add Hotspot
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {block.hotspots.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => setSelectedZoneId(z.id)}
            className={`rounded px-2.5 py-1 text-xs ${
              z.id === selectedZoneId
                ? 'bg-amber-500 font-semibold text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>

      {selectedZone && (
        <div className="flex flex-col gap-2.5 rounded-lg border border-amber-500/30 bg-slate-950 p-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={selectedZone.label}
              onChange={(e) => updateZone(selectedZone.id, { label: e.target.value })}
              className="w-40 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...block,
                  hotspots: block.hotspots.filter((z) => z.id !== selectedZone.id),
                })
              }
              className="text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <label>
              X ({selectedZone.x}%)
              <input
                type="range"
                min={0}
                max={90}
                value={selectedZone.x}
                onChange={(e) => updateZone(selectedZone.id, { x: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            <label>
              Y ({selectedZone.y}%)
              <input
                type="range"
                min={0}
                max={90}
                value={selectedZone.y}
                onChange={(e) => updateZone(selectedZone.id, { y: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            <label>
              Width ({selectedZone.width}%)
              <input
                type="range"
                min={5}
                max={80}
                value={selectedZone.width}
                onChange={(e) => updateZone(selectedZone.id, { width: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            <label>
              Height ({selectedZone.height}%)
              <input
                type="range"
                min={5}
                max={80}
                value={selectedZone.height}
                onChange={(e) => updateZone(selectedZone.id, { height: Number(e.target.value) })}
                className="w-full"
              />
            </label>
          </div>

          <select
            value={selectedZone.actionType}
            onChange={(e) =>
              updateZone(selectedZone.id, {
                actionType: e.target.value as HotspotZone['actionType'],
              })
            }
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
          >
            <option value="INSPECT">Show Inspection Text</option>
            <option value="GIVE_ITEM">Give Inventory Item</option>
            <option value="SET_VARIABLE">Set Variable</option>
            <option value="JUMP_SCENE">Jump to Scene / Room</option>
          </select>

          {selectedZone.actionType === 'JUMP_SCENE' ? (
            <select
              value={selectedZone.targetSceneId ?? ''}
              onChange={(e) => updateZone(selectedZone.id, { targetSceneId: e.target.value })}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
            >
              {allScenes.map((s) => (
                <option key={s.id} value={s.id}>
                  Go to: {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Pop-up message when clicked..."
              value={selectedZone.dialogueText ?? ''}
              onChange={(e) => updateZone(selectedZone.id, { dialogueText: e.target.value })}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
            />
          )}

          {selectedZone.actionType === 'GIVE_ITEM' && (
            <input
              type="text"
              placeholder="Item name (e.g., Rusty Key)"
              value={selectedZone.itemName ?? ''}
              onChange={(e) => updateZone(selectedZone.id, { itemName: e.target.value })}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-amber-300"
            />
          )}

          <input
            type="text"
            placeholder="Optional Required Item to unlock..."
            value={selectedZone.requiredItem ?? ''}
            onChange={(e) =>
              updateZone(selectedZone.id, {
                requiredItem: e.target.value.trim() || undefined,
              })
            }
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-300"
          />
        </div>
      )}
    </div>
  );
}
