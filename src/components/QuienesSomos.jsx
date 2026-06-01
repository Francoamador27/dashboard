import {
  PhoneIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import WhatsappHref from "../utils/WhatsappUrl";
import Mapa from "./Mapa/Mapa";
import useCont from "../hooks/useCont";
import SEOHead from "./Head/Head";
import MagicBento from "./MagicBento";
import lineasIzq from "../assets/lineasamarillasizq.png";
import lineasDer from "../assets/lineasamarillasder.png";

const fetcher = (url) => clienteAxios(url).then((res) => res.data);
const fetcherList = (url) => clienteAxios(url).then((res) => res.data.data);

// Carga perezosa del componente 3D pesado
const Lanyard = lazy(() => import("./Lanyard"));
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("/embed/")) return url;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const QuienesSomos = () => {
  const { company, logoUrl, contact } = useCont();
  const videoEmbedUrl = getYouTubeEmbedUrl(company.video_quienes_somos);
  const { data: brochureData } = useSWR("/api/brochure", fetcher, {
    revalidateOnFocus: false,
  });
  const brochure = brochureData?.data ?? null;

  const { data: lideres } = useSWR("/api/lideres", fetcherList, {
    revalidateOnFocus: false,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: company?.name || "Anka Loo Construcciones",
    url: window?.location?.origin || "",
    logo: logoUrl || `${window?.location?.origin || ""}/logo.png`,
    description:
      "Empresa constructora de Córdoba especializada en obras hidráulicas, viales, saneamiento y ambientales. Profesionales con maquinaria y tecnología de última generación.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contact?.phone || "+54 9 351 0000000",
      contactType: "Consultas de Obra",
      areaServed: "AR",
      availableLanguage: ["Español"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: company?.address || "Córdoba, Argentina",
      addressCountry: "AR",
    },
  };

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 z-0 hidden w-48 h-full pointer-events-none select-none lg:block opacity-60"
        style={{
          backgroundImage: `url(${lineasDer})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "contain",
          backgroundPosition: "left top",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 z-0 hidden w-48 h-full pointer-events-none select-none lg:block opacity-60"
        style={{
          backgroundImage: `url(${lineasIzq})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "contain",
          backgroundPosition: "right top",
        }}
      />
      <SEOHead
        title={`Anka Loo Construcciones | Obras Hidráulicas, Viales y Saneamiento en Córdoba`}
        description={`Anka Loo Construcciones: empresa constructora de Córdoba especializada en obras hidráulicas, viales, saneamiento y ambientales. Calidad, experiencia y tecnología de vanguardia en cada proyecto.`}
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-white" />

      <div className="relative z-10 max-w-6xl px-6 py-20 mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl text-slate-900">
            Quienes<span className="text-[#fdce27]"> Somos</span>
          </h1>
        </header>
        {/* Video Quiénes Somos */}
        {videoEmbedUrl && (
          <div className="max-w-5xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-xl border border-slate-100 aspect-video">
            <iframe
              src={videoEmbedUrl}
              title="Video Anka Loo Construcciones"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
        {/* Historia */}
        <div className="p-8 mb-16 bg-white border shadow-lg border-slate-100 rounded-3xl md:p-12">
          <h2 className="mb-4 text-2xl font-black text-slate-900">Historia</h2>
          <p className="text-lg leading-relaxed text-slate-600">
            Anka Loo se constituye formalmente en 2006, a partir de la
            trayectoria iniciada en 1976 por{" "}
            <strong>Marcelo Indalecio Boidi</strong> en el sector de la
            construcción. Su desarrollo independiente se caracterizó por una
            sólida gestión operativa y presencia en obra.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            En la actualidad somos una empresa especializada en servicios de
            infraestructura vial, hidráulica, de saneamiento y ambiental, que
            brinda soluciones de calidad. Nuestro diferencial está en la gestión
            de nuestra gente y en la incorporación de tecnología que nos permite
            cumplir plazos, optimizar costos y construir relaciones a largo
            plazo con nuestros clientes. En{" "}
            <strong className="text-[#fdce27]">Anka Loo</strong> trabajamos
            priorizando el bienestar de las personas, la rentabilidad y la
            sostenibilidad ambiental, contribuyendo al desarrollo integral de la
            comunidad.
          </p>
          {brochure && (
            <div className="mt-6">
              <a
                href={brochure.archivo}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#fdce27] text-slate-900 font-bold px-6 py-3 rounded-xl hover:brightness-90 transition-all"
              >
                <Download size={18} />
                Descargar brochure en PDF
              </a>
            </div>
          )}
        </div>

        {/* Propósito + Valores */}
        <section className="relative overflow-hidden bg-white  shadow-xl rounded-3xl  p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            {/* Columna texto */}
            <div>
              <h2 className="mb-6 text-xl font-black text-slate-900">
                Propósito
              </h2>
              <p className="mb-2 text-lg leading-relaxed text-slate-600">
                Nuestro propósito es contribuir positivamente a la comunidad y
                al desarrollo de nuestros colaboradores, disfrutando cada paso
                del camino y asumiendo los desafíos como una oportunidad para
                crecer.
              </p>
              <div className="pt-2 border-t border-slate-100">
                <h3 className="mb-4 text-xl font-black text-slate-900">
                  Valores
                </h3>
                <div className="space-y-3 text-base leading-relaxed text-slate-600">
                  <p>
                    Fomentamos relaciones basadas en el respeto y la empatía,
                    promoviendo calidad, profesionalismo y eficiencia en cada
                    proyecto.
                  </p>
                  <p>
                    Cumplimos los acuerdos asumidos, adoptando soluciones
                    innovadoras para generar valor.
                  </p>
                  <p>
                    Trabajamos priorizando el bienestar de las personas, la
                    rentabilidad y la sostenibilidad ambiental, contribuyendo al
                    desarrollo integral de la comunidad.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna imagen */}
            {company?.imagen_corporativa && (
              <div className="relative w-full h-72 md:h-[420px] rounded-2xl overflow-hidden">
                <img
                  src={
                    company.imagen_corporativa.startsWith("http")
                      ? company.imagen_corporativa
                      : `${import.meta.env.VITE_API_URL}/${company.imagen_corporativa}`
                  }
                  alt="Equipo e Infraestructura Anka Loo"
                  className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                />
              </div>
            )}
          </div>
        </section>

        {/* Misión y Visión */}
        <div className="grid gap-6 mt-10 md:grid-cols-2">
          {/* Misión */}
          <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-8">
            <h3 className="mb-4 text-xl font-black text-slate-900">Misión</h3>
            <p className="text-base leading-relaxed text-slate-600">
              Nuestra Misión es ser una empresa de servicios, enfocada en la
              construcción y mantenimiento de obras de infraestructura,
              referente en la Región Centro de Argentina, comprometida con el
              cumplimiento y la calidad de sus trabajos, el desarrollo
              sostenible, aplicando para ello la mejor tecnología.
            </p>
          </div>

          {/* Visión */}
          <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-8">
            <h3 className="mb-4 text-xl font-black text-slate-900">Visión</h3>
            <p className="text-base leading-relaxed text-slate-600">
              Nuestra visión es consolidarnos como una empresa referente,
              ampliando nuestra participación en los sectores público y privado.
              Aspiramos asumir proyectos de creciente complejidad, promoviendo
              la innovación, la excelencia y un impacto positivo en la
              comunidad.
            </p>
          </div>
        </div>

        {/* Líderes */}
        {lideres && lideres.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-8 text-2xl font-black text-slate-900">
              Nuestro Equipo
            </h2>
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              {lideres.map((lider) => (
                <div
                  key={lider.id}
                  className="flex items-center gap-5 bg-white border border-slate-100 shadow-md rounded-2xl p-5"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
                    {lider.imagen ? (
                      <img
                        src={lider.imagen}
                        alt={`${lider.nombre} ${lider.apellido}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xl font-black">
                        {lider.nombre[0]}
                        {lider.apellido[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 truncate">
                      {lider.nombre} {lider.apellido}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mt-0.5 truncate">
                      {lider.posicion}
                    </p>
                    {lider.linkedin && (
                      <a
                        href={lider.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2"
                        aria-label="LinkedIn"
                      >
                        <svg
                          className="w-4 h-4 text-[#0077b5] hover:opacity-70 transition-opacity"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
};

export default QuienesSomos;
