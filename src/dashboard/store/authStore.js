import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,         // 'admin' | 'cliente'
      clienteId: null,
      cliente: null,      // datos básicos del cliente (nombre, logo, colores)
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/login', { email, password });
        localStorage.setItem('dashboard_token', data.token);
        set({
          user: data.user,
          token: data.token,
          role: data.role,
          clienteId: data.cliente_id ?? null,
          isAuthenticated: true,
        });
        return data.role;
      },

      logout: async () => {
        try {
          await api.post('/logout');
        } finally {
          localStorage.removeItem('dashboard_token');
          set({ user: null, token: null, role: null, clienteId: null, cliente: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        const { data } = await api.get('/me');
        set({
          user: { id: data.id, name: data.name, email: data.email },
          role: data.role,
          clienteId: data.cliente_id ?? null,
          cliente: data.cliente ?? null,
          isAuthenticated: true,
        });
      },

      setCliente: (cliente) => set({ cliente }),
    }),
    {
      name: 'dashboard-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
        clienteId: state.clienteId,
        cliente: state.cliente,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
