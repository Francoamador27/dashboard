import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, FileText, Image, Download, Loader2, Plus, Link2,
  Upload, X, Trash2, ExternalLink, File, FileSpreadsheet, Archive,
  User, ShieldCheck,
} from 'lucide-react';
import { useArchivos, useSubirArchivo, useEliminarArchivo } from '../../hooks/useClienteDetalle';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function FileIcon({ mime, urlExterna }) {
  if (!mime && urlExterna) return <Link2 size={16} className="text-blue-500" />;
  if (mime?.startsWith('image/'))    return <Image size={16} className="text-violet-500" />;
  if (mime === 'application/pdf')    return <FileText size={16} className="text-red-500" />;
  if (mime?.includes('spreadsheet') || mime?.includes('excel'))
                                     return <FileSpreadsheet size={16} className="text-emerald-500" />;
  if (mime?.includes('zip'))         return <Archive size={16} className="text-amber-500" />;
  return <File size={16} className="text-slate-400" />;
}

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

export default function TabRecursos({ clienteId }) {
  const fileRef = useRef(null);
  const { data: archivos = [], isLoading } = useArchivos(clienteId);
  const subir   = useSubirArchivo(clienteId);
  const eliminar = useEliminarArchivo(clienteId);

  const [filtro, setFiltro] = useState('todos');      // 'todos' | 'admin' | 'cliente'
  const [modal, setModal]   = useState(false);
  const [modo, setModo]     = useState('archivo');    // 'archivo' | 'link'
  const [form, setForm]     = useState({ nombre: '', descripcion: '', url_externa: '' });
  const [archivo, setArchivo] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const lista = archivos.filter(a =>
    filtro === 'todos'    ? true :
    filtro === 'cliente'  ? a.subido_por === 'cliente' :
                            a.subido_por === 'admin' || !a.subido_por
  );

  const clienteCount = archivos.filter(a => a.subido_por === 'cliente').length;

  const resetModal = () => {
    setModal(false);
    setModo('archivo');
    setForm({ nombre: '', descripcion: '', url_externa: '' });
    setArchivo(null);
  };

  const handleSubir = async () => {
    if (modo === 'archivo' && !archivo) return;
    if (modo === 'link' && !form.url_externa) return;
    await subir.mutateAsync({
      file:        archivo,
      nombre:      form.nombre || undefined,
      descripcion: form.descripcion || undefined,
      url_externa: modo === 'link' ? form.url_externa : undefined,
      categoria:   'otro',
    });
    resetModal();
  };

  const chipCls = (v) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
      filtro === v
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
    }`;

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-slate-700 dark:text-white/70 text-sm font-semibold">
            {archivos.length} recurso{archivos.length !== 1 ? 's' : ''}
          </h2>
          {clienteCount > 0 && (
            <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full px-2 py-0.5 flex items-center gap-1">
              <User size={10} /> {clienteCount} del cliente
            </span>
          )}
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg px-3 py-2 transition-all"
        >
          <Plus size={13} /> Subir archivo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5">
        <button onClick={() => setFiltro('todos')}   className={chipCls('todos')}>Todos</button>
        <button onClick={() => setFiltro('admin')}   className={chipCls('admin')}><ShieldCheck size={10} className="inline mr-1" />Del equipo</button>
        <button onClick={() => setFiltro('cliente')} className={chipCls('cliente')}><User size={10} className="inline mr-1" />Del cliente</button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30">
          <Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span>
        </div>
      ) : lista.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-10 text-center">
          <FolderOpen size={28} className="mx-auto mb-2 text-slate-200 dark:text-white/10" />
          <p className="text-slate-300 dark:text-white/20 text-sm">
            {filtro === 'cliente' ? 'El cliente aún no compartió recursos.' : 'Sin archivos aún.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(a => {
            const esImagen   = a.mime_type?.startsWith('image/');
            const esLink     = !!a.url_externa;
            const esCliente  = a.subido_por === 'cliente';
            return (
              <div key={a.id} className={`flex items-center gap-3 bg-white dark:bg-white/[0.03] border rounded-xl px-4 py-3 group transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] ${
                esCliente
                  ? 'border-blue-100 dark:border-blue-500/20'
                  : 'border-slate-100 dark:border-white/[0.06]'
              }`}>
                {/* Thumb / icono */}
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {esImagen && a.url
                    ? <img src={a.url} alt="" className="w-full h-full object-cover" />
                    : <FileIcon mime={a.mime_type} urlExterna={a.url_externa} />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-white/90 truncate">{a.nombre}</p>
                    {esCliente && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full px-1.5 py-0.5 flex-shrink-0 flex items-center gap-1">
                        <User size={8} /> cliente
                      </span>
                    )}
                  </div>
                  {a.descripcion && (
                    <p className="text-xs text-slate-400 dark:text-white/30 truncate">{a.descripcion}</p>
                  )}
                  <p className="text-xs text-slate-300 dark:text-white/20">
                    {esLink ? 'Enlace' : (a.mime_type ?? 'Archivo')}
                    {a.size_bytes ? ` · ${formatSize(a.size_bytes)}` : ''}
                    {' · '}{new Date(a.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {esLink ? (
                    <a href={a.url_externa} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30 hover:text-blue-500 transition-colors">
                      <ExternalLink size={13} /> Abrir
                    </a>
                  ) : (
                    <a href={`${import.meta.env.VITE_API_URL}/clientes/${clienteId}/archivos/${a.id}/download`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/30 hover:text-[#c9a84c] transition-colors">
                      <Download size={13} /> Descargar
                    </a>
                  )}
                  <button
                    onClick={() => { if (confirm('¿Eliminar este archivo?')) eliminar.mutate(a.id); }}
                    className="text-slate-200 dark:text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal subir */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 dark:text-white font-semibold text-sm">Subir recurso al cliente</h2>
                <button onClick={resetModal} className="text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
              </div>

              {/* Modo */}
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/[0.05] rounded-xl">
                {['archivo','link'].map(m => (
                  <button key={m} onClick={() => setModo(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      modo === m
                        ? 'bg-white dark:bg-white/[0.10] shadow-sm text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-white/40'
                    }`}>
                    {m === 'archivo' ? <><Upload size={11} /> Archivo</> : <><Link2 size={11} /> Enlace</>}
                  </button>
                ))}
              </div>

              {modo === 'archivo' ? (
                <div
                  className="border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl p-5 text-center cursor-pointer hover:border-[#c9a84c]/40 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {archivo ? (
                    <div className="flex items-center gap-3">
                      <FileIcon mime={archivo.type} />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-white/70 truncate">{archivo.name}</p>
                        <p className="text-xs text-slate-400 dark:text-white/30">{formatSize(archivo.size)}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setArchivo(null); }} className="text-slate-300 dark:text-white/20 hover:text-red-400"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="mx-auto text-slate-300 dark:text-white/20 mb-1.5" />
                      <p className="text-sm text-slate-400 dark:text-white/30">Clic para seleccionar</p>
                      <p className="text-xs text-slate-300 dark:text-white/20 mt-0.5">PDF, imagen, Word, Excel, ZIP — máx. 20 MB</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" className="hidden"
                    onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-white/40 mb-1.5">URL del recurso *</label>
                  <input type="url" value={form.url_externa} onChange={e => set('url_externa', e.target.value)}
                    placeholder="https://drive.google.com/..." className={inputCls} />
                </div>
              )}

              <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
                placeholder="Nombre del recurso (opcional)" className={inputCls} />
              <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                rows={2} placeholder="Descripción (opcional)" className={`${inputCls} resize-none`} />

              <div className="flex gap-2 pt-1">
                <button onClick={resetModal} className="flex-1 py-2 rounded-lg text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleSubir}
                  disabled={subir.isPending || (modo === 'archivo' ? !archivo : !form.url_externa)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg py-2 transition-all"
                >
                  {subir.isPending && <Loader2 size={13} className="animate-spin" />}
                  Subir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
