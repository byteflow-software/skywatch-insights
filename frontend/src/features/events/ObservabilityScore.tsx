import React from 'react';

interface ObservabilityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score > 70) return '#22c55e';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score > 70) return 'Excelente';
  if (score >= 40) return 'Moderada';
  return 'Baixa';
}

const sizeMap = {
  sm: { box: 80, stroke: 6, text: 'text-lg', label: 'text-[10px]' },
  md: { box: 120, stroke: 8, text: 'text-2xl', label: 'text-xs' },
  lg: { box: 160, stroke: 10, text: 'text-3xl', label: 'text-sm' },
};

const ObservabilityScore: React.FC<ObservabilityScoreProps> = ({
  score,
  size = 'md',
}) => {
  const clamped = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clamped);
  const label = getScoreLabel(clamped);
  const { box, stroke, text, label: labelSize } = sizeMap[size];

  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} className="-rotate-90">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-white ${text}`}>{clamped}</span>
        </div>
      </div>
      <span className={`font-medium ${labelSize}`} style={{ color }}>
        {label}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
        Observabilidade
      </span>
    </div>
  );
};

export default ObservabilityScore;
