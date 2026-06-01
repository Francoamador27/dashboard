import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, TrendingUp, Clock, AlertTriangle, FileText, Upload, Download, Trash2, X, ExternalLink } from 'lucide-react';
import { usePagos, useCrearPago, useActualizarPago, useEliminarPago, useArchivos, useSubirArchivo, useEliminarArchivo } from '../../hooks/useClienteDetalle';

const METODOS = ['Transferencia','Efectivo','Tarjeta','MercadoPago','PayPal','Otro'];
const TIPOS_PAGO = ['mensualidad','ticket_extra','proyecto','otro'];
const MONEDAS = ['ARS','USD','EUR'];
const CATEGORIAS_ARCHIVO = [
  { id:'facturacion',   label:'Facturación' },
  { id:'contrato',      label:'Contrato' },
  { id:'plan_trabajo',  label:'Plan de trabajo' },
  { id:'presupuesto',   label:'Presupuesto' },
  { id:'otro',          label:'Otro' },
];

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

const ESTADO_PAGO = {
  pagado:    { label:'Pagado',    cls:'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' },
  pendiente: { label:'Pendiente', cls:'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' },
  vencido:   { label:'Vencido',   cls:'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20' },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-4 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className={color} />
        <span className="text-xs text-slate-500 dark:text-white/40 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

const EMPTY_PAGO = { concepto:'', monto:'', moneda:'ARS', metodo_pago:'', tipo:'mensualidad', estado:'pendiente', fecha_pago:'', fecha_vencimiento:'', notas:'' };

function PagoForm({ onSave, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY_PAGO);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.10] rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input value={form.concepto} onChange={e => set('concepto', e.target.value)} placeholder="Concepto *" className={inputCls} />
        </div>
        <div className="flex gap-2">
          <select value={form.moneda} onChange={e => set('moneda', e.target.value)} className={`${inputCls} w-24`}>
            {MONEDAS.map(m => <option key={m} value={m} className="bg-white dark:bg-[#1a1a1a]">{m}</option>)}
          </select>
          <input type="number" min="0" step="0.01" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="Monto *" className={inputCls} />
        </div>
        <select value={form.metodo_pago} onChange={e => set('metodo_pago', e.target.value)} className={inputCls}>
          <option value="" className="bg-white dark:bg-[#1a1a1a]">Método de pago</option>
          {METODOS.map(m => <option key={m} value={m} className="bg-white dark:bg-[#1a1a1a]">{m}</option>)}
        </select>
        <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>
          {TIPOS_PAGO.map(t => <option key={t} value={t} className="capitalize bg-white dark:bg-[#1a1a1a]">{t.replace('_',' ')}</option>)}
        </select>
        <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputCls}>
          {Object.entries(ESTADO_PAGO).map(([k,v]) => <option key={k} value={k} className="bg-white dark:bg-[#1a1a1a]">{v.label}</option>)}
        </select>
        <div>
          <label className="block text-xs text-slate-400 dark:text-white/40 mb-1">Fecha de pago</label>
          <input type="date" value={form.fecha_pago} onChange={e => set('fecha_pago', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 dark:text-white/40 mb-1">Vencimiento</label>
          <input type="date" value={form.fecha_vencimiento} onChange={e => set('fecha_vencimiento', e.target.value)} className={inputCls} />
        </div>
        <div className="col-span-2">
          <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} placeholder="Notas adicionales…" className={`${inputCls} resize-none`} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">Cancelar</button>
        <button
          onClick={() => onSave(form)} disabled={!form.concepto || !form.monto || loading}
          className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg py-2 transition-all"
        >
          {loading && <Loader2 size={13} className="animate-spin" />} Guardar
        </button>
      </div>
    </div>
  );
}

function ArchivoRow({ archivo, clienteId }) {
  const eliminar = useEliminarArchivo(clienteId);
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api','') ?? 'https://dashboard.test';
  const isPdf = archivo.mime_type === 'application/pdf';

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1024/1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl px-4 py-3 group shadow-sm dark:shadow-none">
      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
        <FileText size={14} className="text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-white/80 truncate">{archivo.nombre}</p>
        <p className="text-xs text-slate-400 dark:text-white/30">
          {CATEGORIAS_ARCHIVO.find(c => c.id === archivo.categoria)?.label ?? 'Archivo'}
          {archivo.size_bytes ? ` · ${formatSize(archivo.size_bytes)}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={`${baseUrl}/storage/${archivo.ruta}`}
          target="_blank" rel="noreferrer"
          className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
        >
          <ExternalLink size={13} />
        </a>
        <button
          onClick={() => eliminar.mutate(archivo.id)}
          className="p-1.5 rounded-lg text-slate-300 dark:text-white/20 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function TabFacturacion({ clienteId, cliente }) {
  const { data, isLoading } = usePagos(clienteId);
  const { data: archivos } = useArchivos(clienteId);
  const crear = useCrearPago(clienteId);
  const actualizar = useActualizarPago(clienteId);
  const eliminar = useEliminarPago(clienteId);
  const subirArchivo = useSubirArchivo(clienteId);
  const eliminarArchivo = useEliminarArchivo(clienteId);
  const fileRef = useRef();

  const [creando, setCreando] = useState(false);
  const [categoriaArchivo, setCategoriaArchivo] = useState('facturacion');

  const pagos = data?.pagos ?? [];
  const resumen = data?.resumen ?? {};

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    subirArchivo.mutate({ file, categoria: categoriaArchivo });
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={TrendingUp} label="Total cobrado" value={`$${Number(resumen.total_cobrado ?? 0).toLocaleString()}`} color="text-emerald-500" />
        <StatCard icon={Clock}       label="Pendiente"     value={`$${Number(resumen.total_pendiente ?? 0).toLocaleString()}`} color="text-amber-500" />
        <StatCard icon={AlertTriangle} label="Vencido"    value={`$${Number(resumen.total_vencido ?? 0).toLocaleString()}`}   color="text-red-500" />
      </div>

      {/* Pagos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-700 dark:text-white/70 text-sm font-semibold">Historial de pagos</h3>
          <button
            onClick={() => setCreando(true)}
            className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg px-3 py-2 transition-all"
          >
            <Plus size={13} /> Registrar pago
          </button>
        </div>

        <AnimatePresence>
          {creando && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <PagoForm
                onSave={async (d) => { await crear.mutateAsync(d); setCreando(false); }}
                onCancel={() => setCreando(false)}
                loading={crear.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/30">
            <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
          </div>
        ) : pagos.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-10 text-center">
            <p className="text-slate-300 dark:text-white/20 text-sm">Sin pagos registrados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pagos.map(pago => (
              <div key={pago.id} className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm dark:shadow-none group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white/80">{pago.concepto}</p>
                  <p className="text-xs text-slate-400 dark:text-white/30">
                    {pago.metodo_pago && `${pago.metodo_pago} · `}
                    {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : '—'}
                    {pago.fecha_vencimiento && ` · Vence ${new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}`}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {pago.moneda} ${Number(pago.monto).toLocaleString()}
                </span>
                <select
                  value={pago.estado}
                  onChange={e => actualizar.mutate({ id: pago.id, estado: e.target.value })}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer appearance-none ${ESTADO_PAGO[pago.estado]?.cls ?? ''}`}
                >
                  {Object.entries(ESTADO_PAGO).map(([k,v]) => <option key={k} value={k} className="bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white">{v.label}</option>)}
                </select>
                <button
                  onClick={() => eliminar.mutate(pago.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archivos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-700 dark:text-white/70 text-sm font-semibold">Archivos adjuntos</h3>
          <div className="flex items-center gap-2">
            <select
              value={categoriaArchivo}
              onChange={e => setCategoriaArchivo(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2 py-1.5 text-slate-600 dark:text-white/60 outline-none"
            >
              {CATEGORIAS_ARCHIVO.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-[#1a1a1a]">{c.label}</option>)}
            </select>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subirArchivo.isPending}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#c9a84c]/40 hover:text-[#c9a84c] text-xs font-medium rounded-lg px-3 py-2 transition-all"
            >
              {subirArchivo.isPending ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {subirArchivo.isPending ? 'Subiendo…' : 'Adjuntar'}
            </button>
          </div>
        </div>

        {(archivos ?? []).length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 text-center">
            <FileText size={24} className="mx-auto mb-2 text-slate-200 dark:text-white/10" />
            <p className="text-slate-300 dark:text-white/20 text-sm">Sin archivos adjuntos.</p>
            <p className="text-slate-200 dark:text-white/10 text-xs mt-1">PDF, imágenes, documentos — máx. 20 MB</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(archivos ?? []).map(a => <ArchivoRow key={a.id} archivo={a} clienteId={clienteId} />)}
          </div>
        )}
      </div>
    </div>
  );
}
