import { useRef, useState } from "react";
import TurnstileCaptcha from "../components/TurnstileCaptcha";
import clienteAxios from "../config/axios";
import Alerta from "../components/Alerta";
import WhatsappHref from "../utils/WhatsappUrl";
import useCont from "../hooks/useCont";
import SEOHead from "./Head/Head";
import lineasIzq from "../assets/lineasamarillasizq.png";
import lineasDer from "../assets/lineasamarillasder.png";

const TrabajaConNosotros = () => {
  const formRef = useRef(null);
  const turnstileRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [estadoMensaje, setEstadoMensaje] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);
  const { company, contact } = useCont();

  const isLocal = import.meta.env.VITE_ENTORNO === "local";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEstadoMensaje({ tipo: "", texto: "" });

    try {
      const fd = new FormData(formRef.current);

      // Construir FormData con todos los datos incluyendo CV
      const formData = new FormData();
      formData.append("nombre", fd.get("nombre")?.toString().trim() || "");
      formData.append("email", fd.get("email")?.toString().trim() || "");
      formData.append("telefono", fd.get("telefono")?.toString().trim() || "");
      formData.append(
        "puesto_interes",
        fd.get("puesto_interes")?.toString().trim() || "",
      );
      formData.append(
        "experiencia",
        fd.get("experiencia")?.toString().trim() || "",
      );
      formData.append("mensaje", fd.get("mensaje")?.toString().trim() || "");
      formData.append(
        "turnstile_token",
        isLocal ? "local-bypass" : captchaToken,
      );

      // Agregar CV (obligatorio)
      if (fd.get("cv")) {
        formData.append("cv", fd.get("cv"));
      }

      const res = await clienteAxios.post(
        "/api/trabaja-con-nosotros",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const isOk =
        (res.status >= 200 && res.status < 300) || res.data?.success === true;

      if (!isOk) throw new Error(res.data?.message || "Error al enviar");

      setEstadoMensaje({
        tipo: "exito",
        texto:
          res.data?.message ||
          "Tu CV fue enviado con éxito. ¡Nos pondremos en contacto pronto!",
      });

      formRef.current?.reset();
      setCaptchaToken("");
      if (!isLocal && turnstileRef.current?.reset) {
        turnstileRef.current.reset();
      }
    } catch (error) {
      console.error("TrabajaConNosotros error:", error);
      setEstadoMensaje({
        tipo: "error",
        texto:
          error.response?.data?.message ||
          error.message ||
          "Hubo un error al enviar tu CV. Por favor intenta de nuevo.",
      });
      if (!isLocal && turnstileRef.current?.reset) {
        turnstileRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-slate-50 py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 z-0 hidden w-48 h-full pointer-events-none select-none lg:block opacity-60"
        style={{
          backgroundImage: `url(${lineasDer})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "contain",
          backgroundPosition: "left top",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 z-0 hidden w-48 h-full pointer-events-none select-none lg:block opacity-60"
        style={{
          backgroundImage: `url(${lineasIzq})`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "contain",
          backgroundPosition: "right top",
        }}
      />
      <SEOHead
        priority="low"
        title={`Anka Loo Construcciones | Trabaja Con Nosotros`}
        description={`Envía tu CV y únete al equipo de Anka Loo Construcciones. Buscamos profesionales talentosos para impulsar la transformación digital.`}
      />

      {/* Glow decorativo */}
      <div className="absolute -top-32 -right-40 w-[500px] h-[500px] bg-[#fdce27]/8 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#fdce27]/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-white/3 rounded-full blur-3xl"></div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Encabezado */}
        <header className="text-center mb-16">
          <h1 className="text-2xl md:text-5xl font-black text-[#1c1c1c] mt-6 mb-4 leading-tight">
            Trabaja con <span className="text-[#fdce27]">Nosotros</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Completá el formulario con tus datos y adjuntá tu CV. Nuestro equipo
            se pondrá en contacto si hay una vacante disponible.
          </p>
        </header>

        {/* Layout de solicitud */}
        <div className="grid lg:grid-cols-12 gap-12 bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
          {/* Info Lateral */}
          <div className="lg:col-span-4 bg-[#1c1c1c] p-10 text-white flex flex-col justify-between relative overflow-hidden border-r-4 border-[#fdce27]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#fdce27]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#fdce27]/5 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-8 text-[#fdce27]  tracking-wide">
                ¿Por Qué Unirse?
              </h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[#fdce27] text-xs font-black  tracking-widest mb-1">
                    Crecimiento
                  </p>
                  <p className="text-lg font-medium text-slate-200">
                    Participación en grandes obras de infraestructura
                  </p>
                </div>
                <div>
                  <p className="text-[#fdce27] text-xs font-black  tracking-widest mb-1">
                    Equipo
                  </p>
                  <p className="text-lg font-medium text-slate-200">
                    Trabajá con profesionales de la construcción
                  </p>
                </div>
                <div>
                  <p className="text-[#fdce27] text-xs font-black  tracking-widest mb-1">
                    Tecnología
                  </p>
                  <p className="text-lg font-medium text-slate-200">
                    Equipos de última generación en cada obra
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#fdce27]/20 relative z-10">
              <p className="text-slate-300 text-sm font-bold tracking-[0.15em] ">
                Tu carrera comienza aquí
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-8 p-10 md:p-12 bg-white">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-slate-900 font-black text-sm  tracking-wider">
                    Nombre y Apellido
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Ej: Juan Pérez"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-900 font-black text-sm  tracking-wider">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Ej: +54 9 351..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 font-black text-sm  tracking-wider">
                  Email de contacto
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@email.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-slate-900 font-black text-sm  tracking-wider">
                    Puesto de Interés{" "}
                    <span className="text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="puesto_interes"
                    placeholder="Ej: Operador de Maquinaria, Ingeniero Civil..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-900 font-black text-sm  tracking-wider">
                    Años de Experiencia{" "}
                    <span className="text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="experiencia"
                    placeholder="Ej: 5+ años en construcción"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 font-black text-sm  tracking-wider">
                  Carta de Presentación (opcional)
                </label>
                <textarea
                  name="mensaje"
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-900 placeholder-slate-400 resize-none"
                  placeholder="Cuéntanos un poco sobre ti y por qué te interesa unirte a nuestro equipo..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 font-black text-sm  tracking-wider">
                  Adjuntar CV (obligatorio)
                </label>
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.doc,.docx"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] transition-all font-medium text-slate-700 text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Máx. 5MB. Formatos aceptados: PDF, DOC, DOCX
                </p>
              </div>

              {!isLocal && (
                <div className="py-2">
                  <TurnstileCaptcha
                    ref={turnstileRef}
                    onVerify={setCaptchaToken}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#fdce27] hover:bg-[#e6b800] text-[#1c1c1c] font-black px-5 py-2 shadow-xl shadow-[#fdce27]/20 hover:scale-[1.02] transition-all disabled:opacity-60 active:scale-95"
                  disabled={loading || (!isLocal && !captchaToken)}
                >
                  {loading ? "ENVIANDO..." : "ENVIAR CV"}
                </button>
              </div>

              {estadoMensaje.texto && (
                <div className="mt-6">
                  <Alerta tipo={estadoMensaje.tipo}>
                    {estadoMensaje.texto}
                  </Alerta>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrabajaConNosotros;
