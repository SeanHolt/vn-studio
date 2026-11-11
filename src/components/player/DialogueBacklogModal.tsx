'use client';

import React, { useEffect, useRef } from 'react';
import { History, X, MessageSquare, GitBranch } from 'lucide-react';

export interface BacklogEntry {
  id: string;
  sceneName: string;
  speaker: string;
  text: string;
  kind: 'DIALOGUE' | 'CHOICE';
}

interface DialogueBacklogModalProps {
  entries: BacklogEntry[];
  onClose: () => void;
}

export default function DialogueBacklogModal({
  entries,
  onClose,
}: DialogueBacklogModalProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
          <div className="flex items-center gap-2 font-bold text-indigo-400">
            <History className="h-5 w-5" />
            <span>Dialogue &amp; Choice History ({entries.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5 text-sm">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">
              No dialogue lines recorded yet. Advance the story to build your log!
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-xl border p-3.5 ${
                  entry.kind === 'CHOICE'
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-950/80'
                }`}
              >
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span
                    className={`flex items-center gap-1.5 font-bold ${
                      entry.kind === 'CHOICE' ? 'text-amber-300' : 'text-indigo-400'
                    }`}
                  >
                    {entry.kind === 'CHOICE' ? (
                      <GitBranch className="h-3 w-3" />
                    ) : (
                      <MessageSquare className="h-3 w-3" />
                    )}
                    {entry.speaker}
                  </span>
                  <span className="text-slate-500">{entry.sceneName}</span>
                </div>

                <p className="leading-relaxed text-slate-200">{entry.text}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
