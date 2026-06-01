import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../config/axios";
import Company from "../components/Settings/Company";
import Smtp from "../components/Settings/Smtp";
import Integration from "../components/Settings/Integration";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_LOGO_MB = 2;
const MAX_LOGO_BYTES = MAX_LOGO_MB * 1024 * 1024;
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const fetcherWithAuth = (url, token) =>
  clienteAxios(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.data);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors
      ${active ? "text-white bg-blue-600" : "text-slate-600 hover:text-slate-900 bg-slate-100"}`}
  >
    {children}
  </button>
);

const Card = ({ title, subtitle, right, children }) => (
  <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
      <div>
        {title && <h2 className="text-base md:text-lg font-semibold text-slate-800">{title}</h2>}
        {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const AjustesSistema = () => {
  const token = localStorage.getItem("AUTH_TOKEN");
  const [tab, setTab] = useState("company"); // company | smtp | notifications

  // ---------- SWR: Carga inicial ----------
  const { data, error, isLoading, isValidating } = useSWR(
    ["/api/settings", token],
    ([url, tkn]) => fetcherWithAuth(url, tkn),
    { revalidateOnFocus: false }
  );

  // ---------- Estado: Empresa ----------
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyMsg, setCompanyMsg] = useState(null);
  const [companyErr, setCompanyErr] = useState(null);

  // ---------- Estado: Notificaciones ----------
  const [notifEmails, setNotifEmails] = useState(""); // "a@a.com, b@b.com"
  const [notifFromName, setNotifFromName] = useState("");
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState(null);
  const [notifErr, setNotifErr] = useState(null);

  // ---------- Inicializar desde el backend ----------
  useEffect(() => {
    if (!data) return;
    // Empresa
    setCompanyName(data?.company?.name || "");
    setLogoUrl(data?.company?.logo_url || "");
    setLogoFile(null);
    setLogoPreview(null);

    // Notificaciones
    setNotifEmails((data?.notifications?.emails || []).join(", "));
    setNotifFromName(data?.notifications?.from_name || "");
  }, [data]);

  // ---------- Helpers (Empresa/Notificaciones) ----------
  const parseEmails = (raw) =>
    raw
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

  const areValidEmails = (arr) => arr.every((e) => EMAIL_RE.test(e));

  const handlePickLogo = (file) => {
    if (!file) return;
    if (!IMAGE_MIMES.includes(file.type)) {
      setCompanyErr("Formato no válido (JPG, PNG, WEBP o SVG).");
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setCompanyErr(`El logo supera ${MAX_LOGO_MB}MB.`);
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setCompanyErr(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // ---------- Guardados ----------
  const saveCompany = async (e) => {
    e.preventDefault();
    setCompanyMsg(null);
    setCompanyErr(null);
    if (!companyName.trim()) return setCompanyErr("Ingresá el nombre de la empresa.");

    const form = new FormData();
    form.append("name", companyName.trim());
    if (logoFile) form.append("logo", logoFile);

    try {
      setCompanySaving(true);
      await clienteAxios.post("/api/settings/company", form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data",
        },
      });
      setCompanyMsg("Datos de empresa guardados.");
      clearLogoSelection();
      mutate(["/api/settings", token]);
    } catch (err) {
      console.error(err);
      setCompanyErr("No se pudo guardar los datos de la empresa.");
    } finally {
      setCompanySaving(false);
    }
  };

  const removeCompanyLogo = async () => {
    if (!logoUrl) return;
    if (!window.confirm("¿Quitar el logo actual?")) return;
    try {
      await clienteAxios.delete("/api/settings/company/logo", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setLogoUrl("");
      clearLogoSelection();
      mutate(["/api/settings", token]);
    } catch (err) {
      console.error(err);
      setCompanyErr("No se pudo quitar el logo.");
    }
  };


  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ajustes del Sistema</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configurá la identidad de tu empresa, el correo saliente (SMTP) y los destinatarios de notificaciones.
          </p>
        </div>
        {(isLoading || isValidating) && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="animate-spin inline-block h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
            Cargando…
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex items-end gap-2">
        <TabButton active={tab === "company"} onClick={() => setTab("company")}>
          Empresa
        </TabButton>
        <TabButton active={tab === "smtp"} onClick={() => setTab("smtp")}>
          SMTP
        </TabButton>
        <TabButton active={tab === "notifications"} onClick={() => setTab("notifications")}>
          Notificaciones
        </TabButton>
      </div>

      {/* Panels */}
      {tab === "company" && (
        <Card>
          {/* Company maneja su propio formulario interno */}
          <Company
            companyName={companyName}
            setCompanyName={setCompanyName}
            logoUrl={logoUrl}
            logoFile={logoFile}
            logoPreview={logoPreview}
            onPickLogo={handlePickLogo}
            onClearLogo={clearLogoSelection}
            onRemoveLogo={removeCompanyLogo}
            onSubmit={saveCompany}
            saving={companySaving}
            msg={companyMsg}
            err={companyErr}
          />
        </Card>
      )}

      {tab === "smtp" && (
        <Card title="Configuración SMTP" subtitle="Define el servidor de correo saliente para tus notificaciones.">
          {/* Todo SMTP encapsulado en el componente Smtp */}
          <Smtp
            token={token}
            initial={data?.smtp || null}
            onSaved={() => mutate(["/api/settings", token])}
          />
        </Card>
      )}

      {tab === "notifications" && (
        <Card title="Integraciones web" subtitle="Configura integraciones con servicios externos.">
          <Integration />
        </Card>
      )}
    </div>
  );
};

export default AjustesSistema;
