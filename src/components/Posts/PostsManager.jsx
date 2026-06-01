import React, { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import clienteAxios from "../../config/axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import "./TiptapEditor.css";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// Componente de item sortable para drag & drop
const SortablePostItem = ({ post }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-xl shadow-sm flex items-center gap-4 p-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
      >
        <GripVertical size={20} />
      </div>
      {post.imagen ? (
        <img
          src={post.imagen}
          alt={post.titulo}
          className="w-20 h-16 object-cover rounded-lg"
        />
      ) : (
        <div className="w-20 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
          <span className="text-xs text-slate-400">Sin img</span>
        </div>
      )}
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{post.titulo}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              post.estado === "publicado"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {post.estado}
          </span>
          {post.categoria && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              {post.categoria.nombre}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de toolbar para Tiptap
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded ${editor.isActive("bold") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded ${editor.isActive("italic") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1 rounded ${editor.isActive("strike") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        <s>S</s>
      </button>
      <div className="w-px h-8 bg-slate-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        H3
      </button>
      <div className="w-px h-8 bg-slate-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded ${editor.isActive("bulletList") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        • Lista
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded ${editor.isActive("orderedList") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        1. Lista
      </button>
      <div className="w-px h-8 bg-slate-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`px-3 py-1 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`px-3 py-1 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        ↔
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`px-3 py-1 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        →
      </button>
    </div>
  );
};

export default function PostsManager() {
  const token = localStorage.getItem("AUTH_TOKEN");

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [estado, setEstado] = useState("borrador");
  const [categoriaId, setCategoriaId] = useState("");
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estados para drag & drop
  const [ordenItems, setOrdenItems] = useState([]);
  const [ordenLoading, setOrdenLoading] = useState(false);
  const [ordenError, setOrdenError] = useState(null);

  const fetcher = (url) =>
    clienteAxios(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.data);

  const { data, error: loadError, isLoading } = useSWR(
    "/api/admin/posts",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Cargar categorías
  const { data: categoriasData } = useSWR(
    "/api/posts-categorias",
    fetcher,
    { revalidateOnFocus: false }
  );

  const posts = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  // Función para cargar orden
  const fetchOrden = async () => {
    try {
      setOrdenLoading(true);
      setOrdenError(null);
      const { data } = await clienteAxios('/api/admin/posts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setOrdenItems(items);
    } catch (err) {
      console.error(err);
      setOrdenError('Error al cargar el orden de posts.');
    } finally {
      setOrdenLoading(false);
    }
  };

  useEffect(() => {
    fetchOrden();
  }, []);

  // Flatten categories for dropdown
  const flattenedCategories = useMemo(() => {
    const categorias = Array.isArray(categoriasData?.data) ? categoriasData.data : [];
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
  }, [categoriasData]);

  // Configurar el editor Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: contenido,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setContenido(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editingId) return;
    const post = posts.find((p) => p.id === editingId);
    if (!post) return;
    setTitulo(post.titulo || "");
    setContenido(post.contenido || "");
    setEstado(post.estado || "borrador");
    setCategoriaId(post.categoria_id || "");
    setImagen(null);
    setImagenPreview(post.imagen || null);
    setYoutubeUrl(post.youtube_url || post.youtubeUrl || "");
    
    // Actualizar contenido del editor
    if (editor && post.contenido) {
      editor.commands.setContent(post.contenido);
    }
  }, [editingId, posts]);

  // Actualizar editor cuando cambie el contenido inicial
  useEffect(() => {
    if (editor && !editingId && contenido === "") {
      editor.commands.setContent("");
    }
  }, [editor, editingId, contenido]);

  const resetForm = () => {
    setTitulo("");
    setContenido("");
    setEstado("borrador");
    setCategoriaId("");
    setImagen(null);
    setImagenPreview(null);
    setYoutubeUrl("");
    setEditingId(null);
    
    // Limpiar editor
    if (editor) {
      editor.commands.setContent("");
    }
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

    if (!titulo.trim()) {
      setError("El título del post es obligatorio.");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo.trim());
    formData.append("contenido", contenido.trim());
    formData.append("estado", estado);
    if (categoriaId) formData.append("categoria_id", categoriaId);
    if (imagen) formData.append("imagen", imagen);
    if (youtubeUrl.trim()) formData.append("youtube_url", youtubeUrl.trim());

    try {
      setCargando(true);
      if (editingId) {
        await clienteAxios.post(`/api/posts/${editingId}?_method=PUT`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMensaje("Post actualizado correctamente.");
      } else {
        await clienteAxios.post("/api/posts", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMensaje("Post creado correctamente.");
      }

      resetForm();
      mutate("/api/admin/posts");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo guardar el post.");
    } finally {
      setCargando(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este post?")) return;

    try {
      await clienteAxios.delete(`/api/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      mutate("/api/admin/posts");
      setMensaje("Post eliminado correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el post.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No publicado";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getYouTubeEmbedUrl = (value) => {
    if (!value) return null;
    const raw = value.trim();
    if (!raw) return null;
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      const url = new URL(withProtocol);
      const host = url.hostname.replace(/^www\./, "");
      let id = "";

      if (host === "youtu.be") {
        id = url.pathname.slice(1);
      } else if (host === "youtube.com" || host === "m.youtube.com") {
        if (url.pathname.startsWith("/watch")) {
          id = url.searchParams.get("v") || "";
        } else if (url.pathname.startsWith("/shorts/")) {
          id = url.pathname.split("/shorts/")[1] || "";
        } else if (url.pathname.startsWith("/embed/")) {
          id = url.pathname.split("/embed/")[1] || "";
        }
      }

      if (!id) return null;
      const cleanId = id.split("?")[0].split("&")[0];
      return `https://www.youtube.com/embed/${cleanId}`;
    } catch (err) {
      return null;
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordenItems.findIndex((p) => p.id === active.id);
    const newIndex = ordenItems.findIndex((p) => p.id === over.id);

    const newOrder = arrayMove(ordenItems, oldIndex, newIndex);
    setOrdenItems(newOrder);

    try {
      await clienteAxios.post(
        '/api/posts/reorder',
        {
          order: newOrder.map((p, index) => ({
            id: p.id,
            position: index + 1,
          })),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
    } catch (err) {
      console.error(err);
      setOrdenError('Error guardando el orden.');
    }
  };

  return (
    <div className="p-4 space-y-8">
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Editar post" : "Nuevo post"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Título
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del post"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contenido
            </label>
            <div className="border rounded-lg overflow-hidden">
              <MenuBar editor={editor} />
              <EditorContent 
                editor={editor} 
                className="prose max-w-none p-4 min-h-[300px] bg-white"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Usa la barra de herramientas para dar formato al contenido
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Categoría (opcional)
            </label>
            <select
              className="w-full border p-3 rounded-lg"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">-- Sin categoría --</option>
              {flattenedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {'\u00A0'.repeat(cat.level * 4)}{cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Estado
            </label>
            <select
              className="w-full border p-3 rounded-lg"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Los posts en borrador no serán visibles públicamente
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Imagen destacada (opcional)
            </label>
            {imagenPreview && (
              <img
                src={imagenPreview}
                alt="Vista previa"
                className="w-full h-48 object-cover rounded-lg border mb-3"
              />
            )}
            <div className="border-2 border-dashed rounded-lg p-4 text-center bg-slate-50">
              <input
                id="post-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onImagenChange}
                className="hidden"
              />
              <label
                htmlFor="post-image"
                className="inline-flex items-center justify-center px-4 py-2 bg-white border rounded-lg text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
              >
                Subir imagen
              </label>
              <p className="text-xs text-slate-500 mt-2">
                JPG, PNG o WEBP. Maximo {MAX_MB}MB.
              </p>
              {imagen && (
                <p className="text-xs text-slate-600 mt-1">
                  Archivo: {imagen.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Enlace de YouTube (opcional)
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Si agregas un enlace, el video se mostrara en el post.
            </p>
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

      {/* Orden por drag & drop */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">Orden de visualización</h3>
          <button
            onClick={fetchOrden}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            type="button"
          >
            Refrescar orden
          </button>
        </div>

        {ordenLoading && (
          <p className="text-sm text-slate-500">Cargando orden...</p>
        )}
        {ordenError && (
          <p className="text-sm text-red-600">{ordenError}</p>
        )}

        {!ordenLoading && ordenItems.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={ordenItems.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {ordenItems.map((post) => (
                  <SortablePostItem key={post.id} post={post} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Posts</h3>
          {isLoading && (
            <span className="text-sm text-slate-500">Cargando...</span>
          )}
        </div>

        {loadError && (
          <div className="text-sm text-red-600 mb-4">
            No se pudieron cargar los posts.
          </div>
        )}

        {posts.length === 0 && !isLoading && (
          <div className="text-sm text-slate-500">No hay posts creados.</div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 flex gap-4">
              {post.imagen ? (
                <img
                  src={post.imagen}
                  alt={post.titulo}
                  className="w-32 h-24 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-32 h-24 bg-slate-100 rounded-lg border flex items-center justify-center">
                  <span className="text-xs text-slate-400">Sin imagen</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-lg">{post.titulo}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      post.estado === "publicado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.estado}
                  </span>
                  {post.categoria && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      {post.categoria.nombre}
                    </span>
                  )}
                </div>
                <div 
                  className="text-sm text-slate-600 mb-2 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.contenido || "Sin contenido" }}
                />
                {(() => {
                  const rawUrl = post.youtube_url || post.youtubeUrl;
                  if (!rawUrl) return null;
                  const embedUrl = getYouTubeEmbedUrl(rawUrl);
                  return (
                    <div className="mb-2">
                      <div className="text-xs text-slate-500">YouTube</div>
                      {embedUrl ? (
                        <div className="aspect-video w-full max-w-md border rounded-lg overflow-hidden mt-1">
                          <iframe
                            src={embedUrl}
                            title={`Video de ${post.titulo}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a
                          href={rawUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Ver video
                        </a>
                      )}
                    </div>
                  );
                })()}
                <div className="text-xs text-slate-500 mb-2">
                  <span>Slug: {post.slug}</span>
                  {post.autor && <span className="ml-3">Por: {post.autor.name}</span>}
                  <span className="ml-3">{formatDate(post.publicado_en)}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(post.id)}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
