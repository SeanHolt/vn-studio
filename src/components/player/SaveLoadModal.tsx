'use client';

import React from 'react';
import { SaveSlotSnapshot, SaveSlotsMap } from '@/lib/vn-save-storage';
import { Save, FolderOpen, Trash2, X, Clock } from 'lucide-react';

interface SaveLoadModalProps {
  slots: SaveSlotsMap;
  onSaveToSlot: (slotId: string, slotLabel: string) => void;
  onLoadFromSlot: (snapshot: SaveSlotSnapshot) => void;
  onDeleteSlot: (slotId: string) => void;
  onClose: () => void;
}

const SLOT_DEFINITIONS = [
  { id: 'slot_auto', label: 'Auto-Save Checkpoint', isAuto: true },
  { id: 'slot_1', label: 'Manual Slot 1', isAuto: false },
  { id: 'slot_2', label: 'Manual Slot 2', isAuto: false },
  { id: 'slot_3', label: 'Manual Slot 3', isAuto: false },
];

export default function SaveLoadModal({
  slots,
  onSaveToSlot,
  onLoadFromSlot,
  onDeleteSlot,
  onClose,
}: SaveLoadModalProps) {
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
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Save className="h-5 w-5" />
            <span>Save &amp; Load Progress</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-5 text-sm">
          {SLOT_DEFINITIONS.map((def) => {
            const existing = slots[def.id];
            return (
              <div
                key={def.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                  def.isAuto
                    ? 'border-indigo-500/30 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-950/80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {def.label}
                    </span>
                    {def.isAuto && (
                      <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                        AUTO
                      </span>
                    )}
                  </div>

                  {existing ? (
                    <div className="mt-1 flex flex-col gap-0.5 text-xs">
                      <span className="font-medium text-emerald-300">
                        Scene: {existing.sceneName}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" /> {existing.savedAt} • Bag:{' '}
                        {existing.inventory.length}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">Empty slot</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!def.isAuto && (
                    <button
                      type="button"
                      onClick={() => onSaveToSlot(def.id, def.label)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                  )}

                  {existing && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadFromSlot(existing);
                          onClose();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        <FolderOpen className="h-3.5 w-3.5" /> Load
                      </button>

                      <button
                        type="button"
                        title="Clear Slot"
                        onClick={() => onDeleteSlot(def.id)}
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
