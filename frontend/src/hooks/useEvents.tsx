import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface EventParams {
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: 'date' | 'relevance';
}

export function useEvents(params?: EventParams) {
  const apiParams = {
    ...params,
    from: params?.from ? `${params.from}T00:00:00Z` : undefined,
    to: params?.to ? `${params.to}T23:59:59Z` : undefined,
    sort: params?.sort === 'relevance' ? 'relevanceScore' : params?.sort === 'date' ? 'startAt' : params?.sort,
  };
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => api.get('/events', { params: apiParams }).then((r) => r.data),
  });
}

export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.get(`/events/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useEventForecast(eventId: string) {
  return useQuery({
    queryKey: ['forecast', eventId],
    queryFn: () => api.get(`/events/${eventId}/forecast`).then((r) => r.data),
    enabled: !!eventId,
  });
}

export interface ArchivedEventParams {
  type?: string;
  page?: number;
  size?: number;
}

export function useArchivedEvents(params?: ArchivedEventParams) {
  return useQuery({
    queryKey: ['events-archived', params],
    queryFn: () => api.get('/events/archived', { params }).then((r) => r.data),
  });
}
