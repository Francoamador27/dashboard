import React, { useState, useEffect, useMemo, useCallback } from "react";
import WhatsappHref from "../utils/WhatsappUrl";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import SEOHead from "./Head/Head";
import { ServicioCard } from "./Cards/ServicioCard";
import lineasIzq from "../assets/lineasamarillasizq.png";
import lineasDer from "../assets/lineasamarillasder.png";

// ✅ Swiper (slider)
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

export default function ServiciosSwiper() {
  const [visibleCards, setVisibleCards] = useState(() => new Set());
  const [serviciosApi, setServiciosApi] = useState([]);

  // ---- SWR (API dinámica) ----
  const fetcher = (url) => clienteAxios(url).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    "/api/servicios?sort=position&dir=asc&per_page=1000",
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

  // ---- Fallback si la API no trae nada ----
  const serviciosFallback = useMemo(
    () => [
      {
        icon: "🛤️",
        titulo: "Obras Viales",
        descripcion:
          "Diseño y construcción de rutas, caminos, puentes e infraestructura vial con altos estándares de calidad.",
        highlight: "Especialidad",
      },
      {
        icon: "💧",
        titulo: "Obras Hidráulicas",
        descripcion:
          "Sistemas de riego, acueductos, canales y obras de control hídrico para el manejo eficiente del agua.",
        highlight: "Especialidad",
      },
      {
        icon: "♻️",
        titulo: "Saneamiento y Ambientales",
        descripcion:
          "Redes cloacales, plantas de tratamiento y obras de saneamiento para cuidar el medioambiente.",
        highlight: "Ambiental",
      },
      {
        icon: "🏘️",
        titulo: "Urbanizaciones",
        descripcion:
          "Planificación e infraestructura de barrios y loteos con todos los servicios esenciales.",
        highlight: "Infraestructura",
      },
      {
        icon: "🏗️",
        titulo: "Obras Civiles",
        descripcion:
          "Construcción de edificios, galpones, plantas industriales y estructuras de hormigón.",
        highlight: "Construcción",
      },
      {
        icon: "⚙️",
        titulo: "Maquinaria Especializada",
        descripcion:
          "Equipos de última generación operados por profesionales certificados para cada tipo de obra.",
        highlight: "Tecnología",
      },
    ],
    [],
  );

  // ---- Datos finales ----
  const servicios = useMemo(() => {
    const base = serviciosApi?.length ? serviciosApi : serviciosFallback;
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
  }, [serviciosApi, serviciosFallback]);

  // ✅ Helper: marcar visibles desde Swiper
  const markSwiperVisible = useCallback((swiper) => {
    if (!swiper) return;

    setVisibleCards((prev) => {
      const next = new Set(prev);

      const slidesPerView =
        swiper.params.slidesPerView === "auto"
          ? swiper.slides.length
          : swiper.params.slidesPerView || 1;

      const activeIndex = swiper.activeIndex || 0;
      const numVisibleSlides =
        typeof slidesPerView === "number" ? Math.ceil(slidesPerView) : 1;

      for (let i = 0; i < numVisibleSlides; i++) {
        const index = activeIndex + i;
        if (index < swiper.slides.length) {
          next.add(String(index));
        }
      }

      return next;
    });
  }, []);

  return (
    <section className="relative bg-[#f4f4f4] pt-10 px-6 lg:px-20 overflow-hidden">
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
        description="Empresa constructora de Córdoba especializada en obras hidráulicas, viales, saneamiento y urbanizaciones."
      />

      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-[0.12]">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#fdce27] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#1c1c1c] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl lg:text-6xl font-black text-[#1c1c1c] mb-6 tracking-tight ">
            Nuestras <span className="text-[#fdce27]">Obras</span>
          </h2>

          <p className="max-w-2xl mx-auto text-xl leading-relaxed font-light text-[#5a5a5a]">
            En Anka Loo Construcciones brindamos servicios de infraestructura en
            obras hidráulicas, viales, de urbanización y saneamiento.
          </p>
        </div>

        {/* Carga o error */}
        {isLoading && (
          <div className="mb-12 text-center text-slate-400 animate-pulse">
            Cargando Servicios …
          </div>
        )}
        {error && (
          <div className="p-4 mb-12 text-center text-red-400 bg-red-950 rounded-xl">
            No pudimos cargar los Servicios. Por favor, reintenta más tarde.
          </div>
        )}

        {/* ✅ Slider */}
        <div className="mb-20">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 12 },
              640: { slidesPerView: 1, spaceBetween: 14 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 18 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: true }}
            loop={true}
            style={{ paddingBottom: "38px" }}
            onSwiper={(swiper) => markSwiperVisible(swiper)}
            onSlideChange={(swiper) => markSwiperVisible(swiper)}
          >
            {servicios.map((item, idx) => (
              <SwiperSlide key={idx} className="h-auto">
                <div className="h-full">
                  <ServicioCard
                    item={item}
                    idx={idx}
                    isVisible={visibleCards.has(String(idx))}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
