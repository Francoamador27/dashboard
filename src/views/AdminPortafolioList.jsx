import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Plus, Trash2, Edit, GripVertical, UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clienteAxios from '../config/axios';

function SortablePortafolioItem({ proyecto, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: proyecto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }

    const cleanPath = String(path).replace(/^\/+/, '');

    if (cleanPath.startsWith('storage/')) {
      return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
    }

    if (cleanPath.startsWith('portafolio/') || cleanPath.startsWith('portafolio-galeria/')) {
      return `${import.meta.env.VITE_API_URL}/storage/uploads/${cleanPath}`;
    }

    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-100 hover:border-[#fdce27] hover:shadow-xl transition-all"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-2 text-slate-400 hover:text-[#fdce27] cursor-grab active:cursor-grabbing transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Imagen */}
      {proyecto.imagen && (
        <img
          src={getImageUrl(proyecto.imagen)}
          alt={proyecto.titulo}
          className="w-16 h-16 object-cover rounded-lg"
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate">{proyecto.titulo}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{proyecto.descripcion}</p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <Link
          to={`/admin-dash/portafolio/${proyecto.id}`}
          className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-[#fdce27] hover:text-[#1c1c1c] rounded-xl transition-colors"
          title="Editar"
        >
          <Edit className="w-5 h-5" />
        </Link>
        <button
          onClick={() => onDelete(proyecto.id)}
          className="flex items-center justify-center w-10 h-10 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminPortafolioList() {
  const [portafolios, setPortafolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('proyectos');
  const token = localStorage.getItem('AUTH_TOKEN');

  // Estado para categorías
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado carga masiva
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkInputRef = useRef(null);

  const handleBulkSelect = (files) => {
    const nuevas = Array.from(files).map((file) => ({
      id: `${Date.now()}_${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
      status: 'pending', // pending | uploading | done | error
    }));
    setBulkImages((prev) => [...prev, ...nuevas]);
  };

  const handleBulkDrop = (e) => {
    e.preventDefault();
    handleBulkSelect(e.dataTransfer.files);
  };

  const updateBulkTitle = (id, title) => {
    setBulkImages((prev) => prev.map((img) => img.id === id ? { ...img, title } : img));
  };

  const removeBulkImage = (id) => {
    setBulkImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleBulkUpload = async () => {
    const pending = bulkImages.filter((img) => img.status === 'pending');
    if (!pending.length) return;
    setBulkUploading(true);

    for (const img of pending) {
      setBulkImages((prev) => prev.map((i) => i.id === img.id ? { ...i, status: 'uploading' } : i));
      try {
        const formData = new FormData();
        const titulo = img.title || img.file.name;
        formData.append('titulo', titulo);
        formData.append('descripcion', titulo);
        formData.append('imagen', img.file);
        await clienteAxios.post('/api/portafolios', formData);
        setBulkImages((prev) => prev.map((i) => i.id === img.id ? { ...i, status: 'done' } : i));
      } catch {
        setBulkImages((prev) => prev.map((i) => i.id === img.id ? { ...i, status: 'error' } : i));
      }
    }

    setBulkUploading(false);
    fetchPortafolios();
  };

  const fetcher = (url) => clienteAxios(url).then((res) => res.data);
  const { data, error: loadError, isLoading } = useSWR(
    '/api/portafolio-categorias',
    fetcher,
    { revalidateOnFocus: false }
  );

  const categorias = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchPortafolios();
  }, []);

  const fetchPortafolios = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get('/api/portafolios');
      setPortafolios(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proyectoId) => {
    if (!confirm('¿Está seguro de que desea eliminar este proyecto?')) return;

    try {
      await clienteAxios.delete(`/api/portafolios/${proyectoId}`);
      setPortafolios(portafolios.filter((p) => p.id !== proyectoId));
      alert('Proyecto eliminado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el proyecto');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = portafolios.findIndex((p) => p.id === active.id);
      const newIndex = portafolios.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(portafolios, oldIndex, newIndex);
      setPortafolios(newOrder);

      // Guardar orden en backend
      setSaving(true);
      try {
        await clienteAxios.post('/api/portafolios/reorder', {
          items: newOrder.map((p, idx) => ({ id: p.id, position: idx + 1 })),
        });
      } catch (error) {
        console.error('Error al guardar orden:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Funciones para categorías
  useEffect(() => {
    if (!editingId) return;
    const cat = flattenedCategories.find((c) => c.id === editingId);
    if (!cat) return;
    setNombre(cat.nombre || '');
    setDescripcion(cat.descripcion || '');
    setParentId(cat.parent_id || '');
    setImagen(null);
    setImagenPreview(cat.imagen || null);
  }, [editingId, flattenedCategories]);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setImagen(null);
    setImagenPreview(null);
    setParentId('');
    setEditingId(null);
  };

  const MAX_MB = 5;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const validarArchivo = (file) => {
    const okType = /image\/(jpeg|png|webp)/.test(file.type);
    if (!okType) return 'Formato invalido. Solo JPG, PNG o WEBP.';
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

  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!nombre.trim()) {
      setError('El nombre de la categoria es obligatorio.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre.trim());
    formData.append('descripcion', descripcion.trim());
    if (parentId) formData.append('parent_id', parentId);
    if (imagen) formData.append('imagen', imagen);

    try {
      setCargando(true);
      if (editingId) {
        await clienteAxios.post(
          `/api/portafolio-categorias/${editingId}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setMensaje('Categoria actualizada correctamente.');
      } else {
        await clienteAxios.post('/api/portafolio-categorias', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMensaje('Categoria creada correctamente.');
      }

      resetForm();
      mutate('/api/portafolio-categorias');
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar la categoria.');
    } finally {
      setCargando(false);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Seguro que queres eliminar esta categoria?')) return;

    try {
      await clienteAxios.delete(`/api/portafolio-categorias/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      mutate('/api/portafolio-categorias');
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la categoria.');
    }
  };

  const renderCategory = (cat, level = 0) => (
    <div key={cat.id} className={`${level > 0 ? 'ml-8 mt-3' : 'mb-4'}`}>
      <div className="border-2 border-gray-100 hover:border-[#fdce27] transition-colors rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 bg-white shadow-sm hover:shadow-lg">
        {cat.imagen ? (
          <img
            src={cat.imagen}
            alt={cat.nombre}
            className="w-24 h-24 object-cover rounded-xl border border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold">SIN IMAGEN</p>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-xl font-black text-[#1c1c1c]">{cat.nombre}</h4>
            {level > 0 && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#1c1c1c] text-[#fdce27] px-3 py-1 rounded-full">
                Subcategoría
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 max-w-2xl line-clamp-2 mt-2">
            {cat.descripcion || 'Sin descripción detallada.'}
          </p>
          {cat.children && cat.children.length > 0 && (
            <p className="text-xs font-bold text-[#fdce27] bg-[#1c1c1c] inline-block px-3 py-1 rounded-lg mt-3 uppercase tracking-wider">
              {cat.children.length} subcategoría{cat.children.length !== 1 ? 's' : ''}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEditingId(cat.id)}
              className="text-[11px] font-black tracking-wider uppercase bg-[#1c1c1c] text-white hover:bg-[#fdce27] hover:text-[#1c1c1c] px-5 py-2.5 rounded-xl transition-colors"
            >
              Editar Categoría
            </button>
            <button
              type="button"
              onClick={() => handleDeleteCategoria(cat.id)}
              className="text-[11px] font-black tracking-wider uppercase bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-500 px-5 py-2.5 rounded-xl transition-colors"
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
    <div className="max-w-[90rem] mx-auto p-4 lg:p-8">
      {/* Pestañas */}
      <div className="flex flex-wrap gap-4 mb-10 border-b-4 border-[#fdce27]/20 px-2 lg:px-6">
        <button
          onClick={() => {
            setActiveTab('proyectos');
            resetForm();
            setError(null);
            setMensaje(null);
          }}
          className={`px-8 py-4 font-black text-sm uppercase tracking-wide rounded-t-xl transition-all duration-300 transform translate-y-1 relative ${
            activeTab === 'proyectos'
              ? 'bg-[#1c1c1c] text-[#fdce27] shadow-lg z-10 scale-105 border-b-4 border-[#fdce27]'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-[#1c1c1c]'
          }`}
        >
          Maquinarias
        </button>
        <button
          onClick={() => {
            setActiveTab('categorias');
            resetForm();
            setError(null);
            setMensaje(null);
          }}
          className={`px-8 py-4 font-black text-sm uppercase tracking-wide rounded-t-xl transition-all duration-300 transform translate-y-1 relative ${
            activeTab === 'categorias'
              ? 'bg-[#1c1c1c] text-[#fdce27] shadow-lg z-10 scale-105 border-b-4 border-[#fdce27]'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-[#1c1c1c]'
          }`}
        >
          Categorías
        </button>
        <button
          onClick={() => setActiveTab('masiva')}
          className={`px-8 py-4 font-black text-sm uppercase tracking-wide rounded-t-xl transition-all duration-300 transform translate-y-1 relative ${
            activeTab === 'masiva'
              ? 'bg-[#1c1c1c] text-[#fdce27] shadow-lg z-10 scale-105 border-b-4 border-[#fdce27]'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-[#1c1c1c]'
          }`}
        >
          Carga Masiva
        </button>
      </div>

      {/* Contenido de Proyectos */}
      {activeTab === 'proyectos' && (
        <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-xl border border-gray-100 min-h-[500px]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <h1 className="text-3xl lg:text-4xl font-black text-[#1c1c1c] tracking-tighter uppercase">Listado de Maquinarias</h1>
            <Link
              to="/admin-dash/portafolio/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#fdce27] hover:bg-[#1c1c1c] text-[#1c1c1c] hover:text-[#fdce27] font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-colors border-2 border-transparent hover:border-[#1c1c1c]"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5}/>
              Agregar Nueva
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-12 h-12 text-[#fdce27] animate-spin" />
            </div>
          ) : portafolios.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-xl font-bold text-gray-400 mb-6">No hay maquinarias cargadas aún.</p>
              <Link
                to="/admin-dash/portafolio/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#fdce27] font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-colors shrink-0"
              >
                <Plus className="w-5 h-5" />
                Cargar Primera Maquinaria
              </Link>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={portafolios.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {portafolios.map((proyecto) => (
                    <SortablePortafolioItem
                      key={proyecto.id}
                      proyecto={proyecto}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {saving && (
            <div className="fixed bottom-6 right-6 bg-[#1c1c1c] text-[#fdce27] rounded-xl shadow-2xl p-4 px-6 flex items-center gap-3 animate-fadeInUp">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest">Guardando orden...</span>
            </div>
          )}
        </div>
      )}

      {/* Carga Masiva */}
      {activeTab === 'masiva' && (
        <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-xl border border-gray-100 min-h-[500px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#1c1c1c] tracking-tighter uppercase">Carga Masiva</h1>
              <p className="text-sm text-gray-500 mt-1">Cada imagen crea un nuevo item. El título se toma del nombre del archivo.</p>
            </div>
            {bulkImages.some((i) => i.status === 'pending') && (
              <button
                onClick={handleBulkUpload}
                disabled={bulkUploading}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#fdce27] hover:bg-[#1c1c1c] text-[#1c1c1c] hover:text-[#fdce27] font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-colors disabled:opacity-50"
              >
                {bulkUploading ? <Loader className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Subir {bulkImages.filter((i) => i.status === 'pending').length} imagen{bulkImages.filter((i) => i.status === 'pending').length !== 1 ? 'es' : ''}
              </button>
            )}
          </div>

          {/* Dropzone */}
          <div
            onDrop={handleBulkDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => bulkInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-[#fdce27] rounded-2xl p-10 text-center cursor-pointer transition-colors mb-8 group"
          >
            <UploadCloud className="w-10 h-10 text-gray-300 group-hover:text-[#fdce27] mx-auto mb-3 transition-colors" />
            <p className="font-black text-gray-400 group-hover:text-[#1c1c1c] transition-colors">Arrastrá imágenes acá o hacé click para seleccionar</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — múltiple selección</p>
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleBulkSelect(e.target.files)}
            />
          </div>

          {/* Grid de previews */}
          {bulkImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bulkImages.map((img) => (
                <div key={img.id} className="relative group border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                  <img src={img.preview} alt={img.title} className="w-full h-36 object-cover" />

                  {/* Overlay de estado */}
                  {img.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-[#fdce27] animate-spin" />
                    </div>
                  )}
                  {img.status === 'done' && (
                    <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-300" />
                    </div>
                  )}
                  {img.status === 'error' && (
                    <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-300" />
                    </div>
                  )}

                  {/* Botón eliminar */}
                  {img.status === 'pending' && (
                    <button
                      onClick={() => removeBulkImage(img.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {/* Input de título */}
                  <div className="p-2">
                    <input
                      type="text"
                      value={img.title}
                      onChange={(e) => updateBulkTitle(img.id, e.target.value)}
                      disabled={img.status !== 'pending'}
                      className="w-full text-xs font-bold text-[#1c1c1c] border border-gray-200 rounded-lg px-2 py-1 focus:border-[#fdce27] focus:ring-2 focus:ring-[#fdce27]/20 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {bulkImages.length === 0 && (
            <p className="text-center text-gray-400 font-bold py-8">No hay imágenes seleccionadas aún.</p>
          )}
        </div>
      )}

      {/* Contenido de Categorías */}
      {activeTab === 'categorias' && (
        <div className="space-y-8 bg-white p-6 lg:p-10 rounded-2xl shadow-xl border border-gray-100 min-h-[500px]">
          <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 lg:p-8">
            <h2 className="text-2xl font-black mb-6 text-[#1c1c1c] uppercase tracking-wide">
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            <form onSubmit={handleSubmitCategoria} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#fdce27] focus:ring-4 focus:ring-[#fdce27]/10 outline-none transition-all font-medium text-[#1c1c1c]"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Maquinaria Pesada, Equipos Menores"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Categoría Padre (opcional)
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#fdce27] focus:ring-4 focus:ring-[#fdce27]/10 outline-none transition-all font-medium text-[#1c1c1c] appearance-none"
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
                <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
                  Deja vacío para crear una categoría principal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Descripción
                </label>
                <textarea
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#fdce27] focus:ring-4 focus:ring-[#fdce27]/10 outline-none transition-all font-medium text-[#1c1c1c] resize-none"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Breve detalles de la categoría."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Imagen (opcional)
                </label>
                {imagenPreview && (
                  <img
                    src={imagenPreview}
                    alt="Vista previa"
                    className="w-48 h-48 object-cover rounded-xl border-2 border-dashed border-gray-300 mb-4"
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onImagenChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-[#1c1c1c] file:text-[#fdce27] hover:file:bg-[#333] transition-all cursor-pointer"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl font-bold text-sm">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-xl font-bold text-sm">
                  {mensaje}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-200 mt-6 md:mt-10">
                <button
                  type="submit"
                  disabled={cargando}
                  className="bg-[#1c1c1c] text-white hover:bg-[#fdce27] hover:text-[#1c1c1c] text-[11px] uppercase tracking-widest font-black px-8 py-3.5 rounded-xl shadow-lg transition-colors border-2 border-transparent hover:border-[#1c1c1c] disabled:opacity-50"
                >
                  {cargando
                    ? 'Guardando...'
                    : editingId
                    ? 'Guardar Cambios'
                    : 'Crear Nueva Categoría'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-white border-2 border-gray-200 text-gray-600 font-black tracking-widest uppercase text-[11px] px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="pt-6">
            <h3 className="text-2xl font-black text-[#1c1c1c] uppercase tracking-wide mb-6">Categorías Existentes</h3>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader className="w-12 h-12 text-[#0891b2] animate-spin" />
              </div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">No hay categorías aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categorias.map(cat => renderCategory(cat))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
