'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { deleteProject } from '@/app/actions/project-actions';
import { Edit3, Play, Trash2, Layers } from 'lucide-react';

export interface ProjectSummary {
  id: string;
  title: string;
  description: string | null;
  sceneCount: number;
  updatedAtLabel: string;
}

export default function ProjectCard({ project }: { project: ProjectSummary }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteProject(project.id);
    });
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md transition hover:border-slate-700">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-white">{project.title}</h3>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            title="Delete Project"
            className="rounded p-1.5 text-slate-500 hover:bg-red-950/50 hover:text-red-400 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> {project.sceneCount} scene(s)
          </span>
          <span>Updated {project.updatedAtLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={`/editor/${project.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit in Studio
          </Link>

          <Link
            href={`/play/${project.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400" /> Play Game
          </Link>
        </div>
      </div>
    </div>
  );
}
