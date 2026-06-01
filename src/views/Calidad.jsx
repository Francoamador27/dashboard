import React, { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Loader,
  Award,
  Download,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import SEOHead from "../components/Head/Head";
import clienteAxios from "../config/axios";
import useCont from "../hooks/useCont";

const fetcher = (url) => clienteAxios.get(url).then((res) => res.data.data);

export default function Calidad() {
  const { company, settings } = useCont();
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const imgCalidad = settings?.imagen_calidad
    ? settings.imagen_calidad.startsWith("http")
      ? settings.imagen_calidad
      : `${API_BASE}${settings.imagen_calidad}`
    : null;
  const {
    data: certificados,
    error,
    isLoading,
  } = useSWR("/api/certificados", fetcher);

  const { data: politicaData } = useSWR("/api/politica-gestion", fetcher, {
    revalidateOnFocus: false,
  });
  const politicaUrl = politicaData?.documento ?? null;

  return (
    <>
      <SEOHead
        title={`Calidad y Certificaciones - ${company.name || "Anka Loo Construcciones"}`}
        description="Conoce nuestras certificaciones de calidad y estándares de excelencia en infraestructura."
      />

      <div className="min-h-screen bg-white py-12 lg:py-20 relative overflow-hidden">
        {/* Fondo Industrial Sutil */}
        <div className="absolute top-0 left-0 w-full h-96 bg-[#f4f4f4] -z-10 skew-y-[-2deg] origin-top-left"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-[#fdce27] rounded-full blur-3xl opacity-10 -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header de Sección */}
          <header className="mb-10 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-5xl font-black text-[#1c1c1c] tracking-tighter leading-none mb-8">
              Calidad <span className="text-[#fdce27]">Certificada</span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed font-light text-[#5a5a5a] animate-fadeInUp">
              En <strong>{company.name || "Anka Loo"} </strong>
              contamos con certificaciones de calidad ISO que avalan cada uno de
              nuestros procesos constructivos.
            </p>
          </header>

          {/* Grilla de Certificados */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader className="w-12 h-12 text-[#fdce27] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-bold">
                Error al cargar las certificaciones. Intenta nuevamente más
                tarde.
              </p>
            </div>
          ) : certificados?.length === 0 ? (
            <div className="text-center py-32 bg-[#1c1c1c] rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#fdce27] opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700"></div>
              <p className="text-white/40 font-black text-xs uppercase tracking-[0.3em]">
                No hay certificados publicados actualmente
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-5 justify-items-center">
              {certificados.map((cert, index) => (
                <article
                  key={cert.id}
                  className="group w-full bg-white shadow-lg hover:shadow-2xl border border-slate-100 transition-all duration-500 animate-fadeInUp overflow-hidden rounded-2xl flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative flex items-center justify-center aspect-video">
                    {cert.imagen ? (
                      <img
                        src={cert.imagen}
                        alt="Certificado de Calidad"
                        className="w-full h-full object-contain drop-shadow-sm"
                      />
                    ) : (
                      <Award className="w-12 h-12 text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-[#1c1c1c]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>

                  {cert.documento && (
                    <div className="px-4 pb-4 flex justify-center">
                      <a
                        href={cert.documento}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#fdce27] hover:bg-[#1c1c1c] text-[#1c1c1c] hover:text-[#fdce27] text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2.5 shadow-xl rounded-xl transition-colors duration-300"
                      >
                        <Download size={13} strokeWidth={2.5} />
                        <span>DESCARGAR CERTIFICADO</span>
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Política de Gestión */}
          <div className="mb-12 bg-[#f4f4f4] rounded-2xl p-8 lg:p-10 mt-10">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              {/* Columna texto + botón */}
              <div>
                <p className="text-lg leading-relaxed font-light text-[#5a5a5a] mb-6">
                  En{" "}
                  <strong className="text-[#1c1c1c] font-black">
                    Anka Loo
                  </strong>{" "}
                  definimos y cumplimos una{" "}
                  <strong className="text-[#1c1c1c]">
                    Política de Calidad, Medio Ambiente, Salud y Seguridad de
                    los Trabajadores
                  </strong>
                  , que rige la gestión diaria y regula nuestro trabajo para el
                  logro de los objetivos y la mejora continua de nuestros
                  procesos.
                </p>
                {politicaUrl && (
                  <a
                    href={politicaUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#fdce27] hover:bg-[#1c1c1c] text-[#1c1c1c] hover:text-[#fdce27] text-[11px] font-black uppercase tracking-[0.15em] px-5 py-3.5 rounded-2xl transition-colors duration-300"
                  >
                    <Download size={16} strokeWidth={2.5} />
                    <span>Descargar Política de Gestión</span>
                  </a>
                )}
              </div>

              {/* Columna imagen */}
              {imgCalidad && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={imgCalidad}
                    alt="Calidad Anka Loo"
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
