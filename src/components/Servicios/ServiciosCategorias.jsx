import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
const TiptapEditor = lazy(() => import("../TiptapEditor/TiptapEditor"));
import useSWR, { mutate } from "swr";
import clienteAxios from "../../config/axios";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function SortableCategoryCard({
  cat,
  level,
  onEdit,
  onDelete,
  renderChildren,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${level > 0 ? "ml-8 mt-2" : ""}`}
    >
      <div className="border rounded-lg p-4 flex gap-4 bg-white">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 mt-1"
          title="Arrastrar"
        >
          <GripVertical size={18} />
        </button>

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
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Subcategoria
              </span>
            )}
          </div>
          {cat.descripcion ? (
            <div
              className="text-sm text-slate-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: cat.descripcion }}
            />
          ) : (
            <p className="text-sm text-slate-600">Sin descripcion</p>
          )}
          {cat.children && cat.children.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {cat.children.length} subcategoria
              {cat.children.length !== 1 ? "s" : ""}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(cat.id)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(cat.id)}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      {renderChildren}
    </div>
  );
}

export default function ServiciosCategorias() {
  const token = localStorage.getItem("AUTH_TOKEN");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enfasis, setEnfasis] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [pdfActual, setPdfActual] = useState(null);
  const [removePdf, setRemovePdf] = useState(false);
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [orderedCategorias, setOrderedCategorias] = useState([]);

  const fetcher = (url) => clienteAxios(url).then((res) => res.data);
  const {
    data,
    error: loadError,
    isLoading,
  } = useSWR("/api/servicios-categorias", fetcher, {
    revalidateOnFocus: false,
  });

  const categorias = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  useEffect(() => {
    setOrderedCategorias(categorias);
  }, [categorias]);

  // Flatten categories for parent selection dropdown
  const flattenedCategories = useMemo(() => {
    const flatten = (cats, level = 0) => {
      let result = [];
      cats.forEach((cat) => {
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
    setEnfasis(cat.enfasis || "");
    setParentId(cat.parent_id || "");
    setImagen(null);
    setImagenPreview(cat.imagen || null);
    setPdf(null);
    setPdfActual(cat.pdf || null);
    setRemovePdf(false);
  }, [editingId, flattenedCategories]);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setEnfasis("");
    setImagen(null);
    setImagenPreview(null);
    setPdf(null);
    setPdfActual(null);
    setRemovePdf(false);
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
      setError("El nombre de la categoria es obligatorio.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("descripcion", descripcion);
    formData.append("enfasis", enfasis);
    if (parentId) formData.append("parent_id", parentId);
    if (imagen) formData.append("imagen", imagen);
    if (pdf) formData.append("pdf", pdf);
    if (removePdf) formData.append("remove_pdf", "1");

    try {
      setCargando(true);
      if (editingId) {
        await clienteAxios.post(
          `/api/servicios-categorias/${editingId}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setMensaje("Categoria actualizada correctamente.");
      } else {
        await clienteAxios.post("/api/servicios-categorias", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMensaje("Categoria creada correctamente.");
      }

      resetForm();
      mutate("/api/servicios-categorias");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la categoria.");
    } finally {
      setCargando(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Seguro que queres eliminar esta categoria?")) return;

    try {
      await clienteAxios.delete(`/api/servicios-categorias/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      mutate("/api/servicios-categorias");
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la categoria.");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCategorias.findIndex((c) => c.id === active.id);
    const newIndex = orderedCategorias.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newOrder = arrayMove(orderedCategorias, oldIndex, newIndex);
    setOrderedCategorias(newOrder);

    try {
      await clienteAxios.post(
        "/api/servicios-categorias/reorder",
        {
          parent_id: null,
          order: newOrder.map((cat, index) => ({
            id: cat.id,
            position: index + 1,
          })),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      mutate("/api/servicios-categorias");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el orden de categorias.");
      setOrderedCategorias(categorias);
    }
  };

  // Render recursivo para subcategorias (solo lectura por ahora)
  const renderCategory = (cat, level = 0) => (
    <div key={cat.id} className={`${level > 0 ? "ml-8 mt-2" : ""}`}>
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
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Subcategoria
              </span>
            )}
          </div>
          {cat.descripcion ? (
            <div
              className="text-sm text-slate-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: cat.descripcion }}
            />
          ) : (
            <p className="text-sm text-slate-600">Sin descripcion</p>
          )}
          {cat.children && cat.children.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {cat.children.length} subcategoria
              {cat.children.length !== 1 ? "s" : ""}
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
          {cat.children.map((child) => renderCategory(child, level + 1))}
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
              placeholder="Ej: Obras viales, hidráulicas , etc"
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
                .filter((cat) => cat.id !== editingId) // No puede ser su propia subcategoría
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"\u00A0".repeat(cat.level * 4)}
                    {cat.nombre}
                  </option>
                ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Deja vacío para crear una categoría principal, o selecciona una
              para crear una subcategoría
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción
            </label>
            <Suspense
              fallback={
                <div className="border rounded-lg p-4 text-slate-400">
                  Cargando editor....
                </div>
              }
            >
              <TiptapEditor
                content={descripcion}
                onChange={setDescripcion}
                placeholder="Breve descripción de la categoría"
              />
            </Suspense>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Énfasis (opcional)
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg"
              value={enfasis}
              onChange={(e) => setEnfasis(e.target.value)}
              placeholder="Ej: +15 años de experiencia en obras de infraestructura"
            />
            <p className="text-xs text-slate-500 mt-1">
              Texto corto que se muestra debajo del botón "VER SERVICIOS" en el
              home
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Imagen (opcional)
            </label>
            {imagenPreview && (
              <img
                src={imagenPreview}
                alt="Vista previa"
                className="w-full h-48 object-cover rounded-lg border mb-3"
              />
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
              <svg
                className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                {imagen ? imagen.name : "Hacer clic para subir imagen"}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                JPG, PNG o WEBP — máx. 5 MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onImagenChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              PDF de obras (opcional)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Se mostrará un botón "Ver más obras" en el grid de servicios de
              esta categoría
            </p>
            {pdfActual && !removePdf && (
              <div className="flex items-center gap-3 mb-2 p-2 bg-slate-50 border rounded-lg">
                <span className="text-sm text-slate-700 flex-1 truncate">
                  PDF cargado:{" "}
                  <a
                    href={pdfActual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    ver archivo
                  </a>
                </span>
                <button
                  type="button"
                  onClick={() => setRemovePdf(true)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            )}
            {removePdf && (
              <div className="flex items-center gap-3 mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm text-red-700 flex-1">
                  PDF será eliminado al guardar
                </span>
                <button
                  type="button"
                  onClick={() => setRemovePdf(false)}
                  className="text-xs text-slate-600 hover:underline"
                >
                  Cancelar
                </button>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-red-50 hover:border-red-400 transition-all group">
              <svg
                className="w-8 h-8 text-slate-400 group-hover:text-red-500 mb-2 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium text-slate-500 group-hover:text-red-600 transition-colors">
                {pdf ? pdf.name : "Hacer clic para subir PDF"}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Solo archivos PDF — máx. 20 MB
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPdf(file);
                  setRemovePdf(false);
                }}
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={cargando}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {cargando ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
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
            <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}
        </form>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Categorías</h3>
          {isLoading && (
            <span className="text-sm text-slate-500">Cargando...</span>
          )}
        </div>

        {loadError && (
          <div className="text-sm text-red-600 mb-4">
            No se pudieron cargar las categorías.
          </div>
        )}

        {categorias.length === 0 && !isLoading && (
          <div className="text-sm text-slate-500">
            No hay categorías creadas.
          </div>
        )}

        <p className="text-xs text-slate-500 mb-3">
          Arrastra las categorías principales desde el icono para definir su
          orden de visualización en el front.
        </p>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedCategorias.map((cat) => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {orderedCategorias.map((cat) => (
                <SortableCategoryCard
                  key={cat.id}
                  cat={cat}
                  level={0}
                  onEdit={setEditingId}
                  onDelete={handleDelete}
                  renderChildren={
                    cat.children && cat.children.length > 0 ? (
                      <div className="space-y-2">
                        {cat.children.map((child) => renderCategory(child, 1))}
                      </div>
                    ) : null
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
