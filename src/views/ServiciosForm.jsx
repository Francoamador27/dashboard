import React, { useState, useMemo, useEffect } from "react";
import clienteAxios from "../config/axios";
import TiptapEditor from "../components/TiptapEditor/TiptapEditor";

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

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// 🔥 Función para extraer el ID de cualquier URL de YouTube
const extractYouTubeID = (url) => {
  if (!url) return "";
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : "";
};

const ServiciosForm = () => {
  const token = localStorage.getItem("AUTH_TOKEN");

  const [title, setTitle] = useState("");
  const [video, setVideo] = useState("");
  const [youtubeId, setYoutubeId] = useState(""); // ID para previsualizar
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const slug = useMemo(() => slugify(title), [title]);
  const [category, setCategory] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [createData, setCreateData] = useState("");

  // Tags
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);

  // Características
  const [features, setFeatures] = useState([{ title: "", description: "" }]);

  // Imágenes
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // Estado UI
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [dragActiveMain, setDragActiveMain] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const { data } = await clienteAxios.get("/api/servicios-categorias");
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setCategorias(items);
        if (!category && items.length > 0) {
          setCategory("");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCategorias();
  }, []);

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

  // Validación archivos
  const validarArchivo = (file) => {
    const okType = /image\/(jpeg|png|webp)/.test(file.type);
    if (!okType) return "Formato inválido. Solo JPG, PNG o WEBP.";
    if (file.size > MAX_BYTES) return `Máximo ${MAX_MB}MB por imagen.`;
    return null;
  };

  // Tags
  const parseTags = (raw) =>
    raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length);

  const addTagsFromInput = () => {
    const nuevos = parseTags(tagsInput);
    if (!nuevos.length) return;
    const set = new Set([...tags, ...nuevos]);
    setTags(Array.from(set));
    setTagsInput("");
  };

  const removeTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  // Features
  const addFeature = () => {
    setFeatures((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeFeature = (idx) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFeature = (idx, field, value) => {
    setFeatures((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)),
    );
  };

  // Main Image
  const handleMainImageChange = (file) => {
    if (!file) return;
    const err = validarArchivo(file);
    if (err) {
      setError(err);
      setMainImage(null);
      setMainImagePreview(null);
      return;
    }
    setError(null);
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const onMainImageInput = (e) => {
    const file = e.target.files?.[0];
    handleMainImageChange(file);
  };

  const onMainDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover")
      setDragActiveMain(true);
    if (e.type === "dragleave") setDragActiveMain(false);
  };

  const onMainDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveMain(false);
    const file = e.dataTransfer.files?.[0];
    handleMainImageChange(file);
  };

  const clearMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
  };
  // GALLERY
  const handleGalleryChange = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    const nuevos = [];
    const previews = [];
    for (const f of files) {
      const err = validarArchivo(f);
      if (err) {
        setError(err);
        continue;
      }
      nuevos.push(f);
      previews.push(URL.createObjectURL(f));
    }

    setError(null);
    setGallery((prev) => [...prev, ...nuevos]);
    setGalleryPreviews((prev) => [...prev, ...previews]);
  };

  const onGalleryInput = (e) => {
    handleGalleryChange(e.target.files);
  };

  const onGalleryDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover")
      setDragActiveGallery(true);
    if (e.type === "dragleave") setDragActiveGallery(false);
  };

  const onGalleryDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveGallery(false);
    handleGalleryChange(e.dataTransfer.files);
  };

  const removeGalleryItem = (idx) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    // Validaciones mínimas
    if (!title.trim())
      return setError("El nombre del servicio es obligatorio.");
    if (!description.trim())
      return setError("La descripcion del servicio es obligatoria.");
    if (categorias.length > 0 && !category)
      return setError("Selecciona una categoria para el servicio.");
    if (!mainImage) return setError("Subí la imagen principal.");

    // features: opcional, pero si hay vacías, las filtramos
    const featuresClean = features
      .map((f) => ({
        title: f.title.trim(),
        description: f.description.trim(),
      }))
      .filter((f) => f.title || f.description);

    // armado del payload
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("description", description);
    if (price !== "") formData.append("price", price);
    formData.append("video", video);
    if (category) formData.append("category", String(category));
    if (createData) formData.append("create_data", createData);

    // Tags
    tags.forEach((t) => formData.append("tags[]", t));
    formData.append("tags_json", JSON.stringify(tags));

    // Features y imágenes
    formData.append("features", JSON.stringify(featuresClean));
    if (mainImage) {
      formData.append("mainImage", mainImage);
      formData.append("image", mainImage);
    }

    // Galería
    gallery.forEach((f) => formData.append("gallery[]", f));

    try {
      setCargando(true);

      const response = await clienteAxios.post("/api/servicios", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setMensaje("servicio registrado correctamente");

        // Reset del formulario
        setTitle("");
        setVideo("");
        setYoutubeId("");
        setDescription("");
        setPrice("");
        setTagsInput("");
        setTags([]);
        setFeatures([{ title: "", description: "" }]);
        setCategory("");
        setCreateData("");
        clearMainImage();
        setGallery([]);
        setGalleryPreviews([]);
      }
    } catch (err) {
      console.error("Error completo:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Error del servidor: ${err.response.status}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 ">
      <div className="max-w-5xl mx-auto">
        {/* Form Container */}
        <div className="bg-white shadow-lg border border-slate-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nombre + Slug */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 bg-white"
                  placeholder="Obra hidráulica, Viales, etc"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Identificador (automático)
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 text-slate-600"
                  value={slug}
                  readOnly
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Descripcion del servicio
              </label>
              <TiptapEditor
                content={description}
                onChange={setDescription}
                placeholder="Describe el servicio, ingredientes principales y estilo de preparacion..."
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Categoria de la obra
              </label>
              <select
                className="w-full border border-slate-300 p-3 rounded-lg bg-white"
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

            {/* Precio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Precio (opcional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-slate-300 p-3 rounded-lg bg-white"
                placeholder="Ej: 12500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Link de YouTube */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Video de YouTube (opcional)
              </label>

              <input
                type="text"
                className="w-full border border-slate-300 p-3 rounded-lg 
                                focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-200 bg-white"
                placeholder="Pegá el enlace de YouTube aquí"
                value={video}
                onChange={(e) => {
                  const val = e.target.value;
                  setVideo(val);
                  setYoutubeId(extractYouTubeID(val));
                }}
              />

              {youtubeId && (
                <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden shadow-lg border border-slate-200">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Palabras Clave del servicio
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 border border-slate-300 p-3 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 bg-white"
                  placeholder="Ej: Vegano, Sin gluten, Picante..."
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
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200"
                  onClick={addTagsFromInput}
                >
                  Agregar
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {tags.map((t, idx) => (
                    <span
                      key={`${t}-${idx}`}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {t}
                      <button
                        type="button"
                        className="text-blue-100 hover:text-white hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-all duration-200"
                        onClick={() => removeTag(idx)}
                        aria-label="Eliminar etiqueta"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Imagen principal */}
            <div
              className="space-y-3"
              onDragEnter={onMainDrag}
              onDragOver={onMainDrag}
              onDragLeave={onMainDrag}
              onDrop={onMainDrop}
            >
              <label className="block text-sm font-semibold text-slate-700">
                Imagen Principal del servicio
                <span className="text-xs text-slate-500 font-normal ml-2">
                  (JPG/PNG/WEBP, máximo {MAX_MB}MB)
                </span>
              </label>

              {mainImagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-200 group">
                  <img
                    src={mainImagePreview}
                    alt="Vista previa"
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={clearMainImage}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                    >
                      Eliminar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="mainImage"
                  className={`flex flex-col items-center justify-center w-full h-48 px-6 py-8 transition-all duration-300 bg-slate-50 border-2 border-dashed cursor-pointer rounded-lg hover:bg-slate-100 ${
                    dragActiveMain
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 text-slate-400">📷</div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      Subir imagen principal
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-blue-600">
                        Seleccione un archivo
                      </span>{" "}
                      o arrástrelo aquí
                    </p>
                  </div>
                  <input
                    id="mainImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onMainImageInput}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Galería múltiple */}
            <div
              className="space-y-3"
              onDragEnter={onGalleryDrag}
              onDragOver={onGalleryDrag}
              onDragLeave={onGalleryDrag}
              onDrop={onGalleryDrop}
            >
              <label className="block text-sm font-semibold text-slate-700">
                Galeria de Imagenes Adicionales
                <span className="text-xs text-slate-500 font-normal ml-2">
                  (JPG/PNG/WEBP, máximo {MAX_MB}MB cada una)
                </span>
              </label>

              <label
                htmlFor="gallery"
                className={`flex flex-col items-center justify-center w-full h-32 px-6 py-4 transition-all duration-300 bg-slate-50 border-2 border-dashed cursor-pointer rounded-lg hover:bg-slate-100 ${
                  dragActiveGallery
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2 text-slate-400">📁</div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Agregar imágenes adicionales
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-teal-600">
                      Seleccione archivos
                    </span>{" "}
                    o arrástrelos aquí
                  </p>
                </div>
                <input
                  id="gallery"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onGalleryInput}
                  className="sr-only"
                />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {galleryPreviews.map((src, idx) => (
                    <div key={src} className="relative h-24 group">
                      <img
                        src={src}
                        alt={`Galería ${idx + 1}`}
                        className="object-cover w-full h-full rounded-lg border border-slate-200 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded font-semibold transition-all duration-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Características dinámicas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Caracteristicas del servicio
                </label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all duration-200 text-sm"
                >
                  + Agregar Caracteristica
                </button>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {features.map((f, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-start p-4 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="lg:col-span-2">
                      <input
                        type="text"
                        className="w-full border border-slate-300 p-3 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all duration-200"
                        placeholder="Título de la característica"
                        value={f.title}
                        onChange={(e) =>
                          updateFeature(idx, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <textarea
                        className="w-full border border-slate-300 p-3 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all duration-200 resize-none"
                        placeholder="Descripcion detallada..."
                        rows={2}
                        value={f.description}
                        onChange={(e) =>
                          updateFeature(idx, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="w-full px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition-all duration-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Botones de acción */}
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
                  "Registrar servicio"
                )}
              </button>

              {/* Vista previa del JSON */}
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
                        price,
                        video, // 🔴 el link de YouTube enviado
                        category,
                        tags,
                        features: features
                          .map((f) => ({
                            title: f.title.trim(),
                            description: f.description.trim(),
                          }))
                          .filter((f) => f.title || f.description),
                        image: mainImage
                          ? "(archivo de imagen principal)"
                          : null,
                        mainImage: mainImage
                          ? "(archivo de imagen principal)"
                          : null,
                        gallery: gallery.length
                          ? `(${gallery.length} archivos de galería)`
                          : [],
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </details>
            </div>

            {/* Mensajes de estado */}
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

export default ServiciosForm;
