import { useQuery } from '@tanstack/react-query';
import { Loader2, Palette, Type, Mic, Image, AlertTriangle, BookOpen } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function PortalBrandDna() {
  const { cliente } = useAuthStore();
  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';

  const { data: dna, isLoading } = useQuery({
    queryKey: ['portal-brand-dna'],
    queryFn: () => api.get('/portal/brand-dna').then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={24} className="animate-spin text-zinc-400" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-zinc-900">Brand DNA</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Identidad visual y comunicacional de tu marca</p>
      </div>

      <div className="space-y-4">
        {/* Colores */}
        {dna?.colores?.length > 0 && (
          <Card icon={<Palette size={16} />} title="Paleta de colores" accentColor={accentColor}>
            <div className="flex flex-wrap gap-3">
              {dna.colores.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg border border-zinc-200 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-mono text-zinc-600">{color}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tipografía */}
        {dna?.tipografia && (
          <Card icon={<Type size={16} />} title="Tipografía" accentColor={accentColor}>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{dna.tipografia}</p>
          </Card>
        )}

        {/* Tono */}
        {dna?.tono && (
          <Card icon={<Mic size={16} />} title="Tono de comunicación" accentColor={accentColor}>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{dna.tono}</p>
          </Card>
        )}

        {/* Estilo gráfico */}
        {dna?.estilo_grafico && (
          <Card icon={<Image size={16} />} title="Estilo gráfico" accentColor={accentColor}>
            {Array.isArray(dna.estilo_grafico) ? (
              <div className="flex flex-wrap gap-2">
                {dna.estilo_grafico.map((e, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full">{e}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-700">{JSON.stringify(dna.estilo_grafico)}</p>
            )}
          </Card>
        )}

        {/* Estilo copy */}
        {dna?.estilo_copy && (
          <Card icon={<BookOpen size={16} />} title="Estilo de copy" accentColor={accentColor}>
            {Array.isArray(dna.estilo_copy) ? (
              <ul className="space-y-1">
                {dna.estilo_copy.map((e, i) => (
                  <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{dna.estilo_copy}</p>
            )}
          </Card>
        )}

        {/* Restricciones */}
        {dna?.restricciones && (
          <Card icon={<AlertTriangle size={16} />} title="Restricciones" accentColor={accentColor}>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{dna.restricciones}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ icon, title, children, accentColor }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-zinc-100" style={{ color: accentColor }}>
        {icon}
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}
