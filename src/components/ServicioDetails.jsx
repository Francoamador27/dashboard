import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import SEOHead from "./Head/Head";
import WhatsappHref from "../utils/WhatsappUrl";
import { buildImageUrl } from "../utils/imageUrl";
import useCont from "../hooks/useCont";
import { CheckCircle, Zap, Shield, TrendingUp, Users, Cpu } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const iconMap = {
  check: CheckCircle,
  zap: Zap,
  shield: Shield,
  trending: TrendingUp,
  users: Users,
  cpu: Cpu,
};

export default function ServicioDetails() {
  const { slug } = useParams();
  const { company } = useCont();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const fetcher = (url) => clienteAxios(url).then((res) => res.data);
  const { data: servicioData } = useSWR(`/api/servicios/${slug}`, fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    // Resetear el estado cuando cambia el slug
    setLoading(true);
    setServicio(null);
  }, [slug]);

  useEffect(() => {
    if (!servicioData) return;

    // El endpoint /api/servicios/{slug} devuelve { data: {...} }
    const servicioRaw = servicioData?.data || servicioData;

    if (servicioRaw) {
      const rawFeatures = servicioRaw.features;
      let parsedFeatures = [];

      if (Array.isArray(rawFeatures)) {
        parsedFeatures = rawFeatures;
      } else if (typeof rawFeatures === "string") {
        try {
          const parsed = JSON.parse(rawFeatures);
          parsedFeatures = Array.isArray(parsed) ? parsed : [];
        } catch {
          parsedFeatures = [];
        }
      }
      const servicioNormalizado = {
        icon: servicioRaw.icon ?? "🛠️",
        titulo:
          servicioRaw.title ?? servicioRaw.titulo ?? "Servicio especializado",
        descripcion: servicioRaw.description ?? servicioRaw.descripcion ?? "",
        highlight: servicioRaw.highlight ?? servicioRaw.tagline ?? "",
        slug:
          servicioRaw.slug ??
          (servicioRaw.title ?? servicioRaw.titulo ?? "")
            .toLowerCase()
            .replace(/\s+/g, "-"),
        image: buildImageUrl(servicioRaw.image ?? servicioRaw.mainImage_url),
        gallery: Array.isArray(servicioRaw.gallery)
          ? servicioRaw.gallery.map((img) => buildImageUrl(img))
          : [],
        video: servicioRaw.video ?? servicioRaw.youtube_url ?? null,
        tags: Array.isArray(servicioRaw.tags)
          ? servicioRaw.tags
          : servicioRaw.tags
            ? servicioRaw.tags.split(",").map((t) => t.trim())
            : [],
        price: servicioRaw.price ?? null,
        categoria: servicioRaw.categoria?.nombre ?? "OBRA",
        categoriaSlug:
          servicioRaw.categoria?.slug ??
          (servicioRaw.categoria?.nombre
            ? servicioRaw.categoria.nombre
                .toLowerCase()
                .replace(/\s+/g, "-")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            : null),
        features: parsedFeatures,
      };
      setServicio(servicioNormalizado);
    }
    setLoading(false);
  }, [servicioData]);

  const detalles = useMemo(() => {
    if (!servicio) return [];

    const icons = ["zap", "shield", "trending", "users", "cpu", "check"];
    const features = Array.isArray(servicio.features) ? servicio.features : [];

    return features
      .map((feature, index) => {
        if (typeof feature === "string") {
          return {
            icon: icons[index % icons.length],
            titulo: feature,
            descripcion: "",
          };
        }

        if (feature && typeof feature === "object") {
          return {
            icon:
              feature.icon && iconMap[feature.icon]
                ? feature.icon
                : icons[index % icons.length],
            titulo: feature.title ?? feature.titulo ?? "",
            descripcion: feature.description ?? feature.descripcion ?? "",
          };
        }

        return null;
      })
      .filter((item) => item && (item.titulo || item.descripcion));
  }, [servicio]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#fdce27]"></div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#1c1c1c] mb-2  tracking-wide">
            Servicio no encontrado
          </h1>
          <Link
            to="/servicios"
            className="text-[#fdce27] font-black hover:underline  text-sm tracking-widest"
          >
            Volver a obras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${servicio?.titulo || "Servicio"} - Anka Loo Construcciones`}
        description={
          servicio?.descripcion ||
          "Soluciones tecnológicas especializadas de Anka Loo Construcciones"
        }
      />

      <div className="min-h-screen bg-[#f4f4f4]">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#fdce27] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1c1c1c] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1c1c1c] mb-3 tracking-tight leading-none">
              {servicio.titulo}
            </h1>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8">
              <Link
                to="/"
                className="text-[#5a5a5a] hover:text-[#fdce27] transition-colors font-semibold"
              >
                Inicio
              </Link>
              <span className="text-slate-400">/</span>
              <Link
                to="/servicios"
                className="text-[#5a5a5a] hover:text-[#fdce27] transition-colors font-semibold"
              >
                Servicios
              </Link>
              {servicio.categoriaSlug && (
                <>
                  <span className="text-slate-400">/</span>
                  <Link
                    to={`/servicios/${servicio.categoriaSlug}`}
                    className="text-[#5a5a5a] hover:text-[#fdce27] transition-colors font-semibold truncate max-w-[150px] lg:max-w-none"
                  >
                    {servicio.categoria}
                  </Link>
                </>
              )}
              <span className="text-slate-400">/</span>
              <span className="text-[#fdce27] font-black truncate max-w-[150px] lg:max-w-none">
                {servicio.titulo}
              </span>
            </nav>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 ">
              {/* Contenido Izquierda (Image/Gallery) */}
              <div className="animate-fadeInLeft flex flex-col gap-4">
                <div className="relative h-80 sm:h-96 lg:h-[450px] shadow-2xl bg-white border border-slate-200 p-2">
                  <div className="w-full h-full relative overflow-hidden">
                    {servicio.image ||
                    (servicio.gallery && servicio.gallery.length > 0) ? (
                      <Swiper
                        style={{
                          "--swiper-navigation-color": "#fdce27",
                          "--swiper-pagination-color": "#fdce27",
                        }}
                        spaceBetween={10}
                        navigation={true}
                        thumbs={{
                          swiper:
                            thumbsSwiper && !thumbsSwiper.destroyed
                              ? thumbsSwiper
                              : null,
                        }}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="w-full h-full"
                      >
                        {servicio.image && (
                          <SwiperSlide>
                            <img
                              src={servicio.image}
                              alt={servicio.titulo}
                              className="w-full h-full object-cover"
                            />
                          </SwiperSlide>
                        )}
                        {servicio.gallery &&
                          servicio.gallery.map((img, index) => (
                            <SwiperSlide key={index}>
                              <img
                                src={img}
                                alt={`${servicio.titulo} - Galería ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </SwiperSlide>
                          ))}
                      </Swiper>
                    ) : (
                      <div className="w-full h-full bg-[#1c1c1c] flex items-center justify-center relative overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                          }}
                        ></div>
                        <span className="text-9xl opacity-30 relative z-10 text-[#fdce27]">
                          {servicio.icon || "🛠️"}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Borde inferior dorado */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#fdce27]"></div>
                </div>

                {/* Thumbnails */}
                {servicio.gallery && servicio.gallery.length > 0 && (
                  <div className="h-24 sm:h-28 w-full p-2 bg-white border border-slate-200 shadow-sm">
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={4}
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="w-full h-full thumbs-swiper"
                    >
                      {servicio.image && (
                        <SwiperSlide className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity [&.swiper-slide-thumb-active]:border-2 [&.swiper-slide-thumb-active]:border-[#fdce27] [&.swiper-slide-thumb-active]:opacity-100">
                          <img
                            src={servicio.image}
                            alt="Thumbnail Principal"
                            className="w-full h-full object-cover"
                          />
                        </SwiperSlide>
                      )}
                      {servicio.gallery.map((img, index) => (
                        <SwiperSlide
                          key={index}
                          className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity [&.swiper-slide-thumb-active]:border-2 [&.swiper-slide-thumb-active]:border-[#fdce27] [&.swiper-slide-thumb-active]:opacity-100"
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </div>

              {/* Contenido Derecha */}
              <div className="animate-fadeInRight">
                <div className="mb-6">
                  <span className="bg-[#1c1c1c] text-[#fdce27] text-[10px] font-black tracking-[0.2em] px-3 py-1.5  inline-block shadow-sm">
                    {servicio.categoria || "Obra Especializada"}
                  </span>
                </div>

                {/* Tags */}
                {servicio.tags && servicio.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {servicio.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-200 text-[#1c1c1c] text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Descripción (Rich Text) */}
                <div
                  className="prose prose-slate prose-lg max-w-none text-[#5a5a5a] font-light leading-relaxed mb-8 marker:text-[#fdce27] prose-a:text-[#fdce27] prose-a:font-bold hover:prose-a:text-[#1c1c1c] prose-headings:text-[#1c1c1c] prose-headings:font-black prose-strong:text-[#1c1c1c]"
                  dangerouslySetInnerHTML={{
                    __html:
                      servicio.descripcion ||
                      "Servicio de infraestructura de Anka Loo Construcciones.",
                  }}
                />

                {servicio.price && (
                  <div className="mb-8 p-5 bg-white border border-slate-200 border-l-4 border-l-[#fdce27] shadow-sm">
                    <p className="text-xs font-black tracking-widest text-slate-500  mb-1">
                      Presupuesto inicial
                    </p>
                    <p className="text-3xl font-black text-[#1c1c1c]">
                      ${servicio.price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección Video */}
        {servicio.video && (
          <div className="relative py-16 px-6 bg-[#1c1c1c]">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                  Video de la Obra
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-16 bg-[#fdce27]"></div>
                </div>
              </div>
              <div className="relative pt-[56.25%] overflow-hidden bg-black shadow-2xl border-4 border-[#fdce27]/20">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={
                    servicio.video.includes("watch?v=")
                      ? servicio.video.replace("watch?v=", "embed/")
                      : servicio.video
                  }
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        {detalles.length > 0 && (
          <div className="relative py-16 lg:py-24 px-6 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-black text-[#1c1c1c] mb-4  tracking-tight">
                  Especificaciones Técnicas
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-16 bg-[#fdce27]"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {detalles.map((detalle, idx) => {
                  const Icon = iconMap[detalle.icon] || CheckCircle;
                  return (
                    <div
                      key={idx}
                      className="group relative p-8 bg-[#f9f9f9] border border-slate-200 hover:border-transparent hover:bg-white hover:shadow-xl transition-all duration-300 animate-scaleIn border-b-4 border-b-transparent hover:border-b-[#fdce27]"
                      style={{
                        animationDelay: `${idx * 100}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-slate-200 shadow-sm mb-6 transition-all group-hover:-translate-y-1 group-hover:border-[#fdce27]/50">
                        {company?.logo ? (
                          <img
                            src={company.logo}
                            alt="Logo"
                            className="w-7 h-7 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Icon className="w-6 h-6 text-[#1c1c1c] group-hover:text-[#b89200] transition-colors" />
                        )}
                      </div>
                      <h3 className="text-lg font-black text-[#1c1c1c] tracking-tight mb-3">
                        {detalle.titulo}
                      </h3>
                      {detalle.descripcion && (
                        <p className="text-[#5a5a5a] text-sm leading-relaxed font-light">
                          {detalle.descripcion}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animaciones CSS */}
      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
