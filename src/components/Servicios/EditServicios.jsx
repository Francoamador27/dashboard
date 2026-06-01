import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import clienteAxios from "../../config/axios";
import TiptapEditor from "../TiptapEditor/TiptapEditor";

// =========================
// UTILS
// =========================
const slugify = (str) =>
  str
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const extractYouTubeID = (url) => {
  if (!url) return "";
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : "";
};

// Convertir URL absoluta → ruta relativa
const toRelative = (url) => {
  if (!url) return "";
  return url.replace(/^https?:\/\/[^\/]+\/?/, "");
};

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// =========================
// COMPONENTE
// =========================
export default function EditServicios() {
  const token = localStorage.getItem("AUTH_TOKEN");
  const { id } = useParams();

  // CAMPOS
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [createData, setCreateData] = useState("");

  // TAGS
  const [tags, setTags] = useState([]);
  const [tagsInput, setTagsInput] = useState("");

  // FEATURES
  const [features, setFeatures] = useState([]);

  // IMAGEN PRINCIPAL
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  // GALERÍA
  const [existingGallery, setExistingGallery] = useState([]);
  const [galleryNew, setGalleryNew] = useState([]);
  const [galleryNewPreviews, setGalleryNewPreviews] = useState([]);

  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const slug = useMemo(() => slugify(title), [title]);

  // =========================
  // CARGAR SERVICIO
  // =========================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const { data } = await clienteAxios.get(`/api/servicios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const srv = data.data;

        setTitle(srv.title);
        setDescription(srv.description || "");
        setPrice(
          srv.price !== null && srv.price !== undefined
            ? String(srv.price)
            : "",
        );
        setVideo(srv.video || "");
        setYoutubeId(extractYouTubeID(srv.video || ""));
        setCategory(srv.category ? String(srv.category) : "");
        setCreateData(srv.create_data || "");

        // TAGS
        setTags(Array.isArray(srv.tags) ? srv.tags : []);

        // FEATURES
        setFeatures(
          Array.isArray(srv.features)
            ? srv.features
            : [{ title: "", description: "" }],
        );

        // IMAGE PRINCIPAL
        setMainImagePreview(srv.mainImage_url || srv.image_url || null);

        // GALLERY
        setExistingGallery(srv.gallery_urls || []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el servicio.");
      }
    };

    load();
  }, [id, token]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const { data } = await clienteAxios.get("/api/servicios-categorias", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setCategorias(items);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategorias();
  }, [token]);

  // Utilidad para aplanar categorías y subcategorías
  const flattenedCategorias = useMemo(() => {
    const flatten = (cats, level = 0) => {
      let result = [];
      cats.forEach((cat) => {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          result = result.concat(flatten(cat.children, level + 1));
        }
      });
      return result;
    };
    return flatten(categorias);
  }, [categorias]);

  // =========================
  // TAGS HANDLERS
  // =========================
  const addTagsFromInput = () => {
    const raw = tagsInput.trim();
    if (!raw) return;

    const nuevos = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length);

    setTags((prev) => Array.from(new Set([...prev, ...nuevos])));
    setTagsInput("");
  };

  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // FEATURES HANDLERS
  // =========================
  const addFeature = () => {
    setFeatures((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFeature = (index, field, value) => {
    setFeatures((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
  };

  // =========================
  // SUBMIT (UPDATE)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const featuresClean = features
      .map((f) => ({
        title: f.title.trim(),
        description: f.description.trim(),
      }))
      .filter((f) => f.title || f.description);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("description", description);
    if (price !== "") formData.append("price", price);
    formData.append("video", video);
    if (category) formData.append("category", String(category));
    if (createData) formData.append("create_data", createData);

    // TAGS JSON
    formData.append("tags", JSON.stringify(tags));

    // FEATURES JSON
    formData.append("features", JSON.stringify(featuresClean));

    // MAIN IMAGE
    if (mainImage) {
      formData.append("mainImage", mainImage);
      formData.append("image", mainImage);
    }

    // GALERIA EXISTENTE
    const finalExisting = existingGallery.map((url) => toRelative(url));
    formData.append("gallery", JSON.stringify(finalExisting));

    // NUEVAS IMÁGENES
    galleryNew.forEach((f) => formData.append("gallery[]", f));

    try {
      setCargando(true);

      await clienteAxios.post(`/api/servicios/${id}?_method=PUT`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMensaje("servicio actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el servicio.");
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg border border-slate-200 rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-6">Editar servicio #{id}</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ===== TÍTULO ===== */}
            <div>
              <label className="font-semibold">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 border p-3 rounded-lg"
              />
            </div>

            {/* ===== DESCRIPCION ===== */}
            <div>
              <label className="font-semibold">Descripcion</label>
              <TiptapEditor
                content={description}
                onChange={setDescription}
                placeholder="Describe el servicio/obra..."
              />
            </div>

            {/* ===== CATEGORIA ===== */}
            <div>
              <label className="font-semibold">Categoria del servicio</label>
              <select
                className="w-full mt-1 border p-3 rounded-lg"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Selecciona una categoria</option>
                {flattenedCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {Array(cat.level).fill("\u00A0\u00A0\u00A0\u00A0").join("")}
                    {cat.level > 0 ? "└ " : ""}
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* ===== PRECIO ===== */}
            <div>
              <label className="font-semibold">Precio (opcional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full mt-1 border p-3 rounded-lg"
                placeholder="Ej: 12500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* ===== VIDEO ===== */}
            <div>
              <label className="font-semibold">Video de YouTube</label>
              <input
                type="text"
                value={video}
                onChange={(e) => {
                  setVideo(e.target.value);
                  setYoutubeId(extractYouTubeID(e.target.value));
                }}
                className="w-full mt-1 border p-3 rounded-lg"
              />

              {youtubeId && (
                <iframe
                  className="w-full mt-4 rounded-xl aspect-video"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  allowFullScreen
                />
              )}
            </div>

            {/* ===== TAGS ===== */}
            <div className="space-y-3">
              <label className="font-semibold">Tags</label>

              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 border p-3 rounded-lg"
                  placeholder="Agregar tag..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagsFromInput();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTagsFromInput}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg"
                >
                  Agregar
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-slate-50">
                  {tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-full flex items-center gap-2"
                    >
                      {t}
                      <button
                        type="button"
                        className="text-white/70 hover:text-white"
                        onClick={() => removeTag(i)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ===== FEATURES ===== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold">Características</label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                >
                  + Agregar característica
                </button>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 border rounded-xl">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white p-4 border rounded-xl"
                  >
                    <input
                      type="text"
                      className="md:col-span-2 border p-3 rounded-lg"
                      placeholder="Título"
                      value={f.title}
                      onChange={(e) =>
                        updateFeature(i, "title", e.target.value)
                      }
                    />

                    <textarea
                      className="md:col-span-4 border p-3 rounded-lg"
                      rows={2}
                      placeholder="Descripción"
                      value={f.description}
                      onChange={(e) =>
                        updateFeature(i, "description", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== IMAGEN PRINCIPAL ===== */}
            <div>
              <label className="font-semibold">Imagen principal</label>

              {mainImagePreview && (
                <img
                  src={mainImagePreview}
                  className="w-full h-64 object-cover rounded-xl mb-3"
                />
              )}

              <label className="block w-full text-center p-4 bg-blue-50 border border-blue-300 rounded-xl cursor-pointer hover:bg-blue-100">
                Subir imagen principal
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setMainImage(file);
                    setMainImagePreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            </div>

            {/* ===== GALERÍA EXISTENTE ===== */}
            <div>
              <label className="font-semibold">Galería existente</label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                {existingGallery.map((g, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={g}
                      className="w-full h-32 object-cover rounded-lg border"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setExistingGallery((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 text-xs rounded opacity-0 group-hover:opacity-100"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== NUEVAS IMÁGENES DE GALERÍA ===== */}
            <div>
              <label className="font-semibold">Agregar nuevas imágenes</label>

              <label className="block text-center p-4 mt-2 bg-blue-50 border border-blue-300 rounded-xl cursor-pointer hover:bg-blue-100">
                Agregar imágenes
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setGalleryNew(files);
                    setGalleryNewPreviews(
                      files.map((f) => URL.createObjectURL(f)),
                    );
                  }}
                />
              </label>

              {galleryNewPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {galleryNewPreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="w-full h-32 object-cover border rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ===== BOTÓN SUBMIT ===== */}
            <button
              type="submit"
              disabled={cargando}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl"
            >
              {cargando ? "Actualizando..." : "Actualizar servicio"}
            </button>

            {mensaje && (
              <p className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                {mensaje}
              </p>
            )}

            {error && (
              <p className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
