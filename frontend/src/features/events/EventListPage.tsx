import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import EventCard from './EventCard';

const EVENT_TYPES = [
  { label: 'Todos', value: '' },
  { label: 'Chuva de Meteoros', value: 'METEOR_SHOWER' },
  { label: 'Eclipse Lunar', value: 'ECLIPSE_LUNAR' },
  { label: 'Eclipse Solar', value: 'ECLIPSE_SOLAR' },
  { label: 'Conjunção', value: 'CONJUNCTION' },
  { label: 'Oposição', value: 'OPPOSITION' },
  { label: 'Superlua', value: 'SUPERMOON' },
  { label: 'Explosão Solar', value: 'SOLAR_FLARE' },
  { label: 'Ejeção de Massa Coronal', value: 'CME' },
  { label: 'Tempestade Geomagnética', value: 'GEOMAGNETIC_STORM' },
  { label: 'Aurora', value: 'AURORA' },
  { label: 'Ocultação', value: 'OCCULTATION' },
  { label: 'Trânsito', value: 'TRANSIT' },
  { label: 'Cometa', value: 'COMET' },
];

interface EventListItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  startAt?: string;
  dateStart?: string;
  date_start?: string;
  endAt?: string;
  dateEnd?: string;
  date_end?: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  relevanceScore?: number;
  relevance_score?: number;
  isFavorited?: boolean;
  is_favorited?: boolean;
}

const EventListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState<string>(searchParams.get('type') ?? '');
  const [from, setFrom] = useState<string>(searchParams.get('from') ?? '');
  const [to, setTo] = useState<string>(searchParams.get('to') ?? '');
  const [sort, setSort] = useState<'date' | 'relevance'>(
    searchParams.get('sort') === 'relevance' ? 'relevance' : 'date',
  );
  const [page, setPage] = useState<number>(
    Math.max(0, Number(searchParams.get('page') ?? 0)),
  );
  const pageSize = 12;

  const syncQueryParams = (next: {
    type?: string;
    from?: string;
    to?: string;
    sort?: 'date' | 'relevance';
    page?: number;
  }) => {
    const params = new URLSearchParams();
    const nextType = next.type ?? type;
    const nextFrom = next.from ?? from;
    const nextTo = next.to ?? to;
    const nextSort = next.sort ?? sort;
    const nextPage = next.page ?? page;

    if (nextType) params.set('type', nextType);
    if (nextFrom) params.set('from', nextFrom);
    if (nextTo) params.set('to', nextTo);
    if (nextSort !== 'date') params.set('sort', nextSort);
    if (nextPage > 0) params.set('page', String(nextPage));

    setSearchParams(params, { replace: true });
  };

  const { data, isLoading, isError, refetch } = useEvents({
    type: type || undefined,
    from: from || undefined,
    to: to || undefined,
    sort,
    page,
    size: pageSize,
  });

  const events = (data?.data ??
    data?.items ??
    data?.content ??
    []) as EventListItem[];
  const totalPages = data?.totalPages ?? data?.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Eventos Astronômicos
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Explore eclipses, chuvas de meteoros, clima espacial e outros
          fenômenos celestes.
        </p>
      </div>

      {/* Filters bar */}
      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        {/* Type filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">Tipo</label>
          <select
            value={type}
            onChange={(e) => {
              const nextType = e.target.value;
              setType(nextType);
              setPage(0);
              syncQueryParams({ type: nextType, page: 0 });
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
          >
            {EVENT_TYPES.map((t) => (
              <option
                key={t.value}
                value={t.value}
                className="bg-[#0F172A] text-white"
              >
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">De</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              const nextFrom = e.target.value;
              setFrom(nextFrom);
              setPage(0);
              syncQueryParams({ from: nextFrom, page: 0 });
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">Até</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              const nextTo = e.target.value;
              setTo(nextTo);
              setPage(0);
              syncQueryParams({ to: nextTo, page: 0 });
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
          />
        </div>

        {/* Sort toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">Ordenar</label>
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button
              onClick={() => {
                setSort('date');
                setPage(0);
                syncQueryParams({ sort: 'date', page: 0 });
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                sort === 'date'
                  ? 'bg-[#0EA5E9] text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Data
            </button>
            <button
              onClick={() => {
                setSort('relevance');
                setPage(0);
                syncQueryParams({ sort: 'relevance', page: 0 });
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                sort === 'relevance'
                  ? 'bg-[#0EA5E9] text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Relevância
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]"
            >
              <div className="flex gap-3 p-5">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-20 rounded bg-white/5" />
                  <div className="h-5 w-3/4 rounded bg-white/5" />
                  <div className="h-4 w-full rounded bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center py-20 text-center">
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
            Erro ao carregar eventos
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Não foi possível carregar os eventos.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0EA5E9]/90"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !isError && events.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg
              className="h-8 w-8 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">
            Nenhum evento encontrado
          </h3>
          <p className="text-sm text-gray-500">
            {type || from || to
              ? 'Tente ajustar os filtros para encontrar eventos astronômicos.'
              : 'A sincronização com fontes reais pode estar em andamento. Novos eventos aparecerão aqui automaticamente.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && events.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                slug={event.slug}
                title={event.title}
                type={event.type}
                dateStart={
                  event.startAt ?? event.dateStart ?? event.date_start ?? ''
                }
                dateEnd={event.endAt ?? event.dateEnd ?? event.date_end ?? ''}
                description={event.description}
                imageUrl={event.imageUrl ?? event.image_url}
                relevanceScore={event.relevanceScore ?? event.relevance_score}
                isFavorited={event.isFavorited ?? event.is_favorited ?? false}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                disabled={page <= 0}
                onClick={() => {
                  const nextPage = page - 1;
                  setPage(nextPage);
                  syncQueryParams({ page: nextPage });
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 text-sm text-gray-500">
                {page + 1} de {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  syncQueryParams({ page: nextPage });
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          )}

          {/* Link to archived events */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/events/archived"
              className="text-sm font-medium text-[#0EA5E9] transition-colors hover:text-[#6366F1]"
            >
              Ver eventos passados →
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default EventListPage;
