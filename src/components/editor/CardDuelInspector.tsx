'use client';

import React from 'react';
import { SceneBlock } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { DUEL_DECKS, DeckThemeId } from '@/lib/vn-card-duel';

interface CardDuelInspectorProps {
  block: Extract<SceneBlock, { type: 'CARD_DUEL' }>;
  allScenes: ScenePayload[];
  onChange: (updated: SceneBlock) => void;
}

export default function CardDuelInspector({
  block,
  allScenes,
  onChange,
}: CardDuelInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Opponent Name</span>
        <input
          type="text"
          value={block.opponentName}
          onChange={(e) =>
            onChange({ ...block, opponentName: e.target.value })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Card Deck Theme</span>
        <select
          value={block.deckTheme}
          onChange={(e) =>
            onChange({
              ...block,
              deckTheme: e.target.value as DeckThemeId,
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
        >
          {Object.entries(DUEL_DECKS).map(([id, cfg]) => (
            <option key={id} value={id}>
              {cfg.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">
          Rounds Needed to Win (First to {block.roundsToWin})
        </span>
        <input
          type="number"
          min={1}
          max={5}
          value={block.roundsToWin}
          onChange={(e) =>
            onChange({
              ...block,
              roundsToWin: Math.max(1, Math.min(5, Number(e.target.value))),
            })
          }
          className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-amber-300"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Victory → Jump to Scene
        </span>
        <select
          value={block.victorySceneId}
          onChange={(e) =>
            onChange({ ...block, victorySceneId: e.target.value })
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
          On Defeat → Jump to Scene
        </span>
        <select
          value={block.defeatSceneId}
          onChange={(e) =>
            onChange({ ...block, defeatSceneId: e.target.value })
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
    </div>
  );
}
