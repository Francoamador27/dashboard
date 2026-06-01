import React, { useState, useEffect, useMemo } from "react";
import {
  Link,
  useSearchParams,
  useParams,
  useNavigate,
} from "react-router-dom";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import SEOHead from "./Head/Head";
import { ServicioCard } from "./Cards/ServicioCard";
import lineasIzq from "../assets/lineasamarillasizq.png";
import lineasDer from "../assets/lineasamarillasder.png";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const POR_PAGINA = 12;

export default function ServiciosGrid() {
  const { categoria: categoriaSlug } = useParams();
  const navigate = useNavigate();
  const [serviciosApi, setServiciosApi] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagina, setPagina] = useState(1);
  const [openAccordions, setOpenAccordions] = useState(new Set());

  const toggleAccordion = (catId) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  // Busca una categoría (o subcategoría) por id o slug en el árbol completo
  const findCatInTree = (list, pred) => {
    for (const cat of list) {
      if (pred(cat)) return cat;
      const child = (cat.children || []).find(pred);
      if (child) return child;
    }
    return null;
  };

  // Capturar parámetro 'categoria' de la URL (slug o param)
  useEffect(() => {
    if (!categorias.length) return;

    if (categoriaSlug) {
      if (categoriaSlug === "todas-nuestras-obras") {
        setSelectedCategory("all");
      } else {
        const found = findCatInTree(
          categorias,
          (c) =>
            c.nombre?.toLowerCase().replace(/\s+/g, "-") ===
              categoriaSlug.toLowerCase() || String(c.id) === categoriaSlug,
        );
        setSelectedCategory(found ? String(found.id) : "all");
      }
    } else {
      setSelectedCategory("all");
    }
    setPagina(1);
  }, [categoriaSlug, categorias]);

  const handleCategorySelect = (id) => {
    if (id === "all") {
      navigate("/servicios/todas-nuestras-obras");
    } else {
      const found = findCatInTree(categorias, (c) => String(c.id) === id);
      const catSlug = found
        ? found.nombre.toLowerCase().replace(/\s+/g, "-")
        : id;
      navigate(`/servicios/${catSlug}`);
    }
  };

  // ---- SWR (API dinámica) ----
  const fetcher = (url) => clienteAxios(url).then((res) => res.data);

  const { data: dataCategorias } = useSWR(
    "/api/servicios-categorias",
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const serviciosUrl = useMemo(() => {
    const params = new URLSearchParams({
      sort: "position",
      dir: "asc",
      per_page: "1000",
    });

    if (selectedCategory !== "all") {
      // Si es categoría padre (tiene subcategorías), incluir también los hijos
      const parentCat = categorias.find(
        (c) => String(c.id) === selectedCategory,
      );
      if (parentCat && (parentCat.children || []).length > 0) {
        const ids = [
          parentCat.id,
          ...(parentCat.children || []).map((c) => c.id),
        ];
        params.set("category", ids.join(","));
      } else {
        params.set("category", selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    return `/api/servicios?${params.toString()}`;
  }, [selectedCategory, searchQuery, categorias]);

  const { data, error, isLoading } = useSWR(serviciosUrl, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!dataCategorias) return;
    const items = Array.isArray(dataCategorias?.data)
      ? dataCategorias.data
      : Array.isArray(dataCategorias)
        ? dataCategorias
        : [];
    setCategorias(items);
  }, [dataCategorias]);

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
    const base = serviciosApi?.length ? serviciosApi : [];
    return base.map((s) => ({
      icon: s.icon ?? "🛠️",
      titulo: s.titulo ?? s.title ?? "Servicio especializado",
      descripcion: s.descripcion ?? s.description ?? "",
      highlight: s.highlight ?? s.tagline ?? "",
      slug:
        s.slug ??
        (s.titulo ?? s.title ?? "").toLowerCase().replace(/\s+/g, "-"),
      image: s.image ?? null,
      categoria: s.categoria?.nombre ?? null,
    }));
  }, [serviciosApi]);

  const totalPaginas = Math.ceil(servicios.length / POR_PAGINA);

  const serviciosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA;
    return servicios.slice(inicio, inicio + POR_PAGINA);
  }, [servicios, pagina]);

  const irAPagina = (n) => {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative bg-[#f4f4f4] py-12 lg:py-16 px-6 lg:px-20 overflow-hidden">
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
        priority="high"
        title={`Anka Loo Construcciones | Obras e Infraestructura en Córdoba`}
        description="Empresa constructora de Córdoba: obras hidráulicas, viales, saneamiento, urbanizaciones y obras civiles con tecnología de vanguardia."
      />

      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#fdce27] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#1c1c1c] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Fila header: breadcrumb + título */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
          <div className="flex flex-col justify-end gap-2 lg:col-span-1"></div>
          <div className="lg:col-span-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1c1c1c] tracking-tight">
              {selectedCategory === "all"
                ? "Nuestras Obras"
                : findCatInTree(
                    categorias,
                    (c) => String(c.id) === selectedCategory,
                  )?.nombre || "Nuestras Obras"}
            </h2>
          </div>
        </div>

        {/* Main Layout con Sidebar */}
        <div className="grid grid-cols-1 gap-6 mb-16 lg:grid-cols-4 lg:mb-20">
          {/* Sidebar Filtros */}
          <aside className="lg:col-span-1">
            <div className="sticky space-y-4 top-6">
              {/* Search Box */}
              <div className="p-4 transition-shadow bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-[#fdce27]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-slate-900">
                    Buscar obra
                  </label>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre o tipo de obra..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-[#fdce27] focus:outline-none focus:ring-2 focus:ring-[#fdce27]/20 transition-all duration-200 text-sm"
                />
              </div>

              {/* Categorías Filter */}
              <div className="p-4 transition-shadow bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-[#fdce27]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-slate-900">
                    Tipo de Obra
                  </label>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/servicios/"
                    onClick={() => handleCategorySelect("all")}
                    className={`block w-full px-3 py-2 text-xs font-black transition-all text-left ${
                      selectedCategory === "all"
                        ? "bg-[#1c1c1c] text-[#fdce27] border-l-2 border-[#fdce27]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Volver a Nuestros Servicios
                  </Link>
                  {categorias.map((cat) => {
                    const hasChildren = (cat.children || []).length > 0;
                    const isOpen = openAccordions.has(cat.id);
                    return (
                      <React.Fragment key={cat.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleCategorySelect(String(cat.id));
                            if (hasChildren) toggleAccordion(cat.id);
                          }}
                          className={`w-full px-3 py-2 text-xs font-black transition-all text-left flex items-center justify-between gap-1 ${
                            selectedCategory === String(cat.id)
                              ? "bg-[#1c1c1c] text-[#fdce27] border-l-2 border-[#fdce27]"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span>{cat.nombre}</span>
                          {hasChildren && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          )}
                        </button>
                        {hasChildren && isOpen &&
                          cat.children.map((subcat) => (
                            <button
                              key={subcat.id}
                              type="button"
                              onClick={() => handleCategorySelect(String(subcat.id))}
                              className={`w-full px-3 py-2 text-xs font-black transition-all text-left pl-6 border-l-2 ${
                                selectedCategory === String(subcat.id)
                                  ? "bg-[#1c1c1c] text-[#fdce27] border-[#fdce27]"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent"
                              }`}
                            >
                              └ {subcat.nombre}
                            </button>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Results Counter */}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Carga o error */}
            {isLoading && (
              <div className="mb-12 text-center text-slate-500 animate-pulse">
                Cargando Servicios …
              </div>
            )}
            {error && (
              <div className="p-4 mb-12 text-center text-red-600 bg-red-50 rounded-xl">
                No pudimos cargar los Servicios. Por favor, reintenta más tarde.
              </div>
            )}

            {/* Grid */}
            {!isLoading && servicios.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
                  {serviciosPaginados.map((item, idx) => (
                    <ServicioCard key={idx} item={item} idx={idx} />
                  ))}
                </div>

                {(() => {
                  const catActual = selectedCategory !== "all"
                    ? findCatInTree(categorias, (c) => String(c.id) === selectedCategory)
                    : null;
                  return catActual?.pdf ? (
                    <div className="flex justify-center mt-4 mb-6">
                      <a
                        href={catActual.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#1c1c1c] text-[#fdce27] font-black tracking-wider text-sm uppercase hover:bg-[#fdce27] hover:text-[#1c1c1c] transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Ver más obras
                      </a>
                    </div>
                  ) : null;
                })()}

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => irAPagina(pagina - 1)}
                      disabled={pagina === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[#1c1c1c] hover:border-[#fdce27] hover:text-[#fdce27] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          onClick={() => irAPagina(n)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-black transition-colors ${
                            n === pagina
                              ? "bg-[#fdce27] text-[#1c1c1c] border border-[#fdce27]"
                              : "bg-white border border-slate-200 text-[#1c1c1c] hover:border-[#fdce27] hover:text-[#fdce27]"
                          }`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => irAPagina(pagina + 1)}
                      disabled={pagina === totalPaginas}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[#1c1c1c] hover:border-[#fdce27] hover:text-[#fdce27] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              !isLoading && (
                <div className="py-12 text-center bg-white border shadow-sm rounded-xl border-slate-200">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mb-1 text-xl font-semibold text-slate-800">
                    No se encontraron servicios
                  </h3>
                  <p className="text-sm text-slate-600">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                </div>
              )
            )}
          </main>
        </div>

        <div className="mt-8 text-xs font-bold tracking-widest text-center lg:mt-10 text-slate-500 lg:text-sm ">
          <p>Obras Viales | Hidráulicas | Saneamiento | Urbanizaciones</p>
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
