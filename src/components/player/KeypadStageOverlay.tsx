'use client';

import React, { useState } from 'react';
import { playSynthSound } from '@/lib/vn-audio';
import { Lock, Delete, Check, HelpCircle } from 'lucide-react';

interface KeypadStageOverlayProps {
  lockMode: 'PIN' | 'PASSWORD';
  promptText: string;
  hintText?: string;
  secretCode: string;
  maxAttempts: number;
  isMuted: boolean;
  onUnlock: () => void;
  onFailOut: () => void;
}

const KEYPAD_BUTTONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];

export default function KeypadStageOverlay({
  lockMode,
  promptText,
  hintText,
  secretCode,
  maxAttempts,
  isMuted,
  onUnlock,
  onFailOut,
}: KeypadStageOverlayProps) {
  const [entry, setEntry] = useState('');
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isWrongShake, setIsWrongShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const verifySubmission = (candidate: string) => {
    const cleanInput = candidate.trim().toLowerCase();
    const cleanSecret = secretCode.trim().toLowerCase();

    if (cleanInput && cleanInput === cleanSecret) {
      if (!isMuted) playSynthSound('synth:chime');
      setStatusMsg('ACCESS GRANTED');
      window.setTimeout(() => onUnlock(), 500);
      return;
    }

    if (!isMuted) playSynthSound('synth:alert');
    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);
    setEntry('');
    setIsWrongShake(true);
    window.setTimeout(() => setIsWrongShake(false), 450);

    if (maxAttempts > 0 && nextAttempts >= maxAttempts) {
      setStatusMsg('LOCKOUT TRIGGERED!');
      window.setTimeout(() => onFailOut(), 650);
    } else {
      const left = maxAttempts > 0 ? ` (${maxAttempts - nextAttempts} tries left)` : '';
      setStatusMsg(`INCORRECT CODE${left}`);
    }
  };

  const handlePadPress = (key: string) => {
    if (key === 'C') {
      setEntry('');
      setStatusMsg(null);
      return;
    }
    if (key === 'OK') {
      verifySubmission(entry);
      return;
    }
    if (entry.length < 12) {
      setEntry((prev) => `${prev}${key}`);
      setStatusMsg(null);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm select-none"
    >
      <div
        className={`flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl ${
          isWrongShake ? 'animate-vn-shake border-rose-500' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-400 uppercase">
            <Lock className="h-3.5 w-3.5" /> Security Lock
          </span>
          {hintText && (
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Hint
            </button>
          )}
        </div>

        <p className="text-xs font-medium text-slate-200">{promptText}</p>

        {showHint && hintText && (
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 text-[11px] text-indigo-200">
            Clue: {hintText}
          </div>
        )}

        {lockMode === 'PIN' ? (
          <>
            <div className="flex h-11 items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-3 font-mono text-lg tracking-widest text-emerald-400">
              <span>{entry || '----'}</span>
              {entry.length > 0 && (
                <button
                  type="button"
                  onClick={() => setEntry((prev) => prev.slice(0, -1))}
                  className="text-slate-500 hover:text-white"
                >
                  <Delete className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {KEYPAD_BUTTONS.map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handlePadPress(btn)}
                  className={`rounded-lg py-2.5 font-mono text-sm font-bold transition ${
                    btn === 'OK'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : btn === 'C'
                        ? 'bg-rose-950/80 text-rose-300 hover:bg-rose-900'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifySubmission(entry);
            }}
            className="flex flex-col gap-2.5"
          >
            <input
              type="text"
              autoFocus
              placeholder="Enter password..."
              value={entry}
              onChange={(e) => {
                setEntry(e.target.value);
                setStatusMsg(null);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-sm text-emerald-400 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Check className="h-4 w-4" /> Unlock
            </button>
          </form>
        )}

        {statusMsg && (
          <div
            className={`text-center font-mono text-xs font-bold ${
              statusMsg === 'ACCESS GRANTED' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
