import { Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

export default function DashboardLayout() {
  const { isAuthenticated, role } = useAuthStore();
  const { theme } = useThemeStore();

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />;
  }

  // Los clientes no pueden acceder al área admin
  if (role === 'cliente') {
    return <Navigate to="/dashboard/portal" replace />;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-200">
        <Sidebar />
        <main className="pl-60">
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
        </main>
      </div>
    </div>
  );
}
