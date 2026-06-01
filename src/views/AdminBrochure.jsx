import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../config/axios";
import { FileText, Trash2, Upload } from "lucide-react";

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const fetcher = (url) => clienteAxios(url).then((res) => res.data);

export default function AdminBrochure() {
  const token = localStorage.getItem("AUTH_TOKEN");

  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { data, isLoading } = useSWR("/api/brochure", fetcher, {
    revalidateOnFocus: false,
  });

  const brochure = data?.data ?? null;

  const onArchivoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`El archivo no puede superar los ${MAX_MB}MB.`);
      return;
    }
    setError(null);
    setArchivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!archivo) {
      setError("Seleccioná un archivo PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("archivo", archivo);

    try {
      setCargando(true);
      await clienteAxios.post("/api/brochure", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMensaje("Brochure subido correctamente.");
      setNombre("");
      setArchivo(null);
      mutate("/api/brochure");
    } catch {
      setError("No se pudo subir el brochure.");
    } finally {
      setCargando(false);
    }
  };

  const handleDelete = async () => {
    if (!brochure) return;
    if (!window.confirm("¿Seguro que querés eliminar el brochure?")) return;
    try {
      await clienteAxios.delete(`/api/brochure/${brochure.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mutate("/api/brochure");
    } catch {
      setError("No se pudo eliminar el brochure.");
    }
  };

  return (
    <div className="p-4 space-y-8">
      {/* Brochure actual */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Brochure actual</h3>

        {isLoading && (
          <p className="text-sm text-slate-500">Cargando...</p>
        )}

        {!isLoading && !brochure && (
          <p className="text-sm text-slate-500">No hay ningún brochure cargado.</p>
        )}

        {brochure && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{brochure.nombre}</p>
              <a
                href={brochure.archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Ver PDF
              </a>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Formulario de carga */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={22} />
          {brochure ? "Reemplazar brochure" : "Subir brochure"}
        </h2>

        {brochure && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Al subir un nuevo brochure se reemplazará el anterior automáticamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nombre del brochure
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Brochure Institucional 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Archivo PDF (máx. {MAX_MB}MB)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={onArchivoChange}
              className="block w-full text-sm text-slate-600
                file:mr-4 file:py-2 file:px-4 file:rounded-lg
                file:border-0 file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {archivo && (
              <p className="mt-2 text-sm text-slate-600 flex items-center gap-1">
                <FileText size={14} />
                {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <Upload size={16} />
            {cargando ? "Subiendo..." : "Subir PDF"}
          </button>

          {mensaje && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg">{mensaje}</div>
          )}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
