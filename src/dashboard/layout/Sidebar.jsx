import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Images,
  Sparkles,
  FolderOpen,
  Settings,
  LogOut,
  Sun,
  Moon,
  Activity,
  Ticket,
  CreditCard,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";
import { useActiveAssets } from "../hooks/useGaleria";
import { useTicketsAll } from "../hooks/useTickets";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/clientes", label: "Clientes", icon: Users },
  {
    to: "/dashboard/tickets",
    label: "Tickets",
    icon: Ticket,
    badge: "tickets",
  },
  { to: "/dashboard/galeria", label: "Biblioteca Global", icon: Images },
  { to: "/dashboard/generador", label: "Generador IA", icon: Sparkles },
  { to: "/dashboard/monitor", label: "Monitor", icon: Activity, live: true },
  { to: "/dashboard/colecciones", label: "Colecciones", icon: FolderOpen },
  { to: "/dashboard/suscripciones", label: "Suscripciones", icon: CreditCard },
  { to: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const { logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const { data: activeData } = useActiveAssets();
  const activeCount = (activeData?.data ?? activeData ?? []).length;

  const { data: ticketsAbiertos } = useTicketsAll({}, { refetchInterval: 30_000 });

  // Badge "no leído": tickets creados después de la última visita a /tickets
  const [lastVisit, setLastVisit] = useState(() =>
    localStorage.getItem("tickets_last_visit"),
  );
  useEffect(() => {
    const handler = () =>
      setLastVisit(localStorage.getItem("tickets_last_visit"));
    window.addEventListener("tickets-visited", handler);
    return () => window.removeEventListener("tickets-visited", handler);
  }, []);

  const ticketsNuevos = (ticketsAbiertos ?? []).filter((t) => {
    if (["resuelto", "cerrado"].includes(t.estado)) return false;
    if (!lastVisit) return true;
    return new Date(t.created_at) > new Date(lastVisit);
  }).length;

  const ticketsUrgentes = (ticketsAbiertos ?? []).filter(
    (t) =>
      t.prioridad === "urgente" &&
      !["resuelto", "cerrado"].includes(t.estado) &&
      (!lastVisit || new Date(t.created_at) > new Date(lastVisit)),
  ).length;

  const handleLogout = async () => {
    await logout();
    navigate("/dashboard/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-white/[0.06] flex flex-col z-30 transition-colors duration-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/[0.06]">
        <span className="text-slate-900 dark:text-white font-semibold tracking-tight text-sm">
          Dashboard <span className="text-[#c9a84c]">·</span> GrupoBits
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end, live, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80 hover:bg-slate-50 dark:hover:bg-white/[0.04]",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={
                    isActive
                      ? "text-[#c9a84c]"
                      : "text-slate-300 dark:text-white/30 group-hover:text-slate-500 dark:group-hover:text-white/60"
                  }
                  strokeWidth={1.75}
                />
                <span className="font-medium flex-1">{label}</span>
                {live && activeCount > 0 && !isActive && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-amber-500">
                      {activeCount}
                    </span>
                  </span>
                )}
                {badge === "tickets" && ticketsNuevos > 0 && !isActive && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                      ticketsUrgentes > 0
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {ticketsNuevos}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="w-1 h-1 rounded-full bg-[#c9a84c]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Botones inferiores */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.06] space-y-0.5">
        {/* Toggle tema */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
        >
          {isDark ? (
            <Sun size={16} strokeWidth={1.75} />
          ) : (
            <Moon size={16} strokeWidth={1.75} />
          )}
          <span className="font-medium">
            {isDark ? "Modo claro" : "Modo oscuro"}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
