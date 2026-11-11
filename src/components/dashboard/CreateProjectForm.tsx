'use client';

import React, { useState, useTransition } from 'react';
import { createProject } from '@/app/actions/project-actions';
import { Plus, Sparkles, FileText } from 'lucide-react';

export default function CreateProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<'BLANK' | 'MYSTERY_STARTER'>('MYSTERY_STARTER');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createProject(title, description, template);
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" /> New Game Project
      </button>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-indigo-500/40 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-lg font-bold text-white">Create a New Visual Novel</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-300">Project Title</span>
            <input
              type="text"
              required
              placeholder="e.g., Mystery at Starlight Station"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-300">Short Description (Optional)</span>
            <input
              type="text"
              placeholder="A brief summary of your story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTemplate('MYSTERY_STARTER')}
            className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition ${
              template === 'MYSTERY_STARTER'
                ? 'border-indigo-500 bg-indigo-950/40'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
            <div>
              <div className="text-sm font-semibold text-white">2-Scene Starter Template</div>
              <div className="text-xs text-slate-400">
                Pre-wired with dialogue, a choice branch, an ending, and a sample variable.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTemplate('BLANK')}
            className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition ${
              template === 'BLANK'
                ? 'border-indigo-500 bg-indigo-950/40'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-white">Blank Canvas</div>
              <div className="text-xs text-slate-400">
                Start fresh with a single empty scene and build everything yourself.
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create & Open Studio'}
          </button>
        </div>
      </form>
    </div>
  );
}
