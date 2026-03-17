import React from 'react';
import { Link } from 'react-router-dom';
import { formatEventType, getTypeBadgeColor, getTypeAccentColor, getTypeIconPath } from '@/lib/eventTypes';

interface HeroHighlightProps {
  event: any | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const HeroHighlight: React.FC<HeroHighlightProps> = ({ event }) => {
  if (!event) return null;

  const dateStart = event.startAt ?? event.dateStart ?? event.date_start;
  const badgeClass = getTypeBadgeColor(event.type);
  const accentColor = getTypeAccentColor(event.type);
  const iconPath = getTypeIconPath(event.type);

  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden">
      {/* Gradient background — no image */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050A18] via-[#0F172A] to-[#1e1b4b]" />

      {/* Glow orbs using accent color */}
      <div
        className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{ backgroundColor: accentColor + '14' }}
      />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-[#6366F1]/8 blur-[100px]" />

      {/* Content */}
      <div className="relative flex min-h-[100vh] items-end pb-24 sm:items-center sm:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Type icon */}
            {iconPath && (
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: accentColor + '20' }}
              >
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke={accentColor}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
              </div>
            )}

            {/* Label */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0EA5E9] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0EA5E9]" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0EA5E9]">
                Evento da Semana
              </span>
            </div>

            {/* Badge + Date */}
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>
                {formatEventType(event.type)}
              </span>
              {dateStart && (
                <span className="text-sm font-medium text-gray-400">
                  {formatDate(dateStart)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {event.title}
            </h1>

            {/* Description */}
            {event.description && (
              <p className="mb-8 line-clamp-3 text-base leading-relaxed text-gray-300 sm:text-lg">
                {event.description}
              </p>
            )}

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={`/events/${event.slug}`}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#0EA5E9]/20 transition-all hover:shadow-2xl hover:shadow-[#0EA5E9]/30"
              >
                Ver detalhes
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/5"
              >
                Explorar eventos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">Scroll</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-gray-600 p-1">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default HeroHighlight;
