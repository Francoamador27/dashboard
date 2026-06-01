import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderOpen, FileText, Image, Download, Loader2, Plus, Link2,
  Upload, X, Trash2, ExternalLink, File, FileSpreadsheet, Archive,
} from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function FileIcon({ mime, url }) {
  if (!mime && url) return <Link2 size={18} className="text-blue-500" />;
  if (mime?.startsWith('image/'))     return <Image size={18} className="text-violet-500" />;
  if (mime === 'application/pdf')     return <FileText size={18} className="text-red-500" />;
  if (mime?.includes('spreadsheet') || mime?.includes('excel'))
                                      return <FileSpreadsheet size={18} className="text-emerald-500" />;
  if (mime?.includes('zip') || mime?.includes('compressed'))
                                      return <Archive size={18} className="text-amber-500" />;
  return <File size={18} className="text-slate-400" />;
}

const ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip';

export default function PortalArchivos() {
  const { cliente } = useAuthStore();
  const qc = useQueryClient();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';
  const fileRef = useRef(null);

  const [tab, setTab]               = useState('recibidos'); // 'recibidos' | 'mis'
  const [modalOpen, setModalOpen]   = useState(false);
  const [modo, setModo]             = useState('archivo');   // 'archivo' | 'link'
  const [nombre, setNombre]         = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlExterna, setUrlExterna] = useState('');
  const [archivo, setArchivo]       = useState(null);
  const [error, setError]           = useState('');

  const { data: archivos = [], isLoading } = useQuery({
    queryKey: ['portal-archivos'],
    queryFn: () => api.get('/portal/archivos').then(r => r.data),
  });

  const subir = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (nombre)      fd.append('nombre', nombre);
      if (descripcion) fd.append('descripcion', descripcion);
      if (modo === 'archivo' && archivo) {
        fd.append('archivo', archivo);
      } else {
        fd.append('url_externa', urlExterna);
      }
      return api.post('/portal/recursos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-archivos'] });
      resetModal();
    },
    onError: (e) => setError(e.response?.data?.message ?? 'Error al subir.'),
  });

  const eliminar = useMutation({
    mutationFn: (id) => api.delete(`/portal/recursos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-archivos'] }),
  });

  const resetModal = () => {
    setModalOpen(false);
    setModo('archivo');
    setNombre(''); setDescripcion(''); setUrlExterna(''); setArchivo(null); setError('');
  };

  const recibidos = archivos.filter(a => a.subido_por === 'admin');
  const propios   = archivos.filter(a => a.subido_por === 'cliente');
  const lista     = tab === 'recibidos' ? recibidos : propios;

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      tab === t ? 'text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
    }`;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Recursos</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Archivos, imágenes y links compartidos</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          <Plus size={15} /> Compartir recurso
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        <button onClick={() => setTab('recibidos')} className={tabCls('recibidos')} style={tab === 'recibidos' ? { backgroundColor: accentColor } : {}}>
          De Grupo Bits {recibidos.length > 0 && <span className="ml-1 opacity-60">({recibidos.length})</span>}
        </button>
        <button onClick={() => setTab('mis')} className={tabCls('mis')} style={tab === 'mis' ? { backgroundColor: accentColor } : {}}>
          Mis recursos {propios.length > 0 && <span className="ml-1 opacity-60">({propios.length})</span>}
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-100">
          <FolderOpen size={36} className="mx-auto text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium text-sm">
            {tab === 'recibidos' ? 'Todavía no hay archivos compartidos por el equipo.' : 'Aún no compartiste ningún recurso.'}
          </p>
          {tab === 'mis' && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Plus size={14} /> Compartir mi primer recurso
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-100 divide-y divide-zinc-50">
          {lista.map(a => {
            const esImagen = a.mime_type?.startsWith('image/');
            const esLink   = !!a.url_externa;
            return (
              <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50/60 transition-colors group">
                {/* Icono o thumb */}
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {esImagen && a.url
                    ? <img src={a.url} alt="" className="w-full h-full object-cover" />
                    : <FileIcon mime={a.mime_type} url={a.url_externa} />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{a.nombre}</p>
                  {a.descripcion && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{a.descripcion}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {esLink ? 'Enlace externo' : (a.mime_type ?? 'Archivo')}
                    {a.size_bytes ? ` · ${formatSize(a.size_bytes)}` : ''}
                    {' · '}{new Date(a.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>

                {/* Acción */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {esLink ? (
                    <a href={a.url_externa} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors">
                      <ExternalLink size={12} /> Abrir
                    </a>
                  ) : (
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors">
                      <Download size={12} /> Descargar
                    </a>
                  )}
                  {tab === 'mis' && (
                    <button
                      onClick={() => { if (confirm('¿Eliminar este recurso?')) eliminar.mutate(a.id); }}
                      className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal subir recurso */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={resetModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Compartir recurso</h2>
              <button onClick={resetModal} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button>
            </div>

            {/* Selector modo */}
            <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl">
              <button
                onClick={() => setModo('archivo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${modo === 'archivo' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
              >
                <Upload size={14} /> Archivo
              </button>
              <button
                onClick={() => setModo('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${modo === 'link' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
              >
                <Link2 size={14} /> Enlace
              </button>
            </div>

            {/* Campos */}
            {modo === 'archivo' ? (
              <div
                className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {archivo ? (
                  <div className="flex items-center gap-3 text-left">
                    <FileIcon mime={archivo.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{archivo.name}</p>
                      <p className="text-xs text-zinc-400">{formatSize(archivo.size)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setArchivo(null); }} className="text-zinc-300 hover:text-red-400">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-zinc-300 mb-2" />
                    <p className="text-sm font-medium text-zinc-600">Hacé clic para seleccionar un archivo</p>
                    <p className="text-xs text-zinc-400 mt-1">Imágenes, PDF, Word, Excel, ZIP — máx. 30 MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">URL del recurso *</label>
                <input
                  type="url"
                  value={urlExterna}
                  onChange={e => setUrlExterna(e.target.value)}
                  placeholder="https://drive.google.com/... o cualquier enlace"
                  className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 transition-all"
                />
                <p className="text-xs text-zinc-400 mt-1.5">Podés compartir links de Google Drive, Dropbox, Notion, Figma, etc.</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nombre (opcional)</label>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder={modo === 'link' ? 'Ej: Carpeta de fotos en Drive' : 'Nombre del archivo'}
                  className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Descripción (opcional)</label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Ej: Fotos para la campaña de verano"
                  className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 transition-all resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2">
              <button onClick={resetModal} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-all">
                Cancelar
              </button>
              <button
                onClick={() => subir.mutate()}
                disabled={subir.isPending || (modo === 'archivo' ? !archivo : !urlExterna)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                style={{ backgroundColor: accentColor }}
              >
                {subir.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {subir.isPending ? 'Enviando…' : 'Compartir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
