import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Loader2, CheckCircle2, AlertCircle, Clock,
  ImageIcon, Download, RefreshCw,
} from 'lucide-react';
import { useActiveAssets, useRecentAssets, imageUrl, downloadAsset } from '../hooks/useGaleria';
import { useClientes } from '../hooks/useClientes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:    { label: 'En cola',     color: 'text-slate-400 dark:text-white/30',  bg: 'bg-slate-100 dark:bg-white/[0.05]',  icon: Clock },
  processing: { label: 'Generando',   color: 'text-amber-500',                     bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: Loader2, spin: true },
  completed:  { label: 'Completada',  color: 'text-emerald-500',                   bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
  failed:     { label: 'Error',       color: 'text-red-400',                       bg: 'bg-red-50 dark:bg-red-500/10',        icon: AlertCircle },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

function platformLabel(p) {
  const map = {
    meta_feed: 'Meta Feed', ig_feed_portrait: 'IG Portrait',
    meta_story: 'Story', pmax: 'PMAX',
    google_display: 'Display', google_responsive: 'Responsive',
    highlight_cover: 'Highlight',
  };
  return map[p] ?? p;
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
      <Icon size={9} className={meta.spin ? 'animate-spin' : ''} />
      {meta.label}
    </span>
  );
}

// ─── Batch card (active generation group) ────────────────────────────────────

function BatchCard({ batch, clientes }) {
  const cliente = clientes?.find((c) => String(c.id) === String(batch.cliente_id));
  const allDone = batch.assets.every((a) => a.status === 'completed' || a.status === 'failed');
  const anyProcessing = batch.assets.some((a) => a.status === 'processing');

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Client avatar */}
          <div className="w-7 h-7 rounded-lg bg-[#c9a84c]/10 flex items-center justify-center text-[11px] font-bold text-[#c9a84c] shrink-0">
            {cliente?.nombre?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white/90 leading-tight">
              {cliente?.nombre ?? `Cliente #${batch.cliente_id}`}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-white/30">{timeAgo(batch.created_at)}</p>
          </div>
        </div>
        {anyProcessing && (
          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Generando
          </span>
        )}
        {allDone && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
            <CheckCircle2 size={10} /> Listo
          </span>
        )}
      </div>

      {/* Asset rows */}
      <div className="space-y-2">
        {batch.assets.map((asset) => (
          <div key={asset.id} className="flex items-center gap-2.5">
            {/* Thumbnail or spinner */}
            <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] overflow-hidden shrink-0 flex items-center justify-center">
              {asset.status === 'completed' && asset.url ? (
                <img src={imageUrl(asset.url)} alt="" className="w-full h-full object-cover" />
              ) : asset.status === 'processing' ? (
                <Loader2 size={13} className="text-amber-400 animate-spin" />
              ) : asset.status === 'failed' ? (
                <AlertCircle size={13} className="text-red-400" />
              ) : (
                <Clock size={13} className="text-slate-300 dark:text-white/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-600 dark:text-white/60 font-medium leading-tight">
                {platformLabel(asset.plataforma)} · <span className="capitalize">{asset.tipo}</span>
              </p>
              {asset.status === 'failed' && asset.error_message && (
                <p className="text-[10px] text-red-400 truncate mt-0.5">{asset.error_message}</p>
              )}
            </div>
            <StatusChip status={asset.status} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Recent asset thumbnail ───────────────────────────────────────────────────

function RecentCard({ asset }) {
  const isPortrait  = asset.height > asset.width;
  const isLandscape = asset.width > asset.height;
  const aspect = isPortrait ? 'aspect-[3/4]' : isLandscape ? 'aspect-[16/9]' : 'aspect-square';
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'https://dashboard.test';

  return (
    <div className={`relative ${aspect} bg-slate-100 dark:bg-white/[0.03] rounded-xl overflow-hidden border border-slate-100 dark:border-white/[0.06] group`}>
      {asset.url && (
        <img src={imageUrl(asset.url)} alt="" className="w-full h-full object-cover" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
        <div className="flex gap-1 flex-wrap">
          <span className="text-[9px] bg-black/60 text-white/80 rounded px-1.5 py-0.5 backdrop-blur-sm">
            {platformLabel(asset.plataforma)}
          </span>
          {asset.cliente && (
            <span className="text-[9px] bg-black/60 text-white/70 rounded px-1.5 py-0.5 backdrop-blur-sm truncate max-w-[80px]">
              {asset.cliente.nombre}
            </span>
          )}
        </div>
        <button
          onClick={() => downloadAsset(asset)}
          className="self-end bg-white text-black text-[10px] font-semibold rounded-lg px-2 py-1 flex items-center gap-1 hover:bg-slate-100 transition-colors"
        >
          <Download size={9} /> Bajar
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Monitor() {
  const { data: activeData, isRefetching: activeRefetching } = useActiveAssets();
  const { data: recentData, isRefetching: recentRefetching } = useRecentAssets();
  const { data: clientes } = useClientes();

  const activeAssets = activeData?.data ?? activeData ?? [];
  const recentAssets = recentData?.data ?? [];

  // Group active assets by generacion_id
  const batches = useMemo(() => {
    const map = {};
    for (const asset of activeAssets) {
      const key = asset.generacion_id ?? `solo-${asset.id}`;
      if (!map[key]) {
        map[key] = {
          generacion_id: key,
          cliente_id: asset.cliente_id,
          created_at: asset.created_at,
          assets: [],
        };
      }
      map[key].assets.push(asset);
    }
    return Object.values(map).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeAssets]);

  const hasActive = batches.length > 0;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Activity size={20} className="text-[#c9a84c]" />
            Monitor
          </h1>
          <p className="text-slate-400 dark:text-white/30 text-sm mt-1">
            Generaciones activas y producción reciente
          </p>
        </div>
        {(activeRefetching || recentRefetching) && (
          <RefreshCw size={13} className="text-slate-300 dark:text-white/20 animate-spin" />
        )}
      </div>

      {/* ── En proceso ─────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          {hasActive ? (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-white/10" />
          )}
          <h2 className="text-sm font-semibold text-slate-700 dark:text-white/70">
            En proceso
            {hasActive && (
              <span className="ml-2 text-[11px] font-medium text-amber-500 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-0.5">
                {activeAssets.length} imagen{activeAssets.length !== 1 ? 'es' : ''}
              </span>
            )}
          </h2>
        </div>

        <AnimatePresence mode="popLayout">
          {hasActive ? (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {batches.map((batch) => (
                <BatchCard key={batch.generacion_id} batch={batch} clientes={clientes} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2 py-10 bg-white dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.06] rounded-2xl">
              <CheckCircle2 size={24} className="text-slate-200 dark:text-white/10" />
              <p className="text-slate-300 dark:text-white/20 text-sm">No hay generaciones en curso</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Recientes ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-white/70">
            Producción reciente
            {recentAssets.length > 0 && (
              <span className="ml-2 text-[11px] font-normal text-slate-400 dark:text-white/30">
                últimas {recentAssets.length}
              </span>
            )}
          </h2>
        </div>

        {recentAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 bg-white dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.06] rounded-2xl">
            <ImageIcon size={28} className="text-slate-200 dark:text-white/10" />
            <p className="text-slate-300 dark:text-white/20 text-sm">Todavía no hay imágenes generadas</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 space-y-3">
            {recentAssets.map((asset) => (
              <div key={asset.id} className="break-inside-avoid">
                <RecentCard asset={asset} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
