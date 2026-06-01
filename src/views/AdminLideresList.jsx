import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Plus, Trash2, Edit, GripVertical, Users } from 'lucide-react';
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
import { mostrarExito, mostrarError } from '../utils/Alertas';

function SortableLiderItem({ lider, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lider.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all group"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
        {lider.imagen ? (
          <img
            src={lider.imagen}
            alt={`${lider.nombre} ${lider.apellido}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <Users className="w-7 h-7 text-slate-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate">
          {lider.nombre} {lider.apellido}
        </h3>
        <p className="text-xs text-slate-500 uppercase tracking-wider truncate mt-0.5">
          {lider.posicion}
        </p>
      </div>

      {lider.linkedin && (
        <a
          href={lider.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
          title="LinkedIn"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/admin-dash/lideres/${lider.id}`}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit className="w-5 h-5" />
        </Link>
        <button
          onClick={() => onDelete(lider.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminLideresList() {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchLideres();
  }, []);

  const fetchLideres = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get('/api/lideres');
      setLideres(data.data || []);
    } catch {
      mostrarError('Error al cargar los líderes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este líder?')) return;
    try {
      await clienteAxios.delete(`/api/lideres/${id}`);
      setLideres(lideres.filter((l) => l.id !== id));
      mostrarExito('Líder eliminado correctamente');
    } catch {
      mostrarError('Error al eliminar el líder');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lideres.findIndex((l) => l.id === active.id);
    const newIndex = lideres.findIndex((l) => l.id === over.id);
    const newOrder = arrayMove(lideres, oldIndex, newIndex);
    setLideres(newOrder);

    setSaving(true);
    try {
      await clienteAxios.post('/api/lideres/reorder', {
        items: newOrder.map((l, idx) => ({ id: l.id, position: idx + 1 })),
      });
    } catch {
      mostrarError('Error al guardar el nuevo orden');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Líderes</h1>
          <p className="text-slate-500 mt-1">Gestiona el equipo directivo que se muestra en Quiénes Somos.</p>
        </div>
        <Link
          to="/admin-dash/lideres/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1c1c1c] hover:bg-[#fdce27] hover:text-[#1c1c1c] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Líder
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader className="w-12 h-12 text-[#fdce27] animate-spin" />
        </div>
      ) : lideres.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-400 mb-6">No hay líderes registrados</p>
          <Link
            to="/admin-dash/lideres/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#fdce27] text-[#1c1c1c] font-black text-xs uppercase tracking-widest hover:bg-[#1c1c1c] hover:text-white transition-all"
          >
            <Plus className="w-5 h-5" />
            Agregar Primer Líder
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lideres.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {lideres.map((lider) => (
                <SortableLiderItem
                  key={lider.id}
                  lider={lider}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {saving && (
        <div className="fixed bottom-6 right-6 bg-[#1c1c1c] text-white rounded-lg shadow-2xl p-4 border-l-4 border-l-[#fdce27] flex items-center gap-3">
          <Loader className="w-5 h-5 text-[#fdce27] animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">Guardando orden...</span>
        </div>
      )}
    </div>
  );
}
