import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, FileText, Image, Download, Loader2, Plus, Link2,
  Upload, X, Trash2, ExternalLink, File, FileSpreadsheet, Archive,
  User, ShieldCheck, ZoomIn,
} from 'lucide-react';
import { useArchivos, useSubirArchivo, useEliminarArchivo } from '../../hooks/useClienteDetalle';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function FileIcon({ mime, urlExterna, size = 24 }) {
  if (!mime && urlExterna) return <Link2 size={size} className="text-blue-400" />;
  if (mime?.startsWith('image/'))    return <Image size={size} className="text-violet-400" />;
  if (mime === 'application/pdf')    return <FileText size={size} className="text-red-400" />;
  if (mime?.includes('spreadsheet') || mime?.includes('excel'))
                                     return <FileSpreadsheet size={size} className="text-emerald-400" />;
  if (mime?.includes('zip'))         return <Archive size={size} className="text-amber-400" />;
  return <File size={size} className="text-slate-400" />;
}

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

export default function TabRecursos({ clienteId }) {
  const fileRef = useRef(null);
  const { data: archivos = [], isLoading } = useArchivos(clienteId);
  const subir    = useSubirArchivo(clienteId);
  const eliminar = useEliminarArchivo(clienteId);

  const [filtro,   setFiltro]   = useState('todos');
  const [modal,    setModal]    = useState(false);
  const [modo,     setModo]     = useState('archivo');
  const [form,     setForm]     = useState({ nombre: '', descripcion: '', url_externa: '' });
  const [archivo,  setArchivo]  = useState(null);
  const [lightbox, setLightbox] = useState(null); // archivo object
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const lista = archivos.filter(a =>
    filtro === 'todos'   ? true :
    filtro === 'cliente' ? a.subido_por === 'cliente' :
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
    <div className="max-w-3xl space-y-5">
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

      {/* Grid de cards */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {lista.map(a => {
            const esImagen  = a.mime_type?.startsWith('image/');
            const esLink    = !!a.url_externa;
            const esCliente = a.subido_por === 'cliente';
            const url       = a.url?.replace('://www.', '://');

            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative flex flex-col bg-white dark:bg-white/[0.03] border rounded-2xl overflow-hidden transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.05] ${
                  esCliente
                    ? 'border-blue-100 dark:border-blue-500/20'
                    : 'border-slate-100 dark:border-white/[0.07]'
                }`}
              >
                {/* Thumbnail / preview area */}
                <div className="relative w-full aspect-[4/3] bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center overflow-hidden">
                  {esImagen && url ? (
                    <>
                      <img src={url} alt={a.nombre} className="w-full h-full object-cover" />
                      {/* hover overlay */}
                      <button
                        onClick={() => setLightbox(a)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
                      >
                        <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </button>
                    </>
                  ) : (
                    <FileIcon mime={a.mime_type} urlExterna={a.url_externa} size={32} />
                  )}

                  {/* Badge cliente */}
                  {esCliente && (
                    <span className="absolute top-2 left-2 text-[9px] bg-blue-500/90 text-white rounded-full px-1.5 py-0.5 flex items-center gap-0.5 font-medium">
                      <User size={7} /> cliente
                    </span>
                  )}

                  {/* Botón eliminar */}
                  <button
                    onClick={() => { if (confirm('¿Eliminar este archivo?')) eliminar.mutate(a.id); }}
                    className="absolute top-2 right-2 p-1 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                {/* Info + acciones */}
                <div className="flex flex-col gap-1 px-3 py-2.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white/90 truncate leading-tight">{a.nombre}</p>
                  {a.descripcion && (
                    <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{a.descripcion}</p>
                  )}
                  <p className="text-[10px] text-slate-300 dark:text-white/20 leading-tight">
                    {esLink ? 'Enlace' : (a.mime_type ?? 'Archivo')}
                    {a.size_bytes ? ` · ${formatSize(a.size_bytes)}` : ''}
                  </p>

                  {/* Acción */}
                  <div className="mt-1">
                    {esLink ? (
                      <a
                        href={a.url_externa} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 font-medium transition-colors"
                      >
                        <ExternalLink size={11} /> Abrir enlace
                      </a>
                    ) : (
                      <a
                        href={url}
                        download={a.nombre_original ?? a.nombre}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-white/30 hover:text-[#c9a84c] font-medium transition-colors"
                      >
                        <Download size={11} /> Descargar
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex items-center justify-between w-full max-w-4xl mb-3 px-1"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-white/70 text-sm font-medium truncate max-w-xs">{lightbox.nombre}</p>
              <div className="flex items-center gap-2">
                <a
                  href={lightbox.url?.replace('://www.', '://')}
                  download={lightbox.nombre_original ?? lightbox.nombre}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg px-3 py-2 transition-all"
                  onClick={e => e.stopPropagation()}
                >
                  <Download size={13} /> Descargar
                </a>
                <button
                  onClick={() => setLightbox(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>

            {/* Imagen */}
            <motion.img
              key={lightbox.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              src={lightbox.url?.replace('://www.', '://')}
              alt={lightbox.nombre}
              className="relative z-10 max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />

            {/* Meta */}
            {lightbox.size_bytes && (
              <p className="relative z-10 mt-3 text-xs text-white/30">
                {formatSize(lightbox.size_bytes)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal subir ── */}
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
