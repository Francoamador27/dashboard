import { useState, useRef } from 'react';
import { Save, Loader2, Upload, Globe, Mail, Phone, MessageCircle, MapPin, DollarSign, Plus, X, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import { useUpdateCliente, useUploadLogo } from '../../hooks/useClientes';

const REDES_OPTS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { id: 'facebook',  label: 'Facebook',  icon: Globe,      placeholder: 'https://facebook.com/...' },
  { id: 'tiktok',    label: 'TikTok',    icon: Globe,      placeholder: 'https://tiktok.com/...' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,   placeholder: 'https://linkedin.com/...' },
  { id: 'youtube',   label: 'YouTube',   icon: Youtube,    placeholder: 'https://youtube.com/...' },
  { id: 'x',         label: 'X / Twitter', icon: Twitter,  placeholder: 'https://x.com/...' },
];

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
        {Icon && <Icon size={11} />} {label}
        <span className="text-slate-300 dark:text-white/20 font-normal">(opcional)</span>
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
      <h3 className="text-slate-700 dark:text-white/70 text-xs font-semibold uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export default function TabInfo({ cliente }) {
  const [form, setForm] = useState({
    nombre:         cliente.nombre ?? '',
    rubro:          cliente.rubro ?? '',
    descripcion:    cliente.descripcion ?? '',
    website:        cliente.website ?? '',
    email_contacto: cliente.email_contacto ?? '',
    telefono:       cliente.telefono ?? '',
    whatsapp:       cliente.whatsapp ?? '',
    direccion:      cliente.direccion ?? '',
    plan_soporte:   cliente.plan_soporte ?? '',
    notas_internas: cliente.notas_internas ?? '',
  });
  const [redes, setRedes] = useState(
    (cliente.redes ?? []).reduce((acc, r) => ({ ...acc, [r.plataforma]: r.url }), {})
  );
  const [saved, setSaved] = useState(false);
  const logoRef = useRef();

  const update = useUpdateCliente(cliente.id);
  const uploadLogo = useUploadLogo(cliente.id);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await update.mutateAsync({ ...form, redes });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Logo */}
      <Section title="Logo">
        <div className="flex items-center gap-4">
          {cliente.logo_path ? (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cliente.logo_path}`}
              alt={cliente.nombre}
              className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-[#c9a84c]/10 border-2 border-dashed border-[#c9a84c]/30 flex items-center justify-center text-2xl font-bold text-[#c9a84c]">
              {cliente.nombre.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-2">
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo.mutate(f); }} />
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploadLogo.isPending}
              className="flex items-center gap-2 text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] rounded-lg px-3 py-2 transition-all"
            >
              {uploadLogo.isPending ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploadLogo.isPending ? 'Subiendo…' : 'Subir logo'}
            </button>
            <p className="text-xs text-slate-300 dark:text-white/20">PNG, JPG, SVG — máx. 4 MB</p>
          </div>
        </div>
      </Section>

      {/* Datos generales */}
      <Section title="Datos generales">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del cliente" className={inputCls} />
          </Field>
          <Field label="Rubro">
            <input value={form.rubro} onChange={e => set('rubro', e.target.value)} placeholder="Ej: Estética, Tech…" className={inputCls} />
          </Field>
        </div>
        <Field label="Descripción">
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={2} placeholder="Breve descripción…" className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      {/* Contacto */}
      <Section title="Contacto">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sitio web" icon={Globe}>
            <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Email" icon={Mail}>
            <input type="email" value={form.email_contacto} onChange={e => set('email_contacto', e.target.value)} placeholder="contacto@empresa.com" className={inputCls} />
          </Field>
          <Field label="Teléfono" icon={Phone}>
            <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+54 9 11 …" className={inputCls} />
          </Field>
          <Field label="WhatsApp" icon={MessageCircle}>
            <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+54 9 11 …" className={inputCls} />
          </Field>
        </div>
        <Field label="Dirección" icon={MapPin}>
          <input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Calle 123, Ciudad…" className={inputCls} />
        </Field>
      </Section>

      {/* Redes sociales */}
      <Section title="Redes sociales">
        <div className="space-y-3">
          {REDES_OPTS.map(({ id, label, icon: Icon, placeholder }) => (
            <div key={id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                <Icon size={14} className="text-slate-400 dark:text-white/40" />
              </div>
              <input
                value={redes[id] ?? ''}
                onChange={e => setRedes(r => ({ ...r, [id]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Facturación */}
      <Section title="Plan de soporte">
        <Field label="Monto mensual" icon={DollarSign}>
          <input
            type="number" min="0" step="0.01"
            value={form.plan_soporte}
            onChange={e => set('plan_soporte', e.target.value)}
            placeholder="0.00"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Notas internas */}
      <Section title="Notas internas">
        <textarea
          value={form.notas_internas} onChange={e => set('notas_internas', e.target.value)}
          rows={3} placeholder="Notas privadas sobre el cliente (solo visibles para vos)…"
          className={`${inputCls} resize-none`}
        />
      </Section>

      {/* Guardar */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave} disabled={update.isPending}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-5 py-2.5 transition-all"
        >
          {update.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {update.isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-emerald-500 dark:text-emerald-400 text-sm">✓ Guardado</span>}
      </div>
    </div>
  );
}
