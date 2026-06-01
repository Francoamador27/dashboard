import FallingText from "./FallingText";
import senalador from "../assets/senaladoramarillo.png";
export default function QuienesSomos() {
  return (
    <section
      id="quienes-somos"
      className="relative bg-slate-50 py-24 px-6 overflow-hidden"
    >
      {/* Elementos decorativos de fondo - Orbes azules */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#fdce27] rounded-full blur-3xl"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fdce27] rounded-full blur-3xl"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header SEO */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-[#1c1c1c] mb-4 tracking-tight ">
            Somos Anka Loo Construcciones
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Empresa constructora de Córdoba especializada en obras hidráulicas,
            viales, saneamiento ambiental y urbanizaciones. Tecnología de
            vanguardia en cada proyecto.
          </p>
        </div>

        {/* Contenido en Layout Grid para Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-20">
          {/* Izquierda: Misión y Valores */}
          <div className="space-y-6">
            {/* Card de propósito */}
            <div className="group relative bg-white border border-slate-200 hover:border-[#fdce27]/60 p-8 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#fdce27]"></div>

              <div className="relative z-10 pl-4">
                <h4 className="text-2xl font-black text-[#1c1c1c] mb-4 flex items-center gap-3  tracking-wider">
                  <img
                    src={senalador}
                    alt=""
                    className="w-6 h-6 object-contain"
                  />{" "}
                  Nuestra Misión
                </h4>
                <p className="text-slate-600 leading-relaxed text-base">
                  Brindar a nuestros clientes servicios de{" "}
                  <span className="text-[#fdce27] font-bold">
                    alta calidad constructiva
                  </span>
                  , poniendo a su disposición profesionales de formación
                  específica, maquinarias y tecnología de última generación para
                  alcanzar excelentes resultados.
                </p>
              </div>
            </div>

            {/* Card de visión */}
            <div className="group relative bg-white border border-slate-200 hover:border-[#fdce27]/40 p-8 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-[#fdce27] transition-all duration-500"></div>

              <div className="relative z-10 pl-4">
                <h4 className="text-2xl font-black text-[#1c1c1c] mb-4 flex items-center gap-3  tracking-wider">
                  <img
                    src={senalador}
                    alt=""
                    className="w-6 h-6 object-contain"
                  />{" "}
                  Nuestra Visión
                </h4>
                <p className="text-slate-600 leading-relaxed text-base">
                  Nuestra visión es consolidarnos como una empresa referente,
                  ampliando nuestra participación en los sectores público y
                  privado. Aspiramos asumir proyectos de creciente complejidad,
                  promoviendo la innovación, la excelencia y un impacto positivo
                  en la comunidad.
                </p>
              </div>
            </div>

            {/* Card de especialización */}
            <div className="group relative bg-white border border-slate-200 hover:border-[#fdce27]/40 p-8 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-[#fdce27] transition-all duration-500"></div>

              <div className="relative z-10 pl-4">
                <h4 className="text-2xl font-black text-[#1c1c1c] mb-4 flex items-center gap-3  tracking-wider">
                  <img
                    src={senalador}
                    alt=""
                    className="w-6 h-6 object-contain"
                  />{" "}
                  Nuestra Especialización
                </h4>
                <p className="text-slate-600 leading-relaxed text-base">
                  Con oficinas en{" "}
                  <span className="text-[#fdce27] font-bold">
                    Córdoba Capital
                  </span>
                  , operamos en todo el país brindando soluciones de
                  infraestructura viales, hidráulicas y de saneamiento ambiental
                  con equipos de última generación.
                </p>
              </div>
            </div>
          </div>

          {/* Derecha: Servicios principales */}
          <div className="relative">
            <div className="group relative bg-white border border-slate-200 p-10 hover:border-[#fdce27]/40 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute top-0 right-0 w-60 h-60 bg-[#fdce27]/5 rounded-full blur-3xl -z-0"></div>

              <div className="relative z-10">
                <h3 className="text-3xl font-black text-[#1c1c1c] mb-2  tracking-wide">
                  Por qué elegirnos
                </h3>
                <p className="text-[#fdce27] font-bold mb-6 text-sm tracking-[0.2em] ">
                  Calidad Comprobada
                </p>

                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  Contamos con amplia experiencia en obras de infraestructura.
                  Nuestro equipo de profesionales especializados y equipos de
                  última generación garantizan resultados de excelencia en cada
                  proyecto.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 flex-wrap gap-4">
                  {[
                    { title: "Obras Viales", desc: "Rutas, caminos y puentes" },
                    {
                      title: "Obras Hidráulicas",
                      desc: "Canales, acueductos y sistemas hídricos",
                    },
                    {
                      title: "Saneamiento",
                      desc: "Redes cloacales y medioambiente",
                    },
                    {
                      title: "Urbanizaciones",
                      desc: "Infraestructura de barrios y loteos",
                    },
                    {
                      title: "Obras Civiles",
                      desc: "Estructuras de hormigón e industriales",
                    },
                    {
                      title: "Maquinaria de Última Generación",
                      desc: "Operadores certificados",
                    },
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="group/item relative flex gap-4 p-4 bg-white border border-slate-200 hover:border-[#fdce27]/40 hover:bg-slate-50 transition-all duration-300"
                    >
                      {/* Borde izquierdo dorado */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#fdce27]/40 group-hover/item:bg-[#fdce27] transition-colors duration-300"></div>

                      <img
                        src={senalador}
                        alt=""
                        className="mt-1 w-4 h-4 object-contain flex-shrink-0"
                      />

                      <div className="flex-1">
                        <p className="font-black text-[#1c1c1c] text-sm group-hover/item:text-[#b89200] transition-colors duration-300  tracking-wide">
                          {item.title}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
