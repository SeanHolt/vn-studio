'use client';

import React, { useState } from 'react';
import {
  SaveSlotData,
  listSaveSlots,
  writeSaveSlot,
  deleteSaveSlot,
} from '@/lib/vn-saves';
import {
  LocalSlot0Record,
  readLocalSlot0,
  resetAllSlot0,
} from '@/lib/vn-autosave';
import { Save, FolderOpen, Trash2, X, Cloud, HardDrive } from 'lucide-react';

interface SaveLoadModalProps {
  projectId: string;
  isSignedIn: boolean;
  currentState: Omit<SaveSlotData, 'savedAt'>;
  onLoadSlot: (slotData: SaveSlotData) => void;
  onClose: () => void;
}

export default function SaveLoadModal({
  projectId,
  isSignedIn,
  currentState,
  onLoadSlot,
  onClose,
}: SaveLoadModalProps) {
  const [slots, setSlots] = useState<(SaveSlotData | null)[]>(() =>
    listSaveSlots(projectId)
  );
  const [slot0, setSlot0] = useState<LocalSlot0Record | null>(() =>
    readLocalSlot0(projectId)
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSave = (index: number) => {
    writeSaveSlot(projectId, index, currentState);
    setSlots(listSaveSlots(projectId));
    setStatusMsg(`Saved to Manual Slot ${index + 1}!`);
  };

  const handleDelete = (index: number) => {
    deleteSaveSlot(projectId, index);
    setSlots(listSaveSlots(projectId));
    setStatusMsg(`Cleared Manual Slot ${index + 1}.`);
  };

  const handleLoadSlot0 = () => {
    if (!slot0) return;
    const raw = slot0.stateJson as Partial<SaveSlotData>;
    if (!raw.currentSceneId) return;

    onLoadSlot({
      savedAt: new Date(slot0.savedAtMs).toISOString(),
      sceneName: slot0.sceneName,
      currentSceneId: raw.currentSceneId,
      blockIndex: typeof raw.blockIndex === 'number' ? raw.blockIndex : 0,
      backgroundUrl:
        typeof raw.backgroundUrl === 'string'
          ? raw.backgroundUrl
          : currentState.backgroundUrl,
      variables: raw.variables ?? currentState.variables,
      inventory: Array.isArray(raw.inventory) ? raw.inventory : [],
      affinity: raw.affinity ?? {},
      clock: raw.clock ?? currentState.clock,
      characters: raw.characters ?? {},
    });
    onClose();
  };

  const handleClearSlot0 = async () => {
    await resetAllSlot0(projectId, isSignedIn);
    setSlot0(null);
    setStatusMsg('Cleared Slot 0 Auto-Save.');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Save className="h-4 w-4 text-indigo-400" /> Save &amp; Load Progress
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-300">
            {statusMsg}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Slot 0: Automatic Checkpoint (Local + DB when Signed In) */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-3.5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-300">
                <span>Slot 0 • Auto-Save</span>
                {isSignedIn ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    <Cloud className="h-2.5 w-2.5" /> Cloud + Local
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    <HardDrive className="h-2.5 w-2.5" /> Local Only (Sign in for Cloud)
                  </span>
                )}
              </div>

              {slot0 ? (
                <div className="mt-0.5 truncate text-xs text-slate-200">
                  {slot0.sceneName}{' '}
                  <span className="text-[11px] text-slate-400">
                    ({new Date(slot0.savedAtMs).toLocaleString()})
                  </span>
                </div>
              ) : (
                <div className="mt-0.5 text-xs italic text-slate-500">
                  No auto-save recorded yet
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {slot0 && (
                <>
                  <button
                    type="button"
                    onClick={handleLoadSlot0}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    <FolderOpen className="h-3.5 w-3.5" /> Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleClearSlot0()}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:text-rose-400"
                    title="Clear Auto-Save"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Slots 1-3: Manual Local Save Slots */}
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-300">
                  Manual Slot {idx + 1}
                </div>
                {slot ? (
                  <div className="mt-0.5 truncate text-xs text-slate-300">
                    {slot.sceneName}{' '}
                    <span className="text-[11px] text-slate-500">
                      ({new Date(slot.savedAt).toLocaleString()})
                    </span>
                  </div>
                ) : (
                  <div className="mt-0.5 text-xs italic text-slate-600">
                    Empty Slot
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSave(idx)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <Save className="h-3.5 w-3.5" /> Save
                </button>

                {slot && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadSlot(slot);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      <FolderOpen className="h-3.5 w-3.5" /> Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
