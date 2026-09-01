import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, RefreshCw,
  CreditCard, Server, Mail, Lock, User, Send, Sparkles, Zap, KeyRound, ShieldCheck,
} from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { useMPStatus } from '../hooks/useMercadoPago';

// ── Providers IA ──────────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: 'openai', name: 'OpenAI', description: 'DALL·E 3, GPT-Image-1', logo: '🤖',
    models: [
      { value: 'dall-e-3',    label: 'DALL·E 3 (recomendado)' },
      { value: 'gpt-image-1', label: 'GPT-Image-1' },
      { value: 'dall-e-2',    label: 'DALL·E 2' },
    ],
    keyLabel: 'OpenAI API Key', keyPlaceholder: 'sk-proj-...', keyField: 'openai_api_key',
    modelField: 'openai_model', docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini', name: 'Google Gemini', description: 'Gemini 2.0 Flash, Imagen 3', logo: '✦',
    models: [
      { value: 'imagen-3.0-generate-002', label: 'Imagen 3 (recomendado)' },
      { value: 'gemini-2.0-flash-exp',    label: 'Gemini 2.0 Flash' },
    ],
    keyLabel: 'Gemini API Key', keyPlaceholder: 'AIza...', keyField: 'gemini_api_key',
    modelField: 'gemini_model', docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'stability', name: 'Stability AI', description: 'Stable Diffusion, SDXL', logo: '🎨',
    models: [
      { value: 'stable-image-ultra',                label: 'Stable Image Ultra' },
      { value: 'stable-diffusion-xl-1024-v1-0',    label: 'SDXL 1.0' },
    ],
    keyLabel: 'Stability API Key', keyPlaceholder: 'sk-...', keyField: 'stability_api_key',
    modelField: 'stability_model', docsUrl: 'https://platform.stability.ai/account/keys',
  },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';
const labelCls = 'block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5';
const sectionCls = 'bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-5 space-y-4 shadow-sm dark:shadow-none';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// ── Shared subcomponents ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function InlineAlert({ type, msg }) {
  if (!msg) return null;
  const isErr = type === 'error';
  return (
    <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
      isErr
        ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
        : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    }`}>
      {isErr
        ? <AlertCircle size={14} className="shrink-0 mt-0.5" />
        : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
      {msg}
    </div>
  );
}

function ApiKeyInput({ label, placeholder, value, onChange, docsUrl }) {
  const [visible, setVisible] = useState(false);
  const isMasked = value?.includes('•');
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls}>{label}</label>
        <a href={docsUrl} target="_blank" rel="noreferrer"
          className="text-xs text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors">
          Obtener clave ↗
        </a>
      </div>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isMasked ? 'Clave guardada — escribir para reemplazar' : placeholder}
          className={`${inputCls} pr-10 font-mono`}
        />
        <button type="button" onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/30 hover:text-slate-500 dark:hover:text-white/60 transition-colors">
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

// ── Tab IA ────────────────────────────────────────────────────────────────────
function TabIA({ form, set, mutation, saved }) {
  const activeProvider = PROVIDERS.find(p => p.id === (form.ai_provider || 'openai'));
  const [detectedModels, setDetectedModels] = useState(null);
  const [detecting, setDetecting]           = useState(false);
  const [detectError, setDetectError]       = useState(null);

  const handleDetect = async () => {
    setDetecting(true); setDetectError(null);
    try {
      const models = await api.get('/configuracion/openai-models').then(r => r.data);
      setDetectedModels(models);
    } catch (e) {
      setDetectError(e.response?.data?.error ?? 'Error al detectar modelos');
    } finally { setDetecting(false); }
  };

  const openaiModels = detectedModels ?? [
    { value: 'gpt-image-1', label: 'GPT-Image-1 (recomendado)' },
    { value: 'dall-e-3',    label: 'DALL·E 3' },
    { value: 'dall-e-2',    label: 'DALL·E 2' },
  ];

  return (
    <div className="space-y-5">
      {/* Selector de proveedor */}
      <section>
        <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
          Proveedor de IA activo
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PROVIDERS.map(p => {
            const isActive = (form.ai_provider || 'openai') === p.id;
            return (
              <button key={p.id} onClick={() => set('ai_provider', p.id)}
                className={[
                  'relative flex flex-col items-start gap-1.5 p-4 rounded-xl border transition-all text-left',
                  isActive
                    ? 'bg-[#c9a84c]/10 border-[#c9a84c]/40'
                    : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05]',
                ].join(' ')}>
                <span className="text-xl">{p.logo}</span>
                <span className={`text-sm font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/60'}`}>
                  {p.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-white/30">{p.description}</span>
                {isActive && <div className="absolute top-3 right-3"><CheckCircle2 size={14} className="text-[#c9a84c]" /></div>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Credenciales del proveedor activo */}
      {activeProvider && (
        <motion.section key={activeProvider.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className={sectionCls}>
          <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">
            {activeProvider.name} — Credenciales
          </p>
          <ApiKeyInput
            label={activeProvider.keyLabel}
            placeholder={activeProvider.keyPlaceholder}
            value={form[activeProvider.keyField] || ''}
            onChange={v => set(activeProvider.keyField, v)}
            docsUrl={activeProvider.docsUrl}
          />
          {activeProvider.id === 'openai' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Modelo</label>
                <button type="button" onClick={handleDetect} disabled={detecting}
                  className="flex items-center gap-1 text-xs text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors disabled:opacity-50">
                  {detecting ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  {detectedModels ? 'Actualizar modelos' : 'Detectar modelos disponibles'}
                </button>
              </div>
              <select value={form[activeProvider.modelField] || 'gpt-image-1'} onChange={e => set(activeProvider.modelField, e.target.value)}
                className={`${inputCls} appearance-none`}>
                {openaiModels.map(m => <option key={m.value} value={m.value} className="bg-white dark:bg-[#1a1a1a]">{m.label}</option>)}
              </select>
              {detectError && <p className="text-xs text-red-400">{detectError}</p>}
              {detectedModels && <p className="text-xs text-emerald-500">{detectedModels.length} modelos detectados</p>}
            </div>
          ) : (
            <Field label="Modelo">
              <select value={form[activeProvider.modelField] || activeProvider.models[0].value} onChange={e => set(activeProvider.modelField, e.target.value)}
                className={`${inputCls} appearance-none`}>
                {activeProvider.models.map(m => <option key={m.value} value={m.value} className="bg-white dark:bg-[#1a1a1a]">{m.label}</option>)}
              </select>
            </Field>
          )}
        </motion.section>
      )}

      {/* Generación */}
      <section className={sectionCls}>
        <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider">Generación</p>
        <Field label="Variantes por generación">
          <select value={form.images_per_generation || '4'} onChange={e => set('images_per_generation', e.target.value)}
            className={`${inputCls} appearance-none`}>
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={String(n)} className="bg-white dark:bg-[#1a1a1a]">
                {n}{n === 4 ? ' (máximo)' : ''}
              </option>
            ))}
          </select>
        </Field>
      </section>

      {/* Guardar IA */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-5 py-2.5 transition-all">
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {saved && (
          <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-sm">
            <CheckCircle2 size={14} /> Guardado
          </motion.span>
        )}
        {mutation.isError && (
          <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-sm">
            <AlertCircle size={14} /> Error al guardar
          </span>
        )}
      </div>
    </div>
  );
}

// ── Tab Integraciones ─────────────────────────────────────────────────────────
function TabIntegraciones({ form, set, mutation }) {
  const { data: mpStatus, refetch: refetchMPStatus } = useMPStatus();

  return (
    <div className="space-y-5">
      <section className={sectionCls}>
        <div className="flex items-center justify-between">
          <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={12} /> Mercado Pago
          </p>
          {mpStatus?.configured && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
              mpStatus.valid
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-200 dark:border-red-500/20'
            }`}>
              {mpStatus.valid ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
              {mpStatus.valid ? (mpStatus.user?.nickname ?? 'Conectado') : 'Token inválido'}
            </span>
          )}
        </div>

        <ApiKeyInput
          label="Access Token"
          placeholder="APP_USR-..."
          value={form.mercadopago_access_token || ''}
          onChange={v => set('mercadopago_access_token', v)}
          docsUrl="https://www.mercadopago.com.ar/settings/account/credentials"
        />

        <p className="text-xs text-slate-400 dark:text-white/30">
          Usá el <strong className="text-slate-500 dark:text-white/50">Access Token de producción</strong> de tu cuenta
          de Mercado Pago para consultar suscripciones y pagos. Nunca se expone al cliente.
        </p>

        {form.mercadopago_access_token && !form.mercadopago_access_token.includes('•') && (
          <button type="button"
            onClick={() => mutation.mutate(form, { onSuccess: () => setTimeout(() => refetchMPStatus(), 500) })}
            className="text-xs text-[#c9a84c] hover:text-[#d4b560] transition-colors">
            Guardar y verificar conexión →
          </button>
        )}
      </section>
    </div>
  );
}

// ── Tab Correo (SMTP) ─────────────────────────────────────────────────────────
const SMTP_DEFAULTS = {
  smtp_host: '', smtp_port: '587', smtp_username: '', smtp_password: '',
  smtp_encryption: 'tls', mail_from_address: '', mail_from_name: '',
  mail_admin_email: '', mail_bcc_address: '',
};

function TabCorreo() {
  const [form, setForm]         = useState(SMTP_DEFAULTS);
  const [showPass, setShowPass] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [saveMsg, setSaveMsg]   = useState(null);
  const [saveErr, setSaveErr]   = useState(null);
  const [testMsg, setTestMsg]   = useState(null);
  const [testErr, setTestErr]   = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/mail-config');
      setForm({
        smtp_host:         data.smtp_host         || '',
        smtp_port:         data.smtp_port         ? String(data.smtp_port) : '587',
        smtp_username:     data.smtp_username     || '',
        smtp_password:     '',
        smtp_encryption:   data.smtp_encryption   || 'tls',
        mail_from_address: data.mail_from_address || '',
        mail_from_name:    data.mail_from_name    || '',
        mail_admin_email:  data.mail_admin_email  || '',
        mail_bcc_address:  data.mail_bcc_address  || '',
      });
    } catch { /* sin config guardada aún */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMsg(null); setSaveErr(null);
    if (!form.smtp_host.trim())     return setSaveErr('El servidor SMTP es obligatorio.');
    if (!Number(form.smtp_port))    return setSaveErr('El puerto debe ser un número válido.');
    if (!form.smtp_username.trim()) return setSaveErr('El usuario SMTP es obligatorio.');
    if (form.mail_from_address && !EMAIL_RE.test(form.mail_from_address)) return setSaveErr('Email de remitente inválido.');
    if (form.mail_admin_email  && !EMAIL_RE.test(form.mail_admin_email))  return setSaveErr('Email de administrador inválido.');
    if (form.mail_bcc_address  && !EMAIL_RE.test(form.mail_bcc_address))  return setSaveErr('Email BCC inválido.');
    setSaving(true);
    try {
      await api.put('/mail-config', { ...form, smtp_port: Number(form.smtp_port), smtp_password: form.smtp_password || null });
      setSaveMsg('Configuración SMTP guardada correctamente.');
      setForm(f => ({ ...f, smtp_password: '' }));
      await load();
    } catch (err) {
      setSaveErr(err?.response?.data?.message || 'No se pudo guardar la configuración.');
    } finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTestMsg(null); setTestErr(null);
    if (!testEmail || !EMAIL_RE.test(testEmail)) return setTestErr('Ingresá un email de destino válido.');
    setTesting(true);
    try {
      const { data } = await api.post('/mail-config/test', { email: testEmail });
      setTestMsg(data.message);
    } catch (err) {
      setTestErr(err?.response?.data?.message || 'Error al enviar el email de prueba.');
    } finally { setTesting(false); }
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-slate-400 dark:text-white/30 text-sm">
      <Loader2 size={14} className="animate-spin" /> Cargando configuración…
    </div>
  );

  return (
    <div className="space-y-5">
      <form onSubmit={handleSave} className="space-y-5">
        <InlineAlert type="error"   msg={saveErr} />
        <InlineAlert type="success" msg={saveMsg} />

        {/* Servidor */}
        <section className={sectionCls}>
          <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Server size={12} /> Servidor
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Host">
                <div className="relative">
                  <Server size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" />
                  <input value={form.smtp_host} onChange={set('smtp_host')} placeholder="smtp.gmail.com" className={`${inputCls} pl-8`} />
                </div>
              </Field>
            </div>
            <Field label="Puerto">
              <input type="number" value={form.smtp_port} onChange={set('smtp_port')} placeholder="587" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Usuario">
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" />
                <input value={form.smtp_username} onChange={set('smtp_username')} placeholder="usuario@dominio.com" className={`${inputCls} pl-8`} />
              </div>
            </Field>
            <Field label="Contraseña">
              <div className="flex">
                <div className="relative flex-1">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} value={form.smtp_password} onChange={set('smtp_password')}
                    placeholder="Dejar vacío para mantener la actual" className={`${inputCls} pl-8 rounded-r-none`} />
                </div>
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="px-3 border border-l-0 border-slate-200 dark:border-white/[0.08] rounded-r-lg text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-50 dark:bg-white/[0.04]">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          </div>
          <Field label="Encriptación">
            <div className="flex gap-5 mt-1">
              {[
                { value: 'tls',  label: 'TLS (puerto 587)' },
                { value: 'ssl',  label: 'SSL (puerto 465)' },
                { value: 'none', label: 'Sin encriptación'  },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-white/60">
                  <input type="radio" name="smtp_encryption" value={opt.value}
                    checked={form.smtp_encryption === opt.value} onChange={set('smtp_encryption')} className="accent-[#c9a84c]" />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>
        </section>

        {/* Remitente */}
        <section className={sectionCls}>
          <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Mail size={12} /> Remitente
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email del remitente">
              <input type="email" value={form.mail_from_address} onChange={set('mail_from_address')}
                placeholder="no-reply@tu-dominio.com" className={inputCls} />
            </Field>
            <Field label="Nombre del remitente">
              <input value={form.mail_from_name} onChange={set('mail_from_name')}
                placeholder="Nombre de tu empresa" className={inputCls} />
            </Field>
          </div>
        </section>

        {/* Destinos */}
        <section className={sectionCls}>
          <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Mail size={12} /> Destinos de recepción
          </p>
          <p className="text-xs text-slate-400 dark:text-white/30 -mt-1">
            Emails que reciben notificaciones de tickets y respuestas de clientes.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email del administrador">
              <input type="email" value={form.mail_admin_email} onChange={set('mail_admin_email')}
                placeholder="admin@tu-dominio.com" className={inputCls} />
            </Field>
            <Field label="Copia oculta BCC (opcional)">
              <input type="email" value={form.mail_bcc_address} onChange={set('mail_bcc_address')}
                placeholder="copia@tu-dominio.com" className={inputCls} />
            </Field>
          </div>
        </section>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-5 py-2.5 transition-all">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Guardando…' : 'Guardar SMTP'}
        </button>
      </form>

      {/* Probar */}
      <section className={sectionCls}>
        <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Send size={12} /> Probar configuración
        </p>
        <InlineAlert type="error"   msg={testErr} />
        <InlineAlert type="success" msg={testMsg} />
        <div className="flex gap-3">
          <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
            placeholder="destino@ejemplo.com" className={`${inputCls} max-w-xs`} />
          <button type="button" onClick={handleTest} disabled={testing}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-white/90 disabled:opacity-50 text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-lg transition-all whitespace-nowrap">
            {testing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {testing ? 'Enviando…' : 'Enviar prueba'}
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Tab Cuenta (cambio de contraseña) ────────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label}>
      <div className="flex">
        <div className="relative flex-1">
          <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" />
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${inputCls} pl-8 rounded-r-none`}
          />
        </div>
        <button type="button" onClick={() => setVisible(v => !v)}
          className="px-3 border border-l-0 border-slate-200 dark:border-white/[0.08] rounded-r-lg text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-50 dark:bg-white/[0.04]">
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </Field>
  );
}

function TabCuenta() {
  const user = useAuthStore(s => s.user);
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null); setErr(null);

    if (!form.current_password)                 return setErr('Ingresá tu contraseña actual.');
    if (form.password.length < 8)              return setErr('La nueva contraseña debe tener al menos 8 caracteres.');
    if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      return setErr('La nueva contraseña debe incluir letras y números.');
    if (form.password === form.current_password) return setErr('La nueva contraseña debe ser distinta a la actual.');
    if (form.password !== form.password_confirmation) return setErr('La confirmación no coincide con la nueva contraseña.');

    setSaving(true);
    try {
      const { data } = await api.put('/password', form);
      setMsg(data.message ?? 'Contraseña actualizada correctamente.');
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (e2) {
      const resp = e2?.response?.data;
      setErr(resp?.errors ? Object.values(resp.errors).flat()[0] : (resp?.message ?? 'No se pudo actualizar la contraseña.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className={sectionCls}>
        <p className="text-slate-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={12} /> Cambiar contraseña
        </p>
        {user?.email && (
          <p className="text-xs text-slate-400 dark:text-white/30 -mt-1">
            Cuenta: <span className="text-slate-500 dark:text-white/50">{user.email}</span>
          </p>
        )}

        <InlineAlert type="error"   msg={err} />
        <InlineAlert type="success" msg={msg} />

        <PasswordField
          label="Contraseña actual"
          value={form.current_password}
          onChange={set('current_password')}
          placeholder="Tu contraseña actual"
          autoComplete="current-password"
        />
        <div className="grid grid-cols-2 gap-3">
          <PasswordField
            label="Nueva contraseña"
            value={form.password}
            onChange={set('password')}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
          <PasswordField
            label="Repetir nueva contraseña"
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            placeholder="Repetí la nueva contraseña"
            autoComplete="new-password"
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-white/30">
          Al cambiarla se cerrarán las demás sesiones abiertas. Esta sesión seguirá activa.
        </p>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-5 py-2.5 transition-all">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
          {saving ? 'Guardando…' : 'Actualizar contraseña'}
        </button>
      </section>
    </form>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'ia',            label: 'Generador IA',   icon: Sparkles  },
  { id: 'integraciones', label: 'Integraciones',  icon: Zap       },
  { id: 'correo',        label: 'Correo (SMTP)',  icon: Mail      },
  { id: 'cuenta',        label: 'Mi cuenta',      icon: KeyRound  },
];

export default function Configuracion() {
  const qc = useQueryClient();
  const [tab, setTab]           = useState('ia');
  const [saved, setSaved]       = useState(false);
  const [form, setForm]         = useState({});
  const [initialized, setInitialized] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get('/configuracion').then(r => r.data),
  });

  if (settings && !initialized) {
    setForm(settings);
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: (s) => api.put('/configuracion', { settings: s }),
    onSuccess: () => {
      qc.invalidateQueries(['configuracion']);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  if (isLoading) return (
    <div className="p-8 flex items-center gap-2 text-slate-400 dark:text-white/30">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-sm">Cargando…</span>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-slate-400 dark:text-white/40 text-sm mt-1">Ajustes del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/[0.06] w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70',
              ].join(' ')}>
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}>
          {tab === 'ia'            && <TabIA form={form} set={set} mutation={mutation} saved={saved} />}
          {tab === 'integraciones' && <TabIntegraciones form={form} set={set} mutation={mutation} />}
          {tab === 'correo'        && <TabCorreo />}
          {tab === 'cuenta'        && <TabCuenta />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
