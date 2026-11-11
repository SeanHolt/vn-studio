'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onCompleteChange?: (isComplete: boolean) => void;
}

export default function TypewriterText({
  text,
  speedMs = 22,
  onCompleteChange,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    onCompleteChange?.(false);

    if (!text) {
      onCompleteChange?.(true);
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev + 1 >= text.length) {
          window.clearInterval(timer);
          onCompleteChange?.(true);
          return text.length;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [text, speedMs, onCompleteChange]);

  return <span>{text.slice(0, visibleCount)}</span>;
}
