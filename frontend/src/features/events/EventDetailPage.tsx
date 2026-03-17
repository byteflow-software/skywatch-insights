import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEventBySlug, useEventForecast } from '@/hooks/useEvents';
import FavoriteButton from '@/features/favorites/FavoriteButton';
import ObservabilityScore from './ObservabilityScore';
import BestWindowDisplay from './BestWindowDisplay';
import SpaceWeatherBadge from './SpaceWeatherBadge';
import {
  formatEventType,
  getTypeBadgeColor,
  getTypeAccentColor,
  getTypeIconPath,
} from '@/lib/eventTypes';
import SmartEventStatus from './SmartEventStatus';
import CommentSection from './CommentSection';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useEventBySlug(slug ?? '');
  const { data: forecast } = useEventForecast(event?.id ?? '');

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
          <span className="text-sm text-gray-500">Carregando evento...</span>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <svg
            className="h-8 w-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-white">
          Erro ao carregar evento
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Não foi possível carregar os detalhes deste evento.
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0EA5E9]/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const badgeClass = getTypeBadgeColor(event.type);
  const accentColor = getTypeAccentColor(event.type);
  const iconPath = getTypeIconPath(event.type);
  const dateStart = event.startAt ?? event.dateStart ?? event.date_start;
  const dateEnd = event.endAt ?? event.dateEnd ?? event.date_end;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8">
      {/* Back link */}
      <Link
        to="/events"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#0EA5E9] transition-colors hover:text-[#6366F1] sm:mb-6"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Voltar aos eventos
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-6 lg:p-8">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Type icon */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl"
            style={{ backgroundColor: accentColor + '18' }}
          >
            {iconPath ? (
              <svg
                className="h-5 w-5 sm:h-7 sm:w-7"
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
                className="h-3 w-3 rounded-full sm:h-4 sm:w-4"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <span
                className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:px-3 sm:py-1 sm:text-xs ${badgeClass}`}
              >
                {formatEventType(event.type)}
              </span>
              <FavoriteButton
                eventId={event.id}
                isFavorited={event.isFavorited ?? event.is_favorited ?? false}
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
              {event.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:mt-2">
              <p className="text-xs text-gray-400 sm:text-sm">
                {formatDate(dateStart)}
                {dateEnd && ` - ${formatDate(dateEnd)}`}
              </p>
              <SmartEventStatus
                startAt={dateStart}
                endAt={dateEnd}
                bestWindowStart={forecast?.bestWindowStart ?? forecast?.bestWindow?.start}
                bestWindowEnd={forecast?.bestWindowEnd ?? forecast?.bestWindow?.end}
              />
            </div>
            <div className="mt-2 sm:mt-3">
              <SpaceWeatherBadge
                type={event.type}
                description={event.description}
              />
            </div>
          </div>
        </div>

        {/* Observability score — below header on mobile, inline on desktop */}
        {(forecast?.observabilityScore != null ||
          forecast?.observability_score != null) && (
          <div className="mt-4 flex justify-center sm:mt-6">
            <ObservabilityScore
              score={forecast.observabilityScore ?? forecast.observability_score}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Weather details */}
      {forecast &&
        (forecast.cloudCoverage != null || forecast.weatherSummary) && (
          <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:mb-8 sm:p-6">
            <h2 className="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg">
              Condições Climáticas
            </h2>
            {forecast.weatherSummary && (
              <p className="mb-4 text-sm text-gray-400">
                {forecast.weatherSummary}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {forecast.cloudCoverage != null && (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {forecast.cloudCoverage}%
                  </p>
                  <p className="text-xs text-gray-500">Nuvens</p>
                </div>
              )}
              {forecast.humidity != null && (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-[#6366F1]">
                    {forecast.humidity}%
                  </p>
                  <p className="text-xs text-gray-500">Umidade</p>
                </div>
              )}
              {forecast.visibility != null && (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-[#0EA5E9]">
                    {(forecast.visibility / 1000).toFixed(0)}km
                  </p>
                  <p className="text-xs text-gray-500">Visibilidade</p>
                </div>
              )}
              {forecast.observabilityScore != null && (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {forecast.observabilityScore}
                  </p>
                  <p className="text-xs text-gray-500">Pontuação</p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Description */}
      <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:mb-8 sm:p-6">
        <h2 className="mb-2 text-base font-semibold text-white sm:mb-3 sm:text-lg">Descrição</h2>
        <p className="whitespace-pre-line leading-relaxed text-gray-400">
          {event.description}
        </p>
      </div>

      {/* Best viewing window */}
      {(forecast?.bestWindowStart || forecast?.bestWindow) && (
        <div className="mb-8">
          <BestWindowDisplay
            start={forecast.bestWindowStart ?? forecast.bestWindow?.start}
            end={forecast.bestWindowEnd ?? forecast.bestWindow?.end}
            weatherSummary={
              forecast.weatherSummary ?? forecast.bestWindow?.weatherSummary
            }
          />
        </div>
      )}

      {/* Comments */}
      <div className="mb-6 sm:mb-8">
        <CommentSection targetType="events" targetId={event.id} />
      </div>

      {/* Export link */}
      <div className="flex gap-3">
        {import.meta.env.VITE_ENABLE_EXPORT === 'true' ? (
          <Link
            to={`/events/${slug}/export`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Exportar para redes sociais
          </Link>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-gray-500 cursor-not-allowed">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Exportar para redes sociais
            <span className="rounded-md bg-[#6366F1]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6366F1]">
              Beta
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
