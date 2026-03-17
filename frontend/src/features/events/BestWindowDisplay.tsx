import React from 'react';

interface BestWindowDisplayProps {
  start: string;
  end: string;
  weatherSummary?: string;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const BestWindowDisplay: React.FC<BestWindowDisplayProps> = ({
  start,
  end,
  weatherSummary,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-[#0EA5E9]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
          Melhor Janela de Observação
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Início
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatDateTime(start)}
          </p>
        </div>

        <svg
          className="h-4 w-4 shrink-0 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>

        <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Fim
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatDateTime(end)}
          </p>
        </div>
      </div>

      {weatherSummary && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"
            />
          </svg>
          <p className="text-xs text-gray-400">{weatherSummary}</p>
        </div>
      )}
    </div>
  );
};

export default BestWindowDisplay;
