import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

function formatTime(iso: string): string {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--';
  }
}

function getSeeingColor(quality: string): string {
  switch (quality) {
    case 'Excelente': return 'text-green-500';
    case 'Boa': return 'text-emerald-500';
    case 'Moderada': return 'text-yellow-500';
    case 'Ruim': return 'text-orange-500';
    case 'Péssima': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export default function AstroConditionsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['astro-conditions'],
    queryFn: () => api.get('/astro-conditions').then(r => r.data),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E0F2FE] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-[#0F172A]">Condições de Observação</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E0F2FE] border-t-[#0EA5E9]" />
        </div>
      </div>
    );
  }

  if (isError || !data || data.error) {
    return (
      <div className="rounded-xl border border-[#E0F2FE] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-[#0F172A]">Condições de Observação</h3>
        <p className="text-sm text-gray-400">
          {data?.error === 'NO_CITY'
            ? 'Selecione sua cidade para ver as condições.'
            : 'Indisponível no momento.'}
        </p>
      </div>
    );
  }

  const conditions = data.conditions;
  const sun = data.sun;
  const weather = data.weather;
  const location = data.location;

  return (
    <div className="rounded-xl border border-[#E0F2FE] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#E0F2FE] px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0F172A]">Condições de Observação</h3>
          {location && (
            <span className="text-xs text-[#334155]">{location.name}</span>
          )}
        </div>
        {conditions?.seeingQuality && (
          <p className={`mt-1 text-sm font-medium ${getSeeingColor(conditions.seeingQuality)}`}>
            Qualidade: {conditions.seeingQuality}
          </p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Weather description */}
        {weather?.description && (
          <p className="text-sm text-[#334155] capitalize">{weather.description}</p>
        )}

        {/* Cloud layers */}
        {conditions?.clouds && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#334155]">Nuvens</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg bg-[#E0F2FE]/50 p-2 text-center">
                <p className="text-lg font-bold text-[#0F172A]">{conditions.clouds.total}%</p>
                <p className="text-[10px] text-[#334155]">Total</p>
              </div>
              <div className="rounded-lg bg-[#E0F2FE]/50 p-2 text-center">
                <p className="text-lg font-bold text-[#0F172A]">{conditions.clouds.low}%</p>
                <p className="text-[10px] text-[#334155]">Baixas</p>
              </div>
              <div className="rounded-lg bg-[#E0F2FE]/50 p-2 text-center">
                <p className="text-lg font-bold text-[#0F172A]">{conditions.clouds.mid}%</p>
                <p className="text-[10px] text-[#334155]">Médias</p>
              </div>
              <div className="rounded-lg bg-[#E0F2FE]/50 p-2 text-center">
                <p className="text-lg font-bold text-[#0F172A]">{conditions.clouds.high}%</p>
                <p className="text-[10px] text-[#334155]">Altas</p>
              </div>
            </div>
          </div>
        )}

        {/* Conditions grid */}
        {conditions && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-[#E0F2FE]/30 p-2 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{conditions.temperature?.toFixed(0)}°C</p>
              <p className="text-[10px] text-[#334155]">Temp</p>
            </div>
            <div className="rounded-lg bg-[#E0F2FE]/30 p-2 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{conditions.humidity}%</p>
              <p className="text-[10px] text-[#334155]">Umidade</p>
            </div>
            <div className="rounded-lg bg-[#E0F2FE]/30 p-2 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{(conditions.visibility / 1000).toFixed(0)}km</p>
              <p className="text-[10px] text-[#334155]">Visibilidade</p>
            </div>
            <div className="rounded-lg bg-[#E0F2FE]/30 p-2 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{conditions.windSpeed?.toFixed(0)}km/h</p>
              <p className="text-[10px] text-[#334155]">Vento</p>
            </div>
            <div className="rounded-lg bg-[#E0F2FE]/30 p-2 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{conditions.dewPoint?.toFixed(1)}°C</p>
              <p className="text-[10px] text-[#334155]">Ponto Orvalho</p>
            </div>
            <div className="rounded-lg bg-[#E0F2FE]/30 p-2 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{conditions.isDay ? 'Dia' : 'Noite'}</p>
              <p className="text-[10px] text-[#334155]">Período</p>
            </div>
          </div>
        )}

        {/* Sun & Twilight */}
        {sun && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#334155]">Sol e Crepúsculos</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155]">Nascer do sol</span>
                <span className="font-medium text-[#0F172A]">{formatTime(sun.sunrise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#334155]">Por do sol</span>
                <span className="font-medium text-[#0F172A]">{formatTime(sun.sunset)}</span>
              </div>
              {sun.twilight && (
                <>
                  <div className="my-1.5 border-t border-dashed border-[#E0F2FE]" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#334155]">Crep. astronômico</span>
                    <span className="font-medium text-[#0EA5E9]">
                      {formatTime(sun.twilight.astronomicalEnd)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Melhor hora para observar: após {formatTime(sun.twilight.astronomicalEnd)}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
