'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/lib/vn-schema';
import { playSynthSound } from '@/lib/vn-audio';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Clock } from 'lucide-react';

interface QuizStageOverlayProps {
  title: string;
  passingScore: number;
  enableFiftyFifty?: boolean;
  secondsPerQuestion?: number;
  questions: QuizQuestion[];
  isMuted: boolean;
  onPass: () => void;
  onFail: () => void;
}

export default function QuizStageOverlay({
  title,
  passingScore,
  enableFiftyFifty = true,
  secondsPerQuestion = 0,
  questions,
  isMuted,
  onPass,
  onFail,
}: QuizStageOverlayProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion);

  const currentQ = questions.at(currentIdx);

  const advanceQuestion = (nextScore: number) => {
    window.setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOpt(null);
        setEliminatedIndices([]);
        setTimeLeft(secondsPerQuestion);
      } else {
        setIsFinished(true);
        const passed = nextScore >= passingScore;
        if (passed && !isMuted) playSynthSound('synth:chime');
        if (!passed && !isMuted) playSynthSound('synth:alert');
        window.setTimeout(() => {
          if (passed) onPass();
          else onFail();
        }, 1150);
      }
    }, 850);
  };

  useEffect(() => {
    if (secondsPerQuestion <= 0 || selectedOpt !== null || isFinished || !currentQ) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setSelectedOpt(-1);
          if (!isMuted) playSynthSound('synth:alert');
          advanceQuestion(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  });

  if (!currentQ) return null;

  const handleUseFiftyFifty = () => {
    if (fiftyFiftyUsed || selectedOpt !== null || currentQ.options.length < 3) {
      return;
    }
    const wrongIndices = currentQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentQ.correctIndex);

    const toHide = wrongIndices.slice(0, 2);
    setEliminatedIndices(toHide);
    setFiftyFiftyUsed(true);
    if (!isMuted) playSynthSound('synth:pickup');
  };

  const handleAnswer = (optIdx: number) => {
    if (selectedOpt !== null || eliminatedIndices.includes(optIdx)) return;
    setSelectedOpt(optIdx);

    const isCorrect = optIdx === currentQ.correctIndex;
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);

    if (!isMuted) {
      playSynthSound(isCorrect ? 'synth:pickup' : 'synth:alert');
    }

    advanceQuestion(nextScore);
  };
  const passedFinal = score >= passingScore;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/88 p-4 backdrop-blur-md select-none"
    >
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-indigo-500/40 bg-slate-900/95 p-6 shadow-2xl">
        {/* Top Progress, 50/50 Lifeline & Timer Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
          <span className="flex items-center gap-1.5 font-bold text-indigo-400">
            <HelpCircle className="h-4 w-4" /> {title}
          </span>

          <div className="flex items-center gap-2 font-mono">
            {secondsPerQuestion > 0 && !isFinished && (
              <span
                className={`flex items-center gap-1 rounded px-2 py-0.5 font-bold ${
                  timeLeft <= 5
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-amber-300'
                }`}
              >
                <Clock className="h-3 w-3" /> {timeLeft}s
              </span>
            )}

            {enableFiftyFifty && !isFinished && currentQ.options.length >= 3 && (
              <button
                type="button"
                disabled={fiftyFiftyUsed || selectedOpt !== null}
                onClick={handleUseFiftyFifty}
                className={`flex items-center gap-1 rounded px-2 py-0.5 font-bold transition ${
                  fiftyFiftyUsed
                    ? 'bg-slate-800 text-slate-600 line-through'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                <Sparkles className="h-3 w-3" /> 50/50
              </button>
            )}

            <span className="text-slate-300">
              Q {currentIdx + 1}/{questions.length} • Score: {score}
            </span>
          </div>
        </div>

        {isFinished ? (
          <div className="my-4 flex flex-col items-center gap-2 text-center">
            {passedFinal ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                <h3 className="text-lg font-extrabold text-emerald-300">
                  Challenge Passed! ({score} / {questions.length})
                </h3>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-rose-400" />
                <h3 className="text-lg font-extrabold text-rose-300">
                  Score: {score} / {questions.length} (Needed {passingScore})
                </h3>
              </>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-sm font-bold leading-relaxed text-white sm:text-base">
              {currentQ.question}
            </h3>

            {selectedOpt === -1 && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/60 px-3 py-1.5 text-center text-xs font-bold text-rose-200">
                ⏰ Time expired!
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {currentQ.options.map((opt, idx) => {
                const isHidden = eliminatedIndices.includes(idx);
                let btnStyle =
                  'border-slate-700 bg-slate-950 text-slate-200 hover:border-indigo-400';

                if (isHidden) {
                  btnStyle =
                    'border-slate-800/50 bg-slate-950/30 text-slate-700 line-through opacity-40';
                } else if (selectedOpt !== null) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold';
                  } else if (idx === selectedOpt) {
                    btnStyle =
                      'border-rose-500 bg-rose-950/70 text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={selectedOpt !== null || isHidden}
                    onClick={() => handleAnswer(idx)}
                    className={`rounded-xl border px-4 py-3 text-left text-xs font-medium transition ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
