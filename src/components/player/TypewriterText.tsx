'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  forceFinishKey?: number;
  onCompleteChange?: (isComplete: boolean) => void;
}

export default function TypewriterText({
  text,
  speedMs = 22,
  forceFinishKey = 0,
  onCompleteChange,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [prevText, setPrevText] = useState(text);
  const completedTextRef = useRef('');

  if (text !== prevText) {
    setPrevText(text);
    setVisibleCount(0);
  }

  useEffect(() => {
    completedTextRef.current = '';
    onCompleteChange?.(false);

    if (!text) {
      completedTextRef.current = text;
      onCompleteChange?.(true);
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          window.clearInterval(timer);
          if (completedTextRef.current !== text) {
            completedTextRef.current = text;
            onCompleteChange?.(true);
          }
          return text.length;
        }
        return next;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [text, speedMs, onCompleteChange]);

  useEffect(() => {
    if (forceFinishKey <= 0) return;
    const finishTimer = window.setTimeout(() => {
      setVisibleCount(text.length);
      if (completedTextRef.current !== text) {
        completedTextRef.current = text;
        onCompleteChange?.(true);
      }
    }, 0);
    return () => window.clearTimeout(finishTimer);
  }, [forceFinishKey, text, onCompleteChange]);

  return <span>{text.slice(0, visibleCount)}</span>;
}
