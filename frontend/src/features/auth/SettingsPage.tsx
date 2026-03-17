import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuthContext } from './AuthProvider';
import { useUploadAvatar, useDeleteAvatar } from '@/hooks/useAvatar';
import UserAvatar from '@/components/shared/UserAvatar';
import type { LocationOption } from '@/lib/schemas/user';

const INTEREST_OPTIONS = [
  'Eclipses',
  'Chuvas de Meteoros',
  'Conjunções',
  'Superluas',
  'Cometas',
  'Oposições',
];

const THEME_OPTIONS = [
  { value: 'LIGHT', label: 'Claro' },
  { value: 'DARK', label: 'Escuro' },
  { value: 'SYSTEM', label: 'Sistema' },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
] as const;

interface RecentExport {
  id: string;
  eventTitle?: string;
  event?: {
    title?: string;
  };
  network?: string;
  socialNetwork?: string;
  createdAt?: string;
  created_at?: string;
  bundleUrl?: string;
}

export function SettingsPage() {
  const { user, isLoading: isProfileLoading, logout } = useAuthContext();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  // City search state
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<LocationOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Preferences state
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [theme, setTheme] = useState('SYSTEM');
  const [language, setLanguage] = useState('pt-BR');
  const [displayName, setDisplayName] = useState('');

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export history
  const { data: exportsData } = useQuery({
    queryKey: ['export-history'],
    queryFn: async () => {
      const { data } = await api.get('/exports', {
        params: { size: 5, sort: 'createdAt,desc' },
      });
      return data?.data ?? data?.content ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const recentExports: RecentExport[] = exportsData ?? [];

  const isAdmin = user?.role === 'ADMIN';

  // Initialize from user profile
  useEffect(() => {
    if (user) {
      setDisplayName(user.name ?? '');
      setSelectedInterests(user.astronomicalInterests ?? []);
      setTheme(user.theme ?? 'SYSTEM');
      setLanguage(user.language ?? 'pt-BR');
      if (user.preferredCity) {
        setSelectedCity({
          id: user.preferredCity.id,
          name: user.preferredCity.name,
          countryCode: user.preferredCity.countryCode,
          timezone: user.timezone ?? '',
        });
        setCityQuery(user.preferredCity.name);
      }
    }
  }, [user]);

  // Debounced city search
  useEffect(() => {
    if (cityQuery.length < 2) {
      setCityResults([]);
      return;
    }

    if (selectedCity && cityQuery === selectedCity.name) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get('/cities/search', {
          params: { q: cityQuery },
        });
        setCityResults(data?.data ?? (Array.isArray(data) ? data : []));
      } catch {
        setCityResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cityQuery, selectedCity]);

  const handleSelectCity = useCallback((city: LocationOption) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setCityResults([]);
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      await api.patch('/me/preferences', {
        preferredCityId: selectedCity?.id ?? null,
        timezone: selectedCity?.timezone ?? null,
        astronomicalInterests: selectedInterests,
        theme,
        language,
        name: displayName.trim() || null,
      });
      // Refresh profile and city data so home page updates
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-city'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      if (axiosErr.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError(
          axiosErr.response?.data?.message ??
            'Erro ao salvar preferências. Tente novamente.',
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-white">
        Configurações
      </h1>

      {/* Admin link */}
      {isAdmin && (
        <Link
          to="/dashboard"
          className="mb-8 flex items-center gap-3 rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/10 p-4 transition-all hover:border-[#6366F1]/40 hover:bg-[#6366F1]/15"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/20">
            <svg
              className="h-5 w-5 text-[#6366F1]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Painel Administrativo
            </p>
            <p className="text-xs text-gray-400">
              Gerenciar eventos, destaques e analytics
            </p>
          </div>
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Link>
      )}

      {/* Profile section */}
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Perfil</h2>

        {/* Avatar upload */}
        <div className="mb-5 flex items-center gap-4">
          <UserAvatar
            name={user?.name ?? ''}
            avatarUrl={user?.avatarUrl}
            size="lg"
          />
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar.mutate(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              {uploadAvatar.isPending ? 'Enviando...' : 'Alterar foto'}
            </button>
            {user?.avatarUrl && (
              <button
                type="button"
                onClick={() => deleteAvatar.mutate()}
                disabled={deleteAvatar.isPending}
                className="text-xs text-gray-500 transition hover:text-red-400 disabled:opacity-40"
              >
                Remover foto
              </button>
            )}
            {uploadAvatar.isError && (
              <p className="text-xs text-red-400">Erro ao enviar foto.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Nome
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Email
            </label>
            <p className="mt-0.5 text-sm text-white">{user?.email ?? '—'}</p>
          </div>
        </div>
      </section>

      {/* City section */}
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Cidade preferida
        </h2>
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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
            </div>
          )}

          {cityResults.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0F172A] shadow-lg">
              {cityResults.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    <span>{city.name}</span>
                    <span className="text-xs text-gray-500">
                      {city.countryCode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedCity && (
          <p className="mt-2 text-xs text-gray-500">
            Fuso horário: {selectedCity.timezone}
          </p>
        )}
      </section>

      {/* Interests section */}
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Interesses astronômicos
        </h2>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-xl px-4 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </section>

      {/* Theme & Language section */}
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Aparência</h2>
        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">
              Tema
            </label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    theme === opt.value
                      ? 'bg-[#0EA5E9] text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="language-select"
              className="mb-1.5 block text-sm font-medium text-gray-400"
            >
              Idioma
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#0F172A]"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Export history */}
      <section className="mb-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Histórico de Exportações
        </h2>
        {recentExports.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhuma exportação realizada ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {recentExports.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {exp.eventTitle ?? exp.event?.title ?? 'Evento'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {exp.network ?? exp.socialNetwork} &middot;{' '}
                    {new Date(
                      exp.createdAt ?? exp.created_at ?? Date.now(),
                    ).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {exp.bundleUrl && (
                  <a
                    href={exp.bundleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-[#0EA5E9] transition hover:bg-white/10"
                  >
                    Baixar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feedback */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          Preferências salvas com sucesso!
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25 disabled:opacity-50"
      >
        {isSaving ? 'Salvando...' : 'Salvar preferências'}
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="mt-4 w-full rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/20"
      >
        Sair da conta
      </button>
    </div>
  );
}
