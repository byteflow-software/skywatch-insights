import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExports, type ExportItem } from '@/hooks/useExports';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared';
import ExportPreview from './ExportPreview';

const NETWORK_OPTIONS = [
  { value: '', label: 'All Networks' },
  { value: 'INSTAGRAM_STORY', label: 'Instagram Story' },
  { value: 'INSTAGRAM_REELS', label: 'Instagram Reels' },
  { value: 'INSTAGRAM_FEED', label: 'Instagram Feed' },
  { value: 'THREADS', label: 'Threads' },
  { value: 'X', label: 'X' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
};

const ExportHistory: React.FC = () => {
  const navigate = useNavigate();
  const [networkFilter, setNetworkFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useExports({
    network: networkFilter || undefined,
    page,
    size: 10,
  });

  if (selectedExportId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <button
          type="button"
          onClick={() => setSelectedExportId(null)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#334155] hover:text-[#0EA5E9]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Voltar ao histórico
        </button>
        <ExportPreview exportId={selectedExportId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Histórico de Exportações</h1>
          <p className="mt-1 text-sm text-[#334155]">Visualize e gerencie suas exportações de conteúdo.</p>
        </div>
        <select
          value={networkFilter}
          onChange={(e) => { setNetworkFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-[#334155] shadow-sm focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
        >
          {NETWORK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading && <LoadingState message="Carregando exportações..." />}
      {isError && <ErrorState title="Erro" message="Não foi possível carregar as exportações." onRetry={() => refetch()} />}

      {data && (data.data ?? data.content ?? []).length === 0 && (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          title="Nenhuma exportação ainda"
          description="Gere sua primeira exportação a partir de uma página de evento para vê-la aqui."
          action={{ label: 'Explorar Eventos', onClick: () => navigate('/events') }}
        />
      )}

      {data && (data.data ?? data.content ?? []).length > 0 && (
        <>
          <div className="space-y-3">
            {(data.data ?? data.content ?? []).map((item: ExportItem) => {
              const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.PENDING;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedExportId(item.id)}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-[#0EA5E9]/40 hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">{item.eventTitle}</p>
                    <p className="mt-1 text-xs text-[#334155]">
                      {NETWORK_OPTIONS.find((n) => n.value === item.network)?.label ?? item.network}
                      {' '}&middot;{' '}{item.format}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                  <span className="shrink-0 text-xs text-[#334155]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <svg className="h-4 w-4 shrink-0 text-[#334155]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#E0F2FE] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-[#334155]">
                Página {page + 1} de {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page + 1 >= data.totalPages}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#E0F2FE] disabled:cursor-not-allowed disabled:opacity-50"
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

export default ExportHistory;
