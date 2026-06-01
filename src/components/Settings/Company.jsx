import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../../config/axios";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_LOGO_MB = 2;
const MAX_LOGO_BYTES = MAX_LOGO_MB * 1024 * 1024;
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const fetcherWithAuth = (url, token) =>
  clienteAxios (url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.data);

const Company = () => {
  const token = localStorage.getItem("AUTH_TOKEN");

  // Carga inicial
  const { data, isLoading, isValidating } = useSWR(
    ["/api/settings", token],
    ([url, tkn]) => fetcherWithAuth(url, tkn),
    { revalidateOnFocus: false }
  );

  // Estado
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapIframe, setGoogleMapIframe] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [businessHours, setBusinessHours] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // Inicializar desde backend
  useEffect(() => {
    if (!data) return;
    setCompanyName(data?.company_name || "");
    setContactEmail(data?.contact_email || "");
    setSenderName(data?.sender_name || "");
    setWhatsapp(data?.whatsapp || "");
    setPhone(data?.phone || "");
    setAddress(data?.address || "");
    setGoogleMapIframe(data?.google_map_iframe || "");
    setInstagram(data?.instagram || "");
    setFacebook(data?.facebook || "");
    setBusinessHours(data?.business_hours || "");
    setLogoUrl(data?.logo || ""); // si guardás ruta accesible (/storage/uploads/ejemplos/xxx.png)
    setLogoFile(null);
    setLogoPreview(null);
  }, [data]);

  // Helpers logo
  const handlePickLogo = (file) => {
    if (!file) return;
    if (!IMAGE_MIMES.includes(file.type)) {
      setErr("Formato no válido (JPG, PNG, WEBP o SVG).");
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setErr(`El logo supera ${MAX_LOGO_MB}MB.`);
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setErr(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Guardar
  const saveSettings = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!companyName.trim()) {
      setErr("Ingresá el nombre de la empresa.");
      return;
    }
    if (contactEmail && !EMAIL_RE.test(contactEmail)) {
      setErr("El email de contacto no es válido.");
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();
      form.append("company_name", companyName.trim());
      form.append("contact_email", contactEmail || "");
      form.append("sender_name", senderName || "");
      form.append("whatsapp", whatsapp || "");
      form.append("phone", phone || "");
      form.append("address", address || "");
      form.append("google_map_iframe", googleMapIframe || "");
      form.append("instagram", instagram || "");
      form.append("facebook", facebook || "");
      form.append("business_hours", businessHours || "");
      if (logoFile) form.append("logo", logoFile); // el backend espera 'logo'

      await clienteAxios.post("/api/settings", form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      });

      setMsg("Configuración guardada correctamente.");
      clearLogoSelection();
      mutate(["/api/settings", token]); // refrescar
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {(isLoading || isValidating) && (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <span className="animate-spin inline-block h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
          Cargando…
        </div>
      )}

      {msg && (
        <div className="mb-3 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {err}
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de la empresa
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ej: Clínica Sonrisas"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
          <div className="flex items-start gap-5">
            <div className="w-40 h-40 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="object-contain w-full h-full" />
              ) : logoUrl ? (
                <img src={`${import.meta.env.VITE_API_URL}${logoUrl}`} alt="Logo actual" className="object-contain w-full h-full" />
              ) : (
                <span className="text-slate-400 text-xs">Sin logo</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer text-sm font-medium">
                <input
                  type="file"
                  className="hidden"
                  accept={IMAGE_MIMES.join(",")}
                  onChange={(e) => handlePickLogo(e.target.files?.[0])}
                />
                Subir logo
              </label>
              {logoPreview && (
                <button
                  type="button"
                  onClick={clearLogoSelection}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm border border-slate-300"
                >
                  Quitar selección
                </button>
              )}
              <p className="text-xs text-slate-500">
                Formatos: JPG/PNG/WEBP/SVG. Máximo {MAX_LOGO_MB}MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email de contacto</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contacto@tudominio.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del remitente</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Nombre que verá el destinatario"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+54 9 351 123 4567"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(0351) 123-4567"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Siempre Viva 742, Córdoba"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Iframe de Google Maps</label>
            <textarea
              rows={3}
              value={googleMapIframe}
              onChange={(e) => setGoogleMapIframe(e.target.value)}
              placeholder='<iframe src="..."></iframe>'
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Pegá aquí el código completo del iframe que te da Google Maps.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instagram (URL)</label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/tuusuario"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Facebook (URL)</label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/tuusuario"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Horarios de atención</label>
            <textarea
              rows={3}
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="Lun a Vie 9:00–18:00 / Sáb 9:00–13:00"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={saving}
            className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm ${
              saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Company;
