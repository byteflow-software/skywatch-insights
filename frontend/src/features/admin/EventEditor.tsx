import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

interface EventData {
  id: string;
  title: string;
  description: string;
  type: string;
  startAt: string;
  endAt: string;
  relevanceScore: number;
  status: string;
  imageUrl: string;
}

interface EventEditorProps {
  event: EventData;
  onClose: () => void;
}

const EVENT_TYPES = ['ECLIPSE', 'METEOR_SHOWER', 'CONJUNCTION', 'OPPOSITION', 'TRANSIT', 'OCCULTATION', 'OTHER'];
const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED'];

const EventEditor: React.FC<EventEditorProps> = ({ event, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: event.title,
    description: event.description,
    type: event.type,
    startAt: event.startAt ? event.startAt.slice(0, 16) : '',
    endAt: event.endAt ? event.endAt.slice(0, 16) : '',
    relevanceScore: event.relevanceScore,
    status: event.status,
    imageUrl: event.imageUrl,
  });

  useEffect(() => {
    setForm({
      title: event.title,
      description: event.description,
      type: event.type,
      startAt: event.startAt ? event.startAt.slice(0, 16) : '',
      endAt: event.endAt ? event.endAt.slice(0, 16) : '',
      relevanceScore: event.relevanceScore,
      status: event.status,
      imageUrl: event.imageUrl,
    });
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.patch(`/admin/events/${event.id}`, {
        ...data,
        startAt: data.startAt ? new Date(data.startAt).toISOString() : undefined,
        endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-[#0F172A]">Edit Event</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#334155] hover:text-[#0F172A]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Title</label>
              <input
                id="edit-title"
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-desc" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Description</label>
              <textarea
                id="edit-desc"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="edit-type" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Type</label>
              <select
                id="edit-type"
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-start" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Start</label>
                <input
                  id="edit-start"
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => updateField('startAt', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>
              <div>
                <label htmlFor="edit-end" className="mb-1.5 block text-sm font-medium text-[#0F172A]">End</label>
                <input
                  id="edit-end"
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => updateField('endAt', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>
            </div>

            {/* Relevance Score */}
            <div>
              <label htmlFor="edit-relevance" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Pontuação de Relevância: {form.relevanceScore}
              </label>
              <input
                id="edit-relevance"
                type="range"
                min={0}
                max={100}
                value={form.relevanceScore}
                onChange={(e) => updateField('relevanceScore', Number(e.target.value))}
                className="w-full accent-[#0EA5E9]"
              />
              <div className="flex justify-between text-xs text-[#334155]">
                <span>0</span>
                <span>100</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="edit-status" className="mb-1.5 block text-sm font-medium text-[#0F172A]">Status</label>
              <select
                id="edit-status"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="edit-image" className="mb-1.5 block text-sm font-medium text-[#0F172A]">URL da Imagem</label>
              <input
                id="edit-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] placeholder:text-slate-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0EA5E9] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0EA5E9]/90 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
          {updateMutation.isError && (
            <p className="mt-3 text-sm text-red-600">Erro ao atualizar evento. Tente novamente.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventEditor;
