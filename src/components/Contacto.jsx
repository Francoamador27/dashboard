import { useRef, useState } from "react";
import TurnstileCaptcha from "../components/TurnstileCaptcha";
import clienteAxios from "../config/axios";
import Alerta from "../components/Alerta";
import WhatsappHref from "../utils/WhatsappUrl";
import useCont from "../hooks/useCont";
import SEOHead from "./Head/Head";
import lineasIzq from "../assets/lineasamarillasizq.png";
import lineasDer from "../assets/lineasamarillasder.png";

const Contacto = () => {
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

      // Construir FormData con todos los datos incluyendo archivo
      const formData = new FormData();
      formData.append("nombre", fd.get("nombre")?.toString().trim() || "");
      formData.append("email", fd.get("email")?.toString().trim() || "");
      formData.append("telefono", fd.get("telefono")?.toString().trim() || "");
      formData.append("mensaje", fd.get("mensaje")?.toString().trim() || "");
      formData.append("asunto", fd.get("asunto")?.toString().trim() || "");
      formData.append(
        "turnstile_token",
        isLocal ? "local-bypass" : captchaToken,
      );

      // Agregar archivo si existe
      if (fd.get("archivo")) {
        formData.append("archivo", fd.get("archivo"));
      }

      const res = await clienteAxios.post("/api/contacto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const isOk =
        (res.status >= 200 && res.status < 300) || res.data?.success === true;

      if (!isOk) throw new Error(res.data?.message || "Error al enviar");

      setEstadoMensaje({
        tipo: "exito",
        texto:
          res.data?.message ||
          "Tu consulta fue enviada con éxito. Un asesor técnico se contactará pronto.",
      });

      formRef.current?.reset();
      setCaptchaToken("");
      if (!isLocal && turnstileRef.current?.reset) {
        turnstileRef.current.reset();
      }
    } catch (error) {
      console.error("Contacto error:", error);
      setEstadoMensaje({
        tipo: "error",
        texto:
          error.response?.data?.message ||
          error.message ||
          "Hubo un error al enviar el mensaje. Podés escribirnos por WhatsApp.",
      });
      if (!isLocal && turnstileRef.current?.reset) {
        turnstileRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden bg-white">
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
        title={`Anka Loo Construcciones | Contacto`}
        description={`Contactate con Anka Loo Construcciones para conocer nuestras soluciones tecnológicas. Te ayudamos a digitalizar tu empresa.`}
      />

      {/* Glow decorativo */}
      <div className="absolute -top-32 -right-40 w-[500px] h-[500px] bg-[#fdce27]/8 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#1c1c1c]/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-5xl px-6 mx-auto">
        {/* Encabezado */}
        <header className="mb-16 text-center">
          <h1 className="mt-6 mb-4 text-2xl font-black leading-tight tracking-tight md:text-5xl text-[#fdce27]">
            Contacto
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 font-light">
            Dejanos tus comentarios en el siguiente formulario, con tus datos
            completos, para que podamos responderte. Muchas Gracias.
          </p>
        </header>

        {/* Layout de contacto */}
        <div className="grid lg:grid-cols-12 gap-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          {/* Info Lateral */}
          <div className="lg:col-span-4 bg-[#1c1c1c] border-r-4 border-[#fdce27] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#fdce27]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#fdce27]/5 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-8  tracking-wide border-b border-[#fdce27]/30 pb-4">
                Información de Contacto
              </h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[#fdce27] text-xs font-black  tracking-widest mb-1">
                    Nuestra Sede Corporativa
                  </p>
                  <p className="text-lg font-medium">
                    {company.address || "Córdoba, Argentina"}
                  </p>
                </div>
                <div>
                  <p className="text-[#fdce27] text-xs font-black  tracking-widest mb-1">
                    Email Corporativo
                  </p>
                  <p className="text-lg font-medium">
                    {contact.email || "info@ankaloo.com"}
                  </p>
                </div>
                <div>
                  <p className="text-[#fdce27] text-xs font-black  tracking-widest mb-1">
                    Horario
                  </p>
                  <p className="text-lg font-medium">
                    {company.business_hours || "Lun a Vie: 09:00 - 18:00hs"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#fdce27]/20 relative z-10">
              <p className="text-white/70 text-sm font-bold tracking-[0.15em] ">
                Construyendo el futuro
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-10 lg:col-span-8 md:p-12">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-black tracking-wider text-slate-900">
                    Nombre y Apellido
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Ej: Juan Pérez"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#003366]/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black tracking-wider text-slate-900">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Ej: +54 9 351..."
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#0891b2]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black tracking-wider text-slate-900">
                  Email de contacto
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@email.com"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#0891b2]/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black tracking-wider text-slate-900">
                  Asunto <span className="text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <select
                    name="asunto"
                    className="block w-full bg-slate-50 border-none rounded-2xl pl-6 pr-14 py-4 focus:ring-4 focus:ring-[#0891b2]/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Consulta">Consulta</option>
                    <option value="Sugerencia">Sugerencia</option>
                    <option value="Reclamo">Reclamo</option>
                    <option value="Agradecimiento">Agradecimiento</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black tracking-wider text-slate-900">
                  Comentario
                </label>
                <textarea
                  name="mensaje"
                  rows="4"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#0891b2]/20 transition-all font-medium resize-none"
                  placeholder="Dejanos tu comentario..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black tracking-wider text-slate-900">
                  Adjuntar archivo <span className="text-xs">(opcional)</span>
                </label>
                <input
                  type="file"
                  name="archivo"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[#0891b2]/20 transition-all font-medium text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Máx. 5MB. Formatos: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
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

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 bg-[#1c1c1c] hover:bg-[#2c2c2c] border-2 border-[#fdce27] text-white font-black px-4 py-2 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 active:scale-95"
                  disabled={loading || (!isLocal && !captchaToken)}
                >
                  {loading ? "ENVIANDO..." : "ENVIAR CONSULTA"}
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

export default Contacto;
