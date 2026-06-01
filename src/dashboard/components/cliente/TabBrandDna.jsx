// Re-usa la misma lógica de BrandDna.jsx pero sin el header de navegación
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Plus, X, Link2, CheckCircle2 } from 'lucide-react';
import { useBrandDna, useUpdateBrandDna } from '../../hooks/useClientes';

const ESTILOS = ['Minimalista','Premium','Moderno','Clásico','Geométrico','Orgánico','Tipográfico','Ilustrativo','Fotográfico','Editorial'];
const TONOS_COPY = ['Formal','Cercano','Inspirador','Directo','Técnico','Emocional','Informativo','Persuasivo','Elegante'];
const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

function Section({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
      <div>
        <h3 className="text-slate-700 dark:text-white/80 font-medium text-sm">{title}</h3>
        {description && <p className="text-slate-400 dark:text-white/30 text-xs mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function TagSelector({ options, value = [], onChange, max = 4 }) {
  const toggle = (opt) => {
    const curr = value ?? [];
    onChange(curr.includes(opt) ? curr.filter(v => v !== opt) : curr.length < max ? [...curr, opt] : curr);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${(value ?? []).includes(opt) ? 'bg-[#c9a84c] text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'}`}
        >{opt}</button>
      ))}
    </div>
  );
}

export default function TabBrandDna({ clienteId }) {
  const { data: dna, isLoading } = useBrandDna(clienteId);
  const mutation = useUpdateBrandDna(clienteId);
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [refInput, setRefInput] = useState('');

  useEffect(() => {
    if (dna && !form) setForm({
      prompt_base: dna.prompt_base ?? '',
      colores: dna.colores ?? ['#000000'],
      tipografia: dna.tipografia ?? '',
      tono: dna.tono ?? '',
      estilo_grafico: dna.estilo_grafico ?? [],
      restricciones: dna.restricciones ?? '',
      estilo_copy: dna.estilo_copy ?? [],
      referencias_visuales: dna.referencias_visuales ?? [],
    });
  }, [dna]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addRef = () => {
    const v = refInput.trim();
    if (!v) return;
    set('referencias_visuales', [...(form.referencias_visuales ?? []), v]);
    setRefInput('');
  };

  const handleSave = async () => {
    await mutation.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading || !form) return (
    <div className="flex items-center gap-2 text-slate-400 dark:text-white/30">
      <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 dark:text-white/40 text-sm">Identidad de marca — se inyecta en cada generación.</p>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-emerald-500 text-sm">
              <CheckCircle2 size={13} /> Guardado
            </motion.span>
          )}
          <button onClick={handleSave} disabled={mutation.isPending}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-4 py-2 transition-all"
          >
            {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar
          </button>
        </div>
      </div>

      <Section title="Prompt base" description="Base de todos los prompts generados para este cliente.">
        <textarea value={form.prompt_base} onChange={e => set('prompt_base', e.target.value)} rows={4}
          placeholder="Marca premium minimalista negro y dorado…" className={`${inputCls} resize-none`} />
      </Section>

      <Section title="Paleta visual">
        <div className="flex flex-wrap gap-3">
          {(form.colores ?? []).map((color, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2">
              <input type="color" value={color} onChange={e => set('colores', form.colores.map((c,idx) => idx===i ? e.target.value : c))} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0" />
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={e => {
                  const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) set('colores', form.colores.map((c,idx) => idx===i ? v : c));
                }}
                onBlur={e => {
                  if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) set('colores', form.colores.map((c,idx) => idx===i ? color : c));
                }}
                className="w-20 text-xs font-mono text-slate-500 dark:text-white/50 bg-transparent border-none outline-none focus:text-slate-700 dark:focus:text-white/80"
              />
              {form.colores.length > 1 && <button onClick={() => set('colores', form.colores.filter((_,idx) => idx!==i))} className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors"><X size={11}/></button>}
            </div>
          ))}
          {(form.colores?.length ?? 0) < 8 && (
            <button onClick={() => set('colores', [...(form.colores??[]),'#c9a84c'])}
              className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30 hover:text-[#c9a84c] border border-dashed border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 transition-all">
              <Plus size={11}/> Agregar
            </button>
          )}
        </div>
      </Section>

      <Section title="Estilo gráfico" description="Hasta 4 estilos.">
        <TagSelector options={ESTILOS} value={form.estilo_grafico} onChange={v => set('estilo_grafico', v)} />
      </Section>

      <Section title="Restricciones" description="Qué evitar en las piezas.">
        <textarea value={form.restricciones} onChange={e => set('restricciones', e.target.value)} rows={2}
          placeholder="Ej: Evitar colores brillantes, no usar personas…" className={`${inputCls} resize-none`} />
      </Section>

      <Section title="Estilo de copy" description="Tono de los textos.">
        <TagSelector options={TONOS_COPY} value={Array.isArray(form.estilo_copy) ? form.estilo_copy : [form.estilo_copy].filter(Boolean)} onChange={v => set('estilo_copy', v)} max={3} />
      </Section>

      <Section title="Referencias visuales">
        <div className="space-y-2">
          {(form.referencias_visuales ?? []).map((ref, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06] rounded-lg px-3 py-2">
              <Link2 size={11} className="text-slate-300 dark:text-white/20 shrink-0" />
              <span className="flex-1 text-xs text-slate-600 dark:text-white/60 truncate">{ref}</span>
              <button onClick={() => set('referencias_visuales', form.referencias_visuales.filter((_,idx) => idx!==i))} className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors"><X size={11}/></button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={refInput} onChange={e => setRefInput(e.target.value)} onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addRef())}
              placeholder="https://referencia.com" className={`${inputCls} flex-1`} />
            <button onClick={addRef} className="px-3 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.10] rounded-lg text-slate-500 dark:text-white/40 transition-all"><Plus size={14}/></button>
          </div>
        </div>
      </Section>
    </div>
  );
}
