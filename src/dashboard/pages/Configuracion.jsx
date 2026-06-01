import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, RefreshCw, CreditCard } from 'lucide-react';
import api from '../lib/api';
import { useMPStatus } from '../hooks/useMercadoPago';

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'DALL·E 3, GPT-Image-1',
    logo: '🤖',
    models: [
      { value: 'dall-e-3', label: 'DALL·E 3 (recomendado)' },
      { value: 'gpt-image-1', label: 'GPT-Image-1' },
      { value: 'dall-e-2', label: 'DALL·E 2' },
    ],
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-proj-...',
    keyField: 'openai_api_key',
    modelField: 'openai_model',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 2.0 Flash, Imagen 3',
    logo: '✦',
    models: [
      { value: 'imagen-3.0-generate-002', label: 'Imagen 3 (recomendado)' },
      { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
    ],
    keyLabel: 'Gemini API Key',
    keyPlaceholder: 'AIza...',
    keyField: 'gemini_api_key',
    modelField: 'gemini_model',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Stable Diffusion, SDXL',
    logo: '🎨',
    models: [
      { value: 'stable-image-ultra', label: 'Stable Image Ultra' },
      { value: 'stable-diffusion-xl-1024-v1-0', label: 'SDXL 1.0' },
    ],
    keyLabel: 'Stability API Key',
    keyPlaceholder: 'sk-...',
    keyField: 'stability_api_key',
    modelField: 'stability_model',
    docsUrl: 'https://platform.stability.ai/account/keys',
  },
];

function ApiKeyInput({ label, placeholder, value, onChange, docsUrl }) {
  const [visible, setVisible] = useState(false);
  const isMasked = value?.includes('•');

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-slate-500 dark:text-white/50">{label}</label>
        <a
          href={docsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors"
        >
          Obtener clave ↗
        </a>
      </div>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isMasked ? 'Clave guardada — escribir para reemplazar' : placeholder}
          className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all font-mono"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/30 hover:text-slate-500 dark:hover:text-white/60 transition-colors"
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function OpenAIModelSelector({ value, onChange }) {
  const [detectedModels, setDetectedModels] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);

  const handleDetect = async () => {
    setDetecting(true);
    setDetectError(null);
    try {
      const models = await api.get('/configuracion/openai-models').then(r => r.data);
      setDetectedModels(models);
    } catch (e) {
      setDetectError(e.response?.data?.error ?? 'Error al detectar modelos');
    } finally {
      setDetecting(false);
    }
  };

  const models = detectedModels ?? [
    { value: 'gpt-image-1', label: 'GPT-Image-1 (recomendado)' },
    { value: 'dall-e-3',    label: 'DALL·E 3' },
    { value: 'dall-e-2',    label: 'DALL·E 2' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-500 dark:text-white/50">Modelo</label>
        <button type="button" onClick={handleDetect} disabled={detecting}
          className="flex items-center gap-1 text-xs text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors disabled:opacity-50">
          {detecting ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          {detectedModels ? 'Actualizar modelos' : 'Detectar modelos disponibles'}
        </button>
      </div>
      <select value={value || 'gpt-image-1'} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all appearance-none">
        {models.map(m => (
          <option key={m.value} value={m.value} className="bg-white dark:bg-[#1a1a1a]">{m.label}</option>
        ))}
      </select>
      {detectError && <p className="text-xs text-red-400">{detectError}</p>}
      {detectedModels && <p className="text-xs text-emerald-500">{detectedModels.length} modelos detectados desde tu API key</p>}
    </div>
  );
}

export default function Configuracion() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({});
  const [initialized, setInitialized] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get('/configuracion').then((r) => r.data),
  });

  if (settings && !initialized) {
    setForm(settings);
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: (settings) => api.put('/configuracion', { settings }),
    onSuccess: () => {
      qc.invalidateQueries(['configuracion']);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const activeProvider = PROVIDERS.find((p) => p.id === (form.ai_provider || 'openai'));
  const { data: mpStatus, refetch: refetchMPStatus } = useMPStatus();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-400 dark:text-white/30">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-slate-400 dark:text-white/40 text-sm mt-1">Proveedores de IA y ajustes del sistema</p>
      </div>

      <div className="space-y-6">
        {/* Selector de proveedor */}
        <section>
          <h2 className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
            Proveedor de IA activo
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.map((p) => {
              const isActive = (form.ai_provider || 'openai') === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => set('ai_provider', p.id)}
                  className={[
                    'relative flex flex-col items-start gap-1.5 p-4 rounded-xl border transition-all text-left',
                    isActive
                      ? 'bg-[#c9a84c]/10 border-[#c9a84c]/40'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05]',
                  ].join(' ')}
                >
                  <span className="text-xl">{p.logo}</span>
                  <span className={`text-sm font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/60'}`}>
                    {p.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-white/30">{p.description}</span>
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={14} className="text-[#c9a84c]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Config del proveedor activo */}
        {activeProvider && (
          <motion.section
            key={activeProvider.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none"
          >
            <h2 className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
              {activeProvider.name} — Credenciales
            </h2>

            <ApiKeyInput
              label={activeProvider.keyLabel}
              placeholder={activeProvider.keyPlaceholder}
              value={form[activeProvider.keyField] || ''}
              onChange={(v) => set(activeProvider.keyField, v)}
              docsUrl={activeProvider.docsUrl}
            />

            {activeProvider.id === 'openai' ? (
              <OpenAIModelSelector
                value={form[activeProvider.modelField]}
                onChange={(v) => set(activeProvider.modelField, v)}
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Modelo</label>
                <select
                  value={form[activeProvider.modelField] || activeProvider.models[0].value}
                  onChange={(e) => set(activeProvider.modelField, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all appearance-none"
                >
                  {activeProvider.models.map((m) => (
                    <option key={m.value} value={m.value} className="bg-white dark:bg-[#1a1a1a]">{m.label}</option>
                  ))}
                </select>
              </div>
            )}
          </motion.section>
        )}

        {/* Ajustes generales */}
        <section className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
          <h2 className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            Generación
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
              Variantes por generación
            </label>
            <select
              value={form.images_per_generation || '4'}
              onChange={(e) => set('images_per_generation', e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all appearance-none"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={String(n)} className="bg-white dark:bg-[#1a1a1a]">
                  {n} {n === 4 ? '(máximo)' : ''}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Mercado Pago */}
        <section className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={12} />
              Mercado Pago
            </h2>
            {mpStatus?.configured && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                mpStatus.valid
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/20'
              }`}>
                {mpStatus.valid ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                {mpStatus.valid
                  ? (mpStatus.user?.nickname ?? 'Conectado')
                  : 'Token inválido'}
              </span>
            )}
          </div>

          <ApiKeyInput
            label="Access Token"
            placeholder="APP_USR-..."
            value={form.mercadopago_access_token || ''}
            onChange={(v) => set('mercadopago_access_token', v)}
            docsUrl="https://www.mercadopago.com.ar/settings/account/credentials"
          />

          <p className="text-xs text-slate-400 dark:text-white/30">
            Usá el <strong className="text-slate-500 dark:text-white/50">Access Token de producción</strong> de tu cuenta de Mercado Pago
            para consultar suscripciones y pagos. Nunca se expone al cliente.
          </p>

          {form.mercadopago_access_token && !form.mercadopago_access_token.includes('•') && (
            <button
              type="button"
              onClick={() => {
                mutation.mutate(form, {
                  onSuccess: () => setTimeout(() => refetchMPStatus(), 500),
                });
              }}
              className="text-xs text-[#c9a84c] hover:text-[#d4b560] transition-colors"
            >
              Guardar y verificar conexión →
            </button>
          )}
        </section>

        {/* Guardar */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-5 py-2.5 transition-all"
          >
            {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>

          {saved && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-sm"
            >
              <CheckCircle2 size={14} />
              Guardado
            </motion.div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-sm">
              <AlertCircle size={14} />
              Error al guardar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
