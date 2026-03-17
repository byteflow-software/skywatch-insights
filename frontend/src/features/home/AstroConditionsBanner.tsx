import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicAstroConditions } from '@/hooks/useHome';
import { getAccessToken } from '@/services/api';

interface AstroConditionsBannerProps {
  locationId?: string;
  cityName?: string;
}

interface MetricCard {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  gradientBar?: string;
  compactValue?: boolean;
}

function getSeeingColor(quality: string): string {
  switch (quality) {
    case 'Excelente':
      return 'from-green-400 to-emerald-500';
    case 'Boa':
      return 'from-emerald-400 to-teal-500';
    case 'Moderada':
      return 'from-yellow-400 to-amber-500';
    case 'Ruim':
      return 'from-orange-400 to-red-500';
    case 'Péssima':
      return 'from-red-400 to-red-600';
    default:
      return 'from-gray-400 to-gray-500';
  }
}

function getSeeingTextColor(quality: string): string {
  switch (quality) {
    case 'Excelente':
      return 'text-green-400';
    case 'Boa':
      return 'text-emerald-400';
    case 'Moderada':
      return 'text-yellow-400';
    case 'Ruim':
      return 'text-orange-400';
    case 'Péssima':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

const MOON_PHASE_PT: Record<string, string> = {
  'New Moon': 'Lua Nova',
  'Waxing Crescent': 'Crescente Côncava',
  'First Quarter': 'Quarto Crescente',
  'Waxing Gibbous': 'Crescente Convexa',
  'Full Moon': 'Lua Cheia',
  'Waning Gibbous': 'Minguante Convexa',
  'Last Quarter': 'Quarto Minguante',
  'Third Quarter': 'Quarto Minguante',
  'Waning Crescent': 'Minguante Côncava',
};

function translateMoonPhase(phase: string): string {
  return MOON_PHASE_PT[phase] ?? phase;
}

const AstroConditionsBanner: React.FC<AstroConditionsBannerProps> = ({
  locationId,
  cityName = 'São Paulo',
}) => {
  const { data, isLoading, isError } = usePublicAstroConditions(locationId);
  const isAuthenticated = !!getAccessToken();

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 text-red-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.007v.008H12v-.008Zm9.303 1.126c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l7.354 12.748Z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-200">
              Condições astronômicas indisponíveis
            </p>
            <p className="mt-1 text-xs text-red-200/70">
              Não foi possível carregar clima e fase lunar para a cidade
              selecionada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const conditions = data.conditions ?? data;
  const seeingQuality =
    conditions?.seeingQuality ?? conditions?.seeing_quality ?? '--';
  const cloudCoverage =
    conditions?.clouds?.total ??
    conditions?.cloudCoverageTotal ??
    conditions?.cloud_coverage_total ??
    conditions?.cloudCoverage;
  const temperature = conditions?.temperature ?? data.temperature;
  const humidity = conditions?.humidity ?? data.humidity;
  const moon = data.moon;

  const cards = [
    {
      label: 'Visibilidade',
      value: seeingQuality,
      color: getSeeingTextColor(seeingQuality),
      gradientBar: getSeeingColor(seeingQuality),
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
    },
    cloudCoverage != null && {
      label: 'Nuvens',
      value: `${cloudCoverage}%`,
      color:
        cloudCoverage < 30
          ? 'text-green-400'
          : cloudCoverage < 60
            ? 'text-yellow-400'
            : 'text-red-400',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"
          />
        </svg>
      ),
    },
    temperature != null && {
      label: 'Temperatura',
      value: `${Math.round(temperature)}°C`,
      color: 'text-[#0EA5E9]',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
          />
        </svg>
      ),
    },
    humidity != null && {
      label: 'Umidade',
      value: `${humidity}%`,
      color: 'text-[#6366F1]',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2.25c-3.75 4.5-7.5 7.5-7.5 12a7.5 7.5 0 0 0 15 0c0-4.5-3.75-7.5-7.5-12Z"
          />
        </svg>
      ),
    },
    moon && {
      label: 'Fase Lunar',
      value: translateMoonPhase(moon.phase ?? '--'),
      color: 'text-amber-300',
      compactValue: true,
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      ),
    },
    moon &&
      moon.illumination != null && {
        label: 'Iluminação',
        value: `${moon.illumination}%`,
        color:
          moon.illumination > 70
            ? 'text-amber-300'
            : moon.illumination > 30
              ? 'text-blue-300'
              : 'text-gray-300',
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
        ),
      },
  ].filter((card): card is MetricCard => Boolean(card));

  return (
    <div>
      {/* City label */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-400">
            Condições atuais em <span className="text-white">{cityName}</span>
          </span>
        </div>
        <Link
          to={isAuthenticated ? '/settings' : '/register'}
          className="text-xs font-medium text-[#0EA5E9] transition-colors hover:text-[#6366F1]"
        >
          Personalizar cidade →
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition-all hover:border-white/10 hover:bg-white/[0.06] sm:rounded-2xl sm:p-4"
          >
            {card.gradientBar && (
              <div
                className={`absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r ${card.gradientBar}`}
              />
            )}
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              {card.icon}
              <span className="text-xs font-medium">{card.label}</span>
            </div>
            <p
              className={`${
                card.compactValue
                  ? 'text-sm leading-tight sm:text-base lg:text-xl'
                  : 'text-base sm:text-xl lg:text-2xl'
              } break-words font-bold tracking-tight ${card.color}`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {!moon && (
        <p className="mt-3 text-xs text-gray-500">
          Dados lunares indisponíveis no momento. Exibindo apenas condições
          atmosféricas.
        </p>
      )}
    </div>
  );
};

export default AstroConditionsBanner;
