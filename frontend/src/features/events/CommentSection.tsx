import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useCommentsByTarget,
  useCreateComment,
  useDeleteComment,
  type CommentItem,
} from '@/hooks/useComments';
import { getAccessToken } from '@/services/api';
import UserAvatar from '@/components/shared/UserAvatar';

interface CommentSectionProps {
  targetType: 'events' | 'observations';
  targetId: string;
}

const MAX_CHARS = 500;

const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
}) => {
  const [page, setPage] = useState(0);
  const [content, setContent] = useState('');
  const isAuthenticated = !!getAccessToken();

  const { data, isLoading } = useCommentsByTarget(targetType, targetId, {
    page,
    size: 20,
  });
  const createComment = useCreateComment(targetType, targetId);
  const deleteComment = useDeleteComment(targetType, targetId);

  const comments: CommentItem[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    createComment.mutate(trimmed, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-white sm:text-lg">
        Comentários
      </h2>

      {/* Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            maxLength={MAX_CHARS}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {content.length}/{MAX_CHARS}
            </span>
            <button
              type="submit"
              disabled={
                !content.trim() ||
                content.length > MAX_CHARS ||
                createComment.isPending
              }
              className="rounded-lg bg-[#0EA5E9] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0EA5E9]/90 disabled:opacity-40"
            >
              {createComment.isPending ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
          {createComment.isError && (
            <p className="mt-1 text-xs text-red-400">
              Erro ao enviar comentário. Tente novamente.
            </p>
          )}
        </form>
      ) : (
        <div className="mb-5 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
          <p className="text-sm text-gray-500">
            <Link
              to="/login"
              className="font-medium text-[#0EA5E9] hover:text-[#6366F1]"
            >
              Faça login
            </Link>{' '}
            para comentar
          </p>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2.5 animate-pulse">
              <div className="h-8 w-8 shrink-0 rounded-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-white/5" />
                <div className="h-3 w-full rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-600">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <UserAvatar
                name={comment.authorName}
                avatarUrl={comment.authorAvatarUrl}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {comment.authorName}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  {comment.isOwn && (
                    <button
                      type="button"
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="ml-auto text-[10px] text-gray-600 hover:text-red-400"
                      title="Excluir comentário"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-400">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs font-medium text-gray-500 hover:text-white disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-600">
                {page + 1} de {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs font-medium text-gray-500 hover:text-white disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
