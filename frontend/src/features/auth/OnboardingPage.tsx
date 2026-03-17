import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { LocationOption } from '@/lib/schemas/user';

const INTEREST_OPTIONS = [
  'Eclipses',
  'Chuvas de Meteoros',
  'Conjunções',
  'Superluas',
  'Cometas',
  'Oposições',
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // City search state
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<LocationOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Interests state
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced city search
  useEffect(() => {
    if (cityQuery.length < 2) {
      setCityResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get('/cities/search', { params: { q: cityQuery } });
        setCityResults(data?.data ?? (Array.isArray(data) ? data : []));
      } catch {
        setCityResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cityQuery]);

  const handleSelectCity = useCallback((city: LocationOption) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setCityResults([]);
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await api.patch('/me/preferences', {
        preferredCityId: selectedCity?.id,
        timezone: selectedCity?.timezone,
        astronomicalInterests: selectedInterests,
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-city'] });
      navigate('/', { replace: true });
    } catch {
      setError('Erro ao salvar preferências. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-midnight">Bem-vindo ao SkyWatch!</h1>
          <p className="mt-2 text-sm text-slate-custom">
            Vamos personalizar sua experiência
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="h-2 w-16 rounded-full bg-skyblue" />
          <div className="h-2 w-16 rounded-full bg-ice" />
        </div>

        {/* City search */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-custom">
            Sua cidade
          </label>
          <div className="relative">
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                if (selectedCity && e.target.value !== selectedCity.name) {
                  setSelectedCity(null);
                }
              }}
              placeholder="Buscar cidade ou digitar CEP..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-midnight outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ice border-t-skyblue" />
              </div>
            )}

            {/* Results dropdown */}
            {cityResults.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {cityResults.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-midnight hover:bg-ice"
                    >
                      <span>{city.name}</span>
                      <span className="text-xs text-slate-custom">{city.countryCode}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedCity && (
            <p className="mt-2 text-xs text-slate-custom">
              Fuso horário: {selectedCity.timezone}
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-slate-custom">
            Interesses astronômicos
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-skyblue text-white'
                      : 'bg-ice text-slate-custom hover:bg-skyblue/10'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full rounded-lg bg-skyblue py-2.5 text-sm font-semibold text-white transition hover:bg-skyblue/90 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Continuar'}
        </button>

        {/* Skip */}
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="mt-3 w-full py-2 text-sm text-slate-custom hover:underline"
        >
          Pular por enquanto
        </button>
      </div>
    </div>
  );
}
