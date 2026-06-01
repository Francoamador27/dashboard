import { useState } from 'react';
import { LayoutTemplate, Loader2, ExternalLink } from 'lucide-react';
import { usePlantillas } from '../../hooks/usePlantillas';
import { imageUrl } from '../../hooks/useGaleria';

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

const TIPOS = [
  { value: '', label: 'Todos' },
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

function PlantillaCard({ plantilla }) {
  const url = imageUrl(plantilla.url);
  const isPortrait = plantilla.plataforma === 'meta_story' || plantilla.plataforma === 'ig_feed_portrait';

  return (
    <div className={`group relative bg-slate-100 dark:bg-white/[0.04] rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.06] ${isPortrait ? 'row-span-2' : ''}`}>
      {url ? (
        <img
          src={url}
          alt={plantilla.nombre}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full aspect-square flex items-center justify-center">
          <LayoutTemplate size={32} className="text-slate-300 dark:text-white/20" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-white text-xs font-medium truncate">{plantilla.nombre}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {plantilla.plataforma && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-medium">
              {PLATAFORMA_LABEL[plantilla.plataforma] ?? plantilla.plataforma}
            </span>
          )}
          {plantilla.tipo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c9a84c]/40 text-[#c9a84c] font-medium">
              {TIPO_LABEL[plantilla.tipo] ?? plantilla.tipo}
            </span>
          )}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} className="text-white" />
          </a>
        )}
      </div>

      {/* Status badge for non-completed */}
      {plantilla.status !== 'completed' && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/80 text-white text-[10px] font-medium">
          {plantilla.status}
        </div>
      )}
    </div>
  );
}

export default function TabPlantillasCliente({ clienteId }) {
  const [filtroTipo, setFiltroTipo] = useState('');
  const { data: plantillas, isLoading } = usePlantillas(clienteId);

  const filtered = (plantillas ?? []).filter((p) => {
    if (filtroTipo && p.tipo !== filtroTipo && p.tipo != null) return false;
    if (filtroTipo && p.tipo == null) return false;
    if (!filtroTipo) return p.status === 'completed';
    return p.status === 'completed';
  });

  const completadas = (plantillas ?? []).filter((p) => p.status === 'completed');
  const pendientes  = (plantillas ?? []).filter((p) => p.status !== 'completed').length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <LayoutTemplate size={15} className="text-[#c9a84c]" />
          <span className="text-slate-500 dark:text-white/40 text-sm">
            {completadas.length} plantilla{completadas.length !== 1 ? 's' : ''} confirmada{completadas.length !== 1 ? 's' : ''}
          </span>
        </div>
        {pendientes > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tipo filter */}
      <div className="flex gap-2 flex-wrap">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            onClick={() => setFiltroTipo(t.value)}
            className={chipCls(filtroTipo === t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 py-8">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Cargando plantillas…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center">
          <LayoutTemplate size={28} className="mx-auto text-slate-200 dark:text-white/[0.1] mb-3" />
          <p className="text-slate-400 dark:text-white/30 text-sm">
            {filtroTipo ? 'Sin plantillas para este tipo.' : 'Este cliente todavía no tiene plantillas confirmadas.'}
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="break-inside-avoid">
              <PlantillaCard plantilla={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
