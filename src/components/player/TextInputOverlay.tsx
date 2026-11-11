'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface TextInputOverlayProps {
  prompt: string;
  placeholder: string;
  defaultValue: string;
  onSubmitValue: (value: string) => void;
}

export default function TextInputOverlay({
  prompt,
  placeholder,
  defaultValue,
  onSubmitValue,
}: TextInputOverlayProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim() || defaultValue || 'Player';
    onSubmitValue(clean);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/75 p-6 backdrop-blur-xs"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-indigo-500/40 bg-slate-900 p-5 shadow-2xl"
      >
        <label className="text-base font-semibold text-white">{prompt}</label>
        <input
          type="text"
          autoFocus
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Send className="h-4 w-4" /> Confirm
        </button>
      </form>
    </div>
  );
}
