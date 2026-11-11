'use client';

import React, { useState, useTransition } from 'react';
import { loginUser, registerUser } from '@/app/actions/auth-actions';
import { Loader2, Sparkles } from 'lucide-react';

export default function AuthForm() {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const result =
        mode === 'REGISTER'
          ? await registerUser(name, email, password)
          : await loginUser(email, password);

      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div className="mb-6 flex rounded-xl border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('LOGIN');
            setErrorMsg(null);
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            mode === 'LOGIN'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('REGISTER');
            setErrorMsg(null);
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            mode === 'REGISTER'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Free Account
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'REGISTER' && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-300">Creator Name</span>
            <input
              type="text"
              required
              placeholder="e.g., Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-400 focus:outline-none"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-300">Email Address</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-400 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-300">Password</span>
          <input
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-400 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'REGISTER' ? 'Start Creating (3 Free Games)' : 'Sign In to Studio'}
        </button>
      </form>

      {mode === 'REGISTER' && (
        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Includes 3 free visual novel projects &amp; full node editor</span>
        </div>
      )}
    </div>
  );
}
