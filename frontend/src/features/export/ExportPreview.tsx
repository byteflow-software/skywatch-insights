import React, { useState } from 'react';
import { useExportById } from '@/hooks/useExports';

interface ExportPreviewProps {
  exportId: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Na fila' },
  PROCESSING: { bg: 'bg-[#0EA5E9]/10', text: 'text-[#0EA5E9]', label: 'Processando' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Concluído' },
  FAILED: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Falhou' },
};

const ExportPreview: React.FC<ExportPreviewProps> = ({ exportId }) => {
  const { data: exportItem, isLoading, isError, refetch } = useExportById(exportId);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#0EA5E9]" />
          <span className="text-sm text-gray-500">Carregando exportação...</span>
        </div>
      </div>
    );
  }

  if (isError || !exportItem) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-400">Não foi possível carregar os detalhes da exportação.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/10"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[exportItem.status] ?? STATUS_STYLES.PENDING;

  const handleCopyText = async () => {
    if (exportItem.outputTextContent) {
      await navigator.clipboard.writeText(exportItem.outputTextContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    if (exportItem.outputImageUrl) {
      const link = document.createElement('a');
      link.href = exportItem.outputImageUrl;
      link.download = `export-${exportItem.id}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Resultado</h3>
          <p className="text-xs text-gray-500">
            {exportItem.network} &middot; {exportItem.format}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Content */}
      {exportItem.status === 'COMPLETED' && (
        <>
          {exportItem.outputTextContent && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Texto gerado</span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                {exportItem.outputTextContent}
              </p>
            </div>
          )}

          {exportItem.outputImageUrl && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Imagem gerada</span>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Baixar
                </button>
              </div>
              <img
                src={exportItem.outputImageUrl}
                alt="Export output"
                className="w-full rounded-xl border border-white/5"
              />
            </div>
          )}
        </>
      )}

      {exportItem.status === 'PROCESSING' && (
        <div className="flex flex-col items-center rounded-2xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 p-8">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#0EA5E9]/20 border-t-[#0EA5E9]" />
          <p className="text-sm font-medium text-[#0EA5E9]">Gerando exportação...</p>
          <p className="mt-1 text-xs text-gray-500">Isso geralmente leva alguns segundos.</p>
        </div>
      )}

      {exportItem.status === 'PENDING' && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center">
          <p className="text-sm font-medium text-yellow-400">Na fila. Será processado em breve.</p>
        </div>
      )}

      {exportItem.status === 'FAILED' && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm font-medium text-red-400">A exportação falhou. Tente novamente.</p>
        </div>
      )}
    </div>
  );
};

export default ExportPreview;
