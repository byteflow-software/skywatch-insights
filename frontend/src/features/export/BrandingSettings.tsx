import React, { useState, useEffect } from 'react';

interface BrandingConfig {
  paletteColor: string;
  logoUrl: string;
  ctaText: string;
  signatureText: string;
}

const STORAGE_KEY = 'skywatch_branding_settings';

const DEFAULT_BRANDING: BrandingConfig = {
  paletteColor: '#0EA5E9',
  logoUrl: '',
  ctaText: '',
  signatureText: '',
};

function loadBranding(): BrandingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_BRANDING, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_BRANDING;
}

const BrandingSettings: React.FC = () => {
  const [config, setConfig] = useState<BrandingConfig>(loadBranding);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [config]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = <K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Configurações de Marca</h2>
        <p className="mt-1 text-sm text-[#334155]">
          Personalize a identidade visual das suas exportações. Configurações armazenadas localmente.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {/* Palette Color */}
          <div>
            <label htmlFor="branding-palette" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
              Cor da Marca
            </label>
            <div className="flex items-center gap-3">
              <input
                id="branding-palette"
                type="color"
                value={config.paletteColor}
                onChange={(e) => updateField('paletteColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200"
              />
              <input
                type="text"
                value={config.paletteColor}
                onChange={(e) => updateField('paletteColor', e.target.value)}
                className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                placeholder="#0EA5E9"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="branding-logo" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
              URL do Logo
            </label>
            <input
              id="branding-logo"
              type="url"
              value={config.logoUrl}
              onChange={(e) => updateField('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] placeholder:text-slate-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
            {config.logoUrl && (
              <div className="mt-2 inline-block rounded-lg border border-slate-200 bg-slate-50 p-2">
                <img src={config.logoUrl} alt="Logo preview" className="h-10 object-contain" />
              </div>
            )}
          </div>

          {/* CTA Text */}
          <div>
            <label htmlFor="branding-cta" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
              Texto de Chamada (CTA)
            </label>
            <input
              id="branding-cta"
              type="text"
              value={config.ctaText}
              onChange={(e) => updateField('ctaText', e.target.value)}
              placeholder="Follow us for more astronomical events!"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] placeholder:text-slate-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>

          {/* Signature Text */}
          <div>
            <label htmlFor="branding-signature" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
              Texto de Assinatura
            </label>
            <input
              id="branding-signature"
              type="text"
              value={config.signatureText}
              onChange={(e) => updateField('signatureText', e.target.value)}
              placeholder="@yourhandle"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#334155] placeholder:text-slate-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>
        </div>

        {/* Note */}
        <div className="mt-5 rounded-lg bg-[#E0F2FE] p-3">
          <p className="text-xs text-[#334155]">
            <span className="font-medium">Nota:</span> A integração completa com as exportações está planejada para uma versão futura.
            Atualmente estas configurações são salvas no armazenamento local do navegador.
          </p>
        </div>

        {/* Save */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[#0EA5E9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0EA5E9]/90 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2"
          >
            Salvar Configurações
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Salvo!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
