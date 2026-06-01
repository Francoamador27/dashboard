import { useEffect, useMemo, useState, useRef } from "react";
import { Maximize2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Pagination,
  Navigation,
  Thumbs,
  FreeMode,
  Keyboard,
  Autoplay,
} from "swiper/modules";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import clienteAxios from "../config/axios";

const GaleriaSwiper = ({ size }) => {
  const [index, setIndex] = useState(-1);
  const [imagenesSubidas, setImagenesSubidas] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const mainSwiperRef = useRef(null);

  useEffect(() => {
    const obtenerImagenes = async () => {
      try {
        const { data } = await clienteAxios.get("/api/ejemplos");
        setImagenesSubidas(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error("Error al cargar imágenes:", err);
        setImagenesSubidas([]);
      }
    };
    obtenerImagenes();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const getSrc = (p) =>
    `${import.meta.env.VITE_API_URL}/storage/uploads/${String(p || "").replace(/^\/+/, "")}`;

  const slides = useMemo(
    () =>
      imagenesSubidas.map((img) => ({
        src: getSrc(img.imagen),
        title: img.titulo || `Caso clínico ${img.id ?? ""}`,
      })),
    [imagenesSubidas]
  );

  // Tamaños optimizados para mejor visualización
  const mainSize =
    size === "small"
      ? { w: 400, h: 300 }
      : size === "large"
        ? { w: 1000, h: 600 }
        : { w: 800, h: 500 };

  const handleImageLoad = (i) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  };

  const openLightboxAt = (i) => setIndex(i);

  return (
    <section className="w-full mx-auto relative ">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#003366] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Swiper
          onSwiper={(sw) => (mainSwiperRef.current = sw)}
          loop
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 10,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: true,
          }}
          keyboard={{ enabled: true }}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            bulletClass: "swiper-pagination-bullet-custom",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          autoplay={{
            delay: 3000, // tiempo en ms entre transiciones
            disableOnInteraction: false, // no deshabilitar cuando el usuario interactúa
            pauseOnMouseEnter: true, // pausa al poner el cursor encima
            waitForTransition: true, // esperar a que termine la transición antes de seguir
          }}
          modules={[
            EffectCoverflow,
            Pagination,
            Navigation,
            Thumbs,
            FreeMode,
            Keyboard,
            Autoplay,
          ]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          className="w-full max-w-6xl galeria-swiper-main"

        >
          {imagenesSubidas.map((img, i) => (
            <SwiperSlide
              key={img.id ?? i}
              style={{
                width: isMobile ? "340px" : `${mainSize.w}px`,
                height: isMobile ? "255px" : `${mainSize.h}px`,
              }}
              className="group"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white">
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button
                    aria-label="Ver imagen completa"
                    onClick={() => openLightboxAt(i)}
                    className="absolute top-4 right-4 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>

                  {/* Título simplificado */}
                  {img.titulo && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-lg font-semibold drop-shadow-lg">
                        {img.titulo}
                      </h4>
                    </div>
                  )}
                </div>

                {/* Loading spinner */}
                {!loadedImages.has(i) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-5">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent"></div>
                  </div>
                )}

                {/* Imagen con object-fit: cover para llenar todo el espacio */}
                <img
                  src={getSrc(img.imagen)}
                  alt={img.titulo || `Caso clínico ${i + 1}`}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${loadedImages.has(i) ? "opacity-100" : "opacity-0"
                    }`}
                  onLoad={() => handleImageLoad(i)}
                  loading="lazy"
                  decoding="async"
                  sizes={isMobile ? "340px" : `${mainSize.w}px`}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </SwiperSlide>
          ))}

          {/* Botones de navegación personalizados */}
          <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 z-20 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200 z-20 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Swiper>

        {/* Miniaturas */}
        {imagenesSubidas.length > 1 && (
          <div className="mt-8 px-4">
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={false}
              spaceBetween={16}
              slidesPerView="auto"
              freeMode
              watchSlidesProgress
              modules={[FreeMode, Thumbs]}
              className="w-full max-w-6xl galeria-thumbs"
            >
              {imagenesSubidas.map((img, i) => (
                <SwiperSlide key={`thumb-${img.id ?? i}`} style={{ width: "140px" }} className="cursor-pointer">
                  <div
                    onClick={() => {
                      mainSwiperRef.current?.slideToLoop?.(i);
                    }}
                    className="relative overflow-hidden rounded-xl group transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-[#003366]"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <img
                      src={getSrc(img.imagen)}
                      alt={img.titulo || `Miniatura ${i + 1}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      sizes="140px"
                      style={{ objectFit: "contain" }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute inset-0 ring-1 ring-white/30 rounded-xl" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={slides}
        index={index}
        plugins={[Zoom, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 4,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          scrollToZoom: true,
        }}
        thumbnails={{
          position: "bottom",
          vignette: false,
          width: 120,
          height: 80,
          border: 2,
          borderRadius: 8,
          padding: 4,
          gap: 12,
        }}
        carousel={{
          finite: false,
          preload: 2,
          imageFit: "cover"  // Cambiado a cover para mejor visualización
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
        render={{
          buttonPrev: (props = {}) => {
            const { disabled, ...rest } = props;
            return (
              <button
                {...rest}
                disabled={disabled}
                className="text-white hover:text-gray-300 p-3 disabled:opacity-30 transition-all"
                aria-label="Anterior"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            );
          },
          buttonNext: (props = {}) => {
            const { disabled, ...rest } = props;
            return (
              <button
                {...rest}
                disabled={disabled}
                className="text-white hover:text-gray-300 p-3 disabled:opacity-30 transition-all"
                aria-label="Siguiente"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          },
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.96)" },
          toolbar: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
        }}
      />
    </section>
  );
};

export default GaleriaSwiper;