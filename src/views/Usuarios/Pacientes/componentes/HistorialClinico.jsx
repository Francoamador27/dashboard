import { useEffect, useMemo, useState } from "react";
import clienteAxios from "../../../../config/axios";
import { getAuthHeaders } from "../../../../utils/AuthHelper";
import { useParams } from "react-router-dom";
import { mostrarConfirmacion } from "../../../../utils/Alertas";

// Props: idpa (number)
const HistorialClinico = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const { id } = useParams(); // "nuevo" o ID
  const idpa = useMemo(() => id, [id]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    mtcl: "",
    numdiente: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get(`/api/consul/${idpa}`, getAuthHeaders());
      setItems(Array.isArray(data?.data) ? data.data : []);
      setErr("");
    } catch (e) {
      setErr("No se pudo cargar el historial clínico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [idpa]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({ mtcl: "", numdiente: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Solo envío lo que tenga valor
      const payload = {};
      if (form.mtcl?.trim()) payload.mtcl = form.mtcl.trim();
      if (form.numdiente?.trim()) payload.numdiente = form.numdiente.trim();

      await clienteAxios.post(`/api/consul/${idpa}`, payload, getAuthHeaders());
      setOpen(false);
      resetForm();
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar la nota.");
    } finally {
      setSaving(false);
    }
  };

  // === NUEVO: eliminar consulta ===
  const handleDelete = async (idconslt) => {
    const ok = await mostrarConfirmacion(
      "¿Estás seguro que deseas eliminar?",
      "Esta acción eliminará la nota de forma permanente."
    );
    if (!ok) return;

    // Optimistic UI
    const prev = items;
    setItems((cur) => cur.filter((x) => x.idconslt !== idconslt));

    try {
      // Ajustá el endpoint si tu API usa otra ruta (por ejemplo: `/api/consul/${idconslt}`)
      await clienteAxios.delete(`/api/consul/${idconslt}`, getAuthHeaders());
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar la nota.");
      // rollback
      setItems(prev);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial clínico</h3>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Agregar nota
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : err ? (
        <p className="text-sm text-red-600">{err}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">Sin notas en el historial.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.idconslt}
              className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
            >
              {/* Botón eliminar */}
              <button
                onClick={() => handleDelete(it.idconslt)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar nota"
              >
                ✕
              </button>

              {/* Fecha y badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {it.fere && new Date(it.fere.replace(" ", "T")).toLocaleString()}
                </span>
              </div>

              {/* Nota */}
              {it.mtcl && (
                <p className="mt-3 text-gray-800 text-sm leading-relaxed">
                  {it.mtcl}
                </p>
              )}

              {/* Info extra */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                {it.nompa && <span>👤 {it.nompa}</span>}
                {it.numdiente && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Pieza {it.numdiente}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Nueva nota</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo / Nota (opcional)
                </label>
                <textarea
                  name="mtcl"
                  value={form.mtcl}
                  onChange={onChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
                  placeholder="Escribí la evolución o motivo de consulta…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pieza (opcional)
                </label>
                <input
                  type="text"
                  name="numdiente"
                  value={form.numdiente}
                  onChange={onChange}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="Ej: 16"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-60 transition-all"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>

      )}
    </div>
  );
};

export default HistorialClinico;
