import React from 'react';
import { Link } from 'react-router-dom';
import ObservabilityScore from '@/features/events/ObservabilityScore';
import { formatEventType, getTypeBadgeColor, getTypeAccentColor, getTypeIconPath } from '@/lib/eventTypes';

interface WeeklyHighlightCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    type: string;
    imageUrl?: string;
    image_url?: string;
    observabilityScore?: number;
    observability_score?: number;
  };
}

const WeeklyHighlightCard: React.FC<WeeklyHighlightCardProps> = ({ event }) => {
  const score = event.observabilityScore ?? event.observability_score;
  const badgeColor = getTypeBadgeColor(event.type);
  const accentColor = getTypeAccentColor(event.type);
  const iconPath = getTypeIconPath(event.type);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E0F2FE] bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Type icon area (replaces image) */}
        <div
          className="flex h-32 w-full shrink-0 items-center justify-center sm:h-auto sm:w-48"
          style={{ backgroundColor: accentColor + '10' }}
        >
          {iconPath ? (
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke={accentColor}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
            </svg>
          ) : (
            <div
              className="h-8 w-8 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <div className="absolute left-3 top-3 rounded-full bg-[#0EA5E9] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow">
            Evento da Semana
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <h2 className="mb-2 text-xl font-bold text-[#0F172A]">{event.title}</h2>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${badgeColor}`}>
              {formatEventType(event.type)}
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            {score != null && <ObservabilityScore score={score} size="sm" />}

            <div className="flex gap-2">
              <Link
                to={`/events/${event.slug}`}
                className="rounded-lg bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0EA5E9]/90"
              >
                Ver detalhes
              </Link>
              <Link
                to={`/events/${event.slug}/export`}
                className="rounded-lg border border-[#E0F2FE] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#E0F2FE]"
              >
                Exportar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHighlightCard;
