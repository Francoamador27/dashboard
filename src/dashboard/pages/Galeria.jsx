import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Download, RefreshCw, Copy, FolderOpen, Trash2,
  X, Loader2, ChevronDown, Filter, ZoomIn, Crop, LayoutTemplate,
} from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import {
  useAssets, useColeccionesGaleria, useDeleteAsset,
  useRegenerarAsset, useDuplicarAsset, useMoverColeccion,
  useAdaptarAsset, downloadAsset, imageUrl,
} from '../hooks/useGaleria';
import { usePlantillasAll } from '../hooks/usePlantillas';

const PLATAFORMAS = [
  { value: '', label: 'Todas' },
  { value: 'meta_feed', label: 'Meta Feed' },
  { value: 'meta_story', label: 'Story' },
  { value: 'google_display', label: 'Google Display' },
  { value: 'google_responsive', label: 'Google Responsive' },
  { value: 'highlight_cover', label: 'Highlight' },
];

const ALLOWED_TARGETS = {
  meta_feed:         ['meta_story', 'highlight_cover', 'google_display'],
  meta_story:        ['meta_feed', 'highlight_cover'],
  highlight_cover:   ['meta_feed', 'meta_story'],
  google_display:    ['meta_feed', 'google_responsive'],
  google_responsive: ['google_display', 'meta_feed'],
};

const PLATAFORMA_LABEL = {
  meta_feed: 'Meta Feed', meta_story: 'Story',
  highlight_cover: 'Highlight', google_display: 'Google Display',
  google_responsive: 'Google Responsive',
};

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'promocion', label: 'Promoción' },
  { value: 'branding', label: 'Branding' },
  { value: 'educativo', label: 'Educativo' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'oferta', label: 'Oferta' },
  { value: 'testimonial', label: 'Testimonial' },
];

const chipCls = (active) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
    active
      ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
  }`;

const selectCls =
  'bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60 transition-all appearance-none pr-7 cursor-pointer';

// ── Asset card ────────────────────────────────────────────────────────────────
function AssetCard({ asset, onClick }) {
  const isPortrait = asset.height > asset.width;
  const isLandscape = asset.width > asset.height;
  const aspectClass = isPortrait
    ? 'aspect-[9/16]'
    : isLandscape
    ? 'aspect-[16/9]'
    : 'aspect-square';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] cursor-pointer ${aspectClass} break-inside-avoid mb-3`}
      onClick={() => onClick(asset)}
    >
      <img
        src={imageUrl(asset.url)}
        alt={asset.tipo}
        loading="lazy"
        className="w-full h-full object-cover"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
        <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Client badge */}
      {asset.cliente && (
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] bg-black/60 text-white/80 rounded-md px-2 py-0.5 backdrop-blur-sm">
            {asset.cliente.nombre}
          </span>
        </div>
      )}

      {/* Platform badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] bg-black/60 text-white/70 rounded-md px-2 py-0.5 backdrop-blur-sm uppercase tracking-wide">
          {asset.plataforma?.replace('_', ' ')}
        </span>
      </div>
    </motion.div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function AssetModal({ asset, onClose, colecciones }) {
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [moverOpen, setMoverOpen] = useState(false);
  const [adaptarOpen, setAdaptarOpen] = useState(false);
  const [coleccionId, setColeccionId] = useState(asset.coleccion_id ?? '');
  const [targetPlataforma, setTargetPlataforma] = useState('');

  const eliminar = useDeleteAsset();
  const regenerar = useRegenerarAsset();
  const duplicar = useDuplicarAsset();
  const mover = useMoverColeccion();
  const adaptar = useAdaptarAsset();

  const targets = ALLOWED_TARGETS[asset.plataforma] ?? [];

  const isPortrait = asset.height > asset.width;
  const isLandscape = asset.width > asset.height;
  const imgAspect = isPortrait ? 'max-h-[80vh] w-auto' : isLandscape ? 'w-full max-h-[60vh]' : 'max-h-[70vh] w-auto';

  const handleEliminar = async () => {
    await eliminar.mutateAsync(asset.id);
    onClose();
  };

  const handleMover = async () => {
    await mover.mutateAsync({ id: asset.id, coleccion_id: coleccionId || null });
    setMoverOpen(false);
  };

  const btnCls = 'flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-left transition-all';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col lg:flex-row gap-4 max-w-5xl w-full bg-white dark:bg-[#111] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 bg-slate-100 dark:bg-black/40 flex items-center justify-center p-4 min-h-[300px]">
          <img
            src={imageUrl(asset.url)}
            alt={asset.tipo}
            className={`object-contain rounded-lg ${imgAspect}`}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/[0.06] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-white/80 capitalize">
                {asset.tipo?.replace('_', ' ')}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">
                {asset.cliente?.nombre}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Meta */}
          <div className="p-4 border-b border-slate-100 dark:border-white/[0.06] space-y-2">
            {[
              ['Plataforma', asset.plataforma?.replace(/_/g, ' ')],
              ['Objetivo', asset.objetivo],
              ['Formato', asset.formato],
              ['Colección', asset.coleccion?.nombre ?? '—'],
              ['Fecha', asset.created_at ? new Date(asset.created_at).toLocaleDateString('es-AR') : '—'],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-[11px] text-slate-400 dark:text-white/30">{k}</span>
                <span className="text-[11px] text-slate-600 dark:text-white/60 capitalize">{v}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-3 space-y-1 flex-1">
            <button
              onClick={() => downloadAsset(asset)}
              className={`${btnCls} text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04]`}
            >
              <Download size={14} className="text-slate-400 dark:text-white/30 shrink-0" />
              Descargar
            </button>

            <button
              onClick={async () => { await regenerar.mutateAsync(asset.id); onClose(); }}
              disabled={regenerar.isPending}
              className={`${btnCls} text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-50`}
            >
              {regenerar.isPending
                ? <Loader2 size={14} className="text-slate-400 dark:text-white/30 animate-spin shrink-0" />
                : <RefreshCw size={14} className="text-slate-400 dark:text-white/30 shrink-0" />}
              Regenerar
            </button>

            <button
              onClick={async () => { await duplicar.mutateAsync(asset.id); onClose(); }}
              disabled={duplicar.isPending}
              className={`${btnCls} text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-50`}
            >
              {duplicar.isPending
                ? <Loader2 size={14} className="text-slate-400 dark:text-white/30 animate-spin shrink-0" />
                : <Copy size={14} className="text-slate-400 dark:text-white/30 shrink-0" />}
              Duplicar
            </button>

            {/* Adaptar formato */}
            {targets.length > 0 && (
              <div>
                <button
                  onClick={() => { setAdaptarOpen((o) => !o); setMoverOpen(false); }}
                  className={`${btnCls} text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04]`}
                >
                  <Crop size={14} className="text-slate-400 dark:text-white/30 shrink-0" />
                  Adaptar formato
                  <ChevronDown size={11} className={`ml-auto text-slate-300 dark:text-white/20 transition-transform ${adaptarOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {adaptarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-2 pt-1 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {targets.map((t) => (
                            <button
                              key={t}
                              onClick={() => setTargetPlataforma(t)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${targetPlataforma === t ? 'bg-[#c9a84c] text-black font-semibold' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40'}`}
                            >
                              {PLATAFORMA_LABEL[t]}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={async () => {
                            if (!targetPlataforma) return;
                            await adaptar.mutateAsync({ id: asset.id, plataforma: targetPlataforma });
                            setAdaptarOpen(false);
                          }}
                          disabled={!targetPlataforma || adaptar.isPending}
                          className="w-full bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg py-1.5 transition-all disabled:opacity-50"
                        >
                          {adaptar.isPending ? <Loader2 size={11} className="inline animate-spin mr-1" /> : null}
                          Crear adaptación
                        </button>
                        {adaptar.isError && (
                          <p className="text-xs text-red-400">{adaptar.error?.response?.data?.message ?? 'Error'}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Move to collection */}
            <div>
              <button
                onClick={() => setMoverOpen((o) => !o)}
                className={`${btnCls} text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04]`}
              >
                <FolderOpen size={14} className="text-slate-400 dark:text-white/30 shrink-0" />
                Mover a colección
                <ChevronDown size={11} className={`ml-auto text-slate-300 dark:text-white/20 transition-transform ${moverOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {moverOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-2 pt-1 space-y-2">
                      <select
                        value={coleccionId}
                        onChange={(e) => setColeccionId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-white/70 outline-none focus:border-[#c9a84c]/60"
                      >
                        <option value="">Sin colección</option>
                        {(colecciones ?? []).map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre} · {c.cliente?.nombre}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleMover}
                        disabled={mover.isPending}
                        className="w-full bg-[#c9a84c] hover:bg-[#d4b560] text-black text-xs font-semibold rounded-lg py-1.5 transition-all disabled:opacity-50"
                      >
                        {mover.isPending ? <Loader2 size={11} className="inline animate-spin mr-1" /> : null}
                        Confirmar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delete */}
            {confirmarEliminar ? (
              <div className="rounded-xl border border-red-100 dark:border-red-500/10 bg-red-50 dark:bg-red-500/[0.05] p-3 space-y-2">
                <p className="text-xs text-red-600 dark:text-red-400">¿Eliminar permanentemente?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmarEliminar(false)} className="flex-1 text-xs text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 rounded-lg py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={eliminar.isPending}
                    className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg py-1.5 transition-all disabled:opacity-50"
                  >
                    {eliminar.isPending ? <Loader2 size={11} className="inline animate-spin" /> : 'Eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmarEliminar(true)}
                className={`${btnCls} text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.06]`}
              >
                <Trash2 size={14} className="shrink-0" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Plantilla card (biblioteca) ───────────────────────────────────────────────
function PlantillaLibraryCard({ plantilla }) {
  const isPortrait  = plantilla.height > plantilla.width;
  const isLandscape = plantilla.width > plantilla.height;
  const aspectClass = isPortrait ? 'aspect-[9/16]' : isLandscape ? 'aspect-[16/9]' : 'aspect-square';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] ${aspectClass} break-inside-avoid mb-3`}
    >
      {plantilla.url ? (
        <img src={imageUrl(plantilla.url)} alt={plantilla.nombre} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <LayoutTemplate size={24} className="text-slate-300 dark:text-white/10" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200" />

      {/* Info badge */}
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
        <p className="text-[11px] font-semibold text-white truncate drop-shadow">{plantilla.nombre}</p>
        {plantilla.cliente && (
          <span className="text-[10px] bg-black/60 text-white/80 rounded-md px-2 py-0.5 backdrop-blur-sm">
            {plantilla.cliente.nombre}
          </span>
        )}
      </div>

      {/* Type + platform badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end opacity-0 group-hover:opacity-100 transition-opacity">
        {plantilla.tipo && (
          <span className="text-[10px] bg-black/60 text-white/80 rounded-md px-2 py-0.5 backdrop-blur-sm capitalize">
            {plantilla.tipo}
          </span>
        )}
        {plantilla.plataforma && (
          <span className="text-[10px] bg-black/60 text-white/70 rounded-md px-2 py-0.5 backdrop-blur-sm">
            {plantilla.plataforma.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Galeria() {
  const [tab, setTab] = useState('imagenes');
  const [filters, setFilters] = useState({ cliente_id: '', plataforma: '', tipo: '', coleccion_id: '' });
  const [plantFilters, setPlantFilters] = useState({ cliente_id: '', tipo: '' });
  const [selected, setSelected] = useState(null);

  const set      = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const setPlant = (k, v) => setPlantFilters((f) => ({ ...f, [k]: v }));

  const { data: clientes }    = useClientes();
  const { data: colecciones } = useColeccionesGaleria();
  const { data, isLoading }   = useAssets(filters);
  const { data: plantillas, isLoading: plantLoading } = usePlantillasAll(plantFilters);

  const assets    = data?.data ?? [];
  const total     = data?.total ?? 0;
  const plantList = plantillas ?? [];

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      tab === t
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
    }`;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Images size={20} className="text-[#c9a84c]" />
            Biblioteca
          </h1>
          <p className="text-slate-400 dark:text-white/30 text-sm mt-1">
            {tab === 'imagenes'
              ? (total > 0 ? `${total} imagen${total !== 1 ? 'es' : ''} generada${total !== 1 ? 's' : ''}` : 'Sin imágenes aún')
              : (plantList.length > 0 ? `${plantList.length} plantilla${plantList.length !== 1 ? 's' : ''}` : 'Sin plantillas aún')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-100 dark:border-white/[0.06] pb-4">
        <button onClick={() => setTab('imagenes')} className={tabCls('imagenes')}>
          <span className="flex items-center gap-2"><Images size={13} /> Imágenes</span>
        </button>
        <button onClick={() => setTab('plantillas')} className={tabCls('plantillas')}>
          <span className="flex items-center gap-2"><LayoutTemplate size={13} /> Plantillas</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'imagenes' ? (
          <motion.div key="imagenes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-white/[0.06]">
              <Filter size={13} className="text-slate-300 dark:text-white/20 shrink-0" />

              <div className="relative">
                <select value={filters.cliente_id} onChange={(e) => set('cliente_id', e.target.value)} className={selectCls}>
                  <option value="">Todos los clientes</option>
                  {(clientes ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={filters.tipo} onChange={(e) => set('tipo', e.target.value)} className={selectCls}>
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {PLATAFORMAS.map((p) => (
                  <button key={p.value} onClick={() => set('plataforma', p.value)} className={chipCls(filters.plataforma === p.value)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={20} className="text-slate-300 dark:text-white/20 animate-spin" />
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Images size={36} className="text-slate-200 dark:text-white/10" />
                <p className="text-slate-300 dark:text-white/20 text-sm">
                  {Object.values(filters).some(Boolean) ? 'Sin resultados con estos filtros.' : 'Aún no hay imágenes generadas.'}
                </p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onClick={setSelected} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="plantillas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Plantilla filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-white/[0.06]">
              <Filter size={13} className="text-slate-300 dark:text-white/20 shrink-0" />

              <div className="relative">
                <select value={plantFilters.cliente_id} onChange={(e) => setPlant('cliente_id', e.target.value)} className={selectCls}>
                  <option value="">Todos los clientes</option>
                  {(clientes ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {[{ value: '', label: 'Todos' }, ...TIPOS].map((t) => (
                  <button key={t.value} onClick={() => setPlant('tipo', t.value)} className={chipCls(plantFilters.tipo === t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {plantLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={20} className="text-slate-300 dark:text-white/20 animate-spin" />
              </div>
            ) : plantList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <LayoutTemplate size={36} className="text-slate-200 dark:text-white/10" />
                <p className="text-slate-300 dark:text-white/20 text-sm">
                  {Object.values(plantFilters).some(Boolean) ? 'Sin plantillas con estos filtros.' : 'Aún no hay plantillas guardadas.'}
                </p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                {plantList.map((p) => (
                  <PlantillaLibraryCard key={p.id} plantilla={p} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <AssetModal
            asset={selected}
            onClose={() => setSelected(null)}
            colecciones={colecciones}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
