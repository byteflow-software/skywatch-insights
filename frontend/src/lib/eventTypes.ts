const TYPE_LABELS: Record<string, string> = {
  ECLIPSE_LUNAR: 'Eclipse Lunar',
  ECLIPSE_SOLAR: 'Eclipse Solar',
  METEOR_SHOWER: 'Chuva de Meteoros',
  CONJUNCTION: 'Conjunção',
  PLANETARY_CONJUNCTION: 'Conjunção Planetária',
  OPPOSITION: 'Oposição',
  SUPERMOON: 'Superlua',
  COMET: 'Cometa',
  COMET_APPROACH: 'Aproximação de Cometa',
  AURORA: 'Aurora',
  SOLAR_FLARE: 'Explosão Solar',
  CME: 'Ejeção de Massa Coronal',
  GEOMAGNETIC_STORM: 'Tempestade Geomagnética',
  OCCULTATION: 'Ocultação',
  TRANSIT: 'Trânsito',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  eclipse_lunar: 'bg-amber-100 text-amber-700',
  eclipse_solar: 'bg-amber-100 text-amber-700',
  meteor_shower: 'bg-purple-100 text-purple-700',
  conjunction: 'bg-blue-100 text-blue-700',
  planetary_conjunction: 'bg-blue-100 text-blue-700',
  opposition: 'bg-teal-100 text-teal-700',
  supermoon: 'bg-yellow-100 text-yellow-700',
  comet: 'bg-emerald-100 text-emerald-700',
  comet_approach: 'bg-emerald-100 text-emerald-700',
  aurora: 'bg-pink-100 text-pink-700',
  solar_flare: 'bg-orange-100 text-orange-700',
  cme: 'bg-red-100 text-red-700',
  geomagnetic_storm: 'bg-indigo-100 text-indigo-700',
  occultation: 'bg-slate-100 text-slate-700',
  transit: 'bg-cyan-100 text-cyan-700',
};

function createTypeImage(
  label: string,
  primaryColor: string,
  secondaryColor: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" role="img" aria-label="${label}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${primaryColor}"/><stop offset="100%" stop-color="${secondaryColor}"/></linearGradient><radialGradient id="glow" cx="70%" cy="30%" r="55%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="600" fill="url(#bg)"/><rect width="1200" height="600" fill="url(#glow)"/><circle cx="980" cy="110" r="3" fill="#ffffff" opacity="0.75"/><circle cx="1060" cy="190" r="2" fill="#ffffff" opacity="0.62"/><circle cx="900" cy="210" r="2" fill="#ffffff" opacity="0.58"/><circle cx="160" cy="420" r="2" fill="#ffffff" opacity="0.5"/><text x="80" y="510" fill="#ffffff" fill-opacity="0.92" font-family="system-ui,Segoe UI,sans-serif" font-size="54" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const TYPE_IMAGES: Record<string, string> = {
  ECLIPSE_LUNAR: createTypeImage('Eclipse Lunar', '#111827', '#4B5563'),
  ECLIPSE_SOLAR: createTypeImage('Eclipse Solar', '#1F2937', '#F59E0B'),
  METEOR_SHOWER: createTypeImage('Chuva de Meteoros', '#1E1B4B', '#0EA5E9'),
  CONJUNCTION: createTypeImage('Conjunção', '#0F172A', '#2563EB'),
  PLANETARY_CONJUNCTION: createTypeImage(
    'Conjunção Planetária',
    '#111827',
    '#3B82F6',
  ),
  OPPOSITION: createTypeImage('Oposição', '#0B132B', '#14B8A6'),
  SUPERMOON: createTypeImage('Superlua', '#1F2937', '#FBBF24'),
  COMET: createTypeImage('Cometa', '#0F172A', '#10B981'),
  COMET_APPROACH: createTypeImage(
    'Aproximação de Cometa',
    '#0F172A',
    '#34D399',
  ),
  AURORA: createTypeImage('Aurora', '#052E16', '#06B6D4'),
  SOLAR_FLARE: createTypeImage('Explosão Solar', '#7C2D12', '#F97316'),
  CME: createTypeImage('Ejeção de Massa Coronal', '#450A0A', '#EF4444'),
  GEOMAGNETIC_STORM: createTypeImage(
    'Tempestade Geomagnética',
    '#1E1B4B',
    '#6366F1',
  ),
  OCCULTATION: createTypeImage('Ocultação', '#111827', '#334155'),
  TRANSIT: createTypeImage('Trânsito', '#083344', '#06B6D4'),
};

// Accent colors for card left border (hex)
const TYPE_ACCENT_COLORS: Record<string, string> = {
  eclipse_lunar: '#F59E0B',
  eclipse_solar: '#F59E0B',
  meteor_shower: '#A855F7',
  conjunction: '#3B82F6',
  planetary_conjunction: '#3B82F6',
  opposition: '#14B8A6',
  supermoon: '#FBBF24',
  comet: '#10B981',
  comet_approach: '#34D399',
  aurora: '#EC4899',
  solar_flare: '#F97316',
  cme: '#EF4444',
  geomagnetic_storm: '#6366F1',
  occultation: '#64748B',
  transit: '#06B6D4',
};

// SVG path data for type icons (24x24 viewBox)
const TYPE_ICONS: Record<string, string> = {
  // Moon crescent for eclipses
  eclipse_lunar:
    'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
  eclipse_solar:
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  // Shooting star for meteor showers
  meteor_shower:
    'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
  conjunction:
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  planetary_conjunction:
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
  opposition:
    'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  supermoon:
    'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
  comet:
    'M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  comet_approach:
    'M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  // Wave/aurora pattern
  aurora:
    'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
  // Sun/fire for solar flare
  solar_flare:
    'M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z',
  // Expanding circles for CME
  cme: 'M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z',
  geomagnetic_storm:
    'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
  // Eye for occultation
  occultation:
    'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  transit:
    'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
};

function isValidImageUrl(imageUrl?: string | null): imageUrl is string {
  if (!imageUrl) return false;
  return /^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:image/');
}

export function getTypeAccentColor(type: string): string {
  return TYPE_ACCENT_COLORS[type.toLowerCase()] ?? '#0EA5E9';
}

export function getTypeIconPath(type: string): string | undefined {
  return TYPE_ICONS[type.toLowerCase()];
}

export function formatEventType(type: string): string {
  return (
    TYPE_LABELS[type] ??
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function getTypeBadgeColor(type: string): string {
  return TYPE_BADGE_COLORS[type.toLowerCase()] ?? 'bg-[#E0F2FE] text-[#0F172A]';
}

export function getEventImage(
  type: string,
  imageUrl?: string | null,
): string | undefined {
  if (isValidImageUrl(imageUrl)) return imageUrl;
  return TYPE_IMAGES[type];
}
