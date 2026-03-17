import React, { useState, useEffect } from 'react';
import { calculateEventStatus } from '@/lib/smartStatus';

interface SmartEventStatusProps {
  startAt: string;
  endAt?: string | null;
  bestWindowStart?: string | null;
  bestWindowEnd?: string | null;
}

const SmartEventStatus: React.FC<SmartEventStatusProps> = ({
  startAt,
  endAt,
  bestWindowStart,
  bestWindowEnd,
}) => {
  const [now, setNow] = useState(() => new Date());

  const status = calculateEventStatus(startAt, endAt, bestWindowStart, bestWindowEnd, now);

  // Tick every second when showing a countdown timer, otherwise every minute
  useEffect(() => {
    const interval = status.type === 'countdown-timer' ? 1000 : 60_000;
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [status.type]);

  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:text-[10px] ${status.badgeClass}`}
    >
      {status.type === 'live' && (
        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
      )}
      {status.label}
    </span>
  );
};

export default SmartEventStatus;
