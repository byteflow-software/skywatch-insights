import React, { useState, useRef } from 'react';
import { useCreateObservation, type ObservationOutcome } from '@/hooks/useObservations';
import { useEvents } from '@/hooks/useEvents';

const OUTCOMES: { value: ObservationOutcome; label: string }[] = [
  { value: 'EXCELLENT', label: 'Excelente' },
  { value: 'GOOD', label: 'Boa' },
  { value: 'FAIR', label: 'Razoável' },
  { value: 'POOR', label: 'Ruim' },
  { value: 'CLOUDED_OUT', label: 'Nublado' },
];

interface ObservationFormProps {
  onSuccess?: () => void;
}

const ObservationForm: React.FC<ObservationFormProps> = ({ onSuccess }) => {
  const [eventSearch, setEventSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [observedAt, setObservedAt] = useState('');
  const [locationName, setLocationName] = useState('');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<ObservationOutcome>('GOOD');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createObservation = useCreateObservation();
  const { data: eventsData } = useEvents({ size: 10 });

  const filteredEvents = (eventsData?.content ?? []).filter(
    (e: { id: string; title: string }) =>
      e.title.toLowerCase().includes(eventSearch.toLowerCase()),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observedAt || !locationName || !notes) return;

    createObservation.mutate(
      {
        eventId: selectedEventId,
        observedAt: new Date(observedAt).toISOString(),
        locationName,
        notes,
        outcome,
      },
      {
        onSuccess: () => {
          setSelectedEventId(undefined);
          setSelectedEventTitle('');
          setEventSearch('');
          setObservedAt('');
          setLocationName('');
          setNotes('');
          setOutcome('GOOD');
          setMediaPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Nova Observação</h2>
        <p className="mt-1 text-sm text-gray-400">Registre sua observação astronômica.</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <div className="space-y-5">
          {/* Event selector */}
          <div className="relative">
            <label htmlFor="obs-event" className="mb-1.5 block text-sm font-medium text-gray-400">
              Evento <span className="text-gray-600">(opcional)</span>
            </label>
            {selectedEventTitle ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-3 py-2">
                <span className="flex-1 text-sm text-white">{selectedEventTitle}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedEventId(undefined); setSelectedEventTitle(''); }}
                  className="text-gray-400 hover:text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <input
                  id="obs-event"
                  type="text"
                  value={eventSearch}
                  onChange={(e) => { setEventSearch(e.target.value); setShowEventDropdown(true); }}
                  onFocus={() => setShowEventDropdown(true)}
                  onBlur={() => setTimeout(() => setShowEventDropdown(false), 200)}
                  placeholder="Buscar eventos..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                />
                {showEventDropdown && filteredEvents.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0F172A] shadow-lg">
                    {filteredEvents.map((event: { id: string; title: string }) => (
                      <button
                        key={event.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedEventId(event.id);
                          setSelectedEventTitle(event.title);
                          setEventSearch('');
                          setShowEventDropdown(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Date/time */}
          <div>
            <label htmlFor="obs-date" className="mb-1.5 block text-sm font-medium text-gray-400">
              Data e Hora
            </label>
            <input
              id="obs-date"
              type="datetime-local"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] [color-scheme:dark]"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="obs-location" className="mb-1.5 block text-sm font-medium text-gray-400">
              Local
            </label>
            <input
              id="obs-location"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ex: Quintal, Observatório, Parque..."
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="obs-notes" className="mb-1.5 block text-sm font-medium text-gray-400">
              Notas
            </label>
            <textarea
              id="obs-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Descreva o que você observou..."
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Resultado</label>
            <div className="flex flex-wrap gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value)}
                  className={`rounded-xl border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                    outcome === o.value
                      ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">
              Mídia <span className="text-gray-600">(opcional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#0EA5E9] hover:file:bg-white/10"
            />
            {mediaPreview && (
              <div className="relative mt-3 inline-block">
                <img src={mediaPreview} alt="Preview" className="h-24 w-24 rounded-xl border border-white/10 object-cover" />
                <button
                  type="button"
                  onClick={() => { setMediaPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={createObservation.isPending || !observedAt || !locationName || !notes}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25 disabled:opacity-50"
          >
            {createObservation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Salvando...
              </>
            ) : (
              'Salvar Observação'
            )}
          </button>
          {createObservation.isError && (
            <p className="text-sm text-red-400">Falha ao salvar. Tente novamente.</p>
          )}
          {createObservation.isSuccess && (
            <p className="text-sm font-medium text-green-400">Observação salva!</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default ObservationForm;
