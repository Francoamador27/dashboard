import React, { useState, useEffect } from "react";
import clienteAxios from "../../config/axios";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const SortableImage = ({ img, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-40 h-40 border rounded relative overflow-hidden shadow bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 bg-white/90 text-gray-600 rounded p-1 cursor-grab active:cursor-grabbing"
        title="Arrastrar"
      >
        <GripVertical size={16} />
      </div>
      <img
        src={`${import.meta.env.VITE_API_URL}/storage/uploads${img.imagen}`}
        alt="Galería de proyectos de Anka Loo Construcciones – soluciones tecnológicas innovadoras"
        className="object-cover w-full h-full"
      />
      <button
        onClick={() => onDelete(img.id)}
        className="absolute top-1 right-1 bg-white text-red-600 text-xs px-2 py-1 rounded shadow hover:bg-red-100"
      >
        Eliminar
      </button>
    </div>
  );
};

const GaleriaPanel = () => {
  const token = localStorage.getItem("AUTH_TOKEN");

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagenesSubidas, setImagenesSubidas] = useState([]);
  const [ordenError, setOrdenError] = useState(null);

  // Obtener imágenes al montar
  useEffect(() => {
    obtenerImagenes();
  }, []);

  const obtenerImagenes = async () => {
    try {
      const { data } = await clienteAxios.get("/api/ejemplos");
      setImagenesSubidas(data.data);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2097152) {
      setError("La imagen no puede pesar más de 2MB");
      setImagen(null);
      setPreview(null);
      return;
    }

    setError(null);
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size > 2097152) {
      setError("La imagen no puede pesar más de 2MB");
      setImagen(null);
      setPreview(null);
      return;
    }

    setError(null);
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const eliminarImagen = () => {
    setImagen(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!imagen) {
      setError("Debés seleccionar una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("imagen", imagen);

    try {
      setCargando(true);
      await clienteAxios.post("/api/ejemplos", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMensaje("Imagen subida correctamente");
      setImagen(null);
      setPreview(null);
      obtenerImagenes(); // actualizar galería
    } catch (err) {
      setError("Error al subir la imagen");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro que querés eliminar esta imagen?")) return;
    try {
      await clienteAxios.delete(`/api/ejemplos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMensaje("Imagen eliminada");
      obtenerImagenes(); // refrescar lista
    } catch (err) {
      setError("Error al eliminar la imagen");
      console.error(err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = imagenesSubidas.findIndex((img) => img.id === active.id);
    const newIndex = imagenesSubidas.findIndex((img) => img.id === over.id);

    const newOrder = arrayMove(imagenesSubidas, oldIndex, newIndex);
    setImagenesSubidas(newOrder);

    try {
      await clienteAxios.post(
        "/api/ejemplos/reorder",
        {
          order: newOrder.map((img, index) => ({
            id: img.id,
            position: index + 1,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setOrdenError(null);
    } catch (err) {
      console.error(err);
      setOrdenError("Error guardando el orden.");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Subir imagen a la galería</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Imagen
          </label>

          {preview ? (
            <div className="relative w-full h-40 rounded-md overflow-hidden border border-gray-300">
              <img
                src={preview}
                alt="Vista previa"
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={eliminarImagen}
                className="absolute top-2 right-2 bg-white text-red-600 text-xs px-2 py-1 rounded shadow hover:bg-red-100"
              >
                Quitar
              </button>
            </div>
          ) : (
            <label
              htmlFor="imagen"
              className={`flex items-center justify-center w-full h-40 px-4 transition bg-white border-2 ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-dashed"
              } border-gray-300 rounded-md cursor-pointer hover:border-blue-400 focus:outline-none`}
            >
              <div className="text-center">
                <svg
                  className="w-10 h-10 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5V19a2.5 2.5 0 002.5 2.5h13a2.5 2.5 0 002.5-2.5v-2.5M16.5 3.75l-4.5 4.5m0 0L7.5 3.75M12 8.25V15"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">
                    Seleccioná un archivo
                  </span>{" "}
                  o arrastralo aquí
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Solo JPG, PNG o WEBP. Máx 2MB.
                </p>
              </div>
              <input
                id="imagen"
                name="imagen"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="bg-[#008DD2] text-white px-4 py-2 rounded hover:bg-[#0070aa] disabled:opacity-50"
        >
          {cargando ? "Subiendo..." : "Subir"}
        </button>

        {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {/* Galería */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold">Imágenes subidas</h3>
          <button
            onClick={obtenerImagenes}
            className="text-sm text-blue-600 hover:text-blue-700"
            type="button"
          >
            Refrescar orden
          </button>
        </div>
        {ordenError && (
          <p className="text-red-600 text-sm mb-2">{ordenError}</p>
        )}
        {imagenesSubidas.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay imágenes subidas aún.</p>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={imagenesSubidas.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="flex flex-wrap gap-4">
                {imagenesSubidas.map((img) => (
                  <SortableImage
                    key={img.id}
                    img={img}
                    onDelete={handleEliminar}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default GaleriaPanel;
