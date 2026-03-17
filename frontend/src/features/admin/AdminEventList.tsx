import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { LoadingState, ErrorState } from '@/components/shared';
import EventEditor from './EventEditor';

interface AdminEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  startAt: string;
  endAt: string;
  relevanceScore: number;
  description: string;
  imageUrl: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
  PUBLISHED: { bg: 'bg-green-100', text: 'text-green-800' },
  HIDDEN: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

const AdminEventList: React.FC = () => {
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ content: AdminEvent[] }>({
    queryKey: ['admin-events'],
    queryFn: () => api.get('/admin/events').then((r) => r.data),
  });

  if (isLoading) return <LoadingState message="Carregando eventos..." />;
  if (isError) return <ErrorState title="Erro" message="Não foi possível carregar os eventos." onRetry={() => refetch()} />;

  const events = data?.content ?? [];

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-[#0F172A]">Title</th>
              <th className="px-4 py-3 font-semibold text-[#0F172A]">Type</th>
              <th className="px-4 py-3 font-semibold text-[#0F172A]">Status</th>
              <th className="px-4 py-3 font-semibold text-[#0F172A]">Date Range</th>
              <th className="px-4 py-3 font-semibold text-[#0F172A]">Relevance</th>
              <th className="px-4 py-3 font-semibold text-[#0F172A]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => {
              const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.DRAFT;
              return (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{event.title}</td>
                  <td className="px-4 py-3 text-[#334155]">{event.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#334155]">
                    {event.startAt ? new Date(event.startAt).toLocaleDateString() : '—'}
                    {event.endAt ? ` - ${new Date(event.endAt).toLocaleDateString()}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#0EA5E9]"
                          style={{ width: `${event.relevanceScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#334155]">{event.relevanceScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:bg-[#E0F2FE] hover:text-[#0EA5E9]"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#334155]">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingEvent && (
        <EventEditor event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
    </div>
  );
};

export default AdminEventList;
