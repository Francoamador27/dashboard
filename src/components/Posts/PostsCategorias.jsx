import React, { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../../config/axios";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function PostsCategorias() {
  const token = localStorage.getItem("AUTH_TOKEN");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetcher = (url) => clienteAxios(url).then((res) => res.data);
  const { data, error: loadError, isLoading } = useSWR(
    "/api/posts-categorias",
    fetcher,
    { revalidateOnFocus: false }
  );

  const categorias = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  // Flatten categories for parent selection dropdown
  const flattenedCategories = useMemo(() => {
    const flatten = (cats, level = 0) => {
      let result = [];
      cats.forEach(cat => {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          result = [...result, ...flatten(cat.children, level + 1)];
        }
      });
      return result;
    };
    return flatten(categorias);
  }, [categorias]);

  useEffect(() => {
    if (!editingId) return;
    const cat = flattenedCategories.find((c) => c.id === editingId);
    if (!cat) return;
    setNombre(cat.nombre || "");
    setDescripcion(cat.descripcion || "");
    setParentId(cat.parent_id || "");
    setImagen(null);
    setImagenPreview(cat.imagen || null);
  }, [editingId, flattenedCategories]);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setImagen(null);
    setImagenPreview(null);
    setParentId("");
    setEditingId(null);
  };

  const validarArchivo = (file) => {
    const okType = /image\/(jpeg|png|webp)/.test(file.type);
    if (!okType) return "Formato invalido. Solo JPG, PNG o WEBP.";
    if (file.size > MAX_BYTES) return `Maximo ${MAX_MB}MB por imagen.`;
    return null;
  };

  const onImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validarArchivo(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setImagen(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!nombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("descripcion", descripcion.trim());
    if (parentId) formData.append("parent_id", parentId);
    if (imagen) formData.append("imagen", imagen);

    try {
      setCargando(true);
      if (editingId) {
        await clienteAxios.post(
          `/api/posts-categorias/${editingId}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setMensaje("Categoría actualizada correctamente.");
      } else {
        await clienteAxios.post("/api/posts-categorias", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMensaje("Categoría creada correctamente.");
      }

      resetForm();
      mutate("/api/posts-categorias");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la categoría.");
    } finally {
      setCargando(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;

    try {
      await clienteAxios.delete(`/api/posts-categorias/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      mutate("/api/posts-categorias");
      setMensaje("Categoría eliminada correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la categoría.");
    }
  };

  // Función recursiva para renderizar categorías con subcategorías
  const renderCategory = (cat, level = 0) => (
    <div key={cat.id} className={`${level > 0 ? 'ml-8 mt-2' : ''}`}>
      <div className="border rounded-lg p-4 flex gap-4 bg-white">
        {cat.imagen ? (
          <img
            src={cat.imagen}
            alt={cat.nombre}
            className="w-20 h-20 object-cover rounded-lg border"
          />
        ) : (
          <div className="w-20 h-20 bg-slate-100 rounded-lg border" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{cat.nombre}</h4>
            {level > 0 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                Subcategoría
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">
            {cat.descripcion || "Sin descripción"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Slug: {cat.slug}</p>
          {cat.children && cat.children.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {cat.children.length} subcategoría{cat.children.length !== 1 ? 's' : ''}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setEditingId(cat.id)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      {cat.children && cat.children.length > 0 && (
        <div className="space-y-2">
          {cat.children.map(child => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-8">
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Editar categoría" : "Nueva categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Nombre
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Tecnología, Viajes, Gastronomía"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Categoría Padre (opcional)
            </label>
            <select
              className="w-full border p-3 rounded-lg"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">-- Sin categoría padre (Principal) --</option>
              {flattenedCategories
                .filter(cat => cat.id !== editingId)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {'\u00A0'.repeat(cat.level * 4)}{cat.nombre}
                  </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Deja vacío para crear una categoría principal, o selecciona una para crear una subcategoría
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              className="w-full border p-3 rounded-lg"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción de la categoría"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Imagen (opcional)
            </label>
            {imagenPreview && (
              <img
                src={imagenPreview}
                alt="Vista previa"
                className="w-full h-48 object-cover rounded-lg border mb-3"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onImagenChange}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={cargando}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {cargando
                ? "Guardando..."
                : editingId
                ? "Actualizar"
                : "Crear"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg"
              >
                Cancelar
              </button>
            )}
          </div>

          {mensaje && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Categorías de Posts</h3>
          {isLoading && <span className="text-sm text-slate-500">Cargando...</span>}
        </div>

        {loadError && (
          <div className="text-sm text-red-600 mb-4">
            No se pudieron cargar las categorías.
          </div>
        )}

        {categorias.length === 0 && !isLoading && (
          <div className="text-sm text-slate-500">No hay categorías creadas.</div>
        )}

        <div className="space-y-4">
          {categorias.map((cat) => renderCategory(cat))}
        </div>
      </div>
    </div>
  );
}
