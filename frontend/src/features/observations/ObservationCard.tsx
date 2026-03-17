import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Observation, ObservationOutcome } from '@/hooks/useObservations';
import CommentPreview from '@/features/home/CommentPreview';
import CommentSection from '@/features/events/CommentSection';

const OUTCOME_STYLES: Record<ObservationOutcome, { bg: string; text: string; label: string }> = {
  EXCELLENT: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Excelente' },
  GOOD: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Boa' },
  FAIR: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Razoável' },
  POOR: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Ruim' },
  CLOUDED_OUT: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Nublado' },
};

interface ObservationCardProps {
  observation: Observation;
}

const ObservationCard: React.FC<ObservationCardProps> = ({ observation }) => {
  const [showComments, setShowComments] = useState(false);
  const outcomeStyle = OUTCOME_STYLES[observation.outcome] ?? OUTCOME_STYLES.FAIR;

  const formattedDate = new Date(observation.observedAt).toLocaleDateString('pt-BR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.06]">
      <div className="flex items-start gap-4">
        {/* Timeline dot */}
        <div className="flex flex-col items-center pt-1">
          <div className="h-3 w-3 rounded-full bg-[#0EA5E9]" />
          <div className="mt-1 h-full w-0.5 bg-white/10" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Date */}
          <p className="text-sm font-semibold text-white">{formattedDate}</p>

          {/* Event link */}
          {observation.eventId && observation.eventTitle && (
            <Link
              to={`/events/${observation.eventId}`}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0EA5E9] hover:text-[#6366F1]"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              {observation.eventTitle}
            </Link>
          )}

          {/* Location */}
          {observation.locationName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {observation.locationName}
            </p>
          )}

          {/* Notes */}
          {observation.notes && (
            <p className="mt-2 line-clamp-3 text-sm text-gray-400">{observation.notes}</p>
          )}

          {/* Media thumbnail */}
          {observation.mediaUrl && (
            <div className="mt-3">
              <img
                src={observation.mediaUrl}
                alt="Observation media"
                className="h-24 w-24 rounded-xl border border-white/10 object-cover"
              />
            </div>
          )}

          {/* Outcome badge + comment toggle */}
          <div className="mt-3 flex items-center gap-3">
            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${outcomeStyle.bg} ${outcomeStyle.text}`}>
              {outcomeStyle.label}
            </span>
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-[#0EA5E9]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              {showComments ? 'Ocultar' : 'Comentários'}
            </button>
          </div>

          {/* Comment preview (when collapsed) */}
          {!showComments && (
            <div onClick={() => setShowComments(true)} className="cursor-pointer">
              <CommentPreview
                targetType="observations"
                targetId={observation.id}
                detailPath="#"
              />
            </div>
          )}

          {/* Full comment section (when expanded) */}
          {showComments && (
            <div className="mt-3">
              <CommentSection targetType="observations" targetId={observation.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObservationCard;
