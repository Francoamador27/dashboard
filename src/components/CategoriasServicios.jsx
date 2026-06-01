import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import CategoriaServicioCard from "./CategoriaServicioCard";
import lineasIzq from "../assets/lineasamarillasizq.png";
import lineasDer from "../assets/lineasamarillasder.png";

export default function CategoriasServicios() {
  const { pathname } = useLocation();
  const isServiciosRoot = pathname === "/servicios" || pathname === "/servicios/";
  const [categorias, setCategorias] = useState([]);

  // ---- SWR - Obtener categorías ----
  const fetcher = (url) => clienteAxios(url).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    "/api/servicios-categorias",
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!data) return;
    const items = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
    setCategorias(items);
  }, [data]);

  if (isLoading) {
    return (
      <section className="relative px-6 py-20 bg-white">
        <div className="mx-auto text-center max-w-7xl">
          <div className="animate-pulse">
            <div className="w-64 h-8 mx-auto mb-4 bg-slate-200"></div>
            <div className="h-4 mx-auto mb-16 bg-slate-200 w-96"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-100 "></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || categorias.length === 0) {
    return null;
  }

  return (
    <section className="relative px-6 py-24 overflow-hidden bg-white">
      {isServiciosRoot && (
        <>
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
        </>
      )}
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-32 left-20 w-96 h-96 bg-[#fdce27] blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-[#1c1c1c] blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl lg:text-6xl font-black text-[#1c1c1c] mb-6 tracking-tight ">
            Nuestros <span className="text-[#fdce27]">Servicios</span>
          </h2>
          <p className="max-w-7xl mx-auto text-xl leading-relaxed font-light text-[#5a5a5a]">
            Cumpliendo 20 años, la empresa reafirma su propósito de contribuir
            positivamente a la comunidad poniendo a disposición su experiencia y
            recorrido en pos del desarrollo de nuevos mercados. Asumiendo
            desafíos de ingeniería con una gestión profesional que garantiza
            resultados que cumplen las expectativas de los más exigentes
            sectores productivos.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {categorias.map((categoria) => (
            <CategoriaServicioCard key={categoria.id} categoria={categoria} />
          ))}
        </div>
      </div>
    </section>
  );
}
