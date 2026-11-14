'use client';

import React from 'react';
import { SceneBlock, CustomDuelCard } from '@/lib/vn-schema';
import { ScenePayload } from '@/app/actions/editor-actions';
import { DeckThemeId, CardElement, DUEL_DECKS } from '@/lib/vn-card-duel';
import { Plus, Trash2 } from 'lucide-react';

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
  const customCards = block.customCards ?? [];

  const handleSelectTheme = (nextTheme: DeckThemeId) => {
    if (nextTheme === 'CUSTOM' && customCards.length === 0) {
      const seeded: CustomDuelCard[] = DUEL_DECKS.ELEMENTAL.cards.map((c) => ({
        id: `cc_${crypto.randomUUID()}`,
        name: c.name,
        icon: c.icon,
        element: c.element,
        power: c.power,
      }));
      onChange({ ...block, deckTheme: 'CUSTOM', customCards: seeded });
      return;
    }
    onChange({ ...block, deckTheme: nextTheme });
  };

  const handleAddCard = () => {
    const newCard: CustomDuelCard = {
      id: `cc_${crypto.randomUUID()}`,
      name: `Arcane Card #${customCards.length + 1}`,
      icon: '🃏',
      element: 'BLAZE',
      power: 5,
    };
    onChange({ ...block, customCards: [...customCards, newCard] });
  };

  const updateCard = (id: string, patch: Partial<CustomDuelCard>) => {
    onChange({
      ...block,
      customCards: customCards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Duel Title</span>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Opponent Name</span>
          <input
            type="text"
            value={block.opponentName}
            onChange={(e) =>
              onChange({ ...block, opponentName: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-rose-300"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Card Deck</span>
          <select
            value={block.deckTheme}
            onChange={(e) => handleSelectTheme(e.target.value as DeckThemeId)}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="ELEMENTAL">🔥 Elemental Sorcery</option>
            <option value="CYBER_HACK">💻 Cyber Netrunner</option>
            <option value="PIRATE_FLEET">🏴‍☠️ Sky Pirate Fleet</option>
            <option value="CUSTOM">✨ Custom Card Builder</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Rounds to Win (1–5)</span>
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
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-amber-300"
          />
        </label>
      </div>
      {/* Special Mana Ultimate Toggle */}
      <div className="flex flex-col gap-2 rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-2.5 text-xs">
        <label className="flex items-center justify-between gap-2">
          <span className="text-indigo-200">
            ⚡ Enable Mana Ultimate Surge (+4 Power)
          </span>
          <input
            type="checkbox"
            checked={block.enableManaUltimate ?? true}
            onChange={(e) =>
              onChange({ ...block, enableManaUltimate: e.target.checked })
            }
            className="accent-indigo-500"
          />
        </label>

        {(block.enableManaUltimate ?? true) && (
          <input
            type="text"
            placeholder="Ultimate Ability Name..."
            value={block.ultimateName ?? 'Astral Overdrive'}
            onChange={(e) =>
              onChange({ ...block, ultimateName: e.target.value })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-indigo-300"
          />
        )}
      </div>

      {/* Custom Card Builder List */}
      {block.deckTheme === 'CUSTOM' && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Custom Deck ({customCards.length} cards)
            </span>
            <button
              type="button"
              onClick={handleAddCard}
              className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
            >
              <Plus className="h-3 w-3" /> Add Card
            </button>
          </div>

          <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
            {customCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col gap-1 rounded border border-slate-800 bg-slate-900 p-1.5 text-xs"
              >
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) =>
                      updateCard(card.id, { icon: e.target.value })
                    }
                    className="w-7 rounded border border-slate-700 bg-slate-950 py-0.5 text-center"
                  />
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) =>
                      updateCard(card.id, { name: e.target.value })
                    }
                    className="flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-white"
                  />
                  {customCards.length > 3 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...block,
                          customCards: customCards.filter(
                            (c) => c.id !== card.id
                          ),
                        })
                      }
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <select
                    value={card.element}
                    onChange={(e) =>
                      updateCard(card.id, {
                        element: e.target.value as CardElement,
                      })
                    }
                    className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-slate-200"
                  >
                    <option value="BLAZE">🔥 Blaze (Beats Vine)</option>
                    <option value="TIDE">🌊 Tide (Beats Blaze)</option>
                    <option value="VINE">🌿 Vine (Beats Tide)</option>
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    title="Card Power"
                    value={card.power}
                    onChange={(e) =>
                      updateCard(card.id, {
                        power: Math.max(1, Math.min(20, Number(e.target.value))),
                      })
                    }
                    className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-amber-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs text-emerald-400">
          On Duel Victory → Jump to Scene
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
          On Duel Defeat → Jump to Scene
        </span>
        <select
          value={block.defeatSceneId ?? ''}
          onChange={(e) =>
            onChange({
              ...block,
              defeatSceneId: e.target.value || undefined,
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
