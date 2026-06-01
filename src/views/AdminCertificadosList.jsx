import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Plus, Trash2, Edit, GripVertical, FileText, Award, Upload, X } from 'lucide-react';
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

function SortableCertificadoItem({ certificado, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certificado.id });

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

      {/* Imagen / Preview */}
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
        {certificado.imagen ? (
          <img
            src={certificado.imagen}
            alt={certificado.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <Award className="w-8 h-8 text-slate-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate uppercase tracking-tight">{certificado.titulo}</h3>
        <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500 line-clamp-1">{certificado.descripcion || 'Sin descripción'}</p>
            {certificado.documento && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    <FileText size={10} /> PDF/DOC
                </span>
            )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/admin-dash/certificados/${certificado.id}`}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit className="w-5 h-5" />
        </Link>
        <button
          onClick={() => onDelete(certificado.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function PoliticaGestionCard() {
  const [politica, setPolitica] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    clienteAxios.get('/api/politica-gestion')
      .then(({ data }) => setPolitica(data.data))
      .catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('documento', file);
    setUploading(true);
    try {
      const { data } = await clienteAxios.post('/api/politica-gestion', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPolitica(data.data);
      mostrarExito('Política de Gestión guardada correctamente');
    } catch {
      mostrarError('Error al guardar el archivo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar el PDF de Política de Gestión?')) return;
    setDeleting(true);
    try {
      await clienteAxios.delete('/api/politica-gestion');
      setPolitica(null);
      mostrarExito('Archivo eliminado correctamente');
    } catch {
      mostrarError('Error al eliminar el archivo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm mb-10">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-[#fdce27]" />
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Política de Gestión</h2>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        PDF descargable desde la página de Calidad Certificada. Solo se guarda un archivo a la vez.
      </p>

      {politica?.documento ? (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">Archivo actual</p>
            <a
              href={politica.documento}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate block"
            >
              {politica.documento}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-[#fdce27] hover:bg-[#1c1c1c] hover:text-white text-[#1c1c1c] transition-all flex items-center gap-2"
            >
              {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Reemplazar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c1c1c] hover:bg-[#fdce27] hover:text-[#1c1c1c] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg"
        >
          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Subir PDF
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

export default function AdminCertificadosList() {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchCertificados();
  }, []);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get('/api/certificados');
      setCertificados(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al cargar los certificados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmacion = await window.confirm('¿Está seguro de que desea eliminar este certificado?');
    if (!confirmacion) return;

    try {
      await clienteAxios.delete(`/api/certificados/${id}`);
      setCertificados(certificados.filter((c) => c.id !== id));
      mostrarExito('Certificado eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al eliminar el certificado');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = certificados.findIndex((c) => c.id === active.id);
      const newIndex = certificados.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(certificados, oldIndex, newIndex);
      setCertificados(newOrder);

      setSaving(true);
      try {
        await clienteAxios.post('/api/certificados/reorder', {
          items: newOrder.map((c, idx) => ({ id: c.id, position: idx + 1 })),
        });
      } catch (error) {
        console.error('Error al guardar orden:', error);
        mostrarError('Error al guardar el nuevo orden');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <PoliticaGestionCard />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Certificados</h1>
            <p className="text-slate-500 mt-1">Gestiona los certificados de calidad y documentos descargables.</p>
        </div>
        <Link
          to="/admin-dash/certificados/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1c1c1c] hover:bg-[#fdce27] hover:text-[#1c1c1c] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Certificado
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader className="w-12 h-12 text-[#fdce27] animate-spin" />
        </div>
      ) : certificados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-400 mb-6">No hay certificados registrados</p>
          <Link
            to="/admin-dash/certificados/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#fdce27] text-[#1c1c1c] font-black text-xs uppercase tracking-widest hover:bg-[#1c1c1c] hover:text-white transition-all"
          >
            <Plus className="w-5 h-5" />
            Crear Primer Certificado
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={certificados.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {certificados.map((certificado) => (
                <SortableCertificadoItem
                  key={certificado.id}
                  certificado={certificado}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {saving && (
        <div className="fixed bottom-6 right-6 bg-[#1c1c1c] text-white rounded-lg shadow-2xl p-4 border-l-4 border-l-[#fdce27] flex items-center gap-3 animate-slideInRight">
          <Loader className="w-5 h-5 text-[#fdce27] animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">Guardando orden...</span>
        </div>
      )}
    </div>
  );
}
