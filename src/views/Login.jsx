import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import Alerta from "../components/Alerta";
import UseAuth from "../hooks/useAuth";
import clienteAxios from "../config/axios";
import TurnstileCaptcha from "../components/TurnstileCaptcha";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaLogin, setCaptchaLogin] = useState("");
  const [captchaReset, setCaptchaReset] = useState("");

  const [errores, setErrores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [emailReset, setEmailReset] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [verPassword, setVerPassword] = useState(false);

  // Referencias para resetear Turnstile
  const turnstileLoginRef = useRef(null);
  const turnstileResetRef = useRef(null);

  const { login } = UseAuth({ middleware: "guest", url: "/mi-cuenta" });

  // Leer entorno
  const entorno = import.meta.env.VITE_ENTORNO;
  const esLocal = entorno === "local";

  const toMsg = (e) => {
    if (!e) return "";
    if (typeof e === "string") return e;
    if (Array.isArray(e)) return e.join(" ");
    if (typeof e === "object") return Object.values(e).flat().join(" ");
    return String(e);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrores(null);
    setLoading(true);

    try {
      const datos = {
        email,
        password,
        turnstile_token: esLocal ? "local-bypass" : captchaLogin,
      };

      await login(datos, setErrores, setLoading);

      // Si hubo error, reiniciar captcha
      if (!esLocal && turnstileLoginRef.current?.reset) {
        turnstileLoginRef.current.reset();
      }
      setCaptchaLogin("");
    } catch (error) {
      // Reiniciar captcha en caso de error
      if (!esLocal && turnstileLoginRef.current?.reset) {
        turnstileLoginRef.current.reset();
      }
      setCaptchaLogin("");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrores(null);
    setMensaje("");

    try {
      const { data } = await clienteAxios.post("/api/forgot-password", {
        email: emailReset,
        turnstile_token: esLocal ? "local-bypass" : captchaReset,
      });

      setMensaje(data.message);

      // Reiniciar captcha después de envío exitoso
      if (!esLocal && turnstileResetRef.current?.reset) {
        turnstileResetRef.current.reset();
      }
      setCaptchaReset("");
    } catch (error) {
      const api = error.response?.data;
      setErrores(api?.errors || api?.message || "Ocurrió un error");

      // Reiniciar captcha en caso de error
      if (!esLocal && turnstileResetRef.current?.reset) {
        turnstileResetRef.current.reset();
      }
      setCaptchaReset("");
    }
  };

  // Validaciones
  const camposLoginCompletos =
    email.trim() !== "" && password.trim() !== "" && (esLocal || captchaLogin);
  const camposResetCompletos =
    emailReset.trim() !== "" && (esLocal || captchaReset);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] px-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#fdce27] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#1c1c1c] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative perspective">
        <div
          className={`transition-transform duration-700 relative w-full transform-style-preserve-3d ${showReset ? "rotate-y-180" : ""}`}
        >
          {/* Login */}
          <div
            className={`relative backface-hidden bg-white border border-slate-200 border-b-4 border-b-[#fdce27] shadow-md p-8 ${showReset ? "pointer-events-none" : ""}`}
          >
            <div className="flex flex-col justify-center items-center space-y-2 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 bg-[#fdce27]"></div>
                <span className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
                  Acceso
                </span>
                <div className="h-1 w-8 bg-[#fdce27]"></div>
              </div>
              <h2 className="text-2xl font-black text-[#1c1c1c] tracking-tight">
                Iniciar sesión
              </h2>
              <p className="text-sm text-[#5a5a5a] font-light">
                Ingresá tus datos a continuación.
              </p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                className="w-full px-4 py-3 border border-slate-200 text-sm text-[#1c1c1c] placeholder-slate-400 focus:border-[#fdce27] focus:outline-none focus:ring-2 focus:ring-[#fdce27]/20 transition-all"
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative z-20">
                <input
                  className="w-full px-4 py-3 border border-slate-200 text-sm text-[#1c1c1c] placeholder-slate-400 focus:border-[#fdce27] focus:outline-none focus:ring-2 focus:ring-[#fdce27]/20 transition-all pr-12"
                  placeholder="Contraseña"
                  type={verPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#1c1c1c] transition-colors"
                  onClick={() => setVerPassword(!verPassword)}
                  aria-label={
                    verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {verPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errores && (
                <div className="space-y-1">
                  <Alerta>{toMsg(errores)}</Alerta>
                </div>
              )}

              {!esLocal && (
                <TurnstileCaptcha
                  ref={turnstileLoginRef}
                  onVerify={setCaptchaLogin}
                />
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setErrores(null);
                    setMensaje("");
                  }}
                  className="text-xs font-black tracking-wide text-[#1c1c1c] hover:text-[#fdce27] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                className={`w-full py-3 text-sm font-black tracking-wider transition-all ${camposLoginCompletos ? "bg-[#1c1c1c] text-[#fdce27] hover:bg-[#fdce27] hover:text-[#1c1c1c]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                type="submit"
                disabled={loading || !camposLoginCompletos}
              >
                {loading ? "Cargando..." : "INICIAR SESIÓN"}
              </button>
            </form>
          </div>

          {/* Recuperación */}
          <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 border-b-4 border-b-[#fdce27] shadow-md p-8 rotate-y-180 overflow-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-1 w-8 bg-[#fdce27]"></div>
                <span className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
                  Recuperar
                </span>
                <div className="h-1 w-8 bg-[#fdce27]"></div>
              </div>
              <h2 className="text-xl font-black text-[#1c1c1c] tracking-tight">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-sm text-[#5a5a5a] font-light mt-1">
                Te enviaremos un email para recuperarla
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-slate-200 text-sm text-[#1c1c1c] placeholder-slate-400 focus:border-[#fdce27] focus:outline-none focus:ring-2 focus:ring-[#fdce27]/20 transition-all"
                type="email"
                placeholder="Tu correo"
                value={emailReset}
                onChange={(e) => setEmailReset(e.target.value)}
              />

              {errores && (
                <div className="space-y-1">
                  <Alerta>{toMsg(errores)}</Alerta>
                </div>
              )}

              {mensaje && (
                <div className="bg-[#fdce27]/10 text-[#1c1c1c] border border-[#fdce27]/30 px-4 py-3 text-sm font-medium">
                  {mensaje}
                </div>
              )}

              {!esLocal && (
                <TurnstileCaptcha
                  ref={turnstileResetRef}
                  onVerify={setCaptchaReset}
                />
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  className="text-xs font-black tracking-wide text-[#1c1c1c] hover:text-[#fdce27] transition-colors"
                  onClick={() => {
                    setShowReset(false);
                    setErrores(null);
                    setMensaje("");
                  }}
                >
                  ← Volver
                </button>

                <button
                  type="submit"
                  disabled={!camposResetCompletos}
                  className={`px-6 py-3 text-xs font-black tracking-wider transition-all ${camposResetCompletos ? "bg-[#1c1c1c] text-[#fdce27] hover:bg-[#fdce27] hover:text-[#1c1c1c]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                >
                  ENVIAR CORREO
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
