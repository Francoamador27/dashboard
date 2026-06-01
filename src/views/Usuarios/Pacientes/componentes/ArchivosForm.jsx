import React, { useMemo, useState } from "react";
import clienteAxios from "../../../../config/axios";
import { useParams } from "react-router-dom";

// Utilidad para crear slug
const slugify = (str) =>
  str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Config
const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const DOC_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_MIMES = [...IMAGE_MIMES, ...DOC_MIMES];

const ArchivosForm = () => {
  const token = localStorage.getItem("AUTH_TOKEN");

  // Campos mínimos
  const [title, setTitle] = useState("");
  const slug = useMemo(() => slugify(title), [title]);
  const [description, setDescription] = useState("");

  // Archivo principal
  const [mainFile, setMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(null); // solo para imágenes

  // UI
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [dragActiveMain, setDragActiveMain] = useState(false);

  // Helpers
  const isImage = (file) => IMAGE_MIMES.includes(file?.type);

  const validarArchivo = (file) => {
    if (!file) return "Seleccioná un archivo.";
    if (!ALLOWED_MIMES.includes(file.type)) {
      return "Formato inválido. Permitidos: JPG, PNG, WEBP, PDF, DOC, DOCX.";
    }
    if (file.size > MAX_BYTES) {
      return `El archivo supera el máximo de ${MAX_MB}MB.`;
    }
    return null;
  };

  // Handlers archivo principal
  const handleMainFile = (file) => {
    const err = validarArchivo(file);
    if (err) {
      setError(err);
      setMainFile(null);
      setMainPreview(null);
      return;
    }
    setError(null);
    setMainFile(file);
    setMainPreview(isImage(file) ? URL.createObjectURL(file) : null);
  };

  const onMainInput = (e) => {
    handleMainFile(e.target.files?.[0]);
  };

  const onMainDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveMain(true);
    if (e.type === "dragleave") setDragActiveMain(false);
  };

  const onMainDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveMain(false);
    handleMainFile(e.dataTransfer.files?.[0]);
  };

  const clearMainFile = () => {
    setMainFile(null);
    setMainPreview(null);
  };
  const { id } = useParams();

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!title.trim()) return setError("El nombre del archivo es obligatorio.");
    if (!description.trim())
      return setError("La descripción es obligatoria.");
    if (!mainFile) return setError("Subí el archivo principal.");

    let idpa = id;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("descripcion", description);
    formData.append("idpa",idpa);
    formData.append("document", mainFile);

    try {
      setCargando(true);
      const response = await clienteAxios.post("/api/documentos", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setMensaje("Archivo registrado correctamente");
        // Reset
        setTitle("");
        setDescription("");
        clearMainFile();
      }
    } catch (err) {
      console.error("Error completo:", err);
      if (err.response) {
        setError(
          err.response.data?.message ||
            `Error del servidor: ${err.response.status}`
        );
      } else if (err.request) {
        setError("Error de conexión. Verificá tu internet.");
      } else {
        setError("Error inesperado: " + err.message);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nombre del Archivo
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 p-3 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 bg-white"
                placeholder="Ej: Presupuesto Limpieza, Instructivo, Consentimiento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Descripción del Archivo
              </label>
              <textarea
                className="w-full border border-slate-300 p-4 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 bg-white resize-none"
                placeholder="Breve descripción o notas del archivo…"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Archivo principal (imagen o documento) */}
            <div
              className="space-y-3"
              onDragEnter={onMainDrag}
              onDragOver={onMainDrag}
              onDragLeave={onMainDrag}
              onDrop={onMainDrop}
            >
              <label className="block text-sm font-semibold text-slate-700">
                Archivo (imagen o documento)
                <span className="text-xs text-slate-500 font-normal ml-2">
                  (JPG/PNG/WEBP, PDF, DOC, DOCX – máx. {MAX_MB}MB)
                </span>
              </label>

              {mainPreview || mainFile ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 p-3">
                  {mainPreview ? (
                    <img
                      src={mainPreview}
                      alt="Vista previa"
                      className="object-contain w-full max-h-64"
                    />
                  ) : (
                    <div className="text-slate-700 text-sm">
                      <strong>Archivo:</strong> {mainFile?.name}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={clearMainFile}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                    >
                      Quitar archivo
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="mainFile"
                  className={`flex flex-col items-center justify-center w-full h-48 px-6 py-8 transition-all duration-300 bg-slate-50 border-2 border-dashed cursor-pointer rounded-lg hover:bg-slate-100 ${
                    dragActiveMain
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      Subir archivo
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-blue-600">
                        Seleccioná un archivo
                      </span>{" "}
                      o arrastralo aquí
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Tipos: JPG, PNG, WEBP, PDF, DOC, DOCX
                    </p>
                  </div>
                  <input
                    id="mainFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onMainInput}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={cargando}
                className={`w-full sm:w-auto px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                  cargando
                    ? "bg-slate-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Guardando...
                  </span>
                ) : (
                  "Guardar Archivo"
                )}
              </button>

              {/* Vista previa simple */}
              <details className="w-full sm:w-auto">
                <summary className="cursor-pointer select-none text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200 flex items-center gap-2">
                  <span>Vista previa de datos</span>
                </summary>
                <div className="mt-3 p-4 bg-slate-900 text-green-400 rounded-lg max-h-60 overflow-auto text-xs font-mono">
                  <pre>
                    {JSON.stringify(
                      {
                        slug,
                        title,
                        description,
                        file: mainFile ? mainFile.name : null,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </details>
            </div>

            {/* Mensajes */}
            {mensaje && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <span className="text-lg">✓</span>
                <p className="font-medium">{mensaje}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                <span className="text-lg">!</span>
                <p className="font-medium">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArchivosForm;
