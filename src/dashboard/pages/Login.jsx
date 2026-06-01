// v2
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import useAuthStore from "../store/authStore";
import useCont from "../../hooks/useCont";

export default function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();
  const { company } = useCont();

  if (isAuthenticated) {
    return (
      <Navigate
        to={role === "cliente" ? "/dashboard/portal" : "/dashboard"}
        replace
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userRole = await login(email, password);
      navigate(userRole === "cliente" ? "/dashboard/portal" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message ?? "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <img src={company.logo} alt="Logo" className="h-14 w-auto object-contain" />
          <p className="text-slate-500 text-sm text-center">
            Acceso al soporte de Grupo Bits
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dashboard.com"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b560] disabled:opacity-50 text-black text-sm font-semibold rounded-lg px-4 py-2.5 transition-all mt-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Accediendo…" : "Ingresar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
