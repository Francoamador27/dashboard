import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Inyecta el token Sanctum en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dashboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // En Axios 1.x con AxiosHeaders, si Content-Type es application/json y el body
  // es FormData, Axios lo serializa a JSON perdiendo los archivos.
  // Usar .set(null) o .delete() elimina el header correctamente en AxiosHeaders.
  if (config.data instanceof FormData) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Content-Type', undefined);
    } else {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

// Limpia auth si el token expira (sin recarga de página para evitar loops)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().resetAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
