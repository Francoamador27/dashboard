import { Link } from "react-router-dom";
import { Leaf, Users, ShieldCheck, MapPin } from "lucide-react";

export default function AnkalooHighlights() {
  const items = [
    {
      icon: <Leaf size={36} strokeWidth={1.5} />,
      title: "Compromiso con la sustentabilidad",
      desc: "En Anka Loo trabajamos con una mirada de triple impacto en el desempeño de las tareas y procesos.",
      button: "Ver ",
      route: "/compromiso",
    },
    {
      icon: <Users size={36} strokeWidth={1.5} />,
      title: "Nuestra Gente",
      desc: "Nuestro diferencial está en la gestión de nuestra gente y en la incorporación de tecnología para cumplir plazos, optimizar costos y satisfacer a nuestros clientes.",
      button: "Ver",
      route: "/quienes-somos",
    },
    {
      icon: <ShieldCheck size={36} strokeWidth={1.5} />,
      title: "Calidad Certificada",
      desc: "Certificados ISO 9001, 14001 y 45001 que garantizan nuestros estándares de calidad.",
      button: "Ver ",
      route: "/calidad",
    },
  ];

  return (
    <section className="bg-slate-50 py-10 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white border border-slate-200 hover:border-[#fdce27]/40 p-8 transition-all duration-300 hover:shadow-md flex flex-col"
            >
              {/* Icono */}
              <div className="text-slate-400 group-hover:text-[#1c1c1c] transition-colors duration-300 mb-4">
                {item.icon}
              </div>

              {/* Acento dorado */}
              <div className="w-5 h-1.5 bg-[#fdce27] mb-4"></div>

              {/* Título */}
              <h3 className="text-lg font-black text-[#1c1c1c] mb-3 leading-snug">
                {item.title}
              </h3>

              {/* Descripción */}
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                {item.desc}
              </p>
              {/* Botón Estilo Industrial */}
              <Link
                to={item.route}
                className="inline-flex items-center gap-2 mt-auto pt-6 opacity-70 hover:opacity-100 transition-all duration-300 hover:translate-x-1 group/btn"
              >
                <span className="text-[10px] font-black tracking-[0.15em] text-[#1c1c1c] uppercase">
                  {item.button || "Ver detalles"}
                </span>
                <div className="w-6 h-6 bg-[#fdce27] flex items-center justify-center transition-transform duration-300 group-hover/btn:scale-110">
                  <svg
                    className="w-3 h-3 text-[#1c1c1c]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
