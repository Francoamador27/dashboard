import React from "react";
import { Link } from "react-router-dom";
import ElectricBorder from './ElectricBorder';

export default function ServicioCard({ item, idx, isVisible }) {
  return (
    <ElectricBorder
      color="#7df9ff"
      speed={1}
      chaos={0.12}
      thickness={2}
      style={{ borderRadius: 16 }}
    >
      <div
        data-index={idx}
        className={`group relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl transform transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        {/* Imagen de Fondo */}
        <div className="absolute inset-0 z-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.titulo}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0891b2] via-[#0e7490] to-cyan-700 flex items-center justify-center">
              <span className="text-7xl opacity-30">{item.icon}</span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent transition-all duration-500 group-hover:from-[#0891b2]/90 group-hover:via-slate-900/60" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
          {/* Badge */}
          {item.highlight && (
            <div className="mb-3 transform translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="bg-[#0891b2]/90 backdrop-blur-md text-white text-[10px] font-black  tracking-widest px-4 py-2 rounded-full border border-white/20 shadow-lg">
                {item.highlight}
              </span>
            </div>
          )}

          {/* Título */}
          <h3 className="text-2xl font-black mb-3 tracking-tight line-clamp-2">
            {item.titulo || 'Servicio'}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-slate-200 mb-4 line-clamp-2 leading-relaxed">
            {item.descripcion || 'Descripción del servicio'}
          </p>

          {/* CTA siempre visible */}
          <div className="flex items-center gap-3 group/cta">
            <span className="text-xs font-bold tracking-tight  text-white transition-all duration-300 group-hover/cta:translate-x-1">
              Ver detalles
            </span>
            <div className="w-8 h-8 rounded-full bg-[#0891b2]/80 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 group-hover/cta:bg-[#0891b2] group-hover/cta:scale-110 active:scale-95">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
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
    </ElectricBorder>
  );
}
