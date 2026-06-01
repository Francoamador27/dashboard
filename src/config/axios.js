import axios from "axios";

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
});

// Función para obtener CSRF token
const getCsrfToken = async () => {
    try {
        // Esta ruta devuelve el token en la cookie XSRF-TOKEN
        await clienteAxios.get('/sanctum/csrf-cookie');
        
        // Extraer el token de las cookies
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
    } catch (error) {
        console.error('Error obteniendo CSRF token:', error);
    }
    return null;
};

// Interceptor para agregar CSRF token automáticamente
clienteAxios.interceptors.request.use(async (config) => {
    // Solo para requests POST, PUT, DELETE, PATCH que no tengan Authorization
    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
        // Si no tiene header de Authorization (es una request pública)
        if (!config.headers['Authorization']) {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                config.headers['X-CSRF-TOKEN'] = csrfToken;
            }
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default clienteAxios;
export { getCsrfToken };