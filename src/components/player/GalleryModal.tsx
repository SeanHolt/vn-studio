'use client';

import React from 'react';
import { Trophy, Lock, CheckCircle2, X } from 'lucide-react';

export interface AchievementDef {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
}

export interface EndingDef {
  id: string;
  name: string;
}

interface GalleryModalProps {
  allAchievements: AchievementDef[];
  unlockedIds: string[];
  allEndings: EndingDef[];
  discoveredEndingIds: string[];
  onClose: () => void;
}

export default function GalleryModal({
  allAchievements,
  unlockedIds,
  allEndings,
  discoveredEndingIds,
  onClose,
}: GalleryModalProps) {
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
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Trophy className="h-5 w-5" />
            <span>Achievements &amp; Endings Gallery</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-5 text-sm">
          <div>
            <div className="mb-3 flex items-center justify-between text-xs font-bold tracking-wider text-slate-400 uppercase">
              <span>Endings Discovered</span>
              <span className="text-emerald-400">
                {discoveredEndingIds.length} / {allEndings.length}
              </span>
            </div>

            {allEndings.length === 0 ? (
              <p className="text-xs text-slate-500">No ending scenes defined in this project.</p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {allEndings.map((ending, idx) => {
                  const isFound = discoveredEndingIds.includes(ending.id);
                  return (
                    <div
                      key={ending.id}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 ${
                        isFound
                          ? 'border-emerald-500/40 bg-emerald-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/70 text-slate-500'
                      }`}
                    >
                      {isFound ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                      )}
                      <span className="truncate text-xs font-semibold">
                        {isFound ? ending.name : `Ending #${idx + 1} (Undiscovered)`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-xs font-bold tracking-wider text-slate-400 uppercase">
              <span>Achievements</span>
              <span className="text-amber-400">
                {unlockedIds.length} / {allAchievements.length}
              </span>
            </div>

            {allAchievements.length === 0 ? (
              <p className="text-xs text-slate-500">
                No achievements added to this story yet.
              </p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {allAchievements.map((ach) => {
                  const isUnlocked = unlockedIds.includes(ach.achievementId);
                  return (
                    <div
                      key={ach.achievementId}
                      className={`flex items-start gap-3 rounded-xl border p-3 ${
                        isUnlocked
                          ? 'border-amber-500/40 bg-amber-950/25 text-white'
                          : 'border-slate-800 bg-slate-950/70 text-slate-500'
                      }`}
                    >
                      <span className="text-xl">
                        {isUnlocked ? ach.icon : '🔒'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold">
                          {isUnlocked ? ach.title : 'Secret Achievement'}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {isUnlocked
                            ? ach.description
                            : 'Keep exploring to unlock this badge!'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
