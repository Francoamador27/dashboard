import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Download, AlertCircle, CheckCircle2,
  ImageIcon, ChevronDown, LayoutTemplate, Plus, X, Pencil, Trash2,
  ImagePlus, Save, RefreshCw, Upload,
} from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import { useGenerar, useGeneracionStatus } from '../hooks/useGenerador';
import {
  usePlantillas, useCrearPlantilla, useUpdatePlantilla,
  useDeletePlantilla, usePlantillaStatus, useAgregarLogo,
  useConfirmarPlantilla, imageUrl,
} from '../hooks/usePlantillas';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATAFORMAS = [
  { value: 'meta_feed',         label: 'Meta Feed',          size: '1080×1080', icon: '⬛' },
  { value: 'ig_feed_portrait',  label: 'IG Feed Portrait',   size: '1080×1350', icon: '📸' },
  { value: 'meta_story',        label: 'Meta Story',         size: '1080×1920', icon: '📱' },
  { value: 'pmax',              label: 'Google PMAX',        size: '960×1200',  icon: '🎯' },
  { value: 'google_display',    label: 'Google Display',     size: '1200×628',  icon: '🖥' },
  { value: 'google_responsive', label: 'Google Responsive',  size: '1200×628',  icon: '📐' },
  { value: 'highlight_cover',   label: 'Highlight Cover',    size: '1080×1080', icon: '⭕' },
];

const TIPOS = [
  { value: 'promocion',     label: 'Promoción' },
  { value: 'branding',      label: 'Branding' },
  { value: 'educativo',     label: 'Educativo' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'oferta',        label: 'Oferta' },
  { value: 'testimonial',   label: 'Testimonial' },
];

const OBJETIVOS = [
  { value: '',              label: 'Sin objetivo específico' },
  { value: 'awareness',    label: 'Awareness' },
  { value: 'conversion',   label: 'Conversión' },
  { value: 'remarketing',  label: 'Remarketing' },
  { value: 'fidelizacion', label: 'Fidelización' },
];

const CANTIDADES = [1, 2, 3, 4];

const inputCls = 'w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/20 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} appearance-none pr-8`}>
          {children}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
      </div>
    </div>
  );
}

function PlatformPicker({ value, values, onChange, multi = false }) {
  const isSelected = (v) => multi ? (values ?? []).includes(v) : value === v;

  const handleClick = (v) => {
    if (!multi) { onChange(v); return; }
    const current = values ?? [];
    if (current.includes(v)) {
      if (current.length === 1) return; // mínimo 1 seleccionada
      onChange(current.filter((x) => x !== v));
    } else {
      onChange([...current, v]);
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-500 dark:text-white/50">
          {multi ? 'Plataformas' : 'Plataforma'}
        </label>
        {multi && (
          <span className="text-[10px] text-slate-300 dark:text-white/20">Podés elegir varias</span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PLATAFORMAS.map((p) => {
          const selected = isSelected(p.value);
          return (
            <button key={p.value} type="button" onClick={() => handleClick(p.value)}
              className={`relative flex flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all border ${
                selected
                  ? 'border-[#c9a84c] bg-[#c9a84c]/[0.06] dark:bg-[#c9a84c]/[0.08]'
                  : 'border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/[0.12]'
              }`}>
              {multi && selected && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#c9a84c] flex items-center justify-center">
                  <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M1 2.5L2.8 4L6 1" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
              <span className="text-base leading-none">{p.icon}</span>
              <span className={`text-[11px] font-semibold mt-1 leading-tight ${selected ? 'text-[#c9a84c]' : 'text-slate-700 dark:text-white/70'}`}>{p.label}</span>
              <span className="text-[10px] text-slate-400 dark:text-white/25 font-mono">{p.size}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Generated image card ─────────────────────────────────────────────────────

const PLATAFORMA_ICON = {
  meta_feed:         '⬛',
  ig_feed_portrait:  '📸',
  meta_story:        '📱',
  pmax:              '🎯',
  google_display:    '🖥',
  google_responsive: '📐',
  highlight_cover:   '⭕',
};

function AssetCard({ asset }) {
  const isPortrait  = asset.height > asset.width;
  const isLandscape = asset.width > asset.height;
  const aspectClass = isPortrait ? 'aspect-[9/16]' : isLandscape ? 'aspect-[16/9]' : 'aspect-square';
  const plat        = PLATAFORMAS.find((p) => p.value === asset.plataforma);

  return (
    <div className={`relative bg-slate-100 dark:bg-white/[0.04] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06] ${aspectClass}`}>
      {asset.plataforma && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/50 text-white/80 text-[10px] rounded-md px-1.5 py-0.5 backdrop-blur-sm pointer-events-none">
          <span>{PLATAFORMA_ICON[asset.plataforma] ?? ''}</span>
          <span>{plat?.label ?? asset.plataforma.replace(/_/g, ' ')}</span>
        </div>
      )}
      {asset.status === 'completed' && asset.url ? (
        <>
          <img src={imageUrl(asset.url)} alt="Generated" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all group flex items-end justify-end p-3">
            <a href={imageUrl(asset.url)} download
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-xs font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Download size={11} /> Descargar
            </a>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
          {(asset.status === 'pending' || asset.status === 'processing') && (
            <><Loader2 size={18} className="text-slate-300 dark:text-white/20 animate-spin" />
            <span className="text-xs text-slate-400 dark:text-white/30 text-center">{asset.status === 'pending' ? 'En cola…' : 'Generando…'}</span></>
          )}
          {asset.status === 'failed' && (
            <><AlertCircle size={18} className="text-red-400" />
            <span className="text-xs text-red-400 text-center">{asset.error_message ?? 'Error al generar'}</span></>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Logo compositor modal ────────────────────────────────────────────────────

function LogoCompositorModal({ plantilla, cliente, onClose, onSaved }) {
  const containerRef = useRef(null);
  const [pos, setPos]         = useState({ x: 0.05, y: 0.05, w: 0.25 });
  const [logoAspect, setLogoAspect] = useState(1);
  const agregarLogo = useAgregarLogo(cliente.id);

  const base    = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'https://dashboard.test';
  const imgUrl  = imageUrl(plantilla.url);
  const logoUrl = `${base}/storage/${cliente.logo_path}`;
  const aspect  = plantilla.width && plantilla.height
    ? `${plantilla.width} / ${plantilla.height}`
    : '1 / 1';

  const startDrag = useCallback((e) => {
    e.preventDefault();
    const rect     = containerRef.current.getBoundingClientRect();
    const startX   = e.clientX;
    const startY   = e.clientY;
    const startPos = { ...pos };

    const onMove = (me) => {
      const dx = (me.clientX - startX) / rect.width;
      const dy = (me.clientY - startY) / rect.height;
      setPos((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(1 - prev.w, startPos.x + dx)),
        y: Math.max(0, Math.min(0.9, startPos.y + dy)),
      }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  const startResize = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect   = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startW = pos.w;

    const onMove = (me) => {
      const dw = (me.clientX - startX) / rect.width;
      setPos((prev) => ({ ...prev, w: Math.max(0.05, Math.min(0.8, startW + dw)) }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos.w]);

  const handleSave = async () => {
    await agregarLogo.mutateAsync({
      plantillaId: plantilla.id,
      x_percent:   +(pos.x * 100).toFixed(2),
      y_percent:   +(pos.y * 100).toFixed(2),
      w_percent:   +(pos.w * 100).toFixed(2),
    });
    onSaved();
    onClose();
  };

  // logo height as fraction of container height (for resize handle position)
  const plantillaAspect = plantilla.width && plantilla.height
    ? plantilla.height / plantilla.width
    : 1;
  const logoH = pos.w * logoAspect / plantillaAspect;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white/90">Posicionar logo</h3>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">
              Arrastrá el logo para moverlo · usá el handle para redimensionar
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-5">
          <div
            ref={containerRef}
            className="relative w-full select-none overflow-hidden rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]"
            style={{ aspectRatio: aspect }}
          >
            <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />

            {/* Draggable logo */}
            <img
              src={logoUrl}
              alt="Logo"
              className="absolute cursor-move drop-shadow-lg"
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, width: `${pos.w * 100}%` }}
              onLoad={(e) => setLogoAspect(e.target.naturalHeight / e.target.naturalWidth)}
              onMouseDown={startDrag}
              draggable={false}
            />

            {/* Resize handle — bottom-right corner of logo */}
            <div
              className="absolute z-10 w-3.5 h-3.5 bg-white border-2 border-[#c9a84c] rounded-full cursor-se-resize shadow"
              style={{
                left: `${(pos.x + pos.w) * 100}%`,
                top:  `${(pos.y + logoH) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={startResize}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={agregarLogo.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all">
            {agregarLogo.isPending
              ? <><Loader2 size={13} className="animate-spin" /> Guardando…</>
              : <><ImagePlus size={13} /> Guardar con logo</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Preview modal (shown after generation, before saving) ───────────────────

function PreviewModal({ plantilla, clienteId, onConfirmed, onDiscarded, onRegenerate }) {
  const confirmar = useConfirmarPlantilla(clienteId);
  const eliminar  = useDeletePlantilla(clienteId);

  const handleGuardar = async () => {
    await confirmar.mutateAsync(plantilla.id);
    onConfirmed();
  };

  const handleDescartar = async () => {
    await eliminar.mutateAsync(plantilla.id);
    onDiscarded();
  };

  const aspect = plantilla.width && plantilla.height
    ? `${plantilla.width} / ${plantilla.height}`
    : '1 / 1';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white/90">{plantilla.nombre}</h3>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">¿Guardás esta imagen?</p>
          </div>
        </div>

        {/* Image */}
        <div className="p-4">
          <div className="w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-white/[0.04]" style={{ aspectRatio: aspect }}>
            <img src={imageUrl(plantilla.url)} alt={plantilla.nombre} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 pb-4">
          <button onClick={handleDescartar} disabled={eliminar.isPending || confirmar.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-all disabled:opacity-50">
            {eliminar.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Descartar
          </button>
          <button onClick={onRegenerate} disabled={eliminar.isPending || confirmar.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all disabled:opacity-50">
            <RefreshCw size={13} />
            Regenerar
          </button>
          <button onClick={handleGuardar} disabled={confirmar.isPending || eliminar.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all">
            {confirmar.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Plantilla status poller card ─────────────────────────────────────────────

function PlantillaCard({ plantilla, clienteId, cliente, onDelete, onEditDesc, onPreview }) {
  const pending = plantilla.status === 'pending' || plantilla.status === 'processing';
  const { data: live } = usePlantillaStatus(clienteId, plantilla.id, pending);
  const [compositor, setCompositor] = useState(false);
  const [imgVersion, setImgVersion] = useState(0);

  const status     = live?.status ?? plantilla.status;
  const url        = live?.url ?? plantilla.url;
  const isPreview  = status === 'preview';
  const imgSrc     = url ? `${imageUrl(url)}${imgVersion ? `?v=${imgVersion}` : ''}` : null;
  const canAddLogo = status === 'completed' && url && cliente?.logo_path;

  return (
    <>
      <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        {/* Image preview */}
        <div className="aspect-square bg-slate-50 dark:bg-white/[0.02] relative">
          {(status === 'completed' || isPreview) && imgSrc ? (
            <img src={imgSrc} alt={plantilla.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {(status === 'pending' || status === 'processing')
                ? <Loader2 size={18} className="text-slate-300 dark:text-white/20 animate-spin" />
                : status === 'failed'
                ? <AlertCircle size={18} className="text-red-400" />
                : <LayoutTemplate size={18} className="text-slate-200 dark:text-white/10" />
              }
            </div>
          )}

          {/* Preview badge + click to open */}
          {isPreview && (
            <button onClick={() => onPreview({ ...plantilla, url, status })}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 hover:bg-black/60 transition-all">
              <span className="bg-amber-400 text-black text-[10px] font-bold px-2.5 py-1 rounded-full">Vista previa</span>
              <span className="text-white/80 text-xs">Click para guardar o descartar</span>
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap pointer-events-none">
            {plantilla.tipo && (
              <span className="text-[10px] bg-black/50 text-white/80 rounded px-1.5 py-0.5 backdrop-blur-sm capitalize">
                {plantilla.tipo}
              </span>
            )}
            {plantilla.plataforma && (
              <span className="text-[10px] bg-black/50 text-white/70 rounded px-1.5 py-0.5 backdrop-blur-sm">
                {plantilla.plataforma.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <p className="text-xs font-semibold text-slate-800 dark:text-white/90 truncate">{plantilla.nombre}</p>
          {plantilla.descripcion_visual && (
            <p className="text-[11px] text-slate-400 dark:text-white/30 line-clamp-2">{plantilla.descripcion_visual}</p>
          )}

          {canAddLogo && (
            <button onClick={() => setCompositor(true)}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#c9a84c] border border-[#c9a84c]/30 hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/[0.05] rounded-lg py-1.5 transition-all">
              <ImagePlus size={11} /> Agregar logo
            </button>
          )}

          {isPreview ? (
            <div className="flex gap-2 pt-0.5">
              <button onClick={() => onPreview({ ...plantilla, url, status })}
                className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-[#c9a84c] border border-[#c9a84c]/30 hover:border-[#c9a84c]/60 rounded-lg py-1.5 transition-all">
                <Save size={10} /> Guardar
              </button>
              <button onClick={() => onDelete(plantilla.id)}
                className="flex-1 flex items-center justify-center gap-1 text-[11px] text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/[0.06] rounded-lg py-1.5 transition-all">
                <Trash2 size={10} /> Descartar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-0.5">
              <button onClick={() => onEditDesc(plantilla)}
                className="text-[11px] text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 transition-colors">
                <Pencil size={10} /> Editar desc.
              </button>
              <span className="text-slate-200 dark:text-white/10">·</span>
              <button onClick={() => onDelete(plantilla.id)}
                className="text-[11px] text-red-400 hover:text-red-500 transition-colors flex items-center gap-1">
                <Trash2 size={10} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {compositor && (
          <LogoCompositorModal
            plantilla={{ ...plantilla, url, width: plantilla.width, height: plantilla.height }}
            cliente={cliente}
            onClose={() => setCompositor(false)}
            onSaved={() => setImgVersion(Date.now())}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Imagen de referencia uploader ───────────────────────────────────────────

function ImagenReferenciaUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const preview  = value ? URL.createObjectURL(value) : null;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
      <div className="flex items-center gap-2">
        <Upload size={13} className="text-slate-400 dark:text-white/30" />
        <label className="text-xs font-medium text-slate-500 dark:text-white/50">
          Imagen de referencia <span className="text-slate-300 dark:text-white/20 font-normal">(opcional)</span>
        </label>
      </div>

      {value ? (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl p-3">
          <img src={preview} alt="Referencia" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-white/10" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-white/70 truncate">{value.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">
              La IA tomará inspiración de esta imagen
            </p>
          </div>
          <button onClick={() => onChange(null)}
            className="shrink-0 text-slate-400 dark:text-white/30 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] py-6 cursor-pointer hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/[0.02] transition-all"
        >
          <ImageIcon size={20} className="text-slate-300 dark:text-white/15" />
          <p className="text-xs text-slate-400 dark:text-white/30 text-center">
            Arrastrá o <span className="text-[#c9a84c]">seleccioná</span> una imagen de referencia
          </p>
          <p className="text-[11px] text-slate-300 dark:text-white/20">JPG, PNG, WEBP · máx 10 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ─── Tab: Generar contenido ───────────────────────────────────────────────────

function TabGenerar({ clientes }) {
  const [form, setForm] = useState({
    cliente_id: '', plataformas: ['meta_feed'], tipo: 'branding',
    objetivo: '', texto_principal: '', cta: '', prompt_adicional: '',
    cantidad: 2, plantilla_id: '', imagen_referencia: null,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generar = useGenerar();
  const { assets, polling, startPolling } = useGeneracionStatus();

  // Todas las plantillas completadas del cliente, independiente del tipo
  const { data: plantillas } = usePlantillas(form.cliente_id || null);
  const plantillasDisponibles = (plantillas ?? []).filter((p) => p.status === 'completed');

  const handleGenerar = async () => {
    if (!form.cliente_id || form.plataformas.length === 0) return;
    const result = await generar.mutateAsync({
      ...form,
      objetivo:     form.objetivo || undefined,
      plantilla_id: form.plantilla_id || undefined,
    });
    startPolling(result.generacion_id, result.assets ?? []);
  };

  const selectedPlantilla = plantillasDisponibles.find((p) => String(p.id) === String(form.plantilla_id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
      {/* Form */}
      <div className="space-y-4">
        {/* Cliente */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none">
          <SelectField label="Cliente" value={form.cliente_id} onChange={(v) => { set('cliente_id', v); set('plantilla_id', ''); }}>
            <option value="">Seleccioná un cliente…</option>
            {(clientes ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </SelectField>
        </div>

        {/* Plataformas */}
        <PlatformPicker multi values={form.plataformas} onChange={(vs) => { set('plataformas', vs); set('plantilla_id', ''); }} />

        {/* Tipo + Objetivo */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Tipo de pieza" value={form.tipo} onChange={(v) => { set('tipo', v); set('plantilla_id', ''); }}>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </SelectField>
            <SelectField label="Objetivo" value={form.objetivo} onChange={(v) => set('objetivo', v)}>
              {OBJETIVOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </SelectField>
          </div>
        </div>

        {/* Plantilla base — opcional */}
        {form.cliente_id && plantillasDisponibles.length > 0 && (
          <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate size={13} className="text-[#c9a84c]" />
              <label className="text-xs font-medium text-slate-500 dark:text-white/50">Plantilla base <span className="text-slate-300 dark:text-white/20 font-normal">(opcional)</span></label>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => set('plantilla_id', '')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!form.plantilla_id ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40'}`}
              >
                Sin plantilla
              </button>
              {plantillasDisponibles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => set('plantilla_id', String(p.id))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    String(form.plantilla_id) === String(p.id)
                      ? 'border-[#c9a84c] bg-[#c9a84c]/[0.06] text-[#c9a84c]'
                      : 'border-slate-200 dark:border-white/[0.07] text-slate-500 dark:text-white/40 hover:border-slate-300 dark:hover:border-white/[0.12]'
                  }`}
                >
                  {p.url && (
                    <img src={imageUrl(p.url)} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                  )}
                  {p.nombre}
                </button>
              ))}
            </div>
            {selectedPlantilla && (
              <p className="text-[11px] text-slate-400 dark:text-white/30 bg-slate-50 dark:bg-white/[0.03] rounded-lg px-3 py-2">
                {selectedPlantilla.descripcion_visual ?? 'Sin descripción visual. Editala en la tab Plantillas para mejorar el resultado.'}
              </p>
            )}
          </div>
        )}

        {/* Texto + CTA */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Texto principal</label>
            <input value={form.texto_principal} onChange={(e) => set('texto_principal', e.target.value)} placeholder="Ej: 20% OFF en todos los servicios este mes" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Call to action</label>
            <input value={form.cta} onChange={(e) => set('cta', e.target.value)} placeholder="Ej: Reservá tu turno" className={inputCls} />
          </div>
        </div>

        {/* Prompt adicional */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none">
          <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
            Instrucciones adicionales <span className="text-slate-300 dark:text-white/20 font-normal">(opcional)</span>
          </label>
          <textarea value={form.prompt_adicional} onChange={(e) => set('prompt_adicional', e.target.value)} rows={3}
            placeholder="Ej: Fondo con textura de mármol…" className={`${inputCls} resize-none`} />
        </div>

        {/* Imagen de referencia */}
        <ImagenReferenciaUploader
          value={form.imagen_referencia}
          onChange={(f) => set('imagen_referencia', f)}
        />

        {/* Cantidad + generar */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-white/50 mb-2">
                Variantes por plataforma
                {form.plataformas.length > 1 && (
                  <span className="ml-1.5 text-slate-300 dark:text-white/20 font-normal">
                    → {form.cantidad * form.plataformas.length} en total
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                {CANTIDADES.map((n) => (
                  <button key={n} type="button" onClick={() => set('cantidad', n)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${form.cantidad === n ? 'bg-[#c9a84c] text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerar} disabled={!form.cliente_id || form.plataformas.length === 0 || generar.isPending || polling}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black font-semibold rounded-xl px-6 py-3 transition-all text-sm">
              {(generar.isPending || polling) && <Loader2 size={14} className="animate-spin" />}
              <Sparkles size={14} /> Generar
            </button>
          </div>
          {generar.isError && (
            <p className="text-red-500 text-xs mt-3">{generar.error?.response?.data?.message ?? 'Error al iniciar la generación.'}</p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="lg:sticky lg:top-6">
        <AnimatePresence mode="wait">
          {(assets.length > 0 || polling) ? (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-3">
                {!assets.every((a) => ['completed', 'failed'].includes(a.status))
                  ? <><Loader2 size={13} className="text-[#c9a84c] animate-spin shrink-0" /><span className="text-sm text-slate-600 dark:text-white/60">Generando {assets.filter((a) => a.status === 'completed').length}/{assets.length}…</span></>
                  : <><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /><span className="text-sm text-slate-600 dark:text-white/60">{assets.filter((a) => a.status === 'completed').length} de {assets.length} generada{assets.length !== 1 ? 's' : ''}</span></>
                }
              </div>
              <div className="grid grid-cols-2 gap-3">
                {assets.map((a) => <AssetCard key={a.id} asset={a} />)}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 py-20 bg-white dark:bg-white/[0.03] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
              <ImageIcon size={32} className="text-slate-200 dark:text-white/10" />
              <p className="text-slate-300 dark:text-white/20 text-sm text-center max-w-[200px]">Las imágenes aparecerán aquí</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab: Plantillas ──────────────────────────────────────────────────────────

function EditDescModal({ plantilla, clienteId, onClose }) {
  const update = useUpdatePlantilla(clienteId);
  const [desc, setDesc] = useState(plantilla.descripcion_visual ?? '');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#111] rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white/90">Descripción visual</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <p className="text-xs text-slate-400 dark:text-white/30">Esta descripción se inyecta en el prompt cuando usás esta plantilla como base en DALL·E 3.</p>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4}
          placeholder="Ej: Composición centrada, logo arriba a la derecha, fondo oscuro texturizado, texto dorado centrado, márgenes amplios…"
          className={`${inputCls} resize-none`} />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancelar
          </button>
          <button onClick={async () => { await update.mutateAsync({ id: plantilla.id, descripcion_visual: desc }); onClose(); }}
            disabled={update.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] text-black text-sm font-semibold rounded-xl py-2 transition-all disabled:opacity-50">
            {update.isPending && <Loader2 size={13} className="animate-spin" />} Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TabPlantillas({ clientes }) {
  const [clienteId, setClienteId] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [previewing, setPreviewing] = useState(null); // plantilla in preview state

  const { data: plantillas, isLoading } = usePlantillas(clienteId || null);
  const crear = useCrearPlantilla(clienteId);
  const eliminar = useDeletePlantilla(clienteId);

  const [newForm, setNewForm] = useState({ nombre: '', tipo: '', plataforma: 'meta_feed', descripcion_visual: '', imagen_referencia: null });
  const setNF = (k, v) => setNewForm((f) => ({ ...f, [k]: v }));

  const filtradas = (plantillas ?? []).filter((p) => !tipoFiltro || p.tipo === tipoFiltro);

  const handleCrear = async () => {
    if (!clienteId || !newForm.nombre) return;
    const result = await crear.mutateAsync(newForm);
    setCreando(false);
    setNewForm({ nombre: '', tipo: '', plataforma: 'meta_feed', descripcion_visual: '', imagen_referencia: null });
    if (result.status === 'preview') {
      setPreviewing(result);
    }
  };

  const handleRegenerate = async () => {
    if (!previewing) return;
    // Discard current preview and open create form again
    eliminar.mutate(previewing.id);
    setPreviewing(null);
    setCreando(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
            className={`${inputCls} !py-1.5 !text-xs appearance-none pr-7 w-44`}>
            <option value="">Todos los clientes</option>
            {(clientes ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['', ...TIPOS.map((t) => t.value)].map((t) => (
            <button key={t} onClick={() => setTipoFiltro(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tipoFiltro === t ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08]'}`}>
              {t === '' ? 'Todos' : TIPOS.find((tp) => tp.value === t)?.label}
            </button>
          ))}
        </div>
        <button onClick={() => setCreando(true)} disabled={!clienteId}
          className="ml-auto flex items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-40 text-black text-xs font-semibold rounded-lg px-3.5 py-2 transition-all">
          <Plus size={12} /> Nueva plantilla
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creando && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-white/70 flex items-center gap-2">
              <LayoutTemplate size={13} className="text-[#c9a84c]" /> Nueva plantilla para {clientes?.find((c) => String(c.id) === String(clienteId))?.nombre}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nombre *</label>
                <input value={newForm.nombre} onChange={(e) => setNF('nombre', e.target.value)} placeholder="Ej: Plantilla promo verano" className={inputCls} />
              </div>
              <SelectField label="Tipo de contenido" value={newForm.tipo} onChange={(v) => setNF('tipo', v)}>
                <option value="">Sin tipo específico</option>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </SelectField>
            </div>
            <PlatformPicker value={newForm.plataforma} onChange={(v) => setNF('plataforma', v)} />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
                Descripción visual <span className="text-slate-300 dark:text-white/20 font-normal">(se inyecta en prompts futuros)</span>
              </label>
              <textarea value={newForm.descripcion_visual} onChange={(e) => setNF('descripcion_visual', e.target.value)} rows={3}
                placeholder="Ej: Composición centrada, fondo oscuro con textura, logo arriba a la derecha, tipografía dorada, márgenes amplios…"
                className={`${inputCls} resize-none`} />
            </div>
            <ImagenReferenciaUploader
              value={newForm.imagen_referencia}
              onChange={(f) => setNF('imagen_referencia', f)}
            />
            <div className="flex gap-3">
              <button onClick={() => setCreando(false)} className="flex-1 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                Cancelar
              </button>
              <button onClick={handleCrear} disabled={!newForm.nombre || crear.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-2.5 transition-all">
                {crear.isPending && <Loader2 size={13} className="animate-spin" />}
                <Sparkles size={13} /> Generar plantilla
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-12"><Loader2 size={14} className="animate-spin" /><span className="text-sm">Cargando…</span></div>
      ) : !clienteId ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <LayoutTemplate size={32} className="text-slate-200 dark:text-white/10" />
          <p className="text-slate-300 dark:text-white/20 text-sm">Seleccioná un cliente para ver sus plantillas.</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
          <LayoutTemplate size={32} className="mx-auto mb-3 text-slate-200 dark:text-white/10" />
          <p className="text-slate-300 dark:text-white/20 text-sm">Sin plantillas aún.</p>
          <button onClick={() => setCreando(true)} className="mt-3 text-sm text-[#c9a84c] hover:underline">Crear primera plantilla →</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtradas.map((p) => (
            <PlantillaCard key={p.id} plantilla={p} clienteId={clienteId}
              cliente={clientes?.find((c) => String(c.id) === String(clienteId))}
              onDelete={(id) => eliminar.mutate(id)}
              onEditDesc={(p) => setEditando(p)}
              onPreview={(p) => setPreviewing(p)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {editando && <EditDescModal plantilla={editando} clienteId={clienteId} onClose={() => setEditando(null)} />}
        {previewing && (
          <PreviewModal
            plantilla={previewing}
            clienteId={clienteId}
            onConfirmed={() => setPreviewing(null)}
            onDiscarded={() => setPreviewing(null)}
            onRegenerate={handleRegenerate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Generador() {
  const [tab, setTab] = useState('generar');
  const { data: clientes } = useClientes();

  const tabCls = (t) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      tab === t
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
        : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
    }`;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <Sparkles size={20} className="text-[#c9a84c]" />
          Generador IA
        </h1>
        <p className="text-slate-400 dark:text-white/30 text-sm mt-1">
          Generá piezas visuales para tus clientes usando inteligencia artificial.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-7 border-b border-slate-100 dark:border-white/[0.06] pb-4">
        <button onClick={() => setTab('generar')} className={tabCls('generar')}>
          <span className="flex items-center gap-2"><Sparkles size={13} /> Generar contenido</span>
        </button>
        <button onClick={() => setTab('plantillas')} className={tabCls('plantillas')}>
          <span className="flex items-center gap-2"><LayoutTemplate size={13} /> Plantillas</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'generar' ? (
          <motion.div key="generar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TabGenerar clientes={clientes} />
          </motion.div>
        ) : (
          <motion.div key="plantillas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <TabPlantillas clientes={clientes} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
