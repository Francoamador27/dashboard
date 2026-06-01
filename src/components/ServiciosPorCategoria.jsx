import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import WhatsappHref from "../utils/WhatsappUrl";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import SEOHead from "./Head/Head";

export default function ServiciosPorCategoria() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [serviciosApi, setServiciosApi] = useState([]);
  const [categoriaInfo, setCategoriaInfo] = useState(null);

  // ---- SWR - Obtener categoría por ID ----
  const fetcherCategoria = (url) => clienteAxios(url).then((res) => res.data);
  const { data: dataCategorias } = useSWR(
    "/api/servicios-categorias",
    fetcherCategoria,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  // Buscar categoría por slug o ID
  useEffect(() => {
    if (!dataCategorias?.data) return;

    // Si no hay categoría en la URL, no buscamos nada específico
    if (!categoria) {
      setCategoriaInfo(null);
      return;
    }

    const cat = dataCategorias.data.find(
      (c) =>
        c.id === parseInt(categoria) ||
        c.nombre?.toLowerCase().replace(/\s+/g, "-") ===
          categoria?.toLowerCase(),
    );

    if (cat) {
      setCategoriaInfo(cat);
    } else {
      // Si se especificó una categoría pero no se encontró, redirigir a la vista general de servicios
      navigate("/servicios");
    }
  }, [dataCategorias, categoria, navigate]);

  // ---- SWR - Obtener servicios por categoría ----
  const fetcher = (url) => clienteAxios(url).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    categoriaInfo
      ? `/api/servicios?category=${categoriaInfo.id}&sort=position&dir=asc&per_page=1000`
      : null,
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
    setServiciosApi(items);
  }, [data]);

  // ---- Datos finales ----
  const servicios = useMemo(() => {
    return serviciosApi.map((s) => ({
      icon: s.icon ?? "🛠️",
      titulo: s.titulo ?? s.title ?? "Servicio especializado",
      descripcion: s.descripcion ?? s.description ?? "",
      highlight: s.highlight ?? s.tagline ?? "",
      slug:
        s.slug ??
        (s.titulo ?? s.title ?? "").toLowerCase().replace(/\s+/g, "-"),
      image: s.image ?? null,
      price: s.price ?? null,
    }));
  }, [serviciosApi]);

  // ✅ Card para Grid - Diseño de Turismo
  const ServicioCard = ({ item, idx }) => {
    return (
      <div
        className="group relative h-[450px] rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(220,131,78,0.15)] opacity-0 animate-fadeInUp"
        style={{
          animationDelay: `${idx * 120}ms`,
          animationFillMode: "forwards",
        }}
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
              <span className="text-8xl opacity-30">{item.icon}</span>
            </div>
          )}

          {/* Overlay con gradiente elegante */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent transition-all duration-500 group-hover:from-[#0891b2]/90 group-hover:via-slate-900/60" />
        </div>

        {/* Badge Superior - Posición Absoluta */}
        {item.highlight && (
          <div className="absolute top-6 right-6 z-20">
            <span className="bg-[#0891b2]/90 backdrop-blur-md text-white text-[11px] font-black  tracking-widest px-4 py-2 rounded-full shadow-lg border border-white/20">
              {item.highlight}
            </span>
          </div>
        )}

        {/* Contenido - Fijado a la parte inferior */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
          {/* Título con fuente elegante */}
          <h3 className="text-3xl font-black mb-3 tracking-tight transition-transform duration-500 group-hover:-translate-y-1 leading-tight">
            {item.titulo}
          </h3>

          {/* Descripción visible siempre */}
          <p className="text-white/90 text-sm mb-4 leading-relaxed line-clamp-2 transition-all duration-500 group-hover:text-white">
            {item.descripcion}
          </p>

          {/* Precio si existe */}
          {item.price && (
            <div className="mb-4">
              <span className="text-2xl font-black text-[#0891b2] bg-white/90 px-4 py-1 rounded-full">
                ${item.price}
              </span>
            </div>
          )}

          {/* CTA hover */}
          <div className="flex items-center gap-3 opacity-70 transform transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-2">
            <span className="text-sm font-bold tracking-tight  text-white">
              Ver detalles del servicio
            </span>
            <div className="w-8 h-8 rounded-full bg-[#0891b2]/80 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:bg-[#0891b2]">
              <svg
                className="w-4 h-4 text-white"
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

  // Si no hay categoría seleccionada y no está cargando, mostramos todas las categorías
  const isOverview = !categoria;

  if (!isOverview && !categoriaInfo && !isLoading) {
    return null;
  }

  return (
    <section className="relative bg-slate-50 py-24 px-6 lg:px-20 overflow-hidden">
      <SEOHead
        priority="high"
        title={
          isOverview
            ? "Nuestros Servicios | Anka Loo Construcciones"
            : `${categoriaInfo?.nombre || "Solución"} | Anka Loo Construcciones`
        }
        description={
          isOverview
            ? "Explora nuestras categorías de servicios especializados en construcción e infraestructura."
            : categoriaInfo?.descripcion ||
              "Descubre nuestros Servicios exclusivos."
        }
      />

      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#0891b2] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-slate-500 hover:text-[#0891b2] transition-colors"
            >
              Inicio
            </Link>
            <span className="text-slate-400">/</span>
            {isOverview ? (
              <span className="text-[#0891b2] font-semibold">Categorías</span>
            ) : (
              <>
                <Link
                  to="/servicios"
                  className="text-slate-500 hover:text-[#0891b2] transition-colors"
                >
                  Servicios
                </Link>
                <span className="text-slate-400">/</span>
                <span className="text-[#0891b2] font-semibold">
                  {categoriaInfo?.nombre || "..."}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Header con imagen de categoría o Título General */}
        <div className="text-center mb-20">
          {isOverview ? (
            <>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                Nuestros <span className="text-[#0891b2]">Servicios</span>
              </h1>
              <p className="text-slate-600 max-w-3xl mx-auto text-xl leading-relaxed font-light">
                Brindamos soluciones integrales en ingeniería e infraestructura
                con los más altos estándares de calidad y tecnología.
              </p>
            </>
          ) : (
            <>
              {categoriaInfo?.imagen && (
                <div className="mb-8 relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={categoriaInfo.imagen}
                    alt={categoriaInfo.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-end justify-center pb-10">
                    <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight">
                      {categoriaInfo.nombre}
                    </h1>
                  </div>
                </div>
              )}

              {!categoriaInfo?.imagen && (
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                  {categoriaInfo?.nombre || "Cargando..."}
                </h1>
              )}

              {categoriaInfo?.descripcion && (
                <p className="text-slate-600 max-w-2xl mx-auto text-xl leading-relaxed font-light">
                  {categoriaInfo.descripcion}
                </p>
              )}
            </>
          )}

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-1.5 w-20 rounded-full bg-[#0891b2]"></div>
            <div className="h-2 w-2 rounded-full bg-[#0891b2]"></div>
            <div className="h-1.5 w-20 rounded-full bg-[#0891b2]"></div>
          </div>
        </div>

        {/* Carga o error */}
        {isLoading && (
          <div className="text-center text-slate-500 mb-12 animate-pulse">
            Cargando Servicios...
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 mb-12 bg-red-50 p-4 rounded-xl">
            No pudimos cargar los Servicios. Por favor, reintenta más tarde.
          </div>
        )}

        {/* Mensaje si no hay servicios */}
        {!isLoading && servicios.length === 0 && (
          <div className="text-center text-slate-500 mb-12 bg-slate-100 p-8 rounded-2xl">
            <p className="text-xl font-semibold mb-2">
              No hay Servicios disponibles en esta categoría
            </p>
            <Link
              to="/servicios"
              className="text-[#0891b2] hover:underline font-bold"
            >
              Ver todos los Servicios
            </Link>
          </div>
        )}

        {/* ✅ Grid de Categorías (Vista General) */}
        {isOverview && dataCategorias?.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {dataCategorias.data.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/servicios/${cat.nombre.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0">
                  {cat.imagen ? (
                    <img
                      src={cat.imagen}
                      alt={cat.nombre}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <span className="text-4xl text-slate-400">🏗️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <h3 className="text-3xl font-black mb-2 tracking-tight group-hover:-translate-y-1 transition-transform">
                    {cat.nombre}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2">
                    {cat.descripcion}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ✅ Grid de Servicios (Vista Específica) */}
        {!isOverview && servicios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
            {servicios.map((item, idx) => (
              <ServicioCard key={idx} item={item} idx={idx} />
            ))}
          </div>
        )}

        {/* CTA Final */}
        <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-[#0891b2] to-cyan-700 p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h4 className="text-4xl font-black text-white mb-6">
              ¿Listo para tu próxima <span className="text-5xl">aventura</span>?
            </h4>
            <p className="text-white/90 text-lg mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              Consultanos por disponibilidad, Servicios personalizados y
              promociones exclusivas.
            </p>

            <a
              href={WhatsappHref({
                message: `Hola, vengo desde la web de Anka Loo Construcciones y me gustaría información sobre ${
                  categoriaInfo?.nombre || "los Servicios "
                }.`,
              })}
              className="inline-block bg-white text-[#0891b2] px-12 py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-50 hover:scale-105 transition-all active:scale-95"
              target="_blank"
              rel="noreferrer"
            >
              🌍 CONSULTAR DISPONIBILIDAD
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Animación CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(3rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.7s ease-out;
        }
      `}</style>
    </section>
  );
}
