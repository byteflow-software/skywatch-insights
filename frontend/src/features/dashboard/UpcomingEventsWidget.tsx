import React from 'react';
import { Link } from 'react-router-dom';
import { formatEventType, getTypeBadgeColor } from '@/lib/eventTypes';

interface Event {
  id: string;
  slug: string;
  title: string;
  type: string;
  startAt?: string;
  dateStart?: string;
  date_start?: string;
}

interface UpcomingEventsWidgetProps {
  events: Event[];
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({ events }) => {
  return (
    <div className="rounded-xl border border-[#E0F2FE] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#0F172A]">Próximos Eventos</h3>
        <Link
          to="/events"
          className="text-xs font-medium text-[#0EA5E9] hover:underline"
        >
          Ver todos
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#334155]">
          Nenhum evento próximo.
        </p>
      ) : (
        <ul className="divide-y divide-[#E0F2FE]">
          {events.map((event) => {
            const date = event.startAt ?? event.dateStart ?? event.date_start ?? '';
            const badgeColor = getTypeBadgeColor(event.type);

            return (
              <li key={event.id}>
                <Link
                  to={`/events/${event.slug}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-[#E0F2FE]/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E0F2FE] text-xs font-bold text-[#0F172A]">
                    {date ? formatShortDate(date) : '--'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#0F172A]">
                      {event.title}
                    </p>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badgeColor}`}
                    >
                      {formatEventType(event.type)}
                    </span>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-[#334155]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UpcomingEventsWidget;
