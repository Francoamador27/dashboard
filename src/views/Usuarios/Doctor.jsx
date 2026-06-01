// src/pages/diseño.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clienteAxios from "../../config/axios";
import { mostrarError, mostrarExito } from "../../utils/Alertas";

const toYMD = (val) => {
  if (!val) return "";
  // Si ya viene en YYYY-MM-DD, devuélvelo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Si viene ISO (con T), corta a los 10 primeros caracteres
  return String(val).slice(0, 10);
};

const diseño = () => {
  const { id } = useParams(); // "nuevo" o ID numérico
  const navigate = useNavigate();
  const token = localStorage.getItem("AUTH_TOKEN");

  const isEditing = id && id !== "nuevo";
  const isCreating = !id || id === "nuevo";

  const [diseño, setDoctor] = useState({
    nodoc: "",
    apdoc: "",
    ceddoc: "",
    nacd: "",          // guardamos SIEMPRE como YYYY-MM-DD
    nomesp: "",
    username: "",
    corr: "",
    color: "#008dd2",
    sexd: "",
    phd: "",
    rol: 2,           // 1=Admin, 2=diseño, 3=Secretario
    password: "",     // solo creación
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Cargar datos solo si estamos editando
  useEffect(() => {
    if (!isEditing) return;

    const fetchDoctor = async () => {
      setErrMsg("");
      setLoading(true);
      try {
        const { data } = await clienteAxios(`/api/doctores/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = data?.data ?? data;
        setDoctor({
          nodoc: d.nodoc || "",
          apdoc: d.apdoc || "",
          ceddoc: d.ceddoc || "",
          nacd: toYMD(d.nacd),                 // 👈 formateo para el input date
          nomesp: d.nomesp || "",
          username: d.username || "",
          corr: d.corr || "",
          color: d.color || "#008dd2",
          sexd: d.sexd || "",
          phd: d.phd || "",
          rol: d.rol ?? 2,
          password: "", // no se edita aquí
        });
      } catch (error) {
        console.error("Error al cargar el diseño:", error);
        setErrMsg(
          error?.response?.data?.message ||
          "No se pudo cargar la información del diseño."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, token, isEditing]);

  const handleChange = (e) => {
    setDoctor((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diseño?.nodoc?.trim()) return mostrarError("El nombre es obligatorio.");
    if (isCreating && (!diseño?.password?.trim() || diseño.password.length < 6)) {
      return mostrarError("La contraseña es obligatoria y debe tener al menos 6 caracteres.");
    }

    setSaving(true);
    setErrMsg("");
    try {
      const payload = {
        ...diseño,
        // normaliza rol a número
        rol: Number(diseño.rol || 2),
        // asegura nacd como YYYY-MM-DD (por si el usuario borra y vuelve a escribir)
        nacd: diseño.nacd ? toYMD(diseño.nacd) : null,
        ...(diseño?.state != null ? { state: Number(diseño.state) } : {}),
      };

      if (isCreating) {
        await clienteAxios.post(`/api/doctores`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        mostrarExito("diseño creado correctamente");
      } else {
        await clienteAxios.put(`/api/doctores/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        mostrarExito("diseño actualizado correctamente");}
      navigate("/admin-dash/doctores");
    } catch (error) {
      console.error(error);
      const firstError =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)[0]?.[0];
      setErrMsg(firstError || `Error al ${isCreating ? "crear" : "actualizar"} el diseño.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="h-8 w-64 bg-blue-200 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-blue-200 rounded mt-2 animate-pulse" />
            </div>
            <div className="p-8 space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <div className="h-12 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <div className="h-11 w-24 bg-gray-200 rounded-xl" />
                <div className="h-11 w-32 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && !diseño.nodoc && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">diseño no encontrado</h3>
          {errMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errMsg}
            </div>
          )}
          <button
            onClick={() => navigate("/admin-dash/doctores")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Volver a doctores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isCreating ? "Crear Nuevo diseño" : `Editar:  ${diseño.nodoc} ${diseño.apdoc ? diseño.apdoc : ""}`}
                </h2>
                <p className="text-blue-100 mt-1">
                  {isCreating ? "Complete la información del nuevo diseño" : `ID: ${id}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-100 text-sm">Color:</span>
                <div
                  className="w-12 h-12 rounded-xl border-2 border-white/30 shadow-lg"
                  style={{
                    background:
                      diseño.color && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(diseño.color)
                        ? diseño.color
                        : "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                  }}
                  title={diseño.color || "Sin color"}
                />
              </div>
            </div>
          </div>

          {/* Error global */}
          {errMsg && (
            <div className="mx-8 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-red-700 text-sm mt-1">{errMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Información Personal */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nodoc"
                    value={diseño.nodoc || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                    required
                    placeholder="Ingresa el nombre"
                  />
                </div>

                {/* Apellido */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="apdoc"
                    value={diseño.apdoc || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                    placeholder="Ingresa el apellido"
                  />
                </div>

                {/* DNI */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">DNI / Cédula</label>
                  <input
                    type="text"
                    name="ceddoc"
                    value={diseño.ceddoc || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                    placeholder="35534354"
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="nacd"
                      value={diseño.nacd || ""}   // 👈 ya viene YYYY-MM-DD
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                      max={new Date().toISOString().split("T")[0]}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Especialidad */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                  <input
                    type="text"
                    name="nomesp"
                    value={diseño.nomesp || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                    placeholder="Ej: Odontología"
                  />
                </div>

                {/* Sexo */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                  <select
                    name="sexd"
                    value={diseño.sexd || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Teléfono */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    name="phd"
                    value={diseño.phd || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                    placeholder="+54 3517699950"
                  />
                </div>
              </div>
            </div>

            {/* Información de Acceso */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información de Acceso</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                {/* <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de usuario</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={diseño.username || ""}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                      placeholder="usuario.login"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div> */}

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="corr"
                      value={diseño.corr || ""}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                      placeholder="correo@ejemplo.com"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Rol */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rol"
                    value={diseño.rol ?? 2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                    required
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>diseño</option>
                    <option value={3}>Secretario</option>
                  </select>
                </div>

                {/* Contraseña - solo creación */}
                {isCreating && (
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={diseño.password || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm"
                        placeholder="••••••••"
                        required={isCreating}
                        minLength={6}
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 6 caracteres. El diseño podrá cambiarla después.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Color de identificación</h3>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color personalizado</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    name="color"
                    value={diseño.color || ""}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white group-hover:shadow-sm font-mono"
                    placeholder="#008DD2"
                  />
                  <input
                    type="color"
                    value={/^#([0-9a-f]{6})$/i.test(diseño.color || "") ? diseño.color : "#008dd2"}
                    onChange={(e) => setDoctor((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-12 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
                    title="Selector de color"
                  />
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 shadow-inner"
                    style={{
                      background:
                        diseño.color && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(diseño.color)
                          ? diseño.color
                          : "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                    }}
                    title="Vista previa del color"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este color se usará para identificar al diseño en el calendario y reportes.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin-dash/doctores")}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
              >
                {saving ? "Guardando…" : isCreating ? "Crear diseño" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default diseño;
