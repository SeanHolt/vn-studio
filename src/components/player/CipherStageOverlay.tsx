'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    CipherThemeId,
    KEYBOARD_ROWS,
    isAlphaChar,
    isCipherSolved,
} from '@/lib/vn-cipher';
import { playSynthSound } from '@/lib/vn-audio';
import { Terminal } from 'lucide-react';

interface CipherStageOverlayProps {
    title: string;
    clueText: string;
    secretPhrase: string;
    maxWrongGuesses: number;
    theme: CipherThemeId;
    isMuted: boolean;
    onUnlock: () => void;
    onFailOut: () => void;
}

const THEME_STYLES: Record<
    CipherThemeId,
    { card: string; title: string; slotActive: string }
> = {
    SCIFI: {
        card: 'border-cyan-500/40 bg-slate-900/95',
        title: 'text-cyan-400',
        slotActive: 'border-cyan-400/70 bg-cyan-950/40 text-cyan-200',
    },
    ANCIENT: {
        card: 'border-amber-500/40 bg-stone-900/95',
        title: 'text-amber-400',
        slotActive: 'border-amber-400/70 bg-amber-950/40 text-amber-200',
    },
    CYBER: {
        card: 'border-emerald-500/40 bg-zinc-950/95',
        title: 'text-emerald-400',
        slotActive: 'border-emerald-400/70 bg-emerald-950/40 text-emerald-200',
    },
};

export default function CipherStageOverlay({
    title,
    clueText,
    secretPhrase,
    maxWrongGuesses,
    theme,
    isMuted,
    onUnlock,
    onFailOut,
}: CipherStageOverlayProps) {
    const normalizedPhrase = secretPhrase.trim().toUpperCase() || 'ORION';
    const styleCfg = THEME_STYLES[theme] ?? THEME_STYLES.SCIFI;

    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [statusBanner, setStatusBanner] = useState<string | null>(null);
    const [isVictory, setIsVictory] = useState(false);

    const wrongCount = guessedLetters.filter(
        (letter) => !normalizedPhrase.includes(letter)
    ).length;
    const attemptsLeft = Math.max(0, maxWrongGuesses - wrongCount);

    const handleGuessLetter = (rawLetter: string) => {
        if (statusBanner) return;
        const letter = rawLetter.toUpperCase();
        if (!isAlphaChar(letter)) return;
        if (guessedLetters.includes(letter)) return;

        const nextGuessed = [...guessedLetters, letter];
        setGuessedLetters(nextGuessed);

        const isHit = normalizedPhrase.includes(letter);
        if (isHit) {
            if (!isMuted) playSynthSound('synth:pickup');
            if (isCipherSolved(normalizedPhrase, nextGuessed)) {
                setIsVictory(true);
                setStatusBanner('CIPHER DECRYPTED — ACCESS GRANTED!');
                if (!isMuted) playSynthSound('synth:chime');
                window.setTimeout(() => onUnlock(), 850);
            }
        } else {
            if (!isMuted) playSynthSound('synth:alert');
            const nextWrong = wrongCount + 1;
            if (nextWrong >= maxWrongGuesses) {
                setStatusBanner('DECRYPTION LOCKOUT — SIGNAL LOST!');
                window.setTimeout(() => onFailOut(), 850);
            }
        }
    };

    const guessHandlerRef = useRef(handleGuessLetter);
    useEffect(() => { guessHandlerRef.current = handleGuessLetter; })
    

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const key = e.key.toUpperCase();
            if (isAlphaChar(key)) {
                e.preventDefault();
                guessHandlerRef.current(key);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);


    const words = normalizedPhrase.split(' ');

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm select-none"
        >
            <div
                className={`flex w-full max-w-xl flex-col gap-3 rounded-2xl border p-5 shadow-2xl ${styleCfg.card}`}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 font-bold ${styleCfg.title}`}>
                        <Terminal className="h-4 w-4" /> {title}
                    </span>
                    <span className="font-mono text-slate-300">
                        Integrity: {attemptsLeft} / {maxWrongGuesses}
                    </span>
                </div>

                <p className="text-xs text-slate-300">
                    <strong className="text-slate-100">Clue:</strong> {clueText}
                </p>

                {/* Masked Word Slots */}
                <div className="my-1 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-4">
                    {words.map((word, wIdx) => (
                        <div key={wIdx} className="flex flex-wrap gap-1.5">
                            {Array.from(word).map((ch, cIdx) => {
                                const isLetter = isAlphaChar(ch);
                                const revealed =
                                    !isLetter ||
                                    guessedLetters.includes(ch) ||
                                    statusBanner !== null;

                                return (
                                    <span
                                        key={cIdx}
                                        className={`flex h-9 w-8 items-center justify-center rounded-lg border font-mono text-base font-extrabold ${revealed
                                                ? styleCfg.slotActive
                                                : 'border-slate-700 bg-slate-900 text-slate-600'
                                            }`}
                                    >
                                        {revealed ? ch : '_'}
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* On-Screen QWERTY Keyboard */}
                <div className="flex flex-col items-center gap-1.5">
                    {KEYBOARD_ROWS.map((row, rIdx) => (
                        <div key={rIdx} className="flex flex-wrap justify-center gap-1">
                            {row.map((letter) => {
                                const alreadyGuessed = guessedLetters.includes(letter);
                                const isHit = alreadyGuessed && normalizedPhrase.includes(letter);
                                const isMiss =
                                    alreadyGuessed && !normalizedPhrase.includes(letter);

                                let btnClass =
                                    'border-slate-700 bg-slate-800 text-white hover:bg-slate-700';
                                if (isHit) {
                                    btnClass =
                                        'border-emerald-500/60 bg-emerald-950/70 text-emerald-300';
                                } else if (isMiss) {
                                    btnClass =
                                        'border-rose-500/40 bg-rose-950/40 text-rose-400/60 opacity-50';
                                }

                                return (
                                    <button
                                        key={letter}
                                        type="button"
                                        disabled={alreadyGuessed || statusBanner !== null}
                                        onClick={() => handleGuessLetter(letter)}
                                        className={`h-8 w-7 rounded border font-mono text-xs font-bold transition sm:w-8 ${btnClass}`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {statusBanner && (
                    <div
                        className={`rounded-lg border py-1.5 text-center font-mono text-xs font-bold ${isVictory
                                ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                                : 'border-rose-500/40 bg-rose-950/80 text-rose-300'
                            }`}
                    >
                        {statusBanner}
                    </div>
                )}
            </div>
        </div>
    );
}
