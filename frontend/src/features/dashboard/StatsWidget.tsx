import React from 'react';

interface StatsWidgetProps {
  totalFavorites: number;
  totalObservations: number;
  totalExports: number;
}

const stats = (props: StatsWidgetProps) => [
  {
    label: 'Favoritos',
    value: props.totalFavorites,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    color: 'text-red-500 bg-red-50',
  },
  {
    label: 'Observações',
    value: props.totalObservations,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    color: 'text-[#0EA5E9] bg-[#E0F2FE]',
  },
  {
    label: 'Exportações',
    value: props.totalExports,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    color: 'text-emerald-500 bg-emerald-50',
  },
];

const StatsWidget: React.FC<StatsWidgetProps> = (props) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats(props).map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-[#E0F2FE] bg-white p-5 shadow-sm"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
          >
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
            <p className="text-xs font-medium text-[#334155]">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsWidget;
