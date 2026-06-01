import React from "react";
import useCont from "../hooks/useCont";
import SEOHead from "../components/Head/Head";
import Mapa from "../components/Mapa/Mapa";
import { MapPin, Clock, MessageCircle } from "lucide-react";

export default function Sede() {
  const { company, contact } = useCont();

  return (
    <>
      <SEOHead
        title={`Nuestra Sede - ${company.name || "Anka Loo Construcciones"}`}
        description="Conoce nuestra ubicación, horarios de atención y medios de contacto."
      />

      <div className="min-h-screen bg-[#f4f4f4] relative overflow-hidden">
        {/* Acento de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fdce27]/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1c1c1c]/5 rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          {/* Header */}
          <header className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-10 bg-[#fdce27]"></div>
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                Sede Corporativa
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1c1c1c] tracking-tight leading-tight">
              Donde <span className="text-[#fdce27]">estamos</span>
            </h1>
          </header>

          {/* Cards de info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Ubicación */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#fdce27] mb-3">
                <MapPin size={18} />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
                  Ubicación
                </span>
              </div>
              <p className="text-base sm:text-lg font-black text-[#1c1c1c] leading-snug">
                {company.address || "Córdoba, Argentina"}
              </p>
            </div>

            {/* Horarios */}
            {company.business_hours && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#fdce27] mb-3">
                  <Clock size={18} />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
                    Horarios
                  </span>
                </div>
                <p className="text-base sm:text-lg font-black text-[#1c1c1c] leading-snug">
                  {company.business_hours}
                </p>
              </div>
            )}

            {/* Contacto */}
            <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={18} className="text-[#fdce27]" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
                  Contacto
                </span>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="block text-base sm:text-lg font-black text-white hover:text-[#fdce27] transition-colors break-all"
              >
                {contact.email || "info@ankaloo.com"}
              </a>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#fdce27] z-20"></div>
            <div className="h-[300px] sm:h-[420px] lg:h-[520px] w-full">
              <Mapa />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
