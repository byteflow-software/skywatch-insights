import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NetworkSelector from './NetworkSelector';
import ExportPreview from './ExportPreview';
import { useExportTemplates, useCreateExport } from '@/hooks/useExports';

interface ExportPanelProps {
  eventId: string;
  eventTitle: string;
}

type Objective = 'ENGAGEMENT' | 'EDUCATION' | 'AUTHORITY';

const OBJECTIVES: { value: Objective; label: string; description: string }[] = [
  { value: 'ENGAGEMENT', label: 'Engajamento', description: 'Maximizar curtidas, comentários e compartilhamentos' },
  { value: 'EDUCATION', label: 'Educação', description: 'Informar e ensinar seu público' },
  { value: 'AUTHORITY', label: 'Autoridade', description: 'Posicionar como conteúdo especialista' },
];

const ExportPanel: React.FC<ExportPanelProps> = ({ eventId, eventTitle }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<Objective>('ENGAGEMENT');
  const [createdExportId, setCreatedExportId] = useState<string | null>(null);

  const { data: templates, isLoading: templatesLoading } = useExportTemplates(selectedNetwork ?? undefined);
  const createExport = useCreateExport();

  const availableFormats = templates?.find((t) => t.network === selectedNetwork)?.formats ?? [];

  const currentStep = createdExportId ? 4 : selectedFormat ? 3 : selectedNetwork ? 2 : 1;

  const handleSubmit = () => {
    if (!selectedNetwork || !selectedFormat) return;
    createExport.mutate(
      {
        eventId,
        network: selectedNetwork,
        format: selectedFormat,
        objective: selectedObjective,
      },
      {
        onSuccess: (data) => {
          setCreatedExportId(data.id);
        },
      },
    );
  };

  const handleReset = () => {
    setSelectedNetwork(null);
    setSelectedFormat(null);
    setSelectedObjective('ENGAGEMENT');
    setCreatedExportId(null);
  };

  if (createdExportId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-white">Exportação criada</h2>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Criar outra
          </button>
        </div>
        <ExportPreview exportId={createdExportId} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:p-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Exportar para redes sociais</h2>
        <p className="mt-1 text-sm text-gray-400">
          Criar conteúdo de <span className="font-medium text-[#0EA5E9]">{eventTitle}</span>
        </p>

        {/* Step indicators */}
        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  currentStep >= step
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-white/5 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div className={`h-0.5 w-6 sm:w-10 ${currentStep > step ? 'bg-[#0EA5E9]' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Network */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Passo 1: Selecionar rede
        </h3>
        <NetworkSelector selectedNetwork={selectedNetwork} onSelect={(n) => { setSelectedNetwork(n); setSelectedFormat(null); }} />
      </div>

      {/* Step 2: Format */}
      {selectedNetwork && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Passo 2: Selecionar formato
          </h3>
          {templatesLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
              <span className="text-sm text-gray-500">Carregando formatos...</span>
            </div>
          ) : availableFormats.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum formato disponível para esta rede.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableFormats.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setSelectedFormat(format)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    selectedFormat === format
                      ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]'
                      : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-[#0EA5E9]/30 hover:text-gray-300'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Objective */}
      {selectedFormat && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Passo 3: Selecionar objetivo
          </h3>
          <div className="space-y-2">
            {OBJECTIVES.map((obj) => (
              <label
                key={obj.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                  selectedObjective === obj.value
                    ? 'border-[#0EA5E9] bg-[#0EA5E9]/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="objective"
                  value={obj.value}
                  checked={selectedObjective === obj.value}
                  onChange={() => setSelectedObjective(obj.value)}
                  className="h-4 w-4 border-white/20 bg-transparent text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-0"
                />
                <div>
                  <span className={`text-sm font-semibold ${selectedObjective === obj.value ? 'text-white' : 'text-gray-300'}`}>
                    {obj.label}
                  </span>
                  <p className="text-xs text-gray-500">{obj.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {selectedFormat && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createExport.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25 disabled:opacity-50"
          >
            {createExport.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Gerando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
                Gerar exportação
              </>
            )}
          </button>
          {createExport.isError && (
            <p className="text-sm text-red-400">Erro ao criar exportação. Tente novamente.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
