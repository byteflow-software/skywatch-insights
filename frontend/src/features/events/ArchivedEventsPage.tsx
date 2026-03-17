import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArchivedEvents } from '@/hooks/useEvents';
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

const ArchivedEventsPage: React.FC = () => {
  const [type, setType] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data, isLoading, isError, refetch } = useArchivedEvents({
    type: type || undefined,
    page,
    size: pageSize,
  });

  const events = data?.data ?? data?.content ?? [];
  const totalPages = data?.totalPages ?? data?.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/events" className="mb-4 inline-flex items-center gap-1 text-sm text-[#0EA5E9] transition-colors hover:text-[#6366F1]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Voltar para eventos
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Eventos Passados</h1>
        <p className="mt-1 text-sm text-gray-400">Eventos astronômicos arquivados após 7 dias de encerramento.</p>
      </div>

      {/* Type filter */}
      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">Tipo</label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(0); }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#0F172A] text-white">
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
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
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">Erro ao carregar eventos</h3>
          <p className="mb-4 text-sm text-gray-500">Não foi possível carregar os eventos arquivados.</p>
          <button onClick={() => refetch()} className="rounded-xl bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0EA5E9]/90">
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !isError && events.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">Nenhum evento arquivado</h3>
          <p className="text-sm text-gray-500">Eventos passados aparecerão aqui após 7 dias de encerramento.</p>
        </div>
      )}

      {!isLoading && !isError && events.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => (
              <EventCard
                key={event.id}
                id={event.id}
                slug={event.slug}
                title={event.title}
                type={event.type}
                dateStart={event.startAt ?? event.dateStart}
                dateEnd={event.endAt ?? event.dateEnd}
                description={event.description}
                imageUrl={event.imageUrl ?? event.image_url}
                relevanceScore={event.relevanceScore ?? event.relevance_score}
                isFavorited={false}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 text-sm text-gray-500">{page + 1} de {totalPages}</span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArchivedEventsPage;
