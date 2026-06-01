import { useState, useRef, useCallback } from 'react';
import { Images, Upload, Loader2, Trash2, Download, X, CloudUpload, Wand2 } from 'lucide-react';
import { useAssets, useDeleteAsset, useSubirAssets, imageUrl, downloadAsset } from '../../hooks/useGaleria';
import CreadorContenido from './CreadorContenido';

const PLATAFORMA_LABEL = {
  meta_feed:        'Meta Feed',
  meta_story:       'Story',
  ig_feed_portrait: 'IG Portrait',
  pmax:             'PMax',
  google_display:   'Google Display',
  google_responsive:'Google Responsive',
  highlight_cover:  'Highlight',
};

const TIPO_LABEL = {
  promocion:    'Promoción',
  branding:     'Branding',
  educativo:    'Educativo',
  institucional:'Institucional',
  oferta:       'Oferta',
  testimonial:  'Testimonial',
};

const PLATAFORMAS = [
  { value: '', label: 'Todas' },
  { value: 'meta_feed', label: 'Meta Feed' },
  { value: 'meta_story', label: 'Story' },
  { value: 'ig_feed_portrait', label: 'IG Portrait' },
  { value: 'google_display', label: 'Google Display' },
  { value: 'google_responsive', label: 'G. Responsive' },
  { value: 'highlight_cover', label: 'Highlight' },
];

const chipCls = (active) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
    active
      ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
  }`;

function AssetCard({ asset, onDelete }) {
  const url = imageUrl(asset.url);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este contenido?')) return;
    setDeleting(true);
    await onDelete(asset.id);
  };

  return (
    <div className="group relative bg-slate-100 dark:bg-white/[0.04] rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.06]">
      {url ? (
        <img
          src={url}
          alt={asset.tipo ?? 'contenido'}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full aspect-square flex items-center justify-center">
          <Images size={28} className="text-slate-300 dark:text-white/20" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <div className="flex gap-1.5 flex-wrap mb-1.5">
          {asset.plataforma && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-medium">
              {PLATAFORMA_LABEL[asset.plataforma] ?? asset.plataforma}
            </span>
          )}
          {asset.tipo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c9a84c]/40 text-[#c9a84c] font-medium">
              {TIPO_LABEL[asset.tipo] ?? asset.tipo}
            </span>
          )}
        </div>
        {asset.formato && (
          <p className="text-white/40 text-[10px]">{asset.formato}</p>
        )}

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          {url && (
            <button
              onClick={() => downloadAsset(asset)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Download size={12} className="text-white" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg bg-red-500/60 hover:bg-red-500/80 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={11} className="animate-spin text-white" /> : <Trash2 size={12} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function DropZone({ clienteId, onSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [plataforma, setPlataforma] = useState('');
  const fileRef = useRef(null);
  const subir = useSubirAssets(clienteId);

  const addFiles = useCallback((files) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) return;
    const entries = imgs.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews((prev) => [...prev, ...entries]);
  }, []);

  const removePreview = (idx) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!previews.length || subir.isPending) return;
    const fd = new FormData();
    previews.forEach(({ file }) => fd.append('archivos[]', file));
    if (plataforma) fd.append('plataforma', plataforma);

    await subir.mutateAsync(fd);
    previews.forEach(({ url }) => URL.revokeObjectURL(url));
    setPreviews([]);
    setPlataforma('');
    onSuccess?.();
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
      <div className="flex items-center gap-2">
        <CloudUpload size={15} className="text-[#c9a84c]" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-white/80">Subir contenido recibido</h3>
      </div>

      {/* Drop area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          dragging
            ? 'border-[#c9a84c] bg-[#c9a84c]/5'
            : 'border-slate-200 dark:border-white/[0.08] hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/[0.03]',
        ].join(' ')}
      >
        <Upload size={20} className="mx-auto mb-2 text-slate-300 dark:text-white/20" />
        <p className="text-slate-400 dark:text-white/30 text-xs">
          Arrastrá imágenes o <span className="text-[#c9a84c]">hacé clic para seleccionar</span>
        </p>
        <p className="text-slate-300 dark:text-white/20 text-[11px] mt-1">PNG, JPG, WEBP · múltiples archivos</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {previews.map(({ url }, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removePreview(idx); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Optional platform */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-slate-400 dark:text-white/30 shrink-0">Plataforma:</span>
            {PLATAFORMAS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlataforma(p.value)}
                className={chipCls(plataforma === p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-white/30">
              {previews.length} archivo{previews.length !== 1 ? 's' : ''} seleccionado{previews.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleUpload}
              disabled={subir.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-xs font-semibold transition-all"
            >
              {subir.isPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {subir.isPending ? 'Subiendo…' : `Subir ${previews.length} imagen${previews.length !== 1 ? 'es' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TabContenido({ clienteId }) {
  const [filtroPlatforma, setFiltroPlatforma] = useState('');
  const [creadorOpen, setCreadorOpen] = useState(false);
  const { data, isLoading } = useAssets({ cliente_id: clienteId, ...(filtroPlatforma ? { plataforma: filtroPlatforma } : {}) });
  const deleteAsset = useDeleteAsset();

  const assets = data?.data ?? [];
  const total  = data?.total ?? 0;

  return creadorOpen ? (
    <CreadorContenido onClose={() => setCreadorOpen(false)} clienteId={clienteId} />
  ) : (
    <div className="space-y-5">
      {/* Upload */}
      <DropZone clienteId={clienteId} />

      {/* Stats + filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Images size={15} className="text-[#c9a84c]" />
          <span className="text-slate-500 dark:text-white/40 text-sm">
            {total} pieza{total !== 1 ? 's' : ''} de contenido
          </span>
        </div>
        <button
          onClick={() => setCreadorOpen(true)}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
        >
          <Wand2 size={13} /> Crear contenido
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PLATAFORMAS.map((p) => (
          <button
            key={p.value}
            onClick={() => setFiltroPlatforma(p.value)}
            className={chipCls(filtroPlatforma === p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-8">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Cargando contenido…</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
          <Images size={28} className="mx-auto text-slate-200 dark:text-white/[0.1] mb-3" />
          <p className="text-slate-400 dark:text-white/30 text-sm">
            {filtroPlatforma ? 'Sin contenido para esta plataforma.' : 'Este cliente todavía no tiene contenido generado.'}
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="break-inside-avoid">
              <AssetCard asset={asset} onDelete={(id) => deleteAsset.mutate(id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
