import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useEventBySlug } from '@/hooks/useEvents';
import ExportPanel from './ExportPanel';

const EventExportPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError } = useEventBySlug(slug ?? '');

  // Export is gated behind BETA flag
  if (import.meta.env.VITE_ENABLE_EXPORT !== 'true') {
    return <Navigate to={`/events/${slug}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
          <span className="text-sm text-gray-500">Carregando...</span>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h3 className="mb-1 text-lg font-semibold text-white">
          Evento não encontrado
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Não foi possível carregar o evento para exportação.
        </p>
        <Link
          to="/events"
          className="rounded-xl bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0EA5E9]/90"
        >
          Voltar aos eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-8">
      <Link
        to={`/events/${slug}`}
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
        Voltar ao evento
      </Link>

      <ExportPanel eventId={event.id} eventTitle={event.title} />
    </div>
  );
};

export default EventExportPage;
