'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onCompleteChange?: (isComplete: boolean) => void;
}

export default function TypewriterText({
  text,
  speedMs = 24,
  onCompleteChange,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const completedTextRef = useRef('');

  useEffect(() => {
    setVisibleCount(0);
    completedTextRef.current = '';
    onCompleteChange?.(false);

    if (!text) {
      completedTextRef.current = text;
      onCompleteChange?.(true);
      return;
    }

    let currentCount = 0;
    const timer = window.setInterval(() => {
      currentCount += 1;
      if (currentCount >= text.length) {
        window.clearInterval(timer);
        setVisibleCount(text.length);
        if (completedTextRef.current !== text) {
          completedTextRef.current = text;
          onCompleteChange?.(true);
        }
      } else {
        setVisibleCount(currentCount);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [text, speedMs, onCompleteChange]);

  return React.createElement('span', null, text.slice(0, visibleCount));
}
