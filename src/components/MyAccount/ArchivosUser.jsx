import React, { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../../config/axios";
import { Upload, X, FileText } from "lucide-react"; // Asegúrate de tener lucide-react instalado

const ArchivosUser = () => {
  const token = localStorage.getItem("AUTH_TOKEN");

  const fetcher = (url) =>
    clienteAxios
      .get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => res.data);

  // Estados de búsqueda y paginación
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("fere");
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Estados para subir documento
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    descripcion: "",
    document: null,
  });
  const [uploadError, setUploadError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  // Query params
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim().length >= 2) p.append("q", q.trim());
    p.append("sort", sort);
    p.append("dir", dir);
    p.append("page", String(page));
    p.append("per_page", String(perPage));
    return p.toString();
  }, [q, sort, dir, page]);

  // ✅ Una sola llamada que resuelve todo
  const documentosKey = `/api/user/documents?${query}`;
  const { data, error, isLoading } = useSWR(documentosKey, fetcher);

  const documentos = data?.data ?? [];
  const usuario = data?.patient ?? null;
  const currentPage = data?.current_page ?? page;
  const lastPage = data?.last_page ?? 1;

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("El archivo no debe superar los 10MB");
      return;
    }

    // Validar tipo
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setUploadError("Tipo de archivo no permitido. Usa JPG, PNG, WEBP, PDF o DOC/DOCX");
      return;
    }

    setUploadError("");
    setUploadForm({ ...uploadForm, document: file });
    
    // Preview para imágenes
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewFile(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewFile(null);
    }
  };

  // Subir documento
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title.trim()) {
      setUploadError("El título es obligatorio");
      return;
    }
    
    if (!uploadForm.descripcion.trim()) {
      setUploadError("La descripción es obligatoria");
      return;
    }
    
    if (!uploadForm.document) {
      setUploadError("Debes seleccionar un archivo");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("descripcion", uploadForm.descripcion);
      formData.append("document", uploadForm.document);

      await clienteAxios.post("/api/user/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Resetear formulario
      setUploadForm({ title: "", descripcion: "", document: null });
      setPreviewFile(null);
      setShowUploadModal(false);
      
      // Revalidar lista
      mutate(documentosKey);
      
      alert("Documento subido exitosamente");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error al subir el documento";
      setUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // Cancelar upload
  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setUploadForm({ title: "", descripcion: "", document: null });
    setPreviewFile(null);
    setUploadError("");
  };

  // Estados de carga
  if (isLoading) return <p className="p-4 text-gray-600">Cargando documentos…</p>;
  if (error) return <p className="p-4 text-red-600">Error al cargar los documentos.</p>;
  if (!usuario) return <p className="p-4 text-gray-600">No se encontró usuario asociado.</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Documentos de {usuario.name}
        </h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Upload size={18} />
          Subir documento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Buscar (título / descripción)</label>
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="p. ej. Presupuesto, Consentimiento…"
            className="border px-3 py-2 rounded w-72"
          />
          {q.length > 0 && q.length < 2 && (
            <span className="text-xs text-yellow-600 mt-1">Mínimo 2 caracteres.</span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Ordenar por</label>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="border px-2 py-2 rounded"
          >
            <option value="fere">Fecha</option>
            <option value="title">Título</option>
            <option value="id">ID</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Dirección</label>
          <select
            value={dir}
            onChange={(e) => { setDir(e.target.value); setPage(1); }}
            className="border px-2 py-2 rounded"
          >
            <option value="desc">↓ Descendente</option>
            <option value="asc">↑ Ascendente</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm text-gray-800 bg-white">
          <thead className="bg-gray-100 text-xs text-gray-600 ">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documentos.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  No hay documentos para mostrar.
                </td>
              </tr>
            )}
            {documentos.map((d) => {
              const url = d.nomfi_url ?? d.nomfi ?? null;
              return (
                <tr key={d.id} className="hover:bg-gray-50 border-t border-gray-200 transition">
                  <td className="px-4 py-3">{d.id}</td>
                  <td className="px-4 py-3 font-medium">{d.title || "—"}</td>
                  <td className="px-4 py-3 max-w-md">
                    <div className="line-clamp-2 text-gray-600">{d.descripcion || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {d.fere ? new Date(d.fere).toLocaleDateString('es-AR') : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {url && (
                      
                        <a href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded inline-flex items-center gap-1"
                      >
                        <FileText size={14} />
                        Ver archivo
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex gap-4 items-center">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage <= 1}
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {currentPage} de {lastPage}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage >= lastPage}
        >
          Siguiente
        </button>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Subir documento</h3>
                <button
                  onClick={handleCancelUpload}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={uploading}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ej: Presupuesto dental"
                    disabled={uploading}
                    maxLength={255}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={uploadForm.descripcion}
                    onChange={(e) => setUploadForm({ ...uploadForm, descripcion: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el contenido del documento..."
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                {/* Archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Archivo * (máx. 10MB)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPG, PNG, WEBP, PDF, DOC, DOCX
                  </p>
                </div>

                {/* Preview de imagen */}
                {previewFile && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                    <img
                      src={previewFile}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg border border-gray-300"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                )}

                {/* Nombre del archivo seleccionado */}
                {uploadForm.document && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Archivo seleccionado:</span>{" "}
                      {uploadForm.document.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tamaño: {(uploadForm.document.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Error */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {uploadError}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={uploading}
                  >
                    {uploading ? "Subiendo..." : "Subir documento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivosUser;