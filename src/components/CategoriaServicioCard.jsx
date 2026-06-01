import React from "react";
import { Link } from "react-router-dom";
import TiltedCard from "./TiltedCard";

export default function CategoriaServicioCard({ categoria }) {
  const slug =
    categoria.nombre?.toLowerCase().replace(/\s+/g, "-") || categoria.id;

  const cardContent = (
    <div className="relative z-10 h-full flex flex-col p-8 pt-32 lg:pt-[120px] text-white">
      {/* Título Estilo Vial */}
      <div className="mb-6">
        <h3 className="inline-block bg-[#5b5959e6]/95 px-5 py-3 text-2xl lg:text-2xl font-black uppercase tracking-tighter text-[#fdce27] border-l-[10px] border-[#fdce27] shadow-xl">
          {categoria.nombre}
        </h3>
      </div>

      {/* Descripción */}
      {categoria.descripcion && (
        <div
          className="prose prose-invert max-w-none text-[15px] font-medium text-slate-100 mb-6 
                     [&_p]:m-0 [&_p]:leading-tight 
                     [&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 
                     [&_li]:m-0 [&_li]:pb-2 [&_li]:leading-tight [&_li]:relative [&_li]:pl-5 
                     [&_li::before]:content-['❯'] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:text-white [&_li::before]:font-black [&_li::before]:text-[12px] [&_li::before]:top-[4px]"
          dangerouslySetInnerHTML={{ __html: categoria.descripcion }}
        />
      )}

      {/* CTA siempre visible */}
      <div className={`mt-auto ${categoria.enfasis ? "pb-10" : ""}`}>
        <div className="flex items-center gap-3 group/cta">
          <span className="text-[10px] font-black tracking-[0.15em] text-white transition-all duration-300 group-hover/cta:text-[#fdce27]">
            VER
          </span>
          <div className="w-8 h-8 bg-[#fdce27] flex items-center justify-center transition-all duration-300 group-hover/cta:scale-110 active:scale-95 shadow-md">
            <svg
              className="w-4 h-4 text-[#1c1c1c]"
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

      {/* Énfasis siempre al fondo */}
      {categoria.enfasis && (
        <p className="absolute bottom-0 left-0 right-0 px-8 py-3 text-[11px]  tracking-wide text-white text-right border-t border-white/20">
          {categoria.enfasis}
        </p>
      )}
    </div>
  );

  return (
    <Link to={`/servicios/${slug}`}>
      <div className="group relative h-auto min-h-[560px] lg:h-[580px] overflow-hidden shadow-xl border border-slate-200/10 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-[#1c1c1c]">
        {/* Línea dorada superior que aparece en hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#fdce27] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 z-30"></div>

        {/* Fondo (Imagen o Patrón) */}
        <div className="absolute inset-0 z-0">
          {categoria.imagen ? (
            <TiltedCard
              imageSrc={categoria.imagen}
              altText={categoria.nombre}
              captionText={categoria.nombre}
              containerHeight="100%"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              rotateAmplitude={5}
              scaleOnHover={1.12}
              showMobileWarning={false}
              displayOverlayContent={false}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#1c1c1c]">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
            </div>
          )}

          {/* Filtro amarillo vibrante */}
          <div className="absolute inset-0 bg-[#fdce27]/70 mix-blend-multiply z-10 transition-all duration-500 group-hover:bg-[#fdce27]/80" />

          {/* Overlay degradado suave */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Contenido: Relativo en mobile para dar altura, absoluto en desktop */}
        <div className="relative z-20 lg:absolute lg:inset-0">
          {cardContent}
        </div>
      </div>
    </Link>
  );
}
