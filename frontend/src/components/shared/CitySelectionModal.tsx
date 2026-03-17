import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

interface CityOption {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

interface CitySelectionModalProps {
  open: boolean;
  onCitySelected: (city: CityOption) => void;
}

export default function CitySelectionModal({ open, onCitySelected }: CitySelectionModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get('/cities/search', { params: { q: query, limit: 8 } });
        setResults(data?.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(async (city: CityOption) => {
    setIsSaving(true);
    setError(null);
    try {
      await api.patch('/me/preferences', {
        preferredCityId: city.id,
        timezone: city.timezone,
      });
      onCitySelected(city);
    } catch {
      setError('Erro ao salvar cidade. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [onCitySelected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0EA5E9]/20">
            <svg className="h-7 w-7 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Selecione sua cidade</h2>
          <p className="mt-1 text-sm text-[#E0F2FE]/80">
            Para calcular previsões de observação astronômica
          </p>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative">
            <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cidade ou digitar CEP..."
              autoFocus
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
            />
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E0F2FE] border-t-[#0EA5E9]" />
              </div>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <ul className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-gray-100">
              {results.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(city)}
                    disabled={isSaving}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#E0F2FE]/50 disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{city.name}</p>
                      <p className="text-xs text-[#334155]">{city.timezone}</p>
                    </div>
                    <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 text-xs font-medium text-[#0EA5E9]">
                      {city.countryCode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.length >= 2 && !isSearching && results.length === 0 && (
            <p className="mt-4 text-center text-sm text-gray-400">
              Nenhuma cidade encontrada para "{query}"
            </p>
          )}

          {query.length < 2 && (
            <p className="mt-4 text-center text-sm text-gray-400">
              Digite o nome da cidade ou CEP para buscar
            </p>
          )}

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
