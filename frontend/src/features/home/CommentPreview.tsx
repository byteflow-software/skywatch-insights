import React from 'react';
import { Link } from 'react-router-dom';
import { useCommentPreview } from '@/hooks/useComments';
import UserAvatar from '@/components/shared/UserAvatar';

interface CommentPreviewProps {
  targetType: 'events' | 'observations';
  targetId: string;
  detailPath: string;
}

const CommentPreview: React.FC<CommentPreviewProps> = ({
  targetType,
  targetId,
  detailPath,
}) => {
  const { data } = useCommentPreview(targetType, targetId);

  if (!data || data.totalCount === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {data.comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-1.5">
          <UserAvatar
            name={comment.authorName}
            avatarUrl={comment.authorAvatarUrl}
            size="sm"
          />
          <p className="min-w-0 text-[12px] leading-snug text-gray-500">
            <span className="font-semibold text-gray-300">
              {comment.authorName}
            </span>{' '}
            <span className="line-clamp-1">{comment.content}</span>
          </p>
        </div>
      ))}
      {data.totalCount > 3 && (
        <Link
          to={detailPath}
          className="block text-[11px] font-medium text-gray-500 hover:text-[#0EA5E9]"
          onClick={(e) => e.stopPropagation()}
        >
          Ver todos os {data.totalCount} comentários
        </Link>
      )}
    </div>
  );
};

export default CommentPreview;
