import React, { useRef, useCallback, useEffect } from 'react';
import HeroHighlight from './HeroHighlight';
import AstroConditionsBanner from './AstroConditionsBanner';
import EventFeedCard from './EventFeedCard';
import {
  useWeeklyHighlight,
  useHomeEvents,
  useHomeCity,
  useDailyHighlight,
} from '@/hooks/useHome';

interface HomeEventItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  description?: string;
  startAt?: string;
  dateStart?: string;
  date_start?: string;
  endAt?: string;
  dateEnd?: string;
  date_end?: string;
  imageUrl?: string;
  image_url?: string;
}

function interleaveByType(events: HomeEventItem[]): HomeEventItem[] {
  const buckets = new Map<string, HomeEventItem[]>();

  events.forEach((event) => {
    const type = event.type ?? 'UNKNOWN';
    const list = buckets.get(type);
    if (list) {
      list.push(event);
      return;
    }
    buckets.set(type, [event]);
  });

  const orderedTypes = Array.from(buckets.keys());
  const mixed: HomeEventItem[] = [];

  for (let remaining = events.length; remaining > 0; ) {
    let pushedAny = false;
    orderedTypes.forEach((type) => {
      const bucket = buckets.get(type);
      if (!bucket || bucket.length === 0) return;
      const next = bucket.shift();
      if (!next) return;
      mixed.push(next);
      pushedAny = true;
      remaining -= 1;
    });

    if (!pushedAny) break;
  }

  return mixed;
}

const HomePage: React.FC = () => {
  const { data: highlightData, isLoading: highlightLoading } =
    useWeeklyHighlight();
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useHomeEvents();
  const city = useHomeCity();
  const {
    data: dailyHighlight,
    isLoading: dailyHighlightLoading,
    isError: dailyHighlightError,
    refetch: refetchDailyHighlight,
  } = useDailyHighlight();

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const highlightEvent =
    highlightData?.event ?? highlightData?.data?.event ?? highlightData;
  const allEvents = (eventsData?.pages?.flatMap(
    (page) => page.data ?? page.content ?? page.items ?? [],
  ) ?? []) as HomeEventItem[];
  const feedEvents = interleaveByType(allEvents);

  return (
    <div className="relative">
      {/* Hero — Full-screen weekly highlight */}
      {highlightLoading || (!highlightEvent && dailyHighlightLoading) ? (
        <div className="flex min-h-[100vh] items-center justify-center bg-[#050A18]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        </div>
      ) : highlightEvent ? (
        <HeroHighlight event={highlightEvent} />
      ) : dailyHighlight ? (
        /* APOD daily highlight fallback */
        <section className="relative flex min-h-[70vh] items-center overflow-hidden">
          {dailyHighlight.mediaType === 'image' && (
            <img
              src={dailyHighlight.hdImageUrl || dailyHighlight.imageUrl}
              alt={dailyHighlight.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A18] via-[#050A18]/70 to-transparent" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <span className="mb-3 inline-block rounded-full bg-[#0EA5E9]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0EA5E9]">
                Imagem do Dia
              </span>
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {dailyHighlight.title}
              </h1>
              <p className="line-clamp-3 text-base text-gray-300 sm:text-lg">
                {dailyHighlight.explanation}
              </p>
              {dailyHighlight.copyright && (
                <p className="mt-3 text-xs text-gray-500">
                  {dailyHighlight.copyright}
                </p>
              )}
            </div>
          </div>
        </section>
      ) : dailyHighlightError ? (
        <section className="relative flex min-h-[70vh] items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#050A18] via-[#0F172A] to-[#1e1b4b]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Destaque diário indisponível
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-base text-gray-400 sm:text-lg">
              Não foi possível carregar a imagem astronômica do dia neste
              momento.
            </p>
            <button
              onClick={() => refetchDailyHighlight()}
              className="rounded-xl bg-[#0EA5E9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0EA5E9]/90"
            >
              Tentar novamente
            </button>
          </div>
        </section>
      ) : (
        /* Generic fallback hero */
        <section className="relative flex min-h-[70vh] items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#050A18] via-[#0F172A] to-[#1e1b4b]" />
          <div className="bg-[#0EA5E9]/8 absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full blur-[120px]" />
          <div className="bg-[#6366F1]/8 absolute bottom-1/3 right-1/4 h-[300px] w-[300px] rounded-full blur-[100px]" />
          <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Explore o{' '}
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] bg-clip-text text-transparent">
                Universo
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-gray-400">
              Acompanhe eclipses, chuvas de meteoros, conjunções e outros
              eventos astronômicos com previsão de observabilidade em tempo
              real.
            </p>
          </div>
        </section>
      )}

      {/* Content area — dark background continues */}
      <div className="relative bg-[#050A18]">
        {/* Gradient transition from hero */}
        <div className="pointer-events-none absolute -top-32 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#050A18]" />

        {/* Astro Conditions */}
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          {city.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
            </div>
          ) : (
            <AstroConditionsBanner
              locationId={city.id}
              cityName={city.name ?? 'São Paulo'}
            />
          )}
        </div>

        {/* Section divider */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
              Próximos Eventos
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>

        {/* Event Feed */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          {eventsLoading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-4">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="flex gap-2">
                      <div className="h-4 w-20 rounded bg-white/5" />
                      <div className="h-4 w-16 rounded bg-white/5" />
                    </div>
                    <div className="h-5 w-3/4 rounded bg-white/5" />
                    <div className="h-4 w-full rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : feedEvents.length === 0 ? (
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
                Nenhum evento disponível
              </h3>
              <p className="text-sm text-gray-500">
                Novos eventos astronômicos serão adicionados em breve.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {feedEvents.map((event) => (
                <EventFeedCard
                  key={event.id}
                  id={event.id}
                  slug={event.slug}
                  title={event.title}
                  type={event.type}
                  dateStart={
                    event.startAt ?? event.dateStart ?? event.date_start ?? ''
                  }
                  dateEnd={event.endAt ?? event.dateEnd ?? event.date_end}
                  description={event.description}
                  imageUrl={event.imageUrl ?? event.image_url}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
            </div>
          )}

          {!hasNextPage && feedEvents.length > 0 && (
            <div className="flex items-center gap-4 py-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
                Fim da lista
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
