import { useEffect, useState, useCallback } from 'react';
import { Mail, Server, Lock, User, Send, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import clienteAxios from '../../config/axios';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const inputCls =
  'w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

const labelCls = 'block text-xs font-medium text-slate-500 dark:text-white/40 mb-1.5';

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
      isError
        ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
        : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
    }`}>
      {isError ? <AlertCircle size={15} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={15} className="shrink-0 mt-0.5" />}
      {msg}
    </div>
  );
}

const DEFAULTS = {
  smtp_host: '',
  smtp_port: '587',
  smtp_username: '',
  smtp_password: '',
  smtp_encryption: 'tls',
  mail_from_address: '',
  mail_from_name: '',
  mail_admin_email: '',
  mail_bcc_address: '',
};

export default function Smtp({ token }) {
  const [form, setForm]           = useState(DEFAULTS);
  const [showPass, setShowPass]   = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [testing, setTesting]     = useState(false);

  const [saveMsg, setSaveMsg]     = useState(null);
  const [saveErr, setSaveErr]     = useState(null);
  const [testMsg, setTestMsg]     = useState(null);
  const [testErr, setTestErr]     = useState(null);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clienteAxios.get('/api/mail-config', { headers: authHeader });
      setForm({
        smtp_host:         data.smtp_host         || '',
        smtp_port:         data.smtp_port         ? String(data.smtp_port) : '587',
        smtp_username:     data.smtp_username     || '',
        smtp_password:     '',  // nunca mostrar la contraseña real
        smtp_encryption:   data.smtp_encryption   || 'tls',
        mail_from_address: data.mail_from_address || '',
        mail_from_name:    data.mail_from_name    || '',
        mail_admin_email:  data.mail_admin_email  || '',
        mail_bcc_address:  data.mail_bcc_address  || '',
      });
    } catch {
      setSaveErr('No se pudo cargar la configuración SMTP.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMsg(null); setSaveErr(null);

    if (!form.smtp_host.trim())    return setSaveErr('El servidor SMTP es obligatorio.');
    if (!Number(form.smtp_port))   return setSaveErr('El puerto debe ser un número válido.');
    if (!form.smtp_username.trim()) return setSaveErr('El usuario SMTP es obligatorio.');
    if (form.mail_from_address && !EMAIL_RE.test(form.mail_from_address)) return setSaveErr('El email de remitente no es válido.');
    if (form.mail_admin_email  && !EMAIL_RE.test(form.mail_admin_email))  return setSaveErr('El email de administrador no es válido.');
    if (form.mail_bcc_address  && !EMAIL_RE.test(form.mail_bcc_address))  return setSaveErr('El email de copia oculta no es válido.');

    setSaving(true);
    try {
      await clienteAxios.put('/api/mail-config', {
        ...form,
        smtp_port: Number(form.smtp_port),
        smtp_password: form.smtp_password || null,
      }, { headers: authHeader });

      setSaveMsg('Configuración SMTP guardada correctamente.');
      setForm((f) => ({ ...f, smtp_password: '' }));
      await load();
    } catch (err) {
      setSaveErr(err?.response?.data?.message || 'No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestMsg(null); setTestErr(null);

    if (!testEmail || !EMAIL_RE.test(testEmail)) return setTestErr('Ingresá un email de destino válido.');

    setTesting(true);
    try {
      const { data } = await clienteAxios.post('/api/mail-config/test', { email: testEmail }, { headers: authHeader });
      setTestMsg(data.message);
    } catch (err) {
      setTestErr(err?.response?.data?.message || 'Error al enviar el email de prueba.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-400 dark:text-white/30 text-sm">
        <Loader2 size={16} className="animate-spin" /> Cargando configuración…
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Servidor SMTP ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Server size={14} className="text-[#c9a84c]" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-white/80">Servidor SMTP</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-5">

          <Alert type="error"   msg={saveErr} />
          <Alert type="success" msg={saveMsg} />

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Servidor (host)">
              <input
                value={form.smtp_host}
                onChange={set('smtp_host')}
                placeholder="smtp.gmail.com"
                className={`${inputCls} sm:col-span-2`}
              />
            </Field>

            <Field label="Puerto">
              <input
                type="number"
                value={form.smtp_port}
                onChange={set('smtp_port')}
                placeholder="587"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Usuario">
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" />
                <input
                  value={form.smtp_username}
                  onChange={set('smtp_username')}
                  placeholder="usuario@dominio.com"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </Field>

            <Field label="Contraseña">
              <div className="flex">
                <div className="relative flex-1">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.smtp_password}
                    onChange={set('smtp_password')}
                    placeholder="Dejar vacío para mantener la actual"
                    className={`${inputCls} pl-8 rounded-r-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="px-3 border border-l-0 border-slate-200 dark:border-white/[0.08] rounded-r-lg text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-white/[0.04]"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          </div>

          <Field label="Encriptación">
            <div className="flex gap-3">
              {[
                { value: 'tls',  label: 'TLS (recomendado, puerto 587)' },
                { value: 'ssl',  label: 'SSL (puerto 465)' },
                { value: 'none', label: 'Sin encriptación' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-white/60">
                  <input
                    type="radio"
                    name="smtp_encryption"
                    value={opt.value}
                    checked={form.smtp_encryption === opt.value}
                    onChange={set('smtp_encryption')}
                    className="accent-[#c9a84c]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>

          {/* ── Identidad del remitente ───────────────────────────────── */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={14} className="text-[#c9a84c]" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white/80">Remitente</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email de remitente">
                <input
                  type="email"
                  value={form.mail_from_address}
                  onChange={set('mail_from_address')}
                  placeholder="no-reply@tu-dominio.com"
                  className={inputCls}
                />
              </Field>
              <Field label="Nombre del remitente">
                <input
                  value={form.mail_from_name}
                  onChange={set('mail_from_name')}
                  placeholder="Nombre de tu empresa"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* ── Destinos de recepción ─────────────────────────────────── */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Mail size={14} className="text-[#c9a84c]" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white/80">Destinos de recepción</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-white/30 mb-4">
              A estos emails llegan las notificaciones de tickets nuevos y respuestas de clientes.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email del administrador (tickets y notificaciones)">
                <input
                  type="email"
                  value={form.mail_admin_email}
                  onChange={set('mail_admin_email')}
                  placeholder="admin@tu-dominio.com"
                  className={inputCls}
                />
              </Field>
              <Field label="Copia oculta BCC (opcional — recibe copia de todos los emails)">
                <input
                  type="email"
                  value={form.mail_bcc_address}
                  onChange={set('mail_bcc_address')}
                  placeholder="copia@tu-dominio.com"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Email de prueba ──────────────────────────────────────────── */}
      <section className="border-t border-slate-100 dark:border-white/[0.06] pt-6">
        <div className="flex items-center gap-2 mb-1">
          <Send size={14} className="text-[#c9a84c]" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-white/80">Probar configuración</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-white/30 mb-4">
          Enviá un email de prueba para verificar que la configuración SMTP funciona correctamente.
        </p>

        <Alert type="error"   msg={testErr} />
        <Alert type="success" msg={testMsg} />

        <div className="flex gap-3 mt-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="destino@ejemplo.com"
            className={`${inputCls} max-w-xs`}
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-white/90 disabled:opacity-50 text-white dark:text-black text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            {testing ? 'Enviando…' : 'Enviar prueba'}
          </button>
        </div>
      </section>

    </div>
  );
}
