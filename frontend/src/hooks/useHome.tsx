import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api, { getValidAccessToken } from '@/services/api';

interface EventPage {
  data?: unknown[];
  content?: unknown[];
  items?: unknown[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export function useWeeklyHighlight() {
  return useQuery({
    queryKey: ['weekly-highlight'],
    queryFn: async () => {
      const { data, status } = await api.get('/highlights/week', {
        validateStatus: (s) => s === 200 || s === 204,
      });
      if (status === 204 || !data) return null;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomeEvents(pageSize = 10) {
  return useInfiniteQuery<EventPage>({
    queryKey: ['home-events'],
    queryFn: ({ pageParam = 0 }) =>
      api
        .get('/events', {
          params: { sort: 'relevanceScore', size: pageSize, page: pageParam, from: new Date().toISOString() },
        })
        .then((r) => r.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number ?? 0;
      const total = lastPage.totalPages ?? 1;
      return currentPage + 1 < total ? currentPage + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserCity() {
  const isAuthenticated = !!getValidAccessToken();
  return useQuery({
    queryKey: ['user-city'],
    queryFn: async () => {
      const { data } = await api.get('/me');
      const user = data?.data ?? data;
      if (user?.preferredCity) {
        return {
          id: user.preferredCity.id,
          name: user.preferredCity.name,
        };
      }
      return null;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDefaultCity() {
  return useQuery({
    queryKey: ['default-city'],
    queryFn: async () => {
      const { data } = await api.get('/cities/search', {
        params: { q: 'São Paulo', limit: 1 },
      });
      const cities = data?.data ?? data ?? [];
      return cities.length > 0 ? cities[0] : null;
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useHomeCity() {
  const isAuthenticated = !!getValidAccessToken();
  const { data: userCity, isLoading: userCityLoading } = useUserCity();
  const { data: defaultCity } = useDefaultCity();

  // Wait for user city to load before falling back to default
  if (isAuthenticated && userCityLoading) {
    return { id: undefined, name: undefined, isLoading: true };
  }

  if (isAuthenticated && userCity) {
    return { id: userCity.id, name: userCity.name, isLoading: false };
  }
  if (defaultCity) {
    return { id: defaultCity.id, name: defaultCity.name, isLoading: false };
  }
  return { id: undefined, name: 'São Paulo', isLoading: false };
}

export function useDailyHighlight() {
  return useQuery({
    queryKey: ['daily-highlight'],
    queryFn: async () => {
      const { data, status } = await api.get('/highlights/today', {
        validateStatus: (s) => s === 200 || s === 204,
      });
      if (status === 204 || !data) return null;
      return data;
    },
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function usePublicAstroConditions(locationId?: string) {
  return useQuery({
    queryKey: ['public-astro-conditions', locationId],
    queryFn: () =>
      api.get(`/astro-conditions/location/${locationId}`).then((r) => r.data),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
