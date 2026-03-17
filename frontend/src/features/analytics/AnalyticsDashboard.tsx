import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { LoadingState, ErrorState } from '@/components/shared';

interface AnalyticsStats {
  totalViews: number;
  totalExports: number;
  totalDownloads: number;
}

const STAT_CARDS: { key: keyof AnalyticsStats; label: string; icon: React.ReactNode }[] = [
  {
    key: 'totalViews',
    label: 'Total Views',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    key: 'totalExports',
    label: 'Total Exports',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    key: 'totalDownloads',
    label: 'Total Downloads',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const AnalyticsDashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<AnalyticsStats>({
    queryKey: ['analytics', 'stats'],
    queryFn: () => api.get('/analytics/stats').then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Análises</h1>
        <p className="mt-1 text-sm text-[#334155]">Visão geral do desempenho do seu conteúdo.</p>
      </div>

      {isLoading && <LoadingState message="Carregando análises..." />}
      {isError && <ErrorState title="Erro" message="Não foi possível carregar as análises." onRetry={() => refetch()} />}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAT_CARDS.map((card) => (
            <div
              key={card.key}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E0F2FE] text-[#0EA5E9]">
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#334155]">{card.label}</p>
                  <p className="text-2xl font-bold text-[#0F172A]">{formatNumber(data[card.key])}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart placeholder */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <svg className="mx-auto mb-3 h-10 w-10 text-[#334155]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
        <p className="text-sm font-medium text-[#334155]">Charts coming soon</p>
        <p className="mt-1 text-xs text-slate-400">Detailed analytics with charts will be available in a future release.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
