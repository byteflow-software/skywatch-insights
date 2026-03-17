import React from 'react';

interface SpaceWeatherBadgeProps {
  type: string;
  description?: string;
}

function extractIntensity(type: string, description?: string): string | null {
  if (!description) return null;

  switch (type) {
    case 'SOLAR_FLARE': {
      const match = description.match(/Classe:\s*([XMCB]\d*\.?\d*)/i);
      return match ? `Classe ${match[1]}` : null;
    }
    case 'GEOMAGNETIC_STORM': {
      const match = description.match(/Kp\s*(?:máximo|maximo|max)?:?\s*(\d+)/i);
      return match ? `Kp ${match[1]}` : null;
    }
    case 'CME': {
      const match = description.match(/Velocidade:\s*([\d.]+)\s*km\/s/i);
      return match ? `${Math.round(parseFloat(match[1]))} km/s` : null;
    }
    default:
      return null;
  }
}

function getIntensityColor(type: string, description?: string): string {
  if (!description) return 'bg-gray-500/20 text-gray-300';

  switch (type) {
    case 'SOLAR_FLARE': {
      if (description.includes('Classe: X') || description.includes('Classe: x'))
        return 'bg-red-500/20 text-red-300';
      if (description.includes('Classe: M') || description.includes('Classe: m'))
        return 'bg-orange-500/20 text-orange-300';
      return 'bg-yellow-500/20 text-yellow-300';
    }
    case 'GEOMAGNETIC_STORM': {
      const match = description.match(/Kp\s*(?:máximo|maximo|max)?:?\s*(\d+)/i);
      if (match) {
        const kp = parseInt(match[1]);
        if (kp >= 7) return 'bg-red-500/20 text-red-300';
        if (kp >= 5) return 'bg-orange-500/20 text-orange-300';
      }
      return 'bg-yellow-500/20 text-yellow-300';
    }
    case 'CME': {
      const match = description.match(/Velocidade:\s*([\d.]+)/i);
      if (match && parseFloat(match[1]) > 1000) return 'bg-red-500/20 text-red-300';
      return 'bg-orange-500/20 text-orange-300';
    }
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
}

const SPACE_WEATHER_TYPES = ['SOLAR_FLARE', 'CME', 'GEOMAGNETIC_STORM', 'AURORA'];

const SpaceWeatherBadge: React.FC<SpaceWeatherBadgeProps> = ({ type, description }) => {
  if (!SPACE_WEATHER_TYPES.includes(type)) return null;

  const intensity = extractIntensity(type, description);
  if (!intensity) return null;

  const color = getIntensityColor(type, description);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
      {intensity}
    </span>
  );
};

export default SpaceWeatherBadge;
