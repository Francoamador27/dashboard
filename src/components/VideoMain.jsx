import React from "react";
import { Youtube, Play, Maximize2 } from "lucide-react";

export default function VideoMain({ url }) {
  if (!url) return null;

  // Extraer ID de YouTube
  const getEmbedUrl = (url) => {
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else {
      videoId = url.split("/").pop();
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
  };

  return (
    <section className="relative py-20 overflow-hidden bg-white lg:py-20">
      {/* Elementos decorativos industriales */}
      <div className="absolute top-0 left-0 w-full h-px bg-slate-100"></div>
      <div className="absolute top-10 right-[-5%] w-1/3 aspect-square bg-[#fdce27]/5 rounded-full blur-[120px] -z-10"></div>

      <div className="mx-auto max-w-7xl">
        <div className="px-6 mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-12 bg-[#fdce27]"></div>
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-400 ">
              Experiencia en Movimiento
            </span>
            <div className="h-1 w-12 bg-[#fdce27]"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#1c1c1c] tracking-tighter leading-none mb-4">
            Nuestro Trabajo en Acción
          </h2>
        </div>

        {/* Contenedor del Video */}
        <div className="relative px-0 group animate-fadeInUp lg:px-6">
          {/* Marco Industrial */}
          <div className="absolute -inset-4 bg-[#f4f4f4] rounded-[2.5rem] -z-10 group-hover:scale-[1.01] transition-transform duration-700"></div>

          <div className="relative aspect-video w-full bg-[#1c1c1c] shadow-2xl border-[12px] border-white overflow-hidden rounded-[2rem]">
            <iframe
              className="w-full h-full grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
              src={getEmbedUrl(url)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            {/* Overlay sutil */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
