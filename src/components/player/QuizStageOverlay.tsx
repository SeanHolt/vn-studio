'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/lib/vn-schema';
import { playSynthSound } from '@/lib/vn-audio';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface QuizStageOverlayProps {
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  isMuted: boolean;
  onQuizComplete: (passed: boolean, score: number) => void;
}

export default function QuizStageOverlay({
  title,
  passingScore,
  questions,
  isMuted,
  onQuizComplete,
}: QuizStageOverlayProps) {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions.at(qIndex);

  const handleChooseOption = (optIdx: number) => {
    if (selectedOpt !== null || !currentQ) return;
    setSelectedOpt(optIdx);

    const isCorrect = optIdx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (!isMuted) playSynthSound('synth:chime');
    } else if (!isMuted) {
      playSynthSound('synth:alert');
    }
  };

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setQIndex((prev) => prev + 1);
      setSelectedOpt(null);
    }
  };

  if (isFinished) {
    const passed = score >= passingScore;
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center backdrop-blur-md select-none"
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-2 text-xs font-bold tracking-wider text-indigo-400 uppercase">
            {title} — Results
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {passed ? 'Trial Passed! 🎉' : 'Trial Failed'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            You scored <strong className="text-emerald-400">{score}</strong> out of{' '}
            <strong>{questions.length}</strong> (Needed {passingScore} to pass).
          </p>

          <button
            type="button"
            onClick={() => onQuizComplete(passed, score)}
            className={`mt-6 w-full rounded-xl py-3 text-sm font-bold text-white transition ${
              passed
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            Continue Story →
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm select-none"
    >
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-indigo-500/40 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-indigo-400">
            <HelpCircle className="h-4 w-4" /> {title}
          </span>
          <span className="rounded bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">
            Question {qIndex + 1} / {questions.length} • Score: {score}
          </span>
        </div>

        <h3 className="text-base font-semibold leading-snug text-white sm:text-lg">
          {currentQ.question}
        </h3>

        <div className="flex flex-col gap-2">
          {currentQ.options.map((opt, idx) => {
            const hasAnswered = selectedOpt !== null;
            const isCorrect = idx === currentQ.correctIndex;
            const isChosen = idx === selectedOpt;

            let btnStyle =
              'border-slate-700 bg-slate-950 text-slate-200 hover:border-indigo-400 hover:bg-slate-800';
            if (hasAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200';
              } else if (isChosen) {
                btnStyle = 'border-rose-500 bg-rose-950/60 text-rose-200';
              } else {
                btnStyle = 'border-slate-800 bg-slate-950/50 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleChooseOption(idx)}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${btnStyle}`}
              >
                <span>{opt}</span>
                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                )}
                {hasAnswered && isChosen && !isCorrect && (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {selectedOpt !== null && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5">
            <p className="text-xs text-slate-300">
              {currentQ.explanation ||
                (selectedOpt === currentQ.correctIndex
                  ? 'Spot on!'
                  : `Correct answer: ${currentQ.options[currentQ.correctIndex]}`)}
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              {qIndex + 1 >= questions.length ? 'Finish' : 'Next'}{' '}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
