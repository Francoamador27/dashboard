import React, { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { useParams } from "react-router-dom";
import clienteAxios from "../../../../config/axios";
import { mostrarConfirmacion } from "../../../../utils/Alertas";

const isImageUrl = (url = "") =>
  /\.(jpe?g|png|webp)(\?.*)?$/i.test(url);

const ArchivosList = () => {
  const token = localStorage.getItem("AUTH_TOKEN");
  const { id } = useParams(); // idpa desde la ruta
  const idpa = id ? Number(id) : undefined;

  // Filtros / orden / paginación
  const [q, setQ] = useState("");
  const [fileQ, setFileQ] = useState("");
  const [sort, setSort] = useState("fere"); // por defecto fecha de registro
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Construir query string que entiende tu API
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim().length >= 2) p.append("q", q.trim());
    if (fileQ.trim().length >= 2) p.append("file", fileQ.trim());
    if (idpa) p.append("idpa", String(idpa));
    if (sort) p.append("sort", sort);
    if (dir) p.append("dir", dir);
    p.append("page", String(page));
    p.append("per_page", String(perPage));
    return p.toString();
  }, [q, fileQ, idpa, sort, dir, page, perPage]);

  const swrKey = `/api/documentos?${query}`;

  const fetcher = () =>
    clienteAxios(swrKey, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.data);

  const { data, error, isLoading } = useSWR(swrKey, fetcher);

  if (isLoading) return <p className="p-4 text-gray-600">Cargando documentos…</p>;
  if (error) return <p className="p-4 text-red-600">Error al cargar los documentos.</p>;

  const documentos = data?.data ?? [];
  const currentPage = data?.current_page ?? page;
  const lastPage = data?.last_page ?? 1;

  const handleEliminar = async (docId) => {
    let conf = mostrarConfirmacion( '¿Estás seguro que desea eliminar este documento?', 'Esta acción no se puede deshacer')
    if(!conf){return}
    try {
      await clienteAxios.delete(`/api/documentos/${docId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      mutate(swrKey);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el documento.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Documentos del usuario</h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Buscar (título / descripción)</label>
          <input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="p. ej. Presupuesto, Consentimiento…"
            className="border px-3 py-2 rounded w-72"
          />
          {q.length > 0 && q.length < 2 && (
            <span className="text-xs text-yellow-600 mt-1">Mínimo 2 caracteres.</span>
          )}
        </div>

        {/* <div className="flex flex-col">
          <label className="text-xs text-gray-600">Buscar por archivo (nomfi)</label>
          <input
            type="text"
            value={fileQ}
            onChange={(e) => {
              setFileQ(e.target.value);
              setPage(1);
            }}
            placeholder="p. ej. consentimiento.pdf"
            className="border px-3 py-2 rounded w-64"
          />
          {fileQ.length > 0 && fileQ.length < 2 && (
            <span className="text-xs text-yellow-600 mt-1">Mínimo 2 caracteres.</span>
          )}
        </div> */}

        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Ordenar por</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="border px-2 py-2 rounded"
          >
            <option value="fere">Fecha (fere)</option>
            <option value="title">Título</option>
            <option value="id">ID</option>
            <option value="nomfi">Archivo</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Dirección</label>
          <select
            value={dir}
            onChange={(e) => {
              setDir(e.target.value);
              setPage(1);
            }}
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
              <th className="px-4 py-3 text-left">usuario</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((d) => {
              const url = d.nomfi_url ?? d.nomfi ?? null;
              const isImg = isImageUrl(url || "");
              const usuario =
                d.patient_full_name ||
                (d.patient ? `${d.patient.nompa ?? ""} ${d.patient.apepa ?? ""}`.trim() : "—");

              return (
                <tr key={d.id} className="hover:bg-gray-50 border-t border-gray-200 transition">
                  <td className="px-4 py-3">{d.id}</td>

                  <td className="px-4 py-3 font-medium">{d.title || "—"}</td>
                  <td className="px-4 py-3 max-w-md">
                    <div className="line-clamp-2 text-gray-600">{d.descripcion || "—"}</div>
                  </td>
                  <td className="px-4 py-3">{usuario || "—"}</td>
                  <td className="px-4 py-3">
                    {d.fere ? new Date(d.fere).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-3 py-1 rounded"
                      >
                        Ver archivo
                      </a>
                    )}
                    <button
                      onClick={() => handleEliminar(d.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            {documentos.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                  No hay documentos para mostrar.
                </td>
              </tr>
            )}
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
    </div>
  );
};

export default ArchivosList;
