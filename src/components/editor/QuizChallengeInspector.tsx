'use client';

import React from 'react';
import { SceneBlock, QuizQuestion } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { buildPresetQuestions, TriviaPresetItem } from '@/lib/vn-trivia-presets';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface QuizChallengeInspectorProps {
  block: Extract<SceneBlock, { type: 'QUIZ_CHALLENGE' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function QuizChallengeInspector({
  block,
  allScenes,
  onChange,
}: QuizChallengeInspectorProps) {
  const handleLoadPack = (category: TriviaPresetItem['category']) => {
    const generated = buildPresetQuestions(category);
    onChange({
      ...block,
      questions: generated,
      passingScore: Math.max(1, Math.ceil(generated.length * 0.6)),
    });
  };

  const handleAddBlankQuestion = () => {
    const nextQ: QuizQuestion = {
      id: `qq_${crypto.randomUUID()}`,
      question: 'New trivia question or riddle...',
      options: ['Correct Answer', 'Wrong Option B', 'Wrong Option C'],
      correctIndex: 0,
      explanation: '',
    };
    onChange({ ...block, questions: [...block.questions, nextQ] });
  };

  const updateQuestion = (qId: string, patch: Partial<QuizQuestion>) => {
    onChange({
      ...block,
      questions: block.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Challenge Title</span>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">
            Pass Score (of {block.questions.length})
          </span>
          <input
            type="number"
            min={1}
            max={block.questions.length}
            value={block.passingScore}
            onChange={(e) =>
              onChange({
                ...block,
                passingScore: Math.max(
                  1,
                  Math.min(block.questions.length, Number(e.target.value))
                ),
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-emerald-300"
          />
        </label>
      </div>

      {/* One-Click Preset Packs */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-2.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300">
          <Sparkles className="h-3 w-3" /> Load 5-Question Preset Pack:
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleLoadPack('SCIFI_MOVIES')}
            className="rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-200 hover:bg-indigo-600 hover:text-white"
          >
            🚀 Sci-Fi Movies
          </button>
          <button
            type="button"
            onClick={() => handleLoadPack('FANTASY_MOVIES')}
            className="rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-200 hover:bg-indigo-600 hover:text-white"
          >
            🐉 Fantasy Movies
          </button>
          <button
            type="button"
            onClick={() => handleLoadPack('SCIFI_FANTASY_TV')}
            className="rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-200 hover:bg-indigo-600 hover:text-white"
          >
            📺 Sci-Fi / Fantasy TV
          </button>
          <button
            type="button"
            onClick={() => handleLoadPack('RIDDLES')}
            className="rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-200 hover:bg-indigo-600 hover:text-white"
          >
            🧩 Classic Riddles
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">
          Questions ({block.questions.length})
        </span>
        <button
          type="button"
          onClick={handleAddBlankQuestion}
          className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
        >
          <Plus className="h-3 w-3" /> Add Question
        </button>
      </div>

      <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
        {block.questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400">
                Q{qIdx + 1}
              </span>
              {block.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...block,
                      questions: block.questions.filter((item) => item.id !== q.id),
                    })
                  }
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <textarea
              rows={2}
              value={q.question}
              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              className="rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-white"
            />

            <div className="flex flex-col gap-1">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={`correct_${q.id}`}
                    checked={q.correctIndex === optIdx}
                    onChange={() => updateQuestion(q.id, { correctIndex: optIdx })}
                    title="Mark as correct answer"
                    className="accent-emerald-500"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const nextOpts = [...q.options];
                      nextOpts[optIdx] = e.target.value;
                      updateQuestion(q.id, { options: nextOpts });
                    }}
                    className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pass / Fail Routing */}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">On Pass → Jump to Scene</span>
        <select
          value={block.passSceneId}
          onChange={(e) => onChange({ ...block, passSceneId: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
        >
          {allScenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-rose-400">On Fail → Jump to Scene</span>
        <select
          value={block.failSceneId}
          onChange={(e) => onChange({ ...block, failSceneId: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
        >
          {allScenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
