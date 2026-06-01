import React, { useEffect, useState } from 'react';
import clienteAxios from '../../config/axios';
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
import { GripVertical, Trash2, Image as ImageIcon, Pencil, X } from 'lucide-react';

const SortableItem = ({ slide, onDelete, onEdit, isEditing }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl shadow-sm flex items-center gap-4 p-4 transition-all duration-300 ${
        isEditing ? 'border-[#fdce27] ring-2 ring-[#fdce27]/20 bg-[#fdce27]/5' : 'hover:border-gray-300'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        title="Arrastrar"
      >
        <GripVertical />
      </div>

      {slide.background_type === 'youtube' ? (
        <div className="w-24 h-24 rounded-lg border bg-black text-white text-[11px] flex items-center justify-center text-center px-2">
          VIDEO YOUTUBE
        </div>
      ) : (
        <img
          src={slide.image}
          alt={slide.title}
          className="w-24 h-24 object-cover rounded-lg border"
        />
      )}

      <div className="flex-1">
        <h4 className="font-semibold text-sm">{slide.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{slide.description}</p>
        <p className="text-[11px] text-gray-500 mt-1">
          Fondo: {slide.background_type === 'youtube' ? 'YouTube' : 'Imagen'}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(slide);
        }}
        className="text-gray-400 hover:text-[#1c1c1c] transition-colors p-2"
        title="Editar"
      >
        <Pencil size={18} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(slide.id);
        }}
        className="text-red-500 hover:text-red-700 p-2"
        title="Eliminar"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

const SlidersAdmin = () => {
  const token = localStorage.getItem('AUTH_TOKEN');

  const [slides, setSlides] = useState([]);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [backgroundType, setBackgroundType] = useState('image');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data } = await clienteAxios.get('/api/sliders');
      setSlides(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setBackgroundType('image');
    setYoutubeUrl('');
    setImagen(null);
    setPreview(null);
    setError(null);
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!title.trim() || !description.trim()) {
      setError('Titulo y descripcion son obligatorios');
      return;
    }

    if (backgroundType === 'image') {
      const currentSlide = slides.find((s) => s.id === editingId);
      if (!imagen && !currentSlide?.image) {
        setError('La imagen es obligatoria');
        return;
      }
    }

    if (backgroundType === 'youtube' && !youtubeUrl.trim()) {
      setError('La URL de YouTube es obligatoria');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('background_type', backgroundType);

    if (backgroundType === 'image' && imagen) {
      formData.append('imagen', imagen);
    }

    if (backgroundType === 'youtube') {
      formData.append('youtube_url', youtubeUrl.trim());
    }

    try {
      setCargando(true);
      if (editingId) {
        await clienteAxios.post(`/api/sliders/${editingId}?_method=PUT`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMensaje('Slide actualizado correctamente');
      } else {
        await clienteAxios.post('/api/sliders', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMensaje('Slide creado correctamente');
      }

      resetForm();
      fetchSlides();
    } catch {
      setError(editingId ? 'Error al actualizar el slide' : 'Error al crear el slide');
    } finally {
      setCargando(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setTitle(slide.title || '');
    setDescription(slide.description || '');
    setBackgroundType(slide.background_type || 'image');
    setYoutubeUrl(slide.youtube_url || '');
    setPreview(slide.image || null);
    setImagen(null);
    setError(null);
    setMensaje(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este slide?')) return;

    try {
      await clienteAxios.delete(`/api/sliders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSlides();
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(slides, oldIndex, newIndex);
    setSlides(newOrder);

    try {
      await clienteAxios.post(
        '/api/sliders/reorder',
        {
          order: newOrder.map((s, index) => ({
            id: s.id,
            position: index + 1,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch {
      console.error('Error guardando orden');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-black mb-8 text-[#1c1c1c] border-b border-gray-100 pb-4">Administrar Slider Principal</h2>

      <form onSubmit={handleSubmit} className="space-y-5 mb-10 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de fondo</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setBackgroundType('image');
                setYoutubeUrl('');
              }}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                backgroundType === 'image'
                  ? 'bg-[#1c1c1c] text-[#fdce27] border-2 border-[#1c1c1c]'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              Fondo de Imagen
            </button>
            <button
              type="button"
              onClick={() => {
                setBackgroundType('youtube');
                setImagen(null);
                setPreview(null);
              }}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                backgroundType === 'youtube'
                  ? 'bg-[#1c1c1c] text-[#fdce27] border-2 border-[#1c1c1c]'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              YouTube
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Título Principal (Opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#fdce27] focus:ring-4 focus:ring-[#fdce27]/10 outline-none transition-all font-medium text-gray-700"
        />

        <textarea
          placeholder="Descripción Corta (Opcional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#fdce27] focus:ring-4 focus:ring-[#fdce27]/10 outline-none transition-all font-medium text-gray-700 resize-none"
        />

        {backgroundType === 'image' ? (
          <>
            <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#fdce27] hover:bg-[#fdce27]/5 transition-all">
              <ImageIcon className="text-gray-400 w-10 h-10" />
              <span className="text-sm text-gray-600">
                {editingId ? 'Cambiar imagen (opcional)' : 'Arrastra o haz click para subir una imagen'}
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImagen(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
            </label>

            {preview && (
              <img
                src={preview}
                className="w-full h-48 object-cover rounded-xl border"
              />
            )}
          </>
        ) : (
          <input
            type="url"
            placeholder="Enlace de YouTube (Ej: https://www.youtube.com/watch?v=...)"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#fdce27] focus:ring-4 focus:ring-[#fdce27]/10 outline-none transition-all font-medium text-gray-700"
          />
        )}

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            disabled={cargando}
            className="bg-[#1c1c1c] text-white font-black tracking-wide px-8 py-3 rounded-xl hover:bg-[#fdce27] hover:text-[#1c1c1c] transition-colors disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : editingId ? 'Actualizar Slide' : 'Publicar Slide'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="border-2 border-gray-200 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-white flex items-center gap-2 transition-colors"
            >
              <X size={16} />
              Cancelar
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}
      </form>

      <h3 className="text-lg font-black text-[#1c1c1c] mb-6 pt-6 border-t border-gray-100">Orden y Gestión de Sliders</h3>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={slides.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {slides.map((slide) => (
              <SortableItem
                key={slide.id}
                slide={slide}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isEditing={editingId === slide.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SlidersAdmin;
