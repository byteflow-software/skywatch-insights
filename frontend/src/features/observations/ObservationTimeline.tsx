import React, { useState } from 'react';
import { useObservations } from '@/hooks/useObservations';
import ObservationCard from './ObservationCard';
import ObservationForm from './ObservationForm';

const ObservationTimeline: React.FC = () => {
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const pageSize = 10;

  const { data, isLoading, isError, refetch } = useObservations({ page, size: pageSize });

  const observations = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasMore = page + 1 < totalPages;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Observações</h1>
          <p className="mt-1 text-sm text-gray-400">Seu diário de observações astronômicas.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25"
        >
          {showForm ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova Observação
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-[#0EA5E9]/20 bg-white/[0.03] p-5">
          <ObservationForm onSuccess={() => { setShowForm(false); refetch(); }} />
        </div>
      )}

      {/* Timeline */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <div className="mb-3 h-4 w-32 rounded bg-white/5" />
              <div className="h-5 w-3/4 rounded bg-white/5" />
              <div className="mt-3 h-4 w-full rounded bg-white/5" />
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
          <h3 className="mb-1 text-lg font-semibold text-white">Erro ao carregar</h3>
          <p className="mb-4 text-sm text-gray-500">Falha ao carregar observações.</p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0EA5E9]/90"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !isError && observations.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">Nenhuma observação ainda</h3>
          <p className="mb-4 text-sm text-gray-500">Comece a registrar suas observações astronômicas!</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25"
          >
            Adicionar Observação
          </button>
        </div>
      )}

      {observations.length > 0 && (
        <div className="space-y-4">
          {observations.map((obs: any) => (
            <ObservationCard key={obs.id} observation={obs} />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white"
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObservationTimeline;
