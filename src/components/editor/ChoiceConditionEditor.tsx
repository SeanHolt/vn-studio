'use client';

import React from 'react';
import { ChoiceOption } from '@/lib/vn-schema';
import { GameVariables } from '@/lib/vn-engine';
import { Lock, Unlock } from 'lucide-react';

interface ChoiceConditionEditorProps {
  condition: ChoiceOption['condition'];
  variables: GameVariables;
  onChange: (nextCondition: ChoiceOption['condition']) => void;
}

type Operator = NonNullable<ChoiceOption['condition']>['operator'];

export default function ChoiceConditionEditor({
  condition,
  variables,
  onChange,
}: ChoiceConditionEditorProps) {
  const varKeys = Object.keys(variables);

  if (!condition) {
    return (
      <button
        type="button"
        disabled={varKeys.length === 0}
        onClick={() => {
          const firstKey = varKeys[0];
          if (!firstKey) return;
          const sample = variables[firstKey];
          const defaultVal =
            typeof sample === 'boolean' ? true : typeof sample === 'number' ? 1 : '';
          onChange({ variableKey: firstKey, operator: '==', value: defaultVal });
        }}
        className="flex items-center gap-1 self-start text-[11px] text-slate-400 hover:text-amber-400 disabled:opacity-40"
      >
        <Unlock className="h-3 w-3" />
        {varKeys.length === 0 ? 'Add global variables to lock choice' : '+ Add Condition Rule'}
      </button>
    );
  }

  const targetSample = variables[condition.variableKey];

  return (
    <div className="mt-1 flex flex-col gap-1.5 rounded border border-amber-500/30 bg-amber-950/20 p-2">
      <div className="flex items-center justify-between text-[11px] font-medium text-amber-300">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" /> Show only if:
        </span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-slate-400 hover:text-red-400"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-12 gap-1">
        <select
          value={condition.variableKey}
          onChange={(e) => {
            const nextKey = e.target.value;
            const sample = variables[nextKey];
            const defaultVal =
              typeof sample === 'boolean' ? true : typeof sample === 'number' ? 1 : '';
            onChange({ ...condition, variableKey: nextKey, value: defaultVal });
          }}
          className="col-span-5 rounded border border-slate-800 bg-slate-900 px-1.5 py-1 font-mono text-[11px] text-white"
        >
          {varKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          value={condition.operator}
          onChange={(e) =>
            onChange({ ...condition, operator: e.target.value as Operator })
          }
          className="col-span-3 rounded border border-slate-800 bg-slate-900 px-1 py-1 text-center font-mono text-[11px] text-amber-300"
        >
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>

        {typeof targetSample === 'boolean' ? (
          <select
            value={String(condition.value)}
            onChange={(e) =>
              onChange({ ...condition, value: e.target.value === 'true' })
            }
            className="col-span-4 rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-[11px] text-emerald-400"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : typeof targetSample === 'number' ? (
          <input
            type="number"
            value={Number(condition.value)}
            onChange={(e) =>
              onChange({ ...condition, value: Number(e.target.value) })
            }
            className="col-span-4 rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-right text-[11px] text-emerald-400"
          />
        ) : (
          <input
            type="text"
            value={String(condition.value)}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            className="col-span-4 rounded border border-slate-800 bg-slate-900 px-1.5 py-1 text-[11px] text-emerald-400"
          />
        )}
      </div>
    </div>
  );
}
