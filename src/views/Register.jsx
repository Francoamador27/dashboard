import { Link } from "react-router-dom";
import { createRef, useState } from "react";
import Alerta from "../components/Alerta";
import UseAuth from "../hooks/useAuth";
import TurnstileCaptcha from "../components/TurnstileCaptcha";

const Register = () => {
  const { register } = UseAuth({ middleware: "guest", url: "/mi-cuenta" });
  const esLocal = import.meta.env.VITE_ENTORNO === "local";

  // 👈 Si es local, no requiere captcha
  const nameRef = createRef();
  const emailRef = createRef();
  const passwordRef = createRef();
  const repeatPasswordRef = createRef();

  const [captchaRegister, setCaptchaRegister] = useState("");
  const [errores, setErrores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [verRepeatPassword, setVerRepeatPassword] = useState(false);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const handleInputChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const camposCompletos =
    formState.name &&
    formState.email &&
    formState.password &&
    formState.repeatPassword &&
    (esLocal || captchaRegister);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores([]);
    setLoading(true);

    const datos = {
      name: formState.name,
      email: formState.email,
      password: formState.password,
      password_confirmation: formState.repeatPassword,
      turnstile_token: captchaRegister,
    };

    if (datos.password !== datos.password_confirmation) {
      setErrores(["Las contraseñas no coinciden"]);
      setLoading(false);
      return;
    }

    await register(datos, setErrores);
  };

  return (
    <></>
    // <div className='min-h-screen flex items-center justify-center bg-gray-100'>
    //     <div>
    //         <div className="w-80 rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden">
    //             <div className="flex flex-col justify-center items-center space-y-2">
    //                 <h2 className="text-2xl font-medium text-slate-700">Registrarme</h2>
    //                 <p className="text-slate-500">Ingresá tus datos a continuación.</p>
    //             </div>

    //             <form onSubmit={handleSubmit} className="w-full mt-4 space-y-3">
    //                 <input
    //                     className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
    //                     placeholder="Nombre"
    //                     id="name"
    //                     name="name"
    //                     autoComplete="name"
    //                     type="text"
    //                     ref={nameRef}
    //                     value={formState.name}
    //                     onChange={handleInputChange}
    //                 />
    //                 <input
    //                     className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
    //                     placeholder="Correo electrónico"
    //                     id="email"
    //                     name="email"
    //                     type="email"
    //                     autoComplete="email"
    //                     ref={emailRef}
    //                     value={formState.email}
    //                     onChange={handleInputChange}
    //                 />
    //                 <div className="relative">
    //                     <input
    //                         className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full pr-10 focus:border-blue-300"
    //                         placeholder="Contraseña"
    //                         id="password"
    //                         name="password"
    //                         type={verPassword ? 'text' : 'password'}
    //                         autoComplete="new-password"
    //                         ref={passwordRef}
    //                         value={formState.password}
    //                         onChange={handleInputChange}
    //                     />
    //                     <button
    //                         type="button"
    //                         className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500"
    //                         onClick={() => setVerPassword(!verPassword)}
    //                     >
    //                         {verPassword ? '🙈' : '👁️'}
    //                     </button>
    //                 </div>

    //                 <div className="relative">
    //                     <input
    //                         className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full pr-10 focus:border-blue-300"
    //                         placeholder="Repetir contraseña"
    //                         id="repeatPassword"
    //                         name="repeatPassword"
    //                         type={verRepeatPassword ? 'text' : 'password'}
    //                         autoComplete="new-password"
    //                         ref={repeatPasswordRef}
    //                         value={formState.repeatPassword}
    //                         onChange={handleInputChange}
    //                     />
    //                     <button
    //                         type="button"
    //                         className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500"
    //                         onClick={() => setVerRepeatPassword(!verRepeatPassword)}
    //                     >
    //                         {verRepeatPassword ? '🙈' : '👁️'}
    //                     </button>
    //                 </div>

    //                 <TurnstileCaptcha onVerify={setCaptchaRegister} />

    //                 <button
    //                     className={`w-full justify-center py-1 text-white font-semibold rounded-md transition ${camposCompletos && !loading
    //                         ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
    //                         : 'bg-blue-300 cursor-not-allowed opacity-50'
    //                         }`}
    //                     id="register"
    //                     name="register"
    //                     type="submit"
    //                     disabled={!camposCompletos || loading}
    //                 >
    //                     {loading ? 'Registrando...' : 'Registrarme'}
    //                 </button>

    //                 <p className="flex justify-center space-x-1">
    //                     <span className="text-slate-700">¿Ya tenés una cuenta?</span>
    //                     <Link className="text-blue-500 hover:underline" to="/auth/login">Iniciar sesión</Link>
    //                 </p>
    //             </form>

    //             {errores && errores.map((error, index) => (
    //                 <Alerta key={index}>{error}</Alerta>
    //             ))}
    //         </div>
    //     </div>
    // </div>
  );
};

export default Register;
