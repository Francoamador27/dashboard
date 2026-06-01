import { useState, useRef } from 'react';
import {
  Loader2, Paperclip, Link2, Plus, X, FileText, Image,
  CalendarClock, Clock,
} from 'lucide-react';

const TIPO_OPTS  = ['soporte', 'desarrollo', 'diseño', 'consulta', 'otro'];
const PRIOR_OPTS = ['baja', 'media', 'alta', 'urgente'];
const ESTADO_OPTS = ['pendiente', 'en_progreso', 'esperando_cliente', 'resuelto', 'cerrado'];

const PRIORIDAD_LABEL = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
const ESTADO_LABEL    = { pendiente: 'Pendiente', en_progreso: 'En progreso', esperando_cliente: 'Esperando cliente', resuelto: 'Resuelto', cerrado: 'Cerrado' };

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

const EMPTY = {
  titulo: '', descripcion: '', tipo: 'soporte', prioridad: 'media',
  estado: 'pendiente', incluido_soporte: true, precio_cobrado: '', tiempo_minutos: '', fecha_limite: '',
};

/**
 * Formulario completo de ticket: asunto, descripción, adjuntos (img+pdf), enlaces, metadatos.
 * Props:
 *   initial     – valores iniciales (para edición)
 *   onSave(data) – callback con { ...fields, adjuntos: File[], enlaces: string[] }
 *   onCancel()  – callback cancelar
 *   loading     – boolean
 *   showEstado  – mostrar campo estado (default true)
 */
export default function TicketFormFull({
  initial = EMPTY,
  onSave,
  onCancel,
  loading = false,
  showEstado = true,
}) {
  const [form, setForm]       = useState({ ...EMPTY, ...initial });
  const [adjuntos, setAdjuntos] = useState([]);    // File[]
  const [enlaces, setEnlaces]   = useState(['']);  // string[]
  const [activeTab, setActiveTab] = useState('detalle'); // 'detalle' | 'adjuntos' | 'enlaces'

  const fileRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = (files) => {
    const allowed = Array.from(files).filter(
      f => (f.type.startsWith('image/') || f.type === 'application/pdf') && f.size <= 10 * 1024 * 1024
    );
    setAdjuntos(p => [...p, ...allowed]);
  };

  const addEnlace = () => setEnlaces(p => [...p, '']);
  const setEnlace = (i, v) => setEnlaces(p => p.map((x, j) => j === i ? v : x));
  const removeEnlace = (i) => setEnlaces(p => p.filter((_, j) => j !== i));

  const handleSubmit = () => {
    if (!form.titulo) return;
    const payload = { ...form, adjuntos, enlaces: enlaces.filter(Boolean) };
    if (!payload.precio_cobrado) delete payload.precio_cobrado;
    if (!payload.tiempo_minutos) delete payload.tiempo_minutos;
    if (!payload.fecha_limite)   delete payload.fecha_limite;
    onSave(payload);
  };

  const tabCls = (t) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
      activeTab === t
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
    }`;

  const adjCountImg = adjuntos.filter(f => f.type.startsWith('image/')).length;
  const adjCountPdf = adjuntos.filter(f => f.type === 'application/pdf').length;
  const enlacesCount = enlaces.filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.10] rounded-2xl overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
        <button onClick={() => setActiveTab('detalle')} className={tabCls('detalle')}>
          Detalles
        </button>
        <button onClick={() => setActiveTab('adjuntos')} className={tabCls('adjuntos')}>
          <Paperclip size={11} />
          Adjuntos
          {(adjCountImg + adjCountPdf) > 0 && (
            <span className="bg-[#c9a84c] text-black text-[10px] font-bold px-1.5 rounded-full">
              {adjCountImg + adjCountPdf}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('enlaces')} className={tabCls('enlaces')}>
          <Link2 size={11} />
          Enlaces
          {enlacesCount > 0 && (
            <span className="bg-[#c9a84c] text-black text-[10px] font-bold px-1.5 rounded-full">
              {enlacesCount}
            </span>
          )}
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* ── Detalles ── */}
        {activeTab === 'detalle' && (
          <>
            {/* Asunto */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1">
                Asunto *
              </label>
              <input
                value={form.titulo}
                onChange={e => set('titulo', e.target.value)}
                placeholder="Ej: Error en formulario de contacto"
                className={inputCls}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                rows={4}
                placeholder="Describí el problema, requerimiento o consulta con el mayor detalle posible…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Tipo + Prioridad + Estado */}
            <div className={`grid gap-3 ${showEstado ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Tipo</label>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>
                  {TIPO_OPTS.map(o => (
                    <option key={o} value={o} className="capitalize bg-white dark:bg-[#1a1a1a]">
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Prioridad</label>
                <select value={form.prioridad} onChange={e => set('prioridad', e.target.value)} className={inputCls}>
                  {PRIOR_OPTS.map(o => (
                    <option key={o} value={o} className="bg-white dark:bg-[#1a1a1a]">{PRIORIDAD_LABEL[o]}</option>
                  ))}
                </select>
              </div>
              {showEstado && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1">Estado</label>
                  <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputCls}>
                    {ESTADO_OPTS.map(o => (
                      <option key={o} value={o} className="bg-white dark:bg-[#1a1a1a]">{ESTADO_LABEL[o]}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Fecha límite + tiempo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1 flex items-center gap-1">
                  <CalendarClock size={11} /> Fecha límite
                </label>
                <input type="date" value={form.fecha_limite} onChange={e => set('fecha_limite', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1 flex items-center gap-1">
                  <Clock size={11} /> Tiempo estimado (min)
                </label>
                <input type="number" min="0" value={form.tiempo_minutos} onChange={e => set('tiempo_minutos', e.target.value)} placeholder="0" className={inputCls} />
              </div>
            </div>

            {/* Soporte + precio */}
            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox" checked={form.incluido_soporte}
                  onChange={e => set('incluido_soporte', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#c9a84c]"
                />
                <span className="text-sm text-slate-600 dark:text-white/60">Incluido en soporte</span>
              </label>
              {!form.incluido_soporte && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.precio_cobrado}
                    onChange={e => set('precio_cobrado', e.target.value)}
                    placeholder="Precio"
                    className={`${inputCls} w-32`}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Adjuntos ── */}
        {activeTab === 'adjuntos' && (
          <div className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl py-8 flex flex-col items-center gap-2 hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/[0.02] transition-all group"
            >
              <div className="flex items-center gap-3">
                <Image size={18} className="text-slate-300 dark:text-white/20 group-hover:text-[#c9a84c] transition-colors" />
                <FileText size={18} className="text-slate-300 dark:text-white/20 group-hover:text-[#c9a84c] transition-colors" />
              </div>
              <p className="text-sm text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/50 transition-colors">
                Hacé clic para adjuntar imágenes o PDFs
              </p>
              <p className="text-xs text-slate-300 dark:text-white/20">JPG, PNG, GIF, WebP, PDF — máx. 10 MB c/u</p>
            </button>

            {adjuntos.length > 0 && (
              <div className="space-y-2">
                {adjuntos.map((f, i) => {
                  const isImg = f.type.startsWith('image/');
                  const preview = isImg ? URL.createObjectURL(f) : null;
                  return (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3">
                      {preview
                        ? <img src={preview} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText size={20} className="text-red-400" />
                          </div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-white/70 truncate">{f.name}</p>
                        <p className="text-xs text-slate-400 dark:text-white/30">
                          {isImg ? 'Imagen' : 'PDF'} · {(f.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button onClick={() => setAdjuntos(p => p.filter((_, j) => j !== i))} className="text-slate-300 dark:text-white/20 hover:text-red-500 transition-colors flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Enlaces ── */}
        {activeTab === 'enlaces' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 dark:text-white/30">
              Agregá URLs relevantes: páginas con el error, diseños en Figma, documentos en Drive, etc.
            </p>
            {enlaces.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center">
                  <Link2 size={13} className="text-slate-400 dark:text-white/30" />
                </div>
                <input
                  value={url}
                  onChange={e => setEnlace(i, e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className={inputCls}
                />
                {enlaces.length > 1 && (
                  <button onClick={() => removeEnlace(i)} className="text-slate-300 dark:text-white/20 hover:text-red-500 transition-colors flex-shrink-0">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addEnlace}
              className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40 hover:text-[#c9a84c] transition-colors"
            >
              <Plus size={13} /> Agregar otro enlace
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.titulo || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Guardar ticket
          </button>
        </div>
      </div>
    </div>
  );
}
