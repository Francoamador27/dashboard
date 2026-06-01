import { ArrowRight } from 'lucide-react';

export default function PortafolioCard({ proyecto }) {
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }

    const cleanPath = String(path).replace(/^\/+/, '');

    if (cleanPath.startsWith('storage/')) {
      return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
    }

    if (cleanPath.startsWith('portafolio/') || cleanPath.startsWith('portafolio-galeria/')) {
      return `${import.meta.env.VITE_API_URL}/storage/uploads/${cleanPath}`;
    }

    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  return (
    <div className="group relative bg-white border border-slate-200 border-b-4 border-b-[#fdce27] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 h-full flex flex-col">
      {/* Imagen */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        {proyecto.imagen ? (
          <img
            src={getImageUrl(proyecto.imagen)}
            alt={proyecto.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1c1c1c] via-[#2c2c2c] to-[#3a3a3a] flex items-center justify-center">
            <span className="text-white text-6xl opacity-20">📁</span>
          </div>
        )}

        {/* Etiqueta PROYECTO */}


        {/* Overlay sutil al hover */}
        <div className="absolute inset-0 bg-[#fdce27]/0 group-hover:bg-[#fdce27]/10 transition-all duration-500" />
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Título */}
        <h3 className="text-lg font-black text-[#1c1c1c] mb-3 leading-tight tracking-tight group-hover:text-[#fdce27] transition-colors line-clamp-2 uppercase">
          {proyecto.titulo}
        </h3>

        {/* Descripción */}

        {/* Botón Estilo ServicioCard */}
        <div className="flex items-center gap-2 opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">


        </div>
      </div>
    </div>
  );

}
