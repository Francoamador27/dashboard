import { Suspense, lazy } from "react";
import FeatureSection from "../components/FeatureSection";
import AnkalooHighlights from "../components/AnkalooHighlights";
import LazyRender from "../components/LazyRender";
import useCont from "../hooks/useCont";
import SEOHead from "../components/Head/Head";
import SplitText from "../components/SplitText";
import SplashCursor from "../components/SplashCursor";
import CirularGallery from "../components/CircularGallery";
import VideoMain from "../components/VideoMain";
import CategoriasServicios from "../components/CategoriasServicios";
import QuienesSomos from "../components/QuienesSomos";
const Contacto = lazy(() => import("../components/Contacto"));
const ServiciosFront = lazy(() => import("../components/ServiciosFront"));
const ComoComprar = lazy(() => import("../components/Items"));
const Testimonials = lazy(() => import("./Testimonials"));
const Beneficios = lazy(() => import("../components/Beneficios"));
const Comparacion = lazy(() => import("../components/Comparacion"));
const Cta = lazy(() => import("../components/Cta"));

const Inicio = () => {
  const { company } = useCont();
  return (
    <>
      <div className="">
        <FeatureSection />
        <AnkalooHighlights />
        <Suspense fallback={<div style={{ minHeight: 320 }} />}>
          <CategoriasServicios />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: 520 }} />}>
          <ServiciosFront sliders />
        </Suspense>
        {/* <LazyRender minHeight={320}>
          <Suspense fallback={<div style={{ minHeight: 320 }} />}>
            <ComoComprar />
          </Suspense>
        </LazyRender> */}
        <LazyRender minHeight={520}></LazyRender>

        <LazyRender minHeight={420}>
          <Suspense fallback={<div style={{ minHeight: 420 }} />}>
            <VideoMain url={company.video_principal} />
          </Suspense>
        </LazyRender>

        {/* <LazyRender minHeight={420}>
          <Suspense fallback={<div style={{ minHeight: 420 }} />}>
            <Contacto />
          </Suspense>
        </LazyRender> */}
        <SEOHead
          priority="high"
          title={`${company.name} | Soluciones Tecnológicas`}
        />
      </div>
    </>
  );
};

export default Inicio;
