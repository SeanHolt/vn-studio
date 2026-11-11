'use client';

import React, { useState } from 'react';
import { GameVariables } from '@/lib/vn-engine';
import { Plus, Trash2 } from 'lucide-react';

interface VariablesPanelProps {
  variables: GameVariables;
  onSetVariable: (key: string, value: string | number | boolean) => void;
  onDeleteVariable: (key: string) => void;
}

type VarType = 'boolean' | 'number' | 'string';

export default function VariablesPanel({
  variables,
  onSetVariable,
  onDeleteVariable,
}: VariablesPanelProps) {
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState<VarType>('boolean');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newKey.trim().replace(/\s+/g, '_');
    if (!cleanKey || cleanKey in variables) return;

    const defaultVal = newType === 'boolean' ? false : newType === 'number' ? 0 : '';
    onSetVariable(cleanKey, defaultVal);
    setNewKey('');
  };

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="border-b border-slate-800 pb-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
        Global Project Variables
      </div>

      <form onSubmit={handleAdd} className="flex gap-1.5">
        <input
          type="text"
          placeholder="variable_name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-white"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as VarType)}
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-300"
        >
          <option value="boolean">Bool</option>
          <option value="number">Num</option>
          <option value="string">Text</option>
        </select>
        <button
          type="submit"
          className="rounded bg-emerald-600 px-2.5 py-1.5 text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {Object.entries(variables).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-950 p-2"
          >
            <span className="truncate font-mono text-xs text-slate-300">{key}</span>
            <div className="flex items-center gap-1.5">
              {typeof val === 'boolean' ? (
                <select
                  value={String(val)}
                  onChange={(e) => onSetVariable(key, e.target.value === 'true')}
                  className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-emerald-400"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : typeof val === 'number' ? (
                <input
                  type="number"
                  value={val}
                  onChange={(e) => onSetVariable(key, Number(e.target.value))}
                  className="w-20 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-right text-xs text-emerald-400"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onSetVariable(key, e.target.value)}
                  className="w-24 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-emerald-400"
                />
              )}
              <button
                type="button"
                onClick={() => onDeleteVariable(key)}
                className="text-slate-500 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
