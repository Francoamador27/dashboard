import { Search, Layout } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import { useEffect, useState } from 'react';

import img1 from '../assets/img/ejemplos/ejemplo-1.jpg';
import img2 from '../assets/img/ejemplos/ejemplo-2.jpg';
import img3 from '../assets/img/ejemplos/ejemplo-3.jpg';
import img4 from '../assets/img/ejemplos/ejemplo-4.jpg';
import img5 from '../assets/img/ejemplos/ejemplo-5.jpg';
import img6 from '../assets/img/ejemplos/ejemplo-6.jpg';
import GaleriaSwiper from "./GaleriaSwiper";
import SEOHead from "./Head/Head";
import useCont from "../hooks/useCont";

export default function Ejemplos() {
   const {company} = useCont();
  const [index, setIndex] = useState(-1);
  const isMobile = window.innerWidth < 640;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const project = {
    title: "Experiencias de Viaje Inolvidables",
    description:
      `En ${company.name} somos expertos en crear experiencias turísticas únicas y personalizadas. Ofrecemos Servicios integrales a los mejores destinos del mundo, priorizando tu comodidad, seguridad y satisfacción en cada viaje.`,
    tags: [
      "Servicios ",
      "Viajes Personalizados",
      "Destinos Exóticos",
      "All Inclusive",
      "Agencia de Viajes",
      "Tours Exclusivos"
    ],
    type: "Agencia de Viajes",
    mainImage: img1,
    gallery: [
      img2,
      img3,
      img4,
      img5,
      img6
    ],
    features: [
      {
        title: "Destinos Exclusivos",
        description: "Seleccionamos cuidadosamente los mejores destinos del mundo, desde playas paradisíacas hasta ciudades históricas y aventuras en la naturaleza."
      },
      {
        title: "Servicios Premium",
        description: "Ofrecemos Servicios de primera calidad con alojamientos 4 y 5 estrellas, traslados privados y experiencias VIP en cada destino."
      },
      {
        title: "Viajes a Medida",
        description: "Diseñamos cada viaje según tus preferencias, presupuesto y necesidades específicas, creando experiencias completamente personalizadas."
      },
      {
        title: "Itinerarios Exclusivos",
        description: "Creamos rutas únicas con actividades inolvidables, desde tours guiados hasta experiencias gastronómicas y culturales auténticas."
      },
      {
        title: "Asistencia 24/7",
        description: "Nuestro equipo de soporte está disponible en todo momento durante tu viaje, garantizando tranquilidad y respuesta inmediata ante cualquier situación."
      },
      {
        title: "Seguro Completo",
        description: "Todos nuestros Servicios incluyen seguro de viaje integral, cobertura médica y protección ante imprevistos."
      }
    ]
  };

  const galleryImages = [project.mainImage, ...project.gallery].map(src => ({ src }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 ">
      <SEOHead
        priority="high"
        title={`Galeria de imagenes de ${company.name} `}
        description={`Descubre nuestros Servicios  exclusivos. Experiencias únicas en los mejores destinos del mundo con ${company.name}.`}
      />
      <p className="text-gray-400 mb-2 flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-[#0891b2]" />
          {project.type}
        </span>
      </p>

      <h1 className="text-4xl font-bold thea-amelia">Experiencias de Viaje <span className="text-[#0891b2] thea-amelia text-5xl">Inolvidables</span></h1>
      <p className="text-lg text-gray-400 mt-2">{project.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {project.tags.map((tag, i) => (
          <span key={i} className="bg-neutral-800 text-white text-sm px-3 py-1 rounded-full border border-neutral-700">
            {tag}
          </span>
        ))}
      </div>

      {/* Galería */}
      <div className="mt-8">
        <GaleriaSwiper />
      </div>


      {/* Características */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 thea-amelia">Nuestros <span className="text-[#0891b2] thea-amelia text-3xl">Servicios</span></h2>
        <div className="grid md:grid-cols-2 gap-8">
          {project.features.map((feature, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold  mb-1">🔸 {feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
