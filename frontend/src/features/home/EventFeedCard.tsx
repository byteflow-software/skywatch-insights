import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  formatEventType,
  getTypeBadgeColor,
  getTypeAccentColor,
  getTypeIconPath,
} from '@/lib/eventTypes';
import { getAccessToken } from '@/services/api';
import SpaceWeatherBadge from '@/features/events/SpaceWeatherBadge';
import SmartEventStatus from '@/features/events/SmartEventStatus';
import CommentPreview from './CommentPreview';

interface EventFeedCardProps {
  id: string;
  slug: string;
  title: string;
  type: string;
  dateStart: string;
  dateEnd?: string;
  description?: string;
  imageUrl?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const EventFeedCard: React.FC<EventFeedCardProps> = ({
  id,
  slug,
  title,
  type,
  dateStart,
  dateEnd,
  description,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const badgeClass = getTypeBadgeColor(type);
  const accentColor = getTypeAccentColor(type);
  const iconPath = getTypeIconPath(type);

  const handleAuthAction = (e: React.MouseEvent, targetPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { state: { from: location } });
    } else {
      navigate(targetPath);
    }
  };

  return (
    <article className="group relative">
      <Link to={`/events/${slug}`} className="block">
        <div className="flex gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-white/[0.04]">
          {/* Left accent — type icon */}
          <div className="flex flex-col items-center pt-0.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: accentColor + '18' }}
            >
              {iconPath ? (
                <svg
                  className="h-5 w-5"
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
            {/* Vertical line connector */}
            <div className="mt-2 w-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pb-1">
            {/* Top row: badge + relative date */}
            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider sm:px-2 sm:text-[10px] ${badgeClass}`}
              >
                {formatEventType(type)}
              </span>
              <span className="text-[11px] text-gray-500 sm:text-xs">
                {formatDate(dateStart)}
              </span>
              <span className="ml-auto">
                <SmartEventStatus startAt={dateStart} endAt={dateEnd} />
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-0.5 text-sm font-bold leading-snug text-white group-hover:text-[#0EA5E9] sm:text-[15px]">
              {title}
            </h3>

            {/* Space weather badge (inline) */}
            <SpaceWeatherBadge type={type} description={description} />

            {/* Description */}
            {description && (
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-gray-400">
                {description}
              </p>
            )}

            {/* Comment preview */}
            <CommentPreview
              targetType="events"
              targetId={id}
              detailPath={`/events/${slug}`}
            />

            {/* Action bar */}
            <div className="-ml-2 mt-2.5 flex items-center gap-0.5">
              <button
                type="button"
                onClick={(e) => handleAuthAction(e, `/events/${slug}`)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Favoritar"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => handleAuthAction(e, `/events/${slug}/export`)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] text-gray-500 transition-colors hover:bg-[#6366F1]/10 hover:text-[#6366F1]"
                title="Compartilhar"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
              </button>

              <span className="ml-auto text-[12px] font-medium text-[#0EA5E9] opacity-0 transition-opacity group-hover:opacity-100">
                Ver mais →
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Bottom divider */}
      <div className="ml-[52px] border-b border-white/[0.06]" />
    </article>
  );
};

export default EventFeedCard;
