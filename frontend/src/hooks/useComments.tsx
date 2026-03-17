import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export interface CommentItem {
  id: string;
  content: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface CommentPreview {
  comments: CommentItem[];
  totalCount: number;
}

export function useCommentsByTarget(
  targetType: 'events' | 'observations',
  targetId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery({
    queryKey: ['comments', targetType, targetId, params],
    queryFn: () =>
      api
        .get(`/${targetType}/${targetId}/comments`, { params })
        .then((r) => r.data),
    enabled: !!targetId,
  });
}

export function useCommentPreview(
  targetType: 'events' | 'observations',
  targetId: string,
) {
  return useQuery<CommentPreview>({
    queryKey: ['comment-preview', targetType, targetId],
    queryFn: () =>
      api
        .get(`/${targetType}/${targetId}/comments/preview`)
        .then((r) => r.data),
    enabled: !!targetId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateComment(
  targetType: 'events' | 'observations',
  targetId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api
        .post(`/${targetType}/${targetId}/comments`, { content })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', targetType, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['comment-preview', targetType, targetId],
      });
    },
  });
}

export function useDeleteComment(
  targetType: 'events' | 'observations',
  targetId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/${targetType}/${targetId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', targetType, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['comment-preview', targetType, targetId],
      });
    },
  });
}
