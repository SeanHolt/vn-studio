'use client';

import React from 'react';
import { ValidationIssue } from '@/lib/vn-validator';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  X,
  ArrowUpRight,
} from 'lucide-react';

interface StoryValidatorModalProps {
  issues: ValidationIssue[];
  onJumpToIssue: (sceneId: string, blockId?: string) => void;
  onClose: () => void;
}

export default function StoryValidatorModal({
  issues,
  onJumpToIssue,
  onClose,
}: StoryValidatorModalProps) {
  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2 font-bold text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
            <span>Story Link &amp; Dead-End Validator</span>
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
          {issues.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-8 text-center">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                All Links &amp; Paths Verified!
              </h3>
              <p className="text-xs text-slate-300">
                Zero broken scene links, zero dead-ends, and zero unreachable
                scenes were found.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full border border-rose-500/40 bg-rose-950/50 px-3 py-1 font-semibold text-rose-300">
                  {errorCount} Error(s)
                </span>
                <span className="rounded-full border border-amber-500/40 bg-amber-950/50 px-3 py-1 font-semibold text-amber-300">
                  {warningCount} Warning(s)
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 ${
                      issue.severity === 'ERROR'
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : 'border-amber-500/30 bg-amber-950/15'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {issue.severity === 'ERROR' ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">
                          {issue.sceneName}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-300">
                          {issue.message}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onJumpToIssue(issue.sceneId, issue.blockId);
                        onClose();
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white"
                    >
                      Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
