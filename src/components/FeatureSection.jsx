import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import clienteAxios from "../config/axios";
import useCont from "../hooks/useCont";
import WhatsappHref from "../utils/WhatsappUrl";

function getYoutubeVideoId(url = "") {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }
    if (parsedUrl.pathname.startsWith("/embed/")) {
      return parsedUrl.pathname.split("/embed/")[1];
    }
    return parsedUrl.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

function SlideBackground({ slide }) {
  if (slide.background_type === "youtube" && slide.youtube_url) {
    const videoId = getYoutubeVideoId(slide.youtube_url);
    const src = videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1`
      : slide.youtube_url;

    return (
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="w-full h-full scale-125 pointer-events-none"
          src={src}
          title={slide.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (slide.image) {
    return (
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return <div className="absolute inset-0 bg-black" />;
}

// Componente separado que siempre renderiza Swiper para mantener consistencia de hooks
function HeroSwiper({ slides }) {
  return (
    <div className="relative w-full h-full">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        loop={slides.length > 1}
        className="hero-swiper w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="h-full">
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <SlideBackground slide={slide} />
              <div className="absolute inset-0 bg-black/50" />
              {/* Content */}
              <div className="relative z-10 w-full max-w-5xl px-16 lg:px-24 mx-auto text-center">
                {/* Label corporativo */}


                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-[1.15] tracking-[0.02em] drop-shadow-lg">
                  {slide.title}
                </h1>

                <p className="max-w-xl mx-auto text-base md:text-lg text-white/75 font-light leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default function HeroFeatures() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { contact } = useCont();

  // Fetch sliders
  useEffect(() => {
    let mounted = true;

    const fetchSlides = async () => {
      try {
        const { data } = await clienteAxios.get("/api/sliders");
        if (mounted && Array.isArray(data?.data) && data.data.length > 0) {
          setSlides(data.data);
        }
      } catch (error) {
        console.error("Error cargando sliders", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Ejecutar inmediatamente sin esperar
    fetchSlides();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative w-full h-[85vh] min-h-screen overflow-hidden">
      {/* Contenido encima */}
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
          <div className="relative z-10 text-center">
            {/* Spinner corporativo */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              {/* Borde gold */}
              <div className="absolute inset-0 border-transparent border-t-[#fdce27] border-r-[#fdce27]/50 rounded-full animate-spin"></div>
              {/* Centro */}
              <div className="absolute inset-3 bg-[#fdce27]/20 rounded-full"></div>
            </div>
            <p className="text-white text-sm font-bold tracking-[0.3em] ">
              Cargando...
            </p>
          </div>
        </div>
      ) : slides.length > 0 ? (
        <div className="absolute inset-0 z-10">
          <HeroSwiper slides={slides} contact={contact} />
        </div>
      ) : null}
    </section>
  );
}
