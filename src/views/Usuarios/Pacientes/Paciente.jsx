// src/pages/usuario.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clienteAxios from "../../../config/axios";
import { mostrarError, mostrarExito } from "../../../utils/Alertas";

const toYMD = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  return String(val).slice(0, 10);
};

const usuario = () => {
  //si idpaciente no existe buscamos en params
  const { id } = useParams(); // "nuevo" o ID

  const navigate = useNavigate();
  const token = localStorage.getItem("AUTH_TOKEN");
  const isEditing = id && id !== "nuevo";
  const isCreating = !id || id === "nuevo";
  const todayYMD = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Estado alineado 1:1 con tu tabla patients + campos de users
  const [usuario, setPaciente] = useState({
    // patients
    nompa: "",
    apepa: "",
    direc: "",
    sex: "",
    grup: "",
    phon: "",
    cump: "",
    state: 1,

    // users
    email: "",
    password: "",
    dni: "",
    codigo_postal: "",
    provincia: "",
    rol: 3, // 1=Admin, 2=diseño, 3=usuario
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Cargar datos solo si estamos editando
  useEffect(() => {
    if (!isEditing) return;
    const fetchPaciente = async () => {
      setErrMsg("");
      setLoading(true);
      try {
        const { data } = await clienteAxios(`/api/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Mapear con tolerancia: si el backend devuelve también datos de user, los tomamos
        setPaciente((prev) => ({
          ...prev,
          // patients
          nompa: data.nompa ?? "",
          apepa: data.apepa ?? "",
          direc: data.direc ?? "",
          sex: data.sex ?? "",
          grup: data.grup ?? "",
          phon: data.phon ?? "",
          cump: toYMD(data.cump),
          state: data.state ?? 1,

          // users (pueden venir como root o dentro de data.user)
          email: (data.email ?? data.user?.email) ?? "",
          dni: (data.dni ?? data.user?.dni) ?? "",
          codigo_postal: (data.codigo_postal ?? data.user?.codigo_postal) ?? "",
          provincia: (data.provincia ?? data.user?.provincia) ?? "",
          rol: Number((data.rol ?? data.user?.rol) ?? 3),

          // password NO se rellena en edición
          password: "",
        }));
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
        setErrMsg(
          error?.response?.data?.message ||
            "No se pudo cargar la información del usuario."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPaciente();
  }, [id, token, isEditing]);

  // Manejo de inputs
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({
      ...prev,
      [name]: name === "state" || name === "rol" ? Number(value) : value,
    }));
  }, []);

  // Envío
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mínimas
    if (!usuario?.nompa?.trim()) return mostrarError("El nombre es obligatorio.");
    if (!usuario?.email?.trim()) return mostrarError("El email es obligatorio.");
    if (isCreating && (!usuario?.password?.trim() || usuario.password.length < 6)) {
      return mostrarError("La contraseña es obligatoria y debe tener al menos 6 caracteres.");
    }

    setSaving(true);
    setErrMsg("");

    try {
      // -------- patients (tabla patients)
      const patientPayload = {
     
        nompa: usuario.nompa?.trim(),
        apepa: usuario.apepa || null,
        direc: usuario.direc || null,
        sex: usuario.sex || null,
        grup: usuario.grup || null,
        phon: usuario.phon || null,
        cump: usuario.cump ? toYMD(usuario.cump) : null,
        state: usuario.state ?? 1,
      };

      // -------- users (tabla users)
      const userPayload = {
        email: usuario.email?.trim() || null,
        dni: usuario.dni || null,
        codigo_postal: usuario.codigo_postal || null,
        provincia: usuario.provincia || null,
        rol: Number(usuario.rol ?? 3),
        ...(isCreating
          ? { password: usuario.password }
          : (usuario.password?.trim() ? { password: usuario.password } : {})),
      };

      // 👉 Unificar en un solo payload si tu endpoint /api/usuarios espera todo junto
      const payload = { ...patientPayload, ...userPayload };

      // Si tu backend espera objetos separados, usa en su lugar:
      // const payload = { patient: patientPayload, user: userPayload };

      if (isCreating) {
        await clienteAxios.post(`/api/usuarios`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        mostrarExito("usuario creado correctamente");
      } else {
        await clienteAxios.put(`/api/usuarios/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        mostrarExito("usuario actualizado correctamente");
      }
      navigate("/admin-dash/usuarios");
    } catch (error) {
      console.error(error);
      const firstError =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)[0]?.[0];
      setErrMsg(firstError || `Error al ${isCreating ? "crear" : "actualizar"} el usuario.`);
    } finally {
      setSaving(false);
    }
  };

  // UI de carga / error
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
                {[...Array(8)].map((_, i) => (
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

  if (isEditing && !usuario.nompa && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">usuario no encontrado</h3>
          {errMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errMsg}
            </div>
          )}
          <button
            onClick={() => navigate("/admin-dash/usuarios")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Volver a usuarios
          </button>
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isCreating ? "Crear Nuevo usuario" : "Editar usuario"}
                </h2>
                <p className="text-blue-100 mt-1">
                  {isCreating
                    ? "Complete la información del nuevo usuario"
                    : `${usuario.nompa} ${usuario.apepa || ""} - ID: ${id}`}
                </p>
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
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* ================= Datos personales ================= */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nº historia */}


                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="nompa"
                    value={usuario.nompa || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Nombre"
                    required
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="apepa"
                    value={usuario.apepa || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Apellido"
                  />
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DNI / Documento</label>
                  <input
                    type="text"
                    name="dni"
                    value={usuario.dni || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="12345678"
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                  <select
                    name="sex"
                    value={usuario.sex || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Seleccione…</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Fecha nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="cump"
                    value={usuario.cump || ""}
                    onChange={handleChange}
                    max={todayYMD}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Grupo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                  <input
                    type="text"
                    name="grup"
                    value={usuario.grup || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="O+, A-, etc."
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="phon"
                    value={usuario.phon || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="+54 3517699950"
                  />
                </div>
              </div>
            </div>

            {/* ================= Datos de acceso (users) ================= */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Datos de Acceso</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={usuario.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <select
                    name="rol"
                    value={usuario.rol ?? 3}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>diseño</option>
                    <option value={3}>usuario</option>
                  </select>
                </div>

                {/* Password (solo creación o si se rellena) */}
                <div className={`${isCreating ? "" : "md:col-span-2"}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {isCreating && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={usuario.password || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder={isCreating ? "Mínimo 6 caracteres" : "Dejar vacío para no cambiar"}
                    minLength={isCreating ? 6 : undefined}
                    required={isCreating}
                  />
                </div>
              </div>
            </div>

            {/* ================= Dirección (users) ================= */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información de Domicilio</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dirección (patients.direc) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    name="direc"
                    value={usuario.direc || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Calle, número, piso, depto."
                  />
                </div>

                {/* Código postal (users.codigo_postal) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                  <input
                    type="text"
                    name="codigo_postal"
                    value={usuario.codigo_postal || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="5000"
                  />
                </div>

                {/* Provincia (users.provincia) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                  <input
                    type="text"
                    name="provincia"
                    value={usuario.provincia || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Córdoba, Buenos Aires, etc."
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin-dash/usuarios")}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
              >
                {saving ? "Guardando…" : isCreating ? "Crear usuario" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default usuario;
