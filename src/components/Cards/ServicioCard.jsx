import { Link } from "react-router-dom";

export const ServicioCard = ({ item, idx }) => {
  return (
    <div
      className="min-h-[400px] group relative overflow-hidden shadow-md transition-all duration-500 hover:shadow-xl hover:shadow-[#fdce27]/10 opacity-0 animate-fadeInUp bg-white border border-slate-200 border-b-4 border-b-[#fdce27]"
      style={{
        animationDelay: `${idx * 120}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* Imagen arriba */}
      <div className="relative h-[180px] md:h-[200px] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1c1c1c] via-[#2c2c2c] to-[#3a3a3a] flex items-center justify-center">
            <span className="text-6xl opacity-20 text-white">{item.icon}</span>
          </div>
        )}

        {/* Etiqueta PROYECTO */}
        <div className="absolute top-0 left-0 z-10">
          <span className="bg-[#1c1c1c] text-[#fdce27] text-[9px] font-black  tracking-[0.2em] px-3 py-1.5 block">
            {item.categoria || "OBRA"}
          </span>
        </div>

        {item.highlight && (
          <div className="absolute top-0 right-0 z-10">
            <span className="bg-[#fdce27] text-[#1c1c1c] text-[9px] font-black  tracking-widest px-2 py-1.5 block shadow-sm">
              {item.highlight}
            </span>
          </div>
        )}

        {/* Overlay sutil al hover */}
        <div className="absolute inset-0 bg-[#fdce27]/0 group-hover:bg-[#fdce27]/30 transition-all duration-500" />
      </div>

      {/* Texto debajo */}
      <div className="p-5 text-slate-900">
        <h3 className="text-base font-black mb-2 tracking-tight leading-tight text-[#1c1c1c] line-clamp-2 min-h-[2.5rem]">
          {item.titulo}
        </h3>

        <div
          className="prose prose-slate prose-xs line-clamp-2 text-slate-500 mb-4 leading-relaxed text-xs min-h-[2.5rem]"
          dangerouslySetInnerHTML={{ __html: item.descripcion }}
        />

        {item.price && (
          <div className="mb-4">
            <span className="text-sm font-black text-[#1c1c1c] bg-[#fdce27] px-3 py-1">
              ${item.price}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
          <span className="text-[10px] font-black tracking-[0.15em]  text-[#1c1c1c]">
            Ver detalles
          </span>
          <div className="w-6 h-6 bg-[#fdce27] flex items-center justify-center">
            <svg
              className="w-3 h-3 text-[#1c1c1c]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Link invisible */}
      <Link
        to={`/servicio/${item.slug}`}
        className="absolute inset-0 z-20 cursor-pointer"
        aria-label={`Ver detalles de ${item.titulo}`}
      />
    </div>
  );
};
