import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import useCont from "../hooks/useCont";
import SEOHead from "./Head/Head";
import clienteAxios from "../config/axios";
import "./Posts/TiptapEditor.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function PortafolioDetail() {
  const { company } = useCont();
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return "";
    if (
      path.startsWith("http") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    )
      return path;

    const cleanPath = String(path).replace(/^\/+/, "");

    if (cleanPath.startsWith("storage/")) {
      return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
    }

    if (
      cleanPath.startsWith("portafolio/") ||
      cleanPath.startsWith("portafolio-galeria/")
    ) {
      return `${import.meta.env.VITE_API_URL}/storage/uploads/${cleanPath}`;
    }

    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchProyecto();
  }, [id]);

  const fetchProyecto = async () => {
    try {
      const { data } = await clienteAxios.get(`/api/portafolios/${id}`);
      setProyecto(data.data);
    } catch (error) {
      console.error("Error al obtener proyecto:", error);
    } finally {
      setLoading(false);
    }
  };

  const galleryImages = [
    proyecto?.imagen,
    ...(Array.isArray(proyecto?.galeria)
      ? proyecto.galeria.map((img) => img?.imagen)
      : []),
  ].filter(Boolean);

  const uniqueGalleryImages = Array.from(new Set(galleryImages));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-12 h-12 text-[#0891b2] animate-spin" />
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Proyecto no encontrado
        </h1>
        <Link
          to="/portafolio"
          className="inline-flex items-center gap-2 text-[#0891b2] font-bold hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al portafolio
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${proyecto.titulo} - Portafolio | ${company.name || "Anka Loo Construcciones"}`}
        description={proyecto.descripcion}
      />

      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium text-slate-700 hidden sm:inline">
            Volver
          </span>
        </button>

        <div className="max-w-5xl mx-auto px-6 py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
            <Link
              to="/portafolio"
              className="hover:text-[#0891b2] transition-colors"
            >
              Portafolio
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">
              {proyecto.titulo}
            </span>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900">
              {proyecto.titulo}
            </h1>
          </div>

          {/* Galería principal + thumbnails */}
          {uniqueGalleryImages.length > 0 && (
            <div className="mb-16">
              <Swiper
                modules={[Navigation, Thumbs]}
                navigation
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                spaceBetween={12}
                className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
              >
                {uniqueGalleryImages.map((src, index) => (
                  <SwiperSlide key={`main-${index}`}>
                    <img
                      src={getImageUrl(src)}
                      alt={`${proyecto.titulo} - imagen ${index + 1}`}
                      className="w-full h-96 md:h-[540px] object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {uniqueGalleryImages.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  modules={[Thumbs]}
                  watchSlidesProgress
                  spaceBetween={10}
                  slidesPerView={Math.min(uniqueGalleryImages.length, 5)}
                  breakpoints={{
                    320: {
                      slidesPerView: Math.min(uniqueGalleryImages.length, 3),
                    },
                    768: {
                      slidesPerView: Math.min(uniqueGalleryImages.length, 4),
                    },
                    1024: {
                      slidesPerView: Math.min(uniqueGalleryImages.length, 5),
                    },
                  }}
                  className="mt-4"
                >
                  {uniqueGalleryImages.map((src, index) => (
                    <SwiperSlide key={`thumb-${index}`}>
                      <img
                        src={getImageUrl(src)}
                        alt={`thumbnail ${index + 1}`}
                        className="w-full h-24 md:h-28 object-cover rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          )}

          {/* Descripción */}
          {proyecto.descripcion && (
            <div className="mb-16">
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
                {proyecto.descripcion}
              </p>
            </div>
          )}

          {/* Contenido HTML editable */}
          {proyecto.contenido && (
            <div className="max-w-none mb-16">
              <div
                className="rich-content bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-lg"
                dangerouslySetInnerHTML={{ __html: proyecto.contenido }}
              />
            </div>
          )}

          {/* CTA */}
          <div className="mt-20 pt-12 border-t border-slate-200">
            <div className="bg-gradient-to-r from-[#0891b2]/5 to-blue-100/5 rounded-3xl p-12 text-center">
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                ¿Quieres un proyecto así?
              </h2>
              <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                Contáctanos para conocer cómo podemos transformar tu visión en
                realidad
              </p>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0891b2] hover:bg-[#0e7490] text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Empezar un proyecto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
