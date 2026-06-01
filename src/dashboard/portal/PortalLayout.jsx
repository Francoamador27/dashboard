import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Ticket, ImageIcon, BookOpen,
  FolderOpen, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const NAV = [
  { to: '/dashboard/portal',          label: 'Inicio',    icon: LayoutDashboard, end: true },
  { to: '/dashboard/portal/tickets',  label: 'Mis tickets', icon: Ticket },
  { to: '/dashboard/portal/galeria',  label: 'Mis imágenes', icon: ImageIcon },
  { to: '/dashboard/portal/brand-dna',label: 'Brand DNA', icon: BookOpen },
  { to: '/dashboard/portal/archivos', label: 'Archivos',  icon: FolderOpen },
];

export default function PortalLayout() {
  const { isAuthenticated, role, cliente, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/dashboard/login" replace />;
  if (role === 'admin') return <Navigate to="/dashboard" replace />;

  const accentColor = cliente?.colores?.[0] ?? '#c9a84c';

  const handleLogout = async () => {
    await logout();
    navigate('/dashboard/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-zinc-100">
        {cliente?.logo_path ? (
          <img
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cliente.logo_path}`}
            alt={cliente.nombre}
            className="h-9 object-contain"
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {cliente?.nombre?.[0] ?? 'C'}
            </div>
            <span className="font-semibold text-zinc-900 text-sm">{cliente?.nombre ?? 'Portal'}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: accentColor } : {}}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-5 border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-zinc-100 hidden md:flex flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-zinc-100 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-zinc-500">
          <Menu size={20} />
        </button>
        <span className="font-semibold text-sm text-zinc-900">{cliente?.nombre ?? 'Portal'}</span>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-56 bg-white z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100">
                <span className="font-semibold text-sm">{cliente?.nombre}</span>
                <button onClick={() => setMobileOpen(false)} className="text-zinc-400">
                  <X size={18} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="md:pl-56 pt-0 md:pt-0">
        <div className="md:pt-0 pt-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="min-h-screen"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
