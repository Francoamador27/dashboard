import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import React from "react";

const Comparacion = () => {
  return (
    <section className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">
            Transformación Digital con{" "}
            <span className="text-[#003366]">Anka Loo Construcciones</span>
          </h2>
          <p className="text-2xl text-slate-600 font-light max-w-2xl mx-auto">
            Descubre la diferencia entre sistemas heredados y soluciones
            tecnológicas modernas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Antes */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-400"></div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">⚙️</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900">
                Sistemas Heredados
              </h3>
            </div>
            <ul className="space-y-6">
              {[
                "Procesos manuales y lentitud operativa",
                "Pérdida de datos y falta de seguridad",
                "Sistemas desconectados e incompatibles",
                "Mantenimiento costoso y problemas frecuentes",
                "Escalabilidad limitada y restrictiva",
                "Tecnología obsoleta que se degrada",
                "Bajo ROI y competitividad limitada",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4 text-slate-600 group-hover:translate-x-1 transition-transform"
                >
                  <div className="mt-1 flex-shrink-0">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-lg font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Después */}
          <div className="bg-[#003366] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,51,102,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-3xl font-black text-white">
                Anka Loo Construcciones
              </h3>
            </div>
            <ul className="space-y-6">
              {[
                "Automatización y optimización de procesos",
                "Seguridad integral y backup garantizado",
                "Integración completa de sistemas",
                "Soporte técnico proactivo y confiable",
                "Escalabilidad infinita y flexible",
                "Tecnología de punta y actualizada",
                "ROI inmediato y ventaja competitiva",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4 text-blue-50 group-hover:translate-x-1 transition-transform"
                >
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-lg font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparacion;
