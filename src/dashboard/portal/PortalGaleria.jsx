import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ImageIcon, Download, Loader2, X, Wand2 } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { imageUrl } from '../hooks/useGaleria';
import CreadorContenido from '../components/cliente/CreadorContenido';

const PLATAFORMAS = ['todas', 'meta_feed', 'meta_story', 'google_display', 'highlight_cover'];

export default function PortalGaleria() {
  const { cliente, clienteId } = useAuthStore();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';
  const [plataforma, setPlataforma]   = useState('todas');
  const [preview, setPreview]         = useState(null);
  const [creadorOpen, setCreadorOpen] = useState(false);

  // Todos los hooks antes de cualquier return condicional
  const { data: colecciones = [] } = useQuery({
    queryKey: ['portal-colecciones'],
    queryFn: () => api.get('/portal/colecciones').then(r => r.data),
  });

  const params = plataforma !== 'todas' ? { plataforma } : {};

  const { data, isLoading } = useQuery({
    queryKey: ['portal-assets', plataforma],
    queryFn: () => api.get('/portal/assets', { params }).then(r => r.data),
  });

  const assets = data?.data ?? [];

  return creadorOpen ? (
    <CreadorContenido onClose={() => setCreadorOpen(false)} clienteId={clienteId} isPortal />
  ) : (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Mis imágenes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Todas las piezas gráficas generadas para tu marca</p>
        </div>
        <button
          onClick={() => setCreadorOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <Wand2 size={15} /> Crear contenido
        </button>
      </div>


      {/* Filtro plataforma */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {PLATAFORMAS.map(p => (
          <button
            key={p}
            onClick={() => setPlataforma(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              plataforma === p ? 'text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
            style={plataforma === p ? { backgroundColor: accentColor } : {}}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <ImageIcon size={36} className="mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No hay imágenes todavía</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="break-inside-avoid rounded-xl overflow-hidden border border-zinc-100 bg-white group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setPreview(asset)}
            >
              <img
                src={imageUrl(asset.url)}
                alt={asset.tipo}
                className="w-full object-cover"
                loading="lazy"
              />
              <div className="px-2 py-1.5">
                <p className="text-[11px] text-zinc-500 capitalize">{asset.plataforma?.replace('_', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setPreview(null)}
          >
            <X size={22} />
          </button>
          <img
            src={imageUrl(preview.url)}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
            alt=""
          />
          <div className="absolute bottom-4 flex gap-3">
            <a
              href={imageUrl(preview.url)}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-2 bg-white text-zinc-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-100"
            >
              <Download size={14} />
              Descargar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

