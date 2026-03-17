import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export type ObservationOutcome = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CLOUDED_OUT';

export interface Observation {
  id: string;
  eventId?: string;
  eventTitle?: string;
  event?: { id: string; title: string; slug: string };
  observedAt: string;
  locationName: string;
  notes: string;
  outcome: ObservationOutcome;
  mediaUrl?: string;
  createdAt: string;
}

export interface ObservationPage {
  content: Observation[];
  data?: Observation[];
  totalElements: number;
  totalPages: number;
  number: number;
  page?: number;
  size: number;
}

export interface CreateObservationData {
  eventId?: string;
  observedAt: string;
  locationName: string;
  notes: string;
  outcome: ObservationOutcome;
  mediaUrl?: string;
}

export function useObservations(params?: { page?: number; size?: number }) {
  return useQuery<ObservationPage>({
    queryKey: ['observations', params],
    queryFn: async () => {
      const { data } = await api.get('/observations', { params });
      // Normalize: backend returns { data: [...], page, ... }, frontend expects { content: [...], number, ... }
      const items = (data.content ?? data.data ?? []).map((obs: any) => ({
        ...obs,
        eventId: obs.eventId ?? obs.event?.id,
        eventTitle: obs.eventTitle ?? obs.event?.title,
      }));
      return {
        content: items,
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
        number: data.number ?? data.page ?? 0,
        size: data.size ?? params?.size ?? 10,
      };
    },
  });
}

export function useCreateObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateObservationData) => api.post('/observations', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}
