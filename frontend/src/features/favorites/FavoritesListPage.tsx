import React, { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import EventCard from '@/features/events/EventCard';

const FavoritesListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data, isLoading, isError, refetch } = useFavorites({
    page,
    size: pageSize,
  });

  const events = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Meus Favoritos</h1>
        <p className="mt-1 text-sm text-gray-400">Eventos que você marcou como favorito.</p>
      </div>

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
              <div className="aspect-[5/3] bg-white/5" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-20 rounded bg-white/5" />
                <div className="h-5 w-3/4 rounded bg-white/5" />
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
          <h3 className="mb-1 text-lg font-semibold text-white">Erro ao carregar favoritos</h3>
          <p className="mb-4 text-sm text-gray-500">Não foi possível carregar seus favoritos.</p>
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
            <svg className="h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="none" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">Nenhum favorito ainda</h3>
          <p className="text-sm text-gray-500">Explore os eventos astronômicos e adicione seus favoritos clicando no coração.</p>
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
                dateStart={event.startAt ?? event.dateStart ?? event.date_start}
                dateEnd={event.endAt ?? event.dateEnd ?? event.date_end}
                description={event.description}
                imageUrl={event.imageUrl ?? event.image_url}
                relevanceScore={event.relevanceScore ?? event.relevance_score}
                isFavorited={event.isFavorited ?? event.is_favorited ?? true}
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
              <span className="px-3 text-sm text-gray-500">
                {page + 1} de {totalPages}
              </span>
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

export default FavoritesListPage;
