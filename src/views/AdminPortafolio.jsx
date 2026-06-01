import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Loader, X, Save } from 'lucide-react';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import "../components/Posts/TiptapEditor.css";
import clienteAxios from '../config/axios';
import { mostrarExito, mostrarError } from '../utils/Alertas';


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
      <div className="w-px bg-slate-300 mx-1"></div>
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
      <div className="w-px bg-slate-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded ${editor.isActive("bulletList") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded ${editor.isActive("orderedList") ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        1. List
      </button>
      <div className="w-px bg-slate-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`px-3 py-1 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        ← Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`px-3 py-1 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        ↔ Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`px-3 py-1 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-600 text-white" : "bg-white"}`}
      >
        Right →
      </button>
    </div>
  );
};

export default function AdminPortafolio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [proyecto, setProyecto] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    imagen: null,
    categoria_id: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Categorías y galería
  const [categorias, setCategorias] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [galeriaToDelete, setGaleriaToDelete] = useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: proyecto.contenido || '',
  });

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('blob:') || path.startsWith('http') || path.startsWith('data:')) return path;

    const cleanPath = String(path).replace(/^\/+/, '');

    if (cleanPath.startsWith('storage/')) {
      return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
    }

    if (cleanPath.startsWith('portafolio/') || cleanPath.startsWith('portafolio-galeria/')) {
      return `${import.meta.env.VITE_API_URL}/storage/uploads/${cleanPath}`;
    }

    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    fetchCategorias();
    if (id) {
      fetchProyecto();
    }
  }, [id]);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(proyecto.contenido || '', false);
    }
  }, [editor, proyecto.contenido]);

  const fetchCategorias = async () => {
    try {
      const { data } = await clienteAxios.get('/api/portafolio-categorias');
      setCategorias(data.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchProyecto = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get(`/api/portafolios/${id}`);
      const proyectoData = data?.data || {};

      setProyecto({
        titulo: proyectoData.titulo || '',
        descripcion: proyectoData.descripcion || '',
        contenido: proyectoData.contenido || '',
        imagen: null,
        categoria_id: proyectoData.categoria_id || '',
      });
      setImagePreview(getImageUrl(proyectoData.imagen));
      setGaleria(
        Array.isArray(proyectoData.galeria)
          ? proyectoData.galeria.map((img) => ({
              ...img,
              preview: getImageUrl(img.imagen),
              isNew: false,
            }))
          : []
      );
      setGaleriaToDelete([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProyecto({ ...proyecto, imagen: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGaleriaChange = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        setGaleria(prev => [...prev, {
          id: `new_${Date.now()}_${Math.random()}`,
          imagen: file,
          preview: URL.createObjectURL(file),
          title: file.name,
          isNew: true,
        }]);
      });
    }
  };

  const removeGaleriaImage = (imagenId) => {
    const imagen = galeria.find(g => g.id === imagenId);
    if (imagen && !imagen.isNew) {
      setGaleriaToDelete(prev => [...prev, imagenId]);
    }
    setGaleria(prev => prev.filter(g => g.id !== imagenId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProyecto({ ...proyecto, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editor) {
      mostrarError('El editor no se ha inicializado');
      return;
    }


    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('titulo', proyecto.titulo);
      formData.append('descripcion', proyecto.descripcion);
      formData.append('contenido', editor.getHTML());
      formData.append('categoria_id', proyecto.categoria_id || '');
      
      if (proyecto.imagen instanceof File) {
        formData.append('imagen', proyecto.imagen);
      }

      // Agregar imágenes nuevas de galería
      galeria.forEach(img => {
        if (img.isNew && img.imagen instanceof File) {
          formData.append('galeria[]', img.imagen);
        }
      });

      if (id) {
        await clienteAxios.post(`/api/portafolios/${id}`, formData);
        
        // Eliminar imágenes de galería que se marcaron para borrar
        for (const galeriaId of galeriaToDelete) {
          try {
            await clienteAxios.delete(`/api/portafolios/${id}/galeria/${galeriaId}`);
          } catch (err) {
            console.error('Error al eliminar imagen:', err);
          }
        }
      } else {
        await clienteAxios.post('/api/portafolios', formData);
      }

      mostrarExito(id ? 'Maquinaria actualizada' : 'Maquinaria creada');
      navigate('/admin-dash/portafolio');
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al guardar la maquinaria');
    } finally {

      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-12 h-12 text-[#0891b2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-black text-slate-900 mb-8">
        {id ? 'Editar Maquinaria' : 'Nueva Maquinaria'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Imagen */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-4">Imagen de la Maquinaria</label>
          
          <div className="relative">
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={getImageUrl(imagePreview)}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProyecto({ ...proyecto, imagen: null });
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">Haz clic para subir imagen</p>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP (máx 2MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Título */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Título</label>
          <input
            type="text"
            name="titulo"
            value={proyecto.titulo}
            onChange={handleInputChange}
            placeholder="Ingresa el título de la maquinaria"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Descripción */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Descripción Corta</label>
          <textarea
            name="descripcion"
            value={proyecto.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción breve de la maquinaria"
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent transition-all resize-none"
            required
          />
        </div>

        {/* Categoría */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Categoría</label>
          <select
            value={proyecto.categoria_id}
            onChange={(e) => setProyecto({ ...proyecto, categoria_id: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent transition-all"
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => (
              <optgroup key={cat.id} label={cat.nombre}>
                <option value={cat.id}>{cat.nombre}</option>
                {cat.children && cat.children.map(sub => (
                  <option key={sub.id} value={sub.id}>&nbsp;&nbsp;{sub.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Contenido Detallado */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-3">Contenido Detallado</label>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <MenuBar editor={editor} />
            <EditorContent
              editor={editor}
              className="ProseMirror w-full px-4 py-3 min-h-96 focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Usa las herramientas arriba para dar formato al contenido</p>
        </div>

        {/* Galería de Imágenes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-4">Galería de Imágenes</label>
          
          {/* Subir nuevas imágenes */}
          <label className="block w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors mb-6">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Arrastra imágenes aquí o haz clic</p>
            <p className="text-xs text-slate-500">PNG, JPG, WEBP (máx 2MB cada una)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleGaleriaChange}
              className="hidden"
            />
          </label>

          {/* Mostrar imágenes de galería */}
          {galeria.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galeria.map(img => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.preview || getImageUrl(img.imagen)}
                    alt={img.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGaleriaImage(img.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {galeria.length === 0 && (
            <p className="text-center text-slate-500 py-8">Sin imágenes en la galería</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0891b2] hover:bg-[#0e7490] disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {id ? 'Actualizar Maquinaria' : 'Crear Maquinaria'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
