import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clienteAxios from "../../config/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import SEOHead from "../Head/Head";

const ACCENT = "#003366";
const isImageUrl = (url = "") =>
  /\.(jpe?g|png|webp|gif|bmp|svg)(\?.*)?$/i.test(url || "");

export default function ServiciosShow() {
  const { slug, idOrSlug, id } = useParams();
  const param = slug || idOrSlug || id;

  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const token = localStorage.getItem("AUTH_TOKEN");

  useEffect(() => {
    const fetchServicio = async () => {
      if (!param) return;
      setLoading(true);
      setErr(null);
      try {
        const { data } = await clienteAxios.get(`/api/servicios/${encodeURIComponent(param)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setServicio(data?.data ?? data ?? null);
      } catch (e) {
        console.error("Error cargando servicio:", e);
        setErr("No se pudo cargar el detalle del servicio.");
      } finally {
        setLoading(false);
      }
    };
    fetchServicio();
  }, [param, token]);

  const tags = useMemo(() => {
    const t = servicio?.tags;
    if (Array.isArray(t)) return t;
    if (typeof t === "string") return t.split(",").map((x) => x.trim()).filter(Boolean);
    return [];
  }, [servicio]);

  const features = useMemo(() => {
    const f = servicio?.features;
    if (Array.isArray(f)) return f;
    if (typeof f === "string") {
      try {
        const parsed = JSON.parse(f);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [servicio]);

  const gallery = useMemo(() => {
    if (!servicio) return [];

    const mainImg = servicio.mainImage_url || servicio.image_url || null;
    const galleryImgs = Array.isArray(servicio.gallery_urls)
      ? servicio.gallery_urls
      : [];

    let merged = [];

    // 1️⃣ Si hay imagen principal → la ponemos primera
    if (mainImg) {
      merged.push(mainImg);
    }

    // 2️⃣ Agregamos el resto evitando duplicados
    galleryImgs.forEach((img) => {
      if (img !== mainImg) merged.push(img);
    });

    return merged;
  }, [servicio]);


  const descripcion =
    servicio?.description ?? servicio?.descripcion ?? "No hay descripcion detallada para este servicio actualmente.";

  // 📹 Video del producto
  const rawVideo = servicio?.video || null;

  let videoUrl = null;

  if (rawVideo) {
    const yid = rawVideo.match(
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    );
    if (yid && yid[7]?.length === 11) {
      videoUrl = `https://www.youtube.com/embed/${yid[7]}`;
    }
  }

  // SEO schema enriquecido
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: servicio?.title || "servicio de la casa",
    image: gallery,
    description: descripcion,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <section className="relative bg-white text-slate-900 overflow-hidden">
      <SEOHead
        priority="high"
        title={`${servicio?.title || "Detalle"} | ${"Servicios"} del Restaurante`}
        description={`Conoce mas sobre ${servicio?.title || "nuestros Servicios"}. Ingredientes frescos y preparacion artesanal.`}
        keywords={`Servicios, restaurante, menu, ${servicio?.title || "cocina"}`}
      />

      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-[#003366] blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-600 blur-3xl rounded-full"></div>
      </div>

      {/* Breadcrumbs y Título */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <nav className="text-xs font-black  tracking-widest text-[#003366]/60 mb-6 flex items-center gap-3">
          <Link to="/" className="hover:text-[#003366] transition">Inicio</Link>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <Link to="/servicios" className="hover:text-[#003366] transition">Servicios</Link>
          {servicio?.title && (
            <>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[#003366]"> {servicio.title}</span>
            </>
          )}
        </nav>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight text-slate-900 mb-8">
          {servicio?.title || (loading ? "Buscando en el catalogo..." : "servicio no encontrado")}
        </h1>

        {err && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 mb-10 text-red-700 font-bold shadow-sm">
            {err}
          </div>
        )}
      </div>

      {/* Galería Swiper Premium */}
      {!loading && servicio && gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-20 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start flex-col-reverse flex w-full">

            {/* Izquierda: Info básica */}
            <div className="relative z-10">
              <div className="inline-block bg-[#003366] text-white text-[10px] font-black tracking-[0.2em] px-4 py-2 rounded-lg mb-6 ">
                Detalles del servicio
              </div>
              <h2 className="text-3xl font-black mb-8 text-slate-900 border-b border-slate-100 pb-4">Descripcion del servicio</h2>
              <p className="text-xl leading-relaxed text-slate-600 font-light mb-10 whitespace-pre-line">
                {descripcion}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-5 py-2 bg-slate-100 text-[#003366] rounded-xl text-sm font-bold border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Derecha: Swiper */}
            <div className="w-full max-w-full overflow-hidden">
              <div className="bg-slate-50 p-2 sm:p-4 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-inner overflow-hidden w-full max-w-full">
                <div className="relative bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">
                  {/* Hyperspeed Background */}
                  <div className="absolute inset-0 w-full h-full -z-10">
                    <Hyperspeed />
                  </div>
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={true}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true
                    }}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    spaceBetween={0}
                    slidesPerView={1}
                    centeredSlides={false}
                    grabCursor={true}
                    loop={gallery.length > 1}
                    breakpoints={{
                      640: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                      },
                      1024: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                      }
                    }}
                    style={{ width: '100%', maxWidth: '100%' }}
                    className="rounded-2xl md:rounded-3xl shadow-2xl galeria-swiper-main w-full"
                  >
                  {gallery.map((url, i) => (
                    <SwiperSlide key={i} className="rounded-2xl overflow-hidden w-full" style={{ width: '100%' }}>
                      <div
                        className="relative aspect-[4/3] bg-white cursor-zoom-in overflow-hidden border border-slate-100 w-full"
                        onClick={() => {
                          setActiveIndex(i);
                          setLightboxOpen(true);
                        }}
                      >
                        {isImageUrl(url) ? (
                          <img
                            src={url}
                            alt={`${servicio?.title || 'servicio'} - Vista ${i + 1}`}
                            className="object-cover w-full h-full hover:scale-110 transition-transform duration-1000"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#003366] font-black">
                            VER IMAGEN
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>

          {/* Lightbox */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={activeIndex}
            slides={gallery.map((url) => ({ src: url }))}
          />
        </div>
      )}

      {/* Características Técnicas + Video */}
      {!loading && servicio && (
        <div className="max-w-7xl mx-auto px-6 pb-24">

          <div className="grid lg:grid-cols-2 gap-12 items-center border-t border-slate-100 pt-20">
            {/* Features list */}
            {features.length > 0 && (
              <div>
                <h3 className="text-3xl font-black text-[#003366] mb-10">Detalles del servicio</h3>
                <div className="grid gap-6">
                  {features.map((f, i) => {
                    const title = typeof f === "string" ? f : f?.title;
                    const desc = typeof f === "string" ? "" : f?.description;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-5 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#003366] flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-1">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">
                            {title}
                          </h4>
                          {desc && <p className="text-slate-600 mt-2 font-medium">{desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video */}
            {videoUrl ? (
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50 ring-1 ring-slate-200">
                <iframe
                  src={videoUrl}
                  title="Video del servicio"
                  className="w-full aspect-video"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="bg-[#003366] rounded-[3rem] p-12 text-white flex flex-col justify-center h-full shadow-2xl">
                <h4 className="text-3xl font-black mb-6 tracking-tight">Reserva tu servicio</h4>
                <p className="text-blue-100 text-lg mb-10 font-light leading-relaxed">
                  Nuestro equipo esta listo para ayudarte a elegir el mejor momento para tu visita.
                </p>
                <div className="flex">
                  <Link
                    to="/contacto"
                    className="bg-white text-[#003366] font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-slate-50 hover:scale-105 transition-all text-center  tracking-widest"
                  >
                    🚀 Hacer una Reserva
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* CTA Mobile / Desktop Final link if video exists */}
          {videoUrl && (
            <div className="text-center mt-20">
              <Link
                to="/contacto"
                className="inline-flex items-center gap-4 bg-[#003366] text-white font-black px-12 py-5 rounded-2xl shadow-2xl hover:scale-105 hover:bg-blue-800 transition-all  tracking-widest"
              >
                🚀 Hacer una Reserva
              </Link>
            </div>
          )}
        </div>
      )}

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema, null, 2) }}
      />
    </section>
  );
}