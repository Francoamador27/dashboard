import { createContext, useEffect, useRef, useState } from "react";
import clienteAxios from "../config/axios";

const ProviderContext = createContext();

const LOGIN_PATH = "/auth/login";
const AUTH_TOKEN_KEY = "AUTH_TOKEN";

const Provider = ({ children }) => {
  
  const auth = {
    isAuthenticated: false,
    user: null,
    token: null,
  };

  // ====== Protección contra bucles ======
  const isHandling401Ref = useRef(false);
  const isHandlingStorageRef = useRef(false); // ✅ NUEVO

  const applyAuthHeader = (token) => {
    if (token) {
      clienteAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete clienteAxios.defaults.headers.common["Authorization"];
    }
  };

  // ====== Interceptor 401 ======
  useEffect(() => {
    const saved = localStorage.getItem(AUTH_TOKEN_KEY);
    applyAuthHeader(saved || null);

    const interceptorId = clienteAxios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const status = error?.response?.status;
        if (status === 401 && !isHandling401Ref.current) {
          isHandling401Ref.current = true;
          localStorage.removeItem(AUTH_TOKEN_KEY);
          applyAuthHeader(null);
          
          if (window.location.pathname !== LOGIN_PATH) {
            window.location.replace(LOGIN_PATH);
          }
          
          setTimeout(() => (isHandling401Ref.current = false), 1000);
        }
        return Promise.reject(error);
      }
    );

    return () => clienteAxios.interceptors.response.eject(interceptorId);
  }, []);

  // ====== Sync entre pestañas (SIN BUCLE) ======
  useEffect(() => {
    const onStorage = (e) => {
      // ✅ Evitar procesar eventos disparados por esta misma pestaña
      if (isHandlingStorageRef.current) return;
      
      // Solo actuar si se eliminó el token en otra pestaña
      if (e.key === AUTH_TOKEN_KEY && e.newValue === null && e.oldValue !== null) {
        isHandlingStorageRef.current = true;
        
        applyAuthHeader(null);
        
        // ✅ Usar href para forzar recarga completa
        window.location.href = LOGIN_PATH;
        
        setTimeout(() => (isHandlingStorageRef.current = false), 1000);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ====== Settings globales (sin cambios) ======
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "";

  const reloadSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      const { data } = await clienteAxios.get("/api/settings");
      setSettings(data);
    } catch {
      setSettingsError("No se pudo cargar la configuración.");
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    const scheduleReload = () => reloadSettings();

    if ("requestIdleCallback" in window) {
      requestIdleCallback(scheduleReload);
      return undefined;
    }

    const timeoutId = setTimeout(scheduleReload, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  const logoUrl = settings?.logo
    ? settings.logo.startsWith("http")
      ? settings.logo
      : `${API_BASE}${settings.logo}`
    : null;

  const company = {
    name: settings?.company_name || "",
    logo: logoUrl,
    address: settings?.address || "",
    business_hours: settings?.business_hours || "",
    video_principal: settings?.video_principal || "",
    imagen_corporativa: settings?.imagen_corporativa || "",
    imagen_calidad: settings?.imagen_calidad || "",
    video_quienes_somos: settings?.video_quienes_somos || "",
    imagen_compromiso: settings?.imagen_compromiso || "",
  };


  const contact = {
    email: settings?.contact_email || "",
    whatsapp: settings?.whatsapp || "",
    phone: settings?.phone || "",
    sender_name: settings?.sender_name || "",
    map_iframe: settings?.google_map_iframe || "",
  };

  const footer = {
    bg_type: settings?.footer_bg_type || 'color',
    bg_color: settings?.footer_bg_color || '#f8fafc',
    text_color: settings?.footer_text_color || '#1c1c1c',
    greyscale: !!settings?.footer_greyscale,
    bg_image: settings?.footer_bg_image ? (settings.footer_bg_image.startsWith('http') ? settings.footer_bg_image : `${API_BASE}${settings.footer_bg_image}`) : null,
    logo: settings?.footer_logo ? (settings.footer_logo.startsWith('http') ? settings.footer_logo : `${API_BASE}${settings.footer_logo}`) : null,
    logo1: settings?.footer_logo1 ? (settings.footer_logo1.startsWith('http') ? settings.footer_logo1 : `${API_BASE}${settings.footer_logo1}`) : null,
    logo2: settings?.footer_logo2 ? (settings.footer_logo2.startsWith('http') ? settings.footer_logo2 : `${API_BASE}${settings.footer_logo2}`) : null,
  };

  const social = {
    instagram: settings?.instagram || "",
    facebook: settings?.facebook || "",
  };

  return (
    <ProviderContext.Provider
      value={{
        auth,
        settings,
        settingsLoading,
        settingsError,
        reloadSettings,
        company,
        contact,
        footer,
        social,
        logoUrl,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderContext;
export { Provider };