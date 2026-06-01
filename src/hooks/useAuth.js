import clienteAxios from "../config/axios";
import useSWR from "swr";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const UseAuth = ({ middleware, url }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const hasRedirectedRef = useRef(false); // ✅ Evita redirecciones múltiples

  // ✅ Fetcher que lee el token en cada request
  const { data: user, error, mutate } = useSWR(
    '/api/user',
    async () => {
      const token = localStorage.getItem('AUTH_TOKEN');
      if (!token) throw new Error('No token');
      
      const res = await clienteAxios('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 60000,
      onError: (err) => {
        // Si no hay token, no loguear error
        if (err.message === 'No token') return;
        console.error('Error auth:', err);
      }
    }
  );

  const isLoading = !user && !error;

  const login = async (datos, setErrores, setLoading) => {
    try {
      setLoading?.(true);
      const { data } = await clienteAxios.post('/api/login', datos);
      
      if (!data?.token) {
        throw new Error('No se recibió token');
      }

      localStorage.setItem('AUTH_TOKEN', data.token);
      clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setErrores?.(null);
      hasRedirectedRef.current = false; // ✅ Reset al hacer login
      await mutate();
    } catch (error) {
      setErrores?.(error.response?.data?.errors || 'Error al iniciar sesión');
    } finally {
      setLoading?.(false);
    }
  };

  const register = async (datos, setErrores) => {
    try {
      const { data } = await clienteAxios.post('/api/register', datos);
      
      if (!data?.token) {
        throw new Error('No se recibió token');
      }

      localStorage.setItem('AUTH_TOKEN', data.token);
      clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setErrores?.(null);
      hasRedirectedRef.current = false;
      await mutate();
    } catch (error) {
      setErrores?.(Object.values(error.response?.data?.errors || { error: 'Error' }));
    }
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      const token = localStorage.getItem('AUTH_TOKEN');
      
      if (token) {
        await clienteAxios.post('/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // ✅ ORDEN CORRECTO: Primero limpiar todo, luego redirigir
      localStorage.removeItem('AUTH_TOKEN');
      delete clienteAxios.defaults.headers.common['Authorization'];
      
      // ✅ Limpiar caché de SWR completamente
      await mutate(null, { revalidate: false });
      
      setLoggingOut(false);
      hasRedirectedRef.current = false;
      
      // ✅ Redirigir DESPUÉS de limpiar
      window.location.href = '/auth/login';
    }
  };

  useEffect(() => {
    if (loggingOut || isLoading || hasRedirectedRef.current) return;

    // Admins al dashboard solo si están en login
    if (middleware === 'guest' && user?.admin && location.pathname === '/auth/login') {
      hasRedirectedRef.current = true;
      navigate('/admin-dash');
      return;
    }

    // Usuarios comunes (NO admin)
    if (middleware === 'guest' && url && user && !user.admin) {
      hasRedirectedRef.current = true;
      navigate(url);
      return;
    }

    // Proteger rutas autenticadas
    if (middleware === 'auth' && error && error.message !== 'No token') {
      hasRedirectedRef.current = true;
      navigate('/auth/login');
    }
  }, [user, error, loggingOut, isLoading, middleware, url, location.pathname]);

  return {
    login,
    register,
    logout,
    user,
    error,
    isLoading
  };
};

export default UseAuth;