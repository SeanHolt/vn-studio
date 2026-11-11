'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { remixProject } from '@/app/actions/remix-actions';
import {
  Play,
  GitFork,
  Search,
  Layers,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

export interface ArcadeProjectCard {
  id: string;
  title: string;
  description: string | null;
  authorName: string;
  isDemo: boolean;
  sceneCount: number;
  genres: string[];
  theme: string;
}

interface ArcadeBrowserProps {
  projects: ArcadeProjectCard[];
  isLoggedIn: boolean;
}

const GENRE_FILTERS = [
  { id: 'ALL', label: 'All Games' },
  { id: 'VISUAL_NOVEL', label: 'Visual Novels' },
  { id: 'SANDBOX', label: 'Point & Click' },
  { id: 'TOPDOWN', label: '2D Top-Down RPG' },
  { id: 'BATTLE', label: 'Turn-Based Battle' },
];

export default function ArcadeBrowser({
  projects,
  isLoggedIn,
}: ArcadeBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((proj) => {
      const matchesGenre =
        selectedGenre === 'ALL' || proj.genres.includes(selectedGenre);
      const matchesText =
        !q ||
        proj.title.toLowerCase().includes(q) ||
        proj.authorName.toLowerCase().includes(q) ||
        (proj.description ?? '').toLowerCase().includes(q);
      return matchesGenre && matchesText;
    });
  }, [projects, searchQuery, selectedGenre]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search games or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pr-3 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {GENRE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedGenre(filter.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedGenre === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-sm text-slate-400">
          No published games match your current search or filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((proj) => {
            const playHref = proj.isDemo ? '/play/demo' : `/play/${proj.id}`;
            const remixAction = remixProject.bind(null, proj.id);

            return (
              <div
                key={proj.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg transition hover:border-indigo-500/50"
              >
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex flex-wrap gap-1">
                      {proj.genres.map((g) => (
                        <span
                          key={g}
                          className="rounded-full border border-indigo-500/30 bg-indigo-950/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-300"
                        >
                          {g.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {proj.sceneCount}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">
                    {proj.description || 'An interactive adventure created in VN Studio.'}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-800/80 pt-4">
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                      {proj.authorName}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                      <Sparkles className="h-3 w-3 text-indigo-400" /> {proj.theme}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={playHref}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <Play className="h-3.5 w-3.5" /> Play
                    </Link>

                    {isLoggedIn ? (
                      <form action={remixAction}>
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                        >
                          <GitFork className="h-3.5 w-3.5 text-emerald-400" /> Remix
                        </button>
                      </form>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                      >
                        <GitFork className="h-3.5 w-3.5 text-emerald-400" /> Sign in to Remix
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
