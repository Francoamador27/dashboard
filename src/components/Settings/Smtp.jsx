import React, { useEffect, useState, useCallback } from "react";
import clienteAxios from "../../config/axios";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const Smtp = ({ token, onSaved }) => {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("tls");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [rrhhEmail, setRrhhEmail] = useState("");
  const [saveRrhhPdf, setSaveRrhhPdf] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const hydrateFromApi = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await clienteAxios.get("/api/mail-config", {
        headers: authHeader,
      });
      // Seteo seguro con defaults
      setHost(data?.host || "");
      setPort(data?.port != null ? String(data.port) : "");
      setUsername(data?.username || "");
      setPassword(""); // nunca mostrar la real
      setEncryption(data?.encryption || "tls");
      setFromEmail(data?.from_email || "");
      setFromName(data?.from_name || "");
      setAdminEmail(data?.admin_email || "");
      setRrhhEmail(data?.rrhh_email || "");
      setSaveRrhhPdf(data?.save_rrhh_pdf || false);
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar la configuración SMTP.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    hydrateFromApi();
  }, [hydrateFromApi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const portNum = Number(port);
    if (!host.trim()) return setErr("Ingresá el host SMTP.");
    if (!portNum || portNum <= 0) return setErr("Ingresá un puerto SMTP válido.");
    if (!username.trim()) return setErr("Ingresá el usuario SMTP.");
    if (fromEmail && !EMAIL_RE.test(fromEmail)) return setErr("El email de remitente no es válido.");
    if (adminEmail && !EMAIL_RE.test(adminEmail)) return setErr("El email del administrador no es válido.");
    if (rrhhEmail && !EMAIL_RE.test(rrhhEmail)) return setErr("El email de RRHH no es válido.");

    const payload = {
      host: host.trim(),
      port: portNum,
      username: username.trim(),
      password: password || null, // si viene vacío, en el back no se cambia
      encryption,
      from_email: fromEmail || null,
      from_name: fromName || null,
      admin_email: adminEmail || null,
      rrhh_email: rrhhEmail || null,
      save_rrhh_pdf: saveRrhhPdf,
    };

    try {
      setSaving(true);
      await clienteAxios.put("/api/mail-config", payload, { headers: authHeader });
      setMsg("Configuración de correo guardada.");
      setPassword(""); // limpiar campo
      onSaved && onSaved();
      // Rehidratar desde la DB para ver reflejo inmediato
      await hydrateFromApi();
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar la configuración SMTP.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-600">Cargando configuración…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {msg && <div className="mb-3 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">{msg}</div>}
      {err && <div className="mb-3 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {/* HOST */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Host</label>
          <input type="text" value={host} onChange={(e) => setHost(e.target.value)}
                 placeholder="smtp.tu-dominio.com"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        {/* PUERTO */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Puerto</label>
          <input type="number" value={port} onChange={(e) => setPort(e.target.value)}
                 placeholder="587"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        {/* USUARIO */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                 placeholder="usuario@tu-dominio.com"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        {/* CONTRASEÑA */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <div className="flex">
            <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full border border-slate-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <button type="button" onClick={() => setShowPass((s) => !s)}
                    className="px-3 border border-l-0 border-slate-300 rounded-r-lg text-sm text-slate-600 hover:bg-slate-50">
              {showPass ? "Ocultar" : "Ver"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Si lo dejás vacío, se mantiene la contraseña actual.</p>
        </div>

        {/* ENCRIPTACIÓN */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Encriptación</label>
          <select value={encryption} onChange={(e) => setEncryption(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="none">Sin encriptación</option>
            <option value="ssl">SSL (465)</option>
            <option value="tls">TLS (587)</option>
          </select>
        </div>

        {/* EMAIL REMITENTE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email remitente (opcional)</label>
          <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)}
                 placeholder="no-reply@tu-dominio.com"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        {/* NOMBRE REMITENTE */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre remitente (opcional)</label>
          <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)}
                 placeholder="Nombre visible del remitente"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        {/* EMAIL DESTINO */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email de destino (formularios generales)</label>
          <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                 placeholder="admin@tu-dominio.com"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <p className="text-xs text-slate-500 mt-1">A este correo llegarán los mensajes de formularios de contacto.</p>
        </div>

        {/* EMAIL RRHH */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email de destino (RRHH)</label>
          <input type="email" value={rrhhEmail} onChange={(e) => setRrhhEmail(e.target.value)}
                 placeholder="rrhh@tu-dominio.com"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <p className="text-xs text-slate-500 mt-1">A este correo llegarán los CVs y solicitudes de "Trabaja con nosotros".</p>
        </div>

        {/* GUARDAR PDF */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer w-max">
            <input type="checkbox" checked={saveRrhhPdf} onChange={(e) => setSaveRrhhPdf(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-slate-700">Guardar PDFs de CV en el servidor</span>
          </label>
          <p className="text-xs text-slate-500 mt-1 ml-6">Si se activa, los CVs enviados se almacenarán en la base de datos (se verá en Leads) y ocuparán espacio local.</p>
        </div>
      </div>

      <div className="pt-1">
        <button type="submit" disabled={saving}
                className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm ${saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          {saving ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
};

export default Smtp;
