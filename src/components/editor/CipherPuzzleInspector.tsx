'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { CIPHER_PRESETS, CipherThemeId } from '@/lib/vn-cipher';
import { Sparkles } from 'lucide-react';

interface CipherPuzzleInspectorProps {
  block: Extract<SceneBlock, { type: 'CIPHER_PUZZLE' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function CipherPuzzleInspector({
  block,
  allScenes,
  onChange,
}: CipherPuzzleInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* One-Click Cipher Presets */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300">
          <Sparkles className="h-3 w-3" /> Load Cipher Preset:
        </span>
        <div className="flex flex-col gap-1">
          {Object.entries(CIPHER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                onChange({
                  ...block,
                  title: preset.title,
                  clueText: preset.clueText,
                  secretPhrase: preset.secretPhrase,
                  theme: preset.theme,
                })
              }
              className="rounded bg-slate-900 px-2.5 py-1.5 text-left text-[11px] text-slate-200 hover:bg-cyan-600 hover:text-white"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Terminal Title</span>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Visual Theme</span>
          <select
            value={block.theme}
            onChange={(e) =>
              onChange({
                ...block,
                theme: e.target.value as CipherThemeId,
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="SCIFI">Sci-Fi Quantum</option>
            <option value="ANCIENT">Ancient Parchment</option>
            <option value="CYBER">Cyber Matrix</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          Secret Word or Phrase (Letters A–Z)
        </span>
        <input
          type="text"
          value={block.secretPhrase}
          onChange={(e) =>
            onChange({
              ...block,
              secretPhrase: e.target.value.toUpperCase(),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-emerald-300 uppercase"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Clue / Hint for Player</span>
        <input
          type="text"
          value={block.clueText}
          onChange={(e) => onChange({ ...block, clueText: e.target.value })}
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Max Wrong Letter Guesses (3–12)
        </span>
        <input
          type="number"
          min={3}
          max={12}
          value={block.maxWrongGuesses}
          onChange={(e) =>
            onChange({
              ...block,
              maxWrongGuesses: Math.max(
                3,
                Math.min(12, Number(e.target.value))
              ),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Decrypted → Jump to Scene
        </span>
        <select
          value={block.unlockSceneId}
          onChange={(e) =>
            onChange({ ...block, unlockSceneId: e.target.value })
          }
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
        <span className="text-xs text-rose-400">
          On Lockout (Out of Tries) → Jump to Scene
        </span>
        <select
          value={block.failSceneId ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              failSceneId: e.target.value || undefined,
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
        >
          <option value="">(Continue to next block)</option>
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
