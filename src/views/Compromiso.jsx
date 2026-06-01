import React from "react";
import {
  Droplets,
  Sun,
  TreePine,
  Wind,
  Recycle,
  ShieldCheck,
} from "lucide-react";
import SEOHead from "../components/Head/Head";
import useCont from "../hooks/useCont";

const iniciativas = [
  {
    icon: Droplets,
    titulo: "Biocombustible",
    descripcion:
      "Los equipos que operan con biocombustible, reducen las emisiones de carbono en cada obra.",
  },
  {
    icon: Sun,
    titulo: "Energía Solar",
    descripcion:
      "Los paneles solares en nuestro predio generan más del 80% de la energía que consumimos.",
  },
  {
    icon: TreePine,
    titulo: "Reforestación",
    descripcion:
      "Plantamos árboles en las zonas de obra intervenidas para compensar la biodiversidad.",
  },
  {
    icon: Wind,
    titulo: "Huella de Carbono",
    descripcion:
      "Medimos y compensamos nuestra huella de carbono como parte de nuestra gestión ambiental.",
  },
  {
    icon: Recycle,
    titulo: "Reciclaje Integral",
    descripcion:
      "Reciclamos papel, plásticos, vidrios, voluminosos y residuos orgánicos.",
  },
  {
    icon: ShieldCheck,
    titulo: "Residuos Peligrosos",
    descripcion:
      "Gestionamos los residuos peligrosos en cumplimiento de la legislación vigente.",
  },
];

export default function Compromiso() {
  const { company, settings } = useCont();
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const imgCompromiso = settings?.imagen_compromiso
    ? settings.imagen_compromiso.startsWith("http")
      ? settings.imagen_compromiso
      : `${API_BASE}${settings.imagen_compromiso}`
    : null;

  return (
    <>
      <SEOHead
        title={`Compromiso Ambiental - ${company.name || "Anka Loo Construcciones"}`}
        description="Conocé nuestro compromiso con la sustentabilidad: biocombustibles, paneles solares, reforestación y gestión responsable de residuos."
      />

      <div className="min-h-screen bg-white py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          {/* Eyebrow */}

          {/* Título */}
          <h1 className="text-5xl md:text-6xl font-black text-[#1c1c1c] tracking-tighter leading-none mb-12">
            Nuestro <span className="text-green-600">Compromiso</span>
          </h1>

          {/* Imagen compromiso */}

          {/* Texto principal */}
          <p className="text-xl md:text-2xl leading-relaxed text-[#5a5a5a] font-light mb-20">
            En <strong className="text-[#1c1c1c] font-black">Anka Loo</strong>{" "}
            trabajamos con una mirada sustentable integrada que incluye: el uso
            de{" "}
            <span className="text-green-600 font-semibold">biocombustible</span>{" "}
            en nuestros equipos,{" "}
            <span className="text-green-600 font-semibold">
              paneles solares
            </span>{" "}
            en nuestro predio que generan más del{" "}
            <span className="font-black text-[#1c1c1c]">80%</span> de la energía
            que usamos,{" "}
            <span className="text-green-600 font-semibold">reforestamos</span>{" "}
            las zonas de obra intervenidas, medimos y compensamos nuestra{" "}
            <span className="text-green-600 font-semibold">
              huella de carbono
            </span>
            , realizamos{" "}
            <span className="text-green-600 font-semibold">reciclaje</span> de
            papel, plásticos, vidrios, voluminosos y orgánicos. También
            gestionamos los{" "}
            <span className="text-green-600 font-semibold">
              residuos peligrosos
            </span>{" "}
            en cumplimiento de la legislación vigente.
          </p>
          {imgCompromiso && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-slate-100">
              <img
                src={imgCompromiso}
                alt="Compromiso Ambiental Anka Loo"
                className="w-full max-h-150 object-cover"
              />
            </div>
          )}
          {/* Divisor */}
          <div className="flex items-center gap-4 mb-14">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black tracking-[0.35em] text-slate-400 uppercase">
              Compromiso con la sustentabilidad
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Grilla de iniciativas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
            {iniciativas.map(({ icon: Icon, titulo, descripcion }) => (
              <div
                key={titulo}
                className="bg-white p-8 flex flex-col gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-white w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-black text-[#1c1c1c] text-base mb-2 tracking-tight">
                    {titulo}
                  </h3>
                  <p className="text-[#5a5a5a] text-sm font-light leading-relaxed">
                    {descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
