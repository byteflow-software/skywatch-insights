import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { LoadingState, ErrorState } from '@/components/shared';

interface Highlight {
  id: string;
  eventId: string;
  eventTitle: string;
  startDate: string;
  endDate: string;
  editorialNote: string;
  createdAt: string;
}

interface EventOption {
  id: string;
  title: string;
}

const HighlightManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [eventId, setEventId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editorialNote, setEditorialNote] = useState('');

  const { data: highlight, isLoading, isError, refetch } = useQuery<Highlight | null>({
    queryKey: ['admin-highlights', 'current'],
    queryFn: () => api.get('/admin/highlights/current').then((r) => r.data).catch(() => null),
  });

  const { data: eventsData } = useQuery<{ content: EventOption[] }>({
    queryKey: ['admin-events-select'],
    queryFn: () => api.get('/admin/events', { params: { size: 100 } }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { eventId: string; startDate: string; endDate: string; editorialNote: string }) =>
      api.post('/admin/highlights', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights'] });
      setShowForm(false);
      setEventId('');
      setStartDate('');
      setEndDate('');
      setEditorialNote('');
    },
  });

  const events = eventsData?.content ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !startDate || !endDate) return;
    createMutation.mutate({
      eventId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      editorialNote,
    });
  };

  return (
    <div className="space-y-6">
      {/* Current highlight */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#334155]">
          Destaque Semanal Atual
        </h3>

        {isLoading && <LoadingState message="Carregando destaque..." />}
        {isError && <ErrorState title="Erro" message="Não foi possível carregar o destaque." onRetry={() => refetch()} />}

        {!isLoading && !isError && highlight ? (
          <div className="rounded-xl border border-[#0EA5E9]/20 bg-[#E0F2FE]/30 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-[#0F172A]">{highlight.eventTitle}</p>
                <p className="mt-1 text-sm text-[#334155]">
                  {new Date(highlight.startDate).toLocaleDateString()} - {new Date(highlight.endDate).toLocaleDateString()}
                </p>
                {highlight.editorialNote && (
                  <p className="mt-2 text-sm italic text-[#334155]">"{highlight.editorialNote}"</p>
                )}
              </div>
              <span className="inline-flex items-center rounded-full bg-[#0EA5E9] px-3 py-1 text-xs font-medium text-white">
                Ativo
              </span>
            </div>
          </div>
        ) : (
          !isLoading && !isError && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-sm text-[#334155]">Nenhum destaque semanal ativo.</p>
            </div>
          )
        )}
      </div>

      {/* Create new */}
      <div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0EA5E9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0EA5E9]/90 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2"
        >
          {showForm ? (
            'Cancelar'
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo Destaque
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {/* Event select */}
            <div>
              <label htmlFor="hl-event" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Event</label>
              <select
                id="hl-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              >
                <option value="">Select an event...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hl-start" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Start Date</label>
                <input
                  id="hl-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>
              <div>
                <label htmlFor="hl-end" className="mb-1.5 block text-sm font-medium text-[#0F172A]">End Date</label>
                <input
                  id="hl-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>
            </div>

            {/* Editorial note */}
            <div>
              <label htmlFor="hl-note" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Editorial Note</label>
              <textarea
                id="hl-note"
                value={editorialNote}
                onChange={(e) => setEditorialNote(e.target.value)}
                rows={3}
                placeholder="Why this event is highlighted this week..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] placeholder:text-slate-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0EA5E9]/90 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                'Create Highlight'
              )}
            </button>
            {createMutation.isError && (
              <p className="text-sm text-red-600">Failed to create highlight.</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default HighlightManager;
