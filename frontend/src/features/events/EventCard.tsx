import React from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '@/features/favorites/FavoriteButton';
import {
  formatEventType,
  getTypeBadgeColor,
  getTypeAccentColor,
  getTypeIconPath,
} from '@/lib/eventTypes';
import SpaceWeatherBadge from './SpaceWeatherBadge';

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  type: string;
  dateStart: string;
  dateEnd?: string;
  description?: string;
  imageUrl?: string;
  relevanceScore?: number;
  isFavorited?: boolean;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  slug,
  title,
  type,
  dateStart,
  dateEnd,
  description,
  relevanceScore,
  isFavorited = false,
}) => {
  const navigate = useNavigate();
  const badgeColor = getTypeBadgeColor(type);
  const accentColor = getTypeAccentColor(type);
  const iconPath = getTypeIconPath(type);

  return (
    <div
      onClick={() => navigate(`/events/${slug}`)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:border-white/10 hover:bg-white/[0.06]"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          {/* Type icon */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: accentColor + '18' }}
          >
            {iconPath ? (
              <svg
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke={accentColor}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={iconPath}
                />
              </svg>
            ) : (
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </div>

          <span
            className={`inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badgeColor}`}
          >
            {formatEventType(type)}
          </span>

          <div className="ml-auto">
            <FavoriteButton eventId={id} isFavorited={isFavorited} />
          </div>
        </div>

        <h3 className="mb-1 line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-[#0EA5E9]">
          {title}
        </h3>

        <p className="mb-2 text-xs text-gray-500">
          {dateStart ? formatDate(dateStart) : ''}
          {dateEnd ? ` - ${formatDate(dateEnd)}` : ''}
        </p>

        <div className="mb-2">
          <SpaceWeatherBadge type={type} description={description} />
        </div>

        {description && (
          <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
            {description}
          </p>
        )}

        {relevanceScore != null && (
          <div className="mt-auto pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Relevância
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] transition-all duration-500"
                  style={{ width: `${Math.min(100, relevanceScore)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-white">
                {relevanceScore}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
