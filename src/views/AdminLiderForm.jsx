import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Loader, X, Save, ArrowLeft, Users } from 'lucide-react';
import clienteAxios from '../config/axios';
import { mostrarExito, mostrarError } from '../utils/Alertas';

export default function AdminLiderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [lider, setLider] = useState({
    nombre: '',
    apellido: '',
    posicion: '',
    linkedin: '',
    imagen: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (id) fetchLider();
  }, [id]);

  const fetchLider = async () => {
    try {
      setLoading(true);
      const { data } = await clienteAxios.get(`/api/lideres/${id}`);
      const d = data?.data || {};
      setLider({
        nombre: d.nombre || '',
        apellido: d.apellido || '',
        posicion: d.posicion || '',
        linkedin: d.linkedin || '',
        imagen: null,
      });
      setImagePreview(d.imagen || null);
    } catch {
      mostrarError('Error al cargar el líder');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLider({ ...lider, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLider({ ...lider, imagen: file });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('nombre', lider.nombre);
      formData.append('apellido', lider.apellido);
      formData.append('posicion', lider.posicion);
      formData.append('linkedin', lider.linkedin);
      if (lider.imagen instanceof File) {
        formData.append('imagen', lider.imagen);
      }

      if (id) {
        await clienteAxios.post(`/api/lideres/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await clienteAxios.post('/api/lideres', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      mostrarExito(id ? 'Líder actualizado' : 'Líder creado');
      navigate('/admin-dash/lideres');
    } catch {
      mostrarError('Error al guardar el líder');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader className="w-12 h-12 text-[#fdce27] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10">
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
          {id ? 'Editar Líder' : 'Nuevo Líder'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Imagen */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
            Foto
          </label>
          <div className="flex items-start gap-8">
            <div className="relative w-32 h-32 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group shrink-0">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setLider({ ...lider, imagen: null }); setImagePreview(null); }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Subir foto</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed italic mt-4">
              Imagen circular del líder. Se recomienda foto cuadrada de al menos 300×300px. Formatos: jpg, png, webp (máx 2MB).
            </p>
          </div>
        </div>

        {/* Datos personales */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={lider.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Walter"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={lider.apellido}
                onChange={handleChange}
                required
                placeholder="Ej: Fuks"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Posición / Cargo *
            </label>
            <input
              type="text"
              name="posicion"
              value={lider.posicion}
              onChange={handleChange}
              required
              placeholder="Ej: CEO"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              LinkedIn (URL)
            </label>
            <input
              type="url"
              name="linkedin"
              value={lider.linkedin}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#fdce27]/20 focus:border-[#fdce27] outline-none transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#1c1c1c] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fdce27] hover:text-[#1c1c1c] disabled:bg-slate-300 transition-all"
          >
            {saving ? (
              <><Loader className="w-5 h-5 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-5 h-5" /> {id ? 'Guardar Cambios' : 'Crear Líder'}</>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-5 bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
