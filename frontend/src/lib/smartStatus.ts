export interface SmartStatusResult {
  label: string;
  type: 'live' | 'today' | 'tomorrow' | 'countdown-days' | 'countdown-hours' | 'countdown-timer' | 'ended';
  /** Accent CSS classes */
  badgeClass: string;
  /** Seconds remaining until bestWindow start — only set when type is 'countdown-timer' */
  secondsRemaining?: number;
}

/**
 * Calculate the smart status for an event card.
 *
 * @param startAt  ISO string of event start
 * @param endAt    ISO string of event end (optional)
 * @param bestWindowStart ISO string of best observation window start (optional)
 * @param bestWindowEnd   ISO string of best observation window end (optional)
 * @param now      Current date (injectable for testing)
 */
export function calculateEventStatus(
  startAt: string,
  endAt?: string | null,
  bestWindowStart?: string | null,
  bestWindowEnd?: string | null,
  now: Date = new Date(),
): SmartStatusResult {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  const bwStart = bestWindowStart ? new Date(bestWindowStart) : null;
  const bwEnd = bestWindowEnd ? new Date(bestWindowEnd) : null;

  // Check if event has ended
  const effectiveEnd = end ?? start;
  if (now > effectiveEnd) {
    return { label: 'Encerrado', type: 'ended', badgeClass: 'bg-white/5 text-gray-600' };
  }

  // Check if currently within the best observation window
  if (bwStart && bwEnd && now >= bwStart && now <= bwEnd) {
    return { label: 'Agora', type: 'live', badgeClass: 'bg-green-500/15 text-green-400' };
  }

  // Check countdown timer (≤10 minutes to bestWindow start)
  if (bwStart && bwStart > now) {
    const msRemaining = bwStart.getTime() - now.getTime();
    const minutesRemaining = msRemaining / (1000 * 60);
    if (minutesRemaining <= 10) {
      const seconds = Math.max(0, Math.floor(msRemaining / 1000));
      const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
      const ss = String(seconds % 60).padStart(2, '0');
      return {
        label: `${mm}:${ss}`,
        type: 'countdown-timer',
        badgeClass: 'bg-[#0EA5E9]/15 text-[#0EA5E9] tabular-nums',
        secondsRemaining: seconds,
      };
    }
  }

  // Check if event starts today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  if (start >= todayStart && start < todayEnd) {
    return { label: 'Hoje', type: 'today', badgeClass: 'bg-[#0EA5E9]/15 text-[#0EA5E9]' };
  }

  // Check if event starts tomorrow
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  if (start >= todayEnd && start < tomorrowEnd) {
    return { label: 'Amanhã', type: 'tomorrow', badgeClass: 'bg-amber-500/15 text-amber-400' };
  }

  // Calculate time remaining
  const msToStart = start.getTime() - now.getTime();
  const hoursToStart = msToStart / (1000 * 60 * 60);

  if (hoursToStart < 24) {
    const hours = Math.ceil(hoursToStart);
    return {
      label: `Faltam ${hours}h`,
      type: 'countdown-hours',
      badgeClass: 'bg-[#6366F1]/15 text-[#6366F1]',
    };
  }

  const daysToStart = Math.ceil(msToStart / (1000 * 60 * 60 * 24));
  return {
    label: `Faltam ${daysToStart} dias`,
    type: 'countdown-days',
    badgeClass: 'bg-white/5 text-gray-400',
  };
}
