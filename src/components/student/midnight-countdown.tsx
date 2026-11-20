'use client';

import React, { useEffect, useState } from 'react';

interface MidnightCountdownProps {
  fallback?: string;
}

function computeTimeUntilMidnight(fallback: string): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  const diffMs = midnight.getTime() - now.getTime();

  if (diffMs > 0) {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return fallback;
}

export function MidnightCountdown({ fallback = '00:00:00' }: MidnightCountdownProps) {
  const [text, setText] = useState<string>(() => computeTimeUntilMidnight(fallback));

  useEffect(() => {
    setText(computeTimeUntilMidnight(fallback));
    const interval = setInterval(() => {
      setText(computeTimeUntilMidnight(fallback));
    }, 1000);
    return () => clearInterval(interval);
  }, [fallback]);

  return <>{text}</>;
}
