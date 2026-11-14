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
  const onCompleteRef = useRef(onCompleteChange);

  useEffect(() => {
    onCompleteRef.current = onCompleteChange;
  });

  if (text !== prevText) {
    setPrevText(text);
    setVisibleCount(0);
  }

  useEffect(() => {
    completedTextRef.current = '';
    onCompleteRef.current?.(false);

    if (!text) {
      completedTextRef.current = text;
      onCompleteRef.current?.(true);
      return;
    }

    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      if (current >= text.length) {
        window.clearInterval(timer);
        setVisibleCount(text.length);
        if (completedTextRef.current !== text) {
          completedTextRef.current = text;
          onCompleteRef.current?.(true);
        }
      } else {
        setVisibleCount(current);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [text, speedMs]);

  useEffect(() => {
    if (forceFinishKey <= 0) return;
    const finishTimer = window.setTimeout(() => {
      setVisibleCount(text.length);
      if (completedTextRef.current !== text) {
        completedTextRef.current = text;
        onCompleteRef.current?.(true);
      }
    }, 0);
    return () => window.clearTimeout(finishTimer);
  }, [forceFinishKey, text]);

  return <span>{text.slice(0, visibleCount)}</span>;
}