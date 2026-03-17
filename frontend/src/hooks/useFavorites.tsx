import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export function useFavorites(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['favorites', params],
    queryFn: async () => {
      const { data } = await api.get('/favorites', { params });
      // PageResponse uses 'data' field for items
      return {
        ...data,
        content: data.data ?? data.content ?? data.items ?? [],
      };
    },
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['favorites'] });
  queryClient.invalidateQueries({ queryKey: ['events'] });
  queryClient.invalidateQueries({ queryKey: ['home-events'] });
  queryClient.invalidateQueries({ queryKey: ['event'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: (eventId: string) => api.post(`/events/${eventId}/favorite`),
    onSuccess: () => invalidateAll(queryClient),
  });

  const removeFavorite = useMutation({
    mutationFn: (eventId: string) => api.delete(`/events/${eventId}/favorite`),
    onSuccess: () => invalidateAll(queryClient),
  });

  return { addFavorite, removeFavorite };
}
