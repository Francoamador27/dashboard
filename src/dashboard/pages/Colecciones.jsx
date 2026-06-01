import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Zap, Plus, X, Trash2, Loader2, ChevronDown,
  CheckCircle2, AlertCircle, Clock, FolderOpen,
} from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import {
  useCampanas, useGenerarMasiva, useDeleteCampana, useCampanaProgress,
  useColecciones, useCrearColeccion, useDeleteColeccion,
} from '../hooks/useCampanas';

const OBJETIVOS = [
  { value: '', label: 'Sin objetivo específico' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'conversion', label: 'Conversión' },
  { value: 'remarketing', label: 'Remarketing' },
  { value: 'fidelizacion', label: 'Fidelización' },
];

const PLATAFORMA_OPTS = [
  { value: 'meta_feed', label: 'Meta Feed' },
  { value: 'meta_story', label: 'Meta Story' },
  { value: 'google_display', label: 'Google Display' },
  { value: 'highlight_cover', label: 'Highlight Cover' },
];

const STATUS_INFO = {
  pending:    { label: 'En espera',   cls: 'text-slate-400 dark:text-white/30',  Icon: Clock },
  processing: { label: 'Procesando', cls: 'text-blue-500',                       Icon: Loader2 },
  completed:  { label: 'Completada', cls: 'text-emerald-500',                    Icon: CheckCircle2 },
  failed:     { label: 'Con errores', cls: 'text-red-400',                       Icon: AlertCircle },
};

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';
const selectCls = `${inputCls} appearance-none`;

// ── Progress bar ──────────────────────────────────────────────────────────────
function CampanaCard({ campana }) {
  const eliminar = useDeleteCampana();
  const { data: progress } = useCampanaProgress(
    campana.id,
    campana.status === 'processing' || campana.status === 'pending',
  );

  const pct = progress?.progreso ?? campana.progreso ?? 0;
  const statusInfo = STATUS_INFO[campana.status] ?? STATUS_INFO.pending;
  const StatusIcon = statusInfo.Icon;

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-white/90 truncate">{campana.nombre}</p>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{campana.cliente?.nombre}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`flex items-center gap-1 text-xs font-medium ${statusInfo.cls}`}>
            <StatusIcon size={11} className={campana.status === 'processing' ? 'animate-spin' : ''} />
            {statusInfo.label}
          </span>
          <button
            onClick={() => eliminar.mutate(campana.id)}
            disabled={eliminar.isPending}
            className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#c9a84c] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs text-slate-400 dark:text-white/30 shrink-0 w-8 text-right">{pct}%</span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-white/30">
        <span>{campana.cantidad_piezas} piezas</span>
        {campana.objetivo && <span className="capitalize">{campana.objetivo}</span>}
        <span>{new Date(campana.created_at).toLocaleDateString('es-AR')}</span>
      </div>
    </div>
  );
}

// ── New campaign modal ────────────────────────────────────────────────────────
function NuevaCampanaModal({ onClose }) {
  const { data: clientes } = useClientes();
  const generar = useGenerarMasiva();

  const [form, setForm] = useState({
    cliente_id: '', nombre: '', objetivo: '',
    cantidad_piezas: 6, plataformas: ['meta_feed', 'meta_story'],
    texto_base: '', cta: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const togglePlataforma = (v) =>
    set('plataformas', form.plataformas.includes(v)
      ? form.plataformas.filter((p) => p !== v)
      : [...form.plataformas, v]);

  const handleSubmit = async () => {
    if (!form.cliente_id || !form.nombre) return;
    await generar.mutateAsync({ ...form, objetivo: form.objetivo || undefined });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-lg bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2">
            <Zap size={14} className="text-[#c9a84c]" /> Nueva campaña masiva
          </h2>
          <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Cliente *</label>
            <div className="relative">
              <select value={form.cliente_id} onChange={(e) => set('cliente_id', e.target.value)} className={selectCls}>
                <option value="">Seleccioná un cliente…</option>
                {(clientes ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nombre de campaña *</label>
            <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Junio 2026 · Promociones" className={inputCls} />
          </div>

          {/* Objetivo + Cantidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Objetivo</label>
              <div className="relative">
                <select value={form.objetivo} onChange={(e) => set('objetivo', e.target.value)} className={selectCls}>
                  {OBJETIVOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
                Cantidad de piezas <span className="text-[#c9a84c]">{form.cantidad_piezas}</span>
              </label>
              <input
                type="range" min={1} max={30} value={form.cantidad_piezas}
                onChange={(e) => set('cantidad_piezas', Number(e.target.value))}
                className="w-full accent-[#c9a84c] mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-300 dark:text-white/20 mt-1">
                <span>1</span><span>30</span>
              </div>
            </div>
          </div>

          {/* Plataformas */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-2">Plataformas</label>
            <div className="flex flex-wrap gap-2">
              {PLATAFORMA_OPTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlataforma(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.plataformas.includes(p.value)
                      ? 'bg-[#c9a84c] text-black'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Texto + CTA opcionales */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Texto base <span className="text-slate-300 dark:text-white/20 font-normal">(opcional)</span></label>
              <input value={form.texto_base} onChange={(e) => set('texto_base', e.target.value)} placeholder="Ej: Promoción de fin de mes" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">CTA <span className="text-slate-300 dark:text-white/20 font-normal">(opcional)</span></label>
              <input value={form.cta} onChange={(e) => set('cta', e.target.value)} placeholder="Ej: Reservá ahora" className={inputCls} />
            </div>
          </div>

          {generar.isError && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/[0.05] rounded-lg px-3 py-2">
              {generar.error?.response?.data?.message ?? 'Error al crear la campaña.'}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.cliente_id || !form.nombre || !form.plataformas.length || generar.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-sm font-semibold rounded-xl py-2.5 transition-all disabled:opacity-50"
          >
            {generar.isPending && <Loader2 size={13} className="animate-spin" />}
            <Zap size={13} /> Generar campaña
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Coleccion card ────────────────────────────────────────────────────────────
function ColeccionCard({ col }) {
  const eliminar = useDeleteColeccion();
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-sm dark:shadow-none flex items-center gap-4">
      <div
        className="w-9 h-9 rounded-xl shrink-0"
        style={{ backgroundColor: col.color ?? '#c9a84c' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-white/90 truncate">{col.nombre}</p>
        <p className="text-xs text-slate-400 dark:text-white/30">
          {col.assets_count ?? 0} imagen{col.assets_count !== 1 ? 'es' : ''} · {col.cliente?.nombre}
        </p>
      </div>
      <button
        onClick={() => eliminar.mutate(col.id)}
        disabled={eliminar.isPending}
        className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Colecciones() {
  const [tab, setTab] = useState('campanas');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: campanas, isLoading: loadingCampanas } = useCampanas();
  const { data: colecciones, isLoading: loadingCols } = useColecciones();

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      tab === t
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
    }`;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Layers size={20} className="text-[#c9a84c]" />
            Campañas & Colecciones
          </h1>
          <p className="text-slate-400 dark:text-white/30 text-sm mt-1">
            Generación masiva y organización de assets.
          </p>
        </div>
        {tab === 'campanas' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-sm font-semibold rounded-xl px-4 py-2.5 transition-all"
          >
            <Zap size={13} /> Nueva campaña
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button onClick={() => setTab('campanas')} className={tabCls('campanas')}>
          Campañas masivas {campanas?.length ? `(${campanas.length})` : ''}
        </button>
        <button onClick={() => setTab('colecciones')} className={tabCls('colecciones')}>
          Colecciones {colecciones?.length ? `(${colecciones.length})` : ''}
        </button>
      </div>

      {/* Campaign tab */}
      {tab === 'campanas' && (
        <div className="space-y-3">
          {loadingCampanas ? (
            <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-8">
              <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
            </div>
          ) : !campanas?.length ? (
            <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
              <Zap size={32} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
              <p className="text-slate-400 dark:text-white/30 text-sm">Sin campañas aún.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-sm text-[#c9a84c] hover:underline"
              >
                Crear primera campaña →
              </button>
            </div>
          ) : (
            campanas.map((c) => <CampanaCard key={c.id} campana={c} />)
          )}
        </div>
      )}

      {/* Collections tab */}
      {tab === 'colecciones' && (
        <div className="space-y-2">
          {loadingCols ? (
            <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-8">
              <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
            </div>
          ) : !colecciones?.length ? (
            <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
              <FolderOpen size={32} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
              <p className="text-slate-400 dark:text-white/30 text-sm">Sin colecciones. Creá una desde la Biblioteca.</p>
            </div>
          ) : (
            colecciones.map((c) => <ColeccionCard key={c.id} col={c} />)
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && <NuevaCampanaModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
